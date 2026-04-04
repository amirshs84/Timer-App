import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowForward, MdIosShare, MdOutlineInstallMobile, MdGetApp } from 'react-icons/md';
import { FaApple, FaAndroid, FaWindows } from 'react-icons/fa';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { FiPlusSquare, FiChevronDown } from 'react-icons/fi';
import { usePWA } from '../hooks/PWAContext'; 

export default function InstallApp() {
  const navigate = useNavigate();
  
  // متغیر isStandalone را دیگر دریافت نمی‌کنیم چون نیازی به بررسی آن نداریم
  const { deferredPrompt, promptInstall } = usePWA();
  
  const [detectedOS, setDetectedOS] = useState('android'); 
  const [activeGuide, setActiveGuide] = useState(null);

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    
    if (/iPad|iPhone|iPod/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
      setDetectedOS('ios');
      setActiveGuide('ios');
    } else if (/Win/i.test(userAgent)) {
      setDetectedOS('windows');
      setActiveGuide('windows');
    } else if (/android/i.test(userAgent)) {
      setDetectedOS('android');
      setActiveGuide('android');
    } else {
      setDetectedOS('windows');
      setActiveGuide('windows');
    }
  }, []);

  const toggleGuide = (guide) => {
    setActiveGuide(prev => prev === guide ? null : guide);
  };

  const renderGuide = (osKey) => {
    switch (osKey) {
      case 'ios':
        return (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 transition-all duration-300">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleGuide('ios')}>
              <div className="flex items-center gap-3">
                <FaApple className="w-6 h-6 text-gray-200" />
                <h3 className="text-lg font-semibold text-white">راهنمای نصب در آیفون (iOS)</h3>
              </div>
              <FiChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${activeGuide === 'ios' ? 'rotate-180' : ''}`} />
            </div>
            {activeGuide === 'ios' && (
              <div className="pt-6 mt-4 border-t border-white/10">
                <ul className="space-y-4 text-sm text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="bg-white/10 w-6 h-6 rounded-full flex items-center justify-center shrink-0">۱</span>
                    <p>در نوار پایین مرورگر <strong>Safari</strong>، روی دکمه اشتراک‌گذاری <MdIosShare className="inline text-blue-400 w-5 h-5 mx-1 mb-1" /> کلیک کنید.</p>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-white/10 w-6 h-6 rounded-full flex items-center justify-center shrink-0">۲</span>
                    <p>منو را کمی به پایین بکشید و گزینه <strong>Add to Home Screen</strong> <FiPlusSquare className="inline text-gray-200 w-4 h-4 mx-1" /> را انتخاب کنید.</p>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-white/10 w-6 h-6 rounded-full flex items-center justify-center shrink-0">۳</span>
                    <p>در صفحه باز شده، روی کلمه <strong>Add</strong> در بالا سمت راست کلیک کنید.</p>
                  </li>
                </ul>
              </div>
            )}
          </div>
        );

      case 'android':
        return (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 transition-all duration-300">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleGuide('android')}>
              <div className="flex items-center gap-3">
                <FaAndroid className="w-6 h-6 text-emerald-400" />
                <h3 className="text-lg font-semibold text-white">راهنمای نصب در اندروید</h3>
              </div>
              <FiChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${activeGuide === 'android' ? 'rotate-180' : ''}`} />
            </div>
            {activeGuide === 'android' && (
              <div className="pt-6 mt-4 border-t border-white/10">
                {deferredPrompt ? (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-300 leading-relaxed">
                      برای نصب سریع و آسان اپلیکیشن روی دستگاه اندرویدی خود، دکمه زیر را لمس کنید:
                    </p>
                    <button 
                      onClick={promptInstall}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-xl transition-colors shadow-lg">
                      نصب اپلیکیشن
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-300 leading-relaxed">
                    در مرورگر  از منوی تنظیمات <BsThreeDotsVertical className="inline text-gray-200 mx-1" /> گزینه <strong>Install App</strong> یا <strong>Add to Home screen</strong> را انتخاب کنید.
                  </p>
                )}
              </div>
            )}
          </div>
        );

      case 'windows':
        return (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 transition-all duration-300">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleGuide('windows')}>
              <div className="flex items-center gap-3">
                <FaWindows className="w-6 h-6 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">راهنمای نصب در ویندوز</h3>
              </div>
              <FiChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${activeGuide === 'windows' ? 'rotate-180' : ''}`} />
            </div>
            {activeGuide === 'windows' && (
              <div className="pt-6 mt-4 border-t border-white/10">
                {deferredPrompt ? (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-300 leading-relaxed">
                      برای نصب برنامه روی سیستم خود، روی دکمه زیر کلیک کنید:
                    </p>
                    <button 
                      onClick={promptInstall}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl transition-colors shadow-lg">
                      نصب روی ویندوز
                    </button>
                  </div>
                ) : (
                  <ul className="space-y-4 text-sm text-gray-300">
                    <li className="flex items-start gap-3">
                      <span className="bg-white/10 w-6 h-6 rounded-full flex items-center justify-center shrink-0">۱</span>
                      <p>در مرورگر <strong>Chrome</strong> یا <strong>Edge</strong>، به نوار آدرس (بالای صفحه) نگاه کنید.</p>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-white/10 w-6 h-6 rounded-full flex items-center justify-center shrink-0">۲</span>
                      <p>روی آیکون نصب <MdGetApp className="inline text-blue-400 w-5 h-5 mx-1" /> (یا نماد مانیتور با فلش) کلیک کنید.</p>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-white/10 w-6 h-6 rounded-full flex items-center justify-center shrink-0">۳</span>
                      <p>در پنجره باز شده، روی دکمه <strong>Install</strong> کلیک کنید.</p>
                    </li>
                  </ul>
                )}
              </div>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };

  const order = {
    ios: ['ios', 'android', 'windows'],
    android: ['android', 'ios', 'windows'],
    windows: ['windows', 'android', 'ios'],
  }[detectedOS] || ['android', 'ios', 'windows'];

  return (
    <div className="min-h-[100dvh] bg-[#000000] text-gray-100 overflow-y-auto pb-12">
      {/* Header */}
      <div className="sticky top-0 bg-black/80 backdrop-blur-xl z-50 border-b border-white/10 px-4 py-4 flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center"
        >
          <MdArrowForward className="w-6 h-6 rotate-180" />
        </button>
        <h1 className="text-xl font-bold mr-4 text-emerald-400">نصب اپلیکیشن</h1>
      </div>

      <div className="max-w-md mx-auto px-4 mt-8 space-y-8">
        {/* Intro */}
        <div className="text-center space-y-3">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
            <MdOutlineInstallMobile className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold">تجربه سریع‌تر و بهتر</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            با افزودن این برنامه به صفحه اصلی خود، بدون نیاز به مرورگر و با سرعت بسیار بالا به اطلاعات خود دسترسی داشته باشید.
          </p>
        </div>

        {/* رندر داینامیک راهنماها بدون شرط بررسی نصب بودن اپلیکیشن */}
        <div className="space-y-4">
          {order.map(osKey => (
            <React.Fragment key={osKey}>
              {renderGuide(osKey)}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
