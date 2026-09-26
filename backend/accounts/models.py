from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom user model so we can attach a 'role' to every account.
    We keep everything AbstractUser gives us (username, password hashing,
    is_staff, is_superuser, etc.) and just add role + email-as-login-friendly.
    """

    class Role(models.TextChoices):
        CUSTOMER = "customer", "Customer"
        STAFF = "staff", "Staff"
        ADMIN = "admin", "Admin"

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.CUSTOMER)
    email = models.EmailField(unique=True)

    # Login with email OR username both work since USERNAME_FIELD stays
    # 'username', but we enforce a unique email too for clean identification.

    def __str__(self):
        return f"{self.username} ({self.role})"


class Profile(models.Model):
    """Extra personal details for a user, kept separate from the auth model."""

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    phone = models.CharField(max_length=20, blank=True)
    address = models.CharField(max_length=255, blank=True)
    profile_image = models.ImageField(upload_to="profiles/", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Profile of {self.user.username}"


class Staff(models.Model):
    """
    Links a User (with role=staff) to operational details: which department
    they work in and which physical counter number they're assigned to.
    """

    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        ON_BREAK = "on_break", "On Break"
        OFFLINE = "offline", "Offline"

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="staff_profile")
    department = models.CharField(max_length=100)
    counter_number = models.PositiveIntegerField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OFFLINE)

    def __str__(self):
        return f"Staff: {self.user.username} (Counter {self.counter_number})"
