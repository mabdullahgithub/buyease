import { toast } from "sonner";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastOptions {
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
}

export const appToast = {
  success: (message: string, options?: ToastOptions) => {
    return toast.success(message, {
      description: options?.description,
      action: options?.action,
      duration: options?.duration ?? 3000,
    });
  },

  error: (message: string, options?: ToastOptions) => {
    return toast.error(message, {
      description: options?.description,
      action: options?.action,
      duration: options?.duration ?? 4000,
    });
  },

  info: (message: string, options?: ToastOptions) => {
    return toast.info(message, {
      description: options?.description,
      action: options?.action,
      duration: options?.duration ?? 3000,
    });
  },

  warning: (message: string, options?: ToastOptions) => {
    return toast.warning(message, {
      description: options?.description,
      action: options?.action,
      duration: options?.duration ?? 3500,
    });
  },

  loading: (message: string, options?: ToastOptions) => {
    return toast.loading(message, {
      description: options?.description,
      duration: Infinity,
    });
  },

  settingsChanged: (message: string, options?: ToastOptions) => {
    return toast.success(message, {
      description: options?.description ?? "Your changes have been saved.",
      action: options?.action,
      duration: options?.duration ?? 3000,
    });
  },

  settingsError: (message: string, options?: ToastOptions) => {
    return toast.error(message, {
      description: options?.description ?? "Failed to save changes.",
      action: options?.action,
      duration: options?.duration ?? 4000,
    });
  },

  dismiss: (toastId?: string | number) => {
    toast.dismiss(toastId);
  },

  dismissAll: () => {
    toast.dismiss();
  },
};
