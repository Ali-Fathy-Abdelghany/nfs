import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HeartHandshake, Shield, Users } from 'lucide-react';
import Header from '../components/layout/Header';
import { useAuth } from '../context/AuthContext';
import { getRoleHomePath } from '../api/config';

const pillars = [
  {
    icon: Shield,
    title: 'مساحة آمنة',
    text: 'دعم بلا أحكام مسبقة، بخصوصية تمنحك راحة للبَوح والبدء.',
  },
  {
    icon: HeartHandshake,
    title: 'خطوة أولى أسهل',
    text: 'نسهّل الوصول للدعم النفسي من التقييم والحجز حتى المتابعة اليومية.',
  },
  {
    icon: Users,
    title: 'مصممة لمنطقتنا',
    text: 'تجربة عربية تراعي ثقافة الشرق الأوسط وتجعل طلب المساعدة أمرًا طبيعيًا.',
  },
];

export default function About() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth() || {};

  const goHome = () => {
    const role = localStorage.getItem('userRole');
    const home = getRoleHomePath(role, { isAuthenticated });
    navigate(home === '/' ? '/' : home);
  };

  return (
    <div className="bg-[#FAFAFA] text-neutral-800 min-h-screen pb-16 overflow-x-hidden antialiased relative font-sans" dir="rtl">
      <Header />

      <main className="max-w-4xl mx-auto px-6 pt-10 space-y-10">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-3xl bg-[#E6F0EF] border border-[#0F766E]/10 px-8 py-14 md:px-12 md:py-20 text-center"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#316764]/5 via-transparent to-[#83B9B5]/20 pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center gap-6">
            <img
              src="/nafs_icon.png"
              alt="شعار نفس"
              className="w-48 h-48 md:w-64 md:h-64 object-contain drop-shadow-md"
            />
            <p className="text-base md:text-lg text-[#0F766E] font-semibold max-w-md mx-auto leading-relaxed">
              نَفْس... لأن راحتك تبدأ من الداخل.
            </p>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="bg-white rounded-3xl border border-neutral-100 p-8 md:p-10 text-right space-y-5 shadow-sm"
        >
          <h2 className="text-2xl font-black text-neutral-900">لماذا نَفْس؟</h2>
          <p className="text-neutral-600 leading-relaxed font-medium text-sm md:text-base">
            في مصر والشرق الأوسط يزداد الاحتياج للدعم النفسي، لكن الخطوة الأولى غالبًا صعبة بسبب الوصمة،
            الخوف من الحكم، وصعوبة الوصول لمعالج مناسب. نَفْس وُجدت لتسهيل هذه البداية… والاستمرار فيها
            بالطريقة التي تناسبك.
          </p>
          <p className="text-neutral-600 leading-relaxed font-medium text-sm md:text-base">
            نهدف إلى توفير دعم آمن وسهل الوصول وخالٍ من الأحكام، وكسر وصمة العار المرتبطة بالصحة النفسية،
            وجعل طلب المساعدة أمرًا طبيعيًا ومناسبًا لثقافتنا.
          </p>
        </motion.section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.12 + idx * 0.06 }}
                className="bg-white rounded-3xl border border-neutral-100 p-6 text-right space-y-3 hover:shadow-sm transition-shadow"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#E6F0EF] text-[#0F766E] flex items-center justify-center border border-[#0F766E]/10">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900">{item.title}</h3>
                <p className="text-xs text-neutral-500 leading-relaxed font-medium">{item.text}</p>
              </motion.div>
            );
          })}
        </section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.28 }}
          className="rounded-3xl bg-gradient-to-l from-[#316764] to-[#83B9B5] p-8 md:p-10 text-white text-center space-y-5 shadow-md"
        >
          <h2 className="text-2xl font-black">رحلتك تستحق مساحة هادئة</h2>
          <p className="text-sm text-white/90 max-w-xl mx-auto leading-relaxed font-medium">
            سواء محتاج تنضم لمجموعة دعم، تحجز جلسة، أو تفضفض مع المساعد الذكي — نَفْس معك في الخطوة الأولى وما بعدها.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
            <button
              type="button"
              onClick={goHome}
              className="h-11 px-7 rounded-full bg-white text-[#0F766E] font-bold text-sm hover:bg-[#E6F0EF] transition-all active:scale-[0.98]"
            >
              ابدأ الاستكشاف
            </button>
            {!isAuthenticated && (
              <button
                type="button"
                onClick={() => navigate('/select-role')}
                className="h-11 px-7 rounded-full bg-white/15 border border-white/30 text-white font-bold text-sm hover:bg-white/25 transition-all active:scale-[0.98]"
              >
                ابدأ رحلتك
              </button>
            )}
          </div>
        </motion.section>
      </main>
    </div>
  );
}
