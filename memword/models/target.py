from django.db import models
from django.conf import settings


class Target(models.Model):
    identifier = models.CharField(max_length=1024, blank=True)
    description = models.CharField(max_length=1024, blank=True)
    img_link = models.URLField(max_length=512, blank=True)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='targets')
    date_created = models.DateTimeField(auto_now_add=True)
    last_update = models.DateTimeField(auto_now=True)

    def need_notification(self):
        return self.repetitions.order_by('-id').first().date_seen

    def difficulty(self, user=None):
        return TargetDifficulty.objects.get_or_create(target=self, user=user)


class TargetDifficulty(models.Model):
    BASE_DIFFICULTY = 1
    DIFFICULTY_STEP = 0.1

    target = models.ForeignKey('memword.Target', on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True)
    difficulty = models.FloatField(default=1)

    @classmethod
    def adjust_default_difficulties(cls):
        for default_difficulty in cls.objects.filter(user=None):
            avg_target_difficulty = list(cls.objects.filter(target=default_difficulty.target)\
                                                    .aggregate(models.Avg('difficulty'))\
                                                    .values())[0]
            default_difficulty.difficulty = avg_target_difficulty
            default_difficulty.save()
