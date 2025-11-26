from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
import pyotp
from accounts.models import TwoFactorConfig

from .serializers import (
    UserRegistrationSerializer, MeSerializer,
    TwoFactorTokenObtainPairSerializer, TwoFactorToggleSerializer
)


class CookieTokenObtainPairView(TokenObtainPairView):
    serializer_class = TwoFactorTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        data = response.data

        access = data.get("access")
        refresh = data.get("refresh")

        response.data.pop("access", None)
        response.data.pop("refresh", None)

        secure = not settings.DEBUG

        cookie_params = {
            "httponly": True,
            "secure": not settings.DEBUG,
            "samesite": "None" if secure else "Lax",
        }
        response.set_cookie("access_token", access, **cookie_params)
        response.set_cookie("refresh_token", refresh, **cookie_params)

        return response
    

class TwoFactorToggleView(APIView):
    """
    GET  /api/accounts/2fa/   -> current 2FA status + provisioning info
    POST /api/accounts/2fa/   -> enable/disable 2FA (requires otp_code)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        cfg, _ = TwoFactorConfig.objects.get_or_create(user=user)

        if not cfg.secret:
            cfg.secret = pyotp.random_base32()
            cfg.save()

        issuer = getattr(settings, "SITE_NAME", "RP Characters")
        totp = pyotp.TOTP(cfg.secret)
        otpauth_url = totp.provisioning_uri(name=user.username, issuer_name=issuer)

        return Response(
            {
                "is_enabled": bool(cfg.is_enabled),
                "has_secret": bool(cfg.secret),
                "otpauth_url": otpauth_url,
                "secret": cfg.secret,
            },
            status=status.HTTP_200_OK,
        )

    def post(self, request):
        serializer = TwoFactorToggleSerializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        cfg = serializer.save()

        return Response(
            {
                "ok": True,
                "is_enabled": cfg.is_enabled,
            },
            status=status.HTTP_200_OK,
        )
    

class CookieTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get("refresh_token")
        if not refresh_token:
            return Response({"detail": "Refresh token missing"}, status=status.HTTP_401_UNAUTHORIZED)

        request._full_data = {"refresh": refresh_token}

        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            access = response.data.get("access")
            secure = not settings.DEBUG
            cookie_params = { "httponly": True, "secure": not settings.DEBUG, "samesite": "None" if secure else "Lax", }
            response.set_cookie("access_token", access, **cookie_params)
            response.data.pop("access", None)
        return response
    

class CookieTokenVerifyView(TokenVerifyView):
    def post(self, request, *args, **kwargs):
        access_token = request.COOKIES.get("access_token")
        if not access_token:
            return Response({"detail": "No access token"}, status=status.HTTP_401_UNAUTHORIZED)

        request._full_data = {"token": access_token}

        return super().post(request, *args, **kwargs)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        response = Response({"message": "Logged out"})
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")
        return response
    

class UserView(APIView):
    def get_permissions(self):
        if self.request.method == "POST":
            return [AllowAny()]
        return [IsAuthenticated()]

    def get(self, request):
        serializer = MeSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        return Response(
            { "ok": True, "user": MeSerializer(user).data }, status=status.HTTP_201_CREATED,
        )