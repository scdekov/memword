from datetime import datetime

from django.db import models
from django.conf import settings

from memword.models.fields import ConfidenceLevelField


class Question(models.Model):
    class Meta:
        unique_together = ('lesson', 'target')

    lesson = models.ForeignKey('memword.Lesson', on_delete=models.CASCADE)
    target = models.ForeignKey('memword.Target', on_delete=models.CASCADE)
    passed = models.BooleanField(default=False)
    correct = models.NullBooleanField()
    confidence_level = ConfidenceLevelField()


class Lesson(models.Model):
    TYPE_LECTURE = 'lecture'
    TYPE_EXAM = 'exam'
    TYPES = (
        (TYPE_LECTURE, 'Lecture'),
        (TYPE_EXAM, 'Exam')
    )

    title = models.CharField(max_length=128, blank=True)
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='lessons')
    questions = models.ManyToManyField('memword.Target', related_name='lesson_questions', through=Question)
    lesson_type = models.CharField(max_length=32, choices=TYPES)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    expected_duration = models.DurationField()

    def clean(self):
        super().clean()
        if not self.title:
            self.title = self._build_default_title()

    def _build_default_title(self):
        return 'Lesson %s' % datetime.now()
