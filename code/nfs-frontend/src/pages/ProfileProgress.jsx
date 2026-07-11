import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from 'recharts';
import { Sparkles, Clock, CalendarCheck, Play, BookOpen, Award, TrendingUp, X } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const daysOfWeek = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

const journey = [
  { icon: <Play className="w-4 h-4" />, title: 'جلسة "التخلص من قلق العمل"', meta: 'مع د. أحمد مصطفى • ٥٠ دقيقة', date: '09:00 | ١٢ أكتوبر' },
  { icon: <BookOpen className="w-4 h-4" />, title: 'كتابة في مذكرات الامتنان', meta: 'تدوين ٣ لحظات إيجابية', date: '١١ أكتوبر' },
  { icon: <Play className="w-4 h-4" />, title: 'جلسة تأمل "التنفس العميق"', meta: 'قبل ٥ أيام • ١٥ دقيقة', date: '١٠ أكتوبر' },
  { icon: <Play className="w-4 h-4" />, title: 'جلسة "تنظيم النوم وتحسين المزاج"', meta: 'مع د. سارة علي • ٣٠ دقيقة', date: '٠٨ أكتوبر' },
  { icon: <BookOpen className="w-4 h-4" />, title: 'تمرين كتابة الأفكار السلبية', meta: 'تفريغ ذهني كامل', date: '٠٦ أكتوبر' },
];

const AVATAR_OPTIONS = [
  "https://api.dicebear.com/7.x/lorelei/svg?seed=Amina&backgroundColor=dbeafe",
  "https://api.dicebear.com/7.x/lorelei/svg?seed=Youssef&backgroundColor=ede9fe",
  "https://api.dicebear.com/7.x/lorelei/svg?seed=Laila&backgroundColor=e0f2fe",
  "https://api.dicebear.com/7.x/lorelei/svg?seed=Karim&backgroundColor=fef3c7",
  "https://api.dicebear.com/7.x/lorelei/svg?seed=Nour&backgroundColor=fce7f3"
];

