import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; 
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, User, Sparkles, Activity, BookOpen, HeartHandshake, Play, Pause, X, Home, Compass, MessageCircle, BookAIcon, Book } from 'lucide-react';
import GratitudeJournal from '../components/ui/GratitudeJournal';
import MyDiaryPage from './MyDiaryPage';
import Booking from './booking';

import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { useAuth } from '../context/AuthContext';
import { fetchUserProfile } from '../api/users';
import { fetchDiariesByPatient, createDiaryEntry, updateDiaryEntry, mapDiaryToEntry } from '../api/diaries';
import { useToast } from '../context/ToastContext';
import { getApiErrorMessage } from '../utils/apiError';

const quotes = [
  { text: "الهدوء ليس غياب الفوضى، بل هو السلام في منتصفها.", author: "إلهام اليوم" },
  { text: "الاستنشاق يجلب الطاقة الجديدة، والزفير يحمل السلام والرحيل.", author: "حكمة الصباح" },
  { text: "تعلّم أن تكون ساكنًا في وسط العاصفة، لترى النور المنبعث.", author: "لحظة وعي" },
  { text: "كل نبضة قلب هي فرصة جديدة للبداية بسلام واطمئنان كامل.", author: "تأمل المساء" }
];

const MoodTracker = ({ onMoodChange }) => {
  const moods = [
    { label: 'قلق', text: 'متوتر وقلق' },
    { label: 'متوازن', text: 'متزن وهادئ' },
    { label: 'مرتاح', text: 'مرتاح ومستقر' },
    { label: 'سعيد', text: 'سعيد ومبتهج' }
  ];

  const [activeIndex, setActiveIndex] = useState(2); // الافتراضي: مرتاح

  const handleSliderChange = (e) => {
    const index = parseInt(e.target.value, 10);
    setActiveIndex(index);
    onMoodChange(moods[index].text);
  };

  const saveMood = (value) => {
  const today = new Date().toLocaleDateString('ar-EG'); // الحصول على التاريخ
  const moodHistory = JSON.parse(localStorage.getItem('userMoods') || '[]');
  
  // حفظ التقييم الجديد (أو تحديثه لو موجود في نفس اليوم)
  moodHistory.push({ name: today, value: value });
  localStorage.setItem('userMoods', JSON.stringify(moodHistory.slice(-7))); // بنحتفظ بآخر 7 أيام فقط
};

  return (
    <div className="bg-white p-8 rounded-3xl border border-neutral-100 text-right space-y-6 shadow-sm">
      <div className="flex flex-row-reverse justify-between items-center">
        <h3 className="text-xl font-bold text-neutral-900">كيف تشعر الآن؟</h3>


        
        <div className="bg-[#E6F0EF] text-[#0F766E] px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5">
          <span>😊</span>
          <span>{moods[activeIndex].text}</span>
        </div>
      </div>

      <div className="relative pt-4 pb-2">
        <input
          type="range"
          min="0"
          max={moods.length - 1}
          value={activeIndex}
          onChange={handleSliderChange}
          className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-[#0F766E] focus:outline-none"
        />

        <div className="absolute top-5 left-0 right-0 flex justify-between pointer-events-none px-1">
          {moods.map((_, idx) => (
            <div 
              key={idx} 
              className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
                idx === activeIndex ? 'bg-[#0F766E] ring-4 ring-[#0F766E]/20' : 'bg-neutral-300'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-between text-xs font-bold text-neutral-400 px-1 select-none">
        {moods.map((mood, idx) => (
          <button
            key={idx}
            onClick={() => {
              setActiveIndex(idx);
              onMoodChange(mood.text);
            }}
            className={`transition-colors duration-300 ${
              idx === activeIndex ? 'text-[#0F766E] text-sm' : 'hover:text-neutral-600'
            }`}
          >
            {mood.label}
          </button>
        ))}
      </div>
      
      <p className="text-center text-[11px] text-neutral-400 font-medium italic pt-2">
        طاقة إيجابية تملأ روحك وابتسامتك
      </p>
    </div>
  );
};

// --- باقي المكونات الفرعية ---
const ExploreSessions = ({ onPlaySession, activePlayingSession, isPlaying }) => (
  <div className="space-y-6 text-right">
    <div className="space-y-1">
      <h2 className="text-3xl font-black">اكتشف الرحلات الذهنية</h2>
      <p className="text-sm text-neutral-500">اختر الجلسة الصوتية التي تناسب احتياجك الحالي</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[
        { id: '1', title: 'تأمل السكينة والعمق الكلي', instructor: 'د. سارة الأحمد', imageUrl: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=150&q=80' },
        { id: '2', title: 'تفريغ شحنات التوتر اليومي', instructor: 'الكوتش ياسر سليمان', imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=150&q=80' }
      ].map((session) => (
        <div key={session.id} className="bg-white p-4 rounded-2xl flex flex-row-reverse items-center justify-between gap-4 border border-neutral-100">
          <div className="flex flex-row-reverse items-center gap-3">
            <img src={session.imageUrl} className="w-16 h-16 rounded-xl object-cover" alt="" />
            <div>
              <h4 className="text-sm font-bold">{session.title}</h4>
              <p className="text-xs text-neutral-500 mt-1">{session.instructor}</p>
            </div>
          </div>
          <button
            onClick={() => onPlaySession(session)}
            className="bg-[#0F766E] text-white p-3 rounded-full hover:scale-105 transition-all"
          >
            {activePlayingSession?.id === session.id && isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
          </button>
        </div>
      ))}
    </div>
  </div>
);

const ProfileStats = ({ onClearStorage }) => (
  <div className="bg-white p-8 rounded-3xl border border-neutral-100 text-right space-y-6">
    <h2 className="text-2xl font-black">الملف الشخصي والإحصائيات</h2>
    <p className="text-sm text-neutral-500">تتبع رحلتك الواعية وإدارة بياناتك المحلية.</p>
    <button onClick={onClearStorage} className="bg-rose-500/10 text-rose-600 font-bold text-xs px-6 py-3 rounded-xl hover:bg-rose-500/20 transition-all">
      مسح البيانات المحلية وإعادة تشغيل التطبيق
    </button>
  </div>
);

const BREATH_PHASES = [
  { key: 'inhale', label: 'شهيق...', hint: 'خذ شهيقاً عميقاً ببطء من الأنف (٤ ثوانٍ)', ms: 4000 },
  { key: 'hold', label: 'حبس...', hint: 'احبس النفس بهدوء (٧ ثوانٍ)', ms: 7000 },
  { key: 'exhale', label: 'زفير...', hint: 'أخرج الزفير ببطء من الفم (٨ ثوانٍ)', ms: 8000 },
];

const BreathingExercise = ({ onClose }) => {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const phase = BREATH_PHASES[phaseIndex];

  useEffect(() => {
    const id = setTimeout(
      () => setPhaseIndex((i) => (i + 1) % BREATH_PHASES.length),
      phase.ms
    );
    return () => clearTimeout(id);
  }, [phaseIndex, phase.ms]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 text-center space-y-5 relative">
        <button onClick={onClose} className="absolute top-4 left-4 p-1.5 hover:bg-neutral-100 rounded-full"><X className="w-5 h-5" /></button>
        <h3 className="text-xl font-black pt-4">تمرين التنفس ٤-٧-٨</h3>
        <p className="text-xs text-neutral-500 leading-relaxed px-2">
          أسلوب استرخاء فعّال: شهيق (٤ ث)، حبس النفس (٧ ث)، زفير (٨ ث). يساعد على تقليل القلق، علاج الأرق، وتهدئة الأعصاب.
        </p>
        <div className="breathing-circle w-32 h-32 bg-[#E6F0EF] rounded-full mx-auto flex items-center justify-center">
          <span className="text-[#0F766E] font-bold">{phase.label}</span>
        </div>
        <p className="text-sm text-neutral-600 font-medium">{phase.hint}</p>
      </div>
    </div>
  );
};

const LiveSession = ({ onClose }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
    <div className="bg-white w-full max-w-md rounded-3xl p-6 text-center space-y-4 relative">
      <button onClick={onClose} className="absolute top-4 left-4 p-1.5 hover:bg-neutral-100 rounded-full"><X className="w-5 h-5" /></button>
      <h3 className="text-xl font-black pt-4">البث المباشر: تأمل السكينة</h3>
      <div className="aspect-video bg-neutral-900 rounded-2xl flex items-center justify-center text-white/80 font-bold text-sm">
        جاري الاتصال بغرفة د. سارة...
      </div>
    </div>
  </div>
);

const SupportCircle = ({ onClose, onGoToChats }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
    <div className="bg-white w-full max-w-md rounded-3xl p-6 text-center space-y-4 relative">
      <button onClick={onClose} className="absolute top-4 left-4 p-1.5 hover:bg-neutral-100 rounded-full"><X className="w-5 h-5" /></button>
      <h3 className="text-xl font-black pt-4">دائرة الدعم الآمنة</h3>
      <p className="text-sm text-neutral-500">مساحة لمشاركة مشاعرك بسلام وسرية تامة مع المجتمع.</p>
      <button
        onClick={onGoToChats}
        className="w-full py-3 bg-gradient-to-r from-[#316764] to-[#83B9B5] text-white rounded-full font-bold shadow-md hover:opacity-90 transition-all"
      >
        الدخول إلى المحادثات
      </button>
    </div>
  </div>
);

// --- المكون الرئيسي (Dashboard) ---
export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState(null);

  const [activeTab, setActiveTab] = useState(location.state?.targetTab || 'home');
  const [activeQuoteIdx, setActiveQuoteIdx] = useState(0);
  
  const [showBreathing, setShowBreathing] = useState(false);
  const [showJournal, setShowJournal] = useState(false); 
  const [showLive, setShowLive] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

  const [playingSession, setPlayingSession] = useState(null);
  const [audioIsPlaying, setAudioIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(35); 
  const [audioTimer, setAudioTimer] = useState(142); 

  const [userMoodText, setUserMoodText] = useState('مرتاح ومستقر');

  const [entries, setEntries] = useState([]);

  useEffect(() => {
    if (location.state?.targetTab) {
      setActiveTab(location.state.targetTab);
    }
  }, [location.state]);

  useEffect(() => {
    fetchUserProfile()
      .then((res) => setProfile(res.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const patientId = user?.patientId || user?.userId || user?.id;
    if (!patientId) return;
    fetchDiariesByPatient(patientId)
      .then((res) => setEntries((res.data || []).map(mapDiaryToEntry)))
      .catch(console.error);
  }, [user]);

  const handleSaveEntry = async (newEntry) => {
    const patientId = user?.patientId || user?.userId || user?.id;
    if (!patientId) {
      toast.warning('يرجى تسجيل الدخول أولاً');
      return;
    }
    try {
      const res = await createDiaryEntry({
        patientId,
        title: newEntry.title,
        content: newEntry.content,
        mood: newEntry.mood,
      });
      const saved = mapDiaryToEntry(res.data);
      setEntries((prev) => [saved, ...prev]);
      setShowJournal(false);
      toast.success('تم حفظ المذكرة');
    } catch (err) {
      console.error(err);
      toast.error(getApiErrorMessage(err, 'تعذر حفظ المذكرة'));
    }
  };

  const handleNextQuote = () => {
    setActiveQuoteIdx((prev) => (prev + 1) % quotes.length);
  };

  useEffect(() => {
    let interval;
    if (audioIsPlaying) {
      interval = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 100) {
            setAudioIsPlaying(false);
            return 100;
          }
          return prev + 0.5;
        });
        setAudioTimer((t) => (t > 0 ? t - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [audioIsPlaying]);

  const handleTogglePlay = () => {
    setAudioIsPlaying(!audioIsPlaying);
  };

  const handlePlaySession = (session) => {
    setPlayingSession(session);
    setAudioIsPlaying(true);
    setAudioProgress(0);
    setAudioTimer(session.durationInSeconds || 240);
  };

  const formatAudioTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleClearLocalStorage = () => {
    localStorage.clear();
    window.location.reload();
  };

  const handleUpdateEntry = async (updatedEntry) => {
    try {
      await updateDiaryEntry(updatedEntry.id, {
        title: updatedEntry.title,
        content: updatedEntry.content,
        mood: updatedEntry.mood,
      });
      setEntries((prev) => prev.map((item) => (item.id === updatedEntry.id ? updatedEntry : item)));
      toast.success('تم تحديث المذكرة');
    } catch (err) {
      console.error(err);
      toast.error(getApiErrorMessage(err, 'تعذر تحديث المذكرة'));
    }
  };

  return (
    <div className="bg-[#FAFAFA] text-neutral-800 min-h-screen pb-36 overflow-x-hidden antialiased relative font-sans">
      
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* المحتوى الرئيسي للمشروع */}
      <main className="max-w-4xl mx-auto px-6 pt-8 space-y-12">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div key="home-tab" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="space-y-12">
              <section className="relative text-right space-y-2">
                <div className="flex flex-col gap-1">
                  <h1 className="text-4xl md:text-5xl font-black text-neutral-950 tracking-tight">مرحباً {profile?.firstName || user?.firstName || 'بك'}</h1>
                  <p className="text-lg text-neutral-500 font-medium">كيف حالك اليوم؟ (أنت تشعر بـ: <span className="text-[#0F766E] font-bold">{userMoodText}</span>)</p>
                  <button 
  onClick={() => setActiveTab('booking')} // التعديل هنا
  className="bg-gradient-to-r from-[#316764] to-[#83B9B5] text-white font-bold py-3 px-8 rounded-full shadow-lg hover:opacity-90 transition-all active:scale-95 whitespace-nowrap"
>
  احجز الآن
</button>
                </div>
                    
                <div className="mt-8 relative overflow-hidden rounded-3xl bg-[#E6F0EF] p-8 flex flex-col md:flex-row-reverse items-center justify-between gap-8 border border-[#0F766E]/10 group cursor-pointer transition-all duration-500 hover:bg-[#E6F0EF]/70" onClick={handleNextQuote}>
                  <div className="flex-1 space-y-3 text-right">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#0F766E] flex items-center gap-1.5 justify-end">
                      <span>{quotes[activeQuoteIdx].author}</span>
                      <Sparkles className="w-3.5 h-3.5" />
                    </span>
                    <motion.h2 key={activeQuoteIdx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-2xl md:text-3xl font-bold text-[#316764] leading-snug">
                      "{quotes[activeQuoteIdx].text}"
                    </motion.h2>
                    <p className="text-[10px] text-[#0F766E]/80 font-semibold pt-1">(اضغط في أي مكان لتلقي إلهام آخر)</p>
                  </div>
                  <div className="w-full md:w-64 h-44 rounded-2xl overflow-hidden relative shadow-sm shrink-0">
                    <img className="w-full h-full object-cover group-hover:scale-105 transition-all duration-[2000ms]" src="https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=500&q=80" alt="Water ripple" />
                  </div>
                </div>
              </section>

              <section className="relative">
                <MoodTracker onMoodChange={(mood) => setUserMoodText(mood)} />
              </section>

              <section className="grid grid-cols-1 md:grid-cols-12 gap-6 text-right">
                <div className="md:col-span-8 bg-white border border-neutral-100 rounded-3xl overflow-hidden flex flex-col md:flex-row-reverse min-h-[280px] hover:shadow-sm transition-all group">
                  {/* النص على اليمين */}
                  <div className="flex-1 p-6 md:p-8 flex flex-col justify-between gap-4 min-w-0 z-10 bg-white">
                    <div className="space-y-3">
                      <div className="bg-[#E6F0EF] inline-flex px-3.5 py-1 rounded-full text-xs font-black text-[#0F766E] border border-[#0F766E]/20">
                        جلسة بث مباشر قادمة
                      </div>
                      <h3 className="text-2xl md:text-3xl font-extrabold text-neutral-900 leading-tight">
                        تأمل السكينة العميقة
                      </h3>
                      <p className="text-neutral-500 font-medium text-sm leading-relaxed">
                        انضم إلى الجلسة المباشرة لتخفيف الضغط العصبي مع د. سارة للتركيز على تنظيم ضربات القلب.
                      </p>
                    </div>
                  </div>

                  {/* الصورة على اليسار مع زر الانضمام */}
                  <div className="relative w-full md:w-[42%] h-48 md:h-auto shrink-0 overflow-hidden">
                    <img
                      className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-all duration-[2000ms]"
                      src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80"
                      alt="Zen bamboo"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    <div className="absolute bottom-4 inset-x-4 flex justify-center">
                      <button
                        onClick={() => setShowLive(true)}
                        className="bg-[#0F766E] text-white text-xs md:text-sm font-bold py-3 px-5 rounded-full w-full max-w-[220px] hover:bg-[#316764] hover:shadow-md transition-all active:scale-95"
                      >
                        انضم الآن للبث المباشر
                      </button>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-4 bg-[#E6F0EF]/40 border border-[#0F766E]/10 rounded-3xl p-8 flex flex-col justify-between hover:shadow-sm transition-all">
                  <div className="space-y-6">
                    <div className="w-12 h-12 bg-[#E6F0EF] text-[#0F766E] rounded-2xl flex items-center justify-center">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-4xl font-black text-[#316764]">١٢٠</div>
                      <div className="text-xs text-[#316764] font-semibold opacity-90">دقيقة من التأمل هذا الأسبوع</div>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-[#0F766E]/10">
                    <p className="text-[11px] font-bold text-[#0F766E] leading-relaxed">أنت في تقدم ممتاز! استمر لـ ٣ أيام أخرى لإكمال هدفك الأسبوعي بنجاح.</p>
                  </div>
                </div>
              </section>

              <section className="space-y-6 text-right">
                <div className="flex justify-between items-center flex-row-reverse">
                  <h3 className="text-2xl font-black">ممارساتك اليومية</h3>
                  <button onClick={() => setActiveTab('explore')} className="text-[#0F766E] font-bold hover:underline text-xs">عرض جميع الجلسات</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div onClick={() => setShowBreathing(true)} className="bg-white rounded-2xl p-6 hover:shadow-md hover:scale-[1.01] transition-all group cursor-pointer border border-neutral-100">
                    <div className="w-12 h-12 bg-[#E6F0EF] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Activity className="text-[#0F766E] w-6 h-6" />
                    </div>
                    <h4 className="text-lg font-bold mb-2 text-neutral-900 group-hover:text-[#0F766E] transition-colors">تمرين التنفس ٤-٧-٨</h4>
                    <p className="text-xs text-neutral-500 leading-relaxed">تمرين سريع لتهدئة ضربات القلب والجهاز العصبي في ٥ دقائق مجانًا.</p>
                  </div>

                  <div onClick={() => setShowJournal(true)} className="bg-white rounded-2xl p-6 hover:shadow-md hover:scale-[1.01] transition-all group cursor-pointer border border-neutral-100">
                    <div className="w-12 h-12 bg-[#E6F0EF] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <BookOpen className="text-[#0F766E] w-6 h-6" />
                    </div>
                    <h4 className="text-lg font-bold mb-2 text-neutral-900 group-hover:text-[#0F766E] transition-colors">مفكرة الامتنان</h4>
                    <p className="text-xs text-neutral-500 leading-relaxed">دوّن ٣ أشياء دافئة تشعر بالامتنان وتصالح مع قلبك وتفاصيل يومك.</p>
                  </div>

                  <div onClick={() => navigate('/doctor/chats')} className="bg-white rounded-2xl p-6 hover:shadow-md hover:scale-[1.01] transition-all group cursor-pointer border border-neutral-100">
                    <div className="w-12 h-12 bg-[#E6F0EF] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <HeartHandshake className="text-[#0F766E] w-6 h-6" />
                    </div>
                    <h4 className="text-lg font-bold mb-2 text-neutral-900 group-hover:text-[#0F766E] transition-colors">دائرة الدعم</h4>
                    <p className="text-xs text-neutral-500 leading-relaxed">شارك مشاعرك بسلام مجهول تمامًا مع مجتمع "نفس" الدافئ والآمن.</p>
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'sessions' && (
            <motion.div key="sessions-tab" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="space-y-8 text-right">
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-neutral-900">جلساتي وجدولي المجدول</h2>
                <p className="text-sm text-neutral-500 font-medium">سجل الحضور الذهني والأنشطة المحجوزة المخصصة لك</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-neutral-100 text-right space-y-4">
                  <h3 className="text-base font-bold text-[#0F766E] border-b border-neutral-100 pb-2">سلسلة رحلاتك المفضلة</h3>
                  <div className="space-y-3.5">
                    <div className="flex flex-row-reverse items-center justify-between p-3 bg-neutral-50 rounded-xl">
                      <div>
                        <h4 className="text-xs font-bold text-neutral-900">تأمل النوم العميق</h4>
                        <span className="text-[10px] text-neutral-500">كوتش ياسر • ٢٥ دقيقة</span>
                      </div>
                      <button onClick={() => setShowBreathing(true)} className="bg-[#0F766E] text-white p-2 rounded-full"><Play className="w-3.5 h-3.5 fill-white" /></button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'explore' && (
            <motion.div key="explore-tab" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}>
              <ExploreSessions onPlaySession={handlePlaySession} activePlayingSession={playingSession} isPlaying={audioIsPlaying} />
            </motion.div>
          )}

          {activeTab === 'my_diary' && (
            <motion.div key="diary-tab" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}>
              <MyDiaryPage 
                entries={entries} 
                onUpdateEntry={handleUpdateEntry} 
                onOpenJournal={() => setShowJournal(true)} 
              />
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div key="profile-tab" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}>
              <ProfileStats onClearStorage={handleClearLocalStorage} />
            </motion.div>
          )}

          {activeTab === 'booking' && (
  <motion.div key="booking-tab" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}>
    <Booking preselectedDoctor={location.state?.preselectedDoctor} />
  </motion.div>
)}
        </AnimatePresence>

      </main>

      <AnimatePresence>
        {playingSession && (
          <motion.div initial={{ y: 120, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 120, opacity: 0 }} className="fixed bottom-24 left-4 right-4 md:left-1/2 md:right-auto md:w-[640px] md:-translate-x-1/2 bg-white/95 backdrop-blur-xl z-30 p-4 rounded-3xl shadow-xl border border-neutral-100 flex flex-row-reverse items-center justify-between gap-4">
            <div className="flex flex-row-reverse items-center gap-3.5">
              <img src={playingSession.imageUrl} className="w-12 h-12 rounded-xl object-cover" alt="" />
              <div className="text-right">
                <h4 className="text-xs font-black text-neutral-900">{playingSession.title}</h4>
                <p className="text-[10px] text-neutral-500 mt-0.5">{playingSession.instructor}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] text-neutral-500 font-mono">{formatAudioTime(audioTimer)}</span>
              <button onClick={handleTogglePlay} className="w-10 h-10 bg-[#0F766E] text-white rounded-full flex items-center justify-center">
                {audioIsPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
              </button>
              <button onClick={() => setPlayingSession(null)} className="text-neutral-400 hover:text-red-500"><X className="w-4 h-4" /></button>
            </div>
            <div className="absolute bottom-0 left-4 right-4 h-1 bg-neutral-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#0F766E] transition-all duration-1000" style={{ width: `${audioProgress}%` }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* الشاشات المنبثقة التفاعلية */}
      <AnimatePresence>
        {showBreathing && <BreathingExercise onClose={() => setShowBreathing(false)} />}
        {showJournal && (
          <GratitudeJournal 
            onClose={() => setShowJournal(false)} 
            onSave={handleSaveEntry} 
          />
        )}
        {showLive && <LiveSession onClose={() => setShowLive(false)} />}
        {showSupport && (
          <SupportCircle
            onClose={() => setShowSupport(false)}
            onGoToChats={() => {
              setShowSupport(false);
              navigate('/doctor/chats');
            }}
          />
        )}
      </AnimatePresence>

    </div>
  );
}