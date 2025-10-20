"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import apiService from '@/services/api';

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

// Dynamic categories will be computed from annonces

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
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [catsError, setCatsError] = useState(null);
  const [selectedType, setSelectedType] = useState("");
  // Bottom bar keyboard offset handling
  const bottomBarRef = useRef(null);
  const [kbOffset, setKbOffset] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setEnter(true), 10);
    return () => clearTimeout(t);
  }, []);

  // Keep bottom action bar above the on-screen keyboard on mobile
  useEffect(() => {
    const vv = typeof window !== 'undefined' ? window.visualViewport : null;
    if (!vv) return;
    const update = () => {
      try {
        const offset = Math.max(0, (window.innerHeight - vv.height - vv.offsetTop));
        setKbOffset(offset);
      } catch (_) {}
    };
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    update();
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, []);

  // Load annonces and compute categories dynamically
  useEffect(() => {
    const load = async () => {
      try {
        setLoadingCats(true);
        let res = await apiService.get('/api/annonces');
        const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res?.annonces) ? res.annonces : (Array.isArray(res) ? res : []));
        const counts = list.reduce((acc, a) => {
          const t = (a.type || '').trim();
          if (!t) return acc;
          acc[t] = (acc[t] || 0) + 1;
          return acc;
        }, {});
        // Define a preferred order
        const order = ['Maison','Appartement','Bureau','Villa','Studio','Chambre','Loft','Duplex'];
        const items = Object.entries(counts)
          .filter(([,c]) => c > 0)
          .sort((a,b) => {
            const ai = order.indexOf(a[0]);
            const bi = order.indexOf(b[0]);
            if (ai === -1 && bi === -1) return a[0].localeCompare(b[0]);
            if (ai === -1) return 1;
            if (bi === -1) return -1;
            return ai - bi;
          })
          .map(([name, count]) => ({ name, count }));
        setCategories(items);
        setCatsError(null);
      } catch (e) {
        setCategories([]);
        setCatsError("Impossible de charger les catégories");
      } finally {
        setLoadingCats(false);
      }
    };
    load();
  }, []);

  return (
    <div className="md:hidden min-h-screen vh-stable bg-gradient-to-b from-neutral-50 to-white font-sans font-medium">
      <div className={`max-w-[720px] mx-auto px-3 py-3 transform transition-all duration-250 ${enter ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`} ref={containerRef}>
        {/* Top bar */}
        <div className="flex items-center gap-2">
          <button aria-label="Retour" onClick={() => router.back()} className="w-10 h-10 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center shadow-sm">
            <IconBack />
          </button>
          <div className="flex-1 flex items-center gap-2 rounded-2xl px-3 h-11 bg-[#F5F5F5] shadow-inner">
            <IconSearch className="w-5 h-5 text-neutral-500" />
            <input
              autoFocus
              value={q}
              onChange={(e)=>setQ(e.target.value)}
              className="flex-1 bg-transparent outline-none text-[16px] placeholder:text-neutral-600 placeholder:font-medium"
              placeholder="Rechercher un appartement"
            />
          </div>
        </div>

        {/* Dynamic Categories from annonces */}
        <div className="mt-4 rounded-2xl bg-neutral-50 shadow-sm overflow-hidden">
          <div className="px-4 py-3 text-[22px] leading-7 font-semibold text-neutral-900">Catégories</div>
          <div className="px-4 pb-2 text-[12px] text-neutral-600">Basées sur les annonces existantes</div>
          {catsError && <div className="px-4 pb-3 text-[12px] text-red-600">{catsError}</div>}
          <ul className="space-y-[1px]">
            {loadingCats ? (
              <li className="px-4 py-3 text-[13px] text-neutral-600">Chargement…</li>
            ) : (
              categories
                .filter(c => !q || c.name.toLowerCase().includes(q.toLowerCase()))
                .map((c) => (
                <li key={c.name} className="px-4 py-3 hover:bg-neutral-50 flex items-start gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-neutral-100">
                    {c.name === 'Appartement' || c.name === 'Bureau' ? (
                      <SIcon name="landmark" />
                    ) : c.name === 'Maison' || c.name === 'Villa' ? (
                      <SIcon name="nearby" />
                    ) : c.name === 'Studio' || c.name === 'Chambre' ? (
                      <SIcon name="mosque" />
                    ) : (
                      <SIcon name="world" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-semibold text-neutral-900">{c.name}</div>
                    <div className="text-[12px] text-neutral-700">{c.count} annonce{c.count>1?'s':''}</div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedType(c.name);
                      router.push(`/clients?type=${encodeURIComponent(c.name)}`)
                    }}
                    className="ml-auto px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-[12px] font-medium shadow-sm"
                  >
                    Voir
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Quick rows (Prix / Type d'appartement) */}
        <div className="mt-3 space-y-2">
          {/* Prix */}
          <button type="button" onClick={()=>{setPriceOpen((v)=>!v); setTypeOpen(false);}} className="w-full flex items-center justify-between rounded-2xl bg-neutral-50 shadow-sm px-4 h-12">
            <div className="text-[15px] text-neutral-700">Prix</div>
            <span className="text-[15px] font-semibold text-[#4A9B8E]">{price.min||price.max? `${price.min||0}–${price.max||'∞'} FCFA` : 'Saisir un prix'}</span>
          </button>
          {priceOpen && (
            <div className="rounded-xl bg-neutral-50 shadow-sm p-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-neutral-600">Min (FCFA)</label>
                  <input value={price.min} onChange={(e)=>setPrice(p=>({...p,min:e.target.value}))} type="number" className="mt-1 w-full h-10 px-3 rounded-lg bg-[#F5F5F5] outline-none shadow-inner focus:bg-[#EDEDED]" placeholder="ex. 20000" />
                </div>
                <div>
                  <label className="text-xs text-neutral-600">Max (FCFA)</label>
                  <input value={price.max} onChange={(e)=>setPrice(p=>({...p,max:e.target.value}))} type="number" className="mt-1 w-full h-10 px-3 rounded-lg bg-[#F5F5F5] outline-none shadow-inner focus:bg-[#EDEDED]" placeholder="ex. 80000" />
                </div>
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={()=>setPriceOpen(false)} className="px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 shadow-sm">OK</button>
              </div>
            </div>
          )}

          {/* Type d'appartement */}
          <button type="button" onClick={()=>{setTypeOpen((v)=>!v); setPriceOpen(false);}} className="w-full flex items-center justify-between rounded-2xl bg-neutral-50 shadow-sm px-4 h-12">
            <div className="text-[15px] text-neutral-700">Type d’appartement</div>
            <span className="text-[15px] font-semibold text-[#4A9B8E]">{selectedType || 'Choisir un type'}</span>
          </button>
          {typeOpen && (
            <div className="rounded-xl bg-neutral-50 shadow-sm p-3">
              <div className="flex flex-wrap gap-2">
                {(categories.length ? categories.map(c=>c.name) : TYPES).map((t)=> (
                  <button 
                    key={t} 
                    onClick={()=>{ setSelectedType(t); setTypeOpen(false); }} 
                    className={`px-3 py-1.5 text-[15px] font-medium rounded-full shadow-sm ${selectedType===t ? 'bg-neutral-300 text-neutral-900' : 'bg-neutral-100 hover:bg-neutral-200'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom actions */}
        <div className="h-16" />
      </div>

      <div ref={bottomBarRef} style={{ bottom: kbOffset }} className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-neutral-50 backdrop-blur shadow-[0_-6px_16px_rgba(0,0,0,0.06)] safe-bottom">
        <div className="max-w-[720px] mx-auto px-3 py-2 flex items-center justify-between gap-3 text-[13px] font-medium">
          <button 
            className="px-4 h-11 rounded-full bg-neutral-100 text-neutral-900 hover:bg-neutral-200 shadow-sm"
            onClick={() => {
              setSelectedType("");
              setPrice({ min: "", max: "" });
              setQ("");
              setPriceOpen(false);
              setTypeOpen(false);
              router.push('/clients');
            }}
          >
            Tout effacer
          </button>
          <button 
            className="px-5 h-11 rounded-full bg-neutral-800 text-white inline-flex items-center gap-2 hover:bg-neutral-700 shadow-sm"
            onClick={() => {
              const params = new URLSearchParams();
              if (selectedType) params.set('type', selectedType);
              if (price.min) params.set('prixMin', String(price.min));
              if (price.max) params.set('prixMax', String(price.max));
              if (q) params.set('q', q);
              const qs = params.toString();
              const url = qs ? `/clients?${qs}` : '/clients';
              router.push(url);
            }}
          >
            <IconSearch className="w-5 h-5" /> Rechercher
          </button>
        </div>
      </div>
    </div>
  );
}
