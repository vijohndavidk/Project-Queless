from django.contrib import admin
from .models import QueueToken, QueueHistory


@admin.register(QueueToken)
class QueueTokenAdmin(admin.ModelAdmin):
    list_display = ("display_code", "user", "service", "queue_date", "status", "joined_at")
    list_filter = ("status", "queue_date", "service")
    search_fields = ("user__username",)


@admin.register(QueueHistory)
class QueueHistoryAdmin(admin.ModelAdmin):
    list_display = ("token", "staff", "action", "timestamp")
    list_filter = ("action",)
