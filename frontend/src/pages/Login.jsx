import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/client';

const Login = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: phone, 2: password (new/existing), 3: profile
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [fullName, setFullName] = useState('');
  const [grade, setGrade] = useState('');
  const [olympiadField, setOlympiadField] = useState('');
  const [invitationCode, setInvitationCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');

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

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const res = await authAPI.getProfile();
          const profile = res.data;
          
          if (profile.is_profile_complete) {
            if (profile.is_superadmin) {
              navigate('/superadmin');
            } else if (profile.role === 'manager') {
              navigate('/manager');
            } else {
              navigate('/timer');
            }
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('isLoggedIn');
        }
      }
    };
    
    checkAuth();
  }, [navigate]);

  const checkPasswordStrength = (pass) => {
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[a-z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pass)) strength++;

    if (strength === 0) return { text: '', color: '' };
    if (strength <= 2) return { text: 'ضعیف', color: 'text-red-500' };
    if (strength <= 3) return { text: 'متوسط', color: 'text-yellow-500' };
    if (strength <= 4) return { text: 'خوب', color: 'text-blue-500' };
    return { text: 'عالی', color: 'text-green-500' };
  };

  const handlePasswordChange = (e) => {
    const pass = e.target.value;
    setPassword(pass);
    setPasswordStrength(checkPasswordStrength(pass));
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (phoneNumber.length !== 11) {
      setError('شماره تلفن باید ۱۱ رقم باشد');
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.checkPhone(phoneNumber);
      // If user exists AND has password set -> Show Login (isExistingUser = true)
      // If user exists BUT no password (pre-created) OR doesn't exist -> Show Register (isExistingUser = false)
      setIsExistingUser(res.data.exists && res.data.has_password);
      setStep(2);
    } catch (error) {
      setError('خطا در بررسی شماره تلفن');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isExistingUser) {
      // Login existing user
      if (!password) {
        setError('رمز عبور را وارد کنید');
        return;
      }

      setLoading(true);
      try {
        const res = await authAPI.login(phoneNumber, password);
        localStorage.setItem('accessToken', res.data.access);
        localStorage.setItem('refreshToken', res.data.refresh);
        localStorage.setItem('isLoggedIn', 'true');
        
        const profile = res.data.profile;
        
        if (profile.is_profile_complete) {
          if (profile.is_superadmin) {
            navigate('/superadmin');
          } else if (profile.role === 'manager') {
            navigate('/manager');
          } else {
            navigate('/timer');
          }
        } else {
          setStep(3);
        }
      } catch (error) {
        setError(error.response?.data?.error || 'رمز عبور اشتباه است');
      } finally {
        setLoading(false);
      }
    } else {
      // Register new user
      if (!password || !passwordConfirm) {
        setError('لطفا هر دو فیلد رمز عبور را پر کنید');
        return;
      }

      if (password !== passwordConfirm) {
        setError('رمزهای عبور مطابقت ندارند');
        return;
      }

      setLoading(true);
      try {
        const res = await authAPI.register(phoneNumber, password, passwordConfirm);
        localStorage.setItem('accessToken', res.data.access);
        localStorage.setItem('refreshToken', res.data.refresh);
        localStorage.setItem('isLoggedIn', 'true');
        setStep(3);
      } catch (error) {
        setError(error.response?.data?.error || 'خطا در ثبت نام');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCompleteProfile = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullName || !grade || !olympiadField) {
      setError('لطفا تمام فیلدها را پر کنید');
      return;
    }

    setLoading(true);
    try {
      const data = {
        full_name: fullName,
        grade: grade,
        olympiad_field: olympiadField,
        invitation_code: invitationCode || undefined,
      };

      const res = await authAPI.updateProfile(data);
      const profile = res.data;

      if (profile.is_superadmin) {
        navigate('/superadmin');
      } else if (profile.role === 'manager') {
        navigate('/manager');
      } else {
        navigate('/timer');
      }
    } catch (error) {
      setError(error.response?.data?.invitation_code?.[0] || 'خطا در تکمیل پروفایل');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-black to-teal-950 text-white flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
        backgroundSize: '40px 40px'
      }}></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-gray-900/60 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-emerald-500/30">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4 drop-shadow-lg">📚</div>
            <h1 className="text-3xl font-bold text-white mb-2">سامانه مطالعه</h1>
            <p className="text-emerald-200/80">ورود و ثبت‌نام</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Phone Number */}
          {step === 1 && (
            <form onSubmit={handlePhoneSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-300 mb-2 text-sm font-medium">
                  شماره تلفن
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="09123456789"
                  className="w-full px-4 py-3 bg-gray-900/50 text-white rounded-xl border border-gray-600 
                           focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 
                           transition-all"
                  disabled={loading}
                  maxLength="11"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl 
                         font-bold hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg 
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'در حال بررسی...' : 'ادامه'}
              </button>
            </form>
          )}

          {/* Step 2: Password */}
          {step === 2 && (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setPassword('');
                  setPasswordConfirm('');
                  setError('');
                }}
                className="text-gray-400 hover:text-white text-sm mb-4"
              >
                ← تغییر شماره تلفن
              </button>

              {isExistingUser ? (
                // Existing user - single password field
                <>
                  <div className="text-center mb-6">
                    <p className="text-emerald-400 font-semibold mb-1">خوش آمدید!</p>
                    <p className="text-gray-400 text-sm">رمز عبور خود را وارد کنید</p>
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2 text-sm font-medium">
                      رمز عبور
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="رمز عبور"
                      className="w-full px-4 py-3 bg-gray-900/50 text-white rounded-xl border border-gray-600 
                               focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 
                               transition-all"
                      disabled={loading}
                    />
                  </div>
                </>
              ) : (
                // New user - two password fields
                <>
                  <div className="text-center mb-6">
                    <p className="text-emerald-400 font-semibold mb-1">ثبت نام</p>
                    <p className="text-gray-400 text-sm">رمز عبور خود را انتخاب کنید</p>
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2 text-sm font-medium">
                      رمز عبور
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={handlePasswordChange}
                      placeholder="حداقل ۸ کاراکتر"
                      className="w-full px-4 py-3 bg-gray-900/50 text-white rounded-xl border border-gray-600 
                               focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 
                               transition-all"
                      disabled={loading}
                    />
                    {password && passwordStrength && (
                      <p className={`text-xs mt-1 ${passwordStrength.color}`}>
                        قدرت رمز: {passwordStrength.text}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      باید شامل: حرف بزرگ، حرف کوچک، عدد و علامت باشد
                    </p>
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2 text-sm font-medium">
                      تکرار رمز عبور
                    </label>
                    <input
                      type="password"
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      placeholder="رمز عبور را دوباره وارد کنید"
                      className="w-full px-4 py-3 bg-gray-900/50 text-white rounded-xl border border-gray-600 
                               focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 
                               transition-all"
                      disabled={loading}
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl 
                         font-bold hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg 
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'در حال پردازش...' : isExistingUser ? 'ورود' : 'ثبت نام و ادامه'}
              </button>
            </form>
          )}

          {/* Step 3: Profile Completion */}
          {step === 3 && (
            <form onSubmit={handleCompleteProfile} className="space-y-6">
              <div className="text-center mb-6">
                <p className="text-emerald-400 font-semibold mb-1">تکمیل پروفایل</p>
                <p className="text-gray-400 text-sm">اطلاعات خود را وارد کنید</p>
              </div>

              <div>
                <label className="block text-gray-300 mb-2 text-sm font-medium">
                  نام و نام خانوادگی
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="نام و نام خانوادگی"
                  className="w-full px-4 py-3 bg-gray-900/50 text-white rounded-xl border border-gray-600 
                           focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 
                           transition-all"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2 text-sm font-medium">
                  پایه تحصیلی
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900/50 text-white rounded-xl border border-gray-600 
                           focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 
                           transition-all cursor-pointer"
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
                <label className="block text-gray-300 mb-2 text-sm font-medium">
                  رشته المپیاد
                </label>
                <select
                  value={olympiadField}
                  onChange={(e) => setOlympiadField(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900/50 text-white rounded-xl border border-gray-600 
                           focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 
                           transition-all cursor-pointer"
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
                <label className="block text-gray-300 mb-2 text-sm font-medium">
                  کد دعوت مدرسه (اختیاری)
                </label>
                <input
                  type="text"
                  value={invitationCode}
                  onChange={(e) => setInvitationCode(e.target.value)}
                  placeholder="کد دعوت (در صورت داشتن)"
                  className="w-full px-4 py-3 bg-gray-900/50 text-white rounded-xl border border-gray-600 
                           focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 
                           transition-all"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl 
                         font-bold hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg 
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'در حال ذخیره...' : 'تکمیل ثبت نام'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
