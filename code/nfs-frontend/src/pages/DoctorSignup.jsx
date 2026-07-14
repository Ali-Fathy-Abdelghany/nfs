import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/ui/Input';
import { register, login } from '../api/auth';
import { createTherapist } from '../api/therapists';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getApiErrorMessage } from '../utils/apiError';

const DoctorSignup = () => {
  const navigate = useNavigate();
  const { login: setAuth } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    gender: '0',
    dateOfBirth: '',
    country: 'مصر',
    governorate: '',
    specialty: '',
    license: '',
    bio: '',
    experienceYears: '3',
    hourlyRate: '200',
    password: '',
  });

  const update = (key, value) => setFormData({ ...formData, [key]: value });

  const handleSubmit = async () => {
    setError('');
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.password) {
      const msg = 'أدخل الاسم والبريد وكلمة المرور';
      setError(msg);
      toast.warning(msg);
      return;
    }
    if (!formData.specialty.trim()) {
      const msg = 'أدخل التخصص قبل إرسال الطلب';
      setError(msg);
      toast.warning(msg);
      return;
    }

    setLoading(true);
    try {
      const [firstName = '', ...rest] = formData.fullName.trim().split(/\s+/);
      const lastName = rest.join(' ') || firstName;
      const registerPayload = {
        firstName,
        lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || null,
        gender: Number(formData.gender),
        dateOfBirth: formData.dateOfBirth
          ? new Date(formData.dateOfBirth).toISOString()
          : null,
        country: formData.country || null,
        governorate: formData.governorate || null,
        role: 1,
      };
      await register(registerPayload);
      const loginResult = await login({ email: formData.email, password: formData.password });
      if (!loginResult?.accessToken) {
        throw new Error('فشل تسجيل الدخول بعد إنشاء الحساب');
      }
      // Persist session before authenticated API calls / verification page
      setAuth(loginResult);
      const userId = loginResult.userId;

      const { data: therapist } = await createTherapist({
        userId,
        specialization: formData.specialty,
        bio: formData.bio,
        experienceYears: Number(formData.experienceYears) || 1,
        hourlyRate: Number(formData.hourlyRate) || 150,
        qualifications: formData.license,
      });

      setAuth({
        ...loginResult,
        therapistId: therapist?.therapistId ?? loginResult.therapistId,
      });

      toast.success('تم إنشاء الحساب — أكمل خطوات التوثيق');
      navigate('/verification');
    } catch (err) {
      console.error(err);
      const msg = getApiErrorMessage(err, err.message || 'فشل إنشاء الحساب المهني');
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-6 font-['Cairo',sans-serif]">
      <div className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 p-10 md:p-12 overflow-y-auto max-h-[95vh]">
          <h1 className="text-3xl font-bold text-[#2A5C58] mb-2">تسجيل مهني</h1>
          <p className="text-sm text-gray-500 mb-8">
            أدخل بياناتك للانضمام إلى منصة نفس — سيراجع المسؤول طلبك قبل التفعيل.
          </p>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input placeholder="الاسم الكامل" value={formData.fullName} onChange={(e) => update('fullName', e.target.value)} />
              <Input placeholder="البريد الإلكتروني" value={formData.email} onChange={(e) => update('email', e.target.value)} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input placeholder="رقم الهاتف" value={formData.phone} onChange={(e) => update('phone', e.target.value)} />
              <select
                value={formData.gender}
                onChange={(e) => update('gender', e.target.value)}
                className="w-full p-4 rounded-3xl border border-gray-200 focus:ring-2 focus:ring-[#316764] outline-none text-right text-sm text-gray-600"
              >
                <option value="0">ذكر</option>
                <option value="1">أنثى</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input type="date" placeholder="تاريخ الميلاد" value={formData.dateOfBirth} onChange={(e) => update('dateOfBirth', e.target.value)} />
              <Input placeholder="المحافظة" value={formData.governorate} onChange={(e) => update('governorate', e.target.value)} />
            </div>

            <Input placeholder="الدولة" value={formData.country} onChange={(e) => update('country', e.target.value)} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input placeholder="التخصص" value={formData.specialty} onChange={(e) => update('specialty', e.target.value)} />
              <Input placeholder="رقم ترخيص الهيئة / المؤهلات" value={formData.license} onChange={(e) => update('license', e.target.value)} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input type="number" placeholder="سنوات الخبرة" value={formData.experienceYears} onChange={(e) => update('experienceYears', e.target.value)} />
              <Input type="number" placeholder="سعر الجلسة (ج.م)" value={formData.hourlyRate} onChange={(e) => update('hourlyRate', e.target.value)} />
            </div>

            <textarea
              className="w-full p-4 rounded-3xl border border-gray-200 focus:ring-2 focus:ring-[#316764] outline-none transition text-right"
              placeholder="(Bio) نبذة مهنية"
              rows="3"
              value={formData.bio}
              onChange={(e) => update('bio', e.target.value)}
            />

            <div className="border-2 border-dashed border-gray-300 rounded-3xl p-6 text-center cursor-pointer hover:bg-gray-50 transition">
              <p className="text-gray-400 text-sm">تحميل السيرة الذاتية والشهادات (قريباً)</p>
            </div>

            <Input type="password" placeholder="كلمة المرور" value={formData.password} onChange={(e) => update('password', e.target.value)} />

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-4 bg-[#2A5C58] text-white rounded-full font-bold hover:bg-[#1f4a46] transition-all shadow-lg shadow-[#2A5C58]/20 disabled:opacity-50"
            >
              {loading ? 'جاري إنشاء الحساب...' : 'إرسال طلب الانضمام'}
            </button>
          </form>
        </div>

        <div className="w-full md:w-1/2 bg-[#E6F0EF] p-10 flex flex-col items-center text-center justify-center">
          <h3 className="text-[#2A5C58] font-medium mb-8 uppercase tracking-widest">Doctor</h3>
          <h2 className="text-2xl font-bold text-[#2A5C58] mb-4">انضم إلى مجتمعنا الصحي الرقمي</h2>
          <p className="text-sm text-gray-600 mb-10 leading-relaxed max-w-xs">
            بعد التسجيل يراجع فريق الإدارة بياناتك المهنية ثم يفعّل حسابك للبدء في استقبال المرضى.
          </p>

          <div className="flex gap-4 w-full justify-center flex-wrap">
            <div className="bg-white py-3 px-5 rounded-2xl shadow-sm flex items-center gap-2 border border-[#dce9e8]">
              <span>📅</span>
              <span className="text-[#2A5C58] font-semibold text-sm">جدولة مرنة</span>
            </div>
            <div className="bg-white py-3 px-5 rounded-2xl shadow-sm flex items-center gap-2 border border-[#dce9e8]">
              <span>✅</span>
              <span className="text-[#2A5C58] font-semibold text-sm">اعتماد إداري</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorSignup;
