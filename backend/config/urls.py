"""
URL configuration for the QueueLess project.

Everything under /api/ is a REST endpoint consumed by the React frontend.
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    return Response({"status": "ok", "service": "QueueLess API"})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", health_check, name="health-check"),

    # accounts app: register/login/logout/profile + admin user & staff management
    path("api/", include("accounts.urls")),

    # services app: GET/POST /api/services/, PUT/DELETE /api/services/<id>/
    path("api/services/", include("services.urls")),

    # queue_app: /api/queue/join|status|cancel/, /api/staff/queue|next-token|...
    path("api/", include("queue_app.urls")),

    # appointments app: GET/POST /api/appointments/, PUT/DELETE /api/appointments/<id>/
    path("api/appointments/", include("appointments.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
