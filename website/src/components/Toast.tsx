import React, { createContext, useContext, useState, useCallback } from 'react';

interface ToastItem {
  id: number;
  message: string;
  visible: boolean;
}

interface ToastContextValue {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, visible: true }]);

    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, visible: false } : t))
      );
    }, 2500);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className="fixed bottom-8 right-8 z-[100] flex flex-col gap-2 items-end pointer-events-none"
        style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="bg-zinc-900 border border-white/[0.1] text-white px-4 py-2.5 rounded-full text-sm font-extrabold shadow-xl transition-all duration-300"
            style={{ opacity: toast.visible ? 1 : 0, transform: toast.visible ? 'translateY(0)' : 'translateY(8px)' }}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
