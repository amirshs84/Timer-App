import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { managerAPI } from '../../api/client';
import KPICard from '../../components/manager/KPICard';
import TrendIndicator from '../../components/manager/TrendIndicator';

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
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const startDate = thirtyDaysAgo.toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];
    
    const url = managerAPI.exportExcel(startDate, endDate);
    window.open(url, '_blank');
  };

  const handleStudentClick = (userId) => {
    navigate(`/manager/student/${userId}`);
  };

  // Get performance color based on threshold (6 hours = 21600 seconds)
  const getPerformanceColor = (todayTotal) => {
    const normalThreshold = 21600; // 6 hours
    if (todayTotal < normalThreshold * 0.5) return 'bg-red-50';
    if (todayTotal < normalThreshold) return 'bg-yellow-50';
    return '';
  };

  if (!kpiData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-emerald-800">در حال بارگذاری...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-800 to-emerald-900 text-white p-6 sticky top-0 z-10 shadow-lg">
        <h1 className="text-2xl font-bold mb-1">پنل مدیریت</h1>
        <p className="text-emerald-200 text-sm">نمای کلی عملکرد دانش‌آموزان</p>
      </div>

      <div className="p-4 max-w-7xl mx-auto">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KPICard
            title="میانگین مطالعه امروز"
            value={kpiData.avg_study_today}
            subtitle={`${kpiData.total_students} دانش‌آموز`}
            icon="📚"
            trend={kpiData.change_percent}
          />
          
          <KPICard
            title="فعال‌ترین دانش‌آموز"
            value={kpiData.top_student.name}
            subtitle={formatSeconds(kpiData.top_student.total)}
            icon="🏆"
          />
          
          <KPICard
            title="غایبین امروز"
            value={kpiData.absent_count}
            subtitle="دانش‌آموز"
            icon="⚠️"
            colorClass={kpiData.absent_count > 0 ? 'bg-gradient-to-br from-orange-700 to-orange-800' : 'bg-gradient-to-br from-emerald-800 to-emerald-900'}
          />
          
          <KPICard
            title="در حال مطالعه"
            value={kpiData.active_now}
            subtitle="دانش‌آموز فعال"
            icon="✍️"
            colorClass="bg-gradient-to-br from-blue-700 to-blue-800"
          />
        </div>

        {/* Filters and Export */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
          <div className="flex flex-wrap gap-3 items-center">
            <input
              type="text"
              placeholder="جستجوی نام یا شماره..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            
            <select
              value={filters.grade}
              onChange={(e) => setFilters({...filters, grade: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">همه پایه‌ها</option>
              <option value="7">هفتم</option>
              <option value="8">هشتم</option>
              <option value="9">نهم</option>
              <option value="10">دهم</option>
              <option value="11">یازدهم</option>
              <option value="12">دوازدهم</option>
            </select>
            
            <select
              value={filters.olympiad}
              onChange={(e) => setFilters({...filters, olympiad: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">همه رشته‌ها</option>
              <option value="math">ریاضی</option>
              <option value="physics">فیزیک</option>
              <option value="chemistry">شیمی</option>
              <option value="biology">زیست‌شناسی</option>
              <option value="computer">کامپیوتر</option>
              <option value="astronomy">نجوم</option>
            </select>

            <button
              onClick={handleExportExcel}
              className="px-6 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-colors font-medium flex items-center gap-2"
            >
              📊 دانلود Excel
            </button>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-emerald-800 text-white">
                <tr>
                  <th className="px-4 py-3 text-right">نام</th>
                  <th className="px-4 py-3 text-center">پایه</th>
                  <th className="px-4 py-3 text-center">رشته</th>
                  <th className="px-4 py-3 text-center">امروز</th>
                  <th className="px-4 py-3 text-center">هفته</th>
                  <th className="px-4 py-3 text-center">وضعیت</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-gray-500">
                      در حال بارگذاری...
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-gray-500">
                      دانش‌آموزی یافت نشد
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr
                      key={student.user_id}
                      onClick={() => handleStudentClick(student.user_id)}
                      className={`border-b hover:bg-emerald-50 cursor-pointer transition-colors ${getPerformanceColor(student.today_total)}`}
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {student.full_name || student.phone_number}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600">
                        {student.grade ? `${student.grade}` : '-'}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600 text-sm">
                        {student.olympiad_field || '-'}
                      </td>
                      <td className="px-4 py-3 text-center font-mono">
                        {formatSeconds(student.today_total)}
                      </td>
                      <td className="px-4 py-3 text-center font-mono flex items-center justify-center">
                        {formatSeconds(student.week_total)}
                        <TrendIndicator trend={student.trend} percent={student.trend_percent} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          student.trend === 'up' ? 'bg-green-100 text-green-700' :
                          student.trend === 'down' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {student.trend === 'up' ? 'صعودی' : student.trend === 'down' ? 'نزولی' : 'ثابت'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>💡 دانش‌آموزانی با مطالعه کمتر از ۳ ساعت با رنگ قرمز و کمتر از ۶ ساعت با رنگ زرد مشخص شده‌اند</p>
        </div>
      </div>
    </div>
  );
}
