import { useNavigate, useLocation } from 'react-router-dom';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      id: 'home',
      path: '/timer',
      label: 'میز کار',
      icon: (isActive) => (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          width="28" 
          height="28" 
          fill="none" 
          stroke={isActive ? '#10b981' : '#6b7280'} 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="transition-all duration-200"
        >
          {/* Base of the lamp */}
          <rect x="5" y="19" width="14" height="2" rx="1" />
          <path d="M 10 19 V 17 a 2 2 0 0 1 4 0 v 2" />
          
          {/* Lower Arm */}
          <line x1="11" y1="16" x2="8" y2="11.5" />
          
          {/* Articulated Joint */}
          <circle cx="7.5" cy="10.5" r="1.5" />
          
          {/* Upper Arm */}
          <line x1="8.5" y1="9.5" x2="12.5" y2="5.5" />
          
          {/* Lampshade Connector & Shade */}
          <path d="M 11.5 4.5 l 2 2" />
          <path d="M 12 4 l 5.5 1.5 c 1 2.5 -0.5 5.5 -2.5 6.5 l -5 -2 c -1.5 -2 -0.5 -5 2 -6 z" />
        </svg>
      )
    },
    {
      id: 'dashboard',
      path: '/dashboard',
      label: 'پیشرفت',
      icon: (isActive) => (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          width="28" 
          height="28" 
          fill="none" 
          stroke={isActive ? '#10b981' : '#6b7280'} 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="transition-all duration-200"
        >
          {/* Base Line (Symmetrically anchored) */}
          <line x1="2" y1="21" x2="22" y2="21" />
          
          {/* Bar 1 (Height: 3.5 units) */}
          <path d="M 4.5 21 V 19 A 1.5 1.5 0 0 1 7.5 19 V 21" />
          
          {/* Bar 2 (Height: 7.0 units) */}
          <path d="M 10.5 21 V 15.5 A 1.5 1.5 0 0 1 13.5 15.5 V 21" />
          
          {/* Bar 3 (Height: 14.0 units - Taller and Dominant) */}
          <path d="M 16.5 21 V 8.5 A 1.5 1.5 0 0 1 19.5 8.5 V 21" />
          
          {/* Exponential Arrow (Flat start, steep 1.5x spike on the right) */}
          <path d="M 2 16 C 11 16, 16 7, 21 2" />
          
          {/* Arrowhead (Aligned perfectly to the steep terminal tangent) */}
          <polyline points="17.5,2 21,2 21,5.5" />
        </svg>
      )
    },
    {
      id: 'profile',
      path: '/courses',
      label: 'پروفایل',
      icon: (isActive) => (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          width="28" 
          height="28" 
          fill="none" 
          stroke={isActive ? '#10b981' : '#6b7280'} 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="transition-all duration-200"
        >
          {/* Head: Perfect geometric circle (Height: 8 units) */}
          <circle cx="12" cy="7" r="4" />
          
          {/* Body: Geometric and symmetrical paths matching the "Bar" aesthetic */}
          <path d="M 5 21 V 18 A 5 5 0 0 1 10 13 H 14 A 5 5 0 0 1 19 18 V 21" />
        </svg>
      )
    }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-t border-gray-800 z-40 safe-area-pb">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex justify-around items-center h-20 pt-1 pb-2">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center gap-1.5 px-6 py-2 rounded-xl transition-all duration-200 ${
                  active 
                    ? 'text-emerald-400' 
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <div className={`transition-transform duration-200 ${active ? 'scale-110' : ''}`}>
                  {item.icon(active)}
                </div>
                <span className={`text-[13px] font-medium transition-all duration-200 ${
                  active ? 'opacity-100' : 'opacity-70'
                }`}>
                  {item.label}
                </span>
                {active && (
                  <div className="absolute bottom-0 w-12 h-1 bg-emerald-500 rounded-t-full"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;

