import pytest


class TestLessonsViewSet:
    @pytest.mark.django_db
    def test_get(self, target):
        assert target.id
