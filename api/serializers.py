from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, Subject, StudySession, ConsultantTicket, School


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['phone_number', 'full_name', 'grade', 'olympiad_field', 'role', 'is_superadmin', 'is_profile_complete']
        read_only_fields = ['phone_number', 'role', 'is_superadmin']


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'name', 'color_code']


class StudySessionSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    subject_color = serializers.CharField(source='subject.color_code', read_only=True)
    subject = serializers.PrimaryKeyRelatedField(read_only=True)

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


# Manager Panel Serializers
class ManagerStudentListSerializer(serializers.ModelSerializer):
    """Serializer for student list in manager panel"""
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    today_total = serializers.IntegerField(read_only=True)
    week_total = serializers.IntegerField(read_only=True)
    trend = serializers.CharField(read_only=True)
    trend_percent = serializers.FloatField(read_only=True)
    last_activity = serializers.DateTimeField(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = [
            'user_id',
            'full_name',
            'phone_number',
            'grade',
            'olympiad_field',
            'today_total',
            'week_total',
            'trend',
            'trend_percent',
            'last_activity'
        ]


class ManagerDashboardKPISerializer(serializers.Serializer):
    """Serializer for KPI cards in manager dashboard"""
    avg_study_today = serializers.CharField()
    avg_study_today_seconds = serializers.IntegerField()
    change_percent = serializers.FloatField()
    top_student = serializers.DictField()
    absent_count = serializers.IntegerField()
    active_now = serializers.IntegerField()
    total_students = serializers.IntegerField()


# SuperAdmin Serializers
class SchoolSerializer(serializers.ModelSerializer):
    """Serializer for School model"""
    member_count = serializers.SerializerMethodField()
    manager_name = serializers.SerializerMethodField()
    
    class Meta:
        model = School
        fields = [
            'id',
            'name',
            'invitation_code',
            'normal_study_threshold',
            'is_active',
            'member_count',
            'manager_name',
            'created_at'
        ]
        read_only_fields = ['invitation_code', 'created_at']
    
    def get_member_count(self, obj):
        return obj.members.filter(role='student').count()
    
    def get_manager_name(self, obj):
        manager = obj.members.filter(role='manager').first()
        return manager.full_name if manager else 'تعیین نشده'


class AssignManagerSerializer(serializers.Serializer):
    """Serializer for assigning a manager to a school"""
    phone_number = serializers.CharField(max_length=11)
    
    def validate_phone_number(self, value):
        if not value.startswith('09') or len(value) != 11:
            raise serializers.ValidationError('شماره تلفن معتبر نیست')
        return value

