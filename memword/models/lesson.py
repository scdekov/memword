from django.db import models
from django.core import exceptions


class Question(models.Model):
    class Meta:
        unique_together = ('lesson', 'target')

    lesson = models.ForeignKey('memword.Lesson', on_delete=models.CASCADE)
    target = models.ForeignKey('memword.Target', on_delete=models.CASCADE)
    passed = models.BooleanField(default=False)
    confidence_level = models.IntegerField(help_text='This should be between 1 and 10', null=True)

    def clean_confidence_level(self, data):
        if data not in range(1, 11):
            raise exceptions.ValidationError('confidence_level should be between 1 and 10')
        return data


class Lesson(models.Model):
    tagets = models.ManyToManyField('memword.Target', related_name='lessons', through=Question)
