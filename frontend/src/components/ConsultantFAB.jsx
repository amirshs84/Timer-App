import { useState } from 'react';

const ConsultantFAB = () => {
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const [requestUrgent, setRequestUrgent] = useState(false);
  const [messageType, setMessageType] = useState('consultant'); // 'consultant' or 'support'
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Save ticket to localStorage
    const tickets = JSON.parse(localStorage.getItem('consultantTickets') || '[]');
    const newTicket = {
      id: Date.now(),
      message: message,
      urgent: requestUrgent,
      type: messageType, // باگ برطرف شد: ذخیره نوع پیام
      date: new Date().toISOString(),
      status: 'pending'
    };
    tickets.push(newTicket);
    localStorage.setItem('consultantTickets', JSON.stringify(tickets));
    
    // Show success state
    setSubmitted(true);
    
    // Reset after 2 seconds
    setTimeout(() => {
      setShowModal(false);
      setMessage('');
      setRequestUrgent(false);
      setSubmitted(false);
    }, 2000);
  };

  const handleClose = () => {
    setShowModal(false);
    setMessage('');
    setRequestUrgent(false);
    setSubmitted(false);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-24 left-6 w-14 h-14 md:w-16 md:h-16 bg-gradient-to-r from-purple-600 to-pink-600 
                 rounded-full shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70
                 flex items-center justify-center text-2xl md:text-3xl z-[60]
                 transition-all duration-300 transform hover:scale-110 active:scale-95"
        title="با من حرف بزن"
      >
        💬
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[70] px-4">
          <div className="bg-gray-900 rounded-2xl p-8 max-w-lg w-full border border-gray-800 shadow-2xl">
            {!submitted ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-200">با من حرف بزن</h2>
                    <p className="text-gray-500 text-sm mt-1">اینجا می‌تونی مستقیم باهام در ارتباط باشی</p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-white text-2xl"
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Message Type Selection */}
                  <div>
                    <label className="block text-gray-400 mb-3 text-sm">در چه موردی می‌خوای باهام صحبت کنی؟</label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setMessageType('consultant')}
                        className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                          messageType === 'consultant'
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-750'
                        }`}
                      >
                        مشاوره درسی
                      </button>
                      <button
                        type="button"
                        onClick={() => setMessageType('support')}
                        className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                          messageType === 'support'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-750'
                        }`}
                      >
                        پشتیبانی سایت
                      </button>
                    </div>
                  </div>{/* Message Field */}
                  <div>
                    <label className="block text-gray-400 mb-3 text-sm">متن پیامت</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="هر سوال یا درددلی داری اینجا برام بنویس..."
                      className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 
                               focus:outline-none focus:border-purple-500 resize-none h-32"
                      required
                      autoFocus
                    />
                  </div>

                  {/* Urgent Consultation Checkbox */}
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={requestUrgent}
                        onChange={(e) => setRequestUrgent(e.target.checked)}
                        className="mt-1 w-5 h-5 rounded border-gray-600 text-purple-600 
                                 focus:ring-purple-500 focus:ring-2 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="text-white font-semibold flex items-center gap-2">
                          نیاز به تماس فوری دارم!
                          <span className="text-red-400">⚡</span>
                        </div>
                        <div className="text-gray-400 text-sm mt-1">
                          در اولین فرصت باهات تماس می‌گیرم
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="flex-1 px-6 py-3 bg-gray-800 rounded-lg hover:bg-gray-700 
                               transition font-semibold"
                    >
                      بی‌خیال
                    </button>
                    <button
                      type="submit"
                      disabled={!message.trim()}
                      className={`flex-1 px-6 py-3 rounded-lg font-semibold transition
                               ${requestUrgent 
                                 ? 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700' 
                                 : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'}
                               disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {requestUrgent ? '🚨 زود بهم زنگ بزن' : 'برام بفرست'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              // Success State
              <div className="text-center py-8">
                <div className="text-7xl mb-4">
                  {requestUrgent ? '🚨' : '✅'}
                </div>
                <h3 className="text-3xl font-bold mb-3 text-green-400">
                  {requestUrgent ? 'درخواست فوریت رسید به دستم!' : 'پیامت رو با موفقیت دریافت کردم!'}
                </h3>
                <p className="text-gray-400">
                  {requestUrgent 
                    ? 'حواسم هست، تو اولین فرصت باهات تماس می‌گیرم.'
                    : 'به زودی پیامتو می‌خونم و جواب می‌دم.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ConsultantFAB;
