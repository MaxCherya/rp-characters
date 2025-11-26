from rest_framework import serializers
from .models import Event, Scenario


class ChildScenarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Scenario
        fields = ["id", "title"]


class ScenarioSerializer(serializers.ModelSerializer):
    children = ChildScenarioSerializer(many=True, read_only=True)

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
        extra_kwargs = {
            "event": {"read_only": True},
        }


class EventSerializer(serializers.ModelSerializer):
    scenarios = ScenarioSerializer(many=True, read_only=True)
    owner = serializers.ReadOnlyField(source="owner.username")
    character = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Event
        fields = [
            "id",
            "title",
            "description",
            "chance_to_trigger",
            "character",
            "owner",
            "created_at",
            "last_modified",
            "scenarios",
        ]
        read_only_fields = [
            "owner",
            "character",
            "created_at",
            "last_modified",
        ]