from rest_framework import serializers
from services.models import Service
from .models import QueueHistory, QueueToken


class QueueTokenSerializer(serializers.ModelSerializer):
    display_code = serializers.CharField(read_only=True)
    service_name = serializers.CharField(source="service.service_name", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = QueueToken
        fields = [
            "id", "user", "username", "service", "service_name", "display_code",
            "token_number", "queue_date", "status", "joined_at", "called_at", "completed_at",
        ]
        read_only_fields = ["user", "token_number", "queue_date", "status", "called_at", "completed_at"]


class JoinQueueSerializer(serializers.Serializer):
    service = serializers.PrimaryKeyRelatedField(queryset=Service.objects.filter(status="active"))


class QueueHistorySerializer(serializers.ModelSerializer):
    token_code = serializers.CharField(source="token.display_code", read_only=True)
    staff_username = serializers.CharField(source="staff.username", read_only=True)

    class Meta:
        model = QueueHistory
        fields = ["id", "token", "token_code", "staff", "staff_username", "action", "timestamp"]
