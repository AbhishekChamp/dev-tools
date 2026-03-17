import { useCallback } from 'react';
import toast from 'react-hot-toast';

interface ToastOptions {
  duration?: number;
  icon?: string;
}

export function useToast() {
  const success = useCallback(
    (message: string, options?: ToastOptions) => {
      toast.success(message, {
        duration: options?.duration ?? 3000,
        icon: options?.icon,
      });
    },
    []
  );

  const error = useCallback(
    (message: string, options?: ToastOptions) => {
      toast.error(message, {
        duration: options?.duration ?? 4000,
        icon: options?.icon,
      });
    },
    []
  );

  const loading = useCallback(
    (message: string, options?: ToastOptions) => {
      return toast.loading(message, {
        duration: options?.duration ?? Infinity,
      });
    },
    []
  );

  const dismiss = useCallback((toastId?: string) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  }, []);

  const promise = useCallback(
    <T,>(
      promise: Promise<T>,
      messages: {
        loading: string;
        success: string;
        error: string;
      }
    ) => {
      return toast.promise(promise, messages);
    },
    []
  );

  return {
    success,
    error,
    loading,
    dismiss,
    promise,
  };
}
