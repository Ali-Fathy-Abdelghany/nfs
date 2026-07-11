import React, { useState } from 'react';
import Input from '../components/ui/Input';
import { useNavigate } from 'react-router-dom';



const Verification = () => {
  const navigate = useNavigate(); // 2. عرف الـ hook
  const [step, setStep] = useState(1);


  return (
    <div className="min-h-screen bg-[#FDFDFD] p-8 md:p-16 font-sans">
      {/* Header & Stepper */}
      <div className="max-w-5xl mx-auto mb-12 text-right">
        <h1 className="text-3xl font-bold text-[#2A5C58] mb-4">توثيق الممارس</h1>
        <p className="text-gray-500 mb-8">نحن نؤمن بأن الثقة هي أساس كل رحلة علاجية، ساعدنا في الحفاظ على أمان مجتمعنا.</p>
        
        <div className="flex items-center gap-4 mb-10 justify-end">
          <Step active={step === 3} number="3" label="المراجعة والتحقق" />
          <Step active={step === 2} number="2" label="تحميل الوثائق المهنية" />
          <Step active={step === 1} number="1" label="المعلومات الشخصية" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Side: Info Cards */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-[#E6F0EF] p-8 rounded-3xl border border-[#dce9e8]">
            <h3 className="font-bold text-[#2A5C58] mb-4">لماذا نوثق الممارسين؟</h3>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">ضمان أعلى معايير الجودة العلمية والمهنية لمستخدمينا.</p>
            <p className="text-sm text-gray-600 leading-relaxed">حماية خصوصيتك وبياناتك المهنية من خلال أنظمة مشفرة بالكامل.</p>
          </div>
        </div>

        {/* Right Side: Main Content */}
        <div className="md:col-span-2 bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
          
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="font-bold text-[#2A5C58]">المعلومات الشخصية</h3>
              <Input placeholder="الاسم الكامل" />
              <Input placeholder="التخصص الدقيق" />
              <button onClick={() => setStep(2)} className="w-full py-4 bg-[#2A5C58] text-white rounded-full font-bold">التالي</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h3 className="font-bold text-[#2A5C58]">بطاقة الهوية المهنية</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-[2rem] p-12 text-center hover:bg-gray-50 transition cursor-pointer">
                <p className="text-gray-400">اضغط للتحميل أو اسحب الملف هنا</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 border border-gray-200 rounded-2xl text-center text-sm">شهادة التخرج +</div>
                 <div className="p-4 border border-gray-200 rounded-2xl text-center text-sm">التخصص الدقيق +</div>
              </div>
              <button onClick={() => setStep(3)} className="w-full py-4 bg-[#2A5C58] text-white rounded-full font-bold">إرسال المراجعة</button>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-[#E6F0EF] rounded-full flex items-center justify-center mx-auto mb-8 text-5xl">✅</div>
              <h2 className="text-3xl font-bold text-[#2A5C58] mb-4">تم استلام طلبك بنجاح</h2>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto">نحن نقوم حالياً بمراجعة بياناتك... سيتم إرسال بريد إلكتروني إليك فور الانتهاء.</p>
              
              {/* 3. الزر المعدل */}
              <button 
      onClick={() => navigate('/auth')} 
      className="px-10 py-4 bg-[#2A5C58] text-white rounded-full font-bold hover:bg-[#1f4a46] transition shadow-lg hover:shadow-xl"
    >
      العودة إلى صفحة تسجيل الدخول
    </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Step = ({ number, label, active }) => (
  <div className={`flex items-center gap-2 ${active ? 'text-[#2A5C58]' : 'text-gray-400'}`}>
    <span className="text-sm font-medium">{label}</span>
    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${active ? 'bg-[#2A5C58] text-white' : 'bg-gray-200'}`}>{number}</div>
  </div>
);

export default Verification;