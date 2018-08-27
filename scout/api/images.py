import requests

from rest_framework import serializers, views
from rest_framework.response import Response

from django.conf import settings

from scout.api.serializers import SearchSerializer


class ImageSerializer(serializers.Serializer):
    class Meta:
        fields = ('link',)

    link = serializers.URLField()


class ImagesAPIView(views.APIView):
    def get(self, request):
        serializer = SearchSerializer(data=request.GET)
        serializer.is_valid(raise_exception=True)

        images_response = requests.get(settings.GOOGLE_SEARCH_URL, params={
            'key': settings.CREDETIALS.GOOGLE_API_KEY,
            'cx': settings.CREDETIALS.GOOGLE_CX,
            'searchType': 'image',
            'q': serializer.validated_data['q']
        })

        images_response.raise_for_status()
        images_json = images_response.json()

        return Response({
            'images': ImageSerializer(images_json['items'], many=True).data,
            'query_correction': images_json.get('spelling', {}).get('correctedQuery')
        })
