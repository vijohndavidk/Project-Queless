from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import Profile, Staff, User


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ["phone", "address", "profile_image"]


class UserSerializer(serializers.ModelSerializer):
    """Read-only representation of a user, used in nested responses."""

    profile = ProfileSerializer(read_only=True)
    staff_profile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "email", "role", "first_name", "last_name", "date_joined", "profile", "staff_profile"]

    def get_staff_profile(self, obj):
        staff = getattr(obj, "staff_profile", None)
        if not staff:
            return None
        return {"department": staff.department, "counter_number": staff.counter_number, "status": staff.status}


class RegisterSerializer(serializers.ModelSerializer):
    """
    Handles new customer sign-up. Staff/Admin accounts are created via
    Django admin instead, since those roles shouldn't be self-service.
    """

    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, label="Confirm password")
    phone = serializers.CharField(write_only=True, required=False, allow_blank=True)
    address = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ["username", "email", "first_name", "last_name", "password", "password2", "phone", "address"]

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password2": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        phone = validated_data.pop("phone", "")
        address = validated_data.pop("address", "")
        validated_data.pop("password2")
        password = validated_data.pop("password")

        user = User(role=User.Role.CUSTOMER, **validated_data)
        user.set_password(password)
        user.save()

        Profile.objects.create(user=user, phone=phone, address=address)
        return user


class StaffSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.CharField(source="user.email", read_only=True)

    class Meta:
        model = Staff
        fields = ["id", "user", "username", "email", "department", "counter_number", "status"]
        extra_kwargs = {"user": {"write_only": True}}
