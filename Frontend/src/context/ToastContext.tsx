import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { useToast } from "../hooks/useToast";
import ToastContainer from "../components/ui/ToastContainer";
import type { ToastType } from "../components/ui/Toast";

interface ToastContextType {
  success: (title: string, message?: string, duration?: number) => string;
  error: (title: string, message?: string, duration?: number) => string;
  warning: (title: string, message?: string, duration?: number) => string;
  info: (title: string, message?: string, duration?: number) => string;
  addToast: (
    type: ToastType,
    title: string,
    message?: string,
    duration?: number
  ) => string;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const toastMethods = useToast();

  return (
    <ToastContext.Provider value={toastMethods}>
      {children}
      <ToastContainer
        toasts={toastMethods.toasts}
        onRemove={toastMethods.removeToast}
      />
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToastContext must be used within ToastProvider");
  }
  return context;
}