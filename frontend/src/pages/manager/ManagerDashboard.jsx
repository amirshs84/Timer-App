import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { managerAPI } from '../../api/client';
import KPICard from '../../components/manager/KPICard';
import TrendIndicator from '../../components/manager/TrendIndicator';
import { useContext } from 'react';
import { usePWA } from '../../hooks/PWAContext';
import { MdGetApp } from 'react-icons/md';
import { formatRelativeDateIran, getStartOfDayIran, getIranDate } from '../../utils/dateUtils';
import { 
  HiAcademicCap, 
  HiExclamationCircle, 
  HiUserGroup,
  HiSearch,
  HiDownload,
  HiFilter,
  HiStar, // Use HiStar instead of HiTrophy for v1 compatibility
  HiLogout
} from 'react-icons/hi';

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const [kpiData, setKpiData] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    grade: '',
    olympiad: '',
    search: ''
  });
  const { promptInstall, isStandalone } = usePWA();

  // Olympiad field mapping to Persian
  const olympiadMapping = {
    'math': 'ریاضی',
    'physics': 'فیزیک',
    'chemistry': 'شیمی',
    'biology': 'زیست‌شناسی',
    'computer': 'کامپیوتر',
    'astronomy': 'نجوم',
    'literature': 'ادبیات',
    'none': '-'
  };

  const getOlympiadPersian = (field) => {
    return olympiadMapping[field] || field || '-';
  };

  const handleLogout = () => {
    if (window.confirm('آیا می‌خواهید از حساب کاربری خارج شوید؟')) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('isLoggedIn');
      navigate('/login');
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [filters]);

  const fetchDashboardData = async () => {
    try {
      const response = await managerAPI.getDashboardKPI();
      setKpiData(response.data);
    } catch (error) {
      console.error('Error fetching KPI data:', error);
      if (error.response?.status === 403) {
        alert('شما دسترسی به پنل مدیریت ندارید');
        navigate('/');
      }
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await managerAPI.getStudentList(filters);
      setStudents(response.data.students);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatSeconds = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  const handleExportExcel = () => {
    const today = getIranDate();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    // Format as YYYY-MM-DD using local methods since the Date object is already adjusted to Iran time
    const startDate = thirtyDaysAgo.toLocaleDateString('en-CA');
    const endDate = today.toLocaleDateString('en-CA');
    
    const url = managerAPI.exportExcel(startDate, endDate);
    window.open(url, '_blank');
  };

  const handleStudentClick = (userId) => {
    navigate(`/manager/student/${userId}`);
  };

  // Get performance color based on threshold (6 hours = 21600 seconds)
  const getPerformanceColor = (todayTotal) => {
    const normalThreshold = 21600; // 6 hours
    if (todayTotal < normalThreshold * 0.5) return 'bg-red-50/80';
    if (todayTotal < normalThreshold) return 'bg-yellow-50/80';
    return '';
  };

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return '؟';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0];
    }
    return name[0];
  };

  // Get avatar color based on name
  const getAvatarColor = (name) => {
    const colors = [
      'bg-gradient-to-br from-blue-500 to-blue-600',
      'bg-gradient-to-br from-purple-500 to-purple-600',
      'bg-gradient-to-br from-pink-500 to-pink-600',
      'bg-gradient-to-br from-orange-500 to-orange-600',
      'bg-gradient-to-br from-teal-500 to-teal-600',
    ];
    const hash = (name || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  if (!kpiData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50 flex items-center justify-center">
        <div className="text-emerald-800 flex items-center gap-3">
          <div className="w-6 h-6 border-4 border-emerald-800 border-t-transparent rounded-full animate-spin" />
          در حال بارگذاری...
        </div>
      </div>
    );
  }

  return (
       <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50 bg-white text-gray-900 relative z-10 pb-20">
    
    {/* Header with Gradient */}
    <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 text-white p-8 sticky top-0 z-20 shadow-2xl backdrop-blur-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* بخش عناوین (سمت راست) */}
      <div>
        <h1 className="text-3xl font-black mb-2 tracking-tight">پنل مدیریت</h1>
        <p className="text-emerald-100 text-sm font-medium">نمای کلی عملکرد دانش‌آموزان</p>
      </div>

      {/* بخش دکمه‌های عملیاتی (سمت چپ) */}
      <div className="flex items-center gap-3">
        
        {/* دکمه نصب اپلیکیشن */}
        {!isStandalone && (
          <button
            onClick={() => navigate('/install-app', { state: { from: '/manager'}})}
            className="flex items-center gap-2 px-4 py-2 bg-white text-emerald-700 hover:bg-gray-100 rounded-xl transition-all text-sm font-bold shadow-md border border-transparent"
            title="نصب اپلیکیشن "
          >
            <MdGetApp className="text-xl" />
            <span className="hidden sm:inline">نصب اپ</span>
          </button>
        )}

        {/* دکمه خروج */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-sm font-semibold backdrop-blur-sm border border-white/10"
        >
          <HiLogout className="text-xl" />
          خروج
        </button>

      </div>

    </div>
  </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* KPI Cards with Modern Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="میانگین مطالعه امروز"
            value={kpiData.avg_study_today}
            subtitle={`${kpiData.total_students} دانش‌آموز`}
            icon={HiAcademicCap}
            trend={kpiData.change_percent}
            colorClass="from-emerald-600/90 to-teal-700/90"
          />
          
          <KPICard
            title="فعال‌ترین دانش‌آموز"
            value={kpiData.top_student.name}
            subtitle={formatSeconds(kpiData.top_student.total)}
            icon={HiStar}
            colorClass="from-amber-500/90 to-orange-600/90"
          />
          
          <KPICard
            title="غایبین امروز"
            value={kpiData.absent_count}
            subtitle="دانش‌آموز"
            icon={HiExclamationCircle}
            colorClass={kpiData.absent_count > 0 ? 'from-red-500/90 to-rose-600/90' : 'from-emerald-600/90 to-teal-700/90'}
          />
          
          <KPICard
            title="در حال مطالعه"
            value={kpiData.active_now}
            subtitle="دانش‌آموز فعال"
            icon={HiUserGroup}
            colorClass="from-blue-600/90 to-indigo-700/90"
          />
        </div>

        {/* Filters with Modern Toolbar */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 p-5 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-[250px] relative">
              <HiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
              <input
                type="text"
                placeholder="جستجوی نام یا شماره..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm"
              />
            </div>
            
            {/* Grade Filter */}
            <div className="relative">
              <HiFilter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none" />
              <select
                value={filters.grade}
                onChange={(e) => setFilters({...filters, grade: e.target.value})}
                className="pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all cursor-pointer bg-white/50 backdrop-blur-sm font-medium"
              >
                <option value="">همه پایه‌ها</option>
                <option value="7">هفتم</option>
                <option value="8">هشتم</option>
                <option value="9">نهم</option>
                <option value="10">دهم</option>
                <option value="11">یازدهم</option>
                <option value="12">دوازدهم</option>
              </select>
            </div>
            
            {/* Olympiad Filter */}
            <select
              value={filters.olympiad}
              onChange={(e) => setFilters({...filters, olympiad: e.target.value})}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all cursor-pointer bg-white/50 backdrop-blur-sm font-medium"
            >
              <option value="">همه رشته‌ها</option>
              <option value="math">ریاضی</option>
              <option value="physics">فیزیک</option>
              <option value="chemistry">شیمی</option>
              <option value="biology">زیست‌شناسی</option>
              <option value="computer">کامپیوتر</option>
              <option value="astronomy">نجوم</option>
            </select>

            {/* Export Button */}
            <button
              onClick={handleExportExcel}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 transform"
            >
              <HiDownload className="text-lg" />
              دانلود Excel
            </button>
          </div>
        </div>

        {/* Students Table with Modern Design */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-emerald-700 to-teal-700 text-white">
                <tr>
                  <th className="px-6 py-4 text-right font-bold">دانش‌آموز</th>
                  <th className="px-4 py-4 text-center font-bold">پایه</th>
                  <th className="px-4 py-4 text-center font-bold">رشته</th>
                  <th className="px-4 py-4 text-center font-bold">امروز</th>
                  <th className="px-4 py-4 text-center font-bold">هفته</th>
                  <th className="px-4 py-4 text-center font-bold">وضعیت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-gray-500">
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                        در حال بارگذاری...
                      </div>
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-gray-500">
                      دانش‌آموزی یافت نشد
                    </td>
                  </tr>
                ) : (
                  students.map((student, index) => (
                    <tr
                      key={student.user_id}
                      onClick={() => handleStudentClick(student.user_id)}
                      className={`cursor-pointer transition-all duration-200
                        ${getPerformanceColor(student.today_total)}
                        hover:bg-emerald-50 hover:shadow-lg hover:scale-[1.01] transform
                        ${index % 2 === 0 ? 'bg-gray-50/30' : 'bg-white/30'}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          {/* Avatar */}
                          <div className={`w-11 h-11 rounded-full ${getAvatarColor(student.full_name)} 
                                        flex items-center justify-center text-white font-bold text-sm
                                        shadow-lg ring-2 ring-white`}>
                            {getInitials(student.full_name)}
                          </div>
                          {/* Name */}
                          <div>
                            <div className="font-bold text-gray-900 text-base">
                              {student.full_name || student.phone_number}
                            </div>
                            {student.full_name && (
                              <div className="text-xs text-gray-500 font-mono">{student.phone_number}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
                          {student.grade ? `${student.grade}` : '-'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center text-gray-600 text-sm font-medium">
                        {getOlympiadPersian(student.olympiad_field)}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="font-mono font-bold text-gray-900 text-base">
                          {formatSeconds(student.today_total)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <span className="font-mono font-bold text-gray-900 text-base">
                            {formatSeconds(student.week_total)}
                          </span>
                          <TrendIndicator trend={student.trend} percent={student.trend_percent} />
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold shadow-sm
                          ${student.trend === 'up' ? 'bg-green-100 text-green-700 ring-1 ring-green-200' :
                            student.trend === 'down' ? 'bg-red-100 text-red-700 ring-1 ring-red-200' :
                            'bg-gray-100 text-gray-700 ring-1 ring-gray-200'}`}>
                          {student.trend === 'up' ? '🔥 صعودی' : student.trend === 'down' ? '📉 نزولی' : '➖ ثابت'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Note with Modern Design */}
        <div className="mt-6 bg-blue-50/80 backdrop-blur-sm border border-blue-200/50 rounded-2xl p-4 text-center shadow-sm">
          <p className="text-blue-800 text-sm font-medium">
            💡 دانش‌آموزانی با مطالعه کمتر از ۳ ساعت با رنگ قرمز و کمتر از ۶ ساعت با رنگ زرد مشخص شده‌اند
          </p>
        </div>
      </div>
    </div>
  );
}
