from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.views import IsAdminRole
from .logic import (
    ACTIVE_STATUSES,
    build_status_payload,
    generate_token_number,
    has_active_token,
)
from .models import QueueHistory, QueueToken
from .serializers import JoinQueueSerializer, QueueHistorySerializer, QueueTokenSerializer


class IsStaffRole(permissions.BasePermission):
    """Lets in users with role 'staff' or 'admin' (admins can help staff out)."""

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and (user.role in ("staff", "admin") or user.is_superuser))


# ---------------------------------------------------------------------------
# Customer-facing endpoints
# ---------------------------------------------------------------------------

class JoinQueueView(APIView):
    """POST /api/queue/join/  {"service": <id>}"""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = JoinQueueSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        service = serializer.validated_data["service"]
        today = timezone.localdate()

        if has_active_token(request.user, service, today):
            return Response(
                {"detail": "You already have an active queue token for this service today."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        token_number = generate_token_number(service, today)
        token = QueueToken.objects.create(
            user=request.user, service=service, token_number=token_number, queue_date=today
        )
        return Response(build_status_payload(token), status=status.HTTP_201_CREATED)


class QueueStatusView(APIView):
    """GET /api/queue/status/  - all of the caller's active tokens for today."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        today = timezone.localdate()
        tokens = QueueToken.objects.filter(
            user=request.user, queue_date=today, status__in=ACTIVE_STATUSES
        ).select_related("service")
        return Response([build_status_payload(t) for t in tokens])


class CancelQueueView(APIView):
    """POST /api/queue/cancel/  {"token": <id>}"""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        token_id = request.data.get("token")
        try:
            token = QueueToken.objects.get(id=token_id, user=request.user)
        except QueueToken.DoesNotExist:
            return Response({"detail": "Queue token not found."}, status=status.HTTP_404_NOT_FOUND)

        if token.status not in ACTIVE_STATUSES:
            return Response(
                {"detail": "This token is no longer active and can't be cancelled."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        token.status = QueueToken.Status.CANCELLED
        token.save(update_fields=["status"])
        return Response({"detail": f"Token {token.display_code} cancelled."})


# ---------------------------------------------------------------------------
# Staff-facing endpoints
# ---------------------------------------------------------------------------

class StaffQueueView(APIView):
    """GET /api/staff/queue/?service=<id>  - the live waiting list for a service today."""

    permission_classes = [IsStaffRole]

    def get(self, request):
        today = timezone.localdate()
        qs = QueueToken.objects.filter(queue_date=today, status=QueueToken.Status.WAITING).select_related(
            "service", "user"
        )
        service_id = request.query_params.get("service")
        if service_id:
            qs = qs.order_by("token_number").filter(service_id=service_id)
        else:
            qs = qs.order_by("service_id", "token_number")

        currently_serving = QueueToken.objects.filter(
            queue_date=today, status=QueueToken.Status.SERVING
        ).select_related("service", "user")
        if service_id:
            currently_serving = currently_serving.filter(service_id=service_id)

        return Response(
            {
                "waiting": QueueTokenSerializer(qs, many=True).data,
                "serving": QueueTokenSerializer(currently_serving, many=True).data,
                "waiting_count": qs.count(),
            }
        )


def _log(token, staff, action):
    QueueHistory.objects.create(token=token, staff=staff, action=action)


class CallNextTokenView(APIView):
    """POST /api/staff/next-token/  {"service": <id>} - calls the oldest waiting token."""

    permission_classes = [IsStaffRole]

    def post(self, request):
        service_id = request.data.get("service")
        today = timezone.localdate()
        next_token = (
            QueueToken.objects.filter(
                service_id=service_id, queue_date=today, status=QueueToken.Status.WAITING
            )
            .order_by("token_number")
            .first()
        )
        if not next_token:
            return Response({"detail": "The queue is empty."}, status=status.HTTP_404_NOT_FOUND)

        next_token.status = QueueToken.Status.SERVING
        next_token.called_at = timezone.now()
        next_token.save(update_fields=["status", "called_at"])
        _log(next_token, request.user, "called")
        return Response(QueueTokenSerializer(next_token).data)


class CompleteTokenView(APIView):
    """POST /api/staff/complete-token/  {"token": <id>}"""

    permission_classes = [IsStaffRole]

    def post(self, request):
        token = _get_token_or_404(request.data.get("token"))
        if isinstance(token, Response):
            return token

        token.status = QueueToken.Status.COMPLETED
        token.completed_at = timezone.now()
        token.save(update_fields=["status", "completed_at"])
        _log(token, request.user, "completed")
        return Response(QueueTokenSerializer(token).data)


class SkipTokenView(APIView):
    """POST /api/staff/skip-token/  {"token": <id>}"""

    permission_classes = [IsStaffRole]

    def post(self, request):
        token = _get_token_or_404(request.data.get("token"))
        if isinstance(token, Response):
            return token

        token.status = QueueToken.Status.SKIPPED
        token.save(update_fields=["status"])
        _log(token, request.user, "skipped")
        return Response(QueueTokenSerializer(token).data)


class RecallTokenView(APIView):
    """POST /api/staff/recall-token/  {"token": <id>} - re-announce a called/serving token."""

    permission_classes = [IsStaffRole]

    def post(self, request):
        token = _get_token_or_404(request.data.get("token"))
        if isinstance(token, Response):
            return token

        token.called_at = timezone.now()
        token.save(update_fields=["called_at"])
        _log(token, request.user, "recalled")
        return Response(QueueTokenSerializer(token).data)


def _get_token_or_404(token_id):
    try:
        return QueueToken.objects.get(id=token_id)
    except (QueueToken.DoesNotExist, TypeError, ValueError):
        return Response({"detail": "Queue token not found."}, status=status.HTTP_404_NOT_FOUND)


class QueueHistoryView(APIView):
    """GET /api/staff/history/  - recent queue actions, for the QueueHistory page."""

    permission_classes = [IsStaffRole]

    def get(self, request):
        history = QueueHistory.objects.select_related("token", "staff")[:100]
        return Response(QueueHistorySerializer(history, many=True).data)
