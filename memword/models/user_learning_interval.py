from django.db import models
from django.db.models.signals import post_save
from django.conf import settings
from django.contrib.auth import get_user_model
from django.dispatch import receiver


User = get_user_model()


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


@receiver(post_save, sender=User)
def create_user_interval(sender, user, **kwargs):
    if not user.id:
        UserLearningIntervals.objects.create(user=user)
