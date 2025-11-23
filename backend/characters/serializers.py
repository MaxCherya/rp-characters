from rest_framework import serializers
from .models import Character, BasicIdentity, Location, Meta


class BasicIdentitySerializer(serializers.ModelSerializer):
    class Meta:
        model = BasicIdentity
        fields = [
            "name_given",
            "name_family",
            "name_middle",
            "date_of_birth",
        ]


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = [
            "country",
            "state_province",
            "zip_code",
            "settlement",
            "street",
            "house",
            "appartment",
        ]


class CharacterUploadSerializer(serializers.ModelSerializer):
    basic_identity = BasicIdentitySerializer(required=True)
    location = LocationSerializer(required=True)

    class Meta:
        model = Character
        fields = [
            "id",
            "basic_identity",
            "location",
        ]

    def validate(self, attrs):
        if "basic_identity" not in attrs:
            raise serializers.ValidationError({"basic_identity": "This field is required."})
        if "location" not in attrs:
            raise serializers.ValidationError({"location": "This field is required."})
        return attrs

    def create(self, validated_data):
        basic_data = validated_data.pop("basic_identity")
        location_data = validated_data.pop("location")

        basic_identity = BasicIdentity.objects.create(**basic_data)
        location = Location.objects.create(**location_data)

        request = self.context.get("request")
        meta = Meta.objects.create(owner=request.user) if request else None

        character = Character.objects.create(
            basic_identity=basic_identity,
            location=location,
            meta=meta
        )
        return character
