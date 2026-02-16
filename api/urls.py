from django.urls import path
from .views import (
    request_otp,
    phone_login,
    UserProfileView,
    SubjectListView,
    StudySessionListCreateView,
    DashboardStatsView,
    CreateTicketView,
    # Manager Panel Views
    ManagerDashboardKPIView,
    ManagerStudentListView,
    ManagerStudentProfileView,
    ManagerExportExcelView,
    ManagerStudentReportPDFView
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
    
    # Manager Panel
    path('manager/dashboard/', ManagerDashboardKPIView.as_view(), name='manager_dashboard_kpi'),
    path('manager/students/', ManagerStudentListView.as_view(), name='manager_student_list'),
    path('manager/students/<int:user_id>/profile/', ManagerStudentProfileView.as_view(), name='manager_student_profile'),
    path('manager/export/excel/', ManagerExportExcelView.as_view(), name='manager_export_excel'),
    path('manager/students/<int:user_id>/report/pdf/', ManagerStudentReportPDFView.as_view(), name='manager_student_pdf'),
]
