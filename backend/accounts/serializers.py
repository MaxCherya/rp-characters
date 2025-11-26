from rest_framework.validators import UniqueValidator
from django.utils.translation import gettext_lazy as _
from django.utils.translation import gettext
from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer  
import pyotp
from .models import TwoFactorConfig


class TwoFactorToggleSerializer(serializers.Serializer):
    enable = serializers.BooleanField()
    otp_code = serializers.CharField(
        required=True,
        write_only=True,
        allow_blank=False,
        help_text="TOTP code from authenticator app.",
    )

    def validate(self, attrs):
        user = self.context["request"].user
        cfg, _ = TwoFactorConfig.objects.get_or_create(user=user)

        secret = cfg.secret
        if not secret:
            raise serializers.ValidationError(
                {"detail": "No 2FA secret configured for this account."}
            )

        totp = pyotp.TOTP(secret)
        if not totp.verify(attrs["otp_code"], valid_window=1):
            raise serializers.ValidationError(
                {"otp_code": ["Invalid or expired 2FA code."]}
            )

        attrs["config"] = cfg
        return attrs

    def save(self, **kwargs):
        cfg: TwoFactorConfig = self.validated_data["config"]
        enable: bool = self.validated_data["enable"]

        cfg.is_enabled = enable
        cfg.save()

        return cfg


class MeSerializer(serializers.ModelSerializer):
    is_2fa_enabled = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "is_2fa_enabled"]
        read_only_fields = ["id", "username", "email", "first_name", "last_name", "is_2fa_enabled"]

    def get_is_2fa_enabled(self, obj):
        cfg = getattr(obj, "twofactor", None)
        return bool(cfg and cfg.is_enabled)

    def create(self, validated_data):
        raise serializers.ValidationError(gettext("Creation is not supported for this endpoint."))
    
    def update(self, instance, validated_data):
        raise serializers.ValidationError(gettext("Update is not supported for this endpoint."))
    


class TwoFactorTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Extends SimpleJWT's TokenObtainPairSerializer to:
    - If user has 2FA disabled: behave as usual.
    - If user has 2FA enabled:
        - if no otp_code: raise "2FA_REQUIRED"
        - if invalid otp_code: raise error
        - if valid otp_code: return tokens as normal
    """

    otp_code = serializers.CharField(
        required=False,
        write_only=True,
        allow_blank=True,
    )

    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user

        cfg = getattr(user, "twofactor", None)
        if not cfg or not cfg.is_enabled:
            return data

        otp_code = self.initial_data.get("otp_code", "")

        if not otp_code:
            raise serializers.ValidationError(
                {
                    "detail": "2FA code required.",
                    "2fa_required": True,
                }
            )

        if not cfg.secret:
            raise serializers.ValidationError(
                {"detail": "2FA is enabled but no secret is configured."}
            )

        totp = pyotp.TOTP(cfg.secret)

        if not totp.verify(otp_code, valid_window=1):
            raise serializers.ValidationError(
                {"otp_code": ["Invalid or expired 2FA code."]}
            )

        # 2FA OK → return tokens as usual
        return data
    

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