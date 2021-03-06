from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework import serializers, viewsets, decorators, status
from rest_framework.response import Response

from memword.api.serializers import TargetSerializer
from memword.models.lesson import Lesson, Question
from memword.logic.target_picker import TargetPicker
from memword.logic.learning_intervals_manager import LearningIntervalsManager


User = get_user_model()


class SubmitQuestionSerializer(serializers.Serializer):
    confidence_level = serializers.IntegerField()
    question_id = serializers.IntegerField()
    answer = serializers.CharField(allow_blank=True, required=False)

    def validate(self, data):
        if self.context['lesson'].lesson_type == 'exam' and not data.get('answer'):
            raise serializers.ValidationError('answer is required when submitting exam question')

        return data

    def validate_confidence_level(self, confidence_level):
        if confidence_level not in range(1, 11):
            raise serializers.ValidationError('confidence_level should be between 1 and 10')

        return confidence_level


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ('id', 'target', 'passed', 'correct', 'confidence_level')

    target = TargetSerializer()


class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ('id', 'student_id', 'questions', 'lesson_type', 'start_time',
                  'end_time', 'expected_duration', 'title', 'target_ids', 'planned_start_time')

    questions = QuestionSerializer(many=True, read_only=True)
    lesson_type = serializers.ChoiceField(allow_blank=True, default=Lesson.TYPE_LECTURE, choices=Lesson.TYPES)
    target_ids = serializers.ListField(child=serializers.IntegerField(), write_only=True)
    planned_start_time = serializers.DateTimeField(default=timezone.now)
    expected_duration = serializers.DurationField(default='60')

    def save(self):
        # target_ids may need to be validated if they belongs to the current user
        target_ids = self.validated_data.pop('target_ids', [])

        student_id = self.context['request'].user.id
        lesson = super().save(student_id=student_id)

        Question.objects.bulk_create([Question(lesson=lesson, target_id=target_id) for target_id in target_ids])

        return lesson


class TopTargetsQuerySerializer(serializers.Serializer):
    targets_count = serializers.IntegerField(required=False, default=10)


class LessonsViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.all().order_by('-id')
    serializer_class = LessonSerializer

    def filter_queryset(self, queryset):
        queryset = super().filter_queryset(queryset)
        return queryset.filter(student=self.request.user)

    @decorators.action(detail=True, methods=['POST'], url_path='@submit-answer')
    def submit_answer(self, request, pk):
        lesson = self.get_object()
        serializer = SubmitQuestionSerializer(data=request.data,
                                              context={'request': request, 'lesson': lesson})
        serializer.is_valid(raise_exception=True)

        question = get_object_or_404(Question, lesson_id=pk, id=serializer.validated_data['question_id'])
        question.confidence_level = serializer.validated_data['confidence_level']
        question.passed = True
        question.pass_time = timezone.now()
        if lesson.lesson_type == 'exam':
            question.correct = serializer.validated_data['answer'] == question.target.description
        question.save()

        if question.lesson.should_finish():
            question.lesson.finalize()

        LearningIntervalsManager.handle_submitted_question(question)

        return Response({'question': QuestionSerializer(question).data})

    @decorators.action(detail=True, methods=['POST'], url_path='@start')
    def start(self, request, **kwargs):
        lesson = self.get_object()
        lesson.start_time = timezone.now()
        lesson.save()

        return Response({'lesson': LessonSerializer(lesson).data})

    @decorators.action(detail=True, methods=['POST'], url_path='@duplicate')
    def duplicate(self, request, **kwargs):
        original_lesson = self.get_object()

        # this is suposed to be in atomic transactions
        new_lesson = Lesson.objects.create(student_id=request.user.id,
                                           lesson_type=original_lesson.lesson_type,
                                           expected_duration=original_lesson.expected_duration,
                                           planned_start_time=timezone.now())
        # start time should be calculated somehow

        Question.objects.bulk_create([Question(target_id=question.target_id, lesson_id=new_lesson.id)\
                                      for question in original_lesson.questions.all()])

        return Response({'lesson': LessonSerializer(new_lesson).data}, status=status.HTTP_201_CREATED)

    @decorators.action(detail=False, url_path='@get-top-targets')
    def get_top_targets(self, request):
        serializer = TopTargetsQuerySerializer(data=request.GET)
        serializer.is_valid(raise_exception=True)

        top_targets = TargetPicker.pick_top(request.user, serializer.validated_data['targets_count'])

        return Response({'targets': TargetSerializer(top_targets, many=True).data})
