import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from 'recharts';
import { Sparkles, Clock, CalendarCheck, Play, BookOpen, Award, TrendingUp, X } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { fetchUserProfile, updateUserProfile } from '../api/users';
import { fetchAssessments } from '../api/assessments';
import { fetchPatientAppointments } from '../api/appointments';
import { fetchDiariesByPatient } from '../api/diaries';
import { ensurePatientRecord } from '../api/patientHelpers';
import { useAuth } from '../context/AuthContext';

const daysOfWeek = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

const AVATAR_OPTIONS = [
  'https://api.dicebear.com/7.x/lorelei/svg?seed=Amina&backgroundColor=dbeafe',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=Youssef&backgroundColor=ede9fe',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=Laila&backgroundColor=e0f2fe',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=Karim&backgroundColor=fef3c7',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=Nour&backgroundColor=fce7f3',
];

const MOOD_SCORE = {
  سعيد: 9,
  هادئ: 7,
  قلق: 4,
  حزين: 2,
};

function moodToScore(mood) {
  if (mood == null || mood === '') return null;
  const numeric = Number(mood);
  if (!Number.isNaN(numeric) && numeric >= 1 && numeric <= 10) return numeric;
  return MOOD_SCORE[String(mood).trim()] ?? null;
}

function buildWeekMoodData(diaries) {
  const now = new Date();
  const buckets = Array.from({ length: 7 }, () => []);

  (diaries || []).forEach((entry) => {
    const score = moodToScore(entry.mood);
    if (score == null || !entry.createdAt) return;
    const date = new Date(entry.createdAt);
    if (Number.isNaN(date.getTime())) return;
    const dayDiff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (dayDiff < 0 || dayDiff >= 7) return;
    buckets[date.getDay()].push(score);
  });

  const avg = (arr) =>
    arr.length ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : 0;

  return daysOfWeek.map((name, i) => ({ name, value: avg(buckets[i]) }));
}

function formatArabicDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('ar-EG', {
    day: 'numeric',
    month: 'long',
  });
}

function formatArabicDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  const date = d.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' });
  const time = d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  return `${time} | ${date}`;
}

function statusLabel(status) {
  const s = String(status || '').toUpperCase();
  if (s === 'COMPLETED') return 'مكتملة';
  if (s === 'CANCELLED') return 'ملغاة';
  if (s === 'PENDING') return 'قيد الانتظار';
  if (s === 'CONFIRMED' || s === 'SCHEDULED' || s === 'RESCHEDULED') return 'مجدولة';
  return status || 'جلسة';
}

