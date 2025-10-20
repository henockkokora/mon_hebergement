"use client";
import { useState } from "react";

export default function ReportModal({ triggerClass = "", onSubmitted }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [mode, setMode] = useState("identite"); // identite | anonyme
  const [loading, setLoading] = useState(false);

  function submit(e){
    e?.preventDefault?.();
    if (!reason.trim()) return;
    setLoading(true);
    setTimeout(()=>{
      setLoading(false);
      setOpen(false);
      onSubmitted?.({ reason, mode });
      setReason("");
      setMode("identite");
    }, 800);
  }

  return (
    <>
      <button onClick={()=>setOpen(true)} className={triggerClass || "chip-glass px-3 py-1.5"}>Signaler</button>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/30" onClick={()=>setOpen(false)} />
          {/* Modal */}
          <div className="relative w-full sm:max-w-[520px] sm:rounded-2xl border border-black/10 bg-white/90 backdrop-blur px-4 py-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-lg font-semibold">Signaler cette annonce</div>
              <button onClick={()=>setOpen(false)} className="chip-glass px-2 py-1 text-sm">Fermer</button>
            </div>
            <form onSubmit={submit} className="space-y-3">
              <div>
                <label className="text-sm font-medium">Motif</label>
                <textarea value={reason} onChange={e=>setReason(e.target.value)} className="mt-1 w-full min-h-28 p-3 rounded-xl border border-black/10 bg-white/95 outline-none" placeholder="Expliquez brièvement le problème (ex. annonce frauduleuse, photos trompeuses, contenu inapproprié)..." />
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Mode d’envoi</div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" name="mode" value="identite" checked={mode==='identite'} onChange={()=>setMode('identite')} />
                  <span>Avec mon identité</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" name="mode" value="anonyme" checked={mode==='anonyme'} onChange={()=>setMode('anonyme')} />
                  <span>De manière anonyme</span>
                </label>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button type="button" onClick={()=>setOpen(false)} className="chip-glass px-3 py-1.5">Annuler</button>
                <button disabled={!reason.trim() || loading} className="px-4 h-10 rounded-full bg-[#4A9B8E] text-white disabled:opacity-60">{loading? 'Envoi...' : 'Envoyer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
