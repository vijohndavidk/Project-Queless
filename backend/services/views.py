from rest_framework import permissions, viewsets

from accounts.views import IsAdminRole
from .models import Service
from .serializers import ServiceSerializer


class IsAdminOrReadOnly(permissions.BasePermission):
    """Anyone (even anonymous) can view services; only admins can change them."""

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return IsAdminRole().has_permission(request, view)


class ServiceViewSet(viewsets.ModelViewSet):
    """
    Provides all 5 REST actions for /api/services/ in one class:
    GET (list), GET <id> (retrieve), POST (create), PUT (update), DELETE (destroy).
    """

    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [IsAdminOrReadOnly]