function ProfileProgress() {
  const navigate = useNavigate();
  const { user } = useAuth() || {};
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [diaries, setDiaries] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState(AVATAR_OPTIONS[0]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const userId = user?.userId || user?.id;
        let patientId = user?.patientId;
        if (!patientId && userId) {
          patientId = await ensurePatientRecord(userId);
        }

        const [profileRes, appointmentsRes, diariesRes, assessmentsRes] = await Promise.all([
          fetchUserProfile().catch(() => ({ data: null })),
          patientId ? fetchPatientAppointments(patientId).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
          patientId ? fetchDiariesByPatient(patientId).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
          fetchAssessments().catch(() => ({ data: [] })),
        ]);

        if (cancelled) return;

        const profileData = profileRes.data;
        setProfile(profileData);
        if (profileData?.profileImageUrl) {
          setCurrentAvatar(profileData.profileImageUrl);
        } else if (profileData?.firstName) {
          setCurrentAvatar(
            `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(profileData.firstName)}&backgroundColor=dbeafe`
          );
        }

        setAppointments(appointmentsRes.data || []);
        setDiaries(diariesRes.data || []);

        const mine = (assessmentsRes.data || []).filter(
          (a) => !patientId || a.patientId === patientId
        );
        setAssessments(mine);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const displayName = useMemo(() => {
    if (profile?.firstName || profile?.lastName) {
      return `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
    }
    if (user?.firstName || user?.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    return 'المريض';
  }, [profile, user]);

  const firstName = profile?.firstName || user?.firstName || displayName;

  const completedSessions = useMemo(() => {
    return appointments.filter((a) => {
      const s = String(a.status || '').toUpperCase();
      return s === 'COMPLETED' || s === 'CONFIRMED' || s === 'SCHEDULED' || s === 'RESCHEDULED';
    });
  }, [appointments]);

  const completedCount = completedSessions.length;

  const totalMinutes = useMemo(() => {
    return completedSessions.reduce((sum, a) => {
      const start = a.actualStartTime || a.scheduledStartTime;
      const end = a.actualEndTime || a.scheduledEndTime;
      if (start && end) {
        const mins = Math.round((new Date(end) - new Date(start)) / 60000);
        return sum + (mins > 0 ? mins : 50);
      }
      return sum + 50;
    }, 0);
  }, [completedSessions]);

  const goalPercent = useMemo(() => {
    const monthlyGoal = 8;
    return Math.min(100, Math.round((completedCount / monthlyGoal) * 100));
  }, [completedCount]);

  const moodData = useMemo(() => buildWeekMoodData(diaries), [diaries]);
  const hasMoodData = moodData.some((d) => d.value > 0);

  const journey = useMemo(() => {
    const items = [];

    appointments.forEach((a) => {
      const start = a.actualStartTime || a.scheduledStartTime;
      items.push({
        id: `appt-${a.id}`,
        icon: <Play className="w-4 h-4" />,
        title: `جلسة مع ${a.doctorName || 'المعالج'}`,
        meta: `${a.type || 'أونلاين'} • ${statusLabel(a.status)}`,
        date: formatArabicDateTime(start),
        sortAt: start ? new Date(start).getTime() : 0,
      });
    });

    diaries.forEach((d) => {
      items.push({
        id: `diary-${d.id}`,
        icon: <BookOpen className="w-4 h-4" />,
        title: d.title || 'كتابة في المذكرة',
        meta: d.mood ? `المزاج: ${d.mood}` : 'تدوين يومي',
        date: formatArabicDate(d.createdAt),
        sortAt: d.createdAt ? new Date(d.createdAt).getTime() : 0,
      });
    });

    assessments.forEach((a) => {
      items.push({
        id: `assess-${a.assessmentId || a.id}`,
        icon: <Award className="w-4 h-4" />,
        title: a.title || 'تقييم نفسي',
        meta: a.score != null ? `النتيجة: ${a.score}` : 'تم إكمال التقييم',
        date: formatArabicDate(a.completedAt || a.createdAt),
        sortAt: new Date(a.completedAt || a.createdAt || 0).getTime(),
      });
    });

    return items.sort((a, b) => b.sortAt - a.sortAt);
  }, [appointments, diaries, assessments]);

  const achievements = useMemo(() => {
    const list = [];
    if (completedCount >= 1) {
      list.push({
        icon: <Award className="w-5 h-5" />,
        title: 'بداية الرحلة',
        desc: `أكملت ${completedCount} ${completedCount === 1 ? 'جلسة' : 'جلسات'}`,
      });
    }
    if (diaries.length >= 3) {
      list.push({
        icon: <BookOpen className="w-5 h-5" />,
        title: 'ملتزم بالتدوين',
        desc: `${diaries.length} مذكرات مسجّلة`,
      });
    }
    if (hasMoodData) {
      const avg =
        moodData.filter((d) => d.value > 0).reduce((s, d) => s + d.value, 0) /
        Math.max(1, moodData.filter((d) => d.value > 0).length);
      list.push({
        icon: <TrendingUp className="w-5 h-5" />,
        title: 'متابعة المزاج',
        desc: `متوسط مزاجك هذا الأسبوع ${avg.toFixed(1)}/10`,
      });
    }
    if (assessments.length > 0) {
      list.push({
        icon: <Sparkles className="w-5 h-5" />,
        title: 'تقييم أولي مكتمل',
        desc: 'أكملت تقييم الواحة الآمنة',
      });
    }
    if (list.length === 0) {
      list.push({
        icon: <Award className="w-5 h-5" />,
        title: 'ابدأ رحلتك',
        desc: 'احجز جلسة أو اكتب مذكرة لترى إنجازاتك هنا',
      });
    }
    return list.slice(0, 3);
  }, [completedCount, diaries.length, hasMoodData, moodData, assessments.length]);

  const handleAvatarSelect = async (avatarUrl) => {
    setCurrentAvatar(avatarUrl);
    setShowAvatarPicker(false);
    try {
      await updateUserProfile({
        firstName: profile?.firstName || user?.firstName || 'User',
        lastName: profile?.lastName || user?.lastName || '',
        phone: profile?.phone || null,
        profileImageUrl: avatarUrl,
        country: profile?.country || null,
        governorate: profile?.governorate || null,
      });
      setProfile((prev) => (prev ? { ...prev, profileImageUrl: avatarUrl } : prev));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-[#FAFAFA] text-neutral-800 min-h-screen pb-36 overflow-x-hidden antialiased font-['Cairo',sans-serif]" dir="rtl">
      <Header activeTab="profile" />

      <main className="max-w-4xl mx-auto px-6 pt-8 space-y-8">
        {loading && (
          <p className="text-sm text-neutral-500">جاري تحميل بيانات ملفك الشخصي...</p>
        )}

        <section className="flex flex-row items-center justify-between border-b border-neutral-100 pb-6">
          <div className="text-right space-y-1">
            <h1 className="text-3xl md:text-4xl font-black text-neutral-950 tracking-tight">الملف الشخصي والتقدم</h1>
            <p className="text-neutral-500 font-medium">
              مرحباً {firstName}، إليك نظرة على رحلتك نحو التوازن النفسي.
            </p>
          </div>

          <div className="flex items-center gap-4 relative">
            <div className="text-left">
              <h2 className="text-lg font-bold text-neutral-900 tracking-tight">{displayName}</h2>
              <p className="text-xs text-neutral-400">
                {profile?.email || user?.email || 'حساب مريض'}
              </p>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#0F766E]/20 hover:scale-105 transition-all focus:outline-none bg-white shadow-sm flex items-center justify-center"
                title="اضغط لتغيير الأفاتار"
              >
                <img src={currentAvatar} alt="User Avatar" className="w-full h-full object-cover" />
              </button>

              {showAvatarPicker && (
                <div className="absolute top-20 left-0 bg-white border border-neutral-200 rounded-2xl p-2.5 shadow-xl z-20 flex gap-2 justify-center items-center min-w-[240px]">
                  {AVATAR_OPTIONS.map((avatarUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAvatarSelect(avatarUrl)}
                      className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all hover:scale-110 ${
                        currentAvatar === avatarUrl ? 'border-[#0F766E]' : 'border-transparent'
                      }`}
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
            <p className="text-xs opacity-80 mt-4">
              {completedCount > 0
                ? `لقد أكملت ${goalPercent}٪ من هدف الجلسات لهذا الشهر`
                : 'ابدأ بحجز جلستك الأولى لتتبع تقدمك'}
            </p>
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-end gap-2">
                <div className="text-right">
                  <div className="text-2xl font-black">{completedCount} جلسة</div>
                  <div className="text-[11px] opacity-80">جلسات مسجّلة</div>
                </div>
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div className="flex items-center justify-end gap-2">
                <div className="text-right">
                  <div className="text-2xl font-black">{totalMinutes} دقيقة</div>
                  <div className="text-[11px] opacity-80">دقائق الجلسات</div>
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
            {!hasMoodData && (
              <p className="text-xs text-neutral-400 mb-2 text-right">
                لا توجد بيانات مزاج من يومياتك بعد — اكتب مذكرة من لوحة التحكم.
              </p>
            )}
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={moodData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fontFamily: 'inherit', fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={26}>
                  {moodData.map((entry, i) => (
                    <Cell
                      key={i}
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
              {journey.length === 0 && (
                <p className="text-xs text-neutral-400">لا توجد أنشطة مسجّلة بعد</p>
              )}
              {journey.slice(0, 3).map((item) => (
                <div key={item.id} className="flex flex-row-reverse items-start gap-3">
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
              {achievements.map((item, i) => (
                <div
                  key={i}
                  className="flex flex-row-reverse items-center gap-3 p-4 rounded-2xl bg-[#E6F0EF]/50 border border-[#0F766E]/10"
                >
                  <div className="w-10 h-10 bg-[#0F766E] text-white rounded-xl flex items-center justify-center">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900">{item.title}</h4>
                    <p className="text-[11px] text-neutral-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-[#E6F0EF] p-8 flex flex-col md:flex-row-reverse items-center justify-between gap-6 border border-[#0F766E]/10">
          <div className="text-right space-y-1">
            <h3 className="text-xl font-bold text-[#316764]">هل تشعر بالتحسن اليوم؟</h3>
            <p className="text-sm text-[#0F766E]/80">
              الاستمرارية من مفاتيح النجاح الداخلي. حدّث حالتك المزاجية من لوحة التحكم.
            </p>
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

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-xl max-h-[80vh] overflow-y-auto text-right flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
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
              {journey.length === 0 && (
                <p className="text-xs text-neutral-400">لا توجد أنشطة مسجّلة بعد</p>
              )}
              {journey.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-row-reverse items-start gap-4 p-3 rounded-2xl hover:bg-neutral-50 transition-all border border-transparent hover:border-neutral-100"
                >
                  <div className="w-10 h-10 shrink-0 bg-[#E6F0EF] text-[#0F766E] rounded-full flex items-center justify-center">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-neutral-900">{item.title}</h4>
                    <p className="text-xs text-neutral-500 mt-0.5">{item.meta}</p>
                  </div>
                  <span className="text-xs text-neutral-400 whitespace-nowrap bg-neutral-100 px-2 py-1 rounded-md">
                    {item.date}
                  </span>
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
