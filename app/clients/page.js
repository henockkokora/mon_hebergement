"use client";

import { useRef, useState, useEffect, useLayoutEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import CloudinaryImage from "../components/CloudinaryImage";

// Titre unique pour la section des annonces récentes
const sections = [
  { title: "Récemment ajoutés", count: 10 },
];

import apiService from '@/services/api';

// ...

// listings supprimé, remplacé par l'état dynamique


// --- Icons (SVG) ---
function IconHome({ className = "w-4 h-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 10v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-9" />
      <path d="M9 21v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6" />
    </svg>
  );
}

// Fixed bottom navigation for mobile
function IconHeart({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-8.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  );
}

function MobileTabBar({ isLoggedIn }) {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/85 backdrop-blur border-t border-black/10">
      <div className="max-w-[1200px] mx-auto px-6 py-2 grid grid-cols-3 gap-2 text-xs">
        <a href="#" className="flex flex-col items-center justify-center py-1 text-[#4A9B8E]">
          <IconHome className="w-5 h-5" />
          <span>Explorer</span>
        </a>
        <a href="#" className="flex flex-col items-center justify-center py-1 text-neutral-600">
          <IconHeart className="w-5 h-5" />
          <span>Favoris</span>
        </a>
        {isLoggedIn ? (
          <a href="/clients/profil" className="flex flex-col items-center justify-center py-1 text-neutral-600">
            <IconUser className="w-5 h-5" />
            <span>Profil</span>
          </a>
        ) : (
          <a href="/clients/connexion" className="flex flex-col items-center justify-center py-1 text-neutral-600">
            <IconUser className="w-5 h-5" />
            <span>Connexion</span>
          </a>
        )}
      </div>
    </nav>
  );
}

function IconSearch({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-3.8-3.8" />
    </svg>
  );
}

function IconBalloon({ className = "w-4 h-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M12 2c4 0 7 3 7 6.5S15 16 12 16 5 12.5 5 8.5 8 2 12 2Z" />
      <path d="M12 16c0 2-1 4-3 5" />
    </svg>
  );
}

function IconBell({ className = "w-4 h-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 2 7 2 9H4c0-2 2-2 2-9Z" />
      <path d="M9 21a3 3 0 0 0 6 0" />
    </svg>
  );
}

function IconGlobe({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M2 12h20" />
      <path d="M12 3a15.3 15.3 0 0 1 0 18" />
      <path d="M12 3a15.3 15.3 0 0 0 0 18" />
    </svg>
  );
}

