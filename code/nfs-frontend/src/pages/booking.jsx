import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Calendar, Clock, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { fetchTherapists, searchTherapists } from '../api/therapists';
import { fetchDoctorAvailability, createAppointment, fetchPatientAppointments } from '../api/appointments';
import { useAuth } from '../context/AuthContext';

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
    price: t.hourlyRate ? `${t.hourlyRate} ر.س / ساعة` : '150 ر.س / ساعة',
    hourlyRate: t.hourlyRate || 250,
    image: t.profileImageUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
    categories: t.specialization ? [t.specialization] : ['قلق'],
    sessionTypes: ['فيديو'],
    bio: t.bio || '',
    specialties: t.qualifications ? t.qualifications.split(',').map((s) => s.trim()) : [t.specialization].filter(Boolean),
  };
}

export default function Booking({ preselectedDoctor }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
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
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isJoinEnabled, setIsJoinEnabled] = useState(false);

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        setLoading(true);
        const res = searchQuery.trim()
          ? await searchTherapists(searchQuery.trim())
          : await fetchTherapists();
        setDoctors((res.data || []).map(mapTherapistToDoctor));
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
          .sort((a, b) => new Date(a.scheduledStartTime || a.createdAt) - new Date(b.scheduledStartTime || b.createdAt))[0];
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
    const matchesCategory = selectedCategory === 'الكل' || doc.categories.some((c) => c.includes(selectedCategory));
    const matchesType = selectedSessionType === 'الكل' || doc.sessionTypes.includes(selectedSessionType);
    return matchesCategory && matchesType;
  });

  const toggleSchedule = async (docId) => {
    if (openDoctorSchedule === docId) {
      setOpenDoctorSchedule(null);
      setAvailabilitySlots([]);
      setSelectedSlot(null);
      return;
    }
    setOpenDoctorSchedule(docId);
    setSelectedSlot(null);
    try {
      const res = await fetchDoctorAvailability(docId);
      setAvailabilitySlots((res.data || []).filter((s) => !s.isBooked));
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
      alert('يرجى تسجيل الدخول أولاً');
      navigate('/login');
      return;
    }
    if (!selectedSlot) {
      alert('يرجى اختيار موعد متاح');
      return;
    }
    try {
      setBookingLoading(true);
      await createAppointment({
        patientId,
        doctorId: doctor.therapistId || doctor.id,
        slotId: selectedSlot.id,
      });
      alert('تم تأكيد الموعد بنجاح');
      setOpenDoctorSchedule(null);
      navigate('/doctor-checkout', { state: { doctor, slot: selectedSlot } });
    } catch (err) {
      console.error(err);
      alert('فشل حجز الموعد، حاول مرة أخرى');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleJoinSession = () => {
    if (isJoinEnabled) {
      navigate('/doctor/meetings');
    } else {
      alert('عذراً، يمكنك الانضمام للجلسة قبل موعدها بـ 15 دقيقة فقط.');
    }
  };

  const formatSlotTime = (slot) => {
    const start = new Date(slot.startTime);
    return start.toLocaleString('ar-EG', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-[#F7FAFA] text-[#181C1D] font-sans antialiased pb-24 pt-4" dir="rtl">
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
                    selectedCategory === cat ? 'bg-[#316764] text-white' : 'bg-[#F1F4F4] text-gray-600 hover:bg-gray-200'
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
                    onClick={() => setSelectedSessionType(selectedSessionType === 'فيديو' ? 'الكل' : 'فيديو')}
                    className={`px-3 py-1 rounded-lg flex items-center gap-1 transition ${selectedSessionType === 'فيديو' ? 'bg-[#316764] text-white' : 'bg-[#F1F4F4]'}`}
                  >
                    <span className={`w-2 h-2 rounded-full ${selectedSessionType === 'فيديو' ? 'bg-white' : 'bg-[#0F766E]'}`}></span> فيديو
                  </button>
                  <button
                    onClick={() => setSelectedSessionType(selectedSessionType === 'محادثة' ? 'الكل' : 'محادثة')}
                    className={`px-3 py-1 rounded-lg flex items-center gap-1 transition ${selectedSessionType === 'محادثة' ? 'bg-[#316764] text-white' : 'bg-[#F1F4F4]'}`}
                  >
                    <span className={`w-2 h-2 rounded-full ${selectedSessionType === 'محادثة' ? 'bg-white' : 'bg-gray-400'}`}></span> محادثة
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#DFEDE9] p-4 rounded-2xl text-center text-[#316764]">
            <p className="text-xs font-medium leading-relaxed">"الصحة النفسية ليست وجهة، بل هي عملية مستمرة."</p>
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
                isJoinEnabled ? 'bg-[#316764] hover:bg-[#254f4d] shadow-md cursor-pointer' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isJoinEnabled ? 'انضم للجلسة الآن' : 'انضم للجلسة (يفتح قبل الموعد بـ 15 د)'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}
          {loading ? (
            <div className="bg-white p-12 rounded-2xl border border-[#EBEEEE] text-center text-gray-400 text-xs">جاري تحميل الأطباء...</div>
          ) : filteredDoctors.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-[#EBEEEE] text-center text-gray-400 text-xs">
              لا يوجد أطباء يطابقون خيارات البحث الحالية.
            </div>
          ) : (
            filteredDoctors.map((doc) => (
              <div key={doc.id} className="bg-white p-5 rounded-2xl border border-[#EBEEEE] shadow-sm space-y-4">
                <div className="flex gap-4">
                  <img src={doc.image} alt={doc.name} className="w-20 h-20 rounded-xl object-cover object-top bg-gray-100" />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-sm font-bold text-gray-800">{doc.name}</h2>
                        <p className="text-[11px] text-[#316764] font-medium mt-0.5">{doc.specialty}</p>
                      </div>
                      <div className="bg-[#F1F4F4] px-2 py-0.5 rounded text-[10px] font-bold text-[#316764]">★ {doc.rating}</div>
                    </div>
                    <div className="flex gap-4 mt-4 text-[10px] text-gray-400">
                      <span className="flex items-center gap-1"><Clock size={12}/> {doc.availability}</span>
                      <span className="flex items-center gap-1"><MapPin size={12}/> {doc.price}</span>
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
                    <h4 className="text-xs font-bold text-[#316764] mb-3">اختر الوقت المناسب مع {doc.name}</h4>
                    {availabilitySlots.length === 0 ? (
                      <p className="text-xs text-gray-400">لا توجد مواعيد متاحة حالياً</p>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {availabilitySlots.map((slot) => (
                          <button
                            key={slot.id}
                            onClick={() => setSelectedSlot(slot)}
                            className={`py-2 rounded-xl text-xs font-medium border transition text-center ${
                              selectedSlot?.id === slot.id
                                ? 'bg-[#316764] text-white border-[#316764]'
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            {formatSlotTime(slot)}
                          </button>
                        ))}
                      </div>
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
