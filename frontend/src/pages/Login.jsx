import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/client';

const Login = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: phone, 2: OTP, 3: profile
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [fullName, setFullName] = useState('');
  const [grade, setGrade] = useState('');
  const [olympiadField, setOlympiadField] = useState('');
  const [invitationCode, setInvitationCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // گزینه‌های پایه تحصیلی
  const gradeOptions = [
    { value: '7', label: 'هفتم' },
    { value: '8', label: 'هشتم' },
    { value: '9', label: 'نهم' },
    { value: '10', label: 'دهم' },
    { value: '11', label: 'یازدهم' },
    { value: '12', label: 'دوازدهم' },
    { value: 'graduate', label: 'فارغ‌التحصیل' },
  ];

  // گزینه‌های رشته المپیاد
  const olympiadOptions = [
    { value: 'math', label: 'ریاضی' },
    { value: 'physics', label: 'فیزیک' },
    { value: 'chemistry', label: 'شیمی' },
    { value: 'biology', label: 'زیست‌شناسی' },
    { value: 'computer', label: 'کامپیوتر' },
    { value: 'astronomy', label: 'نجوم' },
    { value: 'none', label: 'ندارم' },
  ];

  useEffect(() => {
    const checkAuth = async () => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            try {
                // Verify token by fetching profile
                const res = await authAPI.getProfile();
                const profile = res.data;
                
                // Check user role and redirect accordingly
                if (profile.is_profile_complete) {
                    if (profile.is_superadmin) {
                        navigate('/superadmin');
                    } else if (profile.role === 'manager') {
                        navigate('/manager');
                    } else {
                        navigate('/timer');
                    }
                } else {
                    // Profile incomplete, go to step 3
                    setFullName(profile.full_name || '');
                    setGrade(profile.grade || '');
                    setOlympiadField(profile.olympiad_field || '');
                    setStep(3);
                }
            } catch (e) {
                // Invalid token
                localStorage.clear();
            }
        }
    };
    checkAuth();
  }, [navigate]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!phoneNumber || phoneNumber.length !== 11 || !phoneNumber.startsWith('09')) {
      setError('لطفا شماره موبایل معتبر وارد کنید (مثال: 09123456789)');
      setLoading(false);
      return;
    }

    try {
        await authAPI.requestOtp(phoneNumber);
        setStep(2);
    } catch (err) {
        setError('خطا در ارسال کد تایید. لطفا دوباره تلاش کنید.');
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        const res = await authAPI.login(phoneNumber, otp);
        const { access, refresh, is_new_user, profile } = res.data;

        localStorage.setItem('accessToken', access);
        localStorage.setItem('refreshToken', refresh);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userPhone', phoneNumber);
        
        // Save initial profile data if available
        if (profile) {
            localStorage.setItem('userName', profile.full_name || '');
            localStorage.setItem('userGrade', profile.grade || '');
            localStorage.setItem('userOlympiad', profile.olympiad_field || '');
            localStorage.setItem('userRole', profile.role || 'student');
        }

        if (is_new_user) {
            setStep(3);
        } else {
            localStorage.setItem('profileComplete', 'true');
            // Redirect based on user role
            if (profile.is_superadmin) {
                navigate('/superadmin');
            } else if (profile.role === 'manager') {
                navigate('/manager');
            } else {
                navigate('/timer');
            }
        }

    } catch (err) {
        setError(err.response?.data?.error || 'کد تایید نادرست است.');
    } finally {
        setLoading(false);
    }
  };

  const handleCompleteProfile = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!fullName.trim()) { setError('لطفا نام و نام خانوادگی خود را وارد کنید'); setLoading(false); return; }
    if (!grade) { setError('لطفا پایه تحصیلی خود را انتخاب کنید'); setLoading(false); return; }
    if (!olympiadField) { setError('لطفا رشته المپیاد خود را انتخاب کنید'); setLoading(false); return; }
    if (!invitationCode.trim()) { setError('لطفا کد دعوت مدرسه را وارد کنید'); setLoading(false); return; }

    try {
        const res = await authAPI.updateProfile({
            full_name: fullName,
            grade: grade,
            olympiad_field: olympiadField,
            invitation_code: invitationCode
        });

        localStorage.setItem('profileComplete', 'true');
        localStorage.setItem('userName', fullName);
        localStorage.setItem('userGrade', grade);
        localStorage.setItem('userOlympiad', olympiadField);

        // Check role from updated profile
        const userRole = res.data.role || localStorage.getItem('userRole') || 'student';
        
        if (userRole === 'manager') {
            navigate('/manager');
        } else {
            navigate('/timer');
        }
    } catch (err) {
        setError('خطا در ذخیره اطلاعات. لطفا دوباره تلاش کنید.');
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setOtp('');
    } else if (step === 3) {
      setStep(2);
    }
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-emerald-950 flex items-center justify-center relative overflow-hidden">
      {/* Background subtle pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(16, 185, 129, 0.3) 1px, transparent 0)',
        backgroundSize: '50px 50px'
      }}></div>

      <div className="absolute top-20 left-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="relative z-10 max-w-lg w-full p-6 md:p-8">
        <div className="text-center mb-10">
          <div className="inline-block mb-4">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30">
              <span className="text-3xl">🌱</span>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            به تایمر مطالعه خوش آمدید
          </h1>
          <p className="text-emerald-300/70 text-sm">رشد، تمرکز، و موفقیت با هم</p>
        </div>

        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 rounded-full transition-all duration-500 ${
                s <= step 
                  ? 'bg-emerald-500 w-12' 
                  : 'bg-gray-800 w-8'
              }`}
            ></div>
          ))}
        </div>

        <div className="bg-gray-900/40 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-emerald-500/20 shadow-2xl">
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className="block text-emerald-300/90 mb-3 text-sm font-medium">
                  شماره موبایل
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="09123456789"
                  className="w-full px-5 py-4 bg-gray-950/50 text-white rounded-2xl border border-gray-700 
                           focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20
                           text-center text-lg tracking-wider transition-all"
                  maxLength="11"
                  dir="ltr"
                  required
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm backdrop-blur">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl 
                         hover:from-emerald-600 hover:to-teal-700 transition-all font-semibold text-lg
                         shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transform hover:scale-[1.02]
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'در حال ارسال...' : 'دریافت کد تایید'}
              </button>

              <div className="text-center text-xs text-gray-500 mt-4 bg-gray-800/30 rounded-xl p-3">
                💡 کد تست: <span className="text-emerald-400 font-mono">12345</span>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="block text-emerald-300/90 mb-3 text-sm text-center font-medium">
                  کد تایید برای <span className="text-white font-mono">{phoneNumber}</span> ارسال شد
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="12345"
                  className="w-full px-5 py-5 bg-gray-950/50 text-white rounded-2xl border border-gray-700 
                           focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20
                           text-center text-3xl tracking-[1em] font-mono transition-all"
                  maxLength="5"
                  dir="ltr"
                  autoFocus
                  required
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={loading}
                  className="flex-1 py-3 bg-gray-800/50 text-white rounded-xl hover:bg-gray-700/50 
                           transition font-semibold border border-gray-700 disabled:opacity-50"
                >
                  بازگشت
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl 
                           hover:from-emerald-600 hover:to-teal-700 transition font-semibold
                           shadow-lg shadow-emerald-500/30 disabled:opacity-50"
                >
                  {loading ? '...' : 'تایید'}
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleCompleteProfile} className="space-y-5">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-2">اطلاعات شما</h3>
                <p className="text-sm text-gray-400">لطفاً اطلاعات زیر را تکمیل کنید</p>
              </div>

              <div>
                <label className="block text-emerald-300/90 mb-2 text-sm font-medium">
                  نام و نام خانوادگی
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="علی احمدی"
                  className="w-full px-4 py-3 bg-gray-950/50 text-white rounded-xl border border-gray-700 
                           focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20
                           transition-all"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-emerald-300/90 mb-2 text-sm font-medium">
                  پایه تحصیلی
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-950/50 text-white rounded-xl border border-gray-700 
                           focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20
                           transition-all cursor-pointer"
                  required
                  disabled={loading}
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
                <label className="block text-emerald-300/90 mb-2 text-sm font-medium">
                  رشته المپیاد
                </label>
                <select
                  value={olympiadField}
                  onChange={(e) => setOlympiadField(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-950/50 text-white rounded-xl border border-gray-700 
                           focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20
                           transition-all cursor-pointer"
                  required
                  disabled={loading}
                >
                  <option value="" className="bg-gray-900">انتخاب کنید...</option>
                  {olympiadOptions.map((option) => (
                    <option key={option.value} value={option.value} className="bg-gray-900">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-emerald-300/90 mb-2 text-sm font-medium">
                  کد دعوت مدرسه
                </label>
                <input
                  type="text"
                  value={invitationCode}
                  onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
                  placeholder="مثال: ABC12XYZ"
                  className="w-full px-4 py-3 bg-gray-950/50 text-white rounded-xl border border-gray-700 
                           focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20
                           transition-all uppercase tracking-wider font-mono"
                  maxLength={8}
                  required
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 کد دعوت را از مدیر مدرسه خود دریافت کنید
                </p>
              </div>

              {error && (
                <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl 
                           hover:from-emerald-600 hover:to-teal-700 transition font-semibold
                           shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transform hover:scale-[1.02]
                           disabled:opacity-50"
                >
                  {loading ? 'در حال ذخیره...' : 'شروع کنیم! 🚀'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