function ProfileProgress() {
  const [moodData, setMoodData] = useState([]);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState(AVATAR_OPTIONS[0]);

  useEffect(() => {
    const savedMoods = JSON.parse(localStorage.getItem('userMoods') || '[]');
    if (savedMoods.length > 0) {
      setMoodData(savedMoods);
    } else {
      setMoodData([{ name: 'السبت', value: 6 }, { name: 'الأحد', value: 4 }]);
    }
  }, []);

  // دالة لتجهيز البيانات لضمان ظهور 7 أيام
  const getFullMoodData = (existingData) => {
    return daysOfWeek.map(day => {
      const found = existingData.find(item => item.name === day);
      return found ? found : { name: day, value: 0 };
    });
  };

  const fullMoodData = getFullMoodData(moodData);

  return (
    <div className="bg-[#FAFAFA] text-neutral-800 min-h-screen pb-36 overflow-x-hidden antialiased font-sans" dir="rtl">
      <Header activeTab="profile" />

      <main className="max-w-4xl mx-auto px-6 pt-8 space-y-8">

        {/* قسم رأس الصفحة المطور: يجمع بين العنوان والأفاتار */}
        <section className="flex flex-row items-center justify-between border-b border-neutral-100 pb-6">
          <div className="text-right space-y-1">
            <h1 className="text-3xl md:text-4xl font-black text-neutral-950 tracking-tight">الملف الشخصي والتقدم</h1>
            <p className="text-neutral-500 font-medium">مرحباً سارة، إليك نظرة على رحلتك نحو التوازن النفسي.</p>
          </div>

          {/* الأفاتار والاسم بجانب العنوان */}
          <div className="flex items-center gap-4 relative">
            <div className="text-left">
              <h2 className="text-lg font-bold text-neutral-900 tracking-tight">سارة أحمد</h2>
              <p className="text-xs text-neutral-400">حساب مريض متميز</p>
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#0F766E]/20 hover:scale-105 transition-all focus:outline-none bg-white shadow-sm flex items-center justify-center"
                title="اضغط لتغيير الأفاتار"
              >
                <img 
                  src={currentAvatar} 
                  alt="User Avatar" 
                  className="w-full h-full object-cover"
                />
              </button>

              {/* قائمة اختيار الأفاتارز الجاهزة */}
              {showAvatarPicker && (
                <div className="absolute top-20 left-0 bg-white border border-neutral-200 rounded-2xl p-2.5 shadow-xl z-20 flex gap-2 justify-center items-center min-w-[240px]">
                  {AVATAR_OPTIONS.map((avatarUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setCurrentAvatar(avatarUrl);
                        setShowAvatarPicker(false);
                      }}
                      className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all hover:scale-110 ${currentAvatar === avatarUrl ? 'border-[#0F766E]' : 'border-transparent'}`}
                    >
                      <img src={avatarUrl} alt="Avatar option" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-4 rounded-3xl bg-gradient-to-br from-[#316764] to-[#0F766E] p-7 text-white flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between">
              <Sparkles className="w-6 h-6 opacity-80" />
              <span className="text-sm font-bold opacity-90">الملخص العام</span>
            </div>
            <p className="text-xs opacity-80 mt-4">لقد أكملت ٩٨٪ من أهدافك لهذا الشهر</p>
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-end gap-2">
                <div className="text-right">
                  <div className="text-2xl font-black">24 جلسة</div>
                  <div className="text-[11px] opacity-80">جلسات مكتملة</div>
                </div>
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div className="flex items-center justify-end gap-2">
                <div className="text-right">
                  <div className="text-2xl font-black">480 دقيقة</div>
                  <div className="text-[11px] opacity-80">دقائق الوعي</div>
                </div>
                <Clock className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="md:col-span-8 rounded-3xl bg-white border border-neutral-100 p-7 shadow-sm">
            <div className="flex flex-row-reverse items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-neutral-900">مؤشر الحالة المزاجية</h3>
              <span className="bg-[#E6F0EF] text-[#0F766E] px-3 py-1 rounded-full text-xs font-bold">آخر 7 أيام</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
  <BarChart data={fullMoodData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
    <XAxis 
      dataKey="name" 
      tick={{ fontFamily: 'inherit', fontSize: 11, fill: '#94a3b8' }} 
      axisLine={false} 
      tickLine={false} 
    />
    <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={26}>
      {fullMoodData.map((entry, i) => (
        <Cell 
          key={i} 
          // اللون الأخضر لو فيه داتا، والرمادي الخفيف لو مفيش (قيمة 0)
          fill={entry.value > 0 ? (entry.value >= 8 ? '#0a3f3a' : '#32605d') : '#E2E8F0'} 
        />
      ))}
    </Bar>
  </BarChart>
</ResponsiveContainer>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-7 rounded-3xl bg-white border border-neutral-100 p-7 shadow-sm text-right">
            <div className="flex flex-row-reverse items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-neutral-900">تاريخ الرحلة</h3>
              <button 
                onClick={() => setIsModalOpen(true)} 
                className="text-[#0F766E] text-xs font-bold hover:underline transition-all"
              >
                عرض الكل
              </button>
            </div>
            <div className="space-y-5">
              {journey.slice(0, 3).map((item, i) => (
                <div key={i} className="flex flex-row-reverse items-start gap-3">
                  <div className="w-9 h-9 shrink-0 bg-[#E6F0EF] text-[#0F766E] rounded-full flex items-center justify-center">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-neutral-900">{item.title}</h4>
                    <p className="text-[11px] text-neutral-500 mt-0.5">{item.meta}</p>
                  </div>
                  <span className="text-[11px] text-neutral-400 whitespace-nowrap">{item.date}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-5 rounded-3xl bg-white border border-neutral-100 p-7 shadow-sm text-right">
            <h3 className="text-lg font-bold text-neutral-900 mb-5">أبرز الإنجازات</h3>
            <div className="space-y-4">
              <div className="flex flex-row-reverse items-center gap-3 p-4 rounded-2xl bg-[#E6F0EF]/50 border border-[#0F766E]/10">
                <div className="w-10 h-10 bg-[#0F766E] text-white rounded-xl flex items-center justify-center"><Award className="w-5 h-5" /></div>
                <div>
                  <h4 className="text-sm font-bold text-neutral-900">أسبوع الالتزام</h4>
                  <p className="text-[11px] text-neutral-500">أكملت ٧ جلسات متتالية</p>
                </div>
              </div>
              <div className="flex flex-row-reverse items-center gap-3 p-4 rounded-2xl bg-[#E6F0EF]/50 border border-[#0F766E]/10">
                <div className="w-10 h-10 bg-[#0F766E] text-white rounded-xl flex items-center justify-center"><TrendingUp className="w-5 h-5" /></div>
                <div>
                  <h4 className="text-sm font-bold text-neutral-900">نمو المزاج</h4>
                  <p className="text-[11px] text-neutral-500">تحسن ملحوظ في مؤشر مزاجك</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-[#E6F0EF] p-8 flex flex-col md:flex-row-reverse items-center justify-between gap-6 border border-[#0F766E]/10">
          <div className="text-right space-y-1">
            <h3 className="text-xl font-bold text-[#316764]">هل تشعرين بالتحسن اليوم؟</h3>
            <p className="text-sm text-[#0F766E]/80">الاستمرارية من مفاتيح النجاح الداخلي. شاركينا حالتك الآن لتساعدك في اختيار الجلسة القادمة.</p>
          </div>
          <button
            onClick={() => navigate('/dashboard', { state: { targetTab: 'home' } })}
            className="bg-[#0F766E] text-white font-bold px-7 py-3.5 rounded-full hover:bg-[#316764] transition-all whitespace-nowrap"
          >
            تحديث الحالة المزاجية
          </button>
        </section>
      </main>

      <Footer activeTab="profile" />

      {/* النافذة المنبثقة لعرض الكل */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-xl max-h-[80vh] overflow-y-auto text-right flex flex-col" onClick={(e) => e.stopPropagation()}>
            
            <div className="flex flex-row-reverse items-center justify-between border-b border-neutral-100 pb-4 mb-4">
              <h3 className="text-xl font-black text-neutral-950">كل الأنشطة وتاريخ الرحلة</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto pl-2">
              {journey.map((item, i) => (
                <div key={i} className="flex flex-row-reverse items-start gap-4 p-3 rounded-2xl hover:bg-neutral-50 transition-all border border-transparent hover:border-neutral-100">
                  <div className="w-10 h-10 shrink-0 bg-[#E6F0EF] text-[#0F766E] rounded-full flex items-center justify-center">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-neutral-900">{item.title}</h4>
                    <p className="text-xs text-neutral-500 mt-0.5">{item.meta}</p>
                  </div>
                  <span className="text-xs text-neutral-400 whitespace-nowrap bg-neutral-100 px-2 py-1 rounded-md">{item.date}</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileProgress;