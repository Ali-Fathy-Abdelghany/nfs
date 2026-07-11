import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register, login } from '../api/auth';
import { ensurePatientRecord } from '../api/patientHelpers';

const UserSignup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  // Build payload matching backend RegisterDto (using available fields)
  const [firstName = "", ...rest] = formData.fullName.split(' ');
  const lastName = rest.join(' ');
  const payload = {
    firstName,
    lastName,
    email: formData.email,
    password: formData.password,
    phone: "",
    gender: 0,
    dateOfBirth: new Date().toISOString(),
    profileImageUrl: "",
    country: "",
    governorate: "",
    role: 0,
  };
  try {
    await register(payload);
    const loginResult = await login({ email: formData.email, password: formData.password });
    await ensurePatientRecord(loginResult.userId);
    navigate('/login');
  } catch (err) {
    console.error('Registration failed', err);
    alert(err.message || 'Registration failed');
  }
};

  return (
    <div className="min-h-screen w-full bg-[#F7FAFA] flex flex-row-reverse overflow-hidden font-sans">
      
      {/* الجانب الأيمن: الصورة والعبارة الملهمة */}
      <div className="hidden md:flex md:w-1/2 relative bg-cover bg-center items-center justify-center p-12"
           style={{ backgroundImage: `url('/forest-path.jpg')` }}>
        
        {/* الطبقة الضبابية الفوقية (Overlay) */}
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]"></div>

        {/* الكارت الزجاجي الداخلي (Glassmorphism Card) */}
        <div className="relative z-10 bg-white/20 backdrop-blur-md border border-white/30 rounded-3xl p-8 max-w-sm text-center text-white shadow-xl">
          <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-xl">⚡</span>
          </div>
          <h3 className="text-2xl font-bold mb-3">تنفّس بعمق، أنت هنا الآن.</h3>
          <p className="text-sm opacity-90 leading-relaxed">
            أنت في مجتمع يسعى نحو التوازن الداخلي والهدوء النفسي. رحلتك تبدأ بخطوة واحدة واعية.
          </p>
        </div>
      </div>

      {/* الجانب الأيسر: فورم التسجيل */}
      <div className="w-full md:w-1/2 flex flex-col p-8 md:p-12 justify-between bg-white">
        
        {/* الهيدر العلوي للفورم */}
        <div className="flex justify-between items-center flex-row-reverse w-full">
          <span className="text-[#316764] font-bold text-xl tracking-wide">نفس</span>
          <button 
            onClick={() => navigate('/login')} 
            className="text-gray-400 font-medium hover:text-gray-600 transition text-sm"
          >
            Log in
          </button>
        </div>

        {/* محتوى الـ Form */}
        <div className="max-w-md w-full mx-auto my-auto pt-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#2A5C58] mb-2">ابدأ رحلتك نحو السلام النفسي</h2>
            <p className="text-gray-400 text-sm">خطوات بسيطة تفصلك عن بيئة آمنة تدعم صحتك النفسية.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* حقل الاسم الكامل */}
            <div className="flex flex-col text-right">
              <label className="text-gray-600 text-xs font-bold mb-2">الاسم الكامل</label>
              <input 
                type="text" 
                name="fullName"
                placeholder="أدخل اسمك بالكامل"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-3.5 bg-[#F7FAFA] border border-gray-100 rounded-2xl text-right text-sm focus:outline-none focus:border-[#316764] transition"
                required
              />
            </div>

            {/* حقل البريد الإلكتروني */}
            <div className="flex flex-col text-right">
              <label className="text-gray-600 text-xs font-bold mb-2">البريد الإلكتروني</label>
              <input 
                type="email" 
                name="email"
                placeholder="example@mail.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3.5 bg-[#F7FAFA] border border-gray-100 rounded-2xl text-left text-sm focus:outline-none focus:border-[#316764] transition"
                required
              />
            </div>

            {/* حقل كلمة المرور */}
            <div className="flex flex-col text-right">
              <label className="text-gray-600 text-xs font-bold mb-2">كلمة المرور</label>
              <div className="relative">
                <input 
                  type="password" 
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 bg-[#F7FAFA] border border-gray-100 rounded-2xl text-left text-sm focus:outline-none focus:border-[#316764] transition"
                  required
                />
              </div>
            </div>

            {/* زر إنشاء الحساب (عند الضغط عليه سيوجه لـ /login) */}
            <button 
              type="submit" 
              className="w-full py-4 bg-[#316764] text-white rounded-2xl font-bold shadow-md hover:bg-[#254f4c] transition mt-4 text-center"
            >
              إنشاء الحساب
            </button>
          </form>

          {/* أزرار تسجيل الدخول البديلة */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <button className="flex items-center justify-center gap-2 py-3 border border-gray-100 rounded-2xl bg-[#F7FAFA] hover:bg-gray-50 transition text-sm text-gray-600 font-medium">
              <span>آبل</span>
              <span className="text-base">🍎</span>
            </button>
            <button className="flex items-center justify-center gap-2 py-3 border border-gray-100 rounded-2xl bg-[#F7FAFA] hover:bg-gray-50 transition text-sm text-gray-600 font-medium">
              <span>جوجل</span>
              <span className="text-base">🌐</span>
            </button>
          </div>

          {/* روابط المساعدة البديلة */}
          <div className="text-center mt-8 space-y-2">
            <button 
              onClick={() => navigate('/select-role')} 
              className="text-xs text-gray-400 hover:underline block mx-auto"
            >
              العودة للصفحة السابقة
            </button>
            <p className="text-xs text-gray-400">
              لديك حساب بالفعل؟ <span onClick={() => navigate('/login')} className="text-[#316764] font-bold cursor-pointer hover:underline">تسجيل الدخول</span>
            </p>
          </div>
        </div>

        {/* حقوق الملكية */}
        <div className="text-center text-xs text-gray-300 pt-4">
          © 2026 Nafs Sanctuary. All rights reserved.
        </div>
      </div>

    </div>
  );
};

export default UserSignup;