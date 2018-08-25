from rest_framework import serializers, viewsets, decorators, status
from rest_framework.response import Response

from memword.models import Target


class TargetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Target
        fields = ('id', 'identifier', 'description', 'img_link', 'author_id')


class TargetsViewSet(viewsets.ModelViewSet):
    queryset = Target.objects.all()
    serializer_class = TargetSerializer
