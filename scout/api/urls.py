from django.urls import path

from scout.api.images import ImagesAPIView
from scout.api.meanings import MeaningsAPIView


urlpatterns = [
    path('images', ImagesAPIView.as_view()),
    path('meanings', MeaningsAPIView.as_view())
]
