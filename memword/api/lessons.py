from datetime import datetime

from django.shortcuts import get_object_or_404

from rest_framework import serializers, viewsets, decorators
from rest_framework.response import Response

from memword.api.serializers import TargetSerializer
from memword.models.lesson import Lesson, Question


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
    lesson_type = serializers.CharField(allow_blank=True, default=Lesson.TYPES[0][0])
    target_ids = serializers.ListField(child=serializers.IntegerField(), write_only=True)

    def save(self):
        target_ids = self.validated_data.pop('target_ids', [])

        student_id = self.context['request'].user.id or 1
        lesson = super().save(student_id=student_id)

        for target_id in target_ids:
            Question.objects.create(lesson=lesson, target_id=target_id)

        return lesson


class LessonsViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer

    @decorators.detail_route(methods=['POST'], url_path='@submit-answer')
    def submit_answer(self, request, pk):
        serializer = SubmitQuestionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        question = get_object_or_404(Question, lesson_id=pk, id=serializer.validated_data['question_id'])
        question.confidence_level = serializer.validated_data['confidence_level']
        question.passed = True
        question.save()

        # TODO: check if this is the last question and finzlie lesson if so

        return Response({'question': QuestionSerializer(question).data})

    @decorators.detail_route(methods=['POST'], url_path='@start')
    def start(self, request, **kwargs):
        lesson = self.get_object()
        lesson.start_time = datetime.now()
        lesson.save()

        return Response({'lesson': LessonSerializer(lesson).data})
