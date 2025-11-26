from django.urls import path
from .views import StoryListCreateView, StoryDetailView

urlpatterns = [
    path("list/<int:character_id>", StoryListCreateView.as_view(), name="character-story-list-create"),
    path("<int:pk>/", StoryDetailView.as_view(), name="story-detail"),
]