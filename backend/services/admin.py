from django.contrib import admin
from .models import Service


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ("service_name", "average_time", "status", "created_at")
    list_filter = ("status",)
    search_fields = ("service_name",)
