from rest_framework import serializers, viewsets, decorators, status
from rest_framework.response import Response

from memword.models import Target, Association


class AssociationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Association
        fields = ('id', 'description', 'img_link', 'author_id')


class TargetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Target
        fields = ('id', 'identifier', 'associations')

    associations = AssociationSerializer(many=True, read_only=True)


class AssociationsViewSet(viewsets.ModelViewSet):
    queryset = Association.objects.all()
    serializer_class = AssociationSerializer


class TargetsViewSet(viewsets.ModelViewSet):
    queryset = Target.objects.all()
    serializer_class = TargetSerializer

    def create(self, request, *args, **kwargs):
        data = request.data
        img_link = data.pop('img_link', None)
        description = data.pop('description', '') or ''

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)

        if img_link or description:
            Association.objects.create(target=serializer.instance, img_link=img_link, description=description)
            serializer = self.get_serializer(instance=serializer.instance)

        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @decorators.detail_route(methods=['POST'], url_path='@associate')
    def associate(self, request, *args, **kwargs):
        target = self.get_object()
        association_data = request.data
        association_data['target'] = target

        serializer = AssociationSerializer(data=association_data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response('', status=status.HTTP_201_CREATED)
