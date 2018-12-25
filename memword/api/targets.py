from rest_framework import viewsets

from memword.api.serializers import TargetSerializer
from memword.models.target import Target


class TargetsViewSet(viewsets.ModelViewSet):
    queryset = Target.objects.all().order_by('-id')
    serializer_class = TargetSerializer

    def perform_create(self, serializer):
        # maybe not the best way, but it's good enough for now
        serializer.save()
        if serializer.instance.author_id is None:
            serializer.instance.author_id = self.request.user.id
            serializer.instance.save()
