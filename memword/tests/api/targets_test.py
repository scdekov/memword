import pytest

from rest_framework import status

from memword.models.target import Target

from django.shortcuts import reverse


@pytest.mark.django_db
class TestTargetsViewSet:
    TARGETS_LIST_URL = reverse('target-list')

    def test_get__unauthenticated(self, client):
        resp = client.get(self.TARGETS_LIST_URL)
        assert resp.status_code == status.HTTP_401_UNAUTHORIZED

    def test_get(self, client, user, target):
        client.force_authenticate(user)
        resp = client.get(self.TARGETS_LIST_URL)

        assert resp.status_code == status.HTTP_200_OK
        assert len(resp.data) == 1
        assert resp.data[0]['identifier'] == target.identifier

    @pytest.mark.usefixtures('target')
    def test_get__other_user(self, client, user2):
        client.force_authenticate(user2)
        resp = client.get(self.TARGETS_LIST_URL)

        assert resp.status_code == status.HTTP_200_OK
        assert not len(resp.data)

    def test_get_detail(self, client, user, target):
        client.force_authenticate(user)
        resp = client.get(reverse('target-detail', kwargs={'pk': target.id}))

        assert resp.status_code == status.HTTP_200_OK
        assert resp.data['identifier'] == target.identifier

    def test_get_detail__unathorzied(self, client, user2, target):
        client.force_authenticate(user2)
        resp = client.get(reverse('target-detail', kwargs={'pk': target.id}))

        assert resp.status_code == status.HTTP_404_NOT_FOUND

    def test_post(self, client, user):
        client.force_authenticate(user)
        resp = client.post(self.TARGETS_LIST_URL, data={'identifier': 'test',
                                                        'description': 'tst',
                                                        'img_link': 'http://wwww.svd.com'})

        assert resp.status_code == status.HTTP_201_CREATED
        assert Target.objects.count() == 1

    def test_delete__foreign(self, client, user2, target):
        client.force_authenticate(user2)
        resp = client.delete(reverse('target-detail', kwargs={'pk': target.id}))
        assert resp.status_code == status.HTTP_404_NOT_FOUND
