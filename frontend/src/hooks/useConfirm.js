import { useState, useCallback } from 'react';

export const useConfirm = () => {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Yes, do it!',
    cancelText: 'Nah, cancel',
    type: 'danger',
    onConfirm: () => {}
  });

  const showConfirm = useCallback(({
    title,
    message,
    confirmText = 'Yes, do it!',
    cancelText = 'Nah, cancel',
    type = 'danger',
    onConfirm
  }) => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        title,
        message,
        confirmText,
        cancelText,
        type,
        onConfirm: () => {
          onConfirm?.();
          resolve(true);
          setConfirmState(prev => ({ ...prev, isOpen: false }));
        }
      });
    });
  }, []);

  const hideConfirm = useCallback(() => {
    setConfirmState(prev => ({ ...prev, isOpen: false }));
  }, []);

  return {
    confirmState,
    showConfirm,
    hideConfirm
  };
};
