import pytest
from datetime import timedelta, time

from django.utils import timezone

from memword.models.lesson import Lesson, Question
from memword.models.lesson_schedule import LessonSchedule


@pytest.mark.django_db
class TestLessonScheduleModel:
    def test_generate_lessons__no_schdules(self):
        LessonSchedule.generate_lessons()
        assert not Lesson.objects.count()
        assert not Question.objects.count()

    def test_generate_lessons__no_schdules_for_today(self, lesson_schedule_friday, mocker):
        mocker.patch('memword.models.lesson_schedule.LessonSchedule._get_weekday', return_value=0)
        LessonSchedule.generate_lessons()
        assert not Lesson.objects.count()
        assert not Question.objects.count()

    def test_generate_lessons__no_targets(self, lesson_schedule_friday, mocker):
        mocker.patch('memword.models.lesson_schedule.LessonSchedule._get_weekday', return_value=4)
        LessonSchedule.generate_lessons()

        assert Lesson.objects.count() == 1
        lesson = Lesson.objects.first()
        assert lesson.lesson_type == lesson_schedule_friday.lesson_type
        assert not Question.objects.count()

    @pytest.mark.usefixtures('many_targets')
    def test_generate_lessons(self, lesson_schedule_friday, mocker):
        mocker.patch('memword.models.lesson_schedule.LessonSchedule._get_weekday', return_value=4)

        LessonSchedule.generate_lessons()

        assert Lesson.objects.count() == 1
        lesson = Lesson.objects.first()
        assert lesson.lesson_type == lesson_schedule_friday.lesson_type
        assert lesson.planned_start_time > timezone.now() - timedelta(minutes=1)
        assert Question.objects.count() == lesson_schedule_friday.questions_count

        lesson_schedule_friday.refresh_from_db()
        assert lesson_schedule_friday.last_generation_time > timezone.now() - timedelta(seconds=2)

    def test_generate_lessons__with_preferred_time(self, lesson_schedule_friday, mocker):
        lesson_schedule_friday.preferred_time = time(hour=2, minute=2, second=2)
        lesson_schedule_friday.save()

        mocker.patch('memword.models.lesson_schedule.LessonSchedule._get_weekday', return_value=4)

        LessonSchedule.generate_lessons()

        assert Lesson.objects.count() == 1
        lesson = Lesson.objects.first()
        now = timezone.now()
        assert lesson.planned_start_time.year == now.year
        assert lesson.planned_start_time.month == now.month
        assert lesson.planned_start_time.day == now.day
        assert lesson.planned_start_time.hour == lesson_schedule_friday.preferred_time.hour
        assert lesson.planned_start_time.minute == lesson_schedule_friday.preferred_time.minute
