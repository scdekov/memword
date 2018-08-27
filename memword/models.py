from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models


class Repetition(models.Model):
    SOURCE_TYPE_EXAM = 'exam'
    SOURCE_TYPE_NOTIFICATION = 'notification'
    SOURCE_TYPES = (
        (SOURCE_TYPE_EXAM, 'Exam'),
        (SOURCE_TYPE_NOTIFICATION, 'Notification')
    )

    target = models.ForeignKey('memword.Target', on_delete=models.CASCADE)
    source_type = models.CharField(choices=SOURCE_TYPES, max_length=max(map(lambda st: len(st[0]), SOURCE_TYPES)))
    confidence_level = models.IntegerField(help_text='This should be between 1 and 10')
    date_created = models.DateTimeField(auto_now_add=True)
    # these two may not make sense for all source types?
    date_seen = models.DateTimeField(null=True)
    date_sent = models.DateTimeField(null=True)

    def clean_confidence_level(self, data):
        if data not in range(1, 11):
            raise ValidationError('confidence_level should be between 1 and 10')
        return data


class Target(models.Model):
    identifier = models.CharField(max_length=1024, blank=True)
    description = models.CharField(max_length=1024, blank=True)
    img_link = models.URLField(max_length=512, blank=True)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    date_created = models.DateTimeField(auto_now_add=True)
    last_update = models.DateTimeField(auto_now=True)
