from rest_framework import serializers

from memword.models.target import Target


class TargetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Target
        fields = ('id', 'identifier', 'description', 'img_link', 'author_id', 'is_verified')

    def create(self, validated_data):
        if validated_data.get('is_verified') is None:
            validated_data['is_verified'] = bool(validated_data.get('description') or\
                                                 validated_data.get('img_link'))
        return super().create(validated_data)


class CreateTargetsFromListSerializer(serializers.Serializer):
    identifiers = serializers.ListField(child=serializers.CharField())
