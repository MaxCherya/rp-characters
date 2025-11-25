from rest_framework import serializers
from .models import Event, Scenario


class ScenarioSerializer(serializers.ModelSerializer):
    children = serializers.PrimaryKeyRelatedField(
        many=True,
        read_only=True,
    )

    class Meta:
        model = Scenario
        fields = [
            "id",
            "event",
            "parent",
            "title",
            "description",
            "weight",
            "is_terminal",
            "children",
        ]


class EventSerializer(serializers.ModelSerializer):
    scenarios = ScenarioSerializer(many=True, read_only=True)

    class Meta:
        model = Event
        fields = [
            "id",
            "title",
            "description",
            "chance_to_trigger",
            "scenarios",
        ]