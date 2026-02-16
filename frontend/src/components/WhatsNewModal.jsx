import { useEffect, useState } from 'react';

const WhatsNewModal = () => {
  const [show, setShow] = useState(false);
  const [versionInfo, setVersionInfo] = useState(null);

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const response = await fetch('/version.json');
        const data = await response.json();
        const lastSeenVersion = localStorage.getItem('lastSeenVersion');
        
        if (!lastSeenVersion || lastSeenVersion !== data.version) {
          setVersionInfo(data);
          setShow(true);
        }
      } catch (error) {
        console.error('Error loading version info:', error);
      }
    };

    checkVersion();
  }, []);

  const handleClose = () => {
    if (versionInfo) {
      localStorage.setItem('lastSeenVersion', versionInfo.version);
    }
    setShow(false);
  };

  if (!show || !versionInfo) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={handleClose}
    >
      <div 
        className="bg-gradient-to-br from-gray-900 via-gray-850 to-gray-900 rounded-2xl max-w-2xl w-full 
                   border border-gray-700 shadow-2xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
                🎉 به‌روزرسانی جدید
              </h2>
              <div className="flex items-center gap-3 text-white/90">
                <span className="text-lg font-semibold">نسخه {versionInfo.version}</span>
                <span className="text-sm">•</span>
                <span className="text-sm">{versionInfo.releaseDate}</span>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white/80 hover:text-white text-3xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {versionInfo.changes.map((section, index) => (
            <div key={index} className="space-y-3">
              <h3 className="text-xl font-bold text-gray-200 flex items-center gap-2">
                {section.category}
              </h3>
              <ul className="space-y-2">
                {section.items.map((item, itemIndex) => (
                  <li 
                    key={itemIndex}
                    className="flex items-start gap-3 text-gray-300 bg-gray-800/50 rounded-lg p-3
                             border border-gray-700/50"
                  >
                    <span className="text-emerald-400 mt-1">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700">
          <button
            onClick={handleClose}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 
                     hover:from-purple-700 hover:to-pink-700 rounded-xl font-bold text-white
                     transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
          >
            متوجه شدم، ادامه بده! 🚀
          </button>
        </div>
      </div>
    </div>
  );
};

export default WhatsNewModal;
