from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from accounts.models import User
from .models import Service


class ServiceTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username="admin1", email="admin1@test.com", password="pass12345", role=User.Role.ADMIN
        )
        self.admin_token = Token.objects.create(user=self.admin)

    def test_anyone_can_list_services(self):
        Service.objects.create(service_name="Consult", average_time=5)
        response = self.client.get("/api/services/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_admin_can_create_service(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.admin_token.key}")
        response = self.client.post(
            "/api/services/", {"service_name": "Bill Payment", "average_time": 4}
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Service.objects.filter(service_name="Bill Payment").exists())

    def test_non_admin_cannot_create_service(self):
        customer = User.objects.create_user(username="cust1", email="c1@test.com", password="pass12345")
        token = Token.objects.create(user=customer)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")
        response = self.client.post("/api/services/", {"service_name": "Hack", "average_time": 1})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
