from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, Subject, StudySession, ConsultantTicket


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['phone_number', 'full_name', 'grade', 'olympiad_field', 'is_profile_complete']
        read_only_fields = ['phone_number']


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'name', 'color_code']


class StudySessionSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    subject_color = serializers.CharField(source='subject.color_code', read_only=True)

    class Meta:
        model = StudySession
        fields = [
            'id',
            'subject',
            'subject_name',
            'subject_color',
            'description',
            'start_time',
            'end_time',
            'duration_seconds',
            'is_valid'
        ]
        read_only_fields = ['id', 'duration_seconds']

    def create(self, validated_data):
        # Calculate duration automatically
        start = validated_data.get('start_time')
        end = validated_data.get('end_time')
        if start and end:
            duration = (end - start).total_seconds()
            validated_data['duration_seconds'] = int(duration)
        return super().create(validated_data)


class ConsultantTicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConsultantTicket
        fields = [
            'id',
            'message',
            'request_call',
            'created_at',
            'is_resolved'
        ]
        read_only_fields = ['created_at', 'is_resolved']


class PhoneLoginSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=15)
    otp = serializers.CharField(max_length=6)

