from rest_framework import generics, permissions
from .models import Character
from .serializers import CharacterUploadSerializer


class CharacterListCreateView(generics.ListCreateAPIView):
    """
    GET  /characters/      -> list current user's characters
    POST /characters/      -> create new character
    """
    serializer_class = CharacterUploadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only user's characters, ordered by most recently modified meta
        return (
            Character.objects
            .filter(meta__owner=self.request.user)
            .select_related("meta")
            .order_by("-meta__last_modified")
        )


class CharacterDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /characters/<pk>/ -> retrieve character
    PUT    /characters/<pk>/ -> full update
    PATCH  /characters/<pk>/ -> partial update
    DELETE /characters/<pk>/ -> delete
    """
    serializer_class = CharacterUploadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Same ownership restriction
        return Character.objects.filter(meta__owner=self.request.user)