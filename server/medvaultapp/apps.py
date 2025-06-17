from django.apps import AppConfig


class MedvaultappConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'medvaultapp'

    def ready(self):
        import medvaultapp.signals
