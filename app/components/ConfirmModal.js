"use client";

import { useEffect } from "react";

export default function ConfirmModal({ open, title = "Confirmer", description = "", confirmText = "Supprimer", cancelText = "Annuler", onConfirm, onCancel }) {
  useEffect(() => {
    function onKey(e) {
      if (!open) return;
      if (e.key === 'Escape') onCancel?.();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onCancel} />
      <div className="relative w-full max-w-md mx-4 rounded-2xl bg-white shadow-xl border border-black/10 overflow-hidden animate-fade-in">
        <div className="px-5 py-4 border-b border-black/10 font-semibold text-neutral-900">{title}</div>
        <div className="px-5 py-4 text-sm text-neutral-700">{description}</div>
        <div className="px-5 py-3 border-t border-black/10 flex items-center justify-end gap-2 bg-neutral-50">
          <button onClick={onCancel} className="px-4 py-2 rounded-full border border-black/10 bg-white hover:bg-neutral-100 text-sm">{cancelText}</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-full bg-red-600 text-white hover:bg-red-700 text-sm">{confirmText}</button>
        </div>
      </div>
    </div>
  );
} 