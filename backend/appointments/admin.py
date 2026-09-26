from django.contrib import admin
from .models import Appointment


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ("user", "service", "appointment_date", "appointment_time", "status")
    list_filter = ("status", "appointment_date", "service")
    search_fields = ("user__username", "service__service_name")
