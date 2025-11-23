from django.db import models
from django.contrib.auth.models import User

class Character(models.Model):
    basic_identity = models.ForeignKey('BasicIdentity', on_delete=models.SET_NULL, null=True, blank=True)
    location = models.ForeignKey('Location', on_delete=models.SET_NULL, null=True, blank=True)
    meta = models.ForeignKey('Meta', on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        if self.basic_identity:
            return f"{self.basic_identity.name_given} {self.basic_identity.name_family}".strip()
        return f"Character #{self.id}"

class BasicIdentity(models.Model):
    name_given = models.CharField(max_length=255, blank=True)
    name_family = models.CharField(max_length=255, blank=True)
    name_middle = models.CharField(max_length=255, blank=True)
    date_of_birth = models.DateField(blank=True)

class Location(models.Model):
    country = models.CharField(max_length=255, blank=True)
    state_province = models.CharField(max_length=255, blank=True)
    zip_code = models.CharField(max_length=255, blank=True)
    settlement = models.CharField(max_length=255, blank=True)
    street = models.CharField(max_length=255, blank=True)
    house = models.CharField(max_length=255, blank=True)
    appartment = models.CharField(max_length=255, blank=True)

class Meta(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    last_modified = models.DateTimeField(auto_now=True)