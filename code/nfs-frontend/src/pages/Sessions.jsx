import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import {
  fetchPatientAppointments,
  fetchDoctorAppointments,
  cancelAppointment,
} from '../api/appointments';
import { fetchTherapistById, fetchTherapistByUserId, fetchTherapists } from '../api/therapists';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getApiErrorMessage } from '../utils/apiError';
import { doctorAvatarUrl } from '../utils/doctorAvatar';
import { ensurePatientRecord } from '../api/patientHelpers';
import doctorImg from '../assets/sara.png';

/** Same image source as DoctorProfile (`profileImageUrl` → shared fallback). */
function resolveDoctorPersonImage(doctorId, profileImageUrl, appointmentImageUrl) {
  return doctorAvatarUrl(doctorId, profileImageUrl || appointmentImageUrl || doctorImg);
}

function mapPatientAppointment(appointment, profileImageByDoctorId = {}) {
  const startTime = appointment.actualStartTime || appointment.scheduledStartTime;
  const doctorId = appointment.doctorId;
  const profileImageUrl =
    profileImageByDoctorId[doctorId] ?? profileImageByDoctorId[String(doctorId)];
  return {
    id: appointment.sessionId || `appt-${appointment.id}`,
    appointmentId: appointment.id,
    doctorId,
    patientId: appointment.patientId,
    personName: appointment.doctorName || 'المعالج النفسي',
    personImage: resolveDoctorPersonImage(
      doctorId,
      profileImageUrl,
      appointment.doctorImageUrl
    ),
    actualStartTime: startTime,
    actualEndTime: appointment.actualEndTime || appointment.scheduledEndTime,
    scheduledStartTime: appointment.scheduledStartTime,
    scheduledEndTime: appointment.scheduledEndTime,
    status: appointment.status,
    isPaid: appointment.isPaid === true,
    type: appointment.type || 'أونلاين',
    notes: appointment.notes || '',
    hourlyRate: appointment.hourlyRate,
  };
}

async function loadTherapistProfileImages(doctorIds) {
  const ids = [...new Set((doctorIds || []).filter(Boolean))];
  const map = {};
  if (ids.length === 0) return map;

  try {
    const res = await fetchTherapists();
    (res.data || []).forEach((t) => {
      if (t.therapistId == null) return;
      map[t.therapistId] = t.profileImageUrl || null;
      map[String(t.therapistId)] = t.profileImageUrl || null;
    });
  } catch {
    // Individual fetches below fill gaps.
  }

  const missing = ids.filter((id) => map[id] === undefined && map[String(id)] === undefined);
  await Promise.all(
    missing.map(async (id) => {
      try {
        const res = await fetchTherapistById(id);
        const url = res.data?.profileImageUrl || null;
        map[id] = url;
        map[String(id)] = url;
      } catch {
        map[id] = null;
        map[String(id)] = null;
      }
    })
  );

  return map;
}

function mapDoctorAppointment(appointment) {
  const startTime = appointment.actualStartTime || appointment.scheduledStartTime;
  return {
    id: appointment.sessionId || `appt-${appointment.id}`,
    appointmentId: appointment.id,
    doctorId: appointment.doctorId,
    patientId: appointment.patientId,
    personName: appointment.patientName || 'مريض',
    personImage:
      appointment.patientImageUrl ||
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    actualStartTime: startTime,
    actualEndTime: appointment.actualEndTime || appointment.scheduledEndTime,
    scheduledStartTime: appointment.scheduledStartTime,
    scheduledEndTime: appointment.scheduledEndTime,
    status: appointment.status,
    isPaid: appointment.isPaid === true,
    type: appointment.type || 'أونلاين',
    notes: appointment.notes || '',
  };
}

function Sessions() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { user } = useAuth() || {};
  const role = localStorage.getItem('userRole') || user?.userRole || 'patient';
  // The route is authoritative for this shared page, so a doctor never falls
  // back to the patient data/layout after leaving a meeting.
  const isDoctor =
    location.pathname.startsWith('/doctor/') ||
    role === 'doctor' ||
    role === 'therapist';
  const isAdmin = role === 'admin';
  const isPatient = !isDoctor && !isAdmin;
  const adminDoctorId = location.state?.adminDoctorId || null;

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('الكل');
  const [cancellingId, setCancellingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');

  const loadSessions = async () => {
    setLoading(true);
    try {
      if (isDoctor || (isAdmin && adminDoctorId)) {
        let doctorId = adminDoctorId || user?.therapistId;
        if (!doctorId && user?.userId && isDoctor) {
          const res = await fetchTherapistByUserId(user.userId);
          doctorId = res.data?.therapistId;
        }
        if (!doctorId) {
          setSessions([]);
          return;
        }
        const res = await fetchDoctorAppointments(doctorId);
        setSessions((res.data || []).map(mapDoctorAppointment));
      } else if (isPatient) {
        let patientId = user?.patientId;
        if (!patientId && user?.userId) {
          patientId = await ensurePatientRecord(user.userId);
        }
        if (!patientId) {
          setSessions([]);
          return;
        }
        const res = await fetchPatientAppointments(patientId);
        const appointments = res.data || [];
        const profileImageByDoctorId = await loadTherapistProfileImages(
          appointments.map((a) => a.doctorId)
        );
        setSessions(appointments.map((a) => mapPatientAppointment(a, profileImageByDoctorId)));
      } else {
        setSessions([]);
      }
    } catch (err) {
      console.error(err);
      toast.error(getApiErrorMessage(err, 'تعذر تحميل الجلسات'));
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.patientId, user?.therapistId, user?.userId, role, adminDoctorId]);

  const getSessionStatus = (session) => {
    if (session.status) {
      const statusUpper = String(session.status).toUpperCase();
      if (statusUpper === 'COMPLETED' || statusUpper === 'منتهية') return 'منتهية';
      if (statusUpper === 'CANCELLED') return 'ملغاة';
      if (session.isPaid === true || statusUpper === 'PAID') return 'مؤكدة';
      if (statusUpper === 'PENDING') return 'بانتظار الدفع';
      if (statusUpper === 'ACTIVE' || statusUpper === 'IN PROGRESS' || statusUpper === 'INPROGRESS') return 'مؤكدة';
      if (statusUpper === 'RESCHEDULED' || statusUpper === 'SCHEDULED' || statusUpper === 'CONFIRMED') return 'مؤكدة';
    }
    return 'مؤكدة';
  };

  const formatSessionDate = (session) => {
    const timeSource = session.actualStartTime || session.scheduledStartTime;
    if (!timeSource) return { dateStr: 'غير محدد', timeStr: 'غير محدد' };
    try {
      const dateObj = new Date(timeSource);
      const dateStr = dateObj.toLocaleDateString('ar-EG', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        calendar: 'gregory',
      });
      const timeStr = dateObj.toLocaleTimeString('ar-EG', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      return { dateStr, timeStr };
    } catch {
      return { dateStr: 'غير محدد', timeStr: 'غير محدد' };
    }
  };

  const processedSessions = useMemo(() => {
    let result = [...(sessions || [])];
    result.sort((a, b) => {
      const timeA = new Date(a.actualStartTime || 0).getTime();
      const timeB = new Date(b.actualStartTime || 0).getTime();
      return timeA - timeB;
    });
    if (activeFilter !== 'الكل') {
      result = result.filter((s) => getSessionStatus(s) === activeFilter);
    }
    return result;
  }, [sessions, activeFilter]);

  const filterCounts = useMemo(() => {
    const counts = { الكل: 0, مؤكدة: 0, 'بانتظار الدفع': 0, منتهية: 0, ملغاة: 0 };
    counts['الكل'] = sessions.length;
    sessions.forEach((s) => {
      const status = getSessionStatus(s);
      if (counts[status] !== undefined) counts[status]++;
    });
    return counts;
  }, [sessions]);

  const getStatusDetails = (status) => {
    switch (status) {
      case 'منتهية':
        return {
          text: 'جلسة سابقة (منتهية)',
          classes: 'bg-slate-100 text-slate-600 border border-slate-200/60',
          icon: 'fa-circle-check',
        };
      case 'ملغاة':
        return {
          text: 'ملغاة',
          classes: 'bg-rose-50 text-rose-700 border border-rose-200/60',
          icon: 'fa-ban',
        };
      case 'بانتظار الدفع':
        return {
          text: 'بانتظار إتمام الدفع',
          classes: 'bg-amber-50 text-amber-700 border border-amber-200/60',
          icon: 'fa-clock',
        };
      case 'مؤكدة':
      default:
        return {
          text: 'مؤكدة ومستني ميعادها',
          classes: 'bg-teal-50 text-[#316764] border border-teal-200/60',
          icon: 'fa-calendar-day',
        };
    }
  };

  const canCancel = (status) => status === 'مؤكدة' || status === 'بانتظار الدفع';

  const handleCancel = async (e, session) => {
    e.stopPropagation();
    if (!session.appointmentId) return;
    if (!window.confirm('هل تريد إلغاء هذا الموعد؟')) return;
    setCancellingId(session.appointmentId);
    try {
      await cancelAppointment(session.appointmentId);
      toast.success('تم إلغاء الموعد');
      await loadSessions();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'تعذر إلغاء الموعد'));
    } finally {
      setCancellingId(null);
    }
  };

  const openDoctorProfile = (e, session) => {
    e.stopPropagation();
    if (!session.doctorId || isDoctor) return;
    navigate('/doctor/profile', {
      state: {
        doctor: {
          therapistId: session.doctorId,
          id: session.doctorId,
          name: session.personName,
          image: session.personImage,
        },
      },
    });
  };

  const resumePayment = async (e, session) => {
    e.stopPropagation();
    if (!session.doctorId || !session.appointmentId) return;
    try {
      const res = await fetchTherapistById(session.doctorId);
      const t = res.data;
      const doctor = {
        id: t.therapistId,
        therapistId: t.therapistId,
        name: `د. ${t.firstName} ${t.lastName}`,
        specialty: t.specialization || '',
        rating: t.rating != null && Number(t.rating) > 0 ? Number(t.rating).toFixed(1) : '—',
        reviewCount: t.reviewCount || 0,
        hourlyRate: t.hourlyRate || 250,
        image: resolveDoctorPersonImage(t.therapistId, t.profileImageUrl, session.personImage),
        bio: t.bio || '',
        specialties: t.qualifications
          ? t.qualifications.split(/[,،]/).map((s) => s.trim()).filter(Boolean)
          : [],
      };
      const slot = session.scheduledStartTime
        ? {
            startTime: session.scheduledStartTime,
            endTime: session.scheduledEndTime || session.scheduledStartTime,
          }
        : null;
      navigate('/doctor-checkout', {
        state: {
          doctor,
          slot,
          appointmentId: session.appointmentId,
        },
      });
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'تعذر فتح صفحة الدفع'));
    }
  };

  const handleCardClick = (session, currentStatus) => {
    if (currentStatus === 'بانتظار الدفع' && isPatient) {
      resumePayment({ stopPropagation() {} }, session);
      return;
    }
    if (currentStatus === 'منتهية') {
      setSelectedDoctor(session.personName || (isDoctor ? 'المريض' : 'المعالج النفسي'));
      setSelectedNotes(
        session.notes ||
          'جلسة استشارية مكتملة بنجاح.'
      );
      setIsModalOpen(true);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#F7FAFA] text-[#181C1D] pb-24 pt-4 flex flex-col justify-between"
      style={{ fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}
    >
      <div>
        <Header />

        <main className="w-full mt-6">
          <div className="max-w-[1000px] mx-auto px-4">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#EBEEEE] pb-4 gap-4">
              <div>
                <h2 className="text-xl font-bold text-[#316764] flex items-center gap-2">
                  <i className="fa-solid fa-calendar-check"></i>{' '}
                  {isDoctor ? 'جلساتي مع المرضى' : 'جلساتي وحجوزاتي الطبية'}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  {isDoctor
                    ? 'تابع حجوزات مرضاك، المؤكدة، وبانتظار الدفع، والملغاة.'
                    : 'تابع أرشيف جلساتك، وأكمل الدفع للمعلّقة، أو افتح ملف الطبيب.'}
                </p>
              </div>
              <span className="text-xs bg-white border border-[#EBEEEE] px-3 py-1.5 rounded-xl font-medium shadow-2xs">
                إجمالي الحجوزات: {filterCounts['الكل']}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mb-6 bg-white p-1.5 rounded-2xl border border-[#EBEEEE] shadow-2xs">
              {[
                { key: 'الكل', label: 'كافة الجلسات' },
                { key: 'مؤكدة', label: 'مؤكدة' },
                { key: 'بانتظار الدفع', label: 'بانتظار الدفع' },
                { key: 'منتهية', label: 'منتهية' },
                { key: 'ملغاة', label: 'ملغاة' },
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key)}
                  className={`flex items-center gap-2 text-xs px-4 py-2.5 rounded-xl font-semibold transition-all ${
                    activeFilter === filter.key
                      ? 'bg-[#316764] text-white shadow-xs'
                      : 'text-gray-500 hover:bg-[#F1F4F4] hover:text-gray-800'
                  }`}
                >
                  <span>{filter.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                      activeFilter === filter.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {filterCounts[filter.key]}
                  </span>
                </button>
              ))}
            </div>

            {loading ? (
              <div className="bg-white p-12 rounded-2xl border border-[#EBEEEE] text-center shadow-xs">
                <p className="text-gray-400 text-sm m-0">جاري تحميل الحجوزات...</p>
              </div>
            ) : processedSessions.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-[#EBEEEE] text-center shadow-xs">
                <i className="fa-regular fa-calendar-xmark text-gray-300 text-4xl mb-3 block"></i>
                <p className="text-gray-400 text-sm m-0">لا توجد جلسات في هذا القسم حالياً.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {processedSessions.map((s) => {
                  const currentStatus = getSessionStatus(s);
                  const statusInfo = getStatusDetails(currentStatus);
                  const isFinished = currentStatus === 'منتهية';
                  const awaitingPay = currentStatus === 'بانتظار الدفع';
                  const formattedDate = formatSessionDate(s);
                  const clickable = isFinished || (awaitingPay && isPatient);

                  return (
                    <div
                      onClick={() => handleCardClick(s, currentStatus)}
                      className={`bg-white p-5 rounded-2xl border border-[#EBEEEE] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all border-r-4 ${
                        s.type === 'أونلاين' ? 'border-r-blue-500' : 'border-r-[#316764]'
                      } ${clickable ? 'cursor-pointer hover:border-slate-300 hover:bg-slate-50/60' : ''} ${
                        awaitingPay && isPatient ? 'hover:border-amber-300' : ''
                      }`}
                      key={s.id}
                    >
                      <div className="flex items-start gap-4">
                        <button
                          type="button"
                          onClick={(e) => openDoctorProfile(e, s)}
                          className={`w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-[#E6E9E9] ${
                            isPatient ? 'hover:ring-2 hover:ring-[#316764]/30' : ''
                          }`}
                          title={isPatient ? 'عرض ملف الطبيب' : undefined}
                          disabled={isDoctor}
                        >
                          <img
                            src={s.personImage}
                            alt={s.personName}
                            className="w-full h-full object-cover"
                          />
                        </button>

                        <div className="flex flex-col gap-1 text-right">
                          <div className="flex items-center gap-2 flex-wrap">
                            {isPatient ? (
                              <button
                                type="button"
                                onClick={(e) => openDoctorProfile(e, s)}
                                className="font-bold text-sm text-slate-800 hover:text-[#316764] hover:underline"
                              >
                                {s.personName}
                              </button>
                            ) : (
                              <span className="font-bold text-sm text-slate-800">{s.personName}</span>
                            )}
                            <span className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 text-slate-500 font-medium">
                              {s.type}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-3 flex-wrap">
                            <span className="flex items-center gap-1">
                              <i className="fa-regular fa-calendar text-gray-400"></i> {formattedDate.dateStr}
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className="flex items-center gap-1">
                              <i className="fa-regular fa-clock text-gray-400"></i> {formattedDate.timeStr}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-2 flex-wrap border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
                        {!(awaitingPay && isPatient) && (
                          <div
                            className={`text-[11px] px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 ${statusInfo.classes}`}
                          >
                            <i className={`fa-solid ${statusInfo.icon} text-xs`}></i>
                            {statusInfo.text}
                          </div>
                        )}

                        {awaitingPay && isPatient && (
                          <button
                            type="button"
                            onClick={(e) => resumePayment(e, s)}
                            className="bg-amber-500 hover:bg-amber-600 text-white text-[11px] px-4 py-2 rounded-xl font-bold transition shadow-xs"
                          >
                            إتمام الدفع
                          </button>
                        )}

                        {s.type === 'أونلاين' && currentStatus === 'مؤكدة' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const meetingPath = isDoctor
                                ? '/doctor/meetings'
                                : '/digital-clinic';
                              navigate(
                                `${meetingPath}?appointmentId=${s.appointmentId}`,
                                {
                                  state: {
                                    appointmentId: s.appointmentId,
                                    exitPath: isDoctor
                                      ? '/doctor/dashboard'
                                      : '/sessions',
                                  },
                                }
                              );
                            }}
                            className="bg-[#316764] text-white text-[11px] px-4 py-2 rounded-xl font-medium hover:bg-[#254f4d] transition-colors flex items-center gap-1 shadow-xs"
                          >
                            <i className="fa-solid fa-video"></i>
                            {isDoctor ? 'دخول العيادة' : 'ادخل العيادة الرقمية'}
                          </button>
                        )}

                        {canCancel(currentStatus) && (isPatient || isDoctor || isAdmin) && (
                          <button
                            type="button"
                            onClick={(e) => handleCancel(e, s)}
                            disabled={cancellingId === s.appointmentId}
                            className="text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-[11px] px-3 py-2 rounded-xl font-bold transition disabled:opacity-60"
                          >
                            {cancellingId === s.appointmentId ? '...' : 'إلغاء'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-[500px] w-full border border-slate-100 shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <i className="fa-solid fa-file-medical text-teal-600"></i> ملخص الجلسة
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:bg-slate-200/60 flex items-center justify-center"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="p-6 text-right space-y-4">
              <div className="bg-teal-50/40 p-3 rounded-xl border border-teal-100/50 flex gap-2 items-center">
                <span className="text-sm font-semibold text-teal-900">
                  {isDoctor ? 'المريض:' : 'الدكتور:'}
                </span>
                <span className="text-sm font-bold text-teal-700">{selectedDoctor}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                {selectedNotes}
              </div>
            </div>
            <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50 text-left">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-[#316764] hover:bg-[#254f4d] text-white text-xs font-bold px-5 py-2 rounded-xl"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {!isDoctor && <Footer />}
    </div>
  );
}

export default Sessions;
