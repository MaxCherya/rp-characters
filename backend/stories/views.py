from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions

from .models import Story
from .serializers import StorySerializer
from characters.models import Character


class StoryListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/characters/<character_id>/stories/  -> list stories for that character (current user)
    POST /api/characters/<character_id>/stories/  -> create new story for that character
    """
    serializer_class = StorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        character_id = self.kwargs["character_id"]
        return Story.objects.filter(
            character_id=character_id,
            owner=self.request.user,
        )

    def perform_create(self, serializer):
        character_id = self.kwargs["character_id"]
        character = get_object_or_404(Character, pk=character_id)
        serializer.save(owner=self.request.user, character=character)


class StoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/stories/<pk>/   -> get one story
    PUT    /api/stories/<pk>/   -> full update
    PATCH  /api/stories/<pk>/   -> partial update
    DELETE /api/stories/<pk>/   -> delete
    """
    serializer_class = StorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Story.objects.filter(owner=self.request.user)