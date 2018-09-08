from rest_framework import routers

from memword.api.targets import TargetsViewSet
from memword.api.lessons import LessonsViewSet


router = routers.SimpleRouter()
router.register(r'targets', TargetsViewSet)
router.register(r'lessons', LessonsViewSet)
urlpatterns = router.urls
