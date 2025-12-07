import { useState, useCallback } from 'react';

let toastId = 0;

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = null) => {
    const id = toastId++;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showSuccess = useCallback((message, duration = null) => {
    addToast(message, 'success', duration);
  }, [addToast]);

  const showError = useCallback((message, duration = null) => {
    addToast(message, 'error', duration);
  }, [addToast]);

  const showWarning = useCallback((message, duration = null) => {
    addToast(message, 'warning', duration);
  }, [addToast]);

  const showInfo = useCallback((message, duration = null) => {
    addToast(message, 'info', duration);
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};
