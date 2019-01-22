from django.contrib.admin import ModelAdmin
from django.contrib.admin.decorators import register

from memword.models.target import Target, TargetDifficulty
from memword.models.lesson import Lesson, Question
from memword.models.user_learning_interval import UserLearningIntervals
from memword.models.lesson_schedule import LessonSchedule


@register(Target)
class TargetAdmin(ModelAdmin):
    list_display = ('identifier', 'author_id', 'description', 'img_link')


@register(Lesson)
class LessonAdmin(ModelAdmin):
    list_display = ('id', 'title', 'student_id', 'start_time')


@register(Question)
class QuestionAdmin(ModelAdmin):
    list_display = ('id', 'lesson_id', 'passed', 'confidence_level')


@register(UserLearningIntervals)
class UserLearningIntervalsAdmin(ModelAdmin):
    list_display = [field.name for field in UserLearningIntervals._meta.get_fields()]


@register(TargetDifficulty)
class TargetDifficultyAdmin(ModelAdmin):
    list_display = ('target_identifier', 'user_id', 'difficulty')

    def target_identifier(self, difficulty):
        return difficulty.target.identifier


@register(LessonSchedule)
class LessonScheduleAdmin(ModelAdmin):
    list_display = ('user', 'week_day', 'preferred_time', 'last_generation_time',
                    'enabled', 'questions_count', 'lesson_type')
