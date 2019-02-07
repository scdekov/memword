from django.contrib.admin import ModelAdmin
from django.contrib.admin.decorators import register

from memword.models.target import Target, TargetDifficulty
from memword.models.lesson import Lesson, Question
from memword.models.user_learning_interval import UserLearningIntervals


@register(Target)
class TargetAdmin(ModelAdmin):
    list_display = ('identifier', 'author_id', 'description', 'img_link')
    actions = ['copy_to_my_user']

    def copy_to_my_user(self, request, queryset):
        for target in queryset:
            Target.objects.create(
                identifier=target.identifier,
                description=target.description,
                img_link=target.img_link,
                author=request.user,
                is_verified=True
            )
    copy_to_my_user.short_description = 'Copy selected targets to the current logged user'


@register(Lesson)
class LessonAdmin(ModelAdmin):
    list_display = ('title', 'student_id', 'start_time')


@register(Question)
class QuestionAdmin(ModelAdmin):
    list_display = ('passed', 'confidence_level')


@register(UserLearningIntervals)
class UserLearningIntervalsAdmin(ModelAdmin):
    list_display = [field.name for field in UserLearningIntervals._meta.get_fields()]


@register(TargetDifficulty)
class TargetDifficultyAdmin(ModelAdmin):
    list_display = ('target_identifier', 'user_id', 'difficulty')

    def target_identifier(self, difficulty):
        return difficulty.target.identifier
