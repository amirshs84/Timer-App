import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { managerAPI, dataAPI } from '../../api/client';

export default function StudentProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [studySessions, setStudySessions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
  }, [userId]);

  const fetchStudentData = async () => {
    try {
      // Fetch student's profile data
      const profileResponse = await managerAPI.getStudentProfile(userId);
      setProfile(profileResponse.data);

      // Note: For full dashboard recreation, you would need to also fetch
      // sessions and subjects. For now, we show basic stats.
      setLoading(false);
    } catch (error) {
      console.error('Error fetching student data:', error);
      alert('خطا در دریافت اطلاعات دانش‌آموز');
      navigate('/manager');
    }
  };

  const formatSeconds = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-emerald-800">در حال بارگذاری...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header with Back Button */}
      <div className="bg-gradient-to-br from-emerald-800 to-emerald-900 text-white p-6 sticky top-0 z-10 shadow-lg">
        <button
          onClick={() => navigate('/manager')}
          className="mb-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
        >
          ← بازگشت
        </button>
        <h1 className="text-2xl font-bold mb-1">{profile.student_name}</h1>
        <p className="text-emerald-200 text-sm">
          {profile.grade && `پایه ${profile.grade}`}
          {profile.olympiad_field && ` • ${profile.olympiad_field}`}
        </p>
      </div>

      <div className="p-4 max-w-4xl mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-gray-500 text-sm mb-2">امروز</p>
            <p className="text-3xl font-bold text-emerald-800">
              {formatSeconds(profile.today)}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-gray-500 text-sm mb-2">این هفته</p>
            <p className="text-3xl font-bold text-blue-700">
              {formatSeconds(profile.week)}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-gray-500 text-sm mb-2">این ماه</p>
            <p className="text-3xl font-bold text-purple-700">
              {formatSeconds(profile.month)}
            </p>
          </div>
        </div>

        {/* Total Sessions */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">آمار کلی</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500 text-sm">تعداد کل جلسات</p>
              <p className="text-2xl font-bold text-emerald-800">{profile.total_sessions}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">شماره تماس</p>
              <p className="text-lg font-mono text-gray-700">{profile.phone_number}</p>
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <p className="text-blue-800 text-sm">
            💡 برای مشاهده نمودارها و جزئیات بیشتر، از حساب کاربری خود دانش‌آموز استفاده کنید
          </p>
        </div>
      </div>
    </div>
  );
}
