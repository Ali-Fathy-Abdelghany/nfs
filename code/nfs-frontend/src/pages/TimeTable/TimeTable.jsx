import React, { useState, useEffect, useMemo } from 'react';
import Header from "../../components/layout/Header";
import Sidebar from '../../components/Sidebar/Sidebar';
import {
  fetchDoctorAvailability,
  fetchDoctorAppointments,
  createAvailabilitySlot,
  cancelAppointment,
} from '../../api/appointments';
import { fetchTherapistByUserId } from '../../api/therapists';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getApiErrorMessage } from '../../utils/apiError';
import './TimeTable.css';

function pad2(n) {
  return String(n).padStart(2, '0');
}

function toDateKey(date) {
  const y = date.getFullYear();
  const m = pad2(date.getMonth() + 1);
  const d = pad2(date.getDate());
  return `${y}-${m}-${d}`;
}

function formatSlotLabel(date) {
  const h = date.getHours();
  const ampm = h >= 12 ? 'م' : 'ص';
  const display = h % 12 || 12;
  return `${pad2(display)}:00 ${ampm}`;
}

/** Local wall-clock string without Z — matches seeded Unspecified DateTimes. */
function toWallClockDateTime(date) {
  return `${toDateKey(date)}T${pad2(date.getHours())}:${pad2(date.getMinutes())}:00`;
}

/** Map grid label ("02:00 م") or "HH:mm" → HTML time value. */
function slotLabelToTimeValue(label) {
  if (!label) return '09:00';
  const raw = String(label).trim();
  if (/^\d{1,2}:\d{2}$/.test(raw)) {
    const [h, m] = raw.split(':');
    return `${pad2(Number(h))}:${m}`;
  }
  const match = raw.match(/(\d{1,2}):(\d{2})\s*(ص|م)/);
  if (!match) return '09:00';
  let h = Number(match[1]);
  const m = match[2];
  const period = match[3];
  if (period === 'م' && h !== 12) h += 12;
  if (period === 'ص' && h === 12) h = 0;
  return `${pad2(h)}:${m}`;
}

function formatDateLabel(dateObj) {
  return dateObj.toLocaleDateString('ar-EG', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });
}

function startOfWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  return d;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function TimeTable() {
  const { user } = useAuth() || {};
  const toast = useToast();
  const [calendarView, setCalendarView] = useState('week');
  const [showAddModal, setShowAddModal] = useState(false);
  const [therapistId, setTherapistId] = useState(user?.therapistId || null);
  const [doctorName, setDoctorName] = useState(user?.firstName ? `د. ${user.firstName}` : 'دكتور');
  const [savingSlot, setSavingSlot] = useState(false);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const todayKey = toDateKey(today);

  const [startDate, setStartDate] = useState(toDateKey(startOfWeek(today)));
  const [endDate, setEndDate] = useState(toDateKey(addDays(startOfWeek(today), 6)));
  const [form, setForm] = useState({ date: toDateKey(today), from: '09:00', to: '' });

  const [dynamicSessions, setDynamicSessions] = useState([]);
  const [dynamicAvailability, setDynamicAvailability] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function resolveTherapist() {
      let id = user?.therapistId;
      if (!id && user?.userId) {
        try {
          const res = await fetchTherapistByUserId(user.userId);
          id = res.data?.therapistId;
          if (!cancelled && res.data) {
            setDoctorName(`د. ${res.data.firstName}`);
          }
        } catch (err) {
          console.error(err);
        }
      } else if (user?.firstName) {
        setDoctorName(`د. ${user.firstName}`);
      }
      if (!cancelled) setTherapistId(id || null);
    }
    resolveTherapist();
    return () => { cancelled = true; };
  }, [user]);

  const loadSchedule = async (doctorId) => {
    if (!doctorId) return;
    setLoading(true);
    try {
      const [availRes, apptRes] = await Promise.all([
        fetchDoctorAvailability(doctorId),
        fetchDoctorAppointments(doctorId),
      ]);

      const slots = (availRes.data || []).map((s) => {
        const start = new Date(s.startTime);
        const end = new Date(s.endTime);
        return {
          id: s.id,
          date: toDateKey(start),
          from: formatSlotLabel(start),
          to: formatSlotLabel(end),
          startTime: start,
        };
      });
      setDynamicAvailability(slots);

      const appointments = apptRes.data || [];
      const pending = appointments
        .filter((a) => {
          const s = String(a.status).toUpperCase();
          // Unpaid holds only — paid bookings are auto-confirmed and must not sit here.
          return s === 'PENDING' && a.isPaid !== true;
        })
        .map((a) => {
          const start = a.scheduledStartTime ? new Date(a.scheduledStartTime) : null;
          return {
            id: a.id,
            appointmentId: a.id,
            name: a.patientName || 'مريض',
            note: a.patientNotes || a.notes || 'طلب جلسة استشارية',
            img: a.patientImageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
            date: start ? toDateKey(start) : toDateKey(today),
            time: start ? formatSlotLabel(start) : '—',
            sessionType: a.type || 'أونلاين',
          };
        });
      setRequests(pending);

      const confirmed = appointments
        .filter((a) => {
          const s = String(a.status).toUpperCase();
          return a.isPaid === true
            || s === 'CONFIRMED'
            || s === 'SCHEDULED'
            || s === 'RESCHEDULED'
            || s === 'ACTIVE'
            || s === 'IN PROGRESS'
            || s === 'INPROGRESS';
        })
        .map((a) => {
          const start = a.scheduledStartTime || a.actualStartTime;
          const startDateObj = start ? new Date(start) : null;
          return {
            id: a.id,
            patient: a.patientName || 'مريض',
            date: startDateObj ? toDateKey(startDateObj) : '',
            time: startDateObj ? formatSlotLabel(startDateObj) : '—',
            type: a.type || 'أونلاين',
            status: a.status,
          };
        })
        .sort((a, b) => String(a.date).localeCompare(String(b.date)) || String(a.time).localeCompare(String(b.time)));

      setDynamicSessions(confirmed);
    } catch (err) {
      console.error(err);
      toast.error(getApiErrorMessage(err, 'تعذر تحميل الجدول'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (therapistId) loadSchedule(therapistId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [therapistId]);

  const TIME_SLOTS = ['08:00 ص', '09:00 ص', '10:00 ص', '11:00 ص', '12:00 م', '01:00 م', '02:00 م', '03:00 م', '04:00 م', '05:00 م', '06:00 م', '07:00 م'];
  const WEEK_DAYS_NAMES = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  const getGeneratedDaysRange = (startStr, endStr) => {
    if (!startStr) return [];
    const startParts = startStr.split('-');
    const endParts = endStr ? endStr.split('-') : startParts;

    const start = new Date(startParts[0], startParts[1] - 1, startParts[2]);
    const end = new Date(endParts[0], endParts[1] - 1, endParts[2]);

    if (start > end && calendarView !== 'day') return [];

    const daysArray = [];
    let current = new Date(start);
    const limitDate = calendarView === 'day' ? start : end;

    while (current <= limitDate) {
      daysArray.push(new Date(current));
      current.setDate(current.getDate() + 1);
      if (daysArray.length > 42) break;
    }
    return daysArray;
  };

  const currentDaysRange = getGeneratedDaysRange(startDate, endDate);

  const rangeLabel = useMemo(() => {
    if (!currentDaysRange.length) return '';
    if (calendarView === 'day') return formatDateLabel(currentDaysRange[0]);
    const first = currentDaysRange[0];
    const last = currentDaysRange[currentDaysRange.length - 1];
    return `${first.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })} — ${last.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}`;
  }, [currentDaysRange, calendarView]);

  const todaySessionsCount = dynamicSessions.filter((s) => s.date === todayKey).length;

  const handleRejectRequest = async (req) => {
    try {
      await cancelAppointment(req.appointmentId);
      toast.info('تم إلغاء الحجز');
      await loadSchedule(therapistId);
    } catch (err) {
      console.error(err);
      toast.error(getApiErrorMessage(err, 'تعذر إلغاء الحجز'));
    }
  };

  const handleAddAvailability = async (e) => {
    e.preventDefault();
    if (!form.from) {
      toast.error('اختر وقت البداية');
      return;
    }
    if (!therapistId) {
      toast.error('تعذر تحديد حساب الطبيب. أعد تسجيل الدخول ثم حاول مرة أخرى');
      return;
    }

    const [hh, mm] = form.from.split(':').map(Number);
    if (Number.isNaN(hh)) {
      toast.error('وقت غير صالح');
      return;
    }

    const [y, mo, d] = form.date.split('-').map(Number);
    const start = new Date(y, mo - 1, d, hh, mm || 0, 0, 0);
    const end = new Date(start.getTime() + 50 * 60 * 1000);

    try {
      setSavingSlot(true);
      await createAvailabilitySlot({
        doctorId: therapistId,
        startTime: toWallClockDateTime(start),
        endTime: toWallClockDateTime(end),
      });
      setShowAddModal(false);
      toast.success('تمت إضافة التوفر بنجاح');
      await loadSchedule(therapistId);
    } catch (err) {
      console.error(err);
      toast.error(getApiErrorMessage(err, 'تعذر إضافة التوفر'));
    } finally {
      setSavingSlot(false);
    }
  };

  const isSameDate = (dateObj, dateStr) => {
    if (!dateObj || !dateStr) return false;
    return toDateKey(dateObj) === dateStr;
  };

  const openAddModal = (dateStr = startDate, timeLabel) => {
    setForm({
      date: dateStr || toDateKey(today),
      from: timeLabel ? slotLabelToTimeValue(timeLabel) : (form.from || '09:00'),
      to: '',
    });
    setShowAddModal(true);
  };

  return (
    <div className="timetable-page min-h-screen bg-[#F7FAFA] text-[#181C1D] flex flex-col font-['Cairo',sans-serif]" dir="rtl">
      <Header />

      <main className="w-full flex-1 flex flex-col lg:flex-row gap-6 max-w-[1240px] mx-auto px-4 py-6 sm:py-8 pb-24 sm:pb-28">
        <div className="w-full lg:w-64 shrink-0">
          <Sidebar activeTab="timetable" />
        </div>

        <div className="flex-1 w-full min-w-0 space-y-5 text-right pb-4">
          <div className="tt-hero flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-[#E6E9E9] rounded-[24px] px-5 py-4 shadow-[0_4px_16px_rgba(24,28,29,0.04)]">
            <div>
              <h2 className="text-xl font-black text-[#181C1D]">مرحباً {doctorName}</h2>
              <p className="text-xs text-[#707978] mt-1 font-medium">
                جدولك اليومي ·{' '}
                <span className="text-[#316764] font-bold">{todaySessionsCount}</span> جلسة مؤكدة اليوم
                {loading ? <span className="mr-2 text-[#83B9B5]"> · جاري التحميل...</span> : null}
              </p>
            </div>
            <button
              type="button"
              onClick={() => openAddModal(todayKey)}
              className="bg-[#316764] hover:bg-[#254f4d] text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-sm transition-all"
            >
              <i className="fa-solid fa-plus text-[10px]" />
              <span>إضافة توفر جديد</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 min-w-0 bg-white rounded-[24px] border border-[#E6E9E9] shadow-[0_4px_16px_rgba(24,28,29,0.04)] p-5 sm:p-6 space-y-5">
              <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[#316764]">
                    <i className="fa-regular fa-calendar text-sm" />
                    <span className="text-sm font-black">{rangeLabel || 'اختر فترة'}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold text-[#707978]">من</span>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="p-1.5 text-xs rounded-lg border border-[#E6E9E9] bg-[#F7FAFA] text-[#181C1D] focus:outline-hidden focus:border-[#316764] font-medium cursor-pointer"
                    />
                    <span className="text-[11px] font-bold text-[#707978]">إلى</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="p-1.5 text-xs rounded-lg border border-[#E6E9E9] bg-[#F7FAFA] text-[#181C1D] focus:outline-hidden focus:border-[#316764] font-medium cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex bg-[#F7FAFA] p-1 rounded-xl border border-[#E6E9E9] self-start">
                  <button
                    type="button"
                    className={`px-3.5 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${calendarView === 'day' ? 'bg-[#316764] text-white shadow-sm' : 'text-[#707978] hover:text-[#316764]'}`}
                    onClick={() => {
                      setEndDate(startDate);
                      setCalendarView('day');
                    }}
                  >
                    يوم
                  </button>
                  <button
                    type="button"
                    className={`px-3.5 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${calendarView === 'week' ? 'bg-[#316764] text-white shadow-sm' : 'text-[#707978] hover:text-[#316764]'}`}
                    onClick={() => {
                      const weekStart = startOfWeek(today);
                      setStartDate(toDateKey(weekStart));
                      setEndDate(toDateKey(addDays(weekStart, 6)));
                      setCalendarView('week');
                    }}
                  >
                    أسبوع
                  </button>
                  <button
                    type="button"
                    className={`px-3.5 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${calendarView === 'month' ? 'bg-[#316764] text-white shadow-sm' : 'text-[#707978] hover:text-[#316764]'}`}
                    onClick={() => {
                      const first = new Date(today.getFullYear(), today.getMonth(), 1);
                      const last = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                      setStartDate(toDateKey(first));
                      setEndDate(toDateKey(last));
                      setCalendarView('month');
                    }}
                  >
                    شهر
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 text-[10px] font-bold text-[#707978]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#316764]" />
                  جلسة مؤكدة
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  توفر متاح
                </span>
              </div>

              {calendarView === 'month' ? (
                <div className="border border-[#E6E9E9] rounded-2xl p-3 sm:p-4 bg-[#F7FAFA]/40 space-y-3">
                  <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-black text-[#707978] pb-2">
                    {WEEK_DAYS_NAMES.map((d) => <div key={d}>{d}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-1.5">
                    {currentDaysRange.map((dateObj, idx) => {
                      const key = toDateKey(dateObj);
                      const isToday = key === todayKey;
                      const hasAppoint = dynamicSessions.some((s) => s.date === key);
                      const hasAvail = dynamicAvailability.some((a) => a.date === key);

                      return (
                        <button
                          type="button"
                          key={idx}
                          onClick={() => {
                            setStartDate(key);
                            setEndDate(key);
                            setCalendarView('day');
                          }}
                          className={`min-h-[64px] p-2 rounded-xl border flex flex-col justify-between items-end transition-all cursor-pointer text-right ${
                            isToday
                              ? 'bg-[#316764]/8 border-[#316764]/40'
                              : 'bg-white border-[#E6E9E9] hover:border-[#316764]/50'
                          }`}
                        >
                          <span className={`text-xs font-black ${isToday ? 'text-[#316764]' : 'text-[#181C1D]'}`}>
                            {dateObj.getDate()}
                          </span>
                          <div className="flex gap-1 w-full justify-start">
                            {hasAppoint && <div className="w-1.5 h-1.5 rounded-full bg-[#316764]" />}
                            {hasAvail && <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="tt-grid border border-[#E6E9E9] rounded-2xl bg-white">
                  <div
                    className="tt-grid-scroll"
                    style={{ '--tt-cols': String(Math.max(currentDaysRange.length, 1)) }}
                  >
                    <div
                      className="tt-grid-header grid border-b border-[#E6E9E9] bg-[#F7FAFA]"
                      style={{
                        gridTemplateColumns: `72px repeat(${Math.max(currentDaysRange.length, 1)}, minmax(100px, 1fr))`,
                      }}
                    >
                      <div className="tt-time-col text-[10px] font-bold text-[#707978] flex items-center justify-center py-3 border-l border-[#E6E9E9]/60">
                        الوقت
                      </div>
                      {currentDaysRange.map((dateObj, i) => {
                        const isToday = toDateKey(dateObj) === todayKey;
                        return (
                          <div
                            key={i}
                            className={`flex flex-col items-center py-2.5 border-l border-[#E6E9E9]/40 last:border-l-0 ${isToday ? 'bg-[#316764]/6' : ''}`}
                          >
                            <span className="text-[10px] text-[#707978] font-medium">{WEEK_DAYS_NAMES[dateObj.getDay()]}</span>
                            <span
                              className={`text-xs font-black mt-0.5 w-7 h-7 flex items-center justify-center rounded-full ${
                                isToday ? 'bg-[#316764] text-white' : 'bg-[#316764]/8 text-[#181C1D]'
                              }`}
                            >
                              {dateObj.getDate()}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {TIME_SLOTS.map((time, tIdx) => (
                      <div
                        key={tIdx}
                        className="tt-grid-row grid min-h-[56px] border-b border-[#E6E9E9]/50 last:border-b-0"
                        style={{
                          gridTemplateColumns: `72px repeat(${Math.max(currentDaysRange.length, 1)}, minmax(100px, 1fr))`,
                        }}
                      >
                        <div className="tt-time-col text-[#707978] text-[10px] font-bold flex items-center justify-center border-l border-[#E6E9E9]/60">
                          {time}
                        </div>
                        {currentDaysRange.map((dateObj, dIdx) => {
                          const activeSession = dynamicSessions.find((s) => isSameDate(dateObj, s.date) && s.time === time);
                          const activeAvail = dynamicAvailability.find((a) => isSameDate(dateObj, a.date) && a.from === time);
                          const isToday = toDateKey(dateObj) === todayKey;

                          return (
                            <div
                              key={dIdx}
                              className={`p-1.5 border-l border-[#E6E9E9]/35 flex items-stretch justify-center relative group ${isToday ? 'bg-[#316764]/[0.03]' : 'bg-white'}`}
                            >
                              {activeSession ? (
                                <div className="w-full min-h-[44px] p-2 rounded-xl text-right flex flex-col justify-between bg-[#E6F0EF] border border-[#316764]/25 text-[#254f4d]">
                                  <span className="text-[10px] font-black truncate">{activeSession.patient}</span>
                                  <span className="text-[8px] font-bold opacity-80">{activeSession.type}</span>
                                </div>
                              ) : activeAvail ? (
                                <div className="w-full min-h-[44px] p-2 rounded-xl bg-amber-50 border border-dashed border-amber-300 text-right flex flex-col justify-center">
                                  <span className="text-[10px] font-black text-amber-700">توفر متاح</span>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  title="إضافة توفر"
                                  onClick={() => openAddModal(toDateKey(dateObj), time)}
                                  className="w-full min-h-[44px] rounded-xl border border-transparent opacity-0 group-hover:opacity-100 hover:border-[#83B9B5] hover:bg-[#F7FAFA] text-[#83B9B5] text-xs transition-all cursor-pointer"
                                >
                                  <i className="fa-solid fa-plus" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-5 lg:col-span-1">
              <div className="bg-white rounded-[24px] border border-[#E6E9E9] shadow-[0_4px_16px_rgba(24,28,29,0.04)] p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[#F7FAFA] pb-2">
                  <h3 className="text-sm font-black text-[#181C1D] flex items-center gap-2">
                    <i className="fa-solid fa-list-ul text-[#316764] text-xs" />
                    أجندة الجلسات
                  </h3>
                  <span className="text-[10px] font-bold text-[#316764] bg-[#E6F0EF] px-2.5 py-1 rounded-full">
                    {dynamicSessions.length}
                  </span>
                </div>
                <div className="tt-panel-scroll space-y-2 pr-0.5">
                  {dynamicSessions.length === 0 && (
                    <p className="text-xs text-[#707978] py-4 text-center">لا توجد جلسات مؤكدة</p>
                  )}
                  {dynamicSessions.map((s, idx) => (
                    <div
                      className="flex justify-between items-center p-3 bg-[#F7FAFA] rounded-xl border border-[#E6E9E9] hover:border-[#316764]/30 transition-colors"
                      key={s.id || idx}
                    >
                      <div className="text-right min-w-0">
                        <span className="text-xs font-black text-[#181C1D] block truncate">{s.patient}</span>
                        <span className="text-[10px] text-[#707978] font-medium">{s.date} · {s.time}</span>
                      </div>
                      <span className="text-[9px] px-2 py-0.5 rounded-md font-bold bg-[#E6F0EF] text-[#316764] shrink-0 mr-2">
                        {s.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-[24px] border border-[#E6E9E9] shadow-[0_4px_16px_rgba(24,28,29,0.04)] p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[#F7FAFA] pb-2">
                  <h3 className="text-sm font-black text-[#181C1D] flex items-center gap-2">
                    <i className="fa-solid fa-inbox text-[#316764] text-xs" />
                    حجوزات بانتظار الدفع
                  </h3>
                  {requests.length > 0 && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                      {requests.length}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-[#707978] leading-relaxed">
                  الحجوزات المدفوعة تُؤكَّد تلقائياً وتظهر في الجدول. يمكنك إلغاء الحجوزات غير المكتملة هنا.
                </p>
                {requests.length === 0 && (
                  <p className="text-xs text-[#707978] py-4 text-center">لا توجد حجوزات معلّقة</p>
                )}
                <div className="tt-panel-scroll space-y-3 pr-0.5">
                  {requests.map((req) => (
                    <div className="p-4 bg-[#F7FAFA] rounded-[20px] border border-[#E6E9E9] space-y-3" key={req.id}>
                      <div className="flex items-center gap-3">
                        <img src={req.img} alt={req.name} className="w-10 h-10 rounded-xl object-cover border border-[#E6E9E9]" />
                        <div>
                          <h4 className="text-xs font-black text-[#181C1D]">{req.name}</h4>
                          <span className="text-[10px] text-[#707978] font-medium">{req.date} · {req.time}</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-[#707978] leading-relaxed bg-white p-2.5 rounded-xl border border-[#E6E9E9]/40">
                        {req.note}
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleRejectRequest(req)}
                          className="flex-1 bg-white border border-[#E6E9E9] text-rose-600 hover:bg-rose-50 text-[11px] font-bold py-2 rounded-xl cursor-pointer transition-colors"
                        >
                          إلغاء الحجز
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showAddModal && (
        <div
          className="fixed inset-0 bg-[#181C1D]/55 backdrop-blur-[2px] flex items-center justify-center p-4"
          style={{ zIndex: 9999 }}
          onClick={() => !savingSlot && setShowAddModal(false)}
        >
          <div
            className="bg-white rounded-[24px] border border-[#E6E9E9] shadow-2xl w-full max-w-sm p-6 relative text-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-[#E6E9E9] pb-3 mb-4">
              <h3 className="text-base font-black text-[#181C1D]">إضافة ميعاد توفر</h3>
              <button
                type="button"
                disabled={savingSlot}
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-[#F7FAFA] hover:bg-rose-500 hover:text-white flex items-center justify-center text-[#181C1D] cursor-pointer transition-colors"
              >
                <i className="fa-solid fa-xmark text-sm" />
              </button>
            </div>
            <form className="space-y-4 text-xs" onSubmit={handleAddAvailability}>
              <div className="space-y-1">
                <span className="font-bold text-[#181C1D] block">التاريخ للتوفر</span>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#F7FAFA] border border-[#E6E9E9] focus:outline-hidden focus:border-[#316764] font-medium cursor-pointer"
                  required
                />
              </div>
              <div className="space-y-1">
                <span className="font-bold text-[#181C1D] block">من الساعة</span>
                <input
                  type="time"
                  value={form.from}
                  onChange={(e) => setForm({ ...form, from: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#F7FAFA] border border-[#E6E9E9] focus:outline-hidden focus:border-[#316764] cursor-pointer"
                  required
                />
              </div>
              <p className="text-[10px] text-[#707978] leading-relaxed">
                مدة الجلسة 50 دقيقة. لا يمكن إضافة توفر يتداخل مع موعد أو توفر آخر.
              </p>
              {!therapistId && (
                <p className="text-[10px] text-rose-600 font-bold">
                  لم يتم تحميل معرف الطبيب بعد. انتظر قليلاً أو أعد تسجيل الدخول.
                </p>
              )}
              <button
                type="submit"
                disabled={savingSlot || !therapistId}
                className="w-full bg-[#316764] hover:bg-[#254f4d] disabled:opacity-60 text-white font-bold py-3 rounded-xl cursor-pointer text-center transition-colors"
              >
                {savingSlot ? 'جاري الإضافة...' : 'تأكيد وإضافة ميعاد'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TimeTable;
