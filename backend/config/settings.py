"""
Django settings for the QueueLess project.

This file wires together:
- Our 4 apps (accounts, services, queue_app, appointments)
- Django REST Framework (for building the API)
- django-cors-headers (so React on :5173 can call Django on :8000)
- MySQL as the database, configured through environment variables (.env)

See https://docs.djangoproject.com/en/5.2/topics/settings/ for background.
"""

from pathlib import Path
import os
from datetime import timedelta
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

# Load variables from backend/.env into os.environ.
# This keeps secrets (passwords, keys) out of source code / git.
load_dotenv(BASE_DIR / ".env")


def env(key, default=None):
    return os.environ.get(key, default)


# ---------------------------------------------------------------------------
# Core security settings
# ---------------------------------------------------------------------------

SECRET_KEY = env("SECRET_KEY", "django-insecure-dev-only-change-me")

# DEBUG should be True only on your local machine, never in production.
DEBUG = env("DEBUG", "True") == "True"

ALLOWED_HOSTS = env("ALLOWED_HOSTS", "127.0.0.1,localhost").split(",")


# ---------------------------------------------------------------------------
# Applications
# ---------------------------------------------------------------------------

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third-party
    "rest_framework",
    "rest_framework.authtoken",  # gives every user a login token
    "corsheaders",

    # Our apps
    "accounts",
    "services",
    "queue_app",
    "appointments",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    # CorsMiddleware must sit near the top, before CommonMiddleware.
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"


# ---------------------------------------------------------------------------
# Database (MySQL)
# ---------------------------------------------------------------------------
# We use PyMySQL as the driver (pure Python, installs anywhere without extra
# system libraries) but tell it to pretend to be MySQLdb so Django's mysql
# backend accepts it. This is configured in config/__init__.py.

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": env("DB_NAME", "queueless_db"),
        "USER": env("DB_USER", "root"),
        "PASSWORD": env("DB_PASSWORD", ""),
        "HOST": env("DB_HOST", "localhost"),
        "PORT": env("DB_PORT", "3306"),
        "OPTIONS": {
            "charset": "utf8mb4",
        },
    }
}


# ---------------------------------------------------------------------------
# Password validation
# ---------------------------------------------------------------------------

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]


# ---------------------------------------------------------------------------
# Internationalization
# ---------------------------------------------------------------------------

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True


# ---------------------------------------------------------------------------
# Static files
# ---------------------------------------------------------------------------

STATIC_URL = "static/"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# ---------------------------------------------------------------------------
# Custom user model
# ---------------------------------------------------------------------------
# We use our own User model (accounts.User) instead of Django's default,
# so we can add a "role" field (customer / staff / admin).
AUTH_USER_MODEL = "accounts.User"

# Serve uploaded files (profile images) in development.
MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / "media"


# ---------------------------------------------------------------------------
# Django REST Framework
# ---------------------------------------------------------------------------

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.TokenAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
}


# ---------------------------------------------------------------------------
# CORS (Cross-Origin Resource Sharing)
# ---------------------------------------------------------------------------
# Only allow the React dev server origin - never CORS_ALLOW_ALL_ORIGINS.

CORS_ALLOWED_ORIGINS = env(
    "CORS_ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
).split(",")

CORS_ALLOW_CREDENTIALS = True
