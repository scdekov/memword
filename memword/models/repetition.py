from django.db import models

from memword.models.fields import ConfidenceLevelField

 
class Repetition(models.Model):
    SOURCE_TYPE_EXAM = 'exam'
    SOURCE_TYPE_NOTIFICATION = 'notification'
    SOURCE_TYPE_LESSON = 'lesson'
    SOURCE_TYPES = (
        (SOURCE_TYPE_EXAM, 'Exam'),
        (SOURCE_TYPE_NOTIFICATION, 'Notification'),
        (SOURCE_TYPE_LESSON, 'Lesson')
    )

    target = models.ForeignKey('memword.Target', on_delete=models.CASCADE, related_name='repetitions')
    source_type = models.CharField(choices=SOURCE_TYPES, max_length=max(map(lambda st: len(st[0]), SOURCE_TYPES)))
    confidence_level = ConfidenceLevelField()
    date_created = models.DateTimeField(auto_now_add=True)
    scheduled_for = models.DateTimeField()
    # these two may not make sense for all source types?
    date_seen = models.DateTimeField(null=True)
    date_sent = models.DateTimeField(null=True)
