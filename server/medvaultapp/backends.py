from django.contrib.auth.backends import ModelBackend
from .models import Hospital

class HospitalBackend(ModelBackend):
    def authenticate(self, request, license_number=None, password=None, **kwargs):
        try:
            hospital = Hospital.objects.get(license_number=license_number)
            if hospital.check_password(password):
                return hospital
        except Hospital.DoesNotExist:
            return None

    def get_user(self, user_id):
        try:
            return Hospital.objects.get(pk=user_id)
        except Hospital.DoesNotExist:
            return None