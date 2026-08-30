"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
}

/**
 * Minimal accessible dialog: focus trap, Escape to close, focus restored
 * to the trigger on close, backdrop click closes. Built for confirmations
 * (see the Challenge IDE's "Reset" button) — not a full popover system.
 */
export function Dialog({ open, onClose, title, description, children }: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement as HTMLElement;
      requestAnimationFrame(() => {
        panelRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
      });
    } else {
      triggerRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab") {
        const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-void/70"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-sm rounded-md border border-hairline bg-surface p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <h2 id="dialog-title" className="font-display text-base text-text">
                {title}
              </h2>
              <button
                onClick={onClose}
                aria-label="Close"
                className="shrink-0 rounded p-1 text-text-faint hover:bg-elevated hover:text-text"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {description && <p className="mt-2 text-sm text-text-muted">{description}</p>}
            {children && <div className="mt-4">{children}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
