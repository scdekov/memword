from memword.models.lesson import Question
from memword.models.user_learning_interval import UserLearningIntervals


class LearningIntervalsManager:
    CONFIDENCE_LEVEL_TARGET = 3

    @classmethod
    def handle_submitted_question(cls, question):
        same_target_questions_count = Question.objects.filter(target=question.target,
                                                              passed=True,
                                                              lesson__student=question.lesson.student)\
                                                      .count()

        interval_change = cls._get_interval_change(question.correct, question.confidence_level)

        user_intervals = UserLearningIntervals.objects.get(user=question.target.author)
        user_intervals.increase_nth_interval(same_target_questions_count, interval_change)
        user_intervals.increase_nth_interval(same_target_questions_count + 1, interval_change)
        # may be we should increase all intervals > n ?

    @classmethod
    def _get_interval_change(cls, correct_answer, confidence_level):
        base_change_percent = abs(cls.CONFIDENCE_LEVEL_TARGET - confidence_level)
        if confidence_level > cls.CONFIDENCE_LEVEL_TARGET and correct_answer:
            return base_change_percent
        else:
            return -base_change_percent
