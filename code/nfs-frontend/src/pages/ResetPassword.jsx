import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Input from '../components/ui/Input';
import { resetPassword } from '../api/auth';
import { useToast } from '../context/ToastContext';
import { getApiErrorMessage } from '../utils/apiError';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!token) {
      toast.error('رابط إعادة التعيين غير صالح أو ناقص');
      return;
    }
    if (password.length < 6) {
      toast.warning('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    if (password !== confirm) {
      toast.warning('كلمتا المرور غير متطابقتين');
      return;
    }
    setLoading(true);
    try {
      await resetPassword({ token, newPassword: password });
      toast.success('تم تعيين كلمة المرور بنجاح');
      navigate('/login');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'الرابط منتهي أو غير صالح'));
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
        <img src="/nafs_icon.png" alt="Nafs" className="h-16 w-auto mb-6" />
        <h1 className="text-2xl font-bold text-[#2A5C58] mb-2">تعيين كلمة مرور جديدة</h1>
        <p className="text-gray-500 mb-8 text-sm">أدخل كلمة المرور الجديدة لحسابك على منصة نفس.</p>

        {!token ? (
          <div className="space-y-4">
            <p className="text-red-600 text-sm">الرابط غير مكتمل. اطلب رابطاً جديداً من صفحة نسيت كلمة المرور.</p>
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="w-full py-4 bg-[#316764] text-white rounded-full font-bold"
            >
              طلب رابط جديد
            </button>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              type="password"
              placeholder="كلمة المرور الجديدة"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input
              type="password"
              placeholder="تأكيد كلمة المرور"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-[#316764] to-[#83B9B5] text-white rounded-full font-bold disabled:opacity-60"
            >
              {loading ? 'جاري الحفظ...' : 'حفظ كلمة المرور'}
            </button>
          </form>
        )}
      </div>
    </motion.div>
  );
};

export default ResetPassword;
