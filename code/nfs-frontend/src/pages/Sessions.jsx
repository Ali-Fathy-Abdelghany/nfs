import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { fetchUserSessions } from '../api/sessions';
import { useAuth } from '../context/AuthContext';


function Sessions() {
    const [sessions, setSessions] = useState([]);
    const { user } = useAuth() || {};
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (!user?.id) return;
      fetchUserSessions(user.id)
        .then(res => setSessions(res.data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }, [user]);
    const [activeFilter, setActiveFilter] = useState('الكل');
    
    // States الخاصة بالـ Popup (Modal) للملاحظات
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedNotes, setSelectedNotes] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState('');

    // دالة تحويل التواريخ النصية العربية إلى Date Object حقيقي
    const parseArabicDate = (dateStr, timeStr) => {
        try {
            if (!dateStr) return new Date();
            const parts = dateStr.trim().split(' ');
            const day = parseInt(parts[1], 10);
            const monthName = parts[2];

            const months = {
                'يناير': 0, 'فبراير': 1, 'مارس': 2, 'أبريل': 3, 'مايو': 4, 'يونيو': 5,
                'يوليو': 6, 'أغسطس': 7, 'سبتمبر': 8, 'أكتوبر': 9, 'نوفمبر': 10, 'ديسمبر': 11
            };
            const month = months[monthName] !== undefined ? months[monthName] : 6; 

            let hours = 12;
            let minutes = 0;
            if (timeStr) {
                const timeParts = timeStr.replace('مستقبلًا', '').trim().split(' ');
                const hourMin = timeParts[0].split(':');
                hours = parseInt(hourMin[0], 10);
                minutes = parseInt(hourMin[1], 10);
                const isPm = timeParts[1] === 'مساءً' || timeStr.includes('م') || timeStr.includes('مساء');

                if (isPm && hours < 12) hours += 12;
                if (!isPm && hours === 12) hours = 0;
            }

            return new Date(2026, month, day, hours, minutes);
        } catch (e) {
            return new Date(); 
        }
    };

    // دالة تحديد حالة الجلسة بذكاء
    const getSessionStatus = (session) => {
        if (session.status) {
            const statusUpper = session.status.toUpperCase();
            if (statusUpper === 'COMPLETED' || statusUpper === 'منتهية') return 'منتهية';
            if (statusUpper === 'ACTIVE' || statusUpper === 'IN PROGRESS') return 'مؤكدة';
            if (statusUpper === 'PENDING' || statusUpper === 'SCHEDULED' || statusUpper === 'مؤكدة') return 'مؤكدة';
            if (statusUpper === 'CANCELLED') return 'منتهية';
        }
        return 'مؤكدة';
    };

    // دالة تحويل وتنسيق التواريخ من الـ API
    const formatSessionDate = (session) => {
        if (!session.actualStartTime) return { dateStr: 'غير محدد', timeStr: 'غير محدد', dateObj: new Date() };
        try {
            const dateObj = new Date(session.actualStartTime);
            
            // خيارات تنسيق التاريخ باللغة العربية
            const dateOptions = { day: 'numeric', month: 'long', year: 'numeric', calendar: 'gregory' };
            const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
            
            const dateStr = dateObj.toLocaleDateString('ar-EG', dateOptions);
            const timeStr = dateObj.toLocaleTimeString('ar-EG', timeOptions);
            
            return { dateStr, timeStr, dateObj };
        } catch (e) {
            return { dateStr: 'غير محدد', timeStr: 'غير محدد', dateObj: new Date() };
        }
    };

    // معالجة وتصفية الجلسات الخاصة بالمريض
    const processedSessions = useMemo(() => {
        if (!sessions || !Array.isArray(sessions)) return [];
        let result = [...sessions];
        
        // ترتيب زمني تصاعدي (من الأقدم للأحدث)
        result.sort((a, b) => {
            const timeA = a.actualStartTime ? new Date(a.actualStartTime).getTime() : 0;
            const timeB = b.actualStartTime ? new Date(b.actualStartTime).getTime() : 0;
            return timeA - timeB;
        });

        if (activeFilter !== 'الكل') {
            result = result.filter(s => getSessionStatus(s) === activeFilter);
        }
        return result;
    }, [sessions, activeFilter]);

    // حساب العدادات الرقمية
    const filterCounts = useMemo(() => {
        const counts = { 'الكل': 0, 'مؤكدة': 0, 'في انتظار الموافقة': 0, 'منتهية': 0 };
        if (!sessions || !Array.isArray(sessions)) return counts;

        counts['الكل'] = sessions.length;
        sessions.forEach(s => {
            const status = getSessionStatus(s);
            if (counts[status] !== undefined) {
                counts[status]++;
            }
        });
        return counts;
    }, [sessions]);

    // تفاصيل الستايلات والأيقونات بناءً على الحالة الفعلية
    const getStatusDetails = (status) => {
        switch (status) {
            case 'منتهية':
                return {
                    text: 'جلسة سابقة (منتهية)',
                    classes: 'bg-slate-100 text-slate-600 border border-slate-200/60',
                    icon: 'fa-circle-check'
                };
            case 'في انتظار الموافقة':
                return {
                    text: 'في انتظار موافقة الدكتور',
                    classes: 'bg-amber-50 text-amber-700 border border-amber-200/60',
                    icon: 'fa-clock'
                };
            case 'مؤكدة':
            default:
                return {
                    text: 'مؤكدة ومستني ميعادها',
                    classes: 'bg-teal-50 text-[#316764] border border-teal-200/60',
                    icon: 'fa-calendar-day'
                };
        }
    };

    // فتح الـ Popup للملاحظات عند الضغط على كروت الجلسات المنتهية فقط
    const handleCardClick = (session, currentStatus) => {
        if (currentStatus === 'منتهية') {
            const docName = session.doctorName || 'المعالج النفسي';
            const notesText = session.notes || 'جلسة استشارية مكتملة بنجاح، ناقشنا خلالها آليات التعامل مع الضغوط اليومية، وتمت التوصية بالاستمرار على تدوين الأفكار السلبية بشكل يومي وممارسة تمارين الاسترخاء.';
            
            setSelectedDoctor(docName);
            setSelectedNotes(notesText);
            setIsModalOpen(true);
        }
    };

    return (
        <div className="min-h-screen bg-[#F7FAFA] text-[#181C1D] pb-24 pt-4 flex flex-col justify-between" style={{ fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>
            <div>
                <Header /> 

                <main className="w-full mt-6">
                    <div className="max-w-[1000px] mx-auto px-4">
                        
                        {/* الهيدر العلوي */}
                        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#EBEEEE] pb-4 gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-[#316764] flex items-center gap-2">
                                    <i className="fa-solid fa-calendar-check"></i> جلساتي وحجوزاتي الطبية
                                </h2>
                                <p className="text-xs text-gray-500 mt-1">تابع أرشيف جلساتك السابقة، والحجوزات المنتظرة، والمواعيد القادمة المؤكدة مرتبة زمنياً.</p>
                            </div>
                            <span className="text-xs bg-white border border-[#EBEEEE] px-3 py-1.5 rounded-xl font-medium shadow-2xs">
                                إجمالي الحجوزات: {filterCounts['الكل']}
                            </span>
                        </div>

                        {/* الفلاتر العلوية التفاعلية */}
                        <div className="flex flex-wrap gap-2 mb-6 bg-white p-1.5 rounded-2xl border border-[#EBEEEE] shadow-2xs">
                            {[
                                { key: 'الكل', label: 'كافة الجلسات' },
                                { key: 'مؤكدة', label: 'مؤكدة ومستني ميعادها' },
                                { key: 'في انتظار الموافقة', label: 'في انتظار الموافقة' },
                                { key: 'منتهية', label: 'السجلات والمنتهية (History)' }
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
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                                        activeFilter === filter.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                                    }`}>
                                        {filterCounts[filter.key]}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* قائمة الجلسات المفلترة */}
                        {processedSessions.length === 0 ? (
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
                                    const formattedDate = formatSessionDate(s);

                                    return (
                                        <div 
                                            onClick={() => handleCardClick(s, currentStatus)}
                                            className={`bg-white p-5 rounded-2xl border border-[#EBEEEE] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all border-r-4 ${
                                                s.type === 'أونلاين' ? 'border-r-blue-500' : 'border-r-[#316764]'
                                            } ${isFinished ? 'cursor-pointer hover:border-slate-300 hover:bg-slate-50/60 shadow-xs' : ''}`} 
                                            key={s.id}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm flex-shrink-0 ${
                                                    s.type === 'أونلاين' ? 'bg-blue-50 text-blue-600' : 'bg-teal-50 text-[#316764]'
                                                }`}>
                                                    <i className={`fa-solid ${s.type === 'أونلاين' ? 'fa-video' : 'fa-house-user'}`}></i>
                                                </div>
                                                
                                                <div className="flex flex-col gap-1 text-right">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-sm text-slate-800">
                                                            {s.doctorName || 'المعالج النفسي'}
                                                        </span>
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

                                            <div className="flex items-center justify-between md:justify-end gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
                                                {isFinished && (
                                                    <span className="text-[11px] text-teal-600 font-semibold bg-teal-50/50 px-2 py-1 rounded-md ml-1 border border-teal-100 hidden md:inline-block animate-pulse">
                                                        <i className="fa-regular fa-comment-dots mr-1"></i> اضغط لرؤية ملاحظات الدكتور
                                                    </span>
                                                )}

                                                <div className={`text-[11px] px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 ${statusInfo.classes}`}>
                                                    <i className={`fa-solid ${statusInfo.icon} text-xs`}></i>
                                                    {statusInfo.text}
                                                </div>

                                                {s.type === 'أونلاين' && currentStatus === 'مؤكدة' && (
                                                    <button className="bg-[#316764] text-white text-[11px] px-4 py-2 rounded-xl font-medium hover:bg-[#254f4d] transition-colors flex items-center gap-1 shadow-xs active:scale-95">
                                                        <i className="fa-solid fa-video"></i> دخول العيادة الافتراضية
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
            
            {/* بوب اب الملاحظات والتوصيات (Notes Popup Modal) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity">
                    <div className="bg-white rounded-2xl max-w-[500px] w-full border border-slate-100 shadow-xl overflow-hidden transform scale-100 transition-all">
                        
                        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                                <i className="fa-solid fa-file-medical text-teal-600"></i> ملخص وملف الجلسة الطبي
                            </h3>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="w-7 h-7 rounded-lg text-slate-400 hover:bg-slate-200/60 hover:text-slate-600 flex items-center justify-center transition"
                            >
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        
                        <div className="p-6 text-right space-y-4">
                            <div className="bg-teal-50/40 p-3 rounded-xl border border-teal-100/50 flex gap-2 items-center">
                                <span className="text-sm font-semibold text-teal-900">الدكتور الاستشاري:</span>
                                <span className="text-sm font-bold text-teal-700">{selectedDoctor}</span>
                            </div>
                            
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">روشتة وتوصيات الطبيب للمريض:</h4>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 text-slate-700 text-sm leading-relaxed whitespace-pre-line shadow-inner">
                                    {selectedNotes}
                                </div>
                            </div>
                        </div>

                        <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50 text-left">
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="bg-[#316764] hover:bg-[#254f4d] text-white text-xs font-bold px-5 py-2 rounded-xl shadow-xs transition active:scale-95"
                            >
                                إغلاق
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}

export default Sessions;