import { useState, useEffect } from 'react';
import { HiPlus, HiOfficeBuilding, HiUserGroup, HiKey } from 'react-icons/hi';
import { superadminAPI } from '../../api/client';

export default function SuperAdminDashboard() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [newSchool, setNewSchool] = useState({ name: '', normal_study_threshold: 21600 });
  const [managerPhone, setManagerPhone] = useState('');

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const response = await superadminAPI.getSchools();
      setSchools(response.data);
    } catch (error) {
      console.error('Error fetching schools:', error);
      alert('خطا در دریافت لیست مدارس');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchool = async (e) => {
    e.preventDefault();
    try {
      await superadminAPI.createSchool(newSchool);
      alert('مدرسه با موفقیت ساخته شد');
      setShowCreateModal(false);
      setNewSchool({ name: '', normal_study_threshold: 21600 });
      fetchSchools();
    } catch (error) {
      console.error('Error creating school:', error);
      alert('خطا در ساخت مدرسه');
    }
  };

  const handleAssignManager = async (e) => {
    e.preventDefault();
    try {
      await superadminAPI.assignManager(selectedSchool.id, { phone_number: managerPhone });
      alert(`مدیر با موفقیت به ${selectedSchool.name} اختصاص یافت`);
      setShowAssignModal(false);
      setManagerPhone('');
      fetchSchools();
    } catch (error) {
      console.error('Error assigning manager:', error);
      alert('خطا در اختصاص مدیر');
    }
  };

  const handleDeleteSchool = async (school) => {
    if (!confirm(`آیا از حذف مدرسه ${school.name} اطمینان دارید؟`)) return;
    
    try {
      await superadminAPI.deleteSchool(school.id);
      alert('مدرسه حذف شد');
      fetchSchools();
    } catch (error) {
      console.error('Error deleting school:', error);
      alert('خطا در حذف مدرسه');
    }
  };

  const formatHours = (seconds) => {
    return (seconds / 3600).toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-gray-50 flex items-center justify-center">
        <div className="text-purple-800 flex items-center gap-3">
          <div className="w-6 h-6 border-4 border-purple-800 border-t-transparent rounded-full animate-spin" />
          در حال بارگذاری...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-700 via-indigo-700 to-purple-800 text-white p-8 shadow-2xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black mb-2 tracking-tight">پنل سوپرادمین</h1>
            <p className="text-purple-100 text-sm font-medium">مدیریت مدارس و دسترسی‌ها</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-white text-purple-700 rounded-xl hover:bg-purple-50 transition-all font-bold flex items-center gap-2 shadow-lg hover:scale-105 transform"
          >
            <HiPlus className="text-xl" />
            افزودن مدرسه جدید
          </button>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Schools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schools.map((school) => (
            <div
              key={school.id}
              className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] transform"
            >
              {/* School Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <HiOfficeBuilding className="text-2xl text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{school.name}</h3>
                    <p className="text-xs text-gray-500">{school.member_count} دانش‌آموز</p>
                  </div>
                </div>
              </div>

              {/* Invitation Code */}
              <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 font-medium">کد دعوت:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xl font-black text-purple-700 tracking-widest">
                      {school.invitation_code}
                    </span>
                    <HiKey className="text-purple-600 text-lg" />
                  </div>
                </div>
              </div>

              {/* Manager Info */}
              <div className="mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <HiUserGroup className="text-gray-400" />
                  <span className="text-gray-600">مدیر:</span>
                  <span className="font-semibold text-gray-900">{school.manager_name}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="bg-gray-50 rounded-xl p-3 mb-4">
                <div className="text-xs text-gray-600">حد نرمال مطالعه:</div>
                <div className="text-lg font-bold text-gray-900">
                  {formatHours(school.normal_study_threshold)} ساعت
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedSchool(school);
                    setShowAssignModal(true);
                  }}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold text-sm"
                >
                  تعیین مدیر
                </button>
                <button
                  onClick={() => handleDeleteSchool(school)}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-semibold text-sm"
                >
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>

        {schools.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <HiOfficeBuilding className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-lg font-medium">هیچ مدرسه‌ای ثبت نشده است</p>
            <p className="text-sm">برای شروع، یک مدرسه جدید اضافه کنید</p>
          </div>
        )}
      </div>

      {/* Create School Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">افزودن مدرسه جدید</h2>
            <form onSubmit={handleCreateSchool} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">نام مدرسه</label>
                <input
                  type="text"
                  value={newSchool.name}
                  onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                  placeholder="مثال: دبیرستان فرزانگان"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">حد نرمال مطالعه (ساعت)</label>
                <input
                  type="number"
                  step="0.5"
                  value={newSchool.normal_study_threshold / 3600}
                  onChange={(e) => setNewSchool({ ...newSchool, normal_study_threshold: parseFloat(e.target.value) * 3600 })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-semibold"
                >
                  ایجاد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Manager Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">تعیین مدیر</h2>
            <p className="text-gray-600 text-sm mb-6">مدرسه: {selectedSchool?.name}</p>
            <form onSubmit={handleAssignManager} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">شماره تلفن مدیر</label>
                <input
                  type="tel"
                  value={managerPhone}
                  onChange={(e) => setManagerPhone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                  required
                  placeholder="09123456789"
                  pattern="09[0-9]{9}"
                  maxLength={11}
                />
                <p className="text-xs text-gray-500 mt-2">
                  اگر کاربر وجود نداشته باشد، به صورت خودکار ساخته می‌شود
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignModal(false);
                    setManagerPhone('');
                  }}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-semibold"
                >
                  تعیین
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
