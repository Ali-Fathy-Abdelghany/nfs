import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import './Toast.css';

const ToastContext = createContext(null);

const VARIANT_ICON = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((message, variant = 'info', duration = 4200) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, variant }]);
    if (duration > 0) {
      window.setTimeout(() => dismiss(id), duration);
    }
    return id;
  }, [dismiss]);

  const api = useMemo(() => ({
    show,
    success: (message, duration) => show(message, 'success', duration),
    error: (message, duration) => show(message, 'error', duration),
    warning: (message, duration) => show(message, 'warning', duration),
    info: (message, duration) => show(message, 'info', duration),
    dismiss,
  }), [show, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="nfs-toast-viewport" dir="rtl" aria-live="polite" aria-relevant="additions">
        {toasts.map((toast) => {
          const Icon = VARIANT_ICON[toast.variant] || Info;
          return (
            <div
              key={toast.id}
              className={`nfs-toast nfs-toast--${toast.variant}`}
              role="status"
            >
              <Icon className="nfs-toast__icon" size={18} strokeWidth={2.25} aria-hidden />
              <p className="nfs-toast__message">{toast.message}</p>
              <button
                type="button"
                className="nfs-toast__close"
                onClick={() => dismiss(toast.id)}
                aria-label="إغلاق"
              >
                <X size={14} strokeWidth={2.5} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}
