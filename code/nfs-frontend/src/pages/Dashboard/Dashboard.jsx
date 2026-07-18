import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPatients } from '../../api/patients';
import { fetchDoctorAppointments } from '../../api/appointments';
import { fetchTherapistByUserId } from '../../api/therapists';
import { useAuth } from '../../context/AuthContext';
import { userAvatarUrl } from '../../utils/userAvatar';

function Dashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const today = new Date().toLocaleDateString('ar-EG', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const [hoveredItem, setHoveredItem] = useState(null);
    const [patients, setPatients] = useState([]);
    const [nextAppointment, setNextAppointment] = useState(null);
    const [totalPatients, setTotalPatients] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchPatients()
            .then((res) => setTotalPatients((res.data || []).length))
            .catch(console.error);

        const userId = user?.userId || user?.id;
        if (!userId) return;

        let cancelled = false;
        async function loadAppointments() {
            try {
                let therapistId = user?.therapistId;
                if (!therapistId) {
                    const therapistRes = await fetchTherapistByUserId(userId);
                    therapistId = therapistRes.data?.therapistId;
                }
                if (!therapistId) return;

                const appointmentsRes = await fetchDoctorAppointments(therapistId);
                if (cancelled) return;

                const confirmed = (appointmentsRes.data || [])
                    .filter((a) => String(a.status || '').toLowerCase() === 'confirmed')
                    .map((a) => {
                        const start = a.scheduledStartTime || a.actualStartTime;
                        return {
                            id: a.id,
                            appointmentId: a.id,
                            name: a.patientName || 'مريض',
                            startTime: start,
                            time: start
                                ? new Date(start).toLocaleTimeString('ar-EG', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })
                                : '-',
                            type: 'online',
                            typeText: a.type || 'أونلاين',
                            icon: 'fa-video',
                            img: userAvatarUrl(
                                a.patientId,
                                a.patientImageUrl,
                                a.patientName || 'مريض'
                            ),
                        };
                    })
                    .filter((a) => a.startTime);

                const todaySessions = confirmed.filter(
                    (a) =>
                        new Date(a.startTime).toDateString() ===
                        new Date().toDateString()
                );
                setPatients(todaySessions);

                const now = Date.now();
                const upcoming = confirmed
                    .filter((a) => new Date(a.startTime).getTime() >= now - 60 * 60 * 1000)
                    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
                setNextAppointment(upcoming[0] || null);
            } catch (err) {
                console.error(err);
                if (!cancelled) {
                    setPatients([]);
                    setNextAppointment(null);
                }
            }
        }

        loadAppointments();
        return () => {
            cancelled = true;
        };
    }, [user]);

    const joinAppointment = (appointment) => {
        if (!appointment?.appointmentId) {
            navigate('/doctor/dashboard');
            return;
        }
        navigate(`/doctor/meetings?appointmentId=${appointment.appointmentId}`, {
            state: {
                appointmentId: appointment.appointmentId,
                exitPath: '/doctor/dashboard',
            },
        });
    };

    const handleCancelSession = (id) => {
        if(window.confirm("هل أنت متأكد من رغبتك في إلغاء هذه الجلسة؟")) {
            setPatients(prevPatients => prevPatients.filter(patient => patient.id !== id));
        }
    };

    return (
        <div className="flex-1 w-full space-y-8 pb-12" style={{ fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>
            
            {/* هيدر الترحيب العلوي */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-[#EBEEEE] pb-5">
                <div className="text-right space-y-1">
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight transition-colors duration-300 hover:text-[#316764]">مرحباً، د. {user?.firstName || 'المعالج'} {user?.lastName || ''}</h2>
                    <p className="text-xs text-slate-400 font-medium">{today}</p>
                </div>
                <div className="bg-gradient-to-r from-teal-50 to-emerald-50/50 text-[#316764] px-4 py-2 rounded-2xl text-xs font-bold border border-teal-100/70 shadow-3xs transition-all duration-300 hover:scale-105 hover:shadow-xs">
                    الجلسات المتاحة اليوم: {patients.length} جلسات
                </div>
            </div>

            {/* الموعد القادم — مدخل مباشر لغرفة LiveKit */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-[#214f4c] to-[#408581] text-white p-6 shadow-sm">
                <div className="absolute -left-10 -top-12 w-40 h-40 rounded-full bg-white/5" />
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
                    <div className="flex items-center gap-4">
                        {nextAppointment ? (
                            <img
                                src={nextAppointment.img}
                                alt={nextAppointment.name}
                                className="w-14 h-14 rounded-2xl object-cover border border-white/20 shadow-sm shrink-0"
                            />
                        ) : (
                            <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/15 flex items-center justify-center shrink-0">
                                <i className="fa-solid fa-video text-xl"></i>
                            </div>
                        )}
                        <div className="space-y-1 text-right">
                            <span className="text-[11px] font-bold text-white/70">موعدك القادم</span>
                            {nextAppointment ? (
                                <>
                                    <h3 className="text-lg font-black">
                                        جلسة مع {nextAppointment.name}
                                    </h3>
                                    <p className="text-xs text-white/80">
                                        {new Date(nextAppointment.startTime).toLocaleDateString('ar-EG', {
                                            weekday: 'long',
                                            day: 'numeric',
                                            month: 'long',
                                        })}
                                        {' — '}
                                        {nextAppointment.time}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <h3 className="text-lg font-black">لا توجد جلسة مؤكدة قادمة</h3>
                                    <p className="text-xs text-white/75">ستظهر الجلسة هنا فور تأكيد الحجز والدفع.</p>
                                </>
                            )}
                        </div>
                    </div>

                    {nextAppointment ? (
                        <button
                            type="button"
                            onClick={() => joinAppointment(nextAppointment)}
                            className="h-12 px-6 rounded-full bg-white text-[#316764] font-black text-sm hover:bg-[#E6F0EF] transition-all active:scale-[0.98] flex items-center justify-center gap-2 shrink-0"
                        >
                            <i className="fa-solid fa-video"></i>
                            انضم إلى الجلسة
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => navigate('/doctor/timetable')}
                            className="h-12 px-6 rounded-full bg-white/10 border border-white/20 text-white font-bold text-sm hover:bg-white/20 transition-all flex items-center justify-center gap-2 shrink-0"
                        >
                            عرض الجدول
                        </button>
                    )}
                </div>
            </div>

            {/* 1. إحصائيات الـ Bento Grid العلوية */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {/* كارت إجمالي المرضى */}
                <div className="bg-white rounded-3xl border border-[#EBEEEE] shadow-3xs p-6 flex items-center justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-1 group">
                    <div className="text-right space-y-1">
                        <span className="text-xs font-bold text-slate-400 block">إجمالي المرضى</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-xl font-black text-slate-800">{totalPatients} مريض</span>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100">+12%</span>
                        </div>
                    </div>
                    <div className="w-11 h-11 bg-slate-50 border border-slate-100 text-slate-500 rounded-xl flex items-center justify-center text-sm transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-[#316764] group-hover:to-[#224a48] group-hover:text-white group-hover:scale-110 shadow-3xs">
                        <i className="fa-solid fa-user-injured"></i>
                    </div>
                </div>

                {/* كارت ساعات العمل */}
                <div className="bg-white rounded-3xl border border-[#EBEEEE] shadow-3xs p-6 flex items-center justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-1 group">
                    <div className="text-right space-y-1">
                        <span className="text-xs font-bold text-slate-400 block">ساعات العمل هذا الأسبوع</span>
                        <span className="text-xl font-black text-slate-800">32 ساعة</span>
                    </div>
                    <div className="w-11 h-11 bg-slate-50 border border-slate-100 text-slate-500 rounded-xl flex items-center justify-center text-sm transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-[#316764] group-hover:to-[#224a48] group-hover:text-white group-hover:scale-110 shadow-3xs">
                        <i className="fa-regular fa-clock"></i>
                    </div>
                </div>

                {/* كارت متوسط المزاج */}
                <div className="bg-white rounded-3xl border border-[#EBEEEE] shadow-3xs p-6 flex items-center justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-1 group">
                    <div className="text-right space-y-1">
                        <span className="text-xs font-bold text-slate-400 block">متوسط مزاج المرضى</span>
                        <span className="text-xl font-black text-slate-800">7.4 / 10</span>
                    </div>
                    <div className="w-11 h-11 bg-slate-50 border border-slate-100 text-slate-500 rounded-xl flex items-center justify-center text-sm transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-[#316764] group-hover:to-[#224a48] group-hover:text-white group-hover:scale-110 shadow-3xs">
                        <i className="fa-regular fa-face-smile"></i>
                    </div>
                </div>
            </div>

            {/* 2. قسم الجدول الزمني العريض الممتد بالكامل */}
            <div className="bg-white rounded-3xl border border-[#EBEEEE] shadow-3xs p-6 space-y-6 transition-all duration-300 hover:shadow-xs">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3 flex-row-reverse">
                    <h3 className="text-base font-bold text-slate-800">الجدول الزمني لليوم</h3>
                    <button 
                        onClick={() => setIsModalOpen(true)} 
                        className="text-xs text-teal-600 font-bold hover:text-teal-700 hover:underline transition-all duration-200 cursor-pointer"
                    >
                        عرض الكل
                    </button>
                </div>

                <div className="relative pl-2 pr-6 space-y-4">
                    <div className="absolute right-9 top-3 bottom-3 w-[2px] bg-slate-100 z-0"></div>

                    {patients.length === 0 ? (
                        <p className="text-center text-sm text-slate-400 py-4">لا توجد جلسات متبقية اليوم.</p>
                    ) : (
                        patients.map((patient) => {
                            const isHovered = hoveredItem === patient.id;
                            return (
                                <div
                                    key={patient.id}
                                    className="relative flex items-center justify-between gap-4 z-10"
                                    onMouseEnter={() => setHoveredItem(patient.id)}
                                    onMouseLeave={() => setHoveredItem(null)}
                                >
                                    <div className="w-6 flex justify-center shrink-0 order-3">
                                        <div className={`w-3 h-3 rounded-full border-2 border-white transition-all duration-300 z-10 ${
                                            isHovered ? 'bg-[#316764] scale-130 ring-4 ring-teal-100' : 'bg-slate-300'
                                        }`}></div>
                                    </div>

                                    <div className={`flex-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl border transition-all duration-300 order-2 text-right ${
                                        isHovered ? 'bg-teal-50/20 border-teal-200/40 shadow-xs translate-x-1' : 'bg-white border-slate-100'
                                    }`}>
                                        <div className="flex items-center gap-3 flex-row-reverse">
                                            <img src={patient.img} alt={patient.name} className="w-11 h-11 rounded-xl object-cover border border-slate-100 shadow-3xs shrink-0" />
                                            <div className="space-y-0.5">
                                                <h5 className="text-sm font-bold text-slate-800">{patient.name}</h5>
                                                <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 justify-end font-medium">
                                                    <i className="fa-regular fa-clock text-[10px]"></i> {patient.time}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
                                            <span className={`text-[10px] px-3 py-1 rounded-xl font-bold border flex items-center gap-1.5 shadow-3xs ${
                                                patient.type === 'online' 
                                                    ? 'bg-blue-50 text-blue-600 border-blue-100' 
                                                    : 'bg-teal-50 text-[#316764] border-teal-100/60'
                                            }`}>
                                                <i className={`fa-solid ${patient.icon} text-[10px]`}></i>
                                                <span>{patient.typeText}</span>
                                            </span>

                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => handleCancelSession(patient.id)}
                                                    className="bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all duration-300 hover:scale-102 active:scale-98 cursor-pointer"
                                                >
                                                    إلغاء الجلسة
                                                </button>
                                                
                                                <button 
                                                    onClick={() => joinAppointment(patient)}
                                                    className="bg-gradient-to-r from-[#316764] to-[#408581] hover:from-[#254f4d] hover:to-[#316764] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition-all duration-300 hover:scale-102 active:scale-98 cursor-pointer"
                                                >
                                                    انضم الآن
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* 3. شريط النشاط الأخير المطور */}
            <div className="bg-white rounded-3xl border border-[#EBEEEE] shadow-3xs p-6 space-y-4 transition-all duration-300 hover:shadow-xs">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3 flex-row-reverse">
                    <h3 className="text-base font-bold text-slate-800">نشاط المرضى الأخير</h3>
                    <span className="text-[10px] font-bold text-teal-700 bg-gradient-to-r from-teal-50 to-emerald-50 px-2.5 py-1 rounded-lg border border-teal-100">تحديثات المزاج حية</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl flex items-start gap-3 flex-row-reverse text-right transition-all duration-300 hover:bg-white hover:border-slate-200 hover:shadow-3xs">
                        <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0 text-sm border border-rose-100/60">
                            <i className="fa-regular fa-face-frown"></i>
                        </div>
                        <div className="space-y-1 w-full">
                            <div className="flex items-center justify-between flex-row-reverse">
                                <h5 className="text-xs font-bold text-slate-800">منى أحمد</h5>
                                <span className="text-[10px] text-slate-400 font-medium">منذ ساعتين</span>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                قامت بتحديث مزاجها: <span className="text-rose-600 font-semibold italic">"أشعر بالإرهاق الشديد اليوم"</span>
                            </p>
                        </div>
                    </div>

                    <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl flex items-start gap-3 flex-row-reverse text-right transition-all duration-300 hover:bg-white hover:border-slate-200 hover:shadow-3xs">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0 text-sm border border-emerald-100/60">
                            <i className="fa-regular fa-face-smile-beam"></i>
                        </div>
                        <div className="space-y-1 w-full">
                            <div className="flex items-center justify-between flex-row-reverse">
                                <h5 className="text-xs font-bold text-slate-800">رنا خالد</h5>
                                <span className="text-[10px] text-slate-400 font-medium">منذ 6 ساعات</span>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                قامت بتحديث مزاجها: <span className="text-emerald-600 font-semibold italic">"يوم هادئ ومنتج"</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. الـ Popup (Modal) المطور فوق كل حاجة بالشاشة */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 left-0 top-0 right-0 bottom-0 w-full h-full" style={{ zIndex: 9999 }}>
                    <div className="bg-white rounded-3xl border border-[#EBEEEE] shadow-2xl w-full max-w-2xl p-6 relative max-h-[85vh] overflow-y-auto text-right">
                        
                        {/* هيدر الـ Popup مع زر الـ X الإغلاق الواضح جداً */}
                        <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4 flex-row-reverse">
                            <h3 className="text-lg font-black text-slate-800">كل جلسات اليوم المتاحة</h3>
                            {/* تغيير لون وتصميم الزرار عشان الـ X تظهر بوضوح */}
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all duration-200 text-slate-700 font-black cursor-pointer shadow-3xs text-sm"
                                title="إغلاق"
                            >
                                <i className="fa-solid fa-xmark text-base font-bold"></i>
                            </button>
                        </div>

                        {/* محتوى الجلسات داخل الـ Popup */}
                        <div className="space-y-3">
                            {patients.length === 0 ? (
                                <p className="text-center text-sm text-slate-400 py-8">لا توجد جلسات مسجلة اليوم.</p>
                            ) : (
                                patients.map((patient) => (
                                    <div key={patient.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/50 text-right hover:border-teal-100 transition-colors">
                                        <div className="flex items-center gap-3 flex-row-reverse">
                                            <img src={patient.img} alt={patient.name} className="w-11 h-11 rounded-xl object-cover shrink-0" />
                                            <div>
                                                <h5 className="text-sm font-bold text-slate-800">{patient.name}</h5>
                                                <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 justify-end">
                                                    <i className="fa-regular fa-clock text-[10px]"></i> {patient.time}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                                            <span className={`text-[10px] px-3 py-1 rounded-xl font-bold border ${
                                                patient.type === 'online' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-teal-50 text-[#316764] border-teal-100/60'
                                            }`}>
                                                {patient.typeText}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => {
                                                        handleCancelSession(patient.id);
                                                        if (patients.length <= 1) setIsModalOpen(false);
                                                    }}
                                                    className="bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white text-[11px] font-bold px-3 py-2 rounded-xl transition-all cursor-pointer"
                                                >
                                                    إلغاء الجلسة
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        setIsModalOpen(false);
                                                        joinAppointment(patient);
                                                    }}
                                                    className="bg-gradient-to-r from-[#316764] to-[#408581] text-white text-[11px] font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
                                                >
                                                    انضم
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default Dashboard;