import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, MessageCircle, BookOpen, Compass, User } from 'lucide-react'; 

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation(); // لقراءة المسار الحالي في المتصفح

  // دالة لتحديد التبويب النشط ديناميكياً بناءً على الـ URL الحالي
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/dashboard' || path === '/') return 'home';
    if (path.includes('/doctor/chats')) return 'chat';
    if (path.includes('/doctor/sessions')) return 'sessions';
    if (path.includes('/doctor/library')) return 'explore';
    if (path.includes('/profile-progress')) return 'profile';
    return '';
  };

  const activeTab = getActiveTab();

  return (
    <nav dir="rtl" className="fixed bottom-0 left-0 w-full z-50 flex flex-row justify-around items-center px-4 pb-6 pt-3.5 bg-white/90 backdrop-blur-xl rounded-t-[32px] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] border-t border-neutral-100">
      
      {/* الرئيسية */}
      <button 
        onClick={() => navigate('/dashboard')} 
        className={`flex flex-col items-center justify-center px-4 py-2 rounded-2xl transition-all duration-300 outline-none
          ${activeTab === 'home' 
            ? 'text-[#0F766E] bg-[#A6CEC5] font-bold shadow-sm' 
            : 'text-neutral-400 hover:text-[#0F766E] hover:bg-[#A6CEC5]/30'
          }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] mt-1">الرئيسية</span>
      </button>

      {/* محادثات */}
      <button 
        onClick={() => navigate('/doctor/chats')} 
        className={`flex flex-col items-center justify-center px-4 py-2 rounded-2xl transition-all duration-300 outline-none
          ${activeTab === 'chat' 
            ? 'text-[#0F766E] bg-[#A6CEC5] font-bold shadow-sm' 
            : 'text-neutral-400 hover:text-[#0F766E] hover:bg-[#A6CEC5]/30'
          }`}
      >
        <MessageCircle className="w-5 h-5" />
        <span className="text-[10px] mt-1">محادثات</span>
      </button>

      {/* جلساتي */}
      <button 
        onClick={() => navigate('/doctor/sessions')} 
        className={`flex flex-col items-center justify-center px-4 py-2 rounded-2xl transition-all duration-300 outline-none
          ${activeTab === 'sessions' 
            ? 'text-[#0F766E] bg-[#A6CEC5] font-bold shadow-sm' 
            : 'text-neutral-400 hover:text-[#0F766E] hover:bg-[#A6CEC5]/30'
          }`}
      >
        <BookOpen className="w-5 h-5" />
        <span className="text-[10px] mt-1">جلساتي</span>
      </button>

      {/* اكتشف */}
      <button 
        onClick={() => navigate('/doctor/library')} 
        className={`flex flex-col items-center justify-center px-4 py-2 rounded-2xl transition-all duration-300 outline-none
          ${activeTab === 'explore' 
            ? 'text-[#0F766E] bg-[#A6CEC5] font-bold shadow-sm' 
            : 'text-neutral-400 hover:text-[#0F766E] hover:bg-[#A6CEC5]/30'
          }`}
      >
        <Compass className="w-5 h-5" />
        <span className="text-[10px] mt-1">اكتشف</span>
      </button>

      {/* حسابي */}
      <button 
        onClick={() => navigate('/profile-progress')} 
        className={`flex flex-col items-center justify-center px-4 py-2 rounded-2xl transition-all duration-300 outline-none
          ${activeTab === 'profile' 
            ? 'text-[#0F766E] bg-[#A6CEC5] font-bold shadow-sm' 
            : 'text-neutral-400 hover:text-[#0F766E] hover:bg-[#A6CEC5]/30'
          }`}
      >
        <User className="w-5 h-5" />
        <span className="text-[10px] mt-1">حسابي</span>
      </button>

    </nav>
  );
};

export default Footer;