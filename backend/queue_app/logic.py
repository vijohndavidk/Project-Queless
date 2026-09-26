"""
Plain Python business logic for the queue system.

Deliberately kept simple (no ML, no external services) - just the two
pieces of arithmetic the spec asks for:

  1. Token generation - sequential per (service, date)
  2. Wait time         - people_ahead * average_service_time
"""

from django.db.models import Max

from .models import QueueToken

# Statuses that still count as "in the line" (haven't left it yet).
ACTIVE_STATUSES = [QueueToken.Status.WAITING, QueueToken.Status.CALLED, QueueToken.Status.SERVING]


def generate_token_number(service, queue_date):
    """
    Returns the next sequential token number for this service on this date.

    Example: if Q001..Q004 already exist for Service X today, this returns 5
    (which the model then displays as "Q005").
    """
    latest = QueueToken.objects.filter(service=service, queue_date=queue_date).aggregate(
        Max("token_number")
    )["token_number__max"]
    return (latest or 0) + 1


def has_active_token(user, service, queue_date):
    """Prevents a customer from joining the same service's queue twice in one day."""
    return QueueToken.objects.filter(
        user=user, service=service, queue_date=queue_date, status__in=ACTIVE_STATUSES
    ).exists()


def get_people_ahead(token):
    """
    Counts how many still-active tokens for the same service/date have a
    smaller token number than this one - i.e. how many people are ahead
    of this customer in line.
    """
    return QueueToken.objects.filter(
        service=token.service,
        queue_date=token.queue_date,
        status__in=ACTIVE_STATUSES,
        token_number__lt=token.token_number,
    ).count()


def get_current_serving_token(service, queue_date):
    """The token currently being served (or most recently called) for a service today."""
    return (
        QueueToken.objects.filter(
            service=service, queue_date=queue_date, status=QueueToken.Status.SERVING
        )
        .order_by("-called_at")
        .first()
    )


def calculate_estimated_wait_minutes(people_ahead, average_service_time):
    """estimated_waiting_time = people_ahead x average_service_time"""
    return people_ahead * average_service_time


def build_status_payload(token):
    """Assembles the full queue-status response for a single token."""
    people_ahead = get_people_ahead(token)
    current_serving = get_current_serving_token(token.service, token.queue_date)
    wait_minutes = calculate_estimated_wait_minutes(people_ahead, token.service.average_time)

    return {
        "token_id": token.id,
        "token_number": token.display_code,
        "service": token.service.service_name,
        "status": token.status,
        "current_serving_token": current_serving.display_code if current_serving else None,
        "people_ahead": people_ahead,
        "average_service_time": token.service.average_time,
        "estimated_wait_minutes": wait_minutes,
        "joined_at": token.joined_at,
    }
