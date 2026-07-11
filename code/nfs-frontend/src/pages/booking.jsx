import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, Clock, MapPin, ChevronDown, ChevronUp } from 'lucide-react';


export default function Booking() {
  const navigate = useNavigate();

  // --- States الخاصة بالفلترة والبحث ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [selectedSessionType, setSelectedSessionType] = useState('الكل'); // 'الكل' أو 'فيديو' أو 'محادثة'

  // --- States الخاصة بالمواعيد ---
  const [openDoctorSchedule, setOpenDoctorSchedule] = useState(null);
  const [selectedDate, setSelectedDate] = useState(14);
  const [selectedTime, setSelectedTime] = useState('09:00');

  // --- State للتحكم في تفعيل زرار انضم للجلسة ---
  const [isJoinEnabled, setIsJoinEnabled] = useState(false);

  // داتا الأطباء كاملة مع إضافة فلاتر التصنيف ونوع الجلسة لكل طبيب
  const initialDoctors = [
    {
      id: 'sara',
      name: "د. سارة الأحمد",
      specialty: "أخصائية علم نفس إكلينيكي ومختصة في العلاج السلوكي المعرفي",
      availability: "متاح غداً، 10:00 ص",
      sessions: "+1,200",
      rating: "4.9",
      experience: "12 سنة",
      price: "150 ر.س / ساعة",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300",
      categories: ["قلق", "اكتئاب"],
      sessionTypes: ["فيديو"],
      bio: "أؤمن بأن الرحلة نحو الشفاء تبدأ من خلق مساحة آمنة ومقبولة تماماً. منهجي يعتمد على الدمج بين العلاج السلوكي المعرفي (CBT) والتعاطف الذاتي لمساعدتك على فهم أنماط تفكيرك وتحقيق التوازن النفسي الذي تطمح إليه.",
      specialties: ["القلق والتوتر المزمن", "العلاقات الزوجية", "الاكتئاب", "اضطرابات ما بعد الصدمة", "تقدير الذات"],
    },
    {
      id: 'fahad',
      name: "د. فهد الراشد",
      specialty: "استشاري علاقات أسرية وزوجية",
      availability: "متاح اليوم، 05:30 م",
      sessions: "+850",
      rating: "4.8",
      experience: "10 سنوات",
      price: "200 ر.س / ساعة",
      image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300",
      categories: ["علاقات"],
      sessionTypes: ["فيديو", "محادثة"],
      bio: "متخصص في حل المشكلات الأسرية وإعادة التوجيه والتواصل الفعال بين الشريكين، أساعدكم على بناء بيئة أسرية متزنة وهادئة عبر أدوات علمية مجربة.",
      specialties: ["العلاقات الزوجية", "الإرشاد الأسرى", "التعامل مع المراهقين", "الذكاء العاطفي"],
    }
  ];

  // --- لوجيك الفلترة والبحث المشترك ---
  const filteredDoctors = initialDoctors.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          doc.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'الكل' || doc.categories.includes(selectedCategory);
    
    const matchesType = selectedSessionType === 'الكل' || doc.sessionTypes.includes(selectedSessionType);

    return matchesSearch && matchesCategory && matchesType;
  });

  const toggleSchedule = (docId) => {
    setOpenDoctorSchedule(openDoctorSchedule === docId ? null : docId);
  };

  // --- لوجيك فحص وقت الجلسة (يفتح قبل الميعاد بـ 15 دقيقة) ---
  useEffect(() => {
    const checkSessionTime = () => {
      // وقت الجلسة المستهدف: 14 أكتوبر 2026 الساعة 11:30 صباحاً
      const sessionDate = new Date(2026, 9, 14, 11, 30, 0); // شهر 9 يعني أكتوبر في JavaScript JS Months (0-11)
      const now = new Date();

      // حساب الفارق بالمللي ثانية
      const timeDifference = sessionDate.getTime() - now.getTime();
      
      // تحويل الفارق لدقائق (15 دقيقة تساوي 900,000 مللي ثانية)
      // تفعيل الزرار إذا كنا قبل الجلسة بـ 15 دقيقة أو أثناء وقت الجلسة نفسه
      if (timeDifference <= 15 * 60 * 1000 && timeDifference >= -60 * 60 * 1000) {
        setIsJoinEnabled(true);
      } else {
        setIsJoinEnabled(false);
      }
    };

    checkSessionTime();
    const interval = setInterval(checkSessionTime, 30000); // فحص كل 30 ثانية لتحديث الحالة تلقائياً
    return () => clearInterval(interval);
  }, []);

  const handleJoinSession = () => {
    if (isJoinEnabled) {
      alert("جاري الانتقال إلى غرفة الجلسة...");
      // هنا تقدري تعملي navigate لصفحة الفيديو المكالمة بتاعتك: navigate('/video-session');
    } else {
      alert("عذراً، يمكنك الانضمام للجلسة قبل موعدها بـ 15 دقيقة فقط.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FAFA] text-[#181C1D] font-sans antialiased pb-24 pt-4" dir="rtl">
      
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 text-center my-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[#316764] mb-2">
          ابحث عن مساحتك الآمنة مع أفضل المختصين.
        </h1>
        <p className="text-xs text-gray-500 max-w-md mx-auto">
          نخبة من الأطباء النفسيين والمستشارين المعتمدين لمساعدتك في رحلة توازنك النفسي.
        </p>
      </section>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* الـ Grid اليمين: الفلاتر والبحث ومعلومات الجلسة القادمة */}
        <div className="lg:col-span-1 space-y-6 order-1 lg:order-2">
          
          {/* كارت بحث متقدم مشغّل بالكامل */}
          <div className="bg-white p-5 rounded-2xl border border-[#EBEEEE] shadow-sm">
            <h3 className="text-sm font-bold text-[#316764] mb-4">بحث متقدم</h3>
            
            {/* حقل البحث بالاسم */}
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

            {/* تصنيفات سريعة */}
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

            {/* فلتر نوع الجلسة */}
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

          {/* كارت اقتباس ملهم */}
          <div className="bg-[#DFEDE9] p-4 rounded-2xl text-center text-[#316764]">
            <p className="text-xs font-medium leading-relaxed">
              "الصحة النفسية ليست وجهة، بل هي عملية مستمرة."
            </p>
          </div>

          {/* موعد الجلسة القادم + فحص الـ 15 دقيقة */}
          <div className="bg-white p-5 rounded-2xl border border-[#EBEEEE] shadow-sm text-center">
            <span className="text-xs text-gray-400 block mb-1">موعد الجلسة القادم:</span>
            <div className="text-xs font-bold text-[#316764] mb-4 flex justify-center items-center gap-1">
              <Calendar size={14} />
              <span>الجمعة، 14/10/2026 - 11:30 ص</span>
            </div>
            
            <button 
              onClick={handleJoinSession}
              className={`w-full text-white text-xs py-3 rounded-xl font-medium transition duration-300 ${
                isJoinEnabled 
                  ? 'bg-[#316764] hover:bg-[#254f4d] shadow-md cursor-pointer' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isJoinEnabled ? "انضم للجلسة الآن" : "انضم للجلسة (يفتح قبل الموعد بـ 15 د)"}
            </button>
          </div>

        </div>

        {/* الـ Grid الشمال: قوائم الأطباء الديناميكية بعد الفلترة */}
        <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
          
          {filteredDoctors.length === 0 ? (
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
                      <span className="flex items-center gap-1"><Clock size={12}/> {doc.availability}</span>
                      <span className="flex items-center gap-1"><MapPin size={12}/> {doc.price}</span>
                    </div>
                  </div>
                </div>

                {/* أزرار التحكم الثابتة لكل كارت */}
                <div className="flex justify-end gap-2 border-t border-[#EBEEEE] pt-3">
                  <button 
                    onClick={() => navigate('/doctor-profile', { state: { doctor: doc } })}
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

                {/* قسم المواعيد التابع لكل طبيب بشكل منفصل ومخفي تلقائياً */}
                {openDoctorSchedule === doc.id && (
                  <div className="border-t border-[#EBEEEE] pt-4 mt-2 bg-[#F7FAFA] p-4 rounded-xl transition-all">
                    <h4 className="text-xs font-bold text-[#316764] mb-3">اختر الوقت المناسب مع {doc.name}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* الأيام */}
                      <div>
                        <span className="text-[10px] text-gray-400 block mb-2">التاريخ</span>
                        <div className="flex gap-2">
                          {[
                            { day: 'اليوم', date: 14 },
                            { day: 'الاثنين', date: 15 },
                            { day: 'الثلاثاء', date: 16 },
                            { day: 'الأربعاء', date: 17 }
                          ].map((item) => (
                            <button
                              key={item.date}
                              onClick={() => setSelectedDate(item.date)}
                              className={`flex-1 py-2 rounded-xl flex flex-col items-center justify-center transition border ${
                                selectedDate === item.date 
                                  ? 'bg-[#316764] text-white border-[#316764]' 
                                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                              }`}
                            >
                              <span className="text-[9px] opacity-80">{item.day}</span>
                              <span className="text-xs font-bold mt-0.5">{item.date}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* الساعات */}
                      <div>
                        <span className="text-[10px] text-gray-400 block mb-2">الوقت المتاح</span>
                        <div className="grid grid-cols-2 gap-2">
                          {['09:00', '11:30', '01:00', '04:30'].map((time) => (
                            <button
                              key={time}
                              onClick={() => setSelectedTime(time)}
                              className={`py-2 rounded-xl text-xs font-medium border transition text-center ${
                                selectedTime === time
                                  ? 'bg-[#316764] text-white border-[#316764]'
                                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                              }`}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end mt-4">
                      <button className="bg-[#316764] text-white text-xs px-6 py-2 rounded-xl font-medium hover:bg-[#254f4d] transition">
                        تأكيد الموعد
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