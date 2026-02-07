from django.db import models
from django.contrib.auth.models import User


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
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone_number = models.CharField(max_length=11, unique=True)
    full_name = models.CharField(max_length=200, blank=True)
    grade = models.CharField(max_length=20, choices=GRADE_CHOICES, blank=True)
    olympiad_field = models.CharField(max_length=20, choices=OLYMPIAD_CHOICES, blank=True)
    is_profile_complete = models.BooleanField(default=False)
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
