import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; 
import { Star, ShieldCheck, Video, Calendar, Clock, ArrowRight, Bell, Settings, Award, Users, BookOpen } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const DoctorCheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = React.useState('home');

  const doctorData = location.state?.doctor || {
    name: "د. فيصل العمر",
    specialty: "استشاري الطب النفسي والعلاج السلوكي المعرفي",
    rating: 4.9,
    reviews: 120,
    date: "غداً، الأربعاء", 
    time: "4:00 م",
    duration: "٥٠ دقيقة",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=256&q=80"
  };

  const slot = location.state?.slot;
  const appointmentDate = slot?.startTime
    ? new Date(slot.startTime).toLocaleString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
    : doctorData.date;

  const handleBooking = () => {
    navigate('/payments', { state: { doctorData, slot } });
  };

  return (
    <div className="min-h-screen bg-[#F7FAFA] text-[#181C1D] font-sans antialiased flex flex-col justify-between" dir="rtl">
      
      <div>
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {/* Container المحتوى الرئيسي */}
        <main className="w-full max-w-[1000px] p-6 space-y-6 mx-auto">
          
          <section className="relative overflow-hidden bg-white rounded-3xl p-6 border border-gray-100/80 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="absolute inset-0 bg-gradient-to-br from-[#E6F0F0] via-white to-white opacity-90 z-0" />
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#48747B]/10 rounded-full blur-3xl z-0" />
            
            <div className="relative z-10 space-y-2.5 text-center sm:text-right">
              <h1 className="text-2xl font-black text-[#181C1D] tracking-tight">{doctorData.name}</h1>
              <p className="text-[#48747B] text-xs font-medium">{doctorData.specialty || doctorData.title}</p>
              
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1">
                <div className="flex items-center gap-1 text-[11px] text-[#48747B] bg-[#E6F0F0]/50 px-2.5 py-1 rounded-full">
                  <Award className="w-3.5 h-3.5" />
                  <span>+١٤ سنة خبرة</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-amber-500 bg-amber-50 px-2.5 py-1 rounded-full">
                  <Star className="w-3 h-3 fill-current" />
                  <span className="font-bold">{doctorData.rating}</span>
                  <span className="text-gray-400 text-[10px]">({doctorData.reviews})</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full">
                  <Users className="w-3.5 h-3.5" />
                  <span>١.٢+ مستفيد</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-t from-[#093E39]/20 to-transparent rounded-2xl z-10" />
              <img 
                src={doctorData.image || doctorData.avatar}
                alt={doctorData.name} 
                className="w-28 h-28 rounded-2xl object-cover border-[3px] border-white shadow-md shadow-gray-200"
              />
              <span className="absolute bottom-2 left-2 z-20 bg-[#093E39] text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></span>
                متاح الآن
              </span>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch relative">
            
            {/* قسم عن المعالج */}
            <section className="bg-white rounded-3xl p-6 border border-gray-100/80 shadow-sm space-y-4 flex flex-col justify-between h-full">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[#0E4A48] font-bold text-sm">
                  <ShieldCheck className="w-4 h-4" />
                  <h2>عن المعالج</h2>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed text-justify">
                  د. فيصل العمر هو متخصص رائد في الصحة النفسية مع تركيز عميق على رحلات التحول الشخصي. يؤمن بأن الجلسة العلاجية هي "ملاذ آمن" حيث يمكن للمراجع استكشاف ذواتهم دون إطلاق أحكام. من خلال خبرته التي تمتد لأكثر من عقد، ساعد مئات الأفراد في تجاوز تحديات القلق، الاكتئاب، وإدارة ضغوط الحياة الحديثة.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-3 pt-3">
                <div className="bg-[#F7FAFA] p-2.5 rounded-xl text-center">
                  <span className="text-[10px] text-gray-400 block mb-0.5">اللغات</span>
                  <span className="text-[11px] font-bold text-[#181C1D]">العربية، الإنجليزية</span>
                </div>
                <div className="bg-[#F7FAFA] p-2.5 rounded-xl text-center">
                  <span className="text-[10px] text-gray-400 block mb-0.5">التعليم</span>
                  <span className="text-[11px] font-bold text-[#181C1D]">دكتوراه في علم النفس</span>
                </div>
              </div>
            </section>

            <section className="bg-[#48747B]/15 rounded-3xl p-6 flex flex-col justify-between h-full relative overflow-visible">
              
              <div className="space-y-4 mr-auto w-[55%] md:w-[50%]">
                <div className="flex items-center gap-2 text-[#093E39] font-bold text-sm">
                  <BookOpen className="w-4 h-4" />
                  <h2>التخصصات</h2>
                </div>
                
                <div className="space-y-2">
                  {['التعامل مع الصدمة','علاج القلق والتوتر', 'العلاج السلوكي المعرفي', 'العلاج الأسري والعلاقات'].map((spec, index) => (
                    <div key={index} className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-xl text-[11px] text-[#093E39] font-medium flex items-center justify-between shadow-sm whitespace-nowrap">
                      <span>{spec}</span>
                      <span className="w-1.5 h-1.5 bg-[#48747B] rounded-full mr-2"></span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-30 w-[190px] sm:w-[210px] 
                transition-all duration-500 ease-out 
                hover:-translate-y-[60%] hover:scale-105 
                shadow-[0_15px_40px_rgba(0,0,0,0.06)] 
                hover:shadow-[0_35px_60px_rgba(49,103,100,0.28)] 
                group border border-transparent hover:border-[#316764]/20 rounded-2xl">
                
                <div className="bg-white rounded-2xl p-4 space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-[#316764] to-[#83B9B5] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-gray-400 font-medium block">سعر الجلسة ({doctorData.duration})</span>
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-xl font-black text-[#181C1D]">250</span>
                      <span className="text-[10px] font-bold text-[#48747B]">ج.م</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-[10px] text-gray-500 pt-1 border-t border-gray-50">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#48747B]" />
                      <span>متاح {appointmentDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-[#48747B]" />
                      <span>جلسة فيديو أونلاين</span>
                    </div>
                  </div>

                  <button 
                    onClick={handleBooking}
                    className="w-full bg-gradient-to-r from-[#316764] to-[#83B9B5] hover:opacity-95 text-white font-medium py-2 px-3 rounded-xl transition-all duration-200 text-[11px] text-center block shadow-sm shadow-[#316764]/10 cursor-pointer"
                  >
                    احجز جلسة الآن
                  </button>
                </div>
              </div>

            </section>
          </div>

          <section className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <h2 className="font-bold text-sm text-[#181C1D]">مراجعات المرضى</h2>
              <button className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors">عرض الكل</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-2.5 h-2.5 fill-current" />)}
                  </div>
                  <span className="text-[11px] font-bold text-gray-700">محمد ع.</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed text-right">
                  "تجربة غيرت مجرى حياتي. د. فيصل مستمع بارع ويعطي أدوات عملية جداً للتعامل مع القلق اليومي."
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-2.5 h-2.5 fill-current" />)}
                  </div>
                  <span className="text-[11px] font-bold text-gray-700">سارة أ.</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed text-right">
                  "تجربة غيرت مجرى حياتي. د. فيصل مستمع بارع ويعطي أدوات عملية جداً للتكامل مع القلق اليومي."
                </p>
              </div>
            </div>
          </section>

        </main>
      </div>

      <Footer activeTab={activeTab} setActiveTab={setActiveTab} />

    </div>
  );
};

export default DoctorCheckoutPage;