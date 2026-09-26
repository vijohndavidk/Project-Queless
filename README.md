# QueueLess – Smart Digital Queue & Appointment Management System

A full-stack digital queue and appointment system built with **Django + Django
REST Framework + MySQL** on the backend and **React + Vite + Axios** on the
frontend. Built as a learning/portfolio project — kept deliberately simple
and readable rather than over-engineered.

---

## What's included

- **3 roles**: Customer, Staff, Admin — each with their own dashboard and permissions
- **Digital queue system**: join a queue, get a sequential token (Q001, Q002...),
  see your live position and estimated wait time
- **Appointments**: book, view, and cancel appointments for any service
- **Staff console**: live queue view, call next / complete / skip / recall a token
- **Admin panel**: manage services, promote customers to staff, assign counters,
  view live stats and per-service reports
- **Full REST API** built with Django REST Framework, token authentication
- **15 automated backend tests** covering registration, login, permissions,
  token generation, wait-time math, and the staff call→complete flow

This was built and **verified end-to-end** — every workflow below was
actually run (customer join → staff call/complete → admin dashboard update),
not just written and assumed to work.

---

## Technology stack

| Layer | Tech |
|---|---|
| Backend | Python, Django 5.2, Django REST Framework |
| Database | MySQL (via PyMySQL driver) |
| Frontend | React 19, Vite, JavaScript (no TypeScript) |
| Frontend libs | React Router, Axios, Context API |
| Auth | DRF Token Authentication |

---

## Folder structure

```
QueueLess/
├── backend/
│   ├── manage.py
│   ├── config/            # settings, urls, PyMySQL shim
│   ├── accounts/          # User, Profile, Staff models + auth APIs + admin dashboard APIs
│   │   └── management/commands/seed_data.py   # sample data generator
│   ├── services/          # Service model + CRUD API
│   ├── queue_app/         # QueueToken, QueueHistory + token/wait-time business logic
│   ├── appointments/      # Appointment model + CRUD API
│   ├── requirements.txt
│   ├── .env.example
│   └── .gitignore
│
├── frontend/
│   ├── src/
│   │   ├── components/    # Navbar, Sidebar, DashboardLayout, ProtectedRoute, etc.
│   │   ├── context/       # AuthContext (login/logout/register state)
│   │   ├── services/api.js  # Centralized Axios instance
│   │   ├── pages/
│   │   │   ├── (public)   # Home, Services, About, Login, Register
│   │   │   ├── customer/  # Dashboard, JoinQueue, QueueStatus, BookAppointment, Appointments, Profile
│   │   │   ├── staff/     # Dashboard, StaffQueue, StaffAppointments, QueueHistory
│   │   │   └── admin/     # Dashboard, ManageUsers, ManageStaff, ManageServices, ManageCounters, Reports
│   │   ├── App.jsx        # All routes + role-based protection
│   │   └── main.jsx
│   └── package.json
│
└── README.md
```

---

## Database models

| Model | Key fields | Relationship |
|---|---|---|
| **User** (custom) | username, email, role, password | — |
| **Profile** | phone, address | 1-to-1 with User |
| **Staff** | department, counter_number, status | 1-to-1 with User |
| **Service** | service_name, average_time, status | — |
| **Appointment** | appointment_date, appointment_time, status | FK to User, FK to Service |
| **QueueToken** | token_number, queue_date, status, joined_at/called_at/completed_at | FK to User, FK to Service |
| **QueueHistory** | action, timestamp | FK to QueueToken, FK to User (staff) |

**Queue token logic** (`queue_app/logic.py`): tokens are numbered sequentially
per (service, date). Position is calculated by counting active tokens with a
smaller number. Wait time = `people_ahead × average_service_time` — plain
Python, no ML, exactly as specified.

---

## REST API reference

**Auth**
```
POST /api/register/
POST /api/login/
POST /api/logout/
GET  /api/profile/
PUT  /api/profile/
```

**Services**
```
GET    /api/services/
POST   /api/services/          (admin only)
PUT    /api/services/<id>/     (admin only)
DELETE /api/services/<id>/     (admin only)
```

**Queue (customer)**
```
POST /api/queue/join/          {"service": <id>}
GET  /api/queue/status/
POST /api/queue/cancel/        {"token": <id>}
```

