from django.db import models
from django.contrib.auth.models import User
import secrets


class School(models.Model):
    """مدل مدرسه برای سیستم چندمدرسه‌ای"""
    name = models.CharField(max_length=200, verbose_name='نام مدرسه')
    invitation_code = models.CharField(
        max_length=8, 
        unique=True, 
        verbose_name='کد دعوت',
        help_text='کد منحصربه‌فرد برای عضویت دانش‌آموزان'
    )
    normal_study_threshold = models.IntegerField(
        default=21600,  # 6 hours in seconds
        verbose_name='حد نرمال مطالعه (ثانیه)',
        help_text='زمان مطالعه نرمال روزانه به ثانیه'
    )
    is_active = models.BooleanField(default=True, verbose_name='فعال')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def save(self, *args, **kwargs):
        if not self.invitation_code:
            # Generate unique 8-character invitation code
            self.invitation_code = self.generate_invitation_code()
        super().save(*args, **kwargs)
    
    @staticmethod
    def generate_invitation_code():
        """تولید کد دعوت منحصربه‌فرد 8 کاراکتری"""
        while True:
            code = secrets.token_urlsafe(6)[:8].upper()
            if not School.objects.filter(invitation_code=code).exists():
                return code
    
    def __str__(self):
        return f"{self.name} ({self.invitation_code})"
    
    class Meta:
        verbose_name = 'مدرسه'
        verbose_name_plural = 'مدرسه‌ها'
        ordering = ['-created_at']


class UserProfile(models.Model):
    """پروفایل کاربر با اطلاعات تکمیلی"""
    GRADE_CHOICES = [
        ('7', 'هفتم'),
        ('8', 'هشتم'),
        ('9', 'نهم'),
        ('10', 'دهم'),
        ('11', 'یازدهم'),
        ('12', 'دوازدهم'),
        ('graduate', 'فارغ‌التحصیل'),
    ]
    
    OLYMPIAD_CHOICES = [
        ('math', 'ریاضی'),
        ('physics', 'فیزیک'),
        ('chemistry', 'شیمی'),
        ('biology', 'زیست‌شناسی'),
        ('computer', 'کامپیوتر'),
        ('astronomy', 'نجوم'),
        ('none', 'ندارم'),
    ]
    
    ROLE_CHOICES = [
        ('student', 'دانش‌آموز'),
        ('manager', 'مدیر'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    school = models.ForeignKey(
        School, 
        on_delete=models.CASCADE, 
        related_name='members',
        null=True,
        blank=True,
        verbose_name='مدرسه'
    )
    phone_number = models.CharField(max_length=11, unique=True)
    full_name = models.CharField(max_length=200, blank=True)
    grade = models.CharField(max_length=20, choices=GRADE_CHOICES, blank=True)
    olympiad_field = models.CharField(max_length=20, choices=OLYMPIAD_CHOICES, blank=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')
    is_superadmin = models.BooleanField(default=False, verbose_name='سوپرادمین')
    is_profile_complete = models.BooleanField(default=False)
    is_password_set = models.BooleanField(default=False, verbose_name='رمز عبور تنظیم شده')
    is_studying = models.BooleanField(default=False, verbose_name='در حال مطالعه')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.full_name or self.phone_number}"
    
    class Meta:
        verbose_name = 'پروفایل کاربر'
        verbose_name_plural = 'پروفایل‌های کاربر'


class Subject(models.Model):
    name = models.CharField(max_length=100)
    color_code = models.CharField(max_length=7)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subjects', null=True, blank=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']


class StudySession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='study_sessions')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='sessions')
    description = models.TextField(blank=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    duration_seconds = models.IntegerField(default=0)
    is_valid = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.username} - {self.subject.name} - {self.start_time}"

    class Meta:
        ordering = ['-start_time']


class ConsultantTicket(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tickets')
    message = models.TextField()
    request_call = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    is_resolved = models.BooleanField(default=False)

    def __str__(self):
        return f"Ticket #{self.id} - {self.user.username}"

    class Meta:
        ordering = ['-created_at']
