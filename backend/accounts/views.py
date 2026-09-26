from django.contrib.auth import authenticate
from django.db.models import Avg, Count
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Profile, Staff, User
from .serializers import ProfileSerializer, RegisterSerializer, StaffSerializer, UserSerializer


class IsAdminRole(permissions.BasePermission):
    """Only lets in users whose role is 'admin' (Django superusers count too)."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.role == User.Role.ADMIN or request.user.is_superuser)
        )


class RegisterView(generics.CreateAPIView):
    """POST /api/register/  - anyone can create a customer account."""

    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response(
            {"token": token.key, "user": UserSerializer(user).data},
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    """POST /api/login/  - returns an auth token + basic user info."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get("username", "")
        password = request.data.get("password", "")

        if not username or not password:
            return Response(
                {"detail": "Username and password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = authenticate(username=username, password=password)
        if user is None:
            return Response(
                {"detail": "Invalid username or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        token, _ = Token.objects.get_or_create(user=user)
        return Response({"token": token.key, "user": UserSerializer(user).data})


class LogoutView(APIView):
    """POST /api/logout/  - deletes the caller's auth token."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        request.user.auth_token.delete()
        return Response({"detail": "Logged out successfully."}, status=status.HTTP_200_OK)


class ProfileView(APIView):
    """GET/PUT /api/profile/  - view or update the logged-in user's profile."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def put(self, request):
        profile, _ = Profile.objects.get_or_create(user=request.user)
        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(request.user).data)


class AdminUserListView(generics.ListAPIView):
    """GET /api/admin/users/  - list every user, admin only."""

    queryset = User.objects.all().order_by("-date_joined")
    serializer_class = UserSerializer
    permission_classes = [IsAdminRole]


class AdminStaffListCreateView(generics.ListCreateAPIView):
    """GET/POST /api/admin/staff/  - list staff or promote a user to staff, admin only."""

    queryset = Staff.objects.select_related("user").all()
    serializer_class = StaffSerializer
    permission_classes = [IsAdminRole]

    def perform_create(self, serializer):
        staff = serializer.save()
        staff.user.role = User.Role.STAFF
        staff.user.save(update_fields=["role"])


class AdminStaffDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PUT/DELETE /api/admin/staff/<id>/  - manage a single staff record, admin only."""

    queryset = Staff.objects.select_related("user").all()
    serializer_class = StaffSerializer
    permission_classes = [IsAdminRole]


class AdminDashboardView(APIView):
    """GET /api/admin/dashboard/  - the top-line numbers for the admin dashboard cards."""

    permission_classes = [IsAdminRole]

    def get(self, request):
        # Imported here (not at module top) to avoid a circular import between
        # the accounts, services, and queue_app apps.
        from services.models import Service
        from queue_app.models import QueueToken

        today = timezone.localdate()

        total_users = User.objects.filter(role=User.Role.CUSTOMER).count()
        total_staff = Staff.objects.count()
        total_services = Service.objects.count()
        currently_waiting = QueueToken.objects.filter(
            queue_date=today, status__in=[QueueToken.Status.WAITING, QueueToken.Status.SERVING]
        ).count()
        served_today = QueueToken.objects.filter(
            queue_date=today, status=QueueToken.Status.COMPLETED
        ).count()

        completed_today_qs = QueueToken.objects.filter(
            queue_date=today, status=QueueToken.Status.COMPLETED, called_at__isnull=False
        )
        avg_wait = 0
        waits = []
        for token in completed_today_qs:
            if token.called_at and token.joined_at:
                waits.append((token.called_at - token.joined_at).total_seconds() / 60)
        if waits:
            avg_wait = round(sum(waits) / len(waits), 1)

        return Response(
            {
                "total_users": total_users,
                "total_staff": total_staff,
                "total_services": total_services,
                "currently_waiting": currently_waiting,
                "customers_served_today": served_today,
                "average_waiting_time_minutes": avg_wait,
            }
        )


class AdminStatisticsView(APIView):
    """GET /api/admin/statistics/  - a per-service breakdown, for the Reports page."""

    permission_classes = [IsAdminRole]

    def get(self, request):
        from queue_app.models import QueueToken

        today = timezone.localdate()
        breakdown = (
            QueueToken.objects.filter(queue_date=today)
            .values("service__service_name")
            .annotate(
                total_tokens=Count("id"),
                completed=Count("id", filter=models_q_completed()),
            )
        )
        return Response(list(breakdown))


def models_q_completed():
    from django.db.models import Q
    from queue_app.models import QueueToken

    return Q(status=QueueToken.Status.COMPLETED)
