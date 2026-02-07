from django.urls import path
from .views import (
    request_otp,
    phone_login,
    UserProfileView,
    SubjectListView,
    StudySessionListCreateView,
    DashboardStatsView,
    CreateTicketView
)

urlpatterns = [
    # Auth & Profile
    path('auth/request-otp/', request_otp, name='request_otp'),
    path('auth/login/', phone_login, name='phone_login'),
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    
    # Study Data
    path('subjects/', SubjectListView.as_view(), name='subject_list'),
    path('sessions/', StudySessionListCreateView.as_view(), name='study_sessions'),
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard_stats'),
    
    # Support
    path('tickets/', CreateTicketView.as_view(), name='create_ticket'),
]
