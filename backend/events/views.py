from rest_framework import generics, permissions
from django.shortcuts import get_object_or_404

from .models import Event, Scenario
from .serializers import EventSerializer, ScenarioSerializer
from characters.models import Character


# ---------- EVENT VIEWS ----------


class EventListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/events/characters/<character_id>/
    POST /api/events/characters/<character_id>/
    """
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        character_id = self.kwargs.get("character_id")

        if not user.is_authenticated:
            return Event.objects.none()

        return (
            Event.objects
            .filter(owner=user, character_id=character_id)
            .order_by("id")
        )

    def perform_create(self, serializer):
        user = self.request.user
        character_id = self.kwargs.get("character_id")

        # Character has no `user` field – just filter by pk
        character = get_object_or_404(
            Character,
            pk=character_id,
        )

        serializer.save(
            owner=user,
            character=character,
        )


class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/events/characters/<character_id>/<id>/
    PUT    /api/events/characters/<character_id>/<id>/
    PATCH  /api/events/characters/<character_id>/<id>/
    DELETE /api/events/characters/<character_id>/<id>/
    """
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        character_id = self.kwargs.get("character_id")

        if not user.is_authenticated:
            return Event.objects.none()

        return Event.objects.filter(
            owner=user,
            character_id=character_id,
        )


# ---------- SCENARIO VIEWS ----------


class ScenarioListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/events/characters/<character_id>/<event_id>/scenarios/
    POST /api/events/characters/<character_id>/<event_id>/scenarios/
    """
    serializer_class = ScenarioSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        character_id = self.kwargs.get("character_id")
        event_id = self.kwargs.get("event_id")

        if not user.is_authenticated:
            return Scenario.objects.none()

        return Scenario.objects.filter(
            event__id=event_id,
            event__character_id=character_id,
            event__owner=user,
        ).order_by("id")

    def perform_create(self, serializer):
        user = self.request.user
        character_id = self.kwargs.get("character_id")
        event_id = self.kwargs.get("event_id")

        event = get_object_or_404(
            Event,
            pk=event_id,
            character_id=character_id,
            owner=user,
        )

        serializer.save(event=event)


class ScenarioDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/events/scenarios/<id>/
    PUT    /api/events/scenarios/<id>/
    PATCH  /api/events/scenarios/<id>/
    DELETE /api/events/scenarios/<id>/
    """
    serializer_class = ScenarioSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        user = self.request.user

        if not user.is_authenticated:
            return Scenario.objects.none()

        return Scenario.objects.filter(event__owner=user)