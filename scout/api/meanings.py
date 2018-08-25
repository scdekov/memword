import requests

from rest_framework import serializers, views
from rest_framework.response import Response

from django.conf import settings

from scout.api.serializers import SearchSerializer


class MeaningSerializer(serializers.Serializer):
    class Meta:
        fields = ('description',)

    description = serializers.CharField(max_length=1024)


class MeaningsAPIView(views.APIView):
    def get(self, request):
        serializer = SearchSerializer(data=request.GET)
        serializer.is_valid(raise_exception=True)

        meanings_response = requests.get(settings.OXFORD_DICT_SEARCH_URL.format(word=serializer.validated_data['q']),
                                         headers={
                                            'Accept': 'application/json',
                                            'app_id': settings.CREDETIALS.OXFORD_DICT_APP_ID,
                                            'app_key': settings.CREDETIALS.OXFORD_DICT_APP_KEY
                                        })

        meanings_response.raise_for_status()

        return Response({'meanings': self._prepare_meanings_repsonse(meanings_response.json())})

    def _prepare_meanings_repsonse(self, data):
        # for now the first definition is enough
        meaning = data['results'][0]['lexicalEntries'][0]['entries'][0]['senses'][0]['definitions'][0]
        return MeaningSerializer([
            {'description': meaning}
        ], many=True).data

