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
