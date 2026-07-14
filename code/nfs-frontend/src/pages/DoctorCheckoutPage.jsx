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
import { doctorAvatarUrl } from '../utils/doctorAvatar';

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
  const appointmentId = location.state?.appointmentId || null;

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
          rating: t.rating != null && Number(t.rating) > 0
            ? Number(t.rating).toFixed(1)
            : prev?.rating || '—',
          reviewCount: t.reviewCount ?? prev?.reviewCount ?? 0,
          experience: t.experienceYears ? `${t.experienceYears} سنة` : prev?.experience,
          experienceYears: t.experienceYears,
          hourlyRate: t.hourlyRate ?? prev?.hourlyRate ?? 250,
          image: t.profileImageUrl || prev?.image || doctorAvatarUrl(t.therapistId),
          bio: t.bio || prev?.bio || '',
          specialties: t.qualifications
            ? t.qualifications.split(/[,،]/).map((s) => s.trim()).filter(Boolean)
            : prev?.specialties || (t.specialization ? [t.specialization] : []),
          email: t.email,
          phone: t.phone,
          isVerified: !!t.isVerified,
          reviewCount: t.reviewCount ?? prev?.reviewCount ?? 0,
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
    const payload = {
      doctorData: {
        ...doctor,
        hourlyRate: price,
        date: dateLabel,
        time: timeLabel,
        duration: `${duration} دقيقة`,
        avatar: doctor?.image,
        title: doctor?.specialty,
        rating: doctor?.rating ?? '—',
        reviews: doctor?.reviewCount ?? 0,
        therapistId: doctor?.therapistId || doctor?.id,
        id: doctor?.therapistId || doctor?.id,
      },
      slot,
      appointmentId,
    };
    try {
      sessionStorage.setItem('nafs_checkout_state', JSON.stringify(payload));
    } catch {
      /* ignore */
    }
    navigate('/payments', { state: payload });
  };

  if (!doctor) {
    return (
      <div className="h-[100dvh] overflow-hidden bg-[#F7FAFA] flex flex-col font-['Cairo',sans-serif] pb-24" dir="rtl">
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 min-h-0 flex flex-col items-center justify-center gap-3 p-4 text-center">
          <p className="text-sm text-[#707978]">لا توجد بيانات حجز. اختر طبيباً وموعداً أولاً.</p>
          <button
            onClick={() => navigate('/dashboard', { state: { targetTab: 'booking' } })}
            className="bg-[#316764] text-white text-sm font-bold px-5 py-2.5 rounded-full"
          >
            العودة للحجز
          </button>
        </main>
        <Footer activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    );
  }

  return (
    <div
      className="h-[100dvh] overflow-hidden bg-[#F7FAFA] text-[#181C1D] font-['Cairo',sans-serif] antialiased flex flex-col pb-24"
      dir="rtl"
    >
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="w-full max-w-[960px] mx-auto flex-1 min-h-0 overflow-y-auto md:overflow-hidden px-3 py-2 md:px-4 md:py-3 flex flex-col gap-2.5 md:gap-3">
        <div className="flex items-center justify-between gap-2 shrink-0">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-[11px] font-bold text-[#707978] hover:text-[#316764] transition"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            العودة
          </button>
          {loading && <p className="text-[10px] text-[#707978]">جاري التحديث...</p>}
        </div>

        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-[1.35fr_1fr] gap-2.5 md:gap-3 md:items-stretch">
          {/* يسار: المعالج + الموعد */}
          <div className="flex flex-col gap-2.5 md:gap-3 min-h-0 md:overflow-hidden">
            <section className="bg-white rounded-2xl p-3 border border-[#E6E9E9] shadow-sm flex items-center gap-3 shrink-0">
              <img
                src={
                  doctor.image ||
                  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=256&q=80'
                }
                alt={doctor.name}
                className="w-14 h-14 md:w-16 md:h-16 rounded-xl object-cover border-2 border-white shadow-sm shrink-0"
              />
              <div className="flex-1 min-w-0 text-right space-y-1">
                <h1 className="text-base md:text-lg font-black text-[#181C1D] truncate">{doctor.name}</h1>
                <p className="text-[#316764] text-[11px] font-medium truncate">{doctor.specialty}</p>
                <div className="flex flex-wrap items-center justify-start gap-1.5">
                  {doctor.experienceYears != null && (
                    <span className="flex items-center gap-0.5 text-[10px] text-[#316764] bg-[#E6F0EF] px-1.5 py-0.5 rounded-full">
                      <Award className="w-3 h-3" />
                      {doctor.experienceYears} سنة
                    </span>
                  )}
                  <span className="flex items-center gap-0.5 text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                    <Star className="w-2.5 h-2.5 fill-current" />
                    <span className="font-bold">{doctor.rating}</span>
                    {doctor.reviewCount > 0 && (
                      <span className="text-amber-700/80">({doctor.reviewCount})</span>
                    )}
                  </span>
                  <span className="text-[10px] text-[#707978] bg-[#F7FAFA] px-1.5 py-0.5 rounded-full border border-[#E6E9E9]">
                    {price} ج.م
                  </span>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-2xl p-3 border border-[#E6E9E9] shadow-sm space-y-2 min-h-0 md:flex-1 md:overflow-hidden flex flex-col">
              <div className="flex items-center gap-1.5 text-[#316764] font-bold text-xs shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" />
                <h2>عن المعالج</h2>
              </div>
              <p className="text-xs text-[#707978] leading-snug text-right line-clamp-3 md:line-clamp-4">
                {doctor.bio || 'معالج معتمد على منصة نفس، جاهز لمساعدتك في رحلتك نحو التوازن النفسي.'}
              </p>
              <div className="flex flex-wrap gap-1.5 justify-start pt-0.5 shrink-0">
                {specialties.slice(0, 4).map((spec) => (
                  <span
                    key={spec}
                    className="bg-[#E6F0EF] text-[#316764] text-[10px] font-bold px-2 py-1 rounded-lg border border-[#316764]/10"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </section>

            <section className="bg-white rounded-2xl p-3 border border-[#E6E9E9] shadow-sm space-y-2 shrink-0">
              <h2 className="text-xs font-bold text-[#181C1D]">تفاصيل الموعد</h2>
              <div className="grid grid-cols-3 gap-1.5">
                <div className="bg-[#F7FAFA] rounded-xl px-2 py-2 flex flex-col items-center sm:flex-row sm:items-center gap-1 sm:gap-1.5 text-center sm:text-right">
                  <Calendar className="w-3.5 h-3.5 text-[#316764] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[9px] text-[#707978]">التاريخ</p>
                    <p className="text-[10px] font-bold text-[#181C1D] leading-tight line-clamp-2">{dateLabel}</p>
                  </div>
                </div>
                <div className="bg-[#F7FAFA] rounded-xl px-2 py-2 flex flex-col items-center sm:flex-row sm:items-center gap-1 sm:gap-1.5 text-center sm:text-right">
                  <Clock className="w-3.5 h-3.5 text-[#316764] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[9px] text-[#707978]">الوقت</p>
                    <p className="text-[10px] font-bold text-[#181C1D]">{timeLabel}</p>
                  </div>
                </div>
                <div className="bg-[#F7FAFA] rounded-xl px-2 py-2 flex flex-col items-center sm:flex-row sm:items-center gap-1 sm:gap-1.5 text-center sm:text-right">
                  <Video className="w-3.5 h-3.5 text-[#316764] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[9px] text-[#707978]">المدة</p>
                    <p className="text-[10px] font-bold text-[#181C1D]">{duration} د • أونلاين</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* يمين: ملخص الدفع */}
          <aside className="min-h-0 md:h-full">
            <div className="bg-white rounded-2xl border border-[#E6E9E9] shadow-sm p-3.5 md:p-4 space-y-3 md:h-full md:flex md:flex-col">
              <div className="space-y-0.5">
                <span className="text-[10px] text-[#707978] font-medium block">سعر الجلسة</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl md:text-3xl font-black text-[#181C1D]">{price}</span>
                  <span className="text-sm font-bold text-[#316764]">ج.م</span>
                </div>
                <p className="text-[10px] text-[#707978]">لمدة {duration} دقيقة</p>
              </div>

              <div className="space-y-1.5 text-[11px] text-[#707978] pt-2 border-t border-[#E6E9E9]">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-[#181C1D] truncate">{dateLabel}</span>
                  <Calendar className="w-3.5 h-3.5 text-[#316764] shrink-0" />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-[#181C1D]">{timeLabel}</span>
                  <Clock className="w-3.5 h-3.5 text-[#316764] shrink-0" />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-[#181C1D]">جلسة فيديو أونلاين</span>
                  <Video className="w-3.5 h-3.5 text-[#316764] shrink-0" />
                </div>
              </div>

              <div className="bg-[#F7FAFA] rounded-xl p-2.5 text-[11px] space-y-1 border border-[#E6E9E9] md:mt-auto">
                <div className="flex justify-between">
                  <span className="text-[#707978]">قيمة الجلسة</span>
                  <span className="font-bold">{price} ج.م</span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-[#E6E9E9]">
                  <span className="font-black text-[#181C1D]">الإجمالي</span>
                  <span className="font-black text-[#316764]">{price} ج.م</span>
                </div>
              </div>

              <button
                onClick={handleBooking}
                disabled={!slot}
                className="w-full bg-gradient-to-r from-[#316764] to-[#83B9B5] hover:opacity-95 text-white font-bold py-2.5 md:py-3 rounded-xl transition text-sm shadow-sm disabled:opacity-50"
              >
                المتابعة للدفع
              </button>
              {!slot && (
                <p className="text-[10px] text-rose-500 text-center">لم يتم اختيار موعد بعد</p>
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
