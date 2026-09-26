from django.conf import settings
from django.db import models

from services.models import Service


class QueueToken(models.Model):
    """
    One customer's place in line for a service, on a given date.
    Tokens are numbered sequentially per (service, date) - see
    queue_app/logic.py for how token_number is generated.
    """

    class Status(models.TextChoices):
        WAITING = "waiting", "Waiting"
        CALLED = "called", "Called"
        SERVING = "serving", "Serving"
        COMPLETED = "completed", "Completed"
        SKIPPED = "skipped", "Skipped"
        CANCELLED = "cancelled", "Cancelled"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="queue_tokens")
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name="queue_tokens")
    token_number = models.PositiveIntegerField()
    queue_date = models.DateField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.WAITING)

    joined_at = models.DateTimeField(auto_now_add=True)
    called_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["queue_date", "token_number"]
        # A service can never have two tokens with the same number on the same day.
        unique_together = ("service", "queue_date", "token_number")

    @property
    def display_code(self):
        """Formats the token as Q001, Q002, ... like the spec's examples."""
        return f"Q{self.token_number:03d}"

    def __str__(self):
        return f"{self.display_code} - {self.service.service_name} ({self.status})"


class QueueHistory(models.Model):
    """An audit trail entry: 'this staff member did this action to this token'."""

    token = models.ForeignKey(QueueToken, on_delete=models.CASCADE, related_name="history")
    staff = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="queue_actions")
    action = models.CharField(max_length=50)  # e.g. "called", "completed", "skipped", "recalled"
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-timestamp"]
        verbose_name_plural = "Queue histories"

    def __str__(self):
        return f"{self.token.display_code} - {self.action} @ {self.timestamp:%H:%M:%S}"
