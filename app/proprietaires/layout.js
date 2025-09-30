"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function IconHome({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 10v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-9" />
      <path d="M9 21v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6" />
    </svg>
  );
}

function IconList({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M8 6h13M8 12h13M8 18h13" />
      <path d="M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}

function IconPlus({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function IconChat({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3 1.5-4.5A4 4 0 0 1 4 15V7a4 4 0 0 1 4-4h9a4 4 0 0 1 4 4z" />
    </svg>
  );
}

function IconWallet({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M3 7h18v10H3z" />
      <path d="M16 12h3" />
      <path d="M3 7l13-3v6" />
    </svg>
  );
}

function IconUser({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-3.5 3.5-6 8-6s8 2.5 8 6" />
    </svg>
  );
}

function IconMenu({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}

export default function ProprietairesLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!pathname) return;
    const isAuthPage = pathname.startsWith("/proprietaires/connexion") || pathname.startsWith("/proprietaires/inscription");
    if (isAuthPage) return;
    // Utiliser les clés dédiées propriétaire
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token_owner') : null;
    if (!token) {
      const hasOwnerUser = typeof window !== 'undefined' ? localStorage.getItem('userData_owner') : null;
      if (hasOwnerUser) router.replace('/proprietaires/connexion');
      else router.replace('/proprietaires/inscription');
    }
  }, [pathname, router]);
  const isAuthPage = pathname && (pathname.startsWith("/proprietaires/connexion") || pathname.startsWith("/proprietaires/inscription"));

  const [toast, setToast] = useState("");
  const [showLogout, setShowLogout] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [unreadTotal, setUnreadTotal] = useState(0);

  useEffect(() => {
    // Afficher le bouton déconnexion si token propriétaire présent
    setShowLogout(!!localStorage.getItem("auth_token_owner"));
    if (window.location.hash === "#loggedin") {
      setToast("Connexion réussie !");
      setTimeout(()=>setToast(""), 3000);
      window.location.hash = "";
    }
    setMounted(true);
  }, [pathname]);

  useEffect(() => {
    async function fetchUnread() {
      try {
        const API = (await import("@/services/api")).default;
        const res = await API.get('/api/threads/unread-count');
        setUnreadTotal(res?.count || 0);
      } catch {}
    }
    if (mounted && !isAuthPage) {
      fetchUnread();
      const interval = setInterval(fetchUnread, 30000);
      const onVis = () => { if (!document.hidden) fetchUnread(); };
      document.addEventListener('visibilitychange', onVis);
      return () => { clearInterval(interval); document.removeEventListener('visibilitychange', onVis); };
    }
  }, [mounted, isAuthPage]);

  const handleLogout = () => {
    localStorage.removeItem("auth_token_owner");
    localStorage.removeItem("userData_owner");
    setToast("Déconnexion réussie !");
    setShowLogout(false);
    setTimeout(() => {
      setToast("");
      router.push("/proprietaires/connexion");
    }, 1500);
  };

  return (
    <div className="min-h-screen vh-stable bg-gradient-to-b from-neutral-50 to-white text-neutral-900">
      {!isAuthPage && (
        <header className="sticky top-0 z-40 border-b border-black/10 backdrop-blur bg-white/70">
          <div className="max-w-[1200px] mx-auto px-4 py-3 flex items-center gap-3 relative">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#4A9B8E] text-white text-[12px] font-bold">M</span>
              <span className="font-semibold">Espace Propriétaire</span>
            </div>
            <nav className="ml-auto hidden sm:flex items-center gap-4 text-sm">
              <a className="chip-glass px-3 py-1.5" href="/proprietaires">Dashboard</a>
              <a className="chip-glass px-3 py-1.5" href="/proprietaires/annonces">Annonces</a>
              <a className="chip-glass px-3 py-1.5" href="/proprietaires/nouvelle">Publier</a>
              <a className="chip-glass px-3 py-1.5" href="/proprietaires/messages">Messages {unreadTotal > 0 && (<span className="inline-flex items-center justify-center min-w-5 h-5 px-1 ml-1 rounded-full bg-red-600 text-white text-[10px]">{unreadTotal}</span>)}</a>
              <a className="chip-glass px-3 py-1.5" href="/proprietaires/paiements">Paiements</a>
              <a className="chip-glass px-3 py-1.5" href="/proprietaires/profil">Profil</a>
              {showLogout && (
                <button onClick={handleLogout} className="chip-glass px-3 py-1.5 border border-[red] text-[red] bg-white hover:bg-[#e6f4f1] font-medium ml-2">Déconnexion</button>
              )}
            </nav>
            {/* Mobile hamburger (render after mount to avoid hydration mismatch) */}
            {mounted && (
              <button onClick={()=>setMobileOpen(v=>!v)} className="ml-auto sm:hidden inline-flex items-center justify-center w-10 h-10 rounded-full border border-black/10 bg-white/90" aria-label="Menu">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6" aria-hidden>
                  <path d="M3 6h18M3 12h18M3 18h18" />
                </svg>
              </button>
            )}
            {/* Mobile dropdown */}
            {mounted && mobileOpen && (
              <div className="sm:hidden absolute right-4 top-full mt-2 w-56 rounded-2xl border border-black/10 bg-white/95 shadow-[0_16px_32px_rgba(0,0,0,0.12)] backdrop-blur overflow-hidden">
                <div className="py-2 grid gap-1 text-sm">
                  <a className="px-3 py-2 rounded-lg hover:bg-black/[.04] flex items-center gap-2" href="/proprietaires" onClick={()=>setMobileOpen(false)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden>
                      <path d="M3 10.5 12 3l9 7.5" />
                      <path d="M5 10v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-9" />
                      <path d="M9 21v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6" />
                    </svg>
                    <span>Dashboard</span>
                  </a>
                  <a className="px-3 py-2 rounded-lg hover:bg黒/[.04] flex items-center gap-2" href="/proprietaires/annonces" onClick={()=>setMobileOpen(false)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden>
                      <path d="M8 6h13M8 12h13M8 18h13" />
                      <path d="M3 6h.01M3 12h.01M3 18h.01" />
                    </svg>
                    <span>Annonces</span>
                  </a>
                  <a className="px-3 py-2 rounded-lg hover:bg-black/[.04] flex items-center gap-2" href="/proprietaires/nouvelle" onClick={()=>setMobileOpen(false)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden>
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    <span>Publier</span>
                  </a>
                  <a className="px-3 py-2 rounded-lg hover:bg-black/[.04] flex items-center gap-2" href="/proprietaires/messages" onClick={()=>setMobileOpen(false)}>
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3 1.5-4.5A4 4 0 0 1 4 15V7a4 4 0 0 1 4-4h9a4 4 0 0 1 4 4z"/></svg>
                    <span className="flex items-center gap-2">Messages {unreadTotal > 0 && (<span className="inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[10px]">{unreadTotal}</span>)}</span>
                  </a>
                  <a className="px-3 py-2 rounded-lg hover:bg-black/[.04] flex items-center gap-2" href="/proprietaires/paiements" onClick={()=>setMobileOpen(false)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden>
                      <path d="M3 7h18v10H3z" />
                      <path d="M16 12h3" />
                      <path d="M3 7l13-3v6" />
                    </svg>
                    <span>Paiements</span>
                  </a>
                  <a className="px-3 py-2 rounded-lg hover:bg-black/[.04] flex items-center gap-2" href="/proprietaires/profil" onClick={()=>setMobileOpen(false)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden>
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 21c0-3.5 3.5-6 8-6s8 2.5 8 6" />
                    </svg>
                    <span>Profil</span>
                  </a>
                  {showLogout && (
                    <button onClick={()=>{ setMobileOpen(false); handleLogout(); }} className="mx-3 my-1 px-3 py-2 rounded-lg hover:bg-black/[.04] text-left border border-[red]/30 text-[red]">Déconnexion</button>
                  )}
                </div>
              </div>
            )}
          </div>
        </header>
      )}
      <main className={`max-w-[1200px] mx-auto px-4 py-6 ${!isAuthPage ? 'pb-28' : ''}`}>{children}</main>
      {!isAuthPage && (
        <nav className="fixed bottom-0 inset-x-0 z-40 sm:hidden border-t border-black/10 bg-white/90 backdrop-blur safe-bottom">
          <div className="max-w-[1200px] mx-auto grid grid-cols-5 text-sm py-3">
            <a className="flex items-center justify-center text-[#4A9B8E]" href="/proprietaires" aria-label="Tableau de bord">
              <IconHome className="w-7 h-7" />
            </a>
            <a className="flex items-center justify-center" href="/proprietaires/annonces" aria-label="Annonces">
              <IconList className="w-7 h-7" />
            </a>
            <a className="flex items-center justify-center" href="/proprietaires/nouvelle" aria-label="Publier">
              <IconPlus className="w-7 h-7" />
            </a>
            <a className="flex items-center justify-center" href="/proprietaires/messages" aria-label="Messages">
              <IconChat className="w-7 h-7" />
            </a>
            <a className="flex items-center justify-center" href="/proprietaires/paiements" aria-label="Paiements">
              <IconWallet className="w-7 h-7" />
            </a>
          </div>
        </nav>
      )}
      {toast && <Toast message={toast} />}
    </div>
  );
}

function Toast({ message }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#4A9B8E] text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-fade-in">
      {message}
    </div>
  );
}
