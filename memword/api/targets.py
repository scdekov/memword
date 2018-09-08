from rest_framework import viewsets

from memword.api.serializers import TargetSerializer
from memword.models.target import Target


class TargetsViewSet(viewsets.ModelViewSet):
    queryset = Target.objects.all()
    serializer_class = TargetSerializer
