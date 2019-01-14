import pytest

from rest_framework import status

from memword.models.lesson import Lesson

from django.shortcuts import reverse


@pytest.mark.django_db
class TestLessonsViewSet:
    LESSONS_LIST_URL = reverse('lesson-list')

    def test_get__unauthenticated(self, client):
        resp = client.get(self.LESSONS_LIST_URL)
        assert resp.status_code == status.HTTP_401_UNAUTHORIZED

    def test_get(self, client, user, lesson):
        client.force_authenticate(user)
        resp = client.get(self.LESSONS_LIST_URL)

        assert resp.status_code == status.HTTP_200_OK
        assert len(resp.data) == 1

    @pytest.mark.usefixtures('lesson')
    def test_get__other_user(self, client, user2):
        client.force_authenticate(user2)
        resp = client.get(self.LESSONS_LIST_URL)

        assert resp.status_code == status.HTTP_200_OK
        assert not len(resp.data)

    def test_get_detail(self, client, user, lesson):
        client.force_authenticate(user)
        resp = client.get(reverse('lesson-detail', kwargs={'pk': lesson.id}))

        assert resp.status_code == status.HTTP_200_OK
        assert resp.data['title'] == lesson.title

    def test_get_detail__unauthorized(self, client, user2, lesson):
        client.force_authenticate(user2)
        resp = client.get(reverse('lesson-detail', kwargs={'pk': lesson.id}))

        assert resp.status_code == status.HTTP_404_NOT_FOUND

    def test_post__invalid_type(self, client, user, target):
        client.force_authenticate(user)
        resp = client.post(self.LESSONS_LIST_URL, data={'target_ids': [target.id], 'lesson_type': 'invalid'})

        assert resp.status_code == status.HTTP_400_BAD_REQUEST

    def test_post(self, client, user, target):
        client.force_authenticate(user)
        resp = client.post(self.LESSONS_LIST_URL, data={'target_ids': [target.id]})

        assert resp.status_code == status.HTTP_201_CREATED
        assert resp.data['questions'][0]['target']['identifier'] == target.identifier
        assert Lesson.objects.get(id=resp.data['id']).student == user

    def test_post__type_exam(self, client, user, target):
        client.force_authenticate(user)
        resp = client.post(self.LESSONS_LIST_URL, data={'target_ids': [target.id], 'lesson_type': 'exam'})

        assert resp.status_code == status.HTTP_201_CREATED
        assert resp.data['questions'][0]['target']['identifier'] == target.identifier
        assert Lesson.objects.get(id=resp.data['id']).student == user

    def test_delete__foreign(self, client, user2, lesson):
        client.force_authenticate(user2)
        resp = client.delete(reverse('lesson-detail', kwargs={'pk': lesson.id}))
        assert resp.status_code == status.HTTP_404_NOT_FOUND

    def test_submit_answer__lecture(self, client, user, lesson_lecture, mocker):
        client.force_authenticate(user)

        handle_question = mocker.patch('memword.api.lessons.LearningIntervalsManager.handle_submitted_question')
        resp = client.post(reverse('lesson-detail', kwargs={'pk': lesson_lecture.id}) + '@submit-answer/',
                           data={'question_id': lesson_lecture.questions.first().id, 'confidence_level': 3})

        assert resp.status_code == status.HTTP_200_OK
        lesson_lecture.refresh_from_db()
        assert lesson_lecture.end_time
        handle_question.assert_called_once()

    def test_submit_answer__exam_no_answer(self, client, user, lesson_exam, mocker):
        client.force_authenticate(user)

        resp = client.post(reverse('lesson-detail', kwargs={'pk': lesson_exam.id}) + '@submit-answer/',
                           data={'question_id': lesson_exam.questions.first().id, 'confidence_level': 3})

        assert resp.status_code == status.HTTP_400_BAD_REQUEST

    def test_submit_answer__exam_correct(self, client, user, lesson_exam, mocker):
        client.force_authenticate(user)

        handle_question = mocker.patch('memword.api.lessons.LearningIntervalsManager.handle_submitted_question')
        resp = client.post(reverse('lesson-detail', kwargs={'pk': lesson_exam.id}) + '@submit-answer/',
                           data={'question_id': lesson_exam.questions.first().id, 'confidence_level': 3,
                                 'answer': lesson_exam.questions.first().target.description})

        assert resp.status_code == status.HTTP_200_OK
        lesson_exam.refresh_from_db()
        assert lesson_exam.end_time
        assert lesson_exam.questions.first().correct
        handle_question.assert_called_once()

    def test_submit_answer__exam_wrong(self, client, user, lesson_exam, mocker):
        client.force_authenticate(user)

        handle_question = mocker.patch('memword.api.lessons.LearningIntervalsManager.handle_submitted_question')
        resp = client.post(reverse('lesson-detail', kwargs={'pk': lesson_exam.id}) + '@submit-answer/',
                           data={'question_id': lesson_exam.questions.first().id, 'confidence_level': 3,
                                 'answer': 'idk'})

        assert resp.status_code == status.HTTP_200_OK
        lesson_exam.refresh_from_db()
        assert lesson_exam.end_time
        assert not lesson_exam.questions.first().correct
        handle_question.assert_called_once()

    def test_start(self, client, user, lesson):
        client.force_authenticate(user)
        resp = client.post(reverse('lesson-detail', kwargs={'pk': lesson.id}) + '@start/')

        assert resp.status_code == status.HTTP_200_OK
        lesson.refresh_from_db()
        assert lesson.start_time

    def test_duplicate(self, client, user, lesson):
        client.force_authenticate(user)
        resp = client.post(reverse('lesson-detail', kwargs={'pk': lesson.id}) + '@duplicate/')

        assert resp.status_code == status.HTTP_201_CREATED
        assert Lesson.objects.count() == 2
        duplicate = Lesson.objects.last()
        assert duplicate.questions.first().target.id == lesson.questions.first().target.id

    def test_get_top_targets(self, client, user, mocker, target):
        client.force_authenticate(user)

        mocker.patch('memword.api.lessons.TargetPicker.pick_top', return_value=[target])
        resp = client.get(self.LESSONS_LIST_URL + '@get-top-targets/')

        assert resp.status_code == status.HTTP_200_OK
        assert resp.data['targets'][0]['identifier'] == target.identifier
