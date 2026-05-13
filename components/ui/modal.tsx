"use client";

import { ReactNode } from "react";

export function Modal({ open, onOpenChange, children }: { open: boolean; onOpenChange?: (open: boolean) => void; children: ReactNode }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded bg-white p-6 dark:bg-slate-900">{children}</div>
    </div>
  );
}

export default Modal;
