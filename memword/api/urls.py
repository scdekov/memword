from rest_framework import routers

from memword.api.targets import TargetsViewSet


router = routers.SimpleRouter()
router.register(r'targets', TargetsViewSet)
urlpatterns = router.urls
