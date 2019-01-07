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
