from datetime import timedelta

from django.db import models
from django.db.models import Q
from django.conf import settings
from django.utils import timezone

from memword.models.lesson import Lesson, Question
from memword.logic.target_picker import TargetPicker


class LessonSchedule(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    week_day = models.IntegerField()
    preferred_time = models.TimeField(null=True, blank=True)
    last_generation_time = models.DateTimeField(null=True, blank=True)
    enabled = models.BooleanField(default=True)
    questions_count = models.IntegerField(default=10)
    lesson_type = models.CharField(max_length=32, choices=Lesson.TYPES)

    @classmethod
    def generate_lessons(cls):
        today_week_day = timezone.datetime.weekday(timezone.datetime.today())

        schedules_to_process = cls.objects.filter((Q(last_generation_time__lt=(timezone.now() - timedelta(hours=24))) |
                                                   Q(last_generation_time__isnull=True)),
                                                  week_day=today_week_day,
                                                  enabled=True)\
                                          .select_related('user')

        for schedule in schedules_to_process:
            targets = TargetPicker.pick_top(schedule.user, schedule.questions_count)
            lesson = Lesson.objects.create(title='Auto generated lesson',
                                           student=schedule.user,
                                           lesson_type=schedule.lesson_type,
                                           planned_start_time=cls._get_lesson_planned_start_time(schedule))

            Question.objects.bulk_create([Question(target=target, lesson=lesson) for target in targets])

            schedule.last_generation_time = timezone.now()
            schedule.save()

    @staticmethod
    def _get_lesson_planned_start_time(schedule):
        now = timezone.now()
        preferred_time = schedule.preferred_time or now
        return timezone.datetime(year=now.year, month=now.month, day=now.day,
                                 hour=preferred_time.hour,
                                 minute=preferred_time.minute).isoformat()
