from rest_framework import serializers
from .models import Story


class StorySerializer(serializers.ModelSerializer):
    character = serializers.PrimaryKeyRelatedField(read_only=True)
    owner = serializers.ReadOnlyField(source="owner.username")

    class Meta:
        model = Story
        fields = [
            "id",
            "character",
            "owner",
            "title",
            "description",
            "markdown",
            "created",
            "updated",
        ]
        read_only_fields = ["id", "character", "owner", "created", "updated"]