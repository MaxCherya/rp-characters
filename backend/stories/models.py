from django.db import models
from django.contrib.auth.models import User
from characters.models import Character

from django.db import models
from django.contrib.auth.models import User
from characters.models import Character

class Story(models.Model):
    character = models.ForeignKey(Character, on_delete=models.CASCADE, related_name="stories")
    owner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="stories")

    title = models.CharField(max_length=255)
    description = models.CharField(max_length=500, blank=True)

    markdown = models.TextField(blank=True, null=True)

    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["created"]

    def __str__(self):
        return f"{self.title} (character={self.character_id})"