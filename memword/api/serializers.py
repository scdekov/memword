from rest_framework import serializers

from memword.models.target import Target


class TargetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Target
        fields = ('id', 'identifier', 'description', 'img_link', 'author_id')
