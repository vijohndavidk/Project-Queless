from django.urls import path

from . import views

urlpatterns = [
    path("register/", views.RegisterView.as_view(), name="register"),
    path("login/", views.LoginView.as_view(), name="login"),
    path("logout/", views.LogoutView.as_view(), name="logout"),
    path("profile/", views.ProfileView.as_view(), name="profile"),

    path("admin/users/", views.AdminUserListView.as_view(), name="admin-users"),
    path("admin/staff/", views.AdminStaffListCreateView.as_view(), name="admin-staff"),
    path("admin/staff/<int:pk>/", views.AdminStaffDetailView.as_view(), name="admin-staff-detail"),
    path("admin/dashboard/", views.AdminDashboardView.as_view(), name="admin-dashboard"),
    path("admin/statistics/", views.AdminStatisticsView.as_view(), name="admin-statistics"),
]
