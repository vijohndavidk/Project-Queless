from django.urls import path
from . import views

urlpatterns = [
    # Customer - mounted at /api/queue/...
    path("queue/join/", views.JoinQueueView.as_view(), name="queue-join"),
    path("queue/status/", views.QueueStatusView.as_view(), name="queue-status"),
    path("queue/cancel/", views.CancelQueueView.as_view(), name="queue-cancel"),

    # Staff - mounted at /api/staff/...
    path("staff/queue/", views.StaffQueueView.as_view(), name="staff-queue"),
    path("staff/next-token/", views.CallNextTokenView.as_view(), name="staff-next-token"),
    path("staff/complete-token/", views.CompleteTokenView.as_view(), name="staff-complete-token"),
    path("staff/skip-token/", views.SkipTokenView.as_view(), name="staff-skip-token"),
    path("staff/recall-token/", views.RecallTokenView.as_view(), name="staff-recall-token"),
    path("staff/history/", views.QueueHistoryView.as_view(), name="staff-history"),
]
