from rest_framework import viewsets, decorators, status
from rest_framework.response import Response

from memword.api.serializers import TargetSerializer, CreateTargetsFromListSerializer
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

    def filter_queryset(self, queryset):
        queryset = super().filter_queryset(queryset)
        return queryset.filter(author=self.request.user)

    @decorators.action(detail=False, methods=['POST'], url_path='@from-list')
    def from_list(self, request):
        serializer = CreateTargetsFromListSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        Target.objects.bulk_create([
            Target(identifier=identifier, author_id=request.user.id)
            for identifier in serializer.validated_data['identifiers']
        ])

        # maybe returning the new created targets here?
        return Response({}, status=status.HTTP_201_CREATED)
