from django.db import models
from django.contrib.auth.models import User


class TwoFactorConfig(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="twofactor")
    is_enabled = models.BooleanField(default=False)
    secret = models.CharField(max_length=64, blank=True)

    def __str__(self):
        return f"2FA for {self.user.username} (enabled={self.is_enabled})"