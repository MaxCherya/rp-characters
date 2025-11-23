from django.urls import path
from .views import CharacterListCreateView, CharacterDetailView

urlpatterns = [
    path("", CharacterListCreateView.as_view(), name="character-list-create"),
    path("<int:pk>/", CharacterDetailView.as_view(), name="character-detail"),
]