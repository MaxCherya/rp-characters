from django.urls import path
from .views import (
    EventListCreateView,
    EventDetailView,
    ScenarioListCreateView,
    ScenarioDetailView,
)

urlpatterns = [
    path("characters/<int:character_id>/", EventListCreateView.as_view(), name="event-list"),
    path("characters/<int:character_id>/<int:pk>/", EventDetailView.as_view(), name="event-detail"),
    path("characters/<int:character_id>/<int:event_id>/scenarios/", ScenarioListCreateView.as_view(), name="event-scenario-list"),
    path("scenarios/<int:pk>/", ScenarioDetailView.as_view(), name="scenario-detail"),
]