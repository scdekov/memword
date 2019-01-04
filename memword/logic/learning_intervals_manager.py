from memword.models.lesson import Question
from memword.models.user_learning_interval import UserLearningIntervals
from memword.models.target import TargetDifficulty


class LearningIntervalsManager:
    CONFIDENCE_LEVEL_TARGET = 3

    @classmethod
    def handle_submitted_question(cls, question):
        difficulty = cls._adjust_question_difficulty(question)
        interval_change = cls._get_interval_change(question, difficulty)

        user_intervals = UserLearningIntervals.objects.get(user=question.target.author)
        same_target_questions_count = Question.objects.filter(target=question.target,
                                                              passed=True,
                                                              lesson__student=question.lesson.student)\
                                                      .count()

        user_intervals.increase_nth_interval(same_target_questions_count, interval_change)
        user_intervals.increase_nth_interval(same_target_questions_count + 1, interval_change)
        # may be we should increase all intervals > n ?

    @classmethod
    def _get_interval_change(cls, question, difficulty):
        base_change_percent = abs(cls.CONFIDENCE_LEVEL_TARGET - question.confidence_level) * difficulty.difficulty
        if question.confidence_level > cls.CONFIDENCE_LEVEL_TARGET:
            return base_change_percent
        else:
            return -base_change_percent

    @classmethod
    def _adjust_question_difficulty(cls, question):
        difficulty, _ = TargetDifficulty.objects.get_or_create(target=question.target, user=question.lesson.student)
        if question.correct is None:
            return difficulty

        change_amount = difficulty.difficulty * difficulty.DIFFICULTY_STEP
        if question.correct:
            change_amount = -change_amount

        difficulty.difficulty = max(difficulty.difficulty + change_amount, difficulty.BASE_DIFFICULTY)
        difficulty.save()
        return difficulty
