import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Header from "../components/layout/Header";
import Sidebar from '../components/Sidebar/Sidebar';
import { fetchPatientById, fetchPatientMedicalHistory } from '../api/patients';
import { fetchPatientAppointments } from '../api/appointments';
import { fetchDiariesByPatient } from '../api/diaries';
import { fetchUserSessions } from '../api/sessions';
import { userAvatarUrl } from '../utils/userAvatar';

const WEEKDAY_AR = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

const MOOD_SCORE = {
  سعيد: 9,
  هادئ: 7,
  قلق: 4,
  حزين: 2,
};

const EMPTY_WEEK = WEEKDAY_AR.map((name) => ({ name, المزاج: 0 }));
const EMPTY_MONTH = [1, 2, 3, 4].map((n) => ({ name: `الأسبوع ${n}`, المزاج: 0 }));

function moodToScore(mood) {
  if (mood == null || mood === '') return null;
  const numeric = Number(mood);
  if (!Number.isNaN(numeric) && numeric >= 1 && numeric <= 10) return numeric;
  return MOOD_SCORE[String(mood).trim()] ?? null;
}

function buildMoodChart(diaries) {
  const now = new Date();
  const weekBuckets = Array.from({ length: 7 }, () => []);
  const monthBuckets = Array.from({ length: 4 }, () => []);

  (diaries || []).forEach((entry) => {
    const score = moodToScore(entry.mood);
    if (score == null || !entry.createdAt) return;
    const date = new Date(entry.createdAt);
    if (Number.isNaN(date.getTime())) return;

    const dayDiff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (dayDiff >= 0 && dayDiff < 7) {
      weekBuckets[date.getDay()].push(score);
    }
    if (dayDiff >= 0 && dayDiff < 28) {
      const weekIndex = Math.min(3, Math.floor(dayDiff / 7));
      // reverse so week 1 is oldest within the month window
      monthBuckets[3 - weekIndex].push(score);
    }
  });

  const avg = (arr) => (arr.length ? +(arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : 0);

  return {
    week: WEEKDAY_AR.map((name, i) => ({ name, المزاج: avg(weekBuckets[i]) })),
    month: monthBuckets.map((scores, i) => ({ name: `الأسبوع ${i + 1}`, المزاج: avg(scores) })),
  };
}

function deriveClinicalTags(patient) {
  const source = [patient?.medicalHistory, patient?.notes].filter(Boolean).join(' ');
  if (!source.trim()) return ['متابعة نفسية'];

  const parts = source
    .split(/[,،|/;\n]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1 && t.length < 40);

  const unique = [...new Set(parts)];
  return unique.length ? unique.slice(0, 6) : [source.slice(0, 40)];
}

function mapAppointmentToSession(appointment, index) {
  const start = appointment.actualStartTime || appointment.scheduledStartTime;
  const end = appointment.actualEndTime || appointment.scheduledEndTime;
  let duration = '50 دقيقة';
  if (start && end) {
    const mins = Math.round((new Date(end) - new Date(start)) / 60000);
    if (mins > 0) duration = `${mins} دقيقة`;
  }

  const statusUpper = String(appointment.status || '').toUpperCase();
  const status =
    statusUpper === 'COMPLETED' ? 'مكتملة' :
    statusUpper === 'CANCELLED' ? 'ملغاة' :
    'مجدولة';

  return {
    id: appointment.sessionId || appointment.id || index,
    title: `الجلسة ${index + 1}`,
    date: start ? new Date(start).toLocaleDateString('ar-EG') : '-',
    time: start ? new Date(start).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : '-',
    mode: appointment.type || 'أونلاين',
    duration,
    status,
    symptoms: appointment.notes || 'لا توجد ملاحظات',
    recommendations: appointment.notes || 'لا توجد توصيات',
    startTime: start ? new Date(start) : null,
  };
}

function mapSessionDto(s, index) {
  const start = s.actualStartTime;
  const end = s.actualEndTime;
  let duration = '50 دقيقة';
  if (start && end) {
    const mins = Math.round((new Date(end) - new Date(start)) / 60000);
    if (mins > 0) duration = `${mins} دقيقة`;
  }
  const statusUpper = String(s.status || '').toUpperCase();
  return {
    id: s.id || index,
    title: `الجلسة ${index + 1}`,
    date: start ? new Date(start).toLocaleDateString('ar-EG') : '-',
    time: start ? new Date(start).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : '-',
    mode: s.type || 'أونلاين',
    duration,
    status: statusUpper === 'COMPLETED' ? 'مكتملة' : 'مجدولة',
    symptoms: s.notes || 'لا توجد ملاحظات',
    recommendations: s.notes || 'لا توجد توصيات',
    startTime: start ? new Date(start) : null,
  };
}

function formatNextAppointment(appointment) {
  if (!appointment) return null;
  const start = appointment.scheduledStartTime || appointment.actualStartTime;
  if (!start) return null;
  const date = new Date(start);
  const end = appointment.scheduledEndTime || appointment.actualEndTime;
  let durationLabel = '50 دقيقة';
  if (end) {
    const mins = Math.round((new Date(end) - date) / 60000);
    if (mins > 0) durationLabel = `${mins} دقيقة`;
  }
  return {
    dateLabel: date.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' }),
    timeLabel: `من الساعة ${date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })} (${durationLabel})`,
  };
}

function PatientProfile() {
    const navigate = useNavigate();
    const location = useLocation();
    const patientFromState = location.state?.patient;
    const [patient, setPatient] = useState(null);
    const [sessionsHistory, setSessionsHistory] = useState([]);
    const [nextAppointment, setNextAppointment] = useState(null);
    const [chartData, setChartData] = useState({ week: EMPTY_WEEK, month: EMPTY_MONTH });
    const [activeFilter, setActiveFilter] = useState('week');
    const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
    const [isAllSessionsModalOpen, setIsAllSessionsModalOpen] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);
    const [allMeetingNotes, setAllMeetingNotes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const patientId = patientFromState?.patientId || patientFromState?.id;
        if (!patientId) {
            setLoading(false);
            return;
        }

        let cancelled = false;

        async function loadProfile() {
            setLoading(true);
            try {
                const [patientRes, historyRes, appointmentsRes, diariesRes] = await Promise.all([
                    fetchPatientById(patientId),
                    fetchPatientMedicalHistory(patientId),
                    fetchPatientAppointments(patientId),
                    fetchDiariesByPatient(patientId),
                ]);

                if (cancelled) return;

                const patientData = patientRes.data;
                setPatient(patientData);

                const historyNotes = (historyRes.data || []).map((h, i) => ({
                    id: h.patientMedicalHistoryId || `mh-${i}`,
                    date: h.createdAt ? new Date(h.createdAt).toLocaleDateString('ar-EG') : '-',
                    session: `سجل #${i + 1}`,
                    text: h.notes || '',
                }));

                if (historyNotes.length) {
                    setAllMeetingNotes(historyNotes);
                } else if (patientData?.notes || patientData?.medicalHistory) {
                    setAllMeetingNotes([{
                        id: 'profile-notes',
                        date: patientData.createdAt
                            ? new Date(patientData.createdAt).toLocaleDateString('ar-EG')
                            : '-',
                        session: 'ملف المريض',
                        text: patientData.notes || patientData.medicalHistory,
                    }]);
                } else {
                    setAllMeetingNotes([]);
                }

                const appointments = appointmentsRes.data || [];
                const now = new Date();
                const upcoming = appointments
                    .filter((a) => {
                        const status = String(a.status || '').toUpperCase();
                        if (status === 'CANCELLED' || status === 'COMPLETED') return false;
                        const start = a.scheduledStartTime || a.actualStartTime;
                        return start && new Date(start) >= now;
                    })
                    .sort((a, b) => new Date(a.scheduledStartTime || a.actualStartTime) - new Date(b.scheduledStartTime || b.actualStartTime));

                setNextAppointment(upcoming[0] || null);

                let sessions = appointments
                    .slice()
                    .sort((a, b) => {
                        const aTime = new Date(a.actualStartTime || a.scheduledStartTime || 0);
                        const bTime = new Date(b.actualStartTime || b.scheduledStartTime || 0);
                        return bTime - aTime;
                    })
                    .map(mapAppointmentToSession);

                if (!sessions.length) {
                    const userId = patientData?.userId || patientFromState?.userId;
                    if (userId) {
                        try {
                            const sessionsRes = await fetchUserSessions(userId);
                            if (!cancelled) {
                                sessions = (sessionsRes.data || []).map(mapSessionDto);
                            }
                        } catch (err) {
                            console.error(err);
                        }
                    }
                }

                if (!cancelled) setSessionsHistory(sessions);

                const diaries = diariesRes.data || [];
                const built = buildMoodChart(diaries);
                const hasWeekData = built.week.some((d) => d.المزاج > 0);
                const hasMonthData = built.month.some((d) => d.المزاج > 0);
                if (!cancelled) {
                    setChartData({
                        week: hasWeekData ? built.week : EMPTY_WEEK,
                        month: hasMonthData ? built.month : EMPTY_MONTH,
                    });
                }
            } catch (err) {
                console.error(err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        loadProfile();
        return () => { cancelled = true; };
    }, [patientFromState]);

    const [editingNoteId, setEditingNoteId] = useState(null);
    const [editingText, setEditingText] = useState("");

    const startEditing = (id, currentText) => {
        setEditingNoteId(id);
        setEditingText(currentText);
    };

    const saveEditedNote = (id) => {
        setAllMeetingNotes(prev => prev.map(note => note.id === id ? { ...note, text: editingText } : note));
        setEditingNoteId(null);
    };

    const lastSessionNote = allMeetingNotes[0];
    const patientName = patient ? `${patient.firstName} ${patient.lastName}` : patientFromState?.name || 'المريض';
    const clinicalTags = useMemo(
        () => deriveClinicalTags(patient || patientFromState),
        [patient, patientFromState]
    );
    const nextSessionDisplay = formatNextAppointment(nextAppointment);
    const chartPoints = chartData[activeFilter] || EMPTY_WEEK;
    const hasMoodData = chartPoints.some((d) => d.المزاج > 0);

    return (
        <div className="min-h-screen bg-[#F7FAFA] text-[#181C1D] flex flex-col justify-between font-['Cairo',sans-serif]" style={{ direction: 'rtl' }}>
            <Header />

            <main className="w-full flex-1 flex flex-col lg:flex-row gap-6 max-w-[1240px] mx-auto px-4 py-8">
                
                {/* 1. القائمة الجانبية على اليمين تماماً */}
                <div className="w-full lg:w-64 shrink-0 transition-all duration-300">
                    <Sidebar activeTab="patients" />
                </div>

                {/* 2. المحتوى الرئيسي على اليسار */}
                <div className="flex-1 w-full space-y-6 pb-12 text-right">
                    {loading && (
                        <p className="text-sm text-[#707978]">جاري تحميل بيانات المريض...</p>
                    )}
                    
                    {/* هيدر معلومات المريض العلوي */}
                    <div className="bg-white rounded-[24px] border border-[#E6E9E9] shadow-3xs p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-300 hover:shadow-2xs">
                        <div className="flex items-center gap-4 text-right">
                            <img
                                src={userAvatarUrl(
                                  patient?.userId || patientFromState?.userId,
                                  patient?.profileImageUrl || patientFromState?.profileImageUrl,
                                  patientName || patientFromState?.name
                                )}
                                alt="بروفايل المريض"
                                className="w-16 h-16 rounded-[20px] object-cover border border-[#E6E9E9]"
                            />
                            <div className="space-y-1">
                                <h3 className="text-xl font-black text-[#181C1D]">{patientName}</h3>
                                <div className="flex items-center gap-2 text-[#707978] text-xs font-medium flex-wrap">
                                    <span className="flex items-center gap-1"><i className="fa-solid fa-envelope text-[10px]"></i> {patient?.email || '-'}</span>
                                    {patient?.phone && (
                                        <>
                                            <span className="text-[#E6E9E9]">|</span>
                                            <span className="flex items-center gap-1"><i className="fa-solid fa-phone text-[10px]"></i> {patient.phone}</span>
                                        </>
                                    )}
                                    <span className="text-[#E6E9E9]">|</span>
                                    <span className="flex items-center gap-1"><i className="fa-solid fa-calendar-day text-[10px]"></i> {patient?.createdAt ? new Date(patient.createdAt).toLocaleDateString('ar-EG') : 'متابعة نشطة'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="w-full sm:w-auto">
                            <button 
                                onClick={() => {
                                    if (!nextAppointment?.id) {
                                        navigate('/doctor/dashboard');
                                        return;
                                    }
                                    navigate(`/doctor/meetings?appointmentId=${nextAppointment.id}`, {
                                        state: {
                                            appointmentId: nextAppointment.id,
                                            exitPath: '/doctor/dashboard',
                                        },
                                    });
                                }}
                                className="w-full sm:w-auto bg-[#316764] hover:bg-[#254f4d] text-white text-xs font-bold px-5 py-3 rounded-xl shadow-xs transition-all duration-300 hover:scale-102 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <i className="fa-solid fa-play text-[10px]"></i>
                                {nextAppointment?.id ? 'ابدأ الجلسة الآن' : 'عرض الجلسات'}
                            </button>
                        </div>
                    </div>

                    {/* شبكة البيانات الوسطى */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* شريط تطور الحالة المزاجية */}
                        <div className="md:col-span-2 bg-white rounded-[24px] border border-[#E6E9E9] shadow-3xs p-5 space-y-4 transition-all duration-300 hover:shadow-2xs">
                            <div className="flex justify-between items-center">
                                <h4 className="text-sm font-black text-[#181C1D]">تطور الحالة المزاجية</h4>
                                <div className="flex bg-[#F7FAFA] p-0.5 rounded-xl border border-[#E6E9E9]">
                                    <button
                                        className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${activeFilter === 'week' ? 'bg-white text-[#316764] shadow-3xs' : 'text-[#707978] hover:text-[#181C1D]'}`}
                                        onClick={() => setActiveFilter('week')}
                                    >
                                        أسبوع
                                    </button>
                                    <button
                                        className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${activeFilter === 'month' ? 'bg-white text-[#316764] shadow-3xs' : 'text-[#707978] hover:text-[#181C1D]'}`}
                                        onClick={() => setActiveFilter('month')}
                                    >
                                        شهر
                                    </button>
                                </div>
                            </div>

                            <div className="w-full h-44 relative">
                                {!hasMoodData && (
                                    <div className="absolute inset-0 flex items-center justify-center text-xs text-[#707978] z-10">
                                        لا توجد بيانات مزاج من يوميات المريض بعد
                                    </div>
                                )}
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartPoints} margin={{ top: 10, right: -15, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#316764" stopOpacity={0.2}/>
                                                <stop offset="95%" stopColor="#316764" stopOpacity={0.01}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#F7FAFA" vertical={false} />
                                        <XAxis dataKey="name" stroke="#707978" fontSize={11} tickLine={false} axisLine={false} dy={8} />
                                        <YAxis domain={[0, 10]} stroke="#707978" fontSize={11} tickLine={false} axisLine={false} tickCount={5} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#ffffff',
                                                border: '1px solid #E6E9E9',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                direction: 'rtl',
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="المزاج"
                                            stroke="#316764"
                                            strokeWidth={2.5}
                                            fillOpacity={1}
                                            fill="url(#colorMood)"
                                            dot={{ r: 3, strokeWidth: 2, stroke: '#ffffff', fill: '#316764' }}
                                            activeDot={{ r: 5, strokeWidth: 0 }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* عمود البطاقات الإكلينيكية */}
                        <div className="space-y-6 md:col-span-1">
                            <div className="bg-white rounded-[24px] border border-[#E6E9E9] shadow-3xs p-5 space-y-4">
                                <h4 className="text-sm font-black text-[#181C1D]">الحالة الإكلينيكية</h4>
                                <div className="flex flex-wrap gap-2 justify-start">
                                    {clinicalTags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="text-[11px] font-bold text-[#316764] bg-[#F7FAFA] px-2.5 py-1 rounded-lg border border-[#E6E9E9]"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-[#316764] rounded-[24px] shadow-3xs p-5 space-y-3 text-white">
                                <span className="text-[10px] tracking-wider font-bold text-teal-100/80 block">الجلسة القادمة</span>
                                <div className="space-y-0.5">
                                    {nextSessionDisplay ? (
                                        <>
                                            <h5 className="text-base font-black">{nextSessionDisplay.dateLabel}</h5>
                                            <p className="text-xs text-teal-50/90 font-medium">{nextSessionDisplay.timeLabel}</p>
                                        </>
                                    ) : (
                                        <>
                                            <h5 className="text-base font-black">لا توجد جلسة قادمة</h5>
                                            <p className="text-xs text-teal-50/90 font-medium">لم يتم حجز موعد بعد</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* الحاوية السفلية (الملاحظات الحالية وسجل الجلسات) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* كارت سجل الجلسات التفاعلي المباشر (يعرض أول 3 جلسات فقط) */}
                        <div className="md:col-span-1 bg-white rounded-[24px] border border-[#E6E9E9] shadow-3xs p-5 space-y-4">
                            <h4 className="text-sm font-black text-[#181C1D]">سجل الجلسات</h4>
                            <div className="space-y-2">
                                {sessionsHistory.length === 0 && (
                                    <p className="text-xs text-[#707978]">لا توجد جلسات مسجّلة</p>
                                )}
                                {sessionsHistory.slice(0, 3).map((session) => (
                                    <div 
                                        key={session.id}
                                        onClick={() => setSelectedSession(session)}
                                        className="flex justify-between items-center p-3 bg-[#F7FAFA] hover:bg-teal-50/30 hover:border-[#316764]/30 rounded-xl border border-[#E6E9E9] cursor-pointer transition-all duration-200 group"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-2 h-2 rounded-full bg-[#316764]"></div>
                                            <div>
                                                <span className="text-xs font-bold text-[#181C1D] block">{session.title}</span>
                                                <span className="text-[10px] text-[#707978]">{session.date}</span>
                                            </div>
                                        </div>
                                        <i className="fa-solid fa-chevron-left text-[10px] text-[#707978] group-hover:-translate-x-0.5 transition-transform"></i>
                                    </div>
                                ))}
                            </div>
                            <div className="text-center pt-1">
                                {/* زر عرض الكل يفتح البوب اب لجميع الجلسات */}
                                <span 
                                    onClick={() => setIsAllSessionsModalOpen(true)}
                                    className="text-xs text-[#316764] font-bold hover:underline cursor-pointer transition-all duration-200"
                                >
                                    عرض الكل
                                </span>
                            </div>
                        </div>

                        {/* كارت ملاحظات الجلسة الأخيرة */}
                        <div className="md:col-span-2 bg-white rounded-[24px] border border-[#E6E9E9] shadow-3xs p-5 space-y-4">
                            <div className="flex justify-between items-center">
                                <h4 className="text-sm font-black text-[#181C1D]">ملاحظات الجلسة الأخيرة</h4>
                                <span className="text-[11px] text-[#707978] font-medium">{lastSessionNote?.date}</span>
                            </div>

                            {!lastSessionNote ? (
                                <p className="text-xs text-[#707978] leading-relaxed bg-[#F7FAFA] p-4 rounded-2xl border border-[#E6E9E9]">
                                    لا توجد ملاحظات طبية لهذا المريض بعد
                                </p>
                            ) : editingNoteId === lastSessionNote?.id ? (
                                <div className="space-y-3">
                                    <textarea
                                        value={editingText}
                                        onChange={(e) => setEditingText(e.target.value)}
                                        className="w-full text-xs text-[#181C1D] bg-[#F7FAFA] p-3 rounded-2xl border border-[#316764] focus:outline-hidden min-h-[100px] leading-relaxed font-sans"
                                    />
                                    <div className="flex gap-2 justify-start">
                                        <button onClick={() => saveEditedNote(lastSessionNote.id)} className="bg-[#316764] hover:bg-[#254f4d] text-white text-[11px] font-bold px-4 py-2 rounded-xl transition-all cursor-pointer">حفظ التغييرات</button>
                                        <button onClick={() => setEditingNoteId(null)} className="bg-slate-100 text-slate-600 text-[11px] font-bold px-4 py-2 rounded-xl transition-all cursor-pointer">إلغاء</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <p className="text-xs text-[#707978] leading-relaxed bg-[#F7FAFA] p-4 rounded-2xl border border-[#E6E9E9]">
                                        {lastSessionNote?.text}
                                    </p>
                                    <div className="flex items-center gap-2 justify-start pt-1">
                                        <button 
                                            onClick={() => setIsNotesModalOpen(true)}
                                            className="bg-[#F7FAFA] border border-[#E6E9E9] text-[#181C1D] hover:bg-[#E6E9E9] text-[11px] font-bold px-4 py-2.5 rounded-xl shadow-3xs transition-all duration-200 cursor-pointer flex items-center gap-1.5"
                                        >
                                            <i className="fa-solid fa-book-open text-[10px]"></i> كل الملاحظات
                                        </button>
                                        <button 
                                            onClick={() => startEditing(lastSessionNote.id, lastSessionNote.text)}
                                            className="bg-[#316764] hover:bg-[#254f4d] text-white text-[11px] font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all duration-200 cursor-pointer flex items-center gap-1.5"
                                        >
                                            <i className="fa-regular fa-pen-to-square text-[10px]"></i> تعديل الملاحظة
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                    </div>
                </div>
            </main>

            {/* [POPUP 1]: تفاصيل جلسة فردية منبثق فوق الشاشة والسايدبار بالكامل */}
            {selectedSession && (
                <div className="fixed inset-0 bg-[#181C1D]/60 backdrop-blur-xs flex items-center justify-center p-4 left-0 top-0 right-0 bottom-0 w-full h-full" style={{ zIndex: 10000 }}>
                    <div className="bg-white rounded-[24px] border border-[#E6E9E9] shadow-2xl w-full max-w-md p-6 relative text-right animate-scaleUp">
                        <div className="flex justify-between items-center border-b border-[#E6E9E9] pb-3 mb-4">
                            <div>
                                <h3 className="text-base font-black text-[#181C1D]">{selectedSession.title}</h3>
                                <p className="text-[11px] text-[#707978]">{selectedSession.date} | {selectedSession.time}</p>
                            </div>
                            <button onClick={() => setSelectedSession(null)} className="w-8 h-8 rounded-full bg-[#F7FAFA] hover:bg-rose-500 hover:text-white flex items-center justify-center text-[#181C1D] cursor-pointer">
                                <i className="fa-solid fa-xmark text-sm"></i>
                            </button>
                        </div>
                        <div className="space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-3 bg-[#F7FAFA] p-3 rounded-xl border border-[#E6E9E9]">
                                <p className="text-[#707978]">نوع الجلسة: <span className="font-bold text-[#181C1D]">{selectedSession.mode}</span></p>
                                <p className="text-[#707978]">الحالة: <span className="font-bold text-emerald-600">{selectedSession.status}</span></p>
                                <p className="text-[#707978] col-span-2">المدة الزمنية: <span className="font-bold text-[#181C1D]">{selectedSession.duration}</span></p>
                            </div>
                            <div className="space-y-1">
                                <h6 className="font-black text-[#181C1D]">الأعراض الملاحظة:</h6>
                                <p className="text-[#707978] leading-relaxed bg-[#F7FAFA]/40 p-2.5 rounded-lg border border-[#E6E9E9]/40">{selectedSession.symptoms}</p>
                            </div>
                            <div className="space-y-1">
                                <h6 className="font-black text-[#181C1D]">التوصيات العلاجية:</h6>
                                <p className="text-[#316764] leading-relaxed bg-teal-50/20 p-2.5 rounded-lg border border-teal-100/30">{selectedSession.recommendations}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* [POPUP 2]: بوب اب "عرض الكل" لـ كل الجلسات السابقة */}
            {isAllSessionsModalOpen && (
                <div className="fixed inset-0 bg-[#181C1D]/60 backdrop-blur-xs flex items-center justify-center p-4 left-0 top-0 right-0 bottom-0 w-full h-full" style={{ zIndex: 9999 }}>
                    <div className="bg-white rounded-[24px] border border-[#E6E9E9] shadow-2xl w-full max-w-xl p-6 relative max-h-[80vh] overflow-y-auto text-right animate-scaleUp">
                        <div className="flex justify-between items-center border-b border-[#E6E9E9] pb-4 mb-4">
                            <h3 className="text-base font-black text-[#181C1D]">سجل الجلسات الكامل</h3>
                            <button 
                                onClick={() => setIsAllSessionsModalOpen(false)} 
                                className="w-8 h-8 rounded-full bg-[#F7FAFA] hover:bg-rose-500 hover:text-white flex items-center justify-center text-[#181C1D] cursor-pointer transition-colors duration-200"
                            >
                                <i className="fa-solid fa-xmark text-sm"></i>
                            </button>
                        </div>
                        <div className="space-y-3">
                            {sessionsHistory.length === 0 && (
                                <p className="text-xs text-[#707978]">لا توجد جلسات مسجّلة</p>
                            )}
                            {sessionsHistory.map((session) => (
                                <div 
                                    key={session.id}
                                    onClick={() => {
                                        setSelectedSession(session); // يسمح بفتح تفاصيل الجلسة الفرعية مباشرة
                                    }}
                                    className="flex justify-between items-center p-4 bg-[#F7FAFA] hover:bg-teal-50/30 hover:border-[#316764]/30 rounded-2xl border border-[#E6E9E9] cursor-pointer transition-all duration-200 group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#316764]"></div>
                                        <div>
                                            <span className="text-xs font-black text-[#181C1D] block">{session.title}</span>
                                            <span className="text-[10px] text-[#707978] font-medium">{session.date} | {session.time}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[10px] px-2.5 py-0.5 rounded-md border font-bold ${session.mode === 'حضوري' ? 'bg-teal-50 text-[#316764] border-teal-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                            {session.mode}
                                        </span>
                                        <i className="fa-solid fa-chevron-left text-[10px] text-[#707978] group-hover:-translate-x-0.5 transition-transform"></i>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* [POPUP 3]: كل الملاحظات السابقة */}
            {isNotesModalOpen && (
                <div className="fixed inset-0 bg-[#181C1D]/60 backdrop-blur-xs flex items-center justify-center p-4 left-0 top-0 right-0 bottom-0 w-full h-full" style={{ zIndex: 9999 }}>
                    <div className="bg-white rounded-[24px] border border-[#E6E9E9] shadow-2xl w-full max-w-2xl p-6 relative max-h-[85vh] overflow-y-auto text-right animate-scaleUp">
                        <div className="flex justify-between items-center border-b border-[#E6E9E9] pb-4 mb-4">
                            <h3 className="text-base font-black text-[#181C1D]">سجل الملاحظات الشامل</h3>
                            <button onClick={() => setIsNotesModalOpen(false)} className="w-8 h-8 rounded-full bg-[#F7FAFA] hover:bg-rose-500 hover:text-white flex items-center justify-center text-[#181C1D] cursor-pointer">
                                <i className="fa-solid fa-xmark text-sm"></i>
                            </button>
                        </div>
                        <div className="space-y-4">
                            {allMeetingNotes.length === 0 && (
                                <p className="text-xs text-[#707978]">لا توجد ملاحظات</p>
                            )}
                            {allMeetingNotes.map((note) => (
                                <div key={note.id} className="p-4 rounded-xl border border-[#E6E9E9] bg-[#F7FAFA] space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[11px] font-bold text-[#316764] bg-teal-50/50 border border-teal-100/40 px-2.5 py-1 rounded-lg">
                                            {note.session}
                                        </span>
                                        <span className="text-[10px] text-[#707978] font-medium">{note.date}</span>
                                    </div>

                                    {editingNoteId === note.id ? (
                                        <div className="space-y-2 pt-1">
                                            <textarea
                                                value={editingText}
                                                onChange={(e) => setEditingText(e.target.value)}
                                                className="w-full text-xs text-[#181C1D] bg-white p-3 rounded-xl border border-[#316764] focus:outline-hidden min-h-[80px] leading-relaxed"
                                            />
                                            <div className="flex gap-2">
                                                <button onClick={() => saveEditedNote(note.id)} className="bg-[#316764] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer">حفظ</button>
                                                <button onClick={() => setEditingNoteId(null)} className="bg-slate-200 text-slate-600 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer">إلغاء</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-xs text-[#707978] leading-relaxed pt-1">{note.text}</p>
                                            <div className="flex justify-end pt-2">
                                                <button 
                                                    onClick={() => startEditing(note.id, note.text)}
                                                    className="text-[11px] text-[#316764] font-black hover:underline cursor-pointer flex items-center gap-1"
                                                >
                                                    <i className="fa-regular fa-pen-to-square"></i> تعديل هذه الملاحظة
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PatientProfile;
