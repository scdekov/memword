from memword.models.lesson import Question
from memword.models.user_learning_interval import UserLearningIntervals


class LearningIntervalsManager:
    @classmethod
    def handle_submitted_question(cls, question):
        same_target_questions_count = Question.objects.filter(target=question.target,
                                                              passed=True,
                                                              lesson__student=question.lesson.student)\
                                                      .count()

        change_percent = question.confidence_level
        if question.correct is False:
            change_percent = -change_percent

        user_intervals = UserLearningIntervals.objects.get(user=question.target.author)
        user_intervals.increase_nth_interval(same_target_questions_count, change_percent)
        user_intervals.increase_nth_interval(same_target_questions_count + 1, change_percent)
        # may be we should increase all intervals > n ?
