import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Header from "../components/layout/Header";
import Sidebar from '../components/Sidebar/Sidebar';

const chartData = {
    week: [
        { name: 'السبت', المزاج: 6 },
        { name: 'الأحد', المزاج: 4 },
        { name: 'الإثنين', المزاج: 7 },
        { name: 'الثلاثاء', المزاج: 5 },
        { name: 'الأربعاء', المزاج: 8 },
        { name: 'الخميس', المزاج: 7.4 },
        { name: 'الجمعة', المزاج: 9 },
    ],
    month: [
        { name: 'الأسبوع 1', المزاج: 5 },
        { name: 'الأسبوع 2', المزاج: 6.5 },
        { name: 'الأسبوع 3', المزاج: 7.4 },
        { name: 'الأسبوع 4', المزاج: 8.2 },
    ]
};

const sessionsHistory = [
    { id: 12, title: "الجلسة الثانية عشر", date: "28 يونيو 2026", time: "04:00 مساءً", mode: "حضوري", duration: "50 دقيقة", status: "مكتملة", symptoms: "أرق خفيف، تحسن استجابة القلق", recommendations: "الاستمرار على تمارين التجذير اليومية وتنظيم ساعات النوم قبل العمل بـ ساعتين." },
    { id: 11, title: "الجلسة الحادية عشر", date: "21 يونيو 2026", time: "05:30 مساءً", mode: "أونلاين", duration: "50 دقيقة", status: "مكتملة", symptoms: "توتر حاد بسبب ضغط تسليمات العمل", recommendations: "تطبيق استراتيجية الـ Time-boxing وتقليل الكافيين بعد الساعة 4 عصراً." },
    { id: 10, title: "الجلسة العاشرة", date: "14 يونيو 2026", time: "04:00 مساءً", mode: "حضوري", duration: "60 دقيقة", status: "مكتملة", symptoms: "بداية المتابعة، نوبات هلع متكررة", recommendations: "فهم محفزات الـ Panic attacks الأساسية وتدوينها فور حدوثها." },
    { id: 9, title: "الجلسة التاسعة", date: "7 يونيو 2026", time: "04:00 مساءً", mode: "حضوري", duration: "50 دقيقة", status: "مكتملة", symptoms: "تحسن طفيف في جودة النوم ونقص معدل الكوابيس", recommendations: "تجنب مناقشة مشاكل العمل قبل النوم والالتزام بتمارين التنفس العميق." },
    { id: 8, title: "الجلسة الثامنة", date: "31 مايو 2026", time: "06:00 مساءً", mode: "أونلاين", duration: "50 دقيقة", status: "مكتملة", symptoms: "تراجع مؤقت في المزاج بسبب ضغوطات عائلية", recommendations: "فصل التفكير في المشاكل الشخصية وتطبيق تقنيات التفريغ الانفعالي الكتابي." }
];

