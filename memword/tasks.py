from memword.celery import app
from memword.models.target import TargetDifficulty
from memword.models.user_learning_interval import UserLearningIntervals


@app.task()
def adjust_default_learning_intervals():
    UserLearningIntervals.adjust_default_row()


@app.task()
def adjust_default_target_difficulties():
    TargetDifficulty.adjust_default_difficulties()
