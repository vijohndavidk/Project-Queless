from django.utils import timezone
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from accounts.models import User
from services.models import Service
from .logic import calculate_estimated_wait_minutes, generate_token_number
from .models import QueueToken


class QueueLogicTests(APITestCase):
    """Unit tests for the plain-Python business logic (no HTTP involved)."""

    def setUp(self):
        self.service = Service.objects.create(service_name="Consult", average_time=6)
        self.customer = User.objects.create_user(username="q1", email="q1@test.com", password="pass12345")

    def test_token_numbers_are_sequential(self):
        today = timezone.localdate()
        first = generate_token_number(self.service, today)
        QueueToken.objects.create(user=self.customer, service=self.service, token_number=first, queue_date=today)
        second = generate_token_number(self.service, today)
        self.assertEqual(first, 1)
        self.assertEqual(second, 2)

    def test_wait_time_formula(self):
        self.assertEqual(calculate_estimated_wait_minutes(people_ahead=5, average_service_time=6), 30)
        self.assertEqual(calculate_estimated_wait_minutes(people_ahead=0, average_service_time=6), 0)


class QueueApiTests(APITestCase):
    """Integration tests through the actual API endpoints."""

    def setUp(self):
        self.service = Service.objects.create(service_name="Consult", average_time=6)
        self.customer = User.objects.create_user(username="cust", email="cust@test.com", password="pass12345")
        self.customer_token = Token.objects.create(user=self.customer)

        staff_user = User.objects.create_user(
            username="staffer", email="staff@test.com", password="pass12345", role=User.Role.STAFF
        )
        self.staff_token = Token.objects.create(user=staff_user)

    def test_customer_can_join_queue_and_gets_first_token(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.customer_token.key}")
        response = self.client.post("/api/queue/join/", {"service": self.service.id})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["token_number"], "Q001")
        self.assertEqual(response.data["people_ahead"], 0)

    def test_customer_cannot_join_same_service_twice_in_one_day(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.customer_token.key}")
        self.client.post("/api/queue/join/", {"service": self.service.id})
        response = self.client.post("/api/queue/join/", {"service": self.service.id})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_staff_can_call_and_complete_a_token(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.customer_token.key}")
        self.client.post("/api/queue/join/", {"service": self.service.id})

        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.staff_token.key}")
        call_response = self.client.post("/api/staff/next-token/", {"service": self.service.id})
        self.assertEqual(call_response.status_code, status.HTTP_200_OK)
        self.assertEqual(call_response.data["status"], "serving")

        token_id = call_response.data["id"]
        complete_response = self.client.post("/api/staff/complete-token/", {"token": token_id})
        self.assertEqual(complete_response.status_code, status.HTTP_200_OK)
        self.assertEqual(complete_response.data["status"], "completed")
