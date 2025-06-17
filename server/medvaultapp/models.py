from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)



from django.db import models
from django.contrib.auth.models import User
import uuid
import qrcode
from io import BytesIO
from django.core.files import File
from django.conf import settings

class EmergencyProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)  # ADD THIS

    blood_type = models.CharField(max_length=5)
    genotype = models.CharField(max_length=5)
    weight = models.FloatField()
    allergies = models.TextField()
    conditions = models.TextField()
    medications = models.TextField()
    emergency_contact_name = models.CharField(max_length=100)
    emergency_contact_phone = models.CharField(max_length=20)
    vaccination_history = models.JSONField(default=dict)
    dietary_restrictions = models.CharField(max_length=100)
    smoking_status = models.CharField(max_length=50)
    alcohol_consumption = models.CharField(max_length=50)
    physical_activity_level = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.user.username}'s Emergency Profile"

class QRCode(models.Model):
    profile = models.OneToOneField(EmergencyProfile, on_delete=models.CASCADE, related_name='qrcode')
    qr_token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    qr_image = models.ImageField(upload_to='qr_codes/', blank=True)

    def generate_qr(self):
        url = f"{settings.BASE_FRONTEND_URL}/emergency/{self.qr_token}/"
        qr = qrcode.make(url)
        buffer = BytesIO()
        qr.save(buffer)
        filename = f'{self.profile.user.username}_qr.png'
        self.qr_image.save(filename, File(buffer), save=False)

    def save(self, *args, **kwargs):
        self.generate_qr()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"QR for {self.profile.user.username}"
    



