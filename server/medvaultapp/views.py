from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import generics, status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import *
from django.contrib.auth import get_user_model
from django.shortcuts import render, get_object_or_404
from .models import *


User = get_user_model()


def index(request):
    return render(request, 'medvaultapp/index.html')




class Home(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        content = {'message': 'Hello, World!'}
        return Response(content)
    



class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)
    


from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer



def emergency_profile_view(request, token):
    qrcode = get_object_or_404(QRCode, qr_token=token)
    profile = qrcode.profile
    return render(request, 'medvaultapp/emergency_profile.html', {'profile': profile, 'qrcode': qrcode})



# views.py
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import EmergencyProfile
from .serializers import EmergencyProfileSerializer

class EmergencyProfileView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    serializer_class = EmergencyProfileSerializer


    def get(self, request):
        try:
            profile = request.user.emergencyprofile
            serializer = self.serializer_class(profile)
            return Response(serializer.data)
        except EmergencyProfile.DoesNotExist:
            return Response({"detail": "No profile found."}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request):
        try:
            profile = request.user.emergencyprofile
            serializer = self.serializer_class(profile, data=request.data, partial=True)
        except EmergencyProfile.DoesNotExist:
            serializer = self.serializer_class(data=request.data)

        if serializer.is_valid():
            profile = serializer.save(user=request.user)
            return Response(self.serializer_class(profile).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class QRCodeView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            profile = request.user.emergencyprofile
            qrcode = profile.qrcode
            if not qrcode.qr_image:
                qrcode.save()  # triggers `generate_qr()` in model

            return Response({
                "qr_token": str(qrcode.qr_token),
                "qr_image_url": request.build_absolute_uri(qrcode.qr_image.url)
            }, status=status.HTTP_200_OK)

        except EmergencyProfile.DoesNotExist:
            return Response({"detail": "No emergency profile found."}, status=status.HTTP_404_NOT_FOUND)
        except QRCode.DoesNotExist:
            return Response({"detail": "QR code not found."}, status=status.HTTP_404_NOT_FOUND)