**Queue (staff)**
```
GET  /api/staff/queue/?service=<id>
POST /api/staff/next-token/     {"service": <id>}
POST /api/staff/complete-token/ {"token": <id>}
POST /api/staff/skip-token/     {"token": <id>}
POST /api/staff/recall-token/   {"token": <id>}
GET  /api/staff/history/
```

**Appointments**
```
GET    /api/appointments/
POST   /api/appointments/
PATCH  /api/appointments/<id>/   (customers: cancel only; staff/admin: any field)
DELETE /api/appointments/<id>/
```

**Admin**
```
GET /api/admin/dashboard/
GET /api/admin/users/
GET /api/admin/staff/
POST /api/admin/staff/          (promote a customer to staff)
PATCH/DELETE /api/admin/staff/<id>/
GET /api/admin/statistics/
```

All endpoints except register/login/services-GET require the header:
`Authorization: Token <your-token>`

---

## Prerequisites

- Python 3.10+
- Node.js 18+ and npm
- MySQL Server running locally (or accessible over network)

---

## Backend setup

```bash
cd backend
python -m venv venv

# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

Create the database:

```sql
CREATE DATABASE queueless_db CHARACTER SET utf8mb4;
```

Set up your environment file:

```bash
cp .env.example .env
```

Edit `.env` with your real MySQL credentials:

```
SECRET_KEY=<generate one, see below>
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost

DB_NAME=queueless_db
DB_USER=root
DB_PASSWORD=<your mysql password>
DB_HOST=localhost
DB_PORT=3306

CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Generate a real `SECRET_KEY`:

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Run migrations and create sample data:

```bash
python manage.py migrate
python manage.py seed_data
python manage.py createsuperuser   # optional - seed_data already makes an admin account
python manage.py runserver
```

Django is now running at **http://127.0.0.1:8000/**.

Run the test suite:

```bash
python manage.py test
```

You should see `Ran 15 tests ... OK`.

---

## Frontend setup

In a **new terminal**:

```bash
cd frontend
npm install
npm run dev
```

React is now running at **http://localhost:5173/**.

---

## Example credentials (from `seed_data`)

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `admin12345` |
| Staff | `staff1` or `staff2` | `staff12345` |
| Customer | `customer1` through `customer5` | `customer123` |

---

## How to try it out

1. Log in as `customer1` → Dashboard → **Join Queue** → pick a service → get a token.
2. Go to **Queue Status** to see your position and estimated wait — it auto-refreshes every 15 seconds.
3. Log out, log in as `staff1` or `staff2` → **Live Queue** → pick the same service → **Call Next Customer** → **Mark Completed**.
4. Log in as `admin` → **Dashboard** to see the live stats update, or **Services**/**Staff**/**Counters** to manage the system.

---

## Environment variables

| Variable | Purpose |
|---|---|
| `SECRET_KEY` | Django's cryptographic signing key — never share or commit |
| `DEBUG` | `True` locally, must be `False` in production |
| `ALLOWED_HOSTS` | Comma-separated hostnames Django will serve |
| `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` | MySQL connection details |
| `CORS_ALLOWED_ORIGINS` | Comma-separated origins allowed to call the API |

`.env` is git-ignored. Only `.env.example` is committed.

---

## Notable design decisions (useful for interview explanations)

- **`queue_app` not `queue`** — Python has a built-in `queue` module; naming
  the Django app `queue` would risk a confusing import collision.
- **Custom `User` model with a `role` field** instead of separate tables per
  role — simpler joins, one login system, and `request.user.role` is all
  permission classes need to check.
- **PyMySQL instead of mysqlclient** — a pure-Python driver, so there's no C
  compiler or MySQL dev headers needed to get `pip install` working, which
  matters a lot for a project other people will clone and run.
- **Staff aren't tied to one Service in the data model** — the spec doesn't
  ask for that relationship, so the staff console instead lets a staff member
  pick which service's queue they're currently working from a dropdown. This
  keeps the schema simple (Staff only needs department + counter) while still
  supporting the same workflow.
- **PATCH vs PUT for partial updates** — cancelling an appointment or
  reassigning a counter only sends one field, so those actions use PATCH
  (partial update) rather than PUT (full replace), which is the correct
  REST semantic and avoids "missing required field" validation errors.

---

## Future enhancements

- WebSockets for live queue updates instead of polling
- SMS/email notifications when a customer's token is called
- Docker Compose for one-command setup
- Analytics charts on the admin Reports page

---

## Author

Add your name, GitHub, and portfolio link here.
