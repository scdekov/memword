from rest_framework import viewsets

from memword.api.serializers import TargetSerializer
from memword.models.target import Target


class TargetsViewSet(viewsets.ModelViewSet):
    queryset = Target.objects.all().order_by('-id')
    serializer_class = TargetSerializer
