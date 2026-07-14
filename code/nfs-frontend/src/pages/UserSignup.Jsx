import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register, login, loginWithGoogle } from '../api/auth';
import { ensurePatientRecord } from '../api/patientHelpers';
import { completeAuthSession } from '../api/completeAuthSession';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getApiErrorMessage } from '../utils/apiError';
import GoogleSignInButton, { isGoogleSignInConfigured } from '../components/auth/GoogleSignInButton';

const inputClass =
  'w-full px-4 py-3.5 bg-[#F7FAFA] border border-gray-100 rounded-2xl text-right text-sm focus:outline-none focus:border-[#316764] transition';

const UserSignup = () => {
  const navigate = useNavigate();
  const { login: setAuth } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    gender: '1',
    dateOfBirth: '',
    country: 'مصر',
    governorate: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const [firstName = '', ...rest] = formData.fullName.trim().split(/\s+/);
    const lastName = rest.join(' ') || firstName;
    const payload = {
      firstName,
      lastName,
      email: formData.email,
      password: formData.password,
      phone: formData.phone || null,
      gender: Number(formData.gender),
      dateOfBirth: formData.dateOfBirth
        ? new Date(formData.dateOfBirth).toISOString()
        : null,
      profileImageUrl: null,
      country: formData.country || null,
      governorate: formData.governorate || null,
      role: 0,
    };
    try {
      await register(payload);
      const loginResult = await login({
        email: formData.email,
        password: formData.password,
      });
      const patientId = await ensurePatientRecord(loginResult.userId);
      setAuth({ ...loginResult, patientId });
      navigate('/quiz');
    } catch (err) {
      console.error('Registration failed', err);
      toast.error(getApiErrorMessage(err, err.message || 'فشل التسجيل'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (idToken) => {
    setLoading(true);
    try {
      const result = await loginWithGoogle(idToken);
      const { sessionData, userRole } = await completeAuthSession(result);
      setAuth(sessionData);
      // Signup page intent: new clients continue to quiz; others follow role routing.
      if (userRole === 'user') navigate('/quiz');
      else if (userRole === 'admin') navigate('/admin');
      else if (userRole === 'doctor') navigate(sessionData.therapistId ? '/doctor/dashboard' : '/verification');
      else navigate('/dashboard');
    } catch (err) {
      console.error('Google signup failed', err);
      toast.error(getApiErrorMessage(err, err.message || 'فشل التسجيل عبر Google'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F7FAFA] flex flex-row-reverse overflow-hidden font-['Cairo',sans-serif]">
      <div
        className="hidden md:flex md:w-1/2 relative bg-cover bg-center items-center justify-center p-12"
        style={{ backgroundImage: `url('/forest-path.jpg')` }}
      >
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]"></div>
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

      <div className="w-full md:w-1/2 flex flex-col p-8 md:p-12 justify-between bg-white overflow-y-auto">
        <div className="flex justify-between items-center flex-row-reverse w-full">
          <span className="text-[#316764] font-bold text-xl tracking-wide">نفس</span>
          <button
            onClick={() => navigate('/login')}
            className="text-gray-400 font-medium hover:text-gray-600 transition text-sm"
          >
            Log in
          </button>
        </div>

        <div className="max-w-md w-full mx-auto my-auto py-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#2A5C58] mb-2">ابدأ رحلتك نحو السلام النفسي</h2>
            <p className="text-gray-400 text-sm">بعد التسجيل ستكمل تقييماً قصيراً لفهم احتياجاتك.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col text-right">
              <label className="text-gray-600 text-xs font-bold mb-2">الاسم الكامل</label>
              <input
                type="text"
                name="fullName"
                placeholder="أدخل اسمك بالكامل"
                value={formData.fullName}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>

            <div className="flex flex-col text-right">
              <label className="text-gray-600 text-xs font-bold mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                name="email"
                placeholder="example@mail.com"
                value={formData.email}
                onChange={handleChange}
                className={`${inputClass} text-left`}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col text-right">
                <label className="text-gray-600 text-xs font-bold mb-2">رقم الهاتف</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="01xxxxxxxxx"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`${inputClass} text-left`}
                  required
                />
              </div>
              <div className="flex flex-col text-right">
                <label className="text-gray-600 text-xs font-bold mb-2">النوع</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={inputClass}
                  required
                >
                  <option value="1">أنثى</option>
                  <option value="0">ذكر</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col text-right">
              <label className="text-gray-600 text-xs font-bold mb-2">تاريخ الميلاد</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className={`${inputClass} text-left`}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col text-right">
                <label className="text-gray-600 text-xs font-bold mb-2">الدولة</label>
                <input
                  type="text"
                  name="country"
                  placeholder="مصر"
                  value={formData.country}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col text-right">
                <label className="text-gray-600 text-xs font-bold mb-2">المحافظة</label>
                <input
                  type="text"
                  name="governorate"
                  placeholder="القاهرة"
                  value={formData.governorate}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex flex-col text-right">
              <label className="text-gray-600 text-xs font-bold mb-2">كلمة المرور</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className={`${inputClass} text-left`}
                minLength={6}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#316764] text-white rounded-2xl font-bold shadow-md hover:bg-[#254f4c] transition mt-2 text-center disabled:opacity-60"
            >
              {loading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب والمتابعة للتقييم'}
            </button>
          </form>

          {isGoogleSignInConfigured() && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">أو</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <GoogleSignInButton
                disabled={loading}
                text="signup_with"
                onSuccess={handleGoogleSuccess}
                onError={(err) =>
                  toast.error(err?.message || 'فشل التسجيل عبر Google')
                }
              />
            </div>
          )}

          <div className="text-center mt-8 space-y-2">
            <button
              onClick={() => navigate('/select-role')}
              className="text-xs text-gray-400 hover:underline block mx-auto"
            >
              العودة للصفحة السابقة
            </button>
            <p className="text-xs text-gray-400">
              لديك حساب بالفعل؟{' '}
              <span
                onClick={() => navigate('/login')}
                className="text-[#316764] font-bold cursor-pointer hover:underline"
              >
                تسجيل الدخول
              </span>
            </p>
          </div>
        </div>

        <div className="text-center text-xs text-gray-300 pt-4">© 2026 Nafs Sanctuary. All rights reserved.</div>
      </div>
    </div>
  );
};

export default UserSignup;
