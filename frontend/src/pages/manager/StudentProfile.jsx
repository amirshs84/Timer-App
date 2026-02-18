import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { managerAPI } from '../../api/client';

export default function StudentProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('daily');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
  }, [userId]);

  const fetchStudentData = async () => {
    try {
      const profileResponse = await managerAPI.getStudentProfile(userId);
      setProfile(profileResponse.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching student data:', error);
      alert('خطا در دریافت اطلاعات دانش‌آموز');
      navigate('/manager');
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    if (hours > 0) {
      return `${hours}h ${remainingMins}m`;
    }
    return `${mins}m`;
  };

  const formatSeconds = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 24) {
      return 'امروز';
    } else if (diffDays === 1) {
      return 'دیروز';
    } else if (diffDays < 7) {
      return `${diffDays} روز پیش`;
    } else {
      return date.toLocaleDateString('fa-IR');
    }
  };

  const getHeatmapData = () => {
    if (!profile?.heatmap_data) return [];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const heatmapDays = [];
    
    for (let i = 59; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      // Use local date string YYYY-MM-DD
      const dateStr = date.toLocaleDateString('en-CA');
      
      heatmapDays.push({
        date: dateStr,
        seconds: profile.heatmap_data[dateStr] || 0,
        dayOfWeek: date.getDay(),
      });
    }
    
    return heatmapDays;
  };

  const getHeatmapColor = (seconds) => {
    if (seconds === 0) return 'bg-gray-200';
    if (seconds < 1800) return 'bg-emerald-200';
    if (seconds < 3600) return 'bg-emerald-300';
    if (seconds < 7200) return 'bg-emerald-400';
    if (seconds < 14400) return 'bg-emerald-500';
    return 'bg-emerald-600';
  };

  const getFilteredSessions = () => {
    if (!profile?.recent_sessions) return [];
    
    const now = new Date();
    const sessions = profile.recent_sessions;

    if (activeTab === 'daily') {
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return sessions.filter(s => new Date(s.start_time) >= todayStart);
    } else if (activeTab === 'weekly') {
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return sessions.filter(s => new Date(s.start_time) >= weekStart);
    } else if (activeTab === 'monthly') {
      const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return sessions.filter(s => new Date(s.start_time) >= monthStart);
    }
    return sessions;
  };

  const getTotalStudyTime = (sessions) => {
    return sessions.reduce((total, session) => total + session.duration_seconds, 0);
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">در حال بارگذاری...</div>
      </div>
    );
  }

  const filteredSessions = getFilteredSessions();
  const totalTime = getTotalStudyTime(filteredSessions);
  const heatmapData = getHeatmapData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-600 p-6 sticky top-0 z-10 shadow-2xl">
        <button
          onClick={() => navigate('/manager')}
          className="mb-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors font-semibold"
        >
          ← بازگشت به پنل مدیریت
        </button>
        <h1 className="text-3xl font-bold mb-2">{profile.student_name}</h1>
        <p className="text-emerald-100 text-sm">
          {profile.phone_number}
          {profile.grade && ` • پایه ${profile.grade}`}
          {profile.olympiad_field && profile.olympiad_field !== 'none' && ` • ${profile.olympiad_field}`}
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-xl">
            <p className="text-blue-100 text-sm mb-2">امروز</p>
            <p className="text-4xl font-bold">{formatSeconds(profile.today)}</p>
            <p className="text-blue-100 text-xs mt-2">ساعت:دقیقه</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 shadow-xl">
            <p className="text-purple-100 text-sm mb-2">این هفته</p>
            <p className="text-4xl font-bold">{formatSeconds(profile.week)}</p>
            <p className="text-purple-100 text-xs mt-2">ساعت:دقیقه</p>
          </div>

          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-6 shadow-xl">
            <p className="text-pink-100 text-sm mb-2">این ماه</p>
            <p className="text-4xl font-bold">{formatSeconds(profile.month)}</p>
            <p className="text-pink-100 text-xs mt-2">ساعت:دقیقه</p>
          </div>
        </div>

        {/* Heatmap */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-emerald-400">تقویم فعالیت (۶۰ روز اخیر)</h2>
          <div className="overflow-x-auto">
            <div className="grid grid-cols-[repeat(60,minmax(12px,1fr))] gap-1 min-w-min">
              {heatmapData.map((day, idx) => (
                <div
                  key={idx}
                  className={`w-3 h-3 rounded-sm ${getHeatmapColor(day.seconds)}`}
                  title={`${day.date}: ${formatDuration(day.seconds)}`}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 text-xs text-gray-400">
            <span>کمتر</span>
            <div className="w-3 h-3 rounded-sm bg-gray-200" />
            <div className="w-3 h-3 rounded-sm bg-emerald-200" />
            <div className="w-3 h-3 rounded-sm bg-emerald-300" />
            <div className="w-3 h-3 rounded-sm bg-emerald-400" />
            <div className="w-3 h-3 rounded-sm bg-emerald-500" />
            <div className="w-3 h-3 rounded-sm bg-emerald-600" />
            <span>بیشتر</span>
          </div>
        </div>

        {/* Subject Breakdown */}
        {profile.subjects_breakdown && profile.subjects_breakdown.length > 0 && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-emerald-400">توزیع زمان بر اساس درس</h2>
            <div className="space-y-3">
              {profile.subjects_breakdown.map((subject, idx) => {
                const totalSeconds = profile.subjects_breakdown.reduce((sum, s) => sum + s.total_seconds, 0);
                const percentage = totalSeconds > 0 ? Math.round((subject.total_seconds / totalSeconds) * 100) : 0;
                
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold">{subject.name}</span>
                      <span className="text-gray-400">{formatDuration(subject.total_seconds)} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: subject.color
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {['daily', 'weekly', 'monthly'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {tab === 'daily' ? 'روزانه' : tab === 'weekly' ? 'هفتگی' : 'ماهانه'}
              </button>
            ))}
          </div>

          {/* Total Time */}
          <div className="mb-6 text-center">
            <p className="text-gray-400 text-sm mb-2">
              {activeTab === 'daily' ? 'مجموع امروز' : activeTab === 'weekly' ? 'مجموع هفته' : 'مجموع ماه'}
            </p>
            <p className="text-5xl font-bold text-emerald-400">{formatDuration(totalTime)}</p>
            <p className="text-gray-400 text-sm mt-1">{filteredSessions.length} جلسه</p>
          </div>

          {/* Sessions List */}
          {filteredSessions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-lg">هیچ جلسه‌ای در این بازه ثبت نشده است</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-gray-700/50 rounded-xl p-4 hover:bg-gray-700 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: session.subject_color }}
                      />
                      <div>
                        <p className="font-semibold">{session.subject}</p>
                        <p className="text-xs text-gray-400">{formatDate(session.start_time)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-400">{formatDuration(session.duration_seconds)}</p>
                    </div>
                  </div>
                  {session.description && (
                    <p className="text-sm text-gray-400 mt-2 mr-7">{session.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
