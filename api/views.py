from rest_framework import status, generics, views
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.utils import timezone
from django.db.models import Sum
from datetime import timedelta
from .models import UserProfile, Subject, StudySession, ConsultantTicket
from .serializers import (
    PhoneLoginSerializer,
    UserProfileSerializer,
    SubjectSerializer,
    StudySessionSerializer,
    ConsultantTicketSerializer
)


@api_view(['POST'])
@permission_classes([AllowAny])
def request_otp(request):
    """
    Request OTP for phone number.
    In production, this would send SMS.
    For dev, it just returns success.
    """
    phone_number = request.data.get('phone_number')
    if not phone_number:
        return Response({'error': 'Phone number is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # In a real app, generate random code and send SMS here
    # code = generate_random_code()
    # send_sms(phone_number, code)
    # cache.set(f"otp_{phone_number}", code, timeout=300)
    
    return Response({'message': 'OTP sent', 'dev_code': '12345'})


@api_view(['POST'])
@permission_classes([AllowAny])
def phone_login(request):
    serializer = PhoneLoginSerializer(data=request.data)
    if serializer.is_valid():
        phone_number = serializer.validated_data['phone_number']
        otp = serializer.validated_data['otp']
        
        # Simple OTP check
        if otp != '12345':
            return Response(
                {'error': 'Invalid OTP'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get or create User and UserProfile
        user, created = User.objects.get_or_create(username=phone_number)
        profile, _ = UserProfile.objects.get_or_create(
            user=user,
            defaults={'phone_number': phone_number}
        )
        
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'profile': UserProfileSerializer(profile).data,
            'is_new_user': created or not profile.is_profile_complete
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Get or update user profile"""
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user.profile

    def perform_update(self, serializer):
        serializer.save(is_profile_complete=True)


class SubjectListView(generics.ListCreateAPIView):
    """List all subjects or create new one"""
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated]


class StudySessionListCreateView(generics.ListCreateAPIView):
    """List recent sessions or log a new one"""
    serializer_class = StudySessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return StudySession.objects.filter(user=self.request.user).order_by('-start_time')

    def perform_create(self, serializer):
        # Check if subject exists by name, or create it
        subject_data = self.request.data.get('subject_name')
        subject_color = self.request.data.get('subject_color', '#10b981')
        
        if subject_data:
            subject, _ = Subject.objects.get_or_create(
                name=subject_data,
                defaults={'color_code': subject_color}
            )
            serializer.save(user=self.request.user, subject=subject)
        else:
            # Fallback if subject ID provided
            serializer.save(user=self.request.user)


class DashboardStatsView(views.APIView):
    """Get aggregated stats for dashboard"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        now = timezone.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_start = now - timedelta(days=7)
        month_start = now - timedelta(days=30)

        # Helper to sum duration
        def get_duration(start_date):
            return StudySession.objects.filter(
                user=user,
                start_time__gte=start_date
            ).aggregate(total=Sum('duration_seconds'))['total'] or 0

        stats = {
            'today': get_duration(today_start),
            'week': get_duration(week_start),
            'month': get_duration(month_start),
            'total_sessions': StudySession.objects.filter(user=user).count()
        }
        
        return Response(stats)


class CreateTicketView(generics.CreateAPIView):
    serializer_class = ConsultantTicketSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

