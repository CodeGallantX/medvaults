from django.urls import path
from .views  import *
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


urlpatterns = [
    path('', index, name='index'),
        path('home/', Home.as_view()),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('emergency/<uuid:token>/', emergency_profile_view, name='emergency-profile'),
        path('api/emergency-profile/', EmergencyProfileView.as_view(), name='emergency-profile-api'),
            path('api/get-qrcode/', QRCodeView.as_view(), name='get-qrcode'),



    

]
