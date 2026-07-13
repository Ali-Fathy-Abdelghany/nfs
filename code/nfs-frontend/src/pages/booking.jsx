import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Calendar, Clock, MapPin, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchTherapists, searchTherapists } from '../api/therapists';
import { fetchDoctorAvailability, createAppointment, fetchPatientAppointments } from '../api/appointments';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getApiErrorMessage } from '../utils/apiError';

const WEEKDAY_LABELS = ['أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'];
const MONTH_LABELS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

function mapTherapistToDoctor(t) {
  return {
    id: t.therapistId,
    therapistId: t.therapistId,
    userId: t.userId,
    name: `د. ${t.firstName} ${t.lastName}`,
    specialty: t.specialization || t.bio || 'معالج نفسي',
    availability: 'متاح للحجز',
    sessions: t.experienceYears ? `+${t.experienceYears * 50}` : '+100',
    rating: t.rating?.toFixed(1) || '4.8',
    experience: t.experienceYears ? `${t.experienceYears} سنة` : '5 سنوات',
    price: t.hourlyRate ? `${t.hourlyRate} ج.م / جلسة` : '150 ج.م / جلسة',
    hourlyRate: t.hourlyRate || 250,
    image: t.profileImageUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
    categories: t.specialization ? [t.specialization] : ['قلق'],
    sessionTypes: ['فيديو'],
    bio: t.bio || '',
    specialties: t.qualifications ? t.qualifications.split(',').map((s) => s.trim()) : [t.specialization].filter(Boolean),
  };
}

