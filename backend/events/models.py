from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class Event(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    chance_to_trigger = models.PositiveIntegerField(validators=[MinValueValidator(0), MaxValueValidator(100)])

    def __str__(self):
        return self.title
    
class Scenario(models.Model):
    event = models.ForeignKey(Event, related_name="scenarios", on_delete=models.CASCADE)
    parent = models.ForeignKey("self", related_name="children", on_delete=models.CASCADE, null=True, blank=True, help_text="Root scenarios have no parent.")
    title = models.CharField(max_length=255)
    description = models.TextField()
    weight = models.PositiveIntegerField(validators=[MinValueValidator(1)], help_text="Relative chance among siblings. Higher = more likely.")
    is_terminal = models.BooleanField(default=False, help_text="If true, branch stops here.")

    def __str__(self):
        return f"{self.event.title} → {self.title}"