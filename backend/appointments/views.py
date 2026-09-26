from rest_framework import permissions, viewsets
from rest_framework.exceptions import PermissionDenied

from .models import Appointment
from .serializers import AppointmentSerializer


class AppointmentViewSet(viewsets.ModelViewSet):
    """
    /api/appointments/  - customers see + manage only their own appointments.
    Staff/Admin see every appointment (needed for the staff/admin dashboards).
    """

    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ("staff", "admin") or user.is_superuser:
            return Appointment.objects.select_related("user", "service").all()
        return Appointment.objects.select_related("service").filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        user = self.request.user
        is_staff_or_admin = user.role in ("staff", "admin") or user.is_superuser
        if not is_staff_or_admin:
            # Customers may only cancel their own appointment - no other field changes.
            new_status = serializer.validated_data.get("status")
            if new_status and new_status != Appointment.Status.CANCELLED:
                raise PermissionDenied("Customers can only cancel an appointment, not change it to another status.")
            serializer.save(status=Appointment.Status.CANCELLED)
        else:
            serializer.save()
