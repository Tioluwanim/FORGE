"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

/**
 * Bottom sheet for mobile — slides up from the bottom, backdrop click and
 * Escape both close it, focus is trapped while open and restored to the
 * trigger on close. Meant for content that's naturally a list or a small
 * form the user picks from and dismisses (e.g. "choose an incident"),
 * not for primary navigation — the sidebar already has its own drawer.
 */
export function Drawer({ open, onClose, title, children }: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement as HTMLElement;
      requestAnimationFrame(() => {
        panelRef.current?.querySelector<HTMLElement>("button, [href], input")?.focus();
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
        <div className="fixed inset-0 z-[90] flex items-end justify-center">
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
            aria-labelledby="drawer-title"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="relative max-h-[75vh] w-full max-w-lg overflow-y-auto rounded-t-lg border-t border-hairline bg-surface pb-[env(safe-area-inset-bottom)]"
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-hairline bg-surface px-4 py-3">
              <h2 id="drawer-title" className="font-display text-sm text-text">
                {title}
              </h2>
              <button
                onClick={onClose}
                aria-label="Close"
                className="rounded p-1 text-text-faint hover:bg-elevated hover:text-text"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
