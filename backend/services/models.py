from django.db import models


class Service(models.Model):
    """A service customers can book an appointment for or join a queue for
    (e.g. 'General Consultation', 'Passport Renewal')."""

    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        INACTIVE = "inactive", "Inactive"

    service_name = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    # Average minutes it takes staff to serve one customer for this service.
    # This is the key input to the wait-time formula in queue_app.
    average_time = models.PositiveIntegerField(help_text="Average service time in minutes")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["service_name"]

    def __str__(self):
        return self.service_name
