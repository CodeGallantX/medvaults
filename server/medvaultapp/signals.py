from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import EmergencyProfile, QRCode

@receiver(post_save, sender=EmergencyProfile)
def create_or_update_qrcode(sender, instance, **kwargs):
    qrcode_obj, created = QRCode.objects.get_or_create(profile=instance)
    qrcode_obj.save()
