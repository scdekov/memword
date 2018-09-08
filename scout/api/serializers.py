from rest_framework import serializers


class SearchSerializer(serializers.Serializer):
    q = serializers.CharField(max_length=128)
