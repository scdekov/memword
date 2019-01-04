from __future__ import absolute_import, unicode_literals
import os
from celery import Celery

redis = 'redis://localhost:6379/'

# set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')

app = Celery('memword', broker=redis, backend=redis)

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
# - namespace='CELERY' means all celery-related configuration keys
#   should have a `CELERY_` prefix.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django app configs.
app.autodiscover_tasks()

app.conf.beat_schedule = {
    'adjust learning intervals': {
        'task': 'memword.tasks.adjust_default_learning_intervals',
        'schedule': 60 * 60 * 24,  # once a day
    },
    'adjust target difficulties': {
        'task': 'memword.tasks.adjust_default_target_difficulties',
        'schedule': 60 * 60 * 24,  # once a day
    }
}
app.conf.timezone = 'UTC'