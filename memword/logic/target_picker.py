from collections import namedtuple

from memword.models.lesson import Question
from memword.models.target import TargetDifficulty
from memword.models.user_learning_interval import UserLearningIntervals


TargetEntry = namedtuple('TargetEntry', ['target', 'time_to_next_lesson'])


class TargetPicker:
    @classmethod
    def pick_top(cls, user, count=10):
        targets = user.targets.all()
        questions = Question.objects.filter(lesson__student=user)
        intervals = UserLearningIntervals.objects.get(user=user)

        targets_details = []
        for target in targets:
            # the next line are probably doing more queries than what we want
            # in memory filtering here will probably be better
            questions_for_target = questions.filter(target=target)

            # if this became a problem, creating a default on target and user creations may be an option
            difficulty, _ = TargetDifficulty.objects.get_or_create(target=target, user=user)
            time_to_next_lesson = intervals.get_nth_interval(questions_for_target.count() + 1) * difficulty.difficulty
            targets_details.append(TargetEntry(target, time_to_next_lesson))

        return [target_entry.target for target_entry in
                sorted(targets_details, key=lambda target_entry: target_entry.time_to_next_lesson)[:count]]
