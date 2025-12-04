import { useState, useCallback } from 'react';
import type { ToastType } from '../components/Toast';

interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((
    title: string,
    type: ToastType = 'info',
    message?: string,
    duration?: number
  ) => {
    const id = Date.now().toString();
    const newToast: ToastMessage = {
      id,
      type,
      title,
      message,
      duration,
    };

    setToasts((prev) => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback(
    (title: string, message?: string) => addToast(title, 'success', message),
    [addToast]
  );

  const error = useCallback(
    (title: string, message?: string) => addToast(title, 'error', message),
    [addToast]
  );

  const warning = useCallback(
    (title: string, message?: string) => addToast(title, 'warning', message),
    [addToast]
  );

  const info = useCallback(
    (title: string, message?: string) => addToast(title, 'info', message),
    [addToast]
  );

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
}
