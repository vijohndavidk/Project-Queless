from django.conf import settings
from django.db import models

from services.models import Service


class Appointment(models.Model):
    """A customer's booking for a service at a specific date/time."""

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        CONFIRMED = "confirmed", "Confirmed"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="appointments")
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name="appointments")
    appointment_date = models.DateField()
    appointment_time = models.TimeField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-appointment_date", "-appointment_time"]

    def __str__(self):
        return f"{self.user.username} - {self.service.service_name} on {self.appointment_date}"
