import pytest

from model_mommy import mommy

from rest_framework.test import APIClient

from django.conf import settings


@pytest.fixture()
def client():
    return APIClient()


@pytest.fixture()
def user():
    return mommy.make(settings.AUTH_USER_MODEL)


@pytest.fixture()
def user2():
    return mommy.make(settings.AUTH_USER_MODEL)


@pytest.fixture()
def target(user):
    return mommy.make('memword.Target',
                      identifier='scroll',
                      description='a piece of paper',
                      author=user)


@pytest.fixture()
def many_targets(user):
    return mommy.make('memword.Target',
                      author=user,
                      _quantity=50)


@pytest.fixture()
def lesson(target):
    lesson = mommy.make('memword.Lesson', student=target.author)
    mommy.make('memword.Question', target=target, lesson=lesson)
    return lesson


@pytest.fixture()
def lesson_lecture(target):
    lesson = mommy.make('memword.Lesson', student=target.author, lesson_type='lecture')
    mommy.make('memword.Question', target=target, lesson=lesson)
    return lesson


@pytest.fixture()
def lesson_exam(target):
    lesson = mommy.make('memword.Lesson', student=target.author, lesson_type='exam')
    mommy.make('memword.Question', target=target, lesson=lesson)
    return lesson


@pytest.fixture()
def lesson_schedule_friday(user):
    return mommy.make('memword.LessonSchedule', user=user, week_day=4, lesson_type='lecture')