function PatientProfile() {
    const navigate = useNavigate();
    const [activeFilter, setActiveFilter] = useState('week');
    const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
    const [isAllSessionsModalOpen, setIsAllSessionsModalOpen] = useState(false); // State لـ بوب اب "كل الجلسات"
    const [selectedSession, setSelectedSession] = useState(null);

    const [allMeetingNotes, setAllMeetingNotes] = useState([
        { id: 1, date: "28 يونيو 2026", session: "الجلسة #12", text: "أظهرت سارة تحسناً ملحوظاً في إدارة نوبات القلق الصباحية. ناقشنا تقنية التجذير 5-4-3-2-1 وأبدت استجابة جيدة. لا تزال تعاني من بعض الأرق المرتبط بضغط العمل، قمنا بتعديل خطة النوم لتشمل تمارين استرخاء عضلات تدريجي." },
        { id: 2, date: "21 يونيو 2026", session: "الجلسة #11", text: "كانت الجلسة عبر الإنترنت، ركزنا على تتبع الأفكار التلقائية السلبية المصاحبة لنوبات الهلع عند حدوث مواقف مفاجئة في بيئة العمل، وأوصينا بكتابة المذكرات اليومية." },
        { id: 3, date: "14 يونيو 2026", session: "الجلسة #10", text: "بداية الخطة العلاجية السلوكية المعرفية (CBT)، شرح المفهوم وتحديد الأهداف العامة مع المريضة لقياس التطور." }
    ]);

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

    const lastSessionNote = allMeetingNotes.find(note => note.id === 1);

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
                    
                    {/* هيدر معلومات المريض العلوي */}
                    <div className="bg-white rounded-[24px] border border-[#E6E9E9] shadow-3xs p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-300 hover:shadow-2xs">
                        <div className="flex items-center gap-4 text-right">
                            <img
                                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
                                alt="بروفايل المريض"
                                className="w-16 h-16 rounded-[20px] object-cover border border-[#E6E9E9]"
                            />
                            <div className="space-y-1">
                                <h3 className="text-xl font-black text-[#181C1D]">سارة محمود</h3>
                                <div className="flex items-center gap-2 text-[#707978] text-xs font-medium">
                                    <span className="flex items-center gap-1"><i className="fa-solid fa-cake-candles text-[10px]"></i> 24 عاماً</span>
                                    <span className="text-[#E6E9E9]">|</span>
                                    <span className="flex items-center gap-1"><i className="fa-solid fa-calendar-day text-[10px]"></i> بدأت منذ 4 أشهر</span>
                                </div>
                            </div>
                        </div>
                        <div className="w-full sm:w-auto">
                            <button 
                                onClick={() => navigate('/doctor/meetings')}
                                className="w-full sm:w-auto bg-[#316764] hover:bg-[#254f4d] text-white text-xs font-bold px-5 py-3 rounded-xl shadow-xs transition-all duration-300 hover:scale-102 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <i className="fa-solid fa-play text-[10px]"></i> ابدأ الجلسة الآن
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

                            <div className="w-full h-44">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData[activeFilter]} margin={{ top: 10, right: -15, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#316764" stopOpacity={0.2}/>
                                                <stop offset="95%" stopColor="#316764" stopOpacity={0.01}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#F7FAFA" vertical={false} />
                                        <XAxis dataKey="name" stroke="#707978" fontSize={11} tickLine={false} axisLine={false} dy={8} />
                                        <YAxis domain={[1, 10]} stroke="#707978" fontSize={11} tickLine={false} axisLine={false} tickCount={5} />
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
                                    <span className="text-[11px] font-bold text-[#316764] bg-[#F7FAFA] px-2.5 py-1 rounded-lg border border-[#E6E9E9]">Anxiety</span>
                                    <span className="text-[11px] font-bold text-[#316764] bg-[#F7FAFA] px-2.5 py-1 rounded-lg border border-[#E6E9E9]">CBT Patient</span>
                                    <span className="text-[11px] font-bold text-[#316764] bg-[#F7FAFA] px-2.5 py-1 rounded-lg border border-[#E6E9E9]">Insomnia</span>
                                    <span className="text-[11px] font-bold text-[#316764] bg-[#F7FAFA] px-2.5 py-1 rounded-lg border border-[#E6E9E9]">Self-Esteem</span>
                                </div>
                            </div>

                            <div className="bg-[#316764] rounded-[24px] shadow-3xs p-5 space-y-3 text-white">
                                <span className="text-[10px] tracking-wider font-bold text-teal-100/80 block">الجلسة القادمة</span>
                                <div className="space-y-0.5">
                                    <h5 className="text-base font-black">الثلاثاء، 12 أكتوبر</h5>
                                    <p className="text-xs text-teal-50/90 font-medium">من الساعة 04:00 مساءً (50 دقيقة)</p>
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

                            {editingNoteId === lastSessionNote?.id ? (
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
                            {sessionsHistory.map((session) => (
                                <div 
                                    key={session.id}
                                    onClick={() => {
                                        setSelectedSession(session); // يسمح بفتح تفاصيل الجلسة الفرعية مباشرة
                                    }}
                                    className="flex justify-between items-center p-4 bg-[#F7FAFA] hover:bg-teal-50/30 hover:border-[#316764]/30 rounded-2xl border border-[#E6E9E9] cursor-pointer transition-all duration-200 group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-2,5 h-2,5 rounded-full bg-[#316764]"></div>
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