from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    # Management
    path('admin/', admin.site.urls),

    # Apps
    path("api/accounts/", include("accounts.urls")),
    path("api/characters/", include("characters.urls")),
    path("api/stories/", include('stories.urls')),
    path("api/events/", include("events.urls")),
]
