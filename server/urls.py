from django.urls import path, include

urlpatterns = [
    path('', include('memword.urls')),
    path('', include('scout.urls'))
]