function IconMenu({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}

function IconUser({ className = "w-4 h-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-3.5 3.5-6 8-6s8 2.5 8 6" />
    </svg>
  );
}

function IconUserPlus({ className = "w-4 h-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <circle cx="9" cy="8" r="4" />
      <path d="M1 21c0-3.5 3.5-6 8-6" />
      <path d="M15 8h6M18 5v6" />
    </svg>
  );
}

function Header({ 
  isLoggedIn, 
  setIsLoggedIn, 
  categories = [], 
  loadingAnnonces, 
  errorAnnonces,
  selectedCategory,
  onSelectCategory,
  quartiersVilles = [],
  selectedQuartierVille = 'Tous',
  onSelectQuartierVille = () => {},
  types = [],
  selectedType = 'Tous',
  onSelectType = () => {},
  selectedDate,
  onDateSelect,
  showCalendar,
  setShowCalendar,
  currentMonth,
  currentYear,
  setCurrentMonth,
  setCurrentYear,
  calendarRef,
  supportModalOpen,
  setSupportModalOpen,
  supportName,
  setSupportName,
  supportEmail,
  setSupportEmail,
  supportPhone,
  setSupportPhone,
  supportMessage,
  setSupportMessage,
  supportLoading,
  supportFeedback,
  handleSupportSubmit
}) {
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Récupérer le nombre de messages non lus
  useEffect(() => {
    if (!isLoggedIn) return;
    
    const fetchUnreadCount = async () => {
      try {
        console.log('Fetching unread count...');
        const API = (await import('@/services/api')).default;
        
        // Vérifier si l'utilisateur est connecté avant de faire la requête
        const token = localStorage.getItem('auth_token');
        if (!token) {
          console.log('No auth token found, skipping unread count fetch');
          return;
        }
        
        const res = await API.get('/api/threads/unread-by-thread');
        
        if (res && res.success) {
          console.log('Unread count:', res.count);
          // Calculer le total des messages non lus à partir de la réponse
          const totalUnread = Object.values(res.data || {}).reduce((sum, count) => sum + count, 0);
          setUnreadCount(totalUnread);
        } else {
          console.error('Invalid response format:', res);
          setUnreadCount(0); // Réinitialiser à 0 en cas d'erreur
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des messages non lus:', error);
      }
    };
    
    // Ne lancer le chargement que si l'utilisateur est connecté
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (token) {
      // Récupérer immédiatement
      fetchUnreadCount();
      
      // Mettre à jour toutes les minutes
      const interval = setInterval(fetchUnreadCount, 60000);
      
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const [destOpen, setDestOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const containerRef = useRef(null);
  const destInputRef = useRef(null);
  const dateInputRef = useRef(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth()); // 0-11
  const [activeSeg, setActiveSeg] = useState("zone"); // 'zone' | 'date' | 'type'
  const barRef = useRef(null);
  const segZoneRef = useRef(null);
  const segDateRef = useRef(null);
  const segTypeRef = useRef(null);
  const [slider, setSlider] = useState({ left: 0, width: 0, height: 0 });

  useEffect(() => {
    function onDocMouseDown(e) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) {
        setDestOpen(false);
        setDateOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  // Recalculate slider position
  useLayoutEffect(() => {
    function recalc() {
      if (!barRef.current) return;
      const barRect = barRef.current.getBoundingClientRect();
      let target = segZoneRef.current;
      if (activeSeg === "date") target = segDateRef.current;
      if (activeSeg === "type") target = segTypeRef.current;
      if (!target) return;
      const r = target.getBoundingClientRect();
      setSlider({ left: r.left - barRect.left, width: r.width, height: r.height });
    }
    recalc();
    window.addEventListener("resize", recalc);
    return () => window.removeEventListener("resize", recalc);
  }, [activeSeg]);

  // Créer la liste des suggestions de types
  const typeSuggestions = [
    { icon: "🏠", title: "Tous les types", value: "Tous" },
    ...types.map(type => ({
      icon: type === 'Appartement' ? '🏢' : '🏠',
      title: type,
      value: type
    }))
  ];

  // Créer la liste des suggestions de zones
  const quartierSuggestions = [
    {
      icon: "🌍",
      title: "Tous les quartiers",
      subtitle: "Afficher tous les quartiers",
      value: "Tous"
    },
    ...quartiersVilles.map(({ quartier, ville }) => ({
      icon: "📍",
      title: `${quartier}, ${ville}`,
      subtitle: `${quartier} à ${ville}`,
      value: `${quartier}|||${ville}`
    }))
  ];
  return (
    <header className="sticky top-0 z-40 bg-gradient-to-b from-neutral-50 to-white backdrop-blur supports-[backdrop-filter]:backdrop-blur-md border-b border-black/10">
      {/* Top bar with brand, nav and actions */}
      <div className="max-w-[1200px] mx-auto px-4 py-3 flex items-center gap-6">
        {/* Brand + Support */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#4A9B8E] text-white text-[12px] font-bold">M</span>
          <span className="font-semibold">Mon Hebergement</span>
        </div>
        {/* Mobile hamburger */}
        <div className="md:hidden ml-auto relative">
          <button aria-label="Menu" onClick={()=>setMenuOpen(v=>!v)} className="w-10 h-10 rounded-full border border-black/10 bg-white flex items-center justify-center">
            <IconMenu />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-black/10 bg-white/95 shadow-[0_16px_32px_rgba(0,0,0,0.12)] backdrop-blur overflow-hidden z-50">
              <div className="py-1 text-sm">
                {isLoggedIn ? (
                  <>
                    <a href="/clients/profil" onClick={()=>setMenuOpen(false)} className="block px-4 py-3 hover:bg-black/[.04]">Mon compte</a>
                    <a href="/clients/parametres" onClick={()=>setMenuOpen(false)} className="block px-4 py-3 hover:bg-black/[.04]">Paramètres</a>
                    <button onClick={() => {
                      // Supprimer les données d'authentification
                      localStorage.removeItem('auth_token');
                      localStorage.removeItem('auth_user');
                      
                      // Mettre à jour l'état local
                      setIsLoggedIn(false);
                      setMenuOpen(false);
                      
                      // Déclencher un événement personnalisé pour informer les autres onglets
                      window.dispatchEvent(new Event('storage'));
                      
                      // Recharger la page pour s'assurer que tout est synchronisé
                      window.location.href = '/clients';
                    }} className="w-full text-left px-4 py-3 hover:bg-black/[.04] text-red-600">Se déconnecter</button>
                  </>
                ) : (
                  <>
                    <a href="/clients/connexion" onClick={()=>setMenuOpen(false)} className="block px-4 py-3 hover:bg-black/[.04]">Se connecter</a>
                    <a href="/clients/inscription" onClick={()=>setMenuOpen(false)} className="block px-4 py-3 hover:bg-black/[.04]">Créer un compte</a>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
        {/* Center nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-700 mx-auto">
          <a href="#" className="flex items-center gap-2 relative pb-2">
            <IconHome className="w-4 h-4" />
            <span className="font-medium">Logements</span>
            <span className="absolute left-0 right-0 -bottom-[9px] mx-auto h-[2px] w-10 bg-neutral-800 rounded-full" />
          </a>
          {isLoggedIn ? (
            <>
              <div className="relative inline-block">
                <a href="/clients/messages" className="flex items-center gap-2 pb-2 relative">
                  <div className="relative">
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3 1.5-4.5A4 4 0 0 1 4 15V7a4 4 0 0 1 4-4h9a4 4 0 0 1 4 4z"/>
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </div>
                  <span className="font-medium">Messagerie</span>
                </a>
              </div>
              <a href="/clients/profil" className="flex items-center gap-2 pb-2">
                <IconUser className="w-4 h-4" />
                <span className="font-medium">Mon compte</span>
              </a>
            </>
          ) : (
            <>
              <a href="/clients/inscription" className="flex items-center gap-2 pb-2">
                <IconUserPlus className="w-4 h-4" />
                <span className="font-medium">S'inscrire</span>
              </a>
              <a href="/clients/connexion" className="flex items-center gap-2 pb-2">
                <IconUser className="w-4 h-4" />
                <span className="font-medium">Se connecter</span>
              </a>
            </>
          )}
        </nav>
        {/* Right actions */}
        <div className="flex items-center gap-3 text-sm text-neutral-700">
          <button
            type="button"
            aria-label="Contacter le support"
            className="flex items-center justify-center rounded-full border border-black/10 bg-white text-[#24766A] hover:bg-[#e7f6f3] transition-all font-semibold px-4 h-9 whitespace-nowrap"
            onClick={() => {
              if (!isLoggedIn) {
                window.location.href = '/clients/connexion';
                return;
              }
              setSupportModalOpen(true);
            }}
          >
            <svg className="w-5 h-5 min-w-[20px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-1c0-1.1.9-2 2-2s2-.9 2-2-1-2-2-2-2 .9-2 2"/><circle cx="12" cy="18" r="1.2"/></svg>
            <span className="hidden lg:inline ml-2 text-[15px]">Contacter le support</span>
          </button>
          {/* Modal Support */}
          {supportModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 min-h-screen py-8">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[420px] mx-4 p-6 relative my-auto">
                <button
                  className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 transition-colors"
                  onClick={() => setSupportModalOpen(false)}
                  aria-label="Fermer"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 6l12 12M6 18L18 6"/></svg>
                </button>
                <h2 className="text-2xl font-bold mb-5 text-[#24766A]">Message</h2>
                <form onSubmit={handleSupportSubmit} className="space-y-4">
                  <div>
                    <textarea 
                      className="w-full border border-neutral-300 rounded-lg px-4 py-3 min-h-[120px] focus:ring-2 focus:ring-[#4A9B8E] focus:border-transparent outline-none resize-none text-base" 
                      placeholder="Écrivez votre message ou plainte ici..." 
                      required 
                      value={supportMessage} 
                      onChange={e=>setSupportMessage(e.target.value)} 
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="w-full bg-[#24766A] text-white rounded-lg py-3 font-semibold hover:bg-[#1b5e4e] transition-all text-base shadow-md" 
                    disabled={supportLoading}
                  >
                    {supportLoading ? 'Envoi en cours...' : 'Envoyer'}
                  </button>
                  {supportFeedback && (
                    <div className={`flex items-center justify-center gap-2 mt-3 p-3 rounded-lg ${supportFeedback.type==='success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {supportFeedback.type === 'success' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                      )}
                      <span className="text-sm font-medium">{supportFeedback.message}</span>
                    </div>
                  )}
                </form>
              </div>
            </div>
          )}

          {isLoggedIn ? (
            <button 
              onClick={() => {
                // Afficher une notification de déconnexion
                if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                  new window.Notification('Déconnexion réussie', {
                    body: 'Vous avez été déconnecté avec succès',
                    icon: '/icon.png'
                  });
                }
                
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_user');
                setIsLoggedIn(false);
                window.dispatchEvent(new Event('storage'));
                window.location.href = '/clients';
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-red-500 bg-white text-red-600 hover:bg-red-50 transition-colors"
              title="Se déconnecter"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span>Déconnexion</span>
            </button>
          ) : null}
        </div>
      </div>
      {/* Mobile simple search bar */}
      <div className="block md:hidden pb-3">
        <div className="max-w-[1100px] mx-auto px-4">
          <div className="flex items-center gap-2 rounded-full border border-black/10 bg-white/80 shadow-[0_8px_20px_rgba(0,0,0,0.06)] px-3 py-2" onClick={() => router.push('/clients/recherche')}>
            <IconSearch className="w-5 h-5 text-neutral-500" />
            <input
              type="text"
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-neutral-500"
              placeholder="Rechercher votre appartement"
              readOnly
              onFocus={() => router.push('/clients/recherche')}
            />
            <button aria-label="Rechercher" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#4A9B8E] text-white">
              <IconSearch className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Large segmented search bar (desktop/tablette) */}
      <div className="hidden md:block pb-3">
        <div className="max-w-[1100px] mx-auto px-4 pb-5 relative" ref={containerRef}>
          <div ref={barRef} className="rounded-full border border-black/10 bg-white/70 shadow-[0_12px_28px_rgba(0,0,0,0.08)] overflow-hidden flex items-stretch relative">
            {/* Sliding glass highlight */}
            <div
              className="absolute top-1 bottom-1 rounded-[999px] backdrop-blur-md bg-white/55 border border-white/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 ease-out overflow-hidden"
              style={{ left: slider.left, width: slider.width, height: slider.height ? slider.height - 8 : undefined }}
              aria-hidden
            >
              <span className="liquid-glass" />
            </div>
            {/* Zone segment */}
            <div
              ref={segZoneRef}
              onClick={() => { setActiveSeg("zone"); setDestOpen(true); setDateOpen(false); destInputRef.current?.focus(); }}
              className="relative z-10 flex-1 min-w-0 px-6 py-4 cursor-pointer"
            >
              <div className="text-[12px] font-semibold uppercase tracking-wide text-neutral-500">Zone</div>
              <div 
                className="w-full text-base outline-none bg-transparent cursor-pointer"
                onClick={() => destInputRef.current?.focus()}
              >
                {selectedQuartierVille === 'Tous' 
                  ? 'Tous les quartiers' 
                  : selectedQuartierVille.split('|||').join(' - ')
                }
              </div>
            </div>
            {/* Date segment */}
            <div className="relative" ref={calendarRef}>
              <div
                ref={segDateRef}
                onClick={() => { 
                  setActiveSeg("date"); 
                  setDateOpen(!dateOpen); 
                  setDestOpen(false); 
                  setShowCalendar(!showCalendar);
                  dateInputRef.current?.focus(); 
                }}
                className="flex-1 min-w-0 px-6 py-4 cursor-pointer relative z-10"
              >
                <div className="text-[12px] font-semibold uppercase tracking-wide text-neutral-500">Date</div>
                <div className="w-full text-base outline-none bg-transparent cursor-pointer">
                  {selectedDate
                    ? selectedDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
                    : "Quand ?"}
                </div>
              </div>
              
              {/* Calendrier déroulant */}
              {showCalendar && (
                <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 bg-white rounded-lg shadow-lg z-50 p-4" ref={calendarRef}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-semibold text-neutral-700">Sélectionnez vos dates</h3>
                    <button 
                      onClick={() => setShowCalendar(false)}
                      className="text-neutral-400 hover:text-neutral-600 p-1 -mr-2"
                      aria-label="Fermer le calendrier"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                  <CalendarDropdown
                    year={currentYear}
                    month={currentMonth}
                    setYear={setCurrentYear}
                    setMonth={setCurrentMonth}
                    onClose={() => setShowCalendar(false)}
                    onSelect={(start, end) => {
                      onDateSelect(start, end);
                      setDateOpen(false);
                      setShowCalendar(false);
                    }}
                  />
                </div>
              )}
            </div>
            {/* Type segment */}
            <div
              ref={segTypeRef}
              onClick={() => { setActiveSeg("type"); setDestOpen(false); setDateOpen(false); }}
              className="flex-1 min-w-0 px-6 py-4 cursor-pointer relative z-10"
            >
              <div className="text-[12px] font-semibold uppercase tracking-wide text-neutral-500">Type d’appartement</div>
              <div 
                className="w-full text-base outline-none bg-transparent cursor-pointer"
                onClick={() => setTypeOpen(!typeOpen)}
              >
                {selectedType === 'Tous' 
                  ? 'Tous les types' 
                  : selectedType
                }
              </div>
            </div>
            <div className="p-2 pr-3 flex items-center">
              <button aria-label="Rechercher" className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#4A9B8E] text-white shadow-[0_10px_20px_rgba(74,155,142,0.35)]">
                <IconSearch className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Menu déroulant des zones */}
          {destOpen && (
            <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-[min(92vw,760px)] rounded-3xl bg-white border border-black/10 shadow-[0_24px_40px_rgba(0,0,0,0.12)] overflow-hidden z-50">
              <div className="flex justify-between items-center px-5 py-4 border-b border-black/10">
                <div className="text-[13px] font-semibold text-neutral-600">Sélectionnez un quartier</div>
                <button 
                  onClick={() => setDestOpen(false)}
                  className="text-neutral-400 hover:text-neutral-600 p-1 -mr-1"
                  aria-label="Fermer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              <ul className="max-h-[360px] overflow-y-auto divide-y divide-black/5">
                {quartierSuggestions.map((s, i) => (
                  <li key={i}>
                    <button
                      className="w-full text-left px-6 py-4 hover:bg-neutral-50 flex items-center gap-3"
                      onClick={() => {
                        onSelectQuartierVille(s.value);
                        setDestOpen(false);
                      }}
                    >
                      <span className="text-lg">{s.icon}</span>
                      <div>
                        <div className="text-sm font-medium text-neutral-900">{s.title}</div>
                        <div className="text-xs text-neutral-500">{s.subtitle}</div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Menu déroulant des types */}
          {typeOpen && (
            <div className="absolute right-0 mt-2 w-[min(92vw,400px)] rounded-3xl bg-white border border-black/10 shadow-[0_24px_40px_rgba(0,0,0,0.12)] overflow-hidden z-50">
              <div className="flex justify-between items-center px-5 py-4 border-b border-black/10">
                <div className="text-[13px] font-semibold text-neutral-600">Type de logement</div>
                <button 
                  onClick={() => setTypeOpen(false)}
                  className="text-neutral-400 hover:text-neutral-600 p-1 -mr-1"
                  aria-label="Fermer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              <ul className="max-h-[360px] overflow-y-auto divide-y divide-black/5">
                {typeSuggestions.map((s, i) => (
                  <li key={i}>
                    <button
                      className="w-full text-left px-6 py-4 hover:bg-neutral-50 flex items-center gap-3"
                      onClick={() => {
                        onSelectType(s.value);
                        setTypeOpen(false);
                      }}
                    >
                      <span className="text-lg">{s.icon}</span>
                      <div className="text-sm font-medium text-neutral-900">{s.title}</div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {dateOpen && (
            <CalendarDropdown
              year={currentYear}
              month={currentMonth}
              setYear={setCurrentYear}
              setMonth={setCurrentMonth}
              onClose={() => setDateOpen(false)}
              onSelect={onDateSelect}
            />
          )}
          
          {/* Filtres */}
          <div className="border-t border-black/10 relative z-0">
            <div className="max-w-[1200px] mx-auto px-4 py-3 flex gap-4 overflow-x-auto text-sm hide-scrollbar">
              {!loadingAnnonces && !errorAnnonces && categories.map((category) => (
                <button
                  key={category}
                  className={`
                    px-4 h-10 rounded-lg border flex items-center justify-center
                    whitespace-nowrap flex-shrink-0
                    transition-all duration-200 ease-in-out
                    ${
                      selectedCategory === category
                        ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 hover:border-emerald-700'
                        : 'bg-white/90 text-neutral-800 border-black/10 hover:bg-gray-100 hover:border-gray-300 hover:text-gray-900'
                    }
                    active:scale-95
                    focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1
                    transform hover:-translate-y-0.5
                  `}
                  onClick={() => onSelectCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

// Fonction utilitaire pour obtenir le nombre de jours dans un mois
const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

// Fonction utilitaire pour obtenir le premier jour du mois (0-6, où 0 est dimanche)
const getFirstDayOfMonth = (year, month) => {
  return new Date(year, month, 1).getDay();
};

// Fonction utilitaire pour ajouter des mois à une date
const addMonths = (year, month, monthsToAdd) => {
  const date = new Date(year, month + monthsToAdd);
  return { y: date.getFullYear(), m: date.getMonth() };
};

// Calendar dropdown component displayed under the Date input
function CalendarDropdown({ year, month, setYear, setMonth, onClose, onSelect }) {
  const currentDateObj = new Date();
  const [selectedDate, setSelectedDate] = useState(null);

  // Vérifier si une date est aujourd'hui
  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  // Vérifier si une date est sélectionnée
  const isDateSelected = (day) => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      month === selectedDate.getMonth() &&
      year === selectedDate.getFullYear()
    );
  };

  // Gestion de la sélection d'une date
  const handleDateClick = (day) => {
    if (!day) return;
    const clickedDate = new Date(year, month, day);
    onSelect(clickedDate);
    onClose();
  };

  const monthNames = [
    "janvier",
    "février",
    "mars",
    "avril",
    "mai",
    "juin",
    "juillet",
    "août",
    "septembre",
    "octobre",
    "novembre",
    "décembre",
  ];

  function startOfDay(d) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  }

  function addMonths(y, m, delta) {
    let nm = m + delta;
    let ny = y + Math.floor(nm / 12);
    nm = ((nm % 12) + 12) % 12;
    return { y: ny, m: nm };
  }

  function daysMatrix(y, m) {
    const first = new Date(y, m, 1);
    const startWeekday = (first.getDay() + 6) % 7; // Monday=0
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(y, m, d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }

  const cells = daysMatrix(year, month);

  return (
    <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-[min(92vw,600px)] rounded-3xl bg-white border border-black/10 shadow-[0_24px_40px_rgba(0,0,0,0.12)] overflow-hidden z-50">
      {/* Calendar */}
      <div className="p-4">
        <div className="flex items-center justify-between px-2">
          <button
            aria-label="Mois précédent"
            onClick={() => {
              const { y, m } = addMonths(year, month, -1);
              setYear(y); setMonth(m);
            }}
            className="w-9 h-9 rounded-full border border-black/10 bg-white flex items-center justify-center"
          >
            ‹
          </button>
          <div className="text-base font-semibold">
            {monthNames[month].charAt(0).toUpperCase() + monthNames[month].slice(1)} {year}
          </div>
          <button
            aria-label="Mois suivant"
            onClick={() => {
              const { y, m } = addMonths(year, month, 1);
              setYear(y); setMonth(m);
            }}
            className="w-9 h-9 rounded-full border border-black/10 bg-white flex items-center justify-center"
          >
            ›
          </button>
        </div>
        <div className="mt-3 grid grid-cols-7 gap-2 text-xs text-neutral-500 px-2">
          {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
            <div key={i} className="text-center">{d}</div>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-2 px-2 pb-3">
          {Array.from({ length: getDaysInMonth(year, month) + getFirstDayOfMonth(year, month) }, (_, i) => {
            const day = i + 1 - getFirstDayOfMonth(year, month);
            const isCurrentMonth = day > 0;
            const isSelected = isDateSelected(day);
            const isTodayDate = isToday(day);
            
            return (
              <button
                key={i}
                disabled={!isCurrentMonth}
                onClick={() => handleDateClick(day)}
                className={
                  "h-10 rounded-full text-sm flex items-center justify-center " +
                  (!isCurrentMonth
                    ? "opacity-0 cursor-default"
                    : isSelected
                    ? "bg-[#4A9B8E] text-white"
                    : isTodayDate
                    ? "font-bold text-[#4A9B8E] hover:bg-[#4A9B8E]/10"
                    : "hover:bg-black/[.06]")
                }
              >
                {isCurrentMonth ? day : ""}
              </button>
            );
          }).slice(0, 42)}
        </div>
        <div className="flex items-center justify-end gap-2 px-2 pb-2">
          <button 
            onClick={onClose} 
            className="px-3 h-9 rounded-full border border-black/10"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ children, title }) {
  const ref = useRef(null);
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-bold">{title}</h2>
      <div className="relative">
        <div ref={ref} className="flex gap-5 overflow-x-auto hide-scrollbar scroll-smooth pr-6">
          {children}
        </div>
        <button
          aria-label="Précédent"
          onClick={() => ref.current?.scrollBy({ left: -800, behavior: "smooth" })}
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-black/10 shadow items-center justify-center"
        >
          ‹
        </button>
        <button
          aria-label="Suivant"
          onClick={() => ref.current?.scrollBy({ left: 800, behavior: "smooth" })}
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-black/10 shadow items-center justify-center"
        >
          ›
        </button>
      </div>
    </section>
  );
}

function Card({ item, isLoggedIn }) {
  // Gestion du fallback pour les images Cloudinary ou par défaut
  let imageSrc = item.image || "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=60";
  
  // Si c'est un chemin relatif (commence par /uploads/), on construit l'URL complète
  if (imageSrc.startsWith('/uploads/')) {
    imageSrc = `http://localhost:4000${imageSrc}`;
  }

  // Affichage du prix par mois
  const unitePrix = "par mois";
  const [isLoading, setIsLoading] = useState(false);
  const [liked, setLiked] = useState(false);
  const router = useRouter();

  // Vérifier si l'annonce est dans les favoris au chargement
  useEffect(() => {
    const checkIfLiked = async () => {
      if (!isLoggedIn) {
        setLiked(false);
        return;
      }
      try {
        const response = await apiService.getFavorites();
        // La réponse peut être directement le tableau ou dans une propriété 'data'
        const favorites = Array.isArray(response) ? response : (response.data || []);
        const isLiked = favorites.some(fav => {
          const favId = fav._id || fav;
          return favId === item.id || favId === item._id;
        });
        setLiked(isLiked);
      } catch (error) {
        console.error('Erreur lors de la vérification des favoris:', error);
        setLiked(false);
      }
    };
    
    checkIfLiked();
  }, [isLoggedIn, item.id, item._id]);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isLoggedIn) {
      router.push('/clients/connexion');
      return;
    }

    const previousLikedState = liked;
    const annonceId = item.id || item._id;
    const action = previousLikedState ? 'remove' : 'add';
    
    if (!annonceId) {
      console.error('ID d\'annonce manquant:', item);
      alert('Impossible de trouver l\'identifiant de l\'annonce');
      return;
    }
    
    console.log(`Tentative de ${action} favori pour l'annonce ${annonceId}`);
    
    // Mise à jour optimiste de l'interface
    setLiked(!previousLikedState);
    setIsLoading(true);
    
    try {
      let response;
      
      console.log(`Appel API: ${action === 'remove' ? 'SUPPRIMER' : 'AJOUTER'} /api/favorites/${annonceId}`);
      
      // Appel API approprié selon l'action
      if (action === 'remove') {
        response = await apiService.removeFavorite(annonceId).catch(err => {
          console.error('Erreur lors de la suppression du favori:', err);
          throw err;
        });
      } else {
        response = await apiService.addFavorite(annonceId).catch(err => {
          console.error('Erreur lors de l\'ajout du favori:', err);
          throw err;
        });
      }
      
      console.log(`Réponse de l'API (${action}):`, response);
      
      // Vérification de la réponse
      if (!response) {
        throw new Error('Aucune réponse valide du serveur');
      }
      
      // Si la réponse indique une erreur
      if (response.success === false) {
        throw new Error(response.message || `Échec de la mise à jour des favoris (${response.status})`);
      }
      
      // Tout s'est bien passé, on garde l'état mis à jour
      console.log(`Favori ${action === 'remove' ? 'supprimé' : 'ajouté'} avec succès`);
      
    } catch (error) {
      // En cas d'erreur, on revient à l'état précédent
      console.error(`Erreur lors de ${action === 'remove' ? 'la suppression' : 'l\'ajout'} du favori:`, {
        error,
        annonceId,
        action,
        fullError: JSON.stringify(error, Object.getOwnPropertyNames(error))
      });
      
      setLiked(previousLikedState);
      
      // Construction du message d'erreur
      let errorMessage = `Erreur lors de ${action === 'remove' ? 'la suppression' : 'l\'ajout'} du favori`;
      
      if (error.fullResponse) {
        // Erreur avec réponse complète du serveur
        const { status, statusText, response } = error.fullResponse;
        errorMessage = `Erreur ${status || ''} ${statusText || ''}`.trim();
        
        if (response?.message) {
          errorMessage += `: ${response.message}`;
        } else if (response?.error) {
          errorMessage += `: ${response.error}`;
        }
      } else if (error.response) {
        // Erreur de l'API avec réponse
        errorMessage = error.response.message || error.response.error || errorMessage;
      } else if (error.message) {
        // Erreur réseau ou autre
        errorMessage = error.message;
      }
      
      // Afficher l'erreur de manière plus conviviale
      alert(`Erreur: ${errorMessage}`);
      
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <a href={`/clients/annonce/${item.id}`} className="group min-w-[230px] max-w-[230px] block">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-black/10">
        <CloudinaryImage 
          src={imageSrc}
          alt={item.title}
          width={300}
          height={200}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <button
          className={`absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 border border-black/10 text-[16px] flex items-center justify-center transition-colors duration-150 ${liked ? 'text-red-500' : 'text-gray-400'} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label={liked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          onClick={handleLike}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
          ) : liked ? (
            '❤️'
          ) : (
            '🤍'
          )}
        </button>
      </div>
      <div className="mt-2 space-y-0.5">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold truncate">{item.title}</div>
          <div className="text-xs"><span className="text-yellow-400">★</span> {item.rating ? item.rating.toFixed(1) : 'N/A'}</div>
        </div>
        <div className="text-xs text-neutral-600 truncate">{item.subtitle}</div>
        <div className="text-sm"><span className="font-semibold">{item.price} FCFA</span> {unitePrix}</div>
      </div>
    </a>
  );
}

function formatDate(date) {
  if (!date) return '';
  return new Date(date).toISOString().split('T')[0];
}

export default function ClientsPage() {
  // Tous les appels à useState en premier
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // --- Support modal states ---
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [supportName, setSupportName] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [supportPhone, setSupportPhone] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [supportLoading, setSupportLoading] = useState(false);
  const [supportFeedback, setSupportFeedback] = useState(null);

  async function handleSupportSubmit(e) {
    e.preventDefault();
    setSupportLoading(true);
    setSupportFeedback(null);
    
    // Récupérer les infos utilisateur depuis localStorage
    const userData = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('userData') || '{}') : {};
    
    // Préparer les données du formulaire
    const formData = {
      nom: userData.nom || supportName || 'Utilisateur',
      email: userData.email || supportEmail || '',
      telephone: userData.telephone || supportPhone || '',
      message: supportMessage
    };
    
    // Validation côté client
    if (!formData.message || formData.message.trim().length < 5) {
      setSupportFeedback({ type: 'error', message: 'Veuillez écrire un message plus détaillé (au moins 5 caractères).' });
      setSupportLoading(false);
      return;
    }
    
    try {
      const res = await apiService.post('/api/messages/support', formData);
      if (res.success) {
        setSupportFeedback({ type: 'success', message: 'Votre message a bien été transmis au support.' });
        setSupportMessage("");
        setTimeout(()=>{
          setSupportModalOpen(false);
          setSupportFeedback(null);
        }, 1800);
      } else {
        throw new Error(res.message || 'Erreur lors de l\'envoi');
      }
    } catch (err) {
      console.error('Erreur complète:', err);
      let errorMessage = 'Erreur lors de l\'envoi';
      
      // Vérifier d'abord si c'est une erreur de validation (400)
      if (err.response?.status === 400) {
        errorMessage = err.response.data?.message || errorMessage;
      } 
      // Vérifier si c'est une erreur réseau
      else if (!err.response) {
        errorMessage = 'Erreur de connexion. Veuillez vérifier votre connexion internet.';
      }
      // Autres erreurs
      else if (err.message) {
        errorMessage = err.message;
      }
      
      setSupportFeedback({ type: 'error', message: errorMessage });
    } finally {
      setSupportLoading(false);
    }
  }

  const [ready, setReady] = useState(false);
  const [annonces, setAnnonces] = useState([]);
  const [loadingAnnonces, setLoadingAnnonces] = useState(true);
  const [errorAnnonces, setErrorAnnonces] = useState("");
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  
  // Gestion de la sélection de date
  const [selectedDate, setSelectedDate] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const currentDateObj = new Date();
  const [currentMonth, setCurrentMonth] = useState(currentDateObj.getMonth());
  const [currentYear, setCurrentYear] = useState(currentDateObj.getFullYear());

  // Gestion de la sélection de date
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setShowCalendar(false);
  };
  
  // Références pour le calendrier
  const calendarRef = useRef(null);

  // Check if user is logged in and sync with localStorage changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initial check
    const token = localStorage.getItem('auth_token');
    setIsLoggedIn(!!token);
    setReady(true);

    // Listen for storage changes (for cross-tab synchronization)
    const handleStorageChange = (e) => {
      if (e.key === 'auth_token' || e.key === null) {
        const newToken = localStorage.getItem('auth_token');
        setIsLoggedIn(!!newToken);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    async function fetchAnnonces() {
      console.log('Début du chargement des annonces...');
      setLoadingAnnonces(true);
      setErrorAnnonces("");
      try {
        const res = await apiService.get('/api/annonces');
        console.log('Réponse de l\'API annonces:', res);
        const annoncesData = Array.isArray(res.data) ? res.data : [];
        
        // Log détaillé des données reçues
        console.log('Annonces formatées:', JSON.stringify(annoncesData, null, 2));
        if (annoncesData.length > 0) {
          console.log('Détails de la première annonce:', {
            ...annoncesData[0],
            photos: annoncesData[0].photos
          });
        }
        
        setAnnonces(annoncesData);
      } catch (e) {
        console.error('Erreur lors du chargement des annonces:', e);
        setErrorAnnonces(e.message || "Erreur lors du chargement des annonces");
      } finally {
        console.log('Fin du chargement des annonces');
        setLoadingAnnonces(false);
      }
    }
    fetchAnnonces();
  }, []);

  // Récupérer les types uniques d'annonces (hors "Tous")
  const types = useMemo(() => 
    Array.from(new Set(annonces.map(a => a.type).filter(Boolean))),
    [annonces]
  );
  
  // Couples quartier+ville uniques
  const quartiersVilles = useMemo(() => 
    Array.from(
      new Set(
        annonces
          .filter(a => a?.ville && a?.quartier)
          .map(a => `${a.quartier}|||${a.ville}`)
      )
    )
    .map(str => {
      const [quartier, ville] = str.split('|||');
      return { quartier, ville };
    }),
    [annonces]
  );

  // États pour les filtres
  const [selectedQuartierVille, setSelectedQuartierVille] = useState('Tous');
  const [selectedType, setSelectedType] = useState('Tous');

  // Fonction pour vérifier si une date correspond à la date sélectionnée
  const isSelectedDate = (dateToCheck, selectedDate) => {
    if (!selectedDate) return false;
    const d = new Date(dateToCheck);
    const s = new Date(selectedDate);
    return d.getDate() === s.getDate() && 
           d.getMonth() === s.getMonth() && 
           d.getFullYear() === s.getFullYear();
  };

  // Filtrage optimisé des annonces
  const filteredAnnonces = useMemo(() => 
    annonces.filter(annonce => {
      // Vérifier le type
      let matchType = false;
      if (selectedType === 'Tous') {
        matchType = true;
      } else if (selectedType === 'Autres') {
        matchType = annonce.type && !['Maison', 'Appartement', 'Villa', 'Studio', 'Chambre'].includes(annonce.type);
      } else {
        matchType = annonce.type === selectedType;
      }
      
      // Vérifier le quartier et la ville
      const matchQuartierVille = selectedQuartierVille === 'Tous' ||
        (annonce.quartier && 
         annonce.ville && 
         `${annonce.quartier}|||${annonce.ville}` === selectedQuartierVille);
      
      // Vérifier la date de création de l'annonce
      const matchDate = !selectedDate || 
        (annonce.createdAt && isSelectedDate(new Date(annonce.createdAt), selectedDate));
      
      return matchType && matchQuartierVille && matchDate;
    }),
    [annonces, selectedType, selectedQuartierVille, selectedDate]
  );
  
  // Gestion du clic en dehors du calendrier
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-white">
      <Header
            isLoggedIn={isLoggedIn}
            setIsLoggedIn={setIsLoggedIn}
            loadingAnnonces={loadingAnnonces}
            errorAnnonces={errorAnnonces}
            quartiersVilles={quartiersVilles}
            selectedQuartierVille={selectedQuartierVille}
            onSelectQuartierVille={setSelectedQuartierVille}
            types={types}
            selectedType={selectedType}
            onSelectType={setSelectedType}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            showCalendar={showCalendar}
            setShowCalendar={setShowCalendar}
            currentMonth={currentMonth}
            currentYear={currentYear}
            setCurrentMonth={setCurrentMonth}
            setCurrentYear={setCurrentYear}
            calendarRef={calendarRef}
            supportModalOpen={supportModalOpen}
            setSupportModalOpen={setSupportModalOpen}
            supportName={supportName}
            setSupportName={setSupportName}
            supportEmail={supportEmail}
            setSupportEmail={setSupportEmail}
            supportPhone={supportPhone}
            setSupportPhone={setSupportPhone}
            supportMessage={supportMessage}
            setSupportMessage={setSupportMessage}
            supportLoading={supportLoading}
            supportFeedback={supportFeedback}
            handleSupportSubmit={handleSupportSubmit}
          />
      <main className="max-w-[1200px] mx-auto px-4 py-6 pb-24 space-y-10">
        {errorAnnonces && <div className="text-red-600 font-semibold p-4">{errorAnnonces}</div>}
        
        {/* Section Catégories */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-neutral-800 px-4">Catégories populaires</h2>
          <div className="relative">
            <div className="flex w-full space-x-4 overflow-x-auto pb-3 px-2 -mx-2 md:mx-0 md:flex md:justify-between md:space-x-0 md:w-full md:overflow-visible md:pb-0 md:px-0">
              {[
                { name: 'Maisons', icon: '🏠', count: annonces.filter(a => a.type === 'Maison').length },
                { name: 'Appartements', icon: '🏢', count: annonces.filter(a => a.type === 'Appartement').length },
                { name: 'Villas', icon: '🏡', count: annonces.filter(a => a.type === 'Villa').length },
                { name: 'Studios', icon: '🛏️', count: annonces.filter(a => a.type === 'Studio').length },
                { name: 'Chambres', icon: '🛌', count: annonces.filter(a => a.type === 'Chambre').length },
                { 
                  name: 'Autres', 
                  icon: '🏘️', 
                  count: annonces.filter(a => !['Maison', 'Appartement', 'Villa', 'Studio', 'Chambre'].includes(a.type)).length 
                },
                { name: 'Tous', icon: '🔍', count: annonces.length }
              ].map((category) => (
                <button
                  key={category.name}
                  onClick={() => setSelectedType(category.name === 'Tous' ? 'Tous' : category.name)}
                  className={`flex-shrink-0 w-24 md:w-full md:max-w-[120px] flex-1 flex flex-col items-center justify-center gap-1 p-2 md:py-2 rounded-xl border-none shadow transition-all duration-200 bg-white hover:bg-neutral-50 cursor-pointer group
                    ${(selectedType === category.name || (category.name === 'Tous' && selectedType === 'Tous')) ? 'ring-2 ring-[#4A9B8E] bg-[#e7f6f3]' : 'ring-1 ring-neutral-200'}
                  `}
                >
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#f1f5f9] group-hover:bg-[#4A9B8E]/10 transition-all text-lg shadow mb-0.5">
                    {category.icon}
                  </span>
                  <span className="font-medium text-neutral-800 text-xs text-center mb-0 group-hover:text-[#4A9B8E] transition-all">{category.name}</span>
                  <span className="inline-block px-1.5 py-0.5 rounded-full text-[11px] font-normal bg-neutral-100 text-neutral-500 group-hover:bg-[#4A9B8E]/20 group-hover:text-[#4A9B8E] transition-all">
                    {category.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {loadingAnnonces ? (
          <div className="text-center text-neutral-600 py-10">Chargement des annonces...</div>
        ) : (
          <Row title="Récemment ajoutés">
          {filteredAnnonces
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Trie par date décroissante
            .slice(0, 10) // Prend les 10 plus récentes
            .map((item) => (
              <Card 
                key={item._id} 
                item={{
                  id: item._id,
                  title: item.titre,
                  subtitle: `${item.type || ''}${item.ville ? ' · ' + item.ville : ''}`,
                  price: item.prixParNuit || 0,
                  rating: item.rating ,
                  image: item.photos?.[0] || null,
                  type: item.type || ''
                }}
                isLoggedIn={isLoggedIn}
              />
            ))}
        </Row>
        )}
      </main>
      {/* Mobile bottom toolbar */}
      <MobileTabBar isLoggedIn={isLoggedIn} />
    </div>
  );
}