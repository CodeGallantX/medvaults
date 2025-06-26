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
from drf_spectacular.utils import extend_schema
from django.views.decorators.csrf import csrf_exempt
import requests
import nyckel
import inflect
import nyckel
from django.utils import timezone
from datetime import timedelta
from django.http import JsonResponse


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




class EmergencyProfileView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    serializer_class = EmergencyProfileSerializer


    def get(self, request):
        try:
            profile = request.user.emergencyprofile
            # userprofile = EmergencyProfile.objects.get(user = request.user)
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





p = inflect.engine()  # For plural/singular conversion

class FoodAllergyScanView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    serializer_class = FoodAllergyScanSerializer

    def post(self, request):
        serializer = FoodAllergyScanSerializer(data=request.data)
        if serializer.is_valid():
            scan = serializer.save(user=request.user)

            credentials = nyckel.Credentials(
                "83qxpxmije8qtyh44rdjz7u7wxutzau3",
                "9c7kedxfim5s366l87wpqb219j1s2ti9k4hhrxpquy0d214pq9krd4dx95avb4cp"
            )

            try:
                # Determine food name
                if scan.food_image:
                    image_url = scan.food_image.url
                    image_result = nyckel.invoke("meals-identifier", image_url, credentials)
                    food_name = image_result["labelName"]
                elif scan.food_name:
                    food_name = scan.food_name
                else:
                    return Response({"error": "Provide either food_name or food_image."}, status=400)

                # Get allergen from Nyckel
                result = nyckel.invoke("food-allergens", food_name, credentials)
                detected_allergen = result["labelName"].strip().lower()
                confidence = result["confidence"]

                # Normalize allergen to singular
                singular_allergen = p.singular_noun(detected_allergen) or detected_allergen

                # Get user's known allergies
                try:
                    profile = EmergencyProfile.objects.get(user=request.user)
                    user_allergies = [a.strip().lower() for a in profile.allergies.split(",") if a.strip()]
                    normalized_allergies = [p.singular_noun(a) or a for a in user_allergies]
                except EmergencyProfile.DoesNotExist:
                    return Response({"error": "Emergency profile not found."}, status=404)

                # Match allergens
                if singular_allergen in normalized_allergies:
                    if confidence < 0.45:
                        risk = "low"
                    elif confidence > 0.45 and confidence < 0.7:
                        risk = "medium"
                    else:
                        risk = "high"
                else:
                    risk = f"there are no allergy in {food_name}" 

                # Save info
                scan.food_name = food_name
                scan.detected_allergen = detected_allergen
                scan.confidence = confidence
                scan.risk_level = risk
                scan.save()

                return Response(FoodAllergyScanSerializer(scan).data, status=status.HTTP_201_CREATED)

            except Exception as e:
                scan.delete()
                return Response({"error": str(e)}, status=500)

        return Response(serializer.errors, status=400)



class FoodAllergyScanListView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        scans = FoodAllergyScan.objects.filter(user=request.user)
        serializer = FoodAllergyScanSerializer(scans, many=True)
        return Response(serializer.data)
    


class CreateWalletView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    serializer_class = WalletSerializer

    def post(self, request):
        user = request.user
        if hasattr(user, 'wallet'):
            return Response({"detail": "Wallet already exists."}, status=status.HTTP_400_BAD_REQUEST)
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            wallet = serializer.save(user=user)
            return Response(self.serializer_class(wallet).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# class CreateTransactionView(APIView):
#     permission_classes = [IsAuthenticated]
#     authentication_classes = [JWTAuthentication]
#     serializer_class = TransactionSerializer

#     def post(self, request):
#         user = request.user
#         wallet = Wallet.objects.filter(user=user).first()
#         if not wallet:
#             return Response({"detail": "Wallet does not exist."}, status=status.HTTP_404_NOT_FOUND)

#         # Check last deposit (credit) transaction
#         last_deposit = Transaction.objects.filter(wallet=wallet, transaction_type='credit').order_by('-created_at').first()
#         if last_deposit and last_deposit.created_at > timezone.now() - timedelta(weeks=1):
#             return Response(
#                 {"detail": "You can only deposit once a week. Please try again later."},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#         serializer = self.serializer_class(data=request.data)
#         if serializer.is_valid():
#             amount = serializer.validated_data.get('amount', 0)
#             pin = request.data.get('pin', None)
#             if  pin is None:
#                 return Response({"detail": "pin not provided."}, status=status.HTTP_400_BAD_REQUEST)
#             else:
#                 if pin != wallet.pin:
#                     return Response({"detail": "Invalid PIN."}, status=status.HTTP_400_BAD_REQUEST)
#             wallet.user_balance += amount
#             wallet.save()
#             serializer.save(wallet=wallet, transaction_type='credit')
#             return Response(
#                 {"details": f"You have successfully deposited {amount}. Your balance is {wallet.user_balance}", "transaction": serializer.data},
#                 status=status.HTTP_201_CREATED
#             )
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TransactionListView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    serializer_classes = TransactionSerializer

    def get(self, request):
        user = request.user
        wallet = Wallet.objects.filter(user=user).first()
        if not wallet:
            return Response({"detail": "Wallet does not exist."}, status=status.HTTP_404_NOT_FOUND)

        transactions = Transaction.objects.filter(wallet=wallet)
        serializer = TransactionSerializer(transactions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    


class WithdrawMoneyView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    serializer_class = TransactionSerializer

    @extend_schema(
        request={
            "application/json": {
                "type": "object",
                "properties": {
                    "pin": {"type": "integer", "example":  1234},
                    "amount": {"type": "integer", "example": 500},
                    "bank_name": {"type": "string", "example": "First Bank"},
                    "account_number": {"type": "string", "example": "0123456789"},
                    "account_name": {"type": "string", "example": "John Doe"},
                    "description": {"type": "string", "example": "to pay for medical fee"},

                },
                "required": ["pin", "amount", "bank_name", "account_number", "account_name", "description"]
            },

        }
    )

    def post(self, request):
        user = request.user
        wallet = Wallet.objects.filter(user=user).first()
        if not wallet:
            return Response({"detail": "Wallet does not exist."}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            amount = serializer.validated_data.get('amount', 0)
            description = serializer.validated_data.get('description', 0)

            pin = request.data.get('pin', None)
            bank_name = request.data.get('bank_name')
            account_number = request.data.get('account_number')
            account_name = request.data.get('account_name')

            # Validate required bank/account fields
            if not all([bank_name, account_number, account_name]):
                return Response(
                    {"detail": "bank_name, account_number, and account_name are required."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if pin is None or pin != wallet.pin:
                return Response({"detail": "Invalid PIN."}, status=status.HTTP_400_BAD_REQUEST)
            if amount > wallet.user_balance:
                return Response({"detail": "Insufficient balance."}, status=status.HTTP_400_BAD_REQUEST)

            wallet.user_balance -= amount
            wallet.save()
            serializer.save(
                wallet=wallet,
                transaction_type='debit',
                description = description
        
            )
            return Response({
                "detail": f"You have successfully withdrawn {amount}. Your balance is {wallet.user_balance}. Your transfer is being processed.",
                "transaction": serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class GetUserBalance(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    serializer_class = WalletSerializer

    def get(self, request):
        wallet = Wallet.objects.filter(user=request.user).first()
        if not wallet:
            return Response({"detail": "Wallet does not exist."}, status=status.HTTP_404_NOT_FOUND)
        return Response({"user_balance": wallet.user_balance}, status=status.HTTP_200_OK)





class CreateTransactionView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    serializer_class = TransactionSerializer


    @extend_schema(
        request={
            "application/json": {
                "type": "object",
                "properties": {
                    "pin": {"type": "integer", "example":  1234},
                    "amount": {"type": "integer", "example": 500},
 
                },
                "required": ["pin", "amount"]
            },
      
        }
    )

    def post(self, request):
        user = request.user
        wallet = Wallet.objects.filter(user=user).first()
        if not wallet:
            return Response({"detail": "Wallet does not exist."}, status=status.HTTP_404_NOT_FOUND)

        # Check weekly deposit limit
        last_deposit = Transaction.objects.filter(
            wallet=wallet, 
            transaction_type='credit',
            status='success'  # Only count successful deposits
        ).order_by('-created_at').first()
        
        if last_deposit and last_deposit.created_at > timezone.now() - timedelta(weeks=1):
            return Response(
                {"detail": "You can only deposit once a week. Please try again later."},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = self.serializer_class(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        amount = serializer.validated_data.get('amount', 0)
        pin = request.data.get('pin')

        # Validate PIN


        if not pin:
            return Response({"detail": " PIN needed."}, status=status.HTTP_400_BAD_REQUEST)
        else:
            if pin != wallet.pin:
                return Response({"detail": "Invalid PIN."}, status=status.HTTP_400_BAD_REQUEST)

        # Initialize Paystack payment
        paystack_response = self.initialize_paystack_payment(
            email=user.email,
            amount=amount,
            user=user,
            wallet=wallet
        )

        if not paystack_response.get('status'):
            return Response(
                {"detail": "Payment initialization failed", "error": paystack_response.get('message')},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Save transaction as pending
        transaction = serializer.save(
            wallet=wallet,
            transaction_type='credit',
            status='pending',
            # payment_reference=paystack_response['data']['reference']
        )

        transaction.payment_reference = paystack_response['data']['reference']
        transaction.save()

        return Response({
            "message": "Payment initialized successfully",
            "authorization_url": paystack_response['data']['authorization_url'],
            "transaction": TransactionSerializer(transaction).data
        })

    def initialize_paystack_payment(self, email, amount, user, wallet):
        """Helper method to initialize Paystack payment"""
        url = "https://api.paystack.co/transaction/initialize"
        headers = {
            "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "email": email,
            "amount": int(amount * 100),  # Paystack uses kobo
            "reference": f"DEP_{user.id}_{int(timezone.now().timestamp())}",
            "callback_url": f"{settings.BASE_FRONTEND_URL}/verify-payment/",
            "metadata": {
                "wallet_id": str(wallet.id),
                "user_id": str(user.id)
            }
        }

        try:
            response = requests.post(url, headers=headers, json=payload)
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"status": False, "message": str(e)}
        


@csrf_exempt
def verify_payment(request):
    # Handle both GET (Paystack callback) and POST (manual verification)
    if request.method in ['GET', 'POST']:
        # Get reference from GET (Paystack) or POST (manual checks)
        reference = request.GET.get('reference') or request.POST.get('reference')
        
        if not reference:
            return JsonResponse(
                {"status": "failed", "message": "Reference missing"},
                status=400
            )
        
        try:
            # Verify with Paystack
            url = f"https://api.paystack.co/transaction/verify/{reference}"
            headers = {"Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}"}
            response = requests.get(url, headers=headers)
            data = response.json()

            if not data.get('status') or data['data']['status'] != 'success':
                return JsonResponse(
                    {"status": "failed", "message": "Payment verification failed"},
                    status=400
                )

            # Update transaction
            transaction = Transaction.objects.get(
                payment_reference=reference,
                status='pending'
            )
            transaction.status = 'success'
            transaction.save()
            
            # Update wallet balance
            wallet = transaction.wallet
            wallet.user_balance += transaction.amount
            wallet.save()
            
            return JsonResponse({"status": "success"})
            
        except Transaction.DoesNotExist:
            return JsonResponse(
                {"status": "failed", "message": "Transaction not found"},
                status=404
            )
        except Exception as e:
            return JsonResponse(
                {"status": "failed", "message": str(e)},
                status=500
            )
    
    # If method is neither GET nor POST
    return JsonResponse(
        {"status": "failed", "message": "Method not allowed"},
        status=405
    )








# @csrf_exempt
# def verify_payment(request):
#     if request.method == 'POST':
#         reference = request.POST.get('reference')
        
#         # Verify payment with Paystack
#         url = f"https://api.paystack.co/transaction/verify/{reference}"
#         headers = {"Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}"}
        
#         response = requests.get(url, headers=headers)
#         data = response.json()

#         if data['status'] and data['data']['status'] == 'success':
#             # Update transaction and wallet balance
#             transaction = Transaction.objects.get(
#                 payment_reference=reference,
#                 status='pending'
#             )
#             transaction.status = 'success'
#             transaction.save()
            
#             wallet = transaction.wallet
#             wallet.user_balance += transaction.amount
#             wallet.save()
            
#             return JsonResponse({"status": "success"})
        
#         return JsonResponse({"status": "failed"}, status=400)

