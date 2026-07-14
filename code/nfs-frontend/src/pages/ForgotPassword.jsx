import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Input from '../components/ui/Input';
import { forgotPassword } from '../api/auth';
import { useToast } from '../context/ToastContext';
import { getApiErrorMessage } from '../utils/apiError';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!email.trim()) {
      toast.warning('أدخل البريد الإلكتروني');
      return;
    }
    setLoading(true);
    try {
      await forgotPassword({ email: email.trim() });
      setSent(true);
      toast.success('إذا كان البريد مسجلاً، ستصلك رسالة لإعادة التعيين');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'تعذر إرسال رابط إعادة التعيين'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex min-h-screen w-full items-center justify-center bg-white p-8 font-sans"
      dir="rtl"
    >
      <div className="w-full max-w-sm text-right">
        <img src="/nafs_icon.png" alt="Nafs" className="h-16 w-auto mb-6 mr-auto ml-0" />
        <h1 className="text-2xl font-bold text-[#2A5C58] mb-2">نسيت كلمة المرور؟</h1>
        <p className="text-gray-500 mb-8 text-sm">
          أدخل بريدك وسنرسل لك رابطاً لإعادة تعيين كلمة المرور (صالح 15 دقيقة).
        </p>

        {sent ? (
          <div className="space-y-4">
            <div className="bg-[#E6F0EF] border border-[#316764]/15 rounded-2xl p-4 text-sm text-[#2A5C58]">
              تم استلام الطلب. تحقق من بريدك الإلكتروني واتبع الرابط.
            </div>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full py-4 bg-[#316764] text-white rounded-full font-bold"
            >
              العودة لتسجيل الدخول
            </button>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              type="email"
              placeholder="البريد الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-[#316764] to-[#83B9B5] text-white rounded-full font-bold disabled:opacity-60"
            >
              {loading ? 'جاري الإرسال...' : 'إرسال رابط التعيين'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full py-3 text-[#316764] font-bold text-sm hover:underline"
            >
              تذكرت كلمة المرور؟ تسجيل الدخول
            </button>
          </form>
        )}
      </div>
    </motion.div>
  );
};

export default ForgotPassword;
