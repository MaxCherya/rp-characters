from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    # Management
    path('admin/', admin.site.urls),

    # Apps
    path("api/accounts/", include("accounts.urls")),
    path("api/characters/", include("characters.urls")),
]
