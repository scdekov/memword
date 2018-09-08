from rest_framework import serializers, viewsets

from memword.api.serializers import TargetSerializer
from memword.models.lesson import Lesson, Question


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ('id', 'target', 'passed', 'correct', 'confidence_level')

    target = TargetSerializer()


class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ('id', 'student_id', 'questions', 'lesson_type', 'start_time', 'end_time', 'expected_duration')

    questions = QuestionSerializer(many=True)


class LessonsViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
