from django.contrib.admin import ModelAdmin
from django.contrib.admin.decorators import register

from memword.models.target import Target
from memword.models.lesson import Lesson, Question
from memword.models.user_learning_interval import UserLearningIntervals


@register(Target)
class TargetAdmin(ModelAdmin):
    list_display = ('identifier', 'author_id', 'description', 'img_link')


@register(Lesson)
class LessonAdmin(ModelAdmin):
    list_display = ('title', 'student_id', 'start_time')


@register(Question)
class QuestionAdmin(ModelAdmin):
    list_display = ('passed', 'confidence_level')


@register(UserLearningIntervals)
class UserLearningIntervalsAdmin(ModelAdmin):
    list_display = [field.name for field in UserLearningIntervals._meta.get_fields()]
