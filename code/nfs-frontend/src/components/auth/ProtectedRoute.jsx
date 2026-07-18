import React, { useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAuthGate } from '../../context/AuthGateContext';

/**
 * Redirects guests to the landing dashboard and opens the themed auth popup.
 */
export default function ProtectedRoute({ children, title, message }) {
  const { isAuthenticated } = useAuth() || {};
  const { openAuthGate } = useAuthGate();
  const prompted = useRef(false);

  useEffect(() => {
    if (!isAuthenticated && !prompted.current) {
      prompted.current = true;
      openAuthGate({
        title: title || 'سجّل الدخول للمتابعة',
        message:
          message ||
          'الميزة دي محتاجة حساب على نفس عشان نحفظ رحلتك ونوفرلك تجربة آمنة ومخصصة.',
      });
    }
  }, [isAuthenticated, openAuthGate, title, message]);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}
