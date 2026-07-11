import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom'; // استيراد useLocation لاستقبال البيانات
import { 
  ArrowLeft, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  Star, 
  Sparkles,
  PartyPopper,
  ArrowUpRight
} from 'lucide-react';

export default function Payments() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const incomingDoctorData = location.state?.doctorData;

  const [selectedPlan, setSelectedPlan] = useState('single');
  
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cvv, setCvv] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const doctorInfo = incomingDoctorData || {
    name: "د. ريم العتيبي",
    title: "أخصائي نفسية إكلينيكية",
    rating: 4.9,
    reviews: 120,
    date: "الثلاثاء، 24 أكتوبر",
    time: "08:00 م",
    duration: "50 دقيقة",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&q=80"
  };

  const planDetails = {
    single: { price: 250, label: "جلسة استشارية", desc: "جلسة فردية لمدة 50 دقيقة مع اخصائي معتمد." },
    monthly: { price: 800, label: "4 جلسات شهرياً", desc: "متابعة مستمرة مع أولوية الحجز وجلسات طوارئ." }
  };

  const currentPrice = planDetails[selectedPlan].price;
  const total = currentPrice; 

  const handleNameChange = (e) => {
    const value = e.target.value;
    const onlyLetters = value.replace(/[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/g, '');
    setCardName(onlyLetters);
  };

  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); 
    const formattedValue = value.match(/.{1,4}/g)?.join(' ') || ''; 
    setCardNumber(formattedValue);
  };

  // منع الحروف في الـ CVV وتحديد الطول بـ 3 أرقام فقط
  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); 
    if (value.length <= 3) {
      setCvv(value);
    }
  };

  const handleSubmitPayment = (e) => {
    e.preventDefault();
    
    // التحقق النهائي من البيانات قبل الدفع
    if (cardNumber.replace(/\s/g, '').length < 16) {
      alert("رجاءً أدخلي رقم بطاقة صحيح مكون من 16 رقماً");
      return;
    }
    if (cvv.length < 3) {
      alert("رجاءً أدخلي رمز CVV صحيح مكون من 3 أرقام");
      return;
    }

    setPaymentSuccess(true);
  };

  // التوجيه لصفحة جلساتي عند تأكيد النجاح
  const handleGoToMySessions = () => {
    navigate('/dashboard', {
      state: {
        targetTab: 'sessions',
        bookedDoctor: doctorInfo,
        plan: planDetails[selectedPlan]
      }
    });
  };

  return (
    <div className="bg-[#F7FAFA] min-h-screen text-right font-sans antialiased pb-20 relative">
      
      {/* الهيدر العلوي */}
      <header className="bg-transparent py-10 px-6 md:px-16 flex justify-between items-center flex-row-reverse">
        <div className="flex flex-row-reverse items-center gap-2.5">
          <img 
            src="/nafs_icon.png" 
            alt="Nafs Logo" 
            className="w-15 h-15 object-contain"
          />
          <span className="text-5xl font-black text-[#316764] tracking-tight">نفس</span>
        </div>
        
        <button 
          onClick={() => navigate(-1)} 
          className="p-2.5 text-[#404847] hover:text-[#316764] hover:bg-[#316764]/5 transition-all rounded-full border border-neutral-200/60 bg-white shadow-sm"
          title="العودة للخلف"
        >
          <ArrowLeft className="w-8 h-8" />
        </button>
      </header>

      <div className="max-w-6xl mx-auto px-4 md:px-12 mt-4">
        
        {/* قسم العناوين */}
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex flex-row-reverse items-center justify-center gap-2.5 bg-[#316764]/5 px-5 py-2 rounded-full border border-[#316764]/10">
            <Sparkles className="w-15h-15 text-[#0D9488]" />
            <h1 className="text-8xl md:text-3xl font-black text-[#181C1D] tracking-tight">تأكيد اشتراكك</h1>
          </div>
          <p className="text-xs md:text-sm text-[#707978] max-w-lg mx-auto leading-relaxed font-medium">
            أدارك وقتك، تخير التوقيت المناسب، اختر الخطة المناسبة لك وأكمل عملية الدفع بأمان وسرية تامة.
          </p>
        </div>

        {/* توزيع الأعمدة */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* العمود الأيسر: ملخص الحجز */}
          <div className="lg:col-span-5 order-2 lg:order-1 space-y-6">
            <div className="bg-[#F1F4F4] rounded-[32px] p-6 space-y-6 border border-[#BFC8C7]/20 shadow-sm">
              <h3 className="text-xs font-bold text-[#404847] text-center tracking-wide">ملخص الحجز</h3>
              
              {/* كارت الطبيب الديناميكي */}
              <div className="bg-white rounded-[24px] p-4 border border-[#BFC8C7]/10 shadow-sm flex flex-row-reverse items-center gap-4">
                <img src={doctorInfo.avatar} alt={doctorInfo.name} className="w-14 h-14 rounded-full object-cover border border-[#BFC8C7]/40" />
                <div className="space-y-0.5 flex-1">
                  <h4 className="text-base font-bold text-[#181C1D]">{doctorInfo.name}</h4>
                  <p className="text-xs text-[#707978] font-medium">{doctorInfo.title}</p>
                  <div className="flex flex-row-reverse items-center justify-end gap-1 text-[11px] font-bold text-amber-500 pt-0.5">
                    <Star className="w-3 h-3 fill-amber-500" />
                    <span className="text-[#181C1D]">{doctorInfo.rating}</span>
                    <span className="text-[#707978]">({doctorInfo.reviews})</span>
                  </div>
                </div>
              </div>

              {/* تفاصيل الميعاد */}
              <div className="space-y-3 text-xs text-[#404847] px-2 font-medium">
                <div className="flex flex-row-reverse justify-between items-center">
                  <span className="text-[#707978]">التاريخ والوقت</span>
                  <div className="flex flex-row-reverse items-center gap-1 font-bold text-[#181C1D]">
                    <Calendar className="w-3.5 h-3.5 text-[#316764]" />
                    <span>{doctorInfo.date}</span>
                    <span className="mx-1 text-[#BFC8C7]">•</span>
                    <Clock className="w-3.5 h-3.5 text-[#316764]" />
                    <span>{doctorInfo.time}</span>
                  </div>
                </div>
                <div className="flex flex-row-reverse justify-between items-center">
                  <span className="text-[#707978]">مدة الجلسة</span>
                  <span className="font-bold text-[#181C1D]">{doctorInfo.duration}</span>
                </div>
              </div>

              {/* الفاتورة */}
              <div className="border-t border-[#BFC8C7]/30 pt-4 space-y-3 text-xs font-semibold px-2">
                <div className="flex flex-row-reverse justify-between items-center text-[#404847]">
                  <span className="text-[#707978]">سعر الجلسة</span>
                  <span>{currentPrice} ج.م</span>
                </div>
                <div className="flex flex-row-reverse justify-between items-center text-[#404847]">
                  <span className="text-[#707978]">رسوم الخدمة</span>
                  <span>0.00 ج.م</span>
                </div>
                
                <div className="flex flex-row-reverse justify-between items-center text-xl font-bold text-[#181C1D] pt-4 border-t border-dashed border-[#BFC8C7]/60">
                  <span>المجموع</span>
                  <span className="text-[#316764] font-mono">{total} ج.م</span>
                </div>
              </div>

              {/* جملة التحفيز */}
              <div className="bg-white/90 border border-[#BFC8C7]/20 text-[#316764] p-4 rounded-[20px] text-[11px] font-bold text-center leading-relaxed shadow-sm">
                "أفضل استثمار هو الاستثمار في صحتك النفسية، نحن هنا لنرافقك في كل خطوة."
              </div>
            </div>

            {/* رسالة الأمان */}
            <div className="flex flex-row-reverse items-start gap-2 px-4 text-[11px] text-[#707978] leading-relaxed">
              <ShieldCheck className="w-4 h-4 text-[#316764] shrink-0 mt-0.5" />
              <p>اتصال آمن وسرية تامة لبياناتك وصحتك النفسية بالكامل. يمكنك إلغاء الحجز أو تعديل الموعد قبل 24 ساعة من موعد الجلسة المحددة.</p>
            </div>
          </div>

          {/* العمود الأيمن: التغيير الذكي المتناسق مع محتوى الصفحة */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <AnimatePresence mode="wait">
              {!paymentSuccess ? (
                // 1. واجهة إدخال بيانات الدفع الحالية
                <motion.div
                  key="payment-form"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  {/* اختيار نوع الاشتراك */}
                  <div className="bg-white rounded-[32px] border border-[#F1F4F4] p-6 shadow-sm space-y-4">
                    <h3 className="text-xs font-bold text-[#707978]">اختر نوع الاشتراك</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* كارت: جلسة واحدة */}
                      <div 
                        onClick={() => setSelectedPlan('single')}
                        className={`p-5 rounded-[24px] border-2 text-right space-y-2 cursor-pointer transition-all duration-300 ${
                          selectedPlan === 'single' 
                          ? 'border-[#316764] bg-[#83B9B5]/10 shadow-sm' 
                          : 'border-neutral-100 hover:border-neutral-200 bg-white'
                        }`}
                      >
                        <div className="flex flex-row-reverse justify-between items-center">
                          <span className="text-[10px] bg-neutral-100 text-[#404847] font-bold px-2 py-0.5 rounded-md">جلسة واحدة</span>
                          {selectedPlan === 'single' && <CheckCircle2 className="w-4 h-4 text-[#316764]" />}
                        </div>
                        <h4 className="font-bold text-base text-[#181C1D]">{planDetails.single.label}</h4>
                        <p className="text-[11px] text-[#707978] font-medium leading-relaxed">{planDetails.single.desc}</p>
                        <div className="pt-2 text-base font-bold text-[#316764] font-mono">250 ج.م</div>
                      </div>

                      {/* كارت: باقة شهرية */}
                      <div 
                        onClick={() => setSelectedPlan('monthly')}
                        className={`p-5 rounded-[24px] border-2 text-right space-y-2 cursor-pointer transition-all duration-300 ${
                          selectedPlan === 'monthly' 
                          ? 'border-[#316764] bg-[#83B9B5]/10 shadow-sm' 
                          : 'border-neutral-100 hover:border-neutral-200 bg-white'
                        }`}
                      >
                        <div className="flex flex-row-reverse justify-between items-center">
                          <span className="text-[10px] bg-[#83B9B5]/20 text-[#316764] font-bold px-2 py-0.5 rounded-md">الباقة الشهرية</span>
                          {selectedPlan === 'monthly' && <CheckCircle2 className="w-4 h-4 text-[#316764]" />}
                        </div>
                        <h4 className="font-bold text-base text-[#181C1D]">{planDetails.monthly.label}</h4>
                        <p className="text-[11px] text-[#707978] font-medium leading-relaxed">{planDetails.monthly.desc}</p>
                        <div className="pt-2 text-base font-bold text-[#316764] font-mono">800 ج.م</div>
                      </div>
                    </div>
                  </div>

                  {/* استمارة تفاصيل البطاقة البنكية */}
                  <form onSubmit={handleSubmitPayment} className="bg-white rounded-[32px] border border-[#F1F4F4] p-6 shadow-sm space-y-5">
                    <h3 className="text-sm font-bold text-[#181C1D] pb-1">تفاصيل البطاقة البنكية</h3>
                    
                    {/* اسم حامل البطاقة */}
                    <div className="space-y-1.5 text-right">
                      <label className="text-xs font-bold text-[#404847]">اسم حامل البطاقة</label>
                      <input 
                        type="text" 
                        value={cardName}
                        onChange={handleNameChange}
                        placeholder="الاسم كما يظهر على البطاقة (حروف فقط)" 
                        required
                        className="w-full text-right text-xs bg-[#F7FAFA] border border-[#BFC8C7]/40 rounded-[14px] px-4 py-3.5 focus:outline-none focus:border-[#316764] focus:bg-white transition-all text-[#181C1D] font-medium shadow-inner"
                      />
                    </div>

                    {/* رقم البطاقة */}
                    <div className="space-y-1.5 text-right relative">
                      <label className="text-xs font-bold text-[#404847]">رقم البطاقة</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          maxLength="19" 
                          placeholder="0000 0000 0000 0000" 
                          required
                          className="w-full text-left font-mono text-sm bg-[#F7FAFA] border border-[#BFC8C7]/40 rounded-[14px] pl-12 pr-4 py-3.5 focus:outline-none focus:border-[#316764] focus:bg-white transition-all tracking-widest text-[#181C1D] shadow-inner"
                        />
                        <CreditCard className="w-4 h-4 text-[#707978] absolute left-4 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    {/* النتيجة والـ CVV */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5 text-right">
                        <label className="text-xs font-bold text-[#404847]">تاريخ الانتهاء</label>
                        <input 
                          type="month" 
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          required
                          className="w-full text-center font-mono text-xs bg-[#F7FAFA] border border-[#BFC8C7]/40 rounded-[14px] px-3 py-3 focus:outline-none focus:border-[#316764] focus:bg-white transition-all font-bold text-[#181C1D] shadow-inner cursor-pointer"
                        />
                      </div>
                      
                      <div className="space-y-1.5 text-right">
                        <label className="text-xs font-bold text-[#404847]">الرمز (CVV)</label>
                        <input 
                          type="text" 
                          value={cvv}
                          onChange={handleCvvChange}
                          placeholder="123" 
                          required
                          className="w-full text-center font-mono text-xs bg-[#F7FAFA] border border-[#BFC8C7]/40 rounded-[14px] py-3.5 focus:outline-none focus:border-[#316764] focus:bg-white transition-all font-bold text-[#181C1D] shadow-inner"
                        />
                      </div>
                    </div>

                    {/* زر الدفع والاشتراك */}
                    <div className="pt-4">
                      <motion.button
                        whileHover={{ scale: 1.01, filter: "brightness(1.04)" }}
                        whileTap={{ scale: 0.99 }}
                        type="submit"
                        className="w-full bg-gradient-to-r from-[#316764] to-[#83B9B5] text-white font-bold py-4 rounded-full shadow-lg shadow-[#316764]/20 transition-all text-sm tracking-wide cursor-pointer"
                      >
                        تأكيد الدفع والاستمرار
                      </motion.button>
                    </div>

                    {/* شعارات الأمان */}
                    <div className="flex justify-center items-center gap-6 pt-4 text-[10px] text-[#707978] font-bold border-t border-neutral-100">
                      <span>🔒 PCI-DSS</span>
                      <span>🛡️ HI-PAA COMPLIANT</span>
                      <span>⚡ SSL SECURE</span>
                    </div>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="success-card"
                  initial={{ opacity: 0, scale: 0.96, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 100, damping: 15 }}
                  className="bg-white rounded-[32px] border-2 border-[#316764]/20 p-8 shadow-xl text-center space-y-6"
                >
                  <div className="mx-auto w-16 h-16 bg-[#316764]/10 rounded-full flex items-center justify-center text-[#316764] animate-bounce">
                    <PartyPopper className="w-8 h-8 text-[#0D9488]" />
                  </div>
                  
                  <div className="space-y-2">
                    <h2 className="text-xl font-black text-[#181C1D]">تم تأكيد الاشتراك بنجاح!</h2>
                    <p className="text-xs text-[#707978] leading-relaxed font-medium max-w-md mx-auto">
                      مبارك! قمنا بتأكيد حجز جلستك مع <span className="font-bold text-[#316764]">{doctorInfo.name}</span> وتأمين خطتك العلاجية بنجاح. يمكنك متابعة الموعد في أي وقت.
                    </p>
                  </div>

                  {/* مراجعة تفاصيل الحجز */}
                  <div className="bg-[#F7FAFA] rounded-2xl p-5 border border-[#BFC8C7]/20 text-right space-y-3 text-xs font-bold text-[#404847]">
                    <div className="flex flex-row-reverse justify-between items-center border-b border-neutral-200/50 pb-2.5">
                      <span className="text-[#707978]">نوع الاشتراك:</span>
                      <span className="text-[#316764]">{planDetails[selectedPlan].label}</span>
                    </div>
                    <div className="flex flex-row-reverse justify-between items-center">
                      <span className="text-[#707978]">الموعد المثبت:</span>
                      <span>{doctorInfo.date} • {doctorInfo.time}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleGoToMySessions}
                      className="w-full bg-[#316764] hover:bg-[#254f4d] text-white font-bold py-4 rounded-full shadow-lg shadow-[#316764]/10 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer flex-row-reverse"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                      <span>الانتقال إلى جلساتي الآن</span>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}