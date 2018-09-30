from django.urls import path, include

urlpatterns = [
    path('accounts/', include('django.contrib.auth.urls')),
    path('', include('memword.urls')),
    path('', include('scout.urls')),
]


