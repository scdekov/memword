from django.urls import path, include

urlpatterns = [
    path('api/', include('scout.api.urls'))
]

