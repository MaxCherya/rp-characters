from django.urls import path
from .views import (
    EventListCreateView,
    EventDetailView,
    ScenarioListCreateView,
    ScenarioDetailView,
)

urlpatterns = [
    path("", EventListCreateView.as_view(), name="event-list"),
    path("<int:pk>/", EventDetailView.as_view(), name="event-detail"),
    path("<int:event_id>/scenarios/", ScenarioListCreateView.as_view(), name="event-scenario-list"),
    path("scenarios/<int:pk>/", ScenarioDetailView.as_view(), name="scenario-detail"),
]