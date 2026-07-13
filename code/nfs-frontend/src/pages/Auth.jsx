import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Input from '../components/ui/Input';
import { login } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { resolveUserRole } from '../api/config';
import { ensurePatientRecord } from '../api/patientHelpers';
import { fetchTherapistByUserId } from '../api/therapists';
import { useToast } from '../context/ToastContext';
import { getApiErrorMessage } from '../utils/apiError';

const quotes = [
  "السلام الداخلي يبدأ في اللحظة التي تختار فيها ألا تسمح لحدث أو شخص آخر بالتحكم في عواطفك.",
  "الهدوء ليس غياب الضجيج، بل هو السكون في وسط العاصفة.",
  "اكتشف توازنك النفسي في رحلة نحو الذات الهادئة."
];

const Auth = () => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login: setAuth } = useAuth();
  const toast = useToast();

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e) => {
    e?.preventDefault?.();
    setLoading(true);
    setError('');
    try {
      const result = await login({ email, password });
      if (!result || !result.accessToken) {
        throw new Error('Invalid login response');
      }
      const userRole = resolveUserRole(result.roles);
      let sessionData = result;
      if (userRole === 'user') {
        try {
          const patientId = result.patientId || (await ensurePatientRecord(result.userId));
          sessionData = { ...result, patientId };
        } catch (err) {
          console.error('Failed to ensure patient record', err);
        }
      }
      if (userRole === 'doctor') {
        try {
          let therapistId = result.therapistId;
          if (!therapistId) {
            const res = await fetchTherapistByUserId(result.userId);
            therapistId = res.data?.therapistId;
          }
          sessionData = { ...sessionData, therapistId };
        } catch (err) {
          console.error('Failed to resolve therapist id', err);
        }
      }
      setAuth(sessionData);
      if (userRole === 'admin') {
        navigate('/admin');
      } else if (userRole === 'doctor') {
        navigate('/doctor/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = getApiErrorMessage(err, err.message || 'فشل تسجيل الدخول');
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="flex h-screen w-full bg-white overflow-hidden font-sans relative"
    >
      <nav className="absolute top-0 w-full p-10 flex justify-between items-center z-50 flex-row-reverse">
        <img src="/nafs_icon.png" alt="Nafs Logo" className="h-20 w-auto drop-shadow-lg" />
        <button className="text-[#316764] font-bold text-lg hover:underline transition">مساعدة؟</button>
      </nav>

      <div
        className="hidden lg:flex w-1/2 bg-cover bg-center items-end p-16 relative"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1470&auto=format&fit=crop')" }}
      >
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 bg-white/10 backdrop-blur-2xl border border-white/20 p-10 rounded-[2rem] shadow-2xl max-w-sm">
          <p className="text-white text-xl leading-relaxed italic animate-pulse">{quotes[quoteIndex]}</p>
          <p className="text-white/70 mt-6 text-sm font-light">~ سلامتك النفسية</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-white">
        <div className="w-full max-w-sm text-right">
          <h1 className="text-3xl font-bold text-[#2A5C58] mb-2">ابدأ رحلة الهدوء</h1>
          <p className="text-gray-500 mb-8 font-light">انضم إلى مجتمع \"نفس\" واكتشف التوازن الذي تستحقه.</p>

          <form className="space-y-4" onSubmit={handleLogin}>
            <Input
              type="email"
              placeholder="البريد الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-[#316764] to-[#83B9B5] text-white rounded-full font-bold shadow-md hover:scale-[1.02] transition-all cursor-pointer disabled:opacity-60"
            >
              {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/select-role')}
              className="w-full py-4 bg-gray-100 text-[#316764] rounded-full font-bold hover:bg-gray-200 transition-all cursor-pointer"
            >
              إنشاء حساب مجاني
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default Auth;