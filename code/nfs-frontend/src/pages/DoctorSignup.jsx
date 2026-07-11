import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/ui/Input';
import { register, login } from '../api/auth';
import { createTherapist } from '../api/therapists';

const DoctorSignup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    specialty: "",
    license: "",
    bio: "",
    password: ""
  });

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const [firstName = "", ...rest] = formData.fullName.split(' ');
      const lastName = rest.join(' ');
      const registerPayload = {
        firstName,
        lastName,
        email: formData.email,
        password: formData.password,
        phone: "",
        gender: 0,
        dateOfBirth: new Date().toISOString(),
        role: 1, // THERAPIST
      };
      await register(registerPayload);
      const loginResult = await login({ email: formData.email, password: formData.password });
      const userId = loginResult.userId;

      await createTherapist({
        userId,
        specialization: formData.specialty,
        bio: formData.bio,
        experienceYears: 1,
        hourlyRate: 150,
        qualifications: formData.license,
      });

      navigate('/verification');
    } catch (err) {
      console.error(err);
      setError(err.message || 'فشل إنشاء الحساب المهني');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-6 font-sans">
      <div className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden flex flex-col md:flex-row">

        <div className="w-full md:w-1/2 p-10 md:p-16">
          <h1 className="text-3xl font-bold text-[#2A5C58] mb-2">تسجيل مهني</h1>
          <p className="text-sm text-gray-500 mb-10">أدخل بياناتك للانضمام إلى منصة نفس</p>

          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input placeholder="الاسم الكامل" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
              <Input placeholder="البريد الإلكتروني" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input placeholder="التخصص" value={formData.specialty} onChange={(e) => setFormData({ ...formData, specialty: e.target.value })} />
              <Input placeholder="رقم ترخيص الهيئة" value={formData.license} onChange={(e) => setFormData({ ...formData, license: e.target.value })} />
            </div>

            <textarea
              className="w-full p-4 rounded-3xl border border-gray-200 focus:ring-2 focus:ring-[#316764] outline-none transition text-right"
              placeholder="(Bio) نبذة مهنية"
              rows="3"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            />

            <div className="border-2 border-dashed border-gray-300 rounded-3xl p-6 text-center cursor-pointer hover:bg-gray-50 transition">
              <p className="text-gray-400">تحميل السيرة الذاتية والشهادات</p>
            </div>

            <Input type="password" placeholder="كلمة المرور" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-4 bg-[#2A5C58] text-white rounded-full font-bold hover:bg-[#1f4a46] transition-all shadow-lg shadow-[#2A5C58]/20 disabled:opacity-50"
            >
              {loading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب مهني'}
            </button>
          </form>
        </div>

        <div className="w-full md:w-1/2 bg-[#E6F0EF] p-10 flex flex-col items-center text-center justify-center">
          <h3 className="text-[#2A5C58] font-medium mb-8 uppercase tracking-widest">Doctor</h3>
          <h2 className="text-2xl font-bold text-[#2A5C58] mb-4">انضم إلى مجتمعنا الصحي الرقمي</h2>
          <p className="text-sm text-gray-600 mb-10 leading-relaxed max-w-xs">
            نؤمن أن رعاية المعالج هي الخطوة الأولى لرعاية المرضى.
          </p>

          <div className="flex gap-4 w-full justify-center">
            <div className="bg-white py-3 px-5 rounded-2xl shadow-sm flex items-center gap-2 border border-[#dce9e8]">
              <span>📅</span>
              <span className="text-[#2A5C58] font-semibold text-sm">جدولة مرنة</span>
            </div>
            <div className="bg-white py-3 px-5 rounded-2xl shadow-sm flex items-center gap-2 border border-[#dce9e8]">
              <span>✅</span>
              <span className="text-[#2A5C58] font-semibold text-sm">اعتمد مهني</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorSignup;
