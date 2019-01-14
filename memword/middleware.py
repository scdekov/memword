from django.utils.deprecation import MiddlewareMixin
from django.contrib.auth import get_user_model
from django.conf import settings


User = get_user_model()


class OneUserAuthentication(MiddlewareMixin):
    def process_request(self, request):
        if settings.ENVIRONMENT == 'production':
            request.user = User.objects.get(username='svetlio')
