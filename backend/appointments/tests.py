from datetime import date, timedelta

from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from accounts.models import User
from services.models import Service
from .models import Appointment


class AppointmentTests(APITestCase):
    def setUp(self):
        self.service = Service.objects.create(service_name="Consult", average_time=6)
        self.customer = User.objects.create_user(username="apptcust", email="a@test.com", password="pass12345")
        self.token = Token.objects.create(user=self.customer)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")

    def test_customer_can_create_appointment(self):
        tomorrow = date.today() + timedelta(days=1)
        response = self.client.post(
            "/api/appointments/",
            {"service": self.service.id, "appointment_date": str(tomorrow), "appointment_time": "10:00:00"},
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Appointment.objects.count(), 1)
        self.assertEqual(Appointment.objects.first().status, Appointment.Status.PENDING)

    def test_cannot_book_appointment_in_the_past(self):
        yesterday = date.today() - timedelta(days=1)
        response = self.client.post(
            "/api/appointments/",
            {"service": self.service.id, "appointment_date": str(yesterday), "appointment_time": "10:00:00"},
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_customer_can_cancel_own_appointment(self):
        appt = Appointment.objects.create(
            user=self.customer, service=self.service, appointment_date=date.today(), appointment_time="10:00:00"
        )
        response = self.client.patch(f"/api/appointments/{appt.id}/", {"status": "cancelled"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        appt.refresh_from_db()
        self.assertEqual(appt.status, Appointment.Status.CANCELLED)
