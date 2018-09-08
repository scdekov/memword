from django.db import models
from django.core import exceptions


class ConfidenceLevelField(models.IntegerField):
    def __init__(self, *args, **kwargs):
        kwargs.setdefault('null', True)
        kwargs.setdefault('helptext', 'This should be between 1 and 10')

    def to_python(self, value):
        result = super().to_python(value)
        if result not in range(1, 11):
            raise exceptions.ValidationError('Confidence Level should be from 1 to 10')

        return result
