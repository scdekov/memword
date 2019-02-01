import requests

from rest_framework import serializers, views
from rest_framework.response import Response

from django.conf import settings

from scout.api.serializers import SearchSerializer


class ImagesAPIView(views.APIView):
    def get(self, request):
        serializer = SearchSerializer(data=request.GET)
        serializer.is_valid(raise_exception=True)

        images_response = requests.post(settings.IMAGE_DEPOT_URL,
                                        json={'term': serializer.validated_data['q']},
                                        headers=self._get_links_request_headers())

        images_response.raise_for_status()
        images_json = images_response.json()

        return Response({
            'images': images_json.get('links', []),
            'query_correction': images_json.get('spelling_correction', {})
        })

    def _get_links_request_headers(self):
        return {
            'Content-type': 'application/json',
            'Authorization': 'Token {}'.format(settings.CREDENTIALS.IMAGE_DEPOT_API_TOKEN)
        }
