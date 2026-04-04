import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { dataAPI } from '../api/client';
import MobileHeader from '../components/MobileHeader';
import { formatRelativeDateIran, getStartOfDayIran, getIranDate } from '../utils/dateUtils';

const Dashboard = () => {
  const navigate = useNavigate();
  const [studySessions, setStudySessions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [activeTab, setActiveTab] = useState('weekly'); // daily, weekly, monthly
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const isLoggedIn = localStorage.getItem('isLoggedIn');
      if (!isLoggedIn) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        // Fetch sessions and subjects in parallel
        const [sessionsRes, subjectsRes] = await Promise.all([
          dataAPI.getSessions(),
          dataAPI.getSubjects()
        ]);

        setStudySessions(sessionsRes.data);
        setCourses(subjectsRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    if (hours > 0) {
      return `${hours}h ${remainingMins}m`;
    }
    return `${mins}m`;
  };

  const formatDate = (dateString) => {
    return formatRelativeDateIran(dateString);
  };

  const getTotalStudyTime = (sessions = studySessions) => {
    return sessions.reduce((total, session) => total + session.duration_seconds, 0);
  };

  const getSubjectData = (sessions = studySessions) => {
    const subjectTotals = {};
    sessions.forEach((session) => {
      if (subjectTotals[session.subject_name]) {
        subjectTotals[session.subject_name] += session.duration_seconds;
      } else {
        subjectTotals[session.subject_name] = session.duration_seconds;
      }
    });

    const total = getTotalStudyTime(sessions);
    return Object.entries(subjectTotals).map(([subject, duration]) => ({
      subject,
      duration,
      percentage: total > 0 ? Math.round((duration / total) * 100) : 0,
    }));
  };

  const getSubjectColor = (subjectName) => {
    // We try to match by name since backend sends subject_name in session
    const course = courses.find((c) => c.name === subjectName);
    return course?.color_code || '#3b82f6';
  };

  const getHeatmapData = () => {
    const today = getStartOfDayIran();
    const heatmapDays = [];
    
    // Generate last 90 days
    for (let i = 89; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Use local date string for comparison to avoid timezone issues
      const dateStr = date.toLocaleDateString('en-CA'); // YYYY-MM-DD in local time
      
      const daySessions = studySessions.filter(session => {
        const sessionDate = getIranDate(session.start_time);
        const sessionDateStr = sessionDate.toLocaleDateString('en-CA');
        return sessionDateStr === dateStr;
      });
      
      const totalMinutes = Math.floor(getTotalStudyTime(daySessions) / 60);
      
      const dayOfWeek = date.getDay(); // 0=Sunday
      const persianDayOfWeek = (dayOfWeek + 1) % 7; // 0=Saturday
      
      heatmapDays.push({
        date: dateStr,
        dayOfWeek: persianDayOfWeek,
        totalMinutes: totalMinutes,
        sessions: daySessions.length,
      });
    }
    
    return heatmapDays;
  };

  const getHeatmapColor = (minutes) => {
    if (minutes === 0) return 'bg-gray-800';
    if (minutes < 30) return 'bg-emerald-900/50';
    if (minutes < 60) return 'bg-emerald-700/70';
    if (minutes < 120) return 'bg-emerald-500';
    return 'bg-emerald-400';
  };

  const getFilteredSessions = () => {
    if (activeTab === 'daily') {
      const today = getStartOfDayIran();
      return studySessions.filter(session => {
        const sessionDate = getIranDate(session.start_time);
        return sessionDate >= today;
      });
    } else if (activeTab === 'weekly') {
      const weekAgo = getStartOfDayIran();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return studySessions.filter(session => getIranDate(session.start_time) >= weekAgo);
    } else if (activeTab === 'monthly') {
      const monthAgo = getStartOfDayIran();
      monthAgo.setDate(monthAgo.getDate() - 30);
      return studySessions.filter(session => getIranDate(session.start_time) >= monthAgo);
    }
    
    return studySessions;
  };

  const filteredSessions = getFilteredSessions();
  const hasData = studySessions.length > 0;
  const heatmapData = getHeatmapData();

  if (loading) {
    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 pb-28 md:pb-32">
      <MobileHeader/>
      	<div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent pb-2">
              پیشرفت
            </h1>
          </div>
          <button
            onClick={() => navigate('/timer')}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg hover:from-emerald-600 hover:to-teal-700 transition font-semibold shadow-lg shadow-emerald-500/30"
          >
            شروع پیشروی
          </button>
        </div>

        {/* Empty State */}
        {!hasData && (
          <div className="text-center py-16">
            <div className="text-6xl md:text-8xl mb-6">📊</div>
            <h2 className="text-2xl md:text-3xl font-semibold mb-3 text-gray-300">هنوز داده‌ای برای نمایش وجود ندارد</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              اولین پیشروی خود را شروع کنید تا پیشرفت و آمار خود را در اینجا مشاهده کنید!
            </p>
            <button
              onClick={() => navigate('/timer')}
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg 
                       hover:from-emerald-600 hover:to-teal-700 transition font-semibold text-lg shadow-lg shadow-emerald-500/30"
            >
              همین حالا پیشروی را شروع کنید
            </button>
          </div>
        )}

        {/* Dashboard Content */}
        {hasData && (
          <>
            {/* Time Period Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto">
              <button
                onClick={() => setActiveTab('daily')}
                className={`px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap ${
                  activeTab === 'daily'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                روزانه
              </button>
              <button
                onClick={() => setActiveTab('weekly')}
                className={`px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap ${
                  activeTab === 'weekly'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                هفتگی
              </button>
              <button
                onClick={() => setActiveTab('monthly')}
                className={`px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap ${
                  activeTab === 'monthly'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                ماهانه
              </button>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                <div className="text-gray-400 text-sm mb-2">مجموع زمان پیشروی</div>
                <div className="text-3xl font-bold text-blue-400">{formatDuration(getTotalStudyTime(filteredSessions))}</div>
              </div>
              <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                <div className="text-gray-400 text-sm mb-2">جلسات تکمیل شده</div>
                <div className="text-3xl font-bold text-purple-400">{filteredSessions.length}</div>
              </div>
              <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                <div className="text-gray-400 text-sm mb-2">موضوعات پیشروی شده</div>
                <div className="text-3xl font-bold text-green-400">{getSubjectData(filteredSessions).length}</div>
              </div>
            </div>

            {/* Heatmap */}
            <div className="bg-gray-900 p-4 md:p-6 rounded-xl border border-gray-800 mb-8">
              {/* Header */}
              <div className="flex flex-col md:flex-row items-center md:justify-between mb-6">
                <h2 className="text-xl md:text-2xl font-semibold text-gray-200 text-center md:text-right w-full md:w-auto">
                  فعالیت ۹۰ روز گذشته
                </h2>
                {/* Desktop Legend */}
                <div className="hidden md:flex items-center gap-2 text-xs text-gray-400">
                  <span>کمتر</span>
                  <div className="flex gap-1">
                    <div className="w-4 h-4 bg-gray-800 rounded-sm"></div>
                    <div className="w-4 h-4 bg-emerald-900/50 rounded-sm"></div>
                    <div className="w-4 h-4 bg-emerald-700/70 rounded-sm"></div>
                    <div className="w-4 h-4 bg-emerald-500 rounded-sm"></div>
                    <div className="w-4 h-4 bg-emerald-400 rounded-sm"></div>
                  </div>
                  <span>بیشتر</span>
                </div>
              </div>

              {/* Table Container */}
              <div className="flex justify-center w-full">
                <div className="inline-flex gap-2">
                  <div className="flex flex-col justify-around text-xs text-gray-500 py-4 pl-2 h-[140px]">
                    <div>شنبه</div>
                    <div>دوشنبه</div>
                    <div>چهارشنبه</div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex gap-1 text-xs text-gray-500 pr-1 h-5 mb-1">
                      {(() => {
                        const months = [];
                        let lastMonth = '';
                        const weeksData = [];
                        for (let i = 0; i < heatmapData.length; i += 7) {
                          weeksData.push(heatmapData.slice(i, i + 7));
                        }
                        weeksData.forEach((week, weekIndex) => {
                          if (week.length > 0) {
                            const date = new Date(week[0].date + 'T12:00:00');
                            const monthName = date.toLocaleDateString('fa-IR', { month: 'short' });
                            if (monthName !== lastMonth) {
                              months.push(
                                <div key={weekIndex} style={{ gridColumn: weekIndex + 1, width: '40px' }}>
                                  {monthName}
                                </div>
                              );
                              lastMonth = monthName;
                            }
                          }
                        });
                        return <div className="flex gap-[14px]">{months}</div>;
                      })()}
                    </div>

                    <div className="inline-grid gap-1" style={{ 
                      gridTemplateRows: 'repeat(7, 16px)',
                      gridAutoFlow: 'column',
                    }}>
                      {heatmapData.map((day, idx) => (
                        <div
                          key={idx}
                          className={`w-4 h-4 rounded-sm ${getHeatmapColor(day.totalMinutes)} 
                                    hover:ring-2 hover:ring-emerald-400 transition cursor-pointer group relative`}
                        >
                           <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 
                                        bg-gray-800 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap z-50 pointer-events-none
                                        border border-gray-700 shadow-xl">
                            <div className="font-semibold text-center mb-1">{new Date(day.date + 'T12:00:00').toLocaleDateString('fa-IR')}</div>
                            <div className="text-emerald-400">{day.totalMinutes} دقیقه مطالعه</div>
                            <div className="text-gray-400">{day.sessions} جلسه</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Legend */}
              <div className="flex md:hidden items-center justify-center gap-2 text-xs text-gray-400 mt-6">
                <span>کمتر</span>
                <div className="flex gap-1">
                  <div className="w-4 h-4 bg-gray-800 rounded-sm"></div>
                  <div className="w-4 h-4 bg-emerald-900/50 rounded-sm"></div>
                  <div className="w-4 h-4 bg-emerald-700/70 rounded-sm"></div>
                  <div className="w-4 h-4 bg-emerald-500 rounded-sm"></div>
                  <div className="w-4 h-4 bg-emerald-400 rounded-sm"></div>
                </div>
                <span>بیشتر</span>
              </div>
            </div>

            {/* Subject Breakdown */}
            {getSubjectData(filteredSessions).length > 0 && (
              <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 mb-8">
                <h2 className="text-2xl font-semibold mb-6 text-gray-200">زمان پیشروی بر اساس موضوع</h2>
                <div className="space-y-4">
                  {getSubjectData(filteredSessions)
                    .sort((a, b) => b.duration - a.duration)
                    .map(({ subject, duration, percentage }) => (
                      <div key={subject}>
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: getSubjectColor(subject) }}
                            ></div>
                            <span className="text-gray-300 font-medium">{subject}</span>
                          </div>
                          <div className="text-gray-400 text-sm md:text-base">
                            {formatDuration(duration)} ({percentage}%)
                          </div>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: getSubjectColor(subject),
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Recent Sessions */}
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 mb-6">
              <h2 className="text-2xl font-semibold mb-4 text-gray-200">پیشروی‌های تازه</h2>
              {filteredSessions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  در این بازه زمانی جلسه‌ای ثبت نشده است
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {filteredSessions.slice(0, 20).map((session) => (
                    <div
                      key={session.id}
                      className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: getSubjectColor(session.subject_name) }}
                        ></div>
                        <div>
                          <div className="font-semibold text-gray-200">{session.subject_name}</div>
                          {session.description && (
                            <div className="text-sm text-gray-500">{session.description}</div>
                          )}
                          <div className="text-sm text-gray-500 md:hidden">{formatDate(session.start_time)}</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between md:justify-end gap-4 md:mr-4">
                        <div className="text-emerald-400 font-semibold">{formatDuration(session.duration_seconds)}</div>
                        <div className="text-sm text-gray-500 hidden md:block">{formatDate(session.start_time)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
