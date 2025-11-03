from rest_framework.validators import UniqueValidator
from django.utils.translation import gettext_lazy as _
from django.utils.translation import gettext
from rest_framework import serializers
from django.contrib.auth.models import User


class MeSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name"]
        read_only_fields = ["id", "username", "email", "first_name", "last_name"]

    def create(self, validated_data):
        raise serializers.ValidationError(gettext("Creation is not supported for this endpoint."))
    
    def update(self, instance, validated_data):
        raise serializers.ValidationError(gettext("Update is not supported for this endpoint."))
    

class UserRegistrationSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True, validators=[UniqueValidator(queryset=User.objects.all(), message=_("Email is already in use."))])
    username = serializers.CharField(required=True, validators=[UniqueValidator(queryset=User.objects.all(), message=_("Username is taken."))])
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, label="Confirm password")

    class Meta:
        model = User
        fields = ["username", "email", "first_name", "last_name", "password", "password2"]

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password2": gettext("Passwords do not match.")})
        attrs.pop("password2", None)
        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user