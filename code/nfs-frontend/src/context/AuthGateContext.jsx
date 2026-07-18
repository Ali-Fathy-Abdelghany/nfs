import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './AuthContext';
import AuthRequiredModal from '../components/ui/AuthRequiredModal';

const AuthGateContext = createContext(null);

const DEFAULT_COPY = {
  title: 'سجّل الدخول للمتابعة',
  message:
    'الميزة دي محتاجة حساب على نفس عشان نحفظ رحلتك ونوفرلك تجربة آمنة ومخصصة.',
};

export function AuthGateProvider({ children }) {
  const { isAuthenticated } = useAuth() || {};
  const [modal, setModal] = useState({ open: false, ...DEFAULT_COPY });

  const closeAuthGate = useCallback(() => {
    setModal((prev) => ({ ...prev, open: false }));
  }, []);

  const openAuthGate = useCallback((copy = {}) => {
    setModal({
      open: true,
      title: copy.title || DEFAULT_COPY.title,
      message: copy.message || DEFAULT_COPY.message,
    });
  }, []);

  /**
   * Run `action` only when authenticated; otherwise show the themed login popup.
   * Returns true if the action was allowed to run.
   */
  const requireAuth = useCallback(
    (action, copy) => {
      if (isAuthenticated) {
        if (typeof action === 'function') action();
        return true;
      }
      openAuthGate(copy);
      return false;
    },
    [isAuthenticated, openAuthGate]
  );

  const value = useMemo(
    () => ({ requireAuth, openAuthGate, closeAuthGate, isAuthenticated: !!isAuthenticated }),
    [requireAuth, openAuthGate, closeAuthGate, isAuthenticated]
  );

  return (
    <AuthGateContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {modal.open && (
          <AuthRequiredModal
            open={modal.open}
            onClose={closeAuthGate}
            title={modal.title}
            message={modal.message}
          />
        )}
      </AnimatePresence>
    </AuthGateContext.Provider>
  );
}

export function useAuthGate() {
  const ctx = useContext(AuthGateContext);
  if (!ctx) {
    return {
      requireAuth: (action) => {
        if (typeof action === 'function') action();
        return true;
      },
      openAuthGate: () => {},
      closeAuthGate: () => {},
      isAuthenticated: false,
    };
  }
  return ctx;
}
