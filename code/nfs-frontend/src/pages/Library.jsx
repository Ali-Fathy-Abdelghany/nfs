import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "../components/layout/Header";
import Sidebar from '../components/Sidebar/Sidebar'; 
import Footer from '../components/layout/Footer';
import GratitudeJournal from '../components/ui/GratitudeJournal'; // استيراد بوب اب الامتنان
import myImage from "../assets/sara.png";
const filters = ["الكل", "تأملات موجهة", "دروس مرئية", "مقالات علمية"];

const LINKS = {
  mainVideo: "https://www.youtube.com/watch?v=uxayUBd6T7M",
  meditation: "https://www.youtube.com/watch?v=1ZYbU82GVz4",
  journaling: "https://www.verywellmind.com/the-benefits-of-journaling-for-stress-management-3144611",
  yoga: "https://www.verywellmind.com/the-benefits-of-yoga-for-mental-health-5323375",
  impostor: "https://www.verywellmind.com/imposter-syndrome-and-social-anxiety-disorder-4156469",
  boundaries: "https://www.verywellmind.com/how-to-set-boundaries-5208591",
  resilience: "https://www.verywellmind.com/what-is-resilience-2795059",
};

// مصفوفة مساعدة لربط الوسوم السفلية بالمقالات عند الضغط عليها لعمل فلترة حية
const ARTICLE_TAGS = {
  impostor: "الاحتراق_الوظيفي",
  boundaries: "تنظيم_القلق",
  resilience: "المرونة_النفسية"
};

