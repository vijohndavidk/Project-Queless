from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import User


class RegistrationAndLoginTests(APITestCase):
    def test_registration_creates_customer_and_returns_token(self):
        response = self.client.post(
            "/api/register/",
            {
                "username": "alice",
                "email": "alice@example.com",
                "password": "StrongPass123",
                "password2": "StrongPass123",
            },
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("token", response.data)
        self.assertEqual(response.data["user"]["role"], "customer")
        self.assertTrue(User.objects.filter(username="alice").exists())

    def test_registration_rejects_mismatched_passwords(self):
        response = self.client.post(
            "/api/register/",
            {
                "username": "bob",
                "email": "bob@example.com",
                "password": "StrongPass123",
                "password2": "DifferentPass456",
            },
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_with_correct_credentials_returns_token(self):
        User.objects.create_user(username="carol", email="carol@example.com", password="pass12345")
        response = self.client.post("/api/login/", {"username": "carol", "password": "pass12345"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("token", response.data)

    def test_login_with_wrong_password_is_rejected(self):
        User.objects.create_user(username="dave", email="dave@example.com", password="pass12345")
        response = self.client.post("/api/login/", {"username": "dave", "password": "wrong"})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
