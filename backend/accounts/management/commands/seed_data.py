"""
Management command that populates the database with realistic sample data
so the app can be demoed/tested immediately, without manual data entry.

Run with:  python manage.py seed_data
"""
from datetime import date, time, timedelta

from django.contrib.auth.hashers import make_password
from django.core.management.base import BaseCommand
from django.utils import timezone

from accounts.models import Profile, Staff, User
from appointments.models import Appointment
from queue_app.logic import generate_token_number
from queue_app.models import QueueToken
from services.models import Service


class Command(BaseCommand):
    help = "Creates sample services, customers, staff, and queue/appointment data."

    def handle(self, *args, **options):
        self.stdout.write("Seeding QueueLess sample data...")

        # --- Admin account -------------------------------------------------
        admin, created = User.objects.get_or_create(
            username="admin",
            defaults={
                "email": "admin@queueless.test",
                "role": User.Role.ADMIN,
                "is_staff": True,
                "is_superuser": True,
                "password": make_password("admin12345"),
            },
        )
        if created:
            self.stdout.write(self.style.SUCCESS("Created admin user (admin / admin12345)"))

        # --- 5 services ------------------------------------------------------
        service_defs = [
            ("General Consultation", "Walk-in consultation with a generalist.", 6),
            ("Passport Renewal", "Renew an existing passport.", 15),
            ("Bill Payment", "Pay utility or service bills in person.", 4),
            ("Document Verification", "Verify and stamp official documents.", 8),
            ("New Account Setup", "Open a new customer account.", 12),
        ]
        services = []
        for name, desc, avg_time in service_defs:
            svc, _ = Service.objects.get_or_create(
                service_name=name, defaults={"description": desc, "average_time": avg_time}
            )
            services.append(svc)
        self.stdout.write(self.style.SUCCESS(f"Ensured {len(services)} services exist."))

        # --- 5 customers -----------------------------------------------------
        customers = []
        for i in range(1, 6):
            username = f"customer{i}"
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    "email": f"{username}@queueless.test",
                    "role": User.Role.CUSTOMER,
                    "first_name": f"Customer{i}",
                    "password": make_password("customer123"),
                },
            )
            if created:
                Profile.objects.create(user=user, phone=f"90000000{i}", address=f"{i} Main Street")
            customers.append(user)
        self.stdout.write(self.style.SUCCESS("Ensured 5 customer accounts exist (customer1..5 / customer123)."))

        # --- 2 staff + 2 counters --------------------------------------------
        staff_defs = [("staff1", "Front Desk", 1), ("staff2", "Documents", 2)]
        staff_users = []
        for username, department, counter in staff_defs:
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    "email": f"{username}@queueless.test",
                    "role": User.Role.STAFF,
                    "is_staff": True,
                    "password": make_password("staff12345"),
                },
            )
            Staff.objects.get_or_create(
                user=user, defaults={"department": department, "counter_number": counter, "status": "active"}
            )
            staff_users.append(user)
        self.stdout.write(self.style.SUCCESS("Ensured 2 staff accounts + counters exist (staff1/staff2 / staff12345)."))

        # --- Several queue tokens for today -----------------------------------
        today = timezone.localdate()
        created_tokens = 0
        for i, customer in enumerate(customers):
            service = services[i % len(services)]
            if QueueToken.objects.filter(user=customer, service=service, queue_date=today).exists():
                continue
            token_number = generate_token_number(service, today)
            QueueToken.objects.create(
                user=customer, service=service, token_number=token_number, queue_date=today
            )
            created_tokens += 1
        self.stdout.write(self.style.SUCCESS(f"Created {created_tokens} queue tokens for today."))

        # --- Several appointments ----------------------------------------------
        created_appts = 0
        for i, customer in enumerate(customers):
            service = services[(i + 1) % len(services)]
            appt_date = date.today() + timedelta(days=i)
            if Appointment.objects.filter(user=customer, service=service, appointment_date=appt_date).exists():
                continue
            Appointment.objects.create(
                user=customer,
                service=service,
                appointment_date=appt_date,
                appointment_time=time(hour=10 + i, minute=0),
                status=Appointment.Status.CONFIRMED,
            )
            created_appts += 1
        self.stdout.write(self.style.SUCCESS(f"Created {created_appts} appointments."))

        self.stdout.write(self.style.SUCCESS("\nSample data ready. Login with:"))
        self.stdout.write("  Admin:    admin / admin12345")
        self.stdout.write("  Staff:    staff1 / staff12345  (or staff2)")
        self.stdout.write("  Customer: customer1 / customer123  (through customer5)")
