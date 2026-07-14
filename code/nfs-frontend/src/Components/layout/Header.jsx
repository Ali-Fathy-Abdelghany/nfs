import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, BookOpen, User, BookA, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getRoleHomePath } from '../../api/config';

const Header = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useAuth();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const userRole = localStorage.getItem('userRole') || 'patient';

  const handleLogoClick = () => {
    setActiveTab?.('home');
    const homePath = getRoleHomePath(userRole, { isAuthenticated });
    if (homePath === '/dashboard' || homePath === '/doctor/dashboard') {
      navigate(homePath, { state: { targetTab: 'home' } });
    } else {
      navigate(homePath);
    }
  };

  const handleNavigation = (tabId) => {
    setActiveTab?.(tabId);
    if (userRole === 'admin') {
      navigate('/admin');
    } else if (userRole === 'doctor') {
      navigate('/doctor/dashboard', { state: { targetTab: tabId } });
    } else {
      navigate('/dashboard', { state: { targetTab: tabId } });
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  return (
    <header className="bg-white/70 backdrop-blur-lg flex flex-row justify-between items-center w-full px-6 py-4 sticky top-0 z-40 border-b border-neutral-100 select-none" dir="rtl">
      <div className="flex items-center gap-2 cursor-pointer" onClick={handleLogoClick} role="link" title="الرئيسية">
        <img src="/nafs_icon.png" alt="logo icon" className="w-15 h-15 min-w-[24px] min-h-[24px] object-contain" />
        <div className="text-2xl font-black text-[#0F766E] font-sans tracking-wide flex items-center gap-2">
          <span>نفس</span>
          {userRole === 'doctor' && (
            <span className="text-teal-600 font-bold text-[10px] bg-[#E6F0EF] px-2 py-0.5 rounded-md border border-[#0F766E]/10">بوابة الطبيب</span>
          )}
          {userRole === 'admin' && (
            <span className="text-teal-600 font-bold text-[10px] bg-[#E6F0EF] px-2 py-0.5 rounded-md border border-[#0F766E]/10">لوحة الإدارة</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {userRole === 'doctor' ? (
          <>
            <button
              className={`w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 outline-none p-0 border-2 ${
                activeTab === 'profile'
                  ? 'text-[#0F766E] bg-[#A6CEC5] border-[#0F766E] ring-4 ring-[#0F766E]/10 shadow-xs'
                  : 'text-neutral-400 bg-slate-50 border-transparent hover:border-[#A6CEC5] hover:text-[#0F766E] hover:bg-[#A6CEC5]'
              }`}
              onClick={() => {
                setActiveTab?.('profile');
                navigate('/doctor/profile');
              }}
              title="الملف الشخصي للعيادة"
            >
              <User className="w-[22px] h-[22px]" />
            </button>

            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="w-12 h-12 flex items-center justify-center text-neutral-400 hover:text-[#0F766E] hover:bg-[#A6CEC5] focus:bg-[#A6CEC5] focus:text-[#0F766E] rounded-full transition-all duration-300 relative outline-none"
                title="الإشعارات"
              >
                <Bell className="w-[22px] h-[22px]" />
                <span className="absolute top-3.5 right-3.5 w-2 h-2 bg-rose-500 rounded-full border border-white" />
              </button>

              {isNotificationsOpen && (
                <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl border border-neutral-100 shadow-xl p-2 text-right space-y-1 animate-fade-in z-50">
                  <div className="p-2 border-b border-slate-50 flex justify-between items-center flex-row-reverse">
                    <span className="text-xs font-bold text-slate-800">التنبيهات الحالية</span>
                    <span className="text-[10px] bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded font-bold">جديد</span>
                  </div>
                  <div className="p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition">
                    <p className="text-xs font-bold text-slate-800">طلب حجز استشارة جديدة من ندى أحمد</p>
                    <span className="text-[10px] text-slate-400 block mt-0.5">منذ ١٠ دقائق</span>
                  </div>
                </div>
              )}
            </div>

            <div className="w-[1px] h-6 bg-neutral-200 mx-1" />

            <button
              onClick={handleLogout}
              className="w-12 h-12 flex items-center justify-center text-neutral-400 hover:text-rose-600 hover:bg-[#A6CEC5] focus:bg-[#A6CEC5] focus:text-rose-600 rounded-full transition-all duration-300 outline-none"
              title="تسجيل الخروج"
            >
              <LogOut className="w-[21px] h-[21px]" />
            </button>
          </>
        ) : userRole === 'admin' ? (
          <>
            <button
              className="h-11 px-4 flex items-center gap-2 rounded-full text-[#0F766E] bg-[#A6CEC5]/70 border border-[#0F766E]/15 font-bold text-xs hover:bg-[#A6CEC5] transition"
              onClick={() => navigate('/admin')}
              title="لوحة الإدارة"
            >
              <Shield className="w-4 h-4" />
              لوحة الإدارة
            </button>
            <div className="w-[1px] h-6 bg-neutral-200 mx-1" />
            <button
              onClick={handleLogout}
              className="w-12 h-12 flex items-center justify-center text-neutral-400 hover:text-rose-600 hover:bg-[#A6CEC5] focus:bg-[#A6CEC5] focus:text-rose-600 rounded-full transition-all duration-300 outline-none"
              title="تسجيل الخروج"
            >
              <LogOut className="w-[21px] h-[21px]" />
            </button>
          </>
        ) : (
          <>
            <button
              className={`w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 outline-none ${
                activeTab === 'profile'
                  ? 'text-[#0F766E] bg-[#A6CEC5] shadow-sm'
                  : 'text-neutral-400 hover:text-[#0F766E] hover:bg-[#A6CEC5] focus:bg-[#A6CEC5] focus:text-[#0F766E]'
              }`}
              onClick={() => {
                setActiveTab?.('profile');
                navigate('/profile-progress');
              }}
              title="حسابي"
            >
              <User className="w-[22px] h-[22px]" />
            </button>

            <button
              className={`w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 outline-none ${
                activeTab === 'my_diary'
                  ? 'text-[#0F766E] bg-[#A6CEC5] shadow-sm'
                  : 'text-neutral-400 hover:text-[#0F766E] hover:bg-[#A6CEC5] focus:bg-[#A6CEC5] focus:text-[#0F766E]'
              }`}
              onClick={() => handleNavigation('my_diary')}
              title="يومياتي"
            >
              <BookA className="w-[22px] h-[22px]" />
            </button>

            <button
              className={`w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 outline-none ${
                activeTab === 'sessions'
                  ? 'text-[#0F766E] bg-[#A6CEC5] shadow-sm'
                  : 'text-neutral-400 hover:text-[#0F766E] hover:bg-[#A6CEC5] focus:bg-[#A6CEC5] focus:text-[#0F766E]'
              }`}
              onClick={() => {
                setActiveTab?.('sessions');
                navigate('/sessions');
              }}
              title="جلساتي"
            >
              <BookOpen className="w-[22px] h-[22px]" />
            </button>

            <button
              className="w-12 h-12 flex items-center justify-center text-neutral-400 hover:text-[#0F766E] hover:bg-[#A6CEC5] focus:bg-[#A6CEC5] focus:text-[#0F766E] rounded-full transition-all duration-300 relative outline-none"
              title="الإشعارات"
            >
              <Bell className="w-[22px] h-[22px]" />
              <span className="absolute top-3.5 right-3.5 w-2 h-2 bg-rose-500 rounded-full border border-white" />
            </button>

            <div className="w-[1px] h-6 bg-neutral-200 mx-1" />

            <button
              onClick={handleLogout}
              className="w-12 h-12 flex items-center justify-center text-neutral-400 hover:text-rose-600 hover:bg-[#A6CEC5] focus:bg-[#A6CEC5] focus:text-rose-600 rounded-full transition-all duration-300 outline-none"
              title="تسجيل الخروج"
            >
              <LogOut className="w-[21px] h-[21px]" />
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
