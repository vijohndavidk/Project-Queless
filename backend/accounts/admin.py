from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Profile, Staff


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ("username", "email", "role", "is_active", "date_joined")
    list_filter = ("role", "is_active")
    fieldsets = UserAdmin.fieldsets + (("Role", {"fields": ("role",)}),)
    add_fieldsets = UserAdmin.add_fieldsets + (("Role", {"fields": ("role", "email")}),)


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "phone", "address", "created_at")
    search_fields = ("user__username", "phone")


@admin.register(Staff)
class StaffAdmin(admin.ModelAdmin):
    list_display = ("user", "department", "counter_number", "status")
    list_filter = ("department", "status")
