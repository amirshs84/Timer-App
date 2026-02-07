import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudyTimer } from '../hooks/useStudyTimer';
import BottomNav from '../components/BottomNav';
import { dataAPI, authAPI } from '../api/client';

const StudyTimer = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [description, setDescription] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingSlide, setOnboardingSlide] = useState(0);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [adjustedTime, setAdjustedTime] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [userName, setUserName] = useState('');
  const [todayStats, setTodayStats] = useState({ time: 0, sessions: 0 });
  const [showGuideTooltip, setShowGuideTooltip] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const { seconds, isActive, isPaused, focusLost, start, pause, resume, stop, reset } = useStudyTimer(0);

  useEffect(() => {
    const initData = async () => {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }

        try {
            // Load profile (for name) and courses
            const [subjectsRes, profileRes, statsRes] = await Promise.all([
                dataAPI.getSubjects(),
                authAPI.getProfile(),
                dataAPI.getDashboardStats()
            ]);

            setCourses(subjectsRes.data);
            setUserName(profileRes.data.full_name || 'دانشجو');
            
            // Set stats for "Today" (from dashboard stats)
            setTodayStats({ 
                time: statsRes.data.today, 
                // Note: backend dashboard stats doesn't return today's count separately in the simple view
                // We'll trust the time for now. If count is needed we might need to fetch sessions.
                sessions: 0 // Placeholder or we can fetch sessions to count
            });

        } catch (error) {
            console.error(error);
        }
    };
    
    initData();

    const hasVisited = localStorage.getItem('hasVisitedTimer');
    if (!hasVisited) {
      setShowOnboarding(true);
    }
  }, [navigate]);

  const closeOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('hasVisitedTimer', 'true');
  };

  const nextSlide = () => {
    if (onboardingSlide < 2) {
      setOnboardingSlide(onboardingSlide + 1);
    } else {
      closeOnboarding();
    }
  };

  const prevSlide = () => {
    if (onboardingSlide > 0) {
      setOnboardingSlide(onboardingSlide - 1);
    }
  };

  const handleStart = () => {
    const now = new Date();
    setStartTime(now);
    start();
  };

  const handleStop = () => {
    const studyTime = seconds;
    setEndTime(new Date());
    if (studyTime > 0) {
      setAdjustedTime(studyTime);
      setShowSaveModal(true);
    } else {
      stop();
    }
  };

  const handleSaveSession = async (finalTime, editedStartTime, editedEndTime, courseName, courseDescription) => {
    setIsSaving(true);
    try {
        await dataAPI.createSession({
            subject_name: courseName,
            description: courseDescription,
            start_time: editedStartTime.toISOString(),
            end_time: editedEndTime.toISOString(),
            // duration is calculated by backend or we can send it
        });

        // Update stats locally or re-fetch
        setTodayStats(prev => ({
            time: prev.time + finalTime,
            sessions: prev.sessions + 1
        }));
        
        // If it was a new course, add it to list (optimistic or re-fetch)
        if (!courses.find(c => c.name === courseName)) {
            // Re-fetch courses to get the new ID/Color
            const res = await dataAPI.getSubjects();
            setCourses(res.data);
        }

        setShowSaveModal(false);
        setNewCourseName('');
        setDescription('');
        setSelectedSubject('');
        stop();
        
    } catch (error) {
        console.error("Failed to save session:", error);
        alert("خطا در ذخیره جلسه مطالعه. لطفا دوباره تلاش کنید.");
    } finally {
        setIsSaving(false);
    }
  };


  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getCourseColor = (courseName) => {
    const course = courses.find(c => c.name === courseName);
    return course?.color_code || '#10b981';
  };


  const onboardingContent = [
    {
      title: 'شروع رشد با یک کلیک',
      description: 'یک درس انتخاب کنید و روی دکمه جوانه 🌱 کلیک کنید. جلسه مطالعه عمیق شما شروع می‌شود!',
      icon: '🌱'
    },
    {
      title: 'تنفس همراه با Pulse',
      description: 'دایره سبز با ریتم تنفس شما حرکت می‌کند. دم: 4 ثانیه، بازدم: 4 ثانیه. آرامش و تمرکز.',
      icon: '🫁'
    },
    {
      title: "پومودورو منعطس",
      description: '۱ یا ۲ وقفه زیر ۵ دقیقه؟ مشکلی نیست! برگردید و ادامه دهید. مهم تمرکز شماست.',
      icon: '💡'
    }
  ];


  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-black to-teal-950 text-white flex flex-col relative overflow-hidden pb-20">
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
        backgroundSize: '40px 40px'
      }}></div>
      

      {!isActive ? (
        <div className="flex-1 flex flex-col items-center justify-between py-8 px-4 relative z-10">
          <div className="text-center mt-8">
            <h1 className="text-2xl md:text-3xl font-semibold mb-2">
              سلام {userName} 👋
            </h1>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <button
              onClick={handleStart}
              className="group relative w-52 h-52 md:w-64 md:h-64 rounded-full 
                       transition-all duration-500 transform hover:scale-105
                       flex items-center justify-center"
              style={{
                border: '4px solid #10b981',
                boxShadow: '0 0 40px rgba(16, 185, 129, 0.5), 0 0 80px rgba(16, 185, 129, 0.3), inset 0 0 40px rgba(16, 185, 129, 0.1)'
              }}
            >
              <span className="absolute inset-0 rounded-full bg-emerald-500 opacity-0 group-hover:opacity-20 blur-3xl 
                             transition-opacity duration-500"></span>
              
              <div className="relative z-10">
                <svg 
                  width="80" 
                  height="80" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  className="group-hover:scale-110 transition-transform duration-300"
                  style={{ filter: 'drop-shadow(0 0 20px rgba(16, 185, 129, 0.8))' }}
                >
                  <path 
                    d="M12 4L12 20M12 4L8 8M12 4L16 8" 
                    stroke="#10b981" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="group-hover:stroke-emerald-300 transition-colors"
                  />
                  <circle 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="#10b981" 
                    strokeWidth="1.5" 
                    opacity="0.5"
                    className="group-hover:opacity-100 transition-opacity"
                  />
                </svg>
              </div>
            </button>
          </div>

          <div className="w-full max-w-md bg-gray-900/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
            <h3 className="text-center text-gray-400 text-sm mb-4">امروز</h3>
            <div className="flex justify-around">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-emerald-400">
                  {Math.floor(todayStats.time / 3600)}:{String(Math.floor((todayStats.time % 3600) / 60)).padStart(2, '0')}
                </div>
                <div className="text-xs text-gray-500 mt-1">ساعت مطالعه</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center px-4 relative z-10">
          <button
            onClick={() => setShowGuideTooltip(!showGuideTooltip)}
            className="absolute top-4 left-4 md:top-8 md:left-8 w-10 h-10 rounded-full 
                     bg-gray-800/50 hover:bg-gray-700/50 transition flex items-center justify-center
                     text-xl group"
          >
            ؟
            {showGuideTooltip && (
              <div className="absolute top-12 left-0 w-64 md:w-80 bg-gray-900 border border-gray-700 
                           rounded-xl p-4 shadow-2xl z-20 text-right animate-fadeIn">
                <h4 className="font-semibold mb-2 text-emerald-400 text-sm">
                  💡 تکنیک پومودورو منعطس
                </h4>
                <p className="text-xs text-gray-300 leading-relaxed">
                  اگر ۱ یا ۲ بار وقفه‌ی زیر ۵ دقیقه داشته باشی، مشکلی نیست. برگرد و ادامه بده! 
                  مهم این است که تمرکزت را حفظ کنی.
                </p>
              </div>
            )}
          </button>

          <div className="relative mb-12">
            <div 
              className={`relative flex items-center justify-center rounded-full ${!isPaused ? 'breathing-animation' : ''}`}
              style={{
                width: '320px',
                height: '320px',
                background: `transparent`,
                boxShadow: !isPaused 
                  ? '0 0 60px rgba(16, 185, 129, 0.4), inset 0 0 40px rgba(16, 185, 129, 0.15)'
                  : '0 0 30px rgba(16, 185, 129, 0.3)',
                border: '4px solid #10b981',
              }}
            >
              <div className="text-center">
                <div className="text-6xl md:text-7xl font-bold font-mono text-white mb-2">
                  {formatTime(seconds)}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-center items-center">
            <button
              onClick={isPaused ? resume : pause}
              className={`px-8 py-4 rounded-full font-semibold text-lg transition-all duration-200 ${
                isPaused
                  ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg shadow-emerald-500/50'
                  : 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 shadow-lg shadow-yellow-500/50'
              }`}
            >
              {isPaused ? 'ادامه ▶' : 'توقف ⏸'}
            </button>
            <button
              onClick={handleStop}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-red-500 to-pink-600 
                       hover:from-red-600 hover:to-pink-700 font-semibold text-lg
                       shadow-lg shadow-red-500/50 transition-all duration-200"
            >
              پایان ⏹
            </button>
          </div>
        </div>
      )}


      {showSaveModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-end md:items-center justify-center z-50 px-0 md:px-4 animate-fadeIn">
          <div className="bg-gray-900 rounded-t-3xl md:rounded-2xl p-6 md:p-8 max-w-lg w-full border-t-4 md:border border-emerald-500 shadow-2xl 
                        animate-slideUp md:animate-fadeIn max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-emerald-400">
              ثبت در کارنامه 📝
            </h2>
            
            <div className="mb-6">
              <label className="block text-gray-400 mb-3 text-sm font-medium">
                نام درس <span className="text-red-400">*</span>
              </label>
              
              {courses.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-2">انتخاب از درس‌های قبلی:</p>
                  <div className="flex flex-wrap gap-2">
                    {courses.map((course) => (
                      <button
                        key={course.id}
                        type="button"
                        onClick={() => {
                          setNewCourseName(course.name);
                          setSelectedSubject(course.name);
                        }}
                        className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm ${
                          newCourseName === course.name
                            ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: course.color_code || course.color }}></div>
                        {course.name}
                      </button>
                    ))}
                  </div>
                  <div className="text-center my-2 text-xs text-gray-600">یا</div>
                </div>
              )}
              
              <input
                type="text"
                value={newCourseName}
                onChange={(e) => setNewCourseName(e.target.value)}
                placeholder="نام درس جدید را بنویسید..."
                className="w-full px-4 py-3 bg-gray-950/50 text-white rounded-xl border border-gray-700 
                         focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20
                         transition-all"
                autoFocus
                disabled={isSaving}
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-400 mb-3 text-sm font-medium">
                توضیحات <span className="text-gray-600">(اختیاری)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="مثال: تمرین فصل ۳، حل تست، مرور کنکور ..."
                rows="3"
                className="w-full px-4 py-3 bg-gray-950/50 text-white rounded-xl border border-gray-700 
                         focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20
                         transition-all resize-none"
                disabled={isSaving}
              />
            </div>

            <div className="mb-6 bg-gray-800/50 rounded-xl p-4">
              <label className="block text-gray-400 mb-3 text-sm font-medium">تایم‌لاین جلسه</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-2">زمان شروع</label>
                  <input
                    type="time"
                    value={startTime ? new Date(startTime).toTimeString().slice(0, 5) : ''}
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value.split(':');
                      const newStart = new Date(startTime);
                      newStart.setHours(parseInt(hours), parseInt(minutes));
                      setStartTime(newStart);
                      
                      if (endTime) {
                        const diff = Math.floor((endTime - newStart) / 1000);
                        setAdjustedTime(Math.max(60, diff));
                      }
                    }}
                    className="w-full px-3 py-2 bg-gray-900 text-white rounded-lg border border-gray-700 
                             focus:outline-none focus:border-emerald-500 text-sm"
                    disabled={isSaving}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-2">زمان پایان</label>
                  <input
                    type="time"
                    value={endTime ? new Date(endTime).toTimeString().slice(0, 5) : ''}
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value.split(':');
                      const newEnd = new Date(endTime);
                      newEnd.setHours(parseInt(hours), parseInt(minutes));
                      setEndTime(newEnd);
                      
                      if (startTime) {
                        const diff = Math.floor((newEnd - startTime) / 1000);
                        setAdjustedTime(Math.max(60, diff));
                      }
                    }}
                    className="w-full px-3 py-2 bg-gray-900 text-white rounded-lg border border-gray-700 
                             focus:outline-none focus:border-emerald-500 text-sm"
                    disabled={isSaving}
                  />
                </div>
              </div>
              <div className="text-center text-emerald-400 text-lg font-bold mt-3">
                مدت: {Math.floor(adjustedTime / 3600)}:{String(Math.floor((adjustedTime % 3600) / 60)).padStart(2, '0')}:{String(adjustedTime % 60).padStart(2, '0')}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowSaveModal(false);
                  setNewCourseName('');
                  // تایمر ادامه می‌یابد
                }}
                disabled={isSaving}
                className="flex-1 px-6 py-3 bg-gray-800 rounded-xl hover:bg-gray-700 transition font-semibold disabled:opacity-50"
              >
                بازگشت
              </button>
              <button
                onClick={() => {
                  if (!newCourseName.trim()) {
                    alert('لطفاً نام درس را وارد کنید!');
                    return;
                  }
                  handleSaveSession(adjustedTime, startTime, endTime, newCourseName.trim(), description);
                }}
                disabled={isSaving}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl 
                         hover:from-emerald-600 hover:to-green-700 transition font-semibold shadow-lg
                         disabled:opacity-50"
              >
                {isSaving ? 'در حال ذخیره...' : '✓ ثبت در کارنامه'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showOnboarding && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 px-4 animate-fadeIn">
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl p-8 max-w-md w-full 
                        border-2 border-emerald-500/30 shadow-2xl shadow-emerald-500/20">
            <div className="text-center mb-6">
              <div className="text-7xl mb-4">{onboardingContent[onboardingSlide].icon}</div>
              <h2 className="text-2xl md:text-3xl font-bold mb-3 text-emerald-400">
                {onboardingContent[onboardingSlide].title}
              </h2>
              <p className="text-gray-300 text-base leading-relaxed">
                {onboardingContent[onboardingSlide].description}
              </p>
            </div>
            
            <div className="flex gap-2 justify-center mb-6">
              {[0, 1, 2].map((idx) => (
                <div
                  key={idx}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === onboardingSlide 
                      ? 'bg-emerald-500 w-8' 
                      : 'bg-gray-700 w-2'
                  }`}
                ></div>
              ))}
            </div>

            <div className="flex gap-3">
              {onboardingSlide > 0 && (
                <button
                  onClick={prevSlide}
                  className="flex-1 px-6 py-3 bg-gray-800 rounded-xl hover:bg-gray-700 transition font-semibold"
                >
                  ← قبلی
                </button>
              )}
              <button
                onClick={nextSlide}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl 
                         hover:from-emerald-600 hover:to-green-700 transition font-semibold shadow-lg"
              >
                {onboardingSlide === 2 ? '✓ شروع کنید!' : 'بعدی →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {focusLost && isPaused && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50 px-4 animate-fadeIn">
          <div className="bg-gradient-to-br from-orange-900/90 to-red-950/90 rounded-2xl p-8 max-w-md w-full 
                        border-2 border-orange-500 shadow-2xl shadow-orange-500/50">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-pulse">⚠️</div>
              <h2 className="text-3xl md:text-4xl font-bold mb-3 text-orange-400">توجه!</h2>
              <p className="text-gray-200 text-base md:text-lg mb-6 leading-relaxed">
                شما برنامه را ترک کردید و تایمر متوقف شد. 
                برای ادامه جلسه مطالعه، دکمه ادامه را بزنید.
              </p>
              <button
                onClick={resume}
                className="w-full px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 
                         rounded-xl hover:from-emerald-600 hover:to-green-700 
                         transition font-bold text-lg md:text-xl shadow-lg"
              >
                ✓ ادامه می‌دهم
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default StudyTimer;
