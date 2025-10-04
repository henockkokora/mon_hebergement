"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import apiService from "@/services/api";

function withApiUrl(url) {
  if (!url) return url;
  const s = typeof url === 'string' ? url : (url.url || '');
  if (!s) return s;
  if (s.startsWith('http')) return s;
  const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/$/, '');
  return s.startsWith('/') ? `${base}${s}` : `${base}/${s}`;
}

function FavoriteCard({ item, onRemoved }) {
  const [removing, setRemoving] = useState(false);
  const id = item._id || item.id;
  const title = item.titre || item.title || "Sans titre";
  const subtitle = `${item.type || ""}${item.ville ? " · " + item.ville : ""}`;
  const price = item.prixParNuit ?? item.prix ?? 0;
  const image = Array.isArray(item.photos) ? item.photos[0] : item.image || null;

  return (
    <a href={`/clients/annonce/${id}`} className="group block">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-neutral-50 shadow-sm">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={withApiUrl(typeof image === 'string' ? image : image?.url)} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full grid place-items-center text-neutral-400 text-[13px]">Aucune image</div>
        )}
        <button
          className={`absolute top-2 right-2 w-9 h-9 rounded-full bg-white shadow text-[16px] flex items-center justify-center transition-colors ${removing ? 'opacity-50 cursor-not-allowed' : 'hover:text-red-500'}`}
          aria-label="Retirer des favoris"
          onClick={async (e) => {
            e.preventDefault();
            if (removing) return;
            try {
              setRemoving(true);
              await apiService.removeFavorite(id);
              onRemoved?.(id);
            } catch (err) {
              alert(err?.message || "Impossible de retirer des favoris");
            } finally {
              setRemoving(false);
            }
          }}
          disabled={removing}
        >
          {removing ? <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" /> : '❤️'}
        </button>
      </div>
      <div className="mt-2 space-y-0.5">
        <div className="flex items-center justify-between">
          <div className="text-[15px] font-semibold text-neutral-900 truncate">{title}</div>
        </div>
        <div className="text-[13px] text-neutral-700 truncate">{subtitle}</div>
        <div className="text-[15px] text-neutral-900"><span className="font-semibold">{price?.toLocaleString?.() || price} FCFA</span> <span className="text-neutral-700">/mois</span></div>
      </div>
    </a>
  );
}

