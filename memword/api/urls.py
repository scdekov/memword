from rest_framework import routers

from memword.api.targets import TargetsViewSet, AssociationsViewSet


router = routers.SimpleRouter()
router.register(r'targets', TargetsViewSet)
router.register(r'associations', AssociationsViewSet)
urlpatterns = router.urls
