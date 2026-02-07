import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import ConsultantFAB from '../components/ConsultantFAB';
import { authAPI, dataAPI } from '../api/client';

const Courses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseColor, setNewCourseColor] = useState('#3b82f6');
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editGrade, setEditGrade] = useState('');
  const [editOlympiad, setEditOlympiad] = useState('');
  const [loading, setLoading] = useState(false);

  const gradeOptions = [
    { value: '7', label: 'هفتم' },
    { value: '8', label: 'هشتم' },
    { value: '9', label: 'نهم' },
    { value: '10', label: 'دهم' },
    { value: '11', label: 'یازدهم' },
    { value: '12', label: 'دوازدهم' },
    { value: 'graduate', label: 'فارغ‌التحصیل' },
  ];

  const olympiadOptions = [
    { value: 'math', label: 'ریاضی' },
    { value: 'physics', label: 'فیزیک' },
    { value: 'chemistry', label: 'شیمی' },
    { value: 'biology', label: 'زیست‌شناسی' },
    { value: 'computer', label: 'کامپیوتر' },
    { value: 'astronomy', label: 'نجوم' },
    { value: 'none', label: 'ندارم' },
  ];

  const PREDEFINED_COLORS = [
    '#3b82f6', // blue
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#10b981', // green
    '#f59e0b', // orange
    '#ef4444', // red
    '#06b6d4', // cyan
    '#6366f1', // indigo
  ];

  useEffect(() => {
    const initData = async () => {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }

        try {
            setLoading(true);
            const [subjectsRes, profileRes] = await Promise.all([
                dataAPI.getSubjects(),
                authAPI.getProfile()
            ]);

            setCourses(subjectsRes.data);
            
            // Set profile data
            setEditFullName(profileRes.data.full_name || '');
            setEditGrade(profileRes.data.grade || '');
            setEditOlympiad(profileRes.data.olympiad_field || '');
            
        } catch (error) {
            console.error('Error loading data:', error);
            if (error.response?.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    initData();
  }, [navigate]);

  const handleLogout = () => {
    if (confirm('آیا از خروج از حساب کاربری مطمئن هستید؟')) {
      localStorage.clear();
      navigate('/login');
    }
  };

  const handleSaveProfile = async () => {
    if (!editFullName.trim()) { alert('لطفاً نام و نام خانوادگی را وارد کنید'); return; }
    if (!editGrade) { alert('لطفاً پایه تحصیلی را انتخاب کنید'); return; }
    if (!editOlympiad) { alert('لطفاً رشته المپیاد را انتخاب کنید'); return; }

    try {
        await authAPI.updateProfile({
            full_name: editFullName,
            grade: editGrade,
            olympiad_field: editOlympiad
        });
        
        // Update local storage for other components if they use it
        localStorage.setItem('userName', editFullName);
        localStorage.setItem('userGrade', editGrade);
        localStorage.setItem('userOlympiad', editOlympiad);

        setShowEditProfile(false);
        alert('اطلاعات پروفایل با موفقیت به‌روز شد! ✅');
    } catch (error) {
        console.error(error);
        alert('خطا در ذخیره پروفایل.');
    }
  };

  const handleAddCourse = async () => {
    if (!newCourseName.trim()) {
      alert('لطفا نام درس را وارد کنید!');
      return;
    }

    try {
        const res = await dataAPI.createSubject({
            name: newCourseName.trim(),
            color_code: newCourseColor
        });
        
        setCourses([...courses, res.data]);
        setNewCourseName('');
        setNewCourseColor('#3b82f6');
        setShowAddModal(false);
    } catch (error) {
        console.error(error);
        alert('خطا در ایجاد درس.');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 pb-24">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
            تنظیمات
          </h1>
          <p className="text-gray-400 text-sm mt-2">مدیریت درس‌ها و تنظیمات</p>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 mb-6">
          <h2 className="text-xl font-bold mb-4 text-emerald-400">حساب کاربری</h2>
          <div className="space-y-3">
            <button
              onClick={() => setShowEditProfile(true)}
              className="w-full flex items-center justify-between p-4 bg-gray-800 hover:bg-gray-750 rounded-lg transition"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">👤</span>
                <div className="text-right">
                  <div className="font-semibold">ویرایش پروفایل</div>
                  <div className="text-sm text-gray-400">{editFullName}</div>
                </div>
              </div>
              <span className="text-gray-400">←</span>
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-4 bg-red-900/20 hover:bg-red-900/30 
                       border border-red-800/50 rounded-lg transition text-red-400"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🚪</span>
                <div className="text-right">
                  <div className="font-semibold">خروج از حساب</div>
                  <div className="text-sm text-red-400/70">Log out</div>
                </div>
              </div>
              <span>←</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-emerald-400">درس‌های من</h2>
        </div>

        {courses.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-semibold mb-2 text-gray-300">هنوز درسی اضافه نشده است</h2>
            <p className="text-gray-500 mb-8">اولین درس خود را اضافه کنید تا شروع کنید!</p>
          </div>
        )}

        {courses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: course.color_code || course.color }}
                    ></div>
                    <h3 className="text-xl font-semibold text-gray-200">{course.name}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => setShowAddModal(true)}
          className="w-full p-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl 
                   hover:from-blue-700 hover:to-purple-700 transition-all duration-300 
                   transform hover:scale-105 shadow-xl shadow-blue-500/30 font-semibold text-lg"
        >
          + افزودن درس جدید
        </button>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full border border-gray-800 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-200">افزودن درس</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewCourseName('');
                  setNewCourseColor('#3b82f6');
                }}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-gray-400 mb-2 text-sm">نام درس</label>
                <input
                  type="text"
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  placeholder="مثلا: ریاضی"
                  className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 
                           focus:outline-none focus:border-blue-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-3 text-sm">رنگ</label>
                <div className="flex gap-3 flex-wrap">
                  {PREDEFINED_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewCourseColor(color)}
                      className={`w-12 h-12 rounded-lg transition-all ${
                        newCourseColor === color
                          ? 'ring-4 ring-white ring-offset-2 ring-offset-gray-900 scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    ></button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewCourseName('');
                    setNewCourseColor('#3b82f6');
                  }}
                  className="flex-1 px-6 py-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition font-semibold"
                >
                  انصراف
                </button>
                <button
                  onClick={handleAddCourse}
                  disabled={!newCourseName.trim()}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg 
                           hover:from-blue-600 hover:to-purple-700 transition font-semibold
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  افزودن
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditProfile && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 rounded-2xl p-6 md:p-8 max-w-lg w-full border border-emerald-500/30 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-emerald-400">ویرایش پروفایل</h2>
                <p className="text-sm text-gray-400 mt-1">اطلاعات خود را به‌روزرسانی کنید</p>
              </div>
              <button
                onClick={() => setShowEditProfile(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-gray-400 mb-2 text-sm font-medium">
                  نام و نام خانوادگی
                </label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-950/50 text-white rounded-xl border border-gray-700 
                           focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20
                           transition-all"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-2 text-sm font-medium">
                  پایه تحصیلی
                </label>
                <select
                  value={editGrade}
                  onChange={(e) => setEditGrade(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-950/50 text-white rounded-xl border border-gray-700 
                           focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20
                           transition-all cursor-pointer"
                >
                  <option value="" className="bg-gray-900">انتخاب کنید...</option>
                  {gradeOptions.map((option) => (
                    <option key={option.value} value={option.value} className="bg-gray-900">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-2 text-sm font-medium">
                  رشته المپیاد
                </label>
                <select
                  value={editOlympiad}
                  onChange={(e) => setEditOlympiad(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-950/50 text-white rounded-xl border border-gray-700 
                           focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20
                           transition-all cursor-pointer"
                >
                  <option value="" className="bg-gray-900">انتخاب کنید...</option>
                  {olympiadOptions.map((option) => (
                    <option key={option.value} value={option.value} className="bg-gray-900">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowEditProfile(false)}
                  className="flex-1 px-6 py-3 bg-gray-800 rounded-xl hover:bg-gray-700 transition font-semibold"
                >
                  انصراف
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl 
                           hover:from-emerald-600 hover:to-green-700 transition font-semibold shadow-lg"
                >
                  ✓ ذخیره تغییرات
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <ConsultantFAB />
      <BottomNav />
    </div>
  );
};

export default Courses;