function Library() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("الكل");
  const [selectedHashtag, setSelectedHashtag] = useState(null); // الهاشتاج النشط
  const [showJournalPopup, setShowJournalOpen] = useState(false); // التحكم في بوب اب الامتنان

  const userRole = localStorage.getItem('userRole') || 'patient'; 
  
  // دالة التحكم في عرض العناصر بناءً على الفلتر أو الهاشتاج المفعل
  const show = (cat, articleId = null) => {
    if (selectedHashtag && articleId) {
      return activeFilter === "مقالات علمية" && ARTICLE_TAGS[articleId] === selectedHashtag;
    }
    return activeFilter === "الكل" || activeFilter === cat;
  };

  const handleHashtagClick = (tagSlug) => {
    if (selectedHashtag === tagSlug) {
      setSelectedHashtag(null);
    } else {
      setActiveFilter("مقالات علمية"); // التوجيه لقسم المقالات تلقائياً عند الضغط
      setSelectedHashtag(tagSlug);
    }
  };

  const handleSaveEntry = (newEntry) => {
    const saved = localStorage.getItem("my_entries");
    const currentEntries = saved ? JSON.parse(saved) : [];
    const updated = [...currentEntries, { ...newEntry, id: Date.now(), date: new Date().toISOString() }];
    localStorage.setItem("my_entries", JSON.stringify(updated));
    setShowJournalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F7FAFA] text-[#181C1D] flex flex-col justify-between relative" style={{ fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>
      <Header />

      <main className="w-full flex-1 flex flex-col lg:flex-row gap-6 max-w-[1240px] mx-auto px-4 py-8">
        {userRole === 'doctor' && (
          <div className="w-full lg:w-64 shrink-0 transition-all duration-300">
            <Sidebar activeTab="library" />
          </div>
        )}
        
        <div className="flex-1 w-full space-y-12 pb-16">
          
          {/* قسم الـ Hero الجذاب */}
          <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-6 bg-transparent pt-2">
            <div className="w-full md:w-1/2 space-y-3 text-right">
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#316764]">مكتبة المصادر</h1>
              <p className="text-xs md:text-sm text-slate-500 leading-relaxed max-w-lg">
                مساحتك الهادئة للاستكشاف. تصفح مجموعة مختارة من التأملات الموجهة، والدروس المرئية، والمقالات العلمية لتعزيز صحتك النفسية.
              </p>
            </div>

            <div className="w-full md:w-1/2 flex justify-center md:justify-end relative px-4">
              <div className="relative max-w-[260px] md:max-w-[290px] transform rotate-3 hover:rotate-0 hover:scale-102 transition-all duration-500 ease-out">
                <img
                  src="https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=600"
                  alt="جلسة هدوء العقل"
                  className="rounded-[2.5rem] object-cover aspect-square shadow-md w-full border-4 border-white"
                />
                <div className="absolute bottom-4 -left-6 bg-[#A3D3D0]/95 backdrop-blur-md p-3 rounded-2xl shadow-lg text-right max-w-[160px] border border-white/60 transform -rotate-6 hover:rotate-0 transition-all duration-500 ease-out">
                  <span className="block text-[10px] font-bold text-[#181C1D]/60 mb-0.5">جلسة اليوم المختارة:</span>
                  <h4 className="text-xs font-black text-[#316764]">"هدوء العقل"</h4>
                </div>
              </div>
            </div>
          </div>

          {/* الفلتر المطور بالكامل */}
          <div className="flex justify-center w-full sticky top-4 z-30 transition-all duration-300">
            <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md p-2 rounded-2xl border border-slate-200/80 shadow-md">
              {filters.map((filter, index) => {
                const isActive = activeFilter === filter && !selectedHashtag;
                return (
                  <button
                    key={index}
                    className={`flex items-center gap-2 text-xs px-5 py-2.5 rounded-xl font-bold transition-all duration-300 ease-out transform active:scale-95 ${
                      isActive 
                        ? 'bg-[#316764] text-white shadow-xs' 
                        : 'text-slate-500 hover:bg-slate-100/70 hover:text-slate-900'
                    }`}
                    onClick={() => {
                      setActiveFilter(filter);
                      setSelectedHashtag(null); // ريست للهاشتاجات عند التغيير اليدوي للفلتر العلوي
                    }}
                  >
                    {filter === "الكل" && <i className="fa-solid fa-border-all text-[11px]"></i>}
                    {filter === "تأملات موجهة" && <i className="fa-solid fa-spa text-[11px]"></i>}
                    {filter === "دروس مرئية" && <i className="fa-solid fa-circle-play text-[11px]"></i>}
                    {filter === "مقالات علمية" && <i className="fa-solid fa-book-open text-[11px]"></i>}
                    <span>{filter}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* البينتو جريد للمحتوى */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {show("دروس مرئية") && !selectedHashtag && (
              <div className="lg:col-span-7 bg-white rounded-3xl border border-[#EBEEEE] shadow-2xs p-4 flex flex-col justify-between h-full min-h-[460px] transition-all duration-300 hover:shadow-xs">
                <a
                  className="relative w-full aspect-video rounded-2xl overflow-hidden group block shadow-xs"
                  href={LINKS.mainVideo}
                  target="_blank"
                  rel="noreferrer"
                >
                  <img
                    src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800"
                    alt="أساسيات التنفس العميق للتوتر"
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-103"
                  />
                  <div className="absolute inset-0 bg-black/15 flex items-center justify-center transition-all duration-300 group-hover:bg-black/25">
                    <div className="w-13 h-13 rounded-full bg-white text-[#316764] flex items-center justify-center shadow-lg text-lg transition-all duration-300 transform group-hover:scale-110 group-hover:bg-teal-50">
                      <i className="fa-solid fa-play translate-x-[-1px]"></i>
                    </div>
                  </div>
                </a>

                <div className="mt-4 space-y-2 text-right">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg font-bold border border-emerald-100">فيديو تعليمي</span>
                    <span className="text-slate-400 font-medium">
                      <i className="fa-regular fa-clock ml-1"></i> ١٥ دقيقة
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-800 pt-1">أساسيات التنفس العميق للتوتر</h2>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    تعرف على التقنيات العلمية للتحكم في استجابة جسدك للضغوطات اليومية من خلال تمارين التنفس البسيطة والمثبتة علمياً.
                  </p>
                </div>
              </div>
            )}

            <div className={`space-y-6 ${show("دروس مرئية") && !selectedHashtag ? 'lg:col-span-5' : 'lg:col-span-12'}`}>
              
              {show("تأملات موجهة") && !selectedHashtag && (
                <div className="bg-white rounded-3xl border border-[#EBEEEE] shadow-2xs p-5 flex items-center justify-between gap-4 transition-all duration-300 hover:shadow-xs group">
                  <div className="flex-1 text-right space-y-2">
                    <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">تأمل مقترح</span>
                    <h3 className="font-bold text-sm text-slate-800 transition-colors duration-300 group-hover:text-[#316764]">اليوم العميق الهادئ</h3>
                    <p className="text-[11px] text-slate-400 leading-normal line-clamp-2">
                      جلسة تأمل صوتية مخصصة وعميقة لمساعدتك على تصفية الذهن تماماً والاسترخاء المريح قبل النوم.
                    </p>
                    <a href={LINKS.meditation} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs text-teal-600 font-bold pt-1 transition-all duration-300 group-hover:text-teal-700 group-hover:gap-2">
                      <span>استمع الآن</span>
                      <i className="fa-solid fa-arrow-left text-[10px]"></i>
                    </a>
                  </div>

                  <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-2xl overflow-hidden border border-slate-100 shadow-2xs transition-transform duration-500 group-hover:scale-103">
                    <img src={myImage} alt="النوم العميق الهادئ" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}

              {show("مقالات علمية") && !selectedHashtag && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  <a className="bg-white rounded-2xl border border-[#EBEEEE] shadow-2xs overflow-hidden flex flex-col hover:shadow-md transition-all duration-300 group" href={LINKS.journaling} target="_blank" rel="noreferrer">
                    <div className="w-full aspect-[4/3] overflow-hidden bg-slate-100">
                      <img src="https://images.unsplash.com/photo-1516414447565-b14be0adf13e?w=400" alt="قوة تدوين المشاعر" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-104" />
                    </div>
                    <div className="p-3.5 text-right flex-1 flex flex-col justify-between space-y-2">
                      <div>
                        <h4 className="font-bold text-xs text-slate-800 transition-colors duration-300 group-hover:text-[#316764]">قوة تدوين المشاعر</h4>
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-normal">لماذا ينصح الأطباء النفسيون بالكتابة اليومية لتخفيف القلق؟</p>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-slate-50">
                        <span><i className="fa-regular fa-clock ml-1"></i> ٤ دقائق قراءة</span>
                        <span className="hover:text-teal-600 transition-colors duration-200" title="حفظ المقال" onClick={(e) => e.preventDefault()}><i className="fa-regular fa-bookmark"></i></span>
                      </div>
                    </div>
                  </a>

                  <a className="bg-white rounded-2xl border border-[#EBEEEE] shadow-2xs overflow-hidden flex flex-col hover:shadow-md transition-all duration-300 group" href={LINKS.yoga} target="_blank" rel="noreferrer">
                    <div className="w-full aspect-[4/3] overflow-hidden bg-slate-100">
                      <img src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400" alt="اليوجا كعلاج مكمل" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-104" />
                    </div>
                    <div className="p-3.5 text-right flex-1 flex flex-col justify-between space-y-2">
                      <div>
                        <h4 className="font-bold text-xs text-slate-800 transition-colors duration-300 group-hover:text-[#316764]">اليوجا كعلاج مكمل</h4>
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-normal">كيف تساعد الحركة الواعية في إعادة توازن الجهاز العصبي.</p>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-slate-50">
                        <span><i className="fa-regular fa-clock ml-1"></i> ٦ دقائق قراءة</span>
                        <span className="hover:text-teal-600 transition-colors duration-200" title="حفظ المقال" onClick={(e) => e.preventDefault()}><i className="fa-regular fa-bookmark"></i></span>
                      </div>
                    </div>
                  </a>

                </div>
              )}
            </div>
          </div>

          {/* قسم مقالات تهمك */}
          {show("مقالات علمية") && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-[#EBEEEE] pb-3">
                <div className="text-right">
                  <h2 className="text-base font-bold text-slate-800">
                    {selectedHashtag ? `مقالات مصنفة بـ #${selectedHashtag}` : 'مقالات تهمك'}
                  </h2>
                  <p className="text-[11px] text-slate-400">تعمق في مواضيع الصحة النفسية مع خبرائنا</p>
                </div>
                {selectedHashtag && (
                  <button onClick={() => setSelectedHashtag(null)} className="text-xs text-rose-600 font-semibold hover:underline">إلغاء تصفية الهاشتاج ✕</button>
                )}
                <button 
                  className="inline-flex items-center gap-1 text-xs text-teal-600 font-bold hover:text-teal-700 hover:gap-2 transition-all duration-300 bg-white border border-[#EBEEEE] px-3 py-1.5 rounded-xl shadow-2xs" 
                  onClick={() => navigate('/all-articles')}
                >
                  <span>مشاهدة الكل</span>
                  <i className="fa-solid fa-chevron-left text-[9px] mr-1"></i>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {show("مقالات علمية", "impostor") && (
                  <a className="bg-white rounded-3xl border border-[#EBEEEE] shadow-2xs overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col group" href={LINKS.impostor} target="_blank" rel="noreferrer">
                    <div className="w-full aspect-video bg-slate-100 overflow-hidden relative">
                      <img src="https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=500" alt="متلازمة المحتال" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103" />
                      <span className="absolute bottom-3 right-3 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100/60 shadow-2xs">الوعي الذاتي</span>
                    </div>
                    <div className="p-4 text-right space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-sm text-slate-800 transition-colors duration-300 group-hover:text-[#316764] leading-snug">كيف تتعامل مع "متلازمة المحتال" في العمل؟</h3>
                        <p className="text-xs text-slate-400 leading-relaxed mt-1 line-clamp-2">نصائح عملية لاستعادة الثقة بالنفس والاعتراف بإنجازاتك الحقيقية والمهنية.</p>
                      </div>
                    </div>
                  </a>
                )}

                {show("مقالات علمية", "boundaries") && (
                  <a className="bg-white rounded-3xl border border-[#EBEEEE] shadow-2xs overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col group" href={LINKS.boundaries} target="_blank" rel="noreferrer">
                    <div className="w-full aspect-video bg-slate-100 overflow-hidden relative">
                      <img src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500" alt="التوازن النفسي" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103" />
                      <span className="absolute bottom-3 right-3 text-[10px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100/60 shadow-2xs">التوازن النفسي</span>
                    </div>
                    <div className="p-4 text-right space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-sm text-slate-800 transition-colors duration-300 group-hover:text-[#316764] leading-snug">ترتيب الأولويات وقول "لا" دون شعور بالذنب</h3>
                        <p className="text-xs text-slate-400 leading-relaxed mt-1 line-clamp-2">خطوات بسيطة ومدروسة لحماية مساحتك النفسية وطاقتك اليومية من الاستنزاف.</p>
                      </div>
                    </div>
                  </a>
                )}

                {show("مقالات علمية", "resilience") && (
                  <a className="bg-white rounded-3xl border border-[#EBEEEE] shadow-2xs overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col group" href={LINKS.resilience} target="_blank" rel="noreferrer">
                    <div className="w-full aspect-video bg-slate-100 overflow-hidden relative">
                      <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500" alt="المرونة النفسية" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103" />
                      <span className="absolute bottom-3 right-3 text-[10px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100/60 shadow-2xs">المرونة النفسية</span>
                    </div>
                    <div className="p-4 text-right space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-sm text-slate-800 transition-colors duration-300 group-hover:text-[#316764] leading-snug">بناء المرونة النفسية في مواجهة التغيرات</h3>
                        <p className="text-xs text-slate-400 leading-relaxed mt-1 line-clamp-2">كيف تدرب عقلك بذكاء على التكيف مع ظروف الحياة المتغيرة بمرونة كاملة وهدوء.</p>
                      </div>
                    </div>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* قسم الهاشتاجات وكارت المذكرة المطور السفلي */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
            
            {/* صندوق الهاشتاجات التفاعلي الفعلي لفلترة الكروت الحالية */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-[#EBEEEE] shadow-2xs p-6 text-right space-y-4 hover:shadow-xs transition">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <i className="fa-solid fa-arrow-trend-up text-[#316764]"></i> الوسوم والمواضيع الأكثر انتشاراً هذا الأسبوع
              </h3>
              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  { label: "#تنظيم_القلق", slug: "تنظيم_القلق" },
                  { label: "#تمارين_التنفس", slug: "تمارين_التنفس" },
                  { label: "#الاحتراق_الوظيفي", slug: "الاحتراق_الوظيفي" },
                  { label: "#المرونة_النفسية", slug: "المرونة_النفسية" }
                ].map((tag, i) => {
                  const isCurrent = selectedHashtag === tag.slug;
                  return (
                    <span 
                      key={i} 
                      onClick={() => handleHashtagClick(tag.slug)}
                      className={`text-xs px-3 py-2 rounded-xl font-semibold cursor-pointer transition-all duration-300 ${
                        isCurrent 
                          ? 'bg-[#316764] text-white shadow-xs scale-102' 
                          : 'bg-[#F1F4F4] text-slate-600 hover:bg-[#316764] hover:text-white'
                      }`}
                    >
                      {tag.label}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* بطاقة التنبيه المحدثة لتشغيل الـ Popup فوراً داخل الصفحة */}
            <div className="bg-[#316764] text-white rounded-3xl p-6 text-right flex flex-col justify-between shadow-2xs hover:scale-[1.01] transition-transform duration-300">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-sm">
                  <i className="fa-solid fa-bell-ring"></i>
                </div>
                <h4 className="font-bold text-sm">المفكرة الواعية اليومية</h4>
                <p className="text-[11px] text-white/80 leading-relaxed">
                  تدوينك لمشاعرك لمدة ٥ دقائق يومياً يقلل من فرصة حدوث القلق الصباحي المفاجئ بنسبة ٤٠٪.
                </p>
              </div>
              <button 
                onClick={() => setShowJournalOpen(true)} // تفعيل البوب اب مباشرة
                className="w-full bg-white text-[#316764] text-xs font-bold py-2 rounded-xl mt-4 shadow-sm hover:bg-slate-50 transition active:scale-95"
              >
                ابدأ التدوين الآن
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* بوب اب مفكرة الامتنان المدعوم تفاعلياً داخل الصفحة الحالية */}
      {showJournalPopup && (
        <GratitudeJournal 
          onClose={() => setShowJournalOpen(false)} 
          onSave={handleSaveEntry} 
        />
      )}

      <Footer />
    </div>
  );
}

export default Library;