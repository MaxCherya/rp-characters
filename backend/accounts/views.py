from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings

from .serializers import (
    UserRegistrationSerializer, MeSerializer
)


class CookieTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        data = response.data

        # read tokens
        access = data.get("access")
        refresh = data.get("refresh")

        # remove from JSON body
        response.data.pop("access", None)
        response.data.pop("refresh", None)

        # set cookies
        cookie_params = { "httponly": True, "secure": not settings.DEBUG, "samesite": "Lax" }
        response.set_cookie("access_token", access, **cookie_params)
        response.set_cookie("refresh_token", refresh, **cookie_params)

        return response
    

class CookieTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get("refresh_token")
        if not refresh_token:
            return Response({"detail": "Refresh token missing"}, status=status.HTTP_401_UNAUTHORIZED)

        request._full_data = {"refresh": refresh_token}

        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            access = response.data.get("access")
            cookie_params = { "httponly": True, "secure": not settings.DEBUG, "samesite": "Lax" }
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