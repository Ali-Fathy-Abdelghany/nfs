import React from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, X, Sparkles } from 'lucide-react';

/**
 * Themed gate popup for guests who hit an auth-required action.
 */
export default function AuthRequiredModal({
  open,
  onClose,
  title = 'سجّل الدخول للمتابعة',
  message = 'الميزة دي محتاجة حساب على نفس عشان نحفظ رحلتك ونوفرلك تجربة آمنة ومخصصة.',
}) {
  const navigate = useNavigate();

  if (!open) return null;

  const goLogin = () => {
    onClose?.();
    navigate('/login');
  };

  const goSignup = () => {
    onClose?.();
    navigate('/select-role');
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-required-title"
    >
      <motion.button
        type="button"
        aria-label="إغلاق"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#316764]/45 backdrop-blur-sm border-0 cursor-default"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.96 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative w-full max-w-md bg-white rounded-3xl border border-[#0F766E]/10 shadow-2xl overflow-hidden"
      >
        <div className="h-1.5 w-full bg-gradient-to-l from-[#316764] to-[#83B9B5]" />

        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded-full text-neutral-400 hover:text-[#0F766E] hover:bg-[#E6F0EF] transition-colors"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 pt-10 text-center space-y-5">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-[#E6F0EF] text-[#0F766E] flex items-center justify-center border border-[#0F766E]/15">
            <Sparkles className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h2 id="auth-required-title" className="text-2xl font-black text-[#316764]">
              {title}
            </h2>
            <p className="text-sm text-neutral-500 leading-relaxed font-medium px-1">
              {message}
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-1">
            <button
              type="button"
              onClick={goLogin}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-gradient-to-r from-[#316764] to-[#83B9B5] text-white font-bold shadow-md hover:opacity-90 transition-all active:scale-[0.98]"
            >
              <LogIn className="w-4 h-4" />
              تسجيل الدخول
            </button>
            <button
              type="button"
              onClick={goSignup}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-[#E6F0EF] text-[#0F766E] font-bold border border-[#0F766E]/15 hover:bg-[#A6CEC5]/50 transition-all active:scale-[0.98]"
            >
              <UserPlus className="w-4 h-4" />
              إنشاء حساب
            </button>
          </div>

          <p className="text-[11px] text-neutral-400 font-medium">
            خطوة بسيطة… ورحلتك مع نفس تبدأ بهدوء.
          </p>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