export default function ClientsFavorisPage() {
  const [ready, setReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const router = useRouter ? useRouter() : null;
  const [loadingTab, setLoadingTab] = useState('');
  const favBtnRef = useRef(null);
  const homeBtnRef = useRef(null);
  const [flyHeart, setFlyHeart] = useState(false);
  const [flyHome, setFlyHome] = useState(false);
  const [flyStyle, setFlyStyle] = useState({ top: 0, left: 0, transform: 'translate(0,0) scale(1)' });
  const [useHeartLoader, setUseHeartLoader] = useState(true);
  const go = (key, href) => {
    setLoadingTab(key);
    try {
      const path = typeof window !== 'undefined' ? window.location.pathname : '';
      // Si on est déjà sur /clients/favoris, on joue l'animation sans navigation
      if (key === 'fav' && path === '/clients/favoris') {
        // Déclenche l'animation de l'icône coeur vers le centre (loader)
        const rect = favBtnRef.current?.getBoundingClientRect();
        const startX = rect ? rect.left + rect.width / 2 : window.innerWidth - 40;
        const startY = rect ? rect.top + rect.height / 2 : window.innerHeight - 40;
        const targetX = window.innerWidth / 2;
        const targetY = window.innerHeight / 2;
        setFlyStyle({ top: startY, left: startX, transform: 'translate(-50%, -50%) scale(1)' });
        setFlyHeart(true);
        // laisser le temps au rendu, puis animer vers le centre
        requestAnimationFrame(() => {
          setFlyStyle({ top: targetY, left: targetX, transform: 'translate(-50%, -50%) scale(1.4)' });
        });
        // activer le loader coeur et cacher l'animation volante
        setTimeout(() => { setUseHeartLoader(true); setFlyHeart(false); }, 500);
        return;
      }
      // Depuis Favoris vers Explorer: animer la maison avant navigation
      if (key === 'home') {
        const rect = homeBtnRef.current?.getBoundingClientRect();
        const startX = rect ? rect.left + rect.width / 2 : window.innerWidth - 40;
        const startY = rect ? rect.top + rect.height / 2 : window.innerHeight - 40;
        const targetX = window.innerWidth / 2;
        const targetY = window.innerHeight / 2;
        setFlyStyle({ top: startY, left: startX, transform: 'translate(-50%, -50%) scale(1)' });
        setFlyHome(true);
        requestAnimationFrame(() => {
          setFlyStyle({ top: targetY, left: targetX, transform: 'translate(-50%, -50%) scale(1.4)' });
        });
        setTimeout(() => { if (router) router.push(href); else window.location.href = href; setFlyHome(false); }, 500);
        return;
      }
    } catch {}
    if (router) router.push(href); else window.location.href = href;
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('auth_token');
    setIsLoggedIn(!!token);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const res = await apiService.getFavorites();
        const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        setItems(list);
      } catch (e) {
        setError(e?.message || "Erreur lors du chargement des favoris");
      } finally {
        setLoading(false);
      }
    })();
  }, [isLoggedIn]);

  if (!ready) return null;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-neutral-50 font-sans font-medium">
        <main className="max-w-[1200px] mx-auto px-4 py-6 pb-24">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-[22px] leading-7 md:text-xl font-semibold text-neutral-900">Mes Favoris</h1>
            <a href="/clients" className="px-3 py-1.5 text-[13px] font-medium rounded-full bg-neutral-100 text-neutral-900 shadow-sm transition-colors hover:bg-neutral-200">Explorer</a>
          </div>
          <div className="rounded-2xl bg-neutral-50 shadow-sm p-6 text-center">
            <p className="text-[13px] text-neutral-700 mb-3">Connectez-vous pour voir vos favoris.</p>
            <a href="/clients/connexion" className="inline-flex items-center h-10 px-5 rounded-full bg-neutral-800 text-white font-semibold shadow-sm transition-colors hover:bg-neutral-700">Se connecter</a>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 font-sans font-medium">
      <main className="max-w-[1200px] mx-auto px-4 py-6 pb-24 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] leading-7 md:text-xl font-semibold text-neutral-900">Mes Favoris</h1>
          <a href="/clients" className="px-3 py-1.5 text-[13px] font-medium rounded-full bg-neutral-100 text-neutral-900 shadow-sm transition-colors hover:bg-neutral-200">Explorer</a>
        </div>

        {loading && (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="relative h-16 w-16 mx-auto mb-2">
                <svg className="absolute inset-0 w-12 h-12 m-2 text-neutral-800 house-bounce" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-8.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
                </svg>
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-10 h-2 rounded-full bg-neutral-300/60 house-shadow" />
              </div>
              <p className="text-gray-600">Chargement de vos favoris...</p>
              <style jsx>{`
                @keyframes house-bounce {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(-10px); }
                }
                @keyframes shadow-pulse {
                  0%, 100% { transform: translateX(-50%) scaleX(1); opacity: .6; }
                  50% { transform: translateX(-50%) scaleX(.85); opacity: .4; }
                }
                .house-bounce { animation: house-bounce 0.6s ease-in-out infinite; }
                .house-shadow { animation: shadow-pulse 0.6s ease-in-out infinite; }
              `}</style>
            </div>
          </div>
        )}
        {error && (
          <div className="text-center text-red-600 font-semibold p-3">{error}</div>
        )}

        {!loading && !error && (
          items.length === 0 ? (
            <div className="rounded-2xl bg-neutral-50 shadow-sm p-6 text-center">
              <p className="text-[13px] text-neutral-700 mb-3">Vous n'avez pas encore de favoris.</p>
              <a href="/clients" className="inline-flex items-center h-10 px-5 rounded-full bg-neutral-800 text-white font-semibold shadow-sm transition-colors hover:bg-neutral-700">Parcourir les annonces</a>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {items.map((it) => (
                <FavoriteCard key={it._id || it.id} item={it} onRemoved={(rid) => setItems((arr) => arr.filter(x => (x._id||x.id) !== rid))} />
              ))}
            </div>
          )
        )}
      </main>
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/85 backdrop-blur shadow-[0_-6px_16px_rgba(0,0,0,0.06)]">
        <div className="max-w-[1200px] mx-auto px-6 py-2 grid grid-cols-3 gap-2 text-[13px] font-medium">
          <button onClick={()=>go('home','/clients')} className="flex flex-col items-center justify-center py-1 text-neutral-600">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`w-6 h-6 transition-transform ${loadingTab==='home' ? 'scale-125 animate-pulse' : ''}`} aria-hidden>
              <path d="M3 10.5 12 3l9 7.5" />
              <path d="M5 10v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-9" />
              <path d="M9 21v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6" />
            </svg>
            <span className={`${loadingTab==='home' ? 'animate-pulse' : ''}`}>Explorer</span>
          </button>
          <button ref={favBtnRef} onClick={()=>go('fav','/clients/favoris')} className="flex flex-col items-center justify-center py-1 text-[#4A9B8E]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`w-6 h-6 transition-transform ${loadingTab==='fav' ? 'scale-125 animate-pulse' : ''}`} aria-hidden>
              <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-8.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
            </svg>
            <span className={`${loadingTab==='fav' ? 'animate-pulse' : ''}`}>Favoris</span>
          </button>
          <button onClick={()=>go('profile','/clients/profil')} className="flex flex-col items-center justify-center py-1 text-neutral-600">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`w-6 h-6 transition-transform ${loadingTab==='profile' ? 'scale-125 animate-pulse' : ''}`} aria-hidden>
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-3.5 3.5-6 8-6s8 2.5 8 6" />
            </svg>
            <span className={`${loadingTab==='profile' ? 'animate-pulse' : ''}`}>Profil</span>
          </button>
        </div>
      </nav>

      {/* Icône coeur volante vers le loader */}
      {flyHeart && (
        <div className="fixed z-50 pointer-events-none" style={{ top: flyStyle.top, left: flyStyle.left, transform: flyStyle.transform, transition: 'transform 0.5s ease, top 0.5s ease, left 0.5s ease' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-neutral-800" aria-hidden>
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-8.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
          </svg>
        </div>
      )}
    </div>
  );
}