function toDateKey(date) {
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatTime(slot) {
  return new Date(slot.startTime).toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function BookingCalendar({ slots, selectedDate, onSelectDate, selectedSlot, onSelectSlot }) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const availableDates = useMemo(() => {
    const set = new Set();
    (slots || []).forEach((s) => set.add(toDateKey(s.startTime)));
    return set;
  }, [slots]);

  const firstAvailable = useMemo(() => {
    const sorted = [...availableDates].sort();
    return sorted[0] || toDateKey(today);
  }, [availableDates, today]);

  const [viewMonth, setViewMonth] = useState(() => {
    const base = selectedDate || firstAvailable;
    const d = new Date(`${base}T00:00:00`);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  useEffect(() => {
    if (!selectedDate && firstAvailable) {
      onSelectDate(firstAvailable);
      const d = new Date(`${firstAvailable}T00:00:00`);
      setViewMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    }
  }, [firstAvailable, selectedDate, onSelectDate]);

  const daysInMonth = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const firstDow = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDow; i++) cells.push(null);
    for (let day = 1; day <= totalDays; day++) {
      cells.push(new Date(year, month, day));
    }
    return cells;
  }, [viewMonth]);

  const daySlots = useMemo(() => {
    if (!selectedDate) return [];
    return (slots || [])
      .filter((s) => toDateKey(s.startTime) === selectedDate)
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  }, [slots, selectedDate]);

  const prevMonth = () =>
    setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  const nextMonth = () =>
    setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-[#E6E9E9] p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={nextMonth}
            className="w-8 h-8 rounded-full bg-[#F7FAFA] hover:bg-[#E6F0EF] flex items-center justify-center text-[#316764]"
            aria-label="الشهر التالي"
          >
            <ChevronLeft size={16} />
          </button>
          <h5 className="text-sm font-black text-[#181C1D]">
            {MONTH_LABELS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
          </h5>
          <button
            type="button"
            onClick={prevMonth}
            className="w-8 h-8 rounded-full bg-[#F7FAFA] hover:bg-[#E6F0EF] flex items-center justify-center text-[#316764]"
            aria-label="الشهر السابق"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {WEEKDAY_LABELS.map((d) => (
            <div key={d} className="text-[10px] font-bold text-[#707978] py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {daysInMonth.map((dateObj, idx) => {
            if (!dateObj) return <div key={`e-${idx}`} className="aspect-square" />;

            const key = toDateKey(dateObj);
            const isPast = dateObj < today;
            const hasSlots = availableDates.has(key);
            const isSelected = selectedDate === key;
            const isToday = key === toDateKey(today);
            const clickable = hasSlots && !isPast;

            return (
              <button
                key={key}
                type="button"
                disabled={!clickable}
                onClick={() => {
                  onSelectDate(key);
                  onSelectSlot(null);
                }}
                className={[
                  'aspect-square rounded-xl text-xs font-bold transition relative flex flex-col items-center justify-center',
                  isSelected
                    ? 'bg-[#316764] text-white shadow-sm'
                    : clickable
                      ? 'bg-[#E6F0EF] text-[#316764] hover:bg-[#316764]/15'
                      : 'text-[#C0C7C6] cursor-not-allowed',
                  isToday && !isSelected ? 'ring-1 ring-[#316764]/40' : '',
                ].join(' ')}
              >
                {dateObj.getDate()}
                {hasSlots && !isPast && (
                  <span
                    className={`w-1 h-1 rounded-full mt-0.5 ${
                      isSelected ? 'bg-white' : 'bg-[#316764]'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>

        <p className="text-[10px] text-[#707978] mt-3 text-right">
          الأيام المظللة تحتوي على مواعيد متاحة
        </p>
      </div>

      <div>
        <h5 className="text-xs font-black text-[#181C1D] mb-2 text-right">
          {selectedDate
            ? `المواعيد المتاحة — ${new Date(`${selectedDate}T00:00:00`).toLocaleDateString('ar-EG', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}`
            : 'اختر يوماً من التقويم'}
        </h5>
        {selectedDate && daySlots.length === 0 ? (
          <p className="text-xs text-gray-400 text-right">لا مواعيد في هذا اليوم</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {daySlots.map((slot) => (
              <button
                key={slot.id}
                type="button"
                onClick={() => onSelectSlot(slot)}
                className={`py-2.5 rounded-xl text-xs font-bold border transition ${
                  selectedSlot?.id === slot.id
                    ? 'bg-[#316764] text-white border-[#316764]'
                    : 'bg-white text-[#316764] border-[#E6E9E9] hover:border-[#316764]'
                }`}
              >
                {formatTime(slot)}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Booking({ preselectedDoctor }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const toast = useToast();
  const doctorToSelect = preselectedDoctor || location.state?.preselectedDoctor;

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [nextAppointment, setNextAppointment] = useState(null);
  const [error, setError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [selectedSessionType, setSelectedSessionType] = useState('الكل');

  const [openDoctorSchedule, setOpenDoctorSchedule] = useState(null);
  const [availabilitySlots, setAvailabilitySlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isJoinEnabled, setIsJoinEnabled] = useState(false);

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        setLoading(true);
        const res = searchQuery.trim()
          ? await searchTherapists(searchQuery.trim())
          : await fetchTherapists();
        setDoctors((res.data || []).filter((t) => t.isVerified).map(mapTherapistToDoctor));
      } catch (err) {
        console.error(err);
        setError('تعذر تحميل قائمة الأطباء');
      } finally {
        setLoading(false);
      }
    };
    const debounce = setTimeout(loadDoctors, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  useEffect(() => {
    const patientId = user?.patientId || user?.userId || user?.id;
    if (!patientId) return;
    fetchPatientAppointments(patientId)
      .then((res) => {
        const upcoming = (res.data || [])
          .filter((a) => a.status !== 'Cancelled' && a.status !== 'CANCELLED')
          .sort(
            (a, b) =>
              new Date(a.scheduledStartTime || a.createdAt) -
              new Date(b.scheduledStartTime || b.createdAt)
          )[0];
        setNextAppointment(upcoming || null);
      })
      .catch(console.error);
  }, [user]);

  useEffect(() => {
    const startTime = nextAppointment?.scheduledStartTime;
    if (!startTime) return;
    const checkSessionTime = () => {
      const sessionDate = new Date(startTime);
      const now = new Date();
      const timeDifference = sessionDate.getTime() - now.getTime();
      setIsJoinEnabled(timeDifference <= 15 * 60 * 1000 && timeDifference >= -60 * 60 * 1000);
    };
    checkSessionTime();
    const interval = setInterval(checkSessionTime, 30000);
    return () => clearInterval(interval);
  }, [nextAppointment]);

  const filteredDoctors = doctors.filter((doc) => {
    const matchesCategory =
      selectedCategory === 'الكل' || doc.categories.some((c) => c.includes(selectedCategory));
    const matchesType =
      selectedSessionType === 'الكل' || doc.sessionTypes.includes(selectedSessionType);
    return matchesCategory && matchesType;
  });

  const toggleSchedule = async (docId) => {
    if (openDoctorSchedule === docId) {
      setOpenDoctorSchedule(null);
      setAvailabilitySlots([]);
      setSelectedSlot(null);
      setSelectedDate(null);
      return;
    }
    setOpenDoctorSchedule(docId);
    setSelectedSlot(null);
    setSelectedDate(null);
    try {
      const res = await fetchDoctorAvailability(docId);
      const now = Date.now();
      const free = (res.data || [])
        .filter((s) => !s.isBooked && new Date(s.startTime).getTime() > now)
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
      setAvailabilitySlots(free);
    } catch (err) {
      console.error(err);
      setAvailabilitySlots([]);
    }
  };

  useEffect(() => {
    if (!doctorToSelect || loading || doctors.length === 0) return;
    const docId = doctorToSelect.therapistId || doctorToSelect.id;
    if (doctors.some((d) => d.id === docId)) {
      toggleSchedule(docId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorToSelect, doctors, loading]);

  const handleConfirmBooking = async (doctor) => {
    const patientId = user?.patientId || user?.userId || user?.id;
    if (!patientId) {
      toast.warning('يرجى تسجيل الدخول أولاً');
      navigate('/login');
      return;
    }
    if (!selectedSlot) {
      toast.warning('يرجى اختيار يوم وموعد من التقويم');
      return;
    }
    try {
      setBookingLoading(true);
      await createAppointment({
        patientId,
        doctorId: doctor.therapistId || doctor.id,
        slotId: selectedSlot.id,
      });
      toast.success('تم تأكيد الموعد بنجاح');
      setOpenDoctorSchedule(null);
      navigate('/doctor-checkout', { state: { doctor, slot: selectedSlot } });
    } catch (err) {
      console.error(err);
      toast.error(getApiErrorMessage(err, 'فشل حجز الموعد، حاول مرة أخرى'));
    } finally {
      setBookingLoading(false);
    }
  };

  const handleJoinSession = () => {
    if (isJoinEnabled) {
      navigate('/doctor/meetings');
    } else {
      toast.info('عذراً، يمكنك الانضمام للجلسة قبل موعدها بـ 15 دقيقة فقط.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FAFA] text-[#181C1D] font-['Cairo',sans-serif] antialiased pb-24 pt-4" dir="rtl">
      <section className="max-w-7xl mx-auto px-4 text-center my-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[#316764] mb-2">
          ابحث عن مساحتك الآمنة مع أفضل المختصين.
        </h1>
        <p className="text-xs text-gray-500 max-w-md mx-auto">
          نخبة من الأطباء النفسيين والمستشارين المعتمدين لمساعدتك في رحلة توازنك النفسي.
        </p>
      </section>

      <main className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-1 space-y-6 order-1 lg:order-2">
          <div className="bg-white p-5 rounded-2xl border border-[#EBEEEE] shadow-sm">
            <h3 className="text-sm font-bold text-[#316764] mb-4">بحث متقدم</h3>
            <div className="relative mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث باسم الطبيب أو التخصص..."
                className="w-full bg-[#F1F4F4] text-xs py-3 pr-10 pl-4 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#316764]"
              />
              <Search className="absolute right-3 top-3 text-gray-400" size={16} />
            </div>
            <span className="text-[11px] text-gray-400 block mb-2">التصنيف النفسي:</span>
            <div className="flex flex-wrap gap-2 mb-4">
              {['الكل', 'اكتئاب', 'قلق', 'علاقات'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 text-xs rounded-full cursor-pointer transition ${
                    selectedCategory === cat
                      ? 'bg-[#316764] text-white'
                      : 'bg-[#F1F4F4] text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="border-t border-[#EBEEEE] pt-4 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">نوع الجلسة:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setSelectedSessionType(selectedSessionType === 'فيديو' ? 'الكل' : 'فيديو')
                    }
                    className={`px-3 py-1 rounded-lg flex items-center gap-1 transition ${
                      selectedSessionType === 'فيديو' ? 'bg-[#316764] text-white' : 'bg-[#F1F4F4]'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        selectedSessionType === 'فيديو' ? 'bg-white' : 'bg-[#0F766E]'
                      }`}
                    ></span>{' '}
                    فيديو
                  </button>
                  <button
                    onClick={() =>
                      setSelectedSessionType(selectedSessionType === 'محادثة' ? 'الكل' : 'محادثة')
                    }
                    className={`px-3 py-1 rounded-lg flex items-center gap-1 transition ${
                      selectedSessionType === 'محادثة' ? 'bg-[#316764] text-white' : 'bg-[#F1F4F4]'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        selectedSessionType === 'محادثة' ? 'bg-white' : 'bg-gray-400'
                      }`}
                    ></span>{' '}
                    محادثة
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#DFEDE9] p-4 rounded-2xl text-center text-[#316764]">
            <p className="text-xs font-medium leading-relaxed">
              "الصحة النفسية ليست وجهة، بل هي عملية مستمرة."
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#EBEEEE] shadow-sm text-center">
            <span className="text-xs text-gray-400 block mb-1">موعد الجلسة القادم:</span>
            <div className="text-xs font-bold text-[#316764] mb-4 flex justify-center items-center gap-1">
              <Calendar size={14} />
              <span>{nextAppointment ? 'لديك موعد محجوز' : 'لا يوجد موعد قادم'}</span>
            </div>
            <button
              onClick={handleJoinSession}
              className={`w-full text-white text-xs py-3 rounded-xl font-medium transition duration-300 ${
                isJoinEnabled
                  ? 'bg-[#316764] hover:bg-[#254f4d] shadow-md cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isJoinEnabled ? 'انضم للجلسة الآن' : 'انضم للجلسة (يفتح قبل الموعد بـ 15 د)'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}
          {loading ? (
            <div className="bg-white p-12 rounded-2xl border border-[#EBEEEE] text-center text-gray-400 text-xs">
              جاري تحميل الأطباء...
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-[#EBEEEE] text-center text-gray-400 text-xs">
              لا يوجد أطباء يطابقون خيارات البحث الحالية.
            </div>
          ) : (
            filteredDoctors.map((doc) => (
              <div key={doc.id} className="bg-white p-5 rounded-2xl border border-[#EBEEEE] shadow-sm space-y-4">
                <div className="flex gap-4">
                  <img
                    src={doc.image}
                    alt={doc.name}
                    className="w-20 h-20 rounded-xl object-cover object-top bg-gray-100"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-sm font-bold text-gray-800">{doc.name}</h2>
                        <p className="text-[11px] text-[#316764] font-medium mt-0.5">{doc.specialty}</p>
                      </div>
                      <div className="bg-[#F1F4F4] px-2 py-0.5 rounded text-[10px] font-bold text-[#316764]">
                        ★ {doc.rating}
                      </div>
                    </div>
                    <div className="flex gap-4 mt-4 text-[10px] text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {doc.availability}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={12} /> {doc.price}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-[#EBEEEE] pt-3">
                  <button
                    onClick={() => navigate('/doctor/profile', { state: { doctor: doc } })}
                    className="bg-[#EBEEEE] text-[#316764] text-[11px] px-4 py-2 rounded-xl font-medium hover:bg-gray-200 transition"
                  >
                    عرض الملف
                  </button>
                  <button
                    onClick={() => toggleSchedule(doc.id)}
                    className="bg-[#316764] text-white text-[11px] px-4 py-2 rounded-xl font-medium hover:bg-[#254f4d] transition flex items-center gap-1"
                  >
                    <span>اختر موعد</span>
                    {openDoctorSchedule === doc.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>

                {openDoctorSchedule === doc.id && (
                  <div className="border-t border-[#EBEEEE] pt-4 mt-2 bg-[#F7FAFA] p-4 rounded-xl transition-all">
                    <h4 className="text-xs font-bold text-[#316764] mb-3 flex items-center gap-2">
                      <Calendar size={14} />
                      اختر اليوم ثم الوقت مع {doc.name}
                    </h4>
                    {availabilitySlots.length === 0 ? (
                      <p className="text-xs text-gray-400">لا توجد مواعيد متاحة حالياً</p>
                    ) : (
                      <BookingCalendar
                        slots={availabilitySlots}
                        selectedDate={selectedDate}
                        onSelectDate={setSelectedDate}
                        selectedSlot={selectedSlot}
                        onSelectSlot={setSelectedSlot}
                      />
                    )}
                    <div className="flex justify-end mt-4">
                      <button
                        onClick={() => handleConfirmBooking(doc)}
                        disabled={bookingLoading || !selectedSlot}
                        className="bg-[#316764] text-white text-xs px-6 py-2 rounded-xl font-medium hover:bg-[#254f4d] transition disabled:opacity-50"
                      >
                        {bookingLoading ? 'جاري الحجز...' : 'تأكيد الموعد'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
