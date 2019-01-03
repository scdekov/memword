from datetime import datetime

from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404

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
    lesson_type = serializers.CharField(allow_blank=True, default=Lesson.TYPE_LECTURE)
    target_ids = serializers.ListField(child=serializers.IntegerField(), write_only=True)
    planned_start_time = serializers.DateTimeField(default=datetime.now)
    expected_duration = serializers.DurationField(default='60')

    def save(self):
        target_ids = self.validated_data.pop('target_ids', [])

        student_id = self.context['request'].user.id
        lesson = super().save(student_id=student_id)

        for target_id in target_ids:
            Question.objects.create(lesson=lesson, target_id=target_id)

        return lesson


class TopTargetsQuerySerializer(serializers.Serializer):
    targets_count = serializers.IntegerField(required=False, default=10)


class LessonsViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.all().order_by('-id')
    serializer_class = LessonSerializer

    @decorators.detail_route(methods=['POST'], url_path='@submit-answer')
    def submit_answer(self, request, pk):
        serializer = SubmitQuestionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        question = get_object_or_404(Question, lesson_id=pk, id=serializer.validated_data['question_id'])
        question.confidence_level = serializer.validated_data['confidence_level']
        question.passed = True
        question.pass_time = datetime.now()
        question.save()

        if question.lesson.should_finish():
            question.lesson.finalize()

        LearningIntervalsManager.handle_submitted_question(question)

        return Response({'question': QuestionSerializer(question).data})

    @decorators.detail_route(methods=['POST'], url_path='@start')
    def start(self, request, **kwargs):
        lesson = self.get_object()
        lesson.start_time = datetime.now()
        lesson.save()

        return Response({'lesson': LessonSerializer(lesson).data})

    @decorators.detail_route(methods=['POST'], url_path='@duplicate')
    def duplicate(self, request, **kwargs):
        original_lesson = self.get_object()

        # this is suposed to be in atomic transactions
        new_lesson = Lesson.objects.create(student_id=request.user.id,
                                           lesson_type=original_lesson.lesson_type,
                                           expected_duration=original_lesson.expected_duration,
                                           planned_start_time=datetime.now())
        # start time should be calculated somehow

        for question in original_lesson.questions.all():
            Question.objects.create(target_id=question.target_id, lesson_id=new_lesson.id)

        return Response({'lesson': LessonSerializer(new_lesson).data}, status=status.HTTP_201_CREATED)

    @decorators.list_route(url_path='@get-top-targets')
    def get_top_targets(self, request):
        serializer = TopTargetsQuerySerializer(data=request.GET)
        serializer.is_valid(raise_exception=True)

        top_targets = TargetPicker.pick_top(request.user, serializer.validated_data['targets_count'])

        return Response({'targets': TargetSerializer(top_targets, many=True).data})
