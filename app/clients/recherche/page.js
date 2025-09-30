"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

function IconSearch({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-3.8-3.8" />
    </svg>
  );
}
function IconBack({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

const SUGGESTIONS = [
  { icon: "nearby", title: "À proximité", subtitle: "Découvrez les options à proximité" },
  { icon: "landmark", title: "Paris, Île-de-France", subtitle: "Célèbre pour des sites comme : Tour Eiffel" },
  { icon: "world", title: "Dakar, Sénégal", subtitle: "Pour un voyage à l'étranger" },
  { icon: "mosque", title: "Casablanca, Maroc", subtitle: "Parce que vous avez enregistré des favoris pour Casablanca" },
  { icon: "beach", title: "Assinie-Mafia", subtitle: "Près de vous" },
];

function SIcon({ name, className = "w-5 h-5" }) {
  switch (name) {
    case "nearby":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      );
    case "landmark":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M12 3l7 4v4c0 5-3 8-7 10-4-2-7-5-7-10V7l7-4Z" />
        </svg>
      );
    case "world":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="12" cy="12" r="9" />
          <path d="M2 12h20" />
          <path d="M12 3a15.3 15.3 0 0 1 0 18" />
          <path d="M12 3a15.3 15.3 0 0 0 0 18" />
        </svg>
      );
    case "mosque":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M3 20h18" />
          <path d="M6 20V10l6-4 6 4v10" />
          <path d="M12 14v6" />
        </svg>
      );
    case "beach":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M2 18c4-2 8-2 12 0s8 2 8 0" />
          <path d="M8 10c1.5-3 6.5-3 8 0" />
          <path d="M12 4v3" />
        </svg>
      );
    default:
      return null;
  }
}

export default function RechercheMobile() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [enter, setEnter] = useState(false);
  const containerRef = useRef(null);
  const [priceOpen, setPriceOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const [price, setPrice] = useState({ min: "", max: "" });
  const TYPES = ["Studio", "Appartement", "Maison", "Villa", "Chambre", "Loft", "Duplex"];

  useEffect(() => {
    const t = setTimeout(() => setEnter(true), 10);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="md:hidden min-h-screen vh-stable bg-gradient-to-b from-neutral-50 to-white">
      <div className={`max-w-[720px] mx-auto px-3 py-3 transform transition-all duration-250 ${enter ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`} ref={containerRef}>
        {/* Top bar */}
        <div className="flex items-center gap-2">
          <button aria-label="Retour" onClick={() => router.back()} className="w-10 h-10 rounded-full border border-black/10 bg-white flex items-center justify-center">
            <IconBack />
          </button>
          <div className="flex-1 flex items-center gap-2 rounded-2xl border border-black/10 bg-white/90 px-3 h-11">
            <IconSearch className="w-5 h-5 text-neutral-500" />
            <input
              autoFocus
              value={q}
              onChange={(e)=>setQ(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-neutral-500"
              placeholder="Rechercher un appartement"
            />
          </div>
        </div>

        {/* Suggestions */}
        <div className="mt-4 rounded-2xl border border-black/10 bg-white/80 overflow-hidden">
          <div className="px-4 py-3 text-base font-semibold">Où ?</div>
          <div className="px-4 pb-2 text-xs text-neutral-600">Suggestion d’appartement</div>
          <ul className="divide-y divide-black/5">
            {SUGGESTIONS.filter(s=>!q || s.title.toLowerCase().includes(q.toLowerCase())).map((s, i) => (
              <li key={i} className="px-4 py-3 hover:bg-black/[.03] flex items-start gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-neutral-100 border border-black/10">
                  <SIcon name={s.icon} />
                </div>
                <div>
                  <div className="text-sm font-medium text-neutral-900">{s.title}</div>
                  <div className="text-xs text-neutral-600">{s.subtitle}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick rows (Prix / Type d'appartement) */}
        <div className="mt-3 space-y-2">
          {/* Prix */}
          <button type="button" onClick={()=>{setPriceOpen((v)=>!v); setTypeOpen(false);}} className="w-full flex items-center justify-between rounded-2xl border border-black/10 bg-white/80 px-4 h-12">
            <div className="text-sm text-neutral-700">Prix</div>
            <span className="text-sm font-medium text-[#4A9B8E]">{price.min||price.max? `${price.min||0}–${price.max||'∞'} FCFA` : 'Saisir un prix'}</span>
          </button>
          {priceOpen && (
            <div className="rounded-xl border border-black/10 bg-white/90 p-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-neutral-600">Min (FCFA)</label>
                  <input value={price.min} onChange={(e)=>setPrice(p=>({...p,min:e.target.value}))} type="number" className="mt-1 w-full h-10 px-3 rounded-lg border border-black/10 bg-white/95 outline-none" placeholder="ex. 20000" />
                </div>
                <div>
                  <label className="text-xs text-neutral-600">Max (FCFA)</label>
                  <input value={price.max} onChange={(e)=>setPrice(p=>({...p,max:e.target.value}))} type="number" className="mt-1 w-full h-10 px-3 rounded-lg border border-black/10 bg-white/95 outline-none" placeholder="ex. 80000" />
                </div>
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={()=>setPriceOpen(false)} className="chip-glass px-3 py-1.5">OK</button>
              </div>
            </div>
          )}

          {/* Type d'appartement */}
          <button type="button" onClick={()=>{setTypeOpen((v)=>!v); setPriceOpen(false);}} className="w-full flex items-center justify-between rounded-2xl border border-black/10 bg-white/80 px-4 h-12">
            <div className="text-sm text-neutral-700">Type d’appartement</div>
            <span className="text-sm font-medium text-[#4A9B8E]">Choisir un type</span>
          </button>
          {typeOpen && (
            <div className="rounded-xl border border-black/10 bg-white/90 p-3">
              <div className="flex flex-wrap gap-2">
                {TYPES.map((t)=> (
                  <button key={t} className="chip-glass px-3 py-1.5 text-sm">{t}</button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom actions */}
        <div className="h-16" />
      </div>

      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-black/10 bg-white/95 backdrop-blur safe-bottom">
        <div className="max-w-[720px] mx-auto px-3 py-2 flex items-center justify-between gap-3">
          <button className="px-4 h-10 rounded-full border border-black/10 text-sm">Tout effacer</button>
          <button className="px-5 h-11 rounded-full bg-[#4A9B8E] text-white inline-flex items-center gap-2">
            <IconSearch className="w-4 h-4" /> Rechercher
          </button>
        </div>
      </div>
    </div>
  );
}
