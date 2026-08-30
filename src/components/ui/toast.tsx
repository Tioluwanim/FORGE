"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, XCircle, Info } from "lucide-react";
import { cn } from "@/lib/cn";

type ToastVariant = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastVariant, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const TONE: Record<ToastVariant, string> = {
  success: "border-signal-pass/30 text-signal-pass",
  error: "border-signal-fail/30 text-signal-fail",
  info: "border-hairline text-text-muted",
};

let nextId = 1;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, variant: ToastVariant = "info") => {
    const id = nextId++;
    setToasts((t) => [...t, { id, message, variant }]);
    setTimeout(() => {
      setToasts((t) => t.filter((item) => item.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col gap-2"
        role="status"
        aria-live="polite"
      >
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = ICONS[t.variant];
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "pointer-events-auto flex items-center gap-2 rounded-md border bg-surface px-4 py-2.5 text-sm shadow-lg",
                  TONE[t.variant]
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="text-text">{t.message}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx.toast;
}
