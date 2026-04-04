import { useNavigate } from 'react-router-dom';
import { FiChevronLeft } from 'react-icons/fi';

const MobileHeader = () => {
  const navigate = useNavigate();

  return (
    // استفاده از dir="ltr" برای اطمینان ۱۰۰ درصدی از قرارگیری دکمه در سمت چپ
    <div className="w-full p-4 md:hidden sticky top-0 z-50 flex justify-start pointer-events-none" dir="ltr">
      <button
        onClick={() => navigate(-1)}
        // pointer-events-auto برای اینکه فقط خود دکمه قابل کلیک باشد نه کل ردیف
        className="pointer-events-auto p-2 rounded-xl bg-gray-800/80 backdrop-blur-md text-gray-300 hover:text-white hover:bg-gray-700 shadow-lg transition-all active:scale-95 flex items-center justify-center"
        aria-label="بازگشت"
      >
        <FiChevronLeft size={24} />
      </button>
    </div>
  );
};

export default MobileHeader;
