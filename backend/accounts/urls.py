from django.urls import path
from accounts.views import (
    CookieTokenObtainPairView, LogoutView,
    CookieTokenRefreshView, CookieTokenVerifyView,
    UserView, TwoFactorToggleView
)

urlpatterns = [
    # JWT
    path("login/", CookieTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("refresh/", CookieTokenRefreshView.as_view(), name="token_refresh"),
    path("verify/", CookieTokenVerifyView.as_view(), name="token_verify"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("2fa/", TwoFactorToggleView.as_view(), name="two_factor_toggle"),

    # User
    path("me/", UserView.as_view(), name="me"),
    path("register/", UserView.as_view(), name="register_user"),
]