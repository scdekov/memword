from django.utils.deprecation import MiddlewareMixin
from django.contrib.auth import get_user_model


User = get_user_model()


class OneUserAuthentication(MiddlewareMixin):
    def process_request(self, request):
        request.user = User.objects.get(username='svetlio')
