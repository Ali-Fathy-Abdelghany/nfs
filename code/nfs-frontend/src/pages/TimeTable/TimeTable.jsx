import React, { useState, useEffect } from 'react';
import Header from "../../components/layout/Header";
import Sidebar from '../../components/Sidebar/Sidebar';
import { useSchedule, acceptSession, addAvailability } from '../../store/scheduleStore';
import { fetchDoctorAvailability } from '../../api/appointments';
import { fetchPatients } from '../../api/patients';
import { useAuth } from '../../context/AuthContext';

function TimeTable() {
  const { user } = useAuth();
  const { sessions: storeSessions, availability: storeAvailability } = useSchedule();
  const [calendarView, setCalendarView] = useState('week');
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [startDate, setStartDate] = useState('2026-10-22');
  const [endDate, setEndDate] = useState('2026-10-28');

  const [form, setForm] = useState({ date: '2026-10-22', from: '', to: '' });

  const [dynamicSessions, setDynamicSessions] = useState([]);
  const [dynamicAvailability, setDynamicAvailability] = useState([]);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const doctorId = user?.therapistId || user?.userId || user?.id;
    if (!doctorId) return;
    fetchDoctorAvailability(doctorId)
      .then((res) => {
        const slots = (res.data || []).map((s) => ({
          id: s.id,
          date: new Date(s.startTime).toISOString().split('T')[0],
          from: new Date(s.startTime).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
          to: new Date(s.endTime).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        }));
        setDynamicAvailability(slots);
      })
      .catch(console.error);
    fetchPatients()
      .then((res) => {
        const pending = (res.data || []).slice(0, 3).map((p, i) => ({
          id: `req-${p.patientId}`,
          name: `${p.firstName} ${p.lastName}`,
          note: p.notes || p.medicalHistory || 'طلب جلسة استشارية',
          img: p.profileImageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
          date: new Date().toISOString().split('T')[0],
          time: '11:00 ص',
          sessionType: 'أونلاين',
        }));
        setRequests(pending);
      })
      .catch(console.error);
  }, [user]);

  const TIME_SLOTS = ['09:00 ص', '10:00 ص', '11:00 ص', '12:00 م', '01:00 م', '02:00 م', '03:00 م'];
  const WEEK_DAYS_NAMES = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  // دالة توليد نطاق التواريخ والأيام بشكل ديناميكي مصلحة وآمنة تماماً
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
    }
    return daysArray;
  };

  const currentDaysRange = getGeneratedDaysRange(startDate, endDate);

  const formatTimeToShow = (timeString) => {
    if (!timeString) return '';
    const [hour] = timeString.split(':');
    const H = parseInt(hour, 10);
    const ampm = H >= 12 ? 'م' : 'ص';
    const h = H % 12 || 12;
    return `${String(h).padStart(2, '0')}:00 ${ampm}`;
  };

  const handleAcceptRequest = (req) => {
    const newSession = {
      id: `dynamic-${Date.now()}`,
      patient: req.name,
      date: req.date,
      time: req.time,
      type: req.sessionType
    };
    setDynamicSessions((prev) => [...prev, newSession]);
    acceptSession({ patient: req.name, date: req.date, time: req.time, type: req.sessionType });
    setRequests((prev) => prev.filter((r) => r.id !== req.id));
  };

  const handleAddAvailability = (e) => {
    e.preventDefault();
    if (!form.from) return;
    
    const newSlot = {
      id: `avail-${Date.now()}`,
      date: form.date, 
      from: formatTimeToShow(form.from),
      to: form.to
    };

    setDynamicAvailability((prev) => [...prev, newSlot]);
    addAvailability({ date: form.date, from: form.from, to: form.to });
    setShowAddModal(false);
  };

  const isSameDate = (dateObj, dateStr) => {
    if (!dateObj || !dateStr) return false;
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}` === dateStr;
  };

  return (
    <div className="min-h-screen bg-[#F7FAFA] text-[#181C1D] flex flex-col justify-between font-['Cairo',sans-serif]" style={{ direction: 'rtl' }}>
      <Header />

      <main className="w-full flex-1 flex flex-col lg:flex-row gap-6 max-w-[1240px] mx-auto px-4 py-8">
        <div className="w-full lg:w-64 shrink-0">
          <Sidebar activeTab="timetable" />
        </div>

        <div className="flex-1 w-full space-y-6 text-right">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-black text-[#181C1D]">مرحباً د. سارة</h2>
            <button 
              onClick={() => {
                setForm(prev => ({ ...prev, date: startDate }));
                setShowAddModal(true);
              }}
              className="bg-[#316764] hover:bg-[#254f4d] text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-3xs transition-all"
            >
              <i className="fa-solid fa-plus text-[10px]"></i>
              <span>إضافة توفر جديد</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 bg-white rounded-[24px] border border-[#E6E9E9] shadow-3xs p-6 space-y-6">
              
              {/* شريط التحكم وفلاتر النطاق الزمني */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-[#707978]">من:</span>
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="p-1.5 text-xs rounded-lg border border-[#E6E9E9] bg-[#F7FAFA] text-[#181C1D] focus:outline-hidden focus:border-[#316764] font-medium cursor-pointer"
                  />
                  <span className="text-xs font-bold text-[#707978] mr-1">إلى:</span>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="p-1.5 text-xs rounded-lg border border-[#E6E9E9] bg-[#F7FAFA] text-[#181C1D] focus:outline-hidden focus:border-[#316764] font-medium cursor-pointer"
                  />
                </div>

                <div className="flex bg-[#F7FAFA] p-0.5 rounded-xl border border-[#E6E9E9]">
                  <button className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${calendarView === 'day' ? 'bg-white text-[#316764] shadow-3xs' : 'text-[#707978]'}`} onClick={() => setCalendarView('day')}>يوم</button>
                  <button className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${calendarView === 'week' ? 'bg-white text-[#316764] shadow-3xs' : 'text-[#707978]'}`} onClick={() => setCalendarView('week')}>أسبوع</button>
                  <button className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${calendarView === 'month' ? 'bg-white text-[#316764] shadow-3xs' : 'text-[#707978]'}`} onClick={() => setCalendarView('month')}>شهر</button>
                </div>
              </div>

              {/* شبكة التقويم وعرض الشهر الشغال والمصلح */}
              {calendarView === 'month' ? (
                <div className="border border-[#E6E9E9] rounded-2xl p-4 bg-white space-y-3 animate-fadeIn">
                  <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-black text-[#707978] border-b border-[#E6E9E9] pb-2">
                    {['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map(d => <div key={d}>{d}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {currentDaysRange.map((dateObj, idx) => {
                      const hasAppoint = dynamicSessions.some(s => isSameDate(dateObj, s.date));
                      const hasAvail = dynamicAvailability.some(a => isSameDate(dateObj, a.date));

                      return (
                        <div 
                          key={idx} 
                          onClick={() => {
                            const formattedClicked = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
                            setStartDate(formattedClicked);
                            setEndDate(formattedClicked);
                            setCalendarView('day'); 
                          }}
                          className="min-h-[60px] p-2 bg-[#F7FAFA]/60 rounded-xl border border-[#E6E9E9] flex flex-col justify-between items-end hover:border-[#316764] transition-all cursor-pointer"
                        >
                          <span className="text-xs font-black text-[#181C1D]">{dateObj.getDate()}</span>
                          <div className="flex gap-1 w-full justify-start">
                            {hasAppoint && <div className="w-1.5 h-1.5 rounded-full bg-[#316764]"></div>}
                            {hasAvail && <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="border border-[#E6E9E9] rounded-2xl overflow-hidden bg-white animate-fadeIn">
                  <div className={`grid border-b border-[#E6E9E9] bg-[#F7FAFA]/60 p-2 text-center items-center ${calendarView === 'day' ? 'grid-cols-[1fr_80px]' : `grid-cols-[repeat(${currentDaysRange.length},1fr)_80px]`}`}>
                    {currentDaysRange.map((dateObj, i) => (
                      <div key={i} className="flex flex-col items-center py-1 border-l border-[#E6E9E9]/40 last:border-l-0">
                        <span className="text-[10px] text-[#707978] font-medium">{WEEK_DAYS_NAMES[dateObj.getDay()]}</span>
                        <span className="text-xs font-black mt-0.5 w-6 h-6 flex items-center justify-center rounded-full bg-[#316764]/5 text-[#181C1D]">{dateObj.getDate()}</span>
                      </div>
                    ))}
                    <div className="text-[10px] font-bold text-[#707978]">الوقت</div>
                  </div>

                  <div className="divide-y divide-[#E6E9E9]/60 max-h-[380px] overflow-y-auto">
                    {TIME_SLOTS.map((time, tIdx) => (
                      <div key={tIdx} className={`grid items-stretch min-h-[55px] ${calendarView === 'day' ? 'grid-cols-[1fr_80px]' : `grid-cols-[repeat(${currentDaysRange.length},1fr)_80px]`}`}>
                        {currentDaysRange.map((dateObj, dIdx) => {
                          const activeSession = dynamicSessions.find(s => isSameDate(dateObj, s.date) && s.time === time);
                          const activeAvail = dynamicAvailability.find(a => isSameDate(dateObj, a.date) && a.from === time);

                          return (
                            <div key={dIdx} className="p-1 border-l border-[#E6E9E9]/40 flex items-center justify-center bg-white relative">
                              {activeSession ? (
                                <div className={`w-full h-full p-2 rounded-xl text-right flex flex-col justify-between transition-all ${activeSession.type === 'أونلاين' ? 'bg-blue-50 border border-blue-200 text-blue-800' : 'bg-teal-50 border border-[#316764]/30 text-[#316764]'}`}>
                                  <span className="text-[9px] font-black truncate">{activeSession.patient}</span>
                                  <span className="text-[8px] font-bold opacity-80">{activeSession.type}</span>
                               </div>
                              ) : activeAvail ? (
                                <div className="w-full h-full p-2 rounded-xl bg-[#316764]/5 border border-dashed border-[#83B9B5] text-right flex flex-col justify-between">
                                  <span className="text-[9px] font-black text-[#316764]">توفر متاح</span>
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                        <div className="bg-[#F7FAFA]/30 text-[#707978] text-[10px] font-bold flex items-center justify-center border-r border-[#E6E9E9]/40 py-2">{time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6 lg:col-span-1">
              <div className="bg-white rounded-[24px] border border-[#E6E9E9] shadow-3xs p-5 space-y-4">
                <div className="border-b border-[#F7FAFA] pb-2">
                  <h3 className="text-sm font-black text-[#181C1D]">أجندة الجلسات</h3>
                </div>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {dynamicSessions.map((s, idx) => (
                    <div className="flex justify-between items-center p-3 bg-[#F7FAFA] rounded-xl border border-[#E6E9E9]" key={idx}>
                      <div className="text-right">
                        <span className="text-xs font-black text-[#181C1D] block">{s.patient}</span>
                        <span className="text-[10px] text-[#707978] font-medium">{s.time}</span>
                      </div>
                      <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold ${s.type === 'أونلاين' ? 'bg-blue-50 text-blue-600' : 'bg-teal-50 text-[#316764]'}`}>{s.type}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-[24px] border border-[#E6E9E9] shadow-3xs p-5 space-y-4">
                <div className="border-b border-[#F7FAFA] pb-2">
                  <h3 className="text-sm font-black text-[#181C1D]">طلبات جديدة</h3>
                </div>
                {requests.map((req) => (
                  <div className="p-4 bg-[#F7FAFA] rounded-[20px] border border-[#E6E9E9] space-y-3" key={req.id}>
                    <div className="flex items-center gap-3">
                      <img src={req.img} alt={req.name} className="w-10 h-10 rounded-xl object-cover border border-[#E6E9E9]" />
                      <div>
                        <h4 className="text-xs font-black text-[#181C1D]">{req.name}</h4>
                        <span className="text-[10px] text-[#707978] font-medium">{req.time}</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-[#707978] leading-relaxed bg-white p-2.5 rounded-xl border border-[#E6E9E9]/40">{req.note}</p>
                    <div className="flex items-center gap-2 pt-1">
                      <button onClick={() => handleAcceptRequest(req)} className="flex-1 bg-[#316764] hover:bg-[#254f4d] text-white text-[11px] font-bold py-2 rounded-xl cursor-pointer">قبول</button>
                      <button onClick={() => setRequests(p => p.filter(r => r.id !== req.id))} className="flex-1 bg-white border border-[#E6E9E9] text-rose-600 text-[11px] font-bold py-2 rounded-xl cursor-pointer">رفض</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>

      {showAddModal && (
        <div className="fixed inset-0 bg-[#181C1D]/60 backdrop-blur-xs flex items-center justify-center p-4 left-0 top-0 right-0 bottom-0 w-full h-full" style={{ zIndex: 9999 }} onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-[24px] border border-[#E6E9E9] shadow-2xl w-full max-w-sm p-6 relative text-right animate-scaleUp" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-[#E6E9E9] pb-3 mb-4">
              <h3 className="text-base font-black text-[#181C1D]">إضافة ميعاد توفر</h3>
              <button onClick={() => setShowAddModal(false)} className="w-8 h-8 rounded-full bg-[#F7FAFA] hover:bg-rose-500 hover:text-white flex items-center justify-center text-[#181C1D] cursor-pointer"><i className="fa-solid fa-xmark text-sm"></i></button>
            </div>
            <form className="space-y-4 text-xs" onSubmit={handleAddAvailability}>
              <div className="space-y-1">
                <span className="font-bold text-[#181C1D] block">التاريخ للتوفر</span>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full p-2.5 rounded-xl bg-[#F7FAFA] border border-[#E6E9E9] focus:outline-hidden font-medium cursor-pointer" required />
              </div>
              <div className="space-y-1">
                <span className="font-bold text-[#181C1D] block">من الساعة</span>
                <input type="time" value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} className="w-full p-2.5 rounded-xl bg-[#F7FAFA] border border-[#E6E9E9] focus:outline-hidden cursor-pointer" required />
              </div>
              <button type="submit" className="w-full bg-[#316764] hover:bg-[#254f4d] text-white font-bold py-3 rounded-xl cursor-pointer text-center">تأكيد وإضافة ميعاد</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TimeTable;