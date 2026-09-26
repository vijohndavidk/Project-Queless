from rest_framework import serializers
from services.serializers import ServiceSerializer
from .models import Appointment


class AppointmentSerializer(serializers.ModelSerializer):
    service_detail = ServiceSerializer(source="service", read_only=True)

    class Meta:
        model = Appointment
        fields = [
            "id", "user", "service", "service_detail",
            "appointment_date", "appointment_time", "status", "created_at",
        ]
        read_only_fields = ["user"]

    def validate_appointment_date(self, value):
        from datetime import date
        if value < date.today():
            raise serializers.ValidationError("Appointment date cannot be in the past.")
        return value
