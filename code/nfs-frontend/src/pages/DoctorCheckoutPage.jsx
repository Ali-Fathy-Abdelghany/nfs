import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Star,
  ShieldCheck,
  Video,
  Calendar,
  Clock,
  Award,
  ArrowRight,
} from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { fetchTherapistById } from '../api/therapists';

function formatSlotDate(startTime) {
  if (!startTime) return null;
  return new Date(startTime).toLocaleDateString('ar-EG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function formatSlotTime(startTime) {
  if (!startTime) return null;
  return new Date(startTime).toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function slotDurationMinutes(slot) {
  if (!slot?.startTime || !slot?.endTime) return 50;
  const mins = Math.round((new Date(slot.endTime) - new Date(slot.startTime)) / 60000);
  return mins > 0 ? mins : 50;
}

const DoctorCheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('home');
  const [doctor, setDoctor] = useState(location.state?.doctor || null);
  const [loading, setLoading] = useState(false);
  const slot = location.state?.slot || null;

  useEffect(() => {
    const therapistId = location.state?.doctor?.therapistId || location.state?.doctor?.id;
    if (!therapistId) return;

    let cancelled = false;
    async function refresh() {
      setLoading(true);
      try {
        const res = await fetchTherapistById(therapistId);
        const t = res.data;
        if (cancelled || !t) return;
        setDoctor((prev) => ({
          ...(prev || {}),
          id: t.therapistId,
          therapistId: t.therapistId,
          name: `د. ${t.firstName} ${t.lastName}`,
          specialty: t.specialization || prev?.specialty || '',
          rating: t.rating != null ? Number(t.rating).toFixed(1) : prev?.rating || '4.5',
          experience: t.experienceYears ? `${t.experienceYears} سنة` : prev?.experience,
          experienceYears: t.experienceYears,
          hourlyRate: t.hourlyRate ?? prev?.hourlyRate ?? 250,
          image: t.profileImageUrl || prev?.image,
          bio: t.bio || prev?.bio || '',
          specialties: t.qualifications
            ? t.qualifications.split(/[,،]/).map((s) => s.trim()).filter(Boolean)
            : prev?.specialties || (t.specialization ? [t.specialization] : []),
          email: t.email,
          phone: t.phone,
        }));
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    refresh();
    return () => {
      cancelled = true;
    };
  }, [location.state]);

  const price = Number(doctor?.hourlyRate) || 250;
  const duration = slotDurationMinutes(slot);
  const dateLabel = formatSlotDate(slot?.startTime) || 'موعد قيد التأكيد';
  const timeLabel = formatSlotTime(slot?.startTime) || '—';

  const specialties = useMemo(() => {
    if (Array.isArray(doctor?.specialties) && doctor.specialties.length) return doctor.specialties;
    if (doctor?.specialty) return [doctor.specialty];
    return ['متابعة نفسية'];
  }, [doctor]);

  const handleBooking = () => {
    navigate('/payments', {
      state: {
        doctorData: {
          ...doctor,
          hourlyRate: price,
          date: dateLabel,
          time: timeLabel,
          duration: `${duration} دقيقة`,
          avatar: doctor?.image,
          title: doctor?.specialty,
        },
        slot,
      },
    });
  };

  if (!doctor) {
    return (
      <div className="min-h-screen bg-[#F7FAFA] flex flex-col font-['Cairo',sans-serif]" dir="rtl">
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center">
          <p className="text-sm text-[#707978]">لا توجد بيانات حجز. اختر طبيباً وموعداً أولاً.</p>
          <button
            onClick={() => navigate('/dashboard', { state: { targetTab: 'booking' } })}
            className="bg-[#316764] text-white text-sm font-bold px-6 py-3 rounded-full"
          >
            العودة للحجز
          </button>
        </main>
        <Footer activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7FAFA] text-[#181C1D] font-['Cairo',sans-serif] antialiased flex flex-col" dir="rtl">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="w-full max-w-[1000px] p-4 md:p-6 space-y-6 mx-auto flex-1 pb-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-bold text-[#707978] hover:text-[#316764] transition"
        >
          <ArrowRight className="w-4 h-4" />
          العودة
        </button>

        {loading && (
          <p className="text-xs text-[#707978]">جاري تحديث بيانات المعالج...</p>
        )}

        {/* بطاقة المعالج */}
        <section className="bg-white rounded-3xl p-5 md:p-6 border border-[#E6E9E9] shadow-sm flex flex-col sm:flex-row items-center gap-5">
          <img
            src={
              doctor.image ||
              'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=256&q=80'
            }
            alt={doctor.name}
            className="w-24 h-24 md:w-28 md:h-28 rounded-2xl object-cover border-2 border-white shadow-md shrink-0"
          />
          <div className="flex-1 text-center sm:text-right space-y-2 min-w-0">
            <h1 className="text-xl md:text-2xl font-black text-[#181C1D]">{doctor.name}</h1>
            <p className="text-[#316764] text-xs font-medium">{doctor.specialty}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              {doctor.experienceYears != null && (
                <span className="flex items-center gap-1 text-[11px] text-[#316764] bg-[#E6F0EF] px-2.5 py-1 rounded-full">
                  <Award className="w-3.5 h-3.5" />
                  {doctor.experienceYears} سنة خبرة
                </span>
              )}
              <span className="flex items-center gap-1 text-[11px] text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                <Star className="w-3 h-3 fill-current" />
                <span className="font-bold">{doctor.rating}</span>
              </span>
              <span className="text-[11px] text-[#707978] bg-[#F7FAFA] px-2.5 py-1 rounded-full border border-[#E6E9E9]">
                {price} ج.م / جلسة
              </span>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* تفاصيل المعالج */}
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white rounded-3xl p-6 border border-[#E6E9E9] shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-[#316764] font-bold text-sm">
                <ShieldCheck className="w-4 h-4" />
                <h2>عن المعالج</h2>
              </div>
              <p className="text-sm text-[#707978] leading-relaxed text-right">
                {doctor.bio || 'معالج معتمد على منصة نفس، جاهز لمساعدتك في رحلتك نحو التوازن النفسي.'}
              </p>
            </section>

            <section className="bg-white rounded-3xl p-6 border border-[#E6E9E9] shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-[#316764]">مجالات الاختصاص</h2>
              <div className="flex flex-wrap gap-2 justify-start">
                {specialties.map((spec) => (
                  <span
                    key={spec}
                    className="bg-[#E6F0EF] text-[#316764] text-xs font-bold px-3 py-1.5 rounded-xl border border-[#316764]/10"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </section>

            <section className="bg-white rounded-3xl p-6 border border-[#E6E9E9] shadow-sm space-y-3">
              <h2 className="text-sm font-bold text-[#181C1D]">تفاصيل الموعد المختار</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#F7FAFA] rounded-2xl p-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#316764] shrink-0" />
                  <div className="text-right min-w-0">
                    <p className="text-[10px] text-[#707978]">التاريخ</p>
                    <p className="text-xs font-bold text-[#181C1D] truncate">{dateLabel}</p>
                  </div>
                </div>
                <div className="bg-[#F7FAFA] rounded-2xl p-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#316764] shrink-0" />
                  <div className="text-right min-w-0">
                    <p className="text-[10px] text-[#707978]">الوقت</p>
                    <p className="text-xs font-bold text-[#181C1D]">{timeLabel}</p>
                  </div>
                </div>
                <div className="bg-[#F7FAFA] rounded-2xl p-3 flex items-center gap-2">
                  <Video className="w-4 h-4 text-[#316764] shrink-0" />
                  <div className="text-right min-w-0">
                    <p className="text-[10px] text-[#707978]">المدة / النوع</p>
                    <p className="text-xs font-bold text-[#181C1D]">{duration} د • أونلاين</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* بطاقة الدفع الملخصة */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-3xl border border-[#E6E9E9] shadow-sm p-6 space-y-5 sticky top-24">
              <div className="space-y-1">
                <span className="text-[11px] text-[#707978] font-medium block">سعر الجلسة</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-[#181C1D]">{price}</span>
                  <span className="text-sm font-bold text-[#316764]">ج.م</span>
                </div>
                <p className="text-[11px] text-[#707978]">لمدة {duration} دقيقة</p>
              </div>

              <div className="space-y-2.5 text-xs text-[#707978] pt-3 border-t border-[#E6E9E9]">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-[#181C1D]">{dateLabel}</span>
                  <Calendar className="w-4 h-4 text-[#316764] shrink-0" />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-[#181C1D]">{timeLabel}</span>
                  <Clock className="w-4 h-4 text-[#316764] shrink-0" />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-[#181C1D]">جلسة فيديو أونلاين</span>
                  <Video className="w-4 h-4 text-[#316764] shrink-0" />
                </div>
              </div>

              <div className="bg-[#F7FAFA] rounded-2xl p-3 text-xs space-y-1 border border-[#E6E9E9]">
                <div className="flex justify-between">
                  <span className="text-[#707978]">قيمة الجلسة</span>
                  <span className="font-bold">{price} ج.م</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#E6E9E9]">
                  <span className="font-black text-[#181C1D]">الإجمالي</span>
                  <span className="font-black text-[#316764]">{price} ج.م</span>
                </div>
              </div>

              <button
                onClick={handleBooking}
                disabled={!slot}
                className="w-full bg-gradient-to-r from-[#316764] to-[#83B9B5] hover:opacity-95 text-white font-bold py-3.5 rounded-2xl transition text-sm shadow-sm disabled:opacity-50"
              >
                المتابعة للدفع
              </button>
              {!slot && (
                <p className="text-[11px] text-rose-500 text-center">لم يتم اختيار موعد بعد</p>
              )}
            </div>
          </aside>
        </div>
      </main>

      <Footer activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default DoctorCheckoutPage;
