from rest_framework import generics, permissions
from django.shortcuts import get_object_or_404

from .models import Event, Scenario
from .serializers import EventSerializer, ScenarioSerializer


# ---------- EVENT VIEWS ----------

class EventListCreateView(generics.ListCreateAPIView):
    """
    GET /events/          -> list events
    POST /events/         -> create event
    """
    queryset = Event.objects.all().order_by("id")
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /events/<id>/  -> retrieve
    PUT    /events/<id>/  -> update
    PATCH  /events/<id>/  -> partial update
    DELETE /events/<id>/  -> delete
    """
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


# ---------- SCENARIO VIEWS ----------

class ScenarioListCreateView(generics.ListCreateAPIView):
    """
    GET  /events/<event_id>/scenarios/   -> list scenarios for event
    POST /events/<event_id>/scenarios/   -> create scenario for event
    """
    serializer_class = ScenarioSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        event_id = self.kwargs.get("event_id")
        return Scenario.objects.filter(event_id=event_id).order_by("id")

    def perform_create(self, serializer):
        event_id = self.kwargs.get("event_id")
        event = get_object_or_404(Event, pk=event_id)
        serializer.save(event=event)


class ScenarioDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /scenarios/<id>/  -> retrieve
    PUT    /scenarios/<id>/  -> update
    PATCH  /scenarios/<id>/  -> partial update
    DELETE /scenarios/<id>/  -> delete
    """
    queryset = Scenario.objects.all()
    serializer_class = ScenarioSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]