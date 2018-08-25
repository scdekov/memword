from django.urls import path

from scout.api.images import ImagesAPIView


urlpatterns = [
    path('images', ImagesAPIView.as_view())
]
