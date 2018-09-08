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

    target = models.ForeignKey('memword.Target', on_delete=models.CASCADE, related_name='repetitions')
    source_type = models.CharField(choices=SOURCE_TYPES, max_length=max(map(lambda st: len(st[0]), SOURCE_TYPES)))
    confidence_level = models.IntegerField(help_text='This should be between 1 and 10', null=True)
    date_created = models.DateTimeField(auto_now_add=True)
    scheduled_for = models.DateTimeField()
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
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='targets')
    date_created = models.DateTimeField(auto_now_add=True)
    last_update = models.DateTimeField(auto_now=True)

    def need_notification(self):
        return self.repetitions.order_by('-id').first().date_seen


class UserLearningMeta(models.base.ModelBase):
    def __new__(cls, clsname, bases, dct):
        newclass = super(UserLearningMeta, cls).__new__(cls, clsname, bases, dct)
        for interval_number in range(newclass.LAST_PERIOD_NUMBER):
            field = models.IntegerField(help_text='in seconds', null=True)
            newclass.add_to_class('%s_%s' % (interval_number, interval_number + 1), field)

        return newclass


class UserLearningIntervals(models.Model, metaclass=UserLearningMeta):
    LAST_PERIOD_NUMBER = 20
    DEFAULT_ROW_ID = 1

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)

    def get_nth_interval(self, n):
        assert n > 0

        if n < self.LAST_PERIOD_NUMBER:
            interval = getattr(self, '%s_%s' % (n - 1, n), None)
        else:
            interval = getattr(self, '%s_%s' % (self.LAST_PERIOD_NUMBER - 1, self.LAST_PERIOD_NUMBER), None)

        if interval is None:
            self._populate_with_defaults()

        return self.get_nth_interval(n)

    def _populate_with_defaults(self):
        default_row = self.get_default_intervals()
        for i in range(self.LAST_PERIOD_NUMBER):
            interval_field_name = '%s_%s' % (i, i + 1)
            setattr(self, interval_field_name, getattr(default_row, interval_field_name))

        self.save()

    @classmethod
    def get_default_intervals(cls):
        return cls.objects.get(id=cls.DEFAULT_ROW_ID)
