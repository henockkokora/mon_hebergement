"use client";
import React from 'react';

import { useRef, useState, useEffect, useLayoutEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CloudinaryImage from "../components/CloudinaryImage";
import { getImageUrl } from "@/utils/imageUtils";
import Card from './components/Card';

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
  const router = useRouter();
  const [loadingTab, setLoadingTab] = useState(''); // 'home' | 'fav' | 'profile'
  const favBtnRef = useRef(null);
  const profileBtnRef = useRef(null);
  const [flyHeart, setFlyHeart] = useState(false);
  const [flyUser, setFlyUser] = useState(false);
  const [flyStyle, setFlyStyle] = useState({ top: 0, left: 0, transform: 'translate(-50%, -50%) scale(1)' });
  const go = (key, href) => {
    setLoadingTab(key);
    if (key === 'fav') {
      try {
        const rect = favBtnRef.current?.getBoundingClientRect();
        const startX = rect ? rect.left + rect.width / 2 : window.innerWidth - 40;
        const startY = rect ? rect.top + rect.height / 2 : window.innerHeight - 40;
        const targetX = window.innerWidth / 2;
        const targetY = window.innerHeight / 2;
        setFlyStyle({ top: startY, left: startX, transform: 'translate(-50%, -50%) scale(1)' });
        setFlyHeart(true);
        requestAnimationFrame(() => {
          setFlyStyle({ top: targetY, left: targetX, transform: 'translate(-50%, -50%) scale(1.4)' });
        });
        setTimeout(() => router.push(href), 500);
        return;
      } catch {}
    }
    if (key === 'profile') {
      try {
        const rect = profileBtnRef.current?.getBoundingClientRect();
        const startX = rect ? rect.left + rect.width / 2 : window.innerWidth - 40;
        const startY = rect ? rect.top + rect.height / 2 : window.innerHeight - 40;
        const targetX = window.innerWidth / 2;
        const targetY = window.innerHeight / 2;
        setFlyStyle({ top: startY, left: startX, transform: 'translate(-50%, -50%) scale(1)' });
        setFlyUser(true);
        requestAnimationFrame(() => {
          setFlyStyle({ top: targetY, left: targetX, transform: 'translate(-50%, -50%) scale(1.4)' });
        });
        setTimeout(() => router.push(href), 500);
        return;
      } catch {}
    }
    router.push(href);
  };
  const iconClass = (key, base = 'w-6 h-6') => (
    `${base} transition-transform ${loadingTab===key ? 'scale-125 animate-pulse' : ''}`
  );
  const textClass = (key, base = '') => (
    `${base} ${loadingTab===key ? 'animate-pulse' : ''}`
  );
  return (
    <>
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-neutral-50 backdrop-blur shadow-sm">
      <div className="max-w-[1200px] mx-auto px-6 py-2 grid grid-cols-3 gap-2 text-[13px] font-medium">
        <button onClick={()=>go('home','/clients')} className="flex flex-col items-center justify-center py-1 text-neutral-900">
          <IconHome className={iconClass('home')} />
          <span className={textClass('home')}>Explorer</span>
        </button>
        <button ref={favBtnRef} onClick={()=>go('fav','/clients/favoris')} className="flex flex-col items-center justify-center py-1 text-neutral-600">
          <IconHeart className={iconClass('fav')} />
          <span className={textClass('fav')}>Favoris</span>
        </button>
        {isLoggedIn ? (
          <button ref={profileBtnRef} onClick={()=>go('profile','/clients/profil')} className="flex flex-col items-center justify-center py-1 text-neutral-600">
            <IconUser className={iconClass('profile')} />
            <span className={textClass('profile')}>Profil</span>
          </button>
        ) : (
          <button ref={profileBtnRef} onClick={()=>go('profile','/clients/connexion')} className="flex flex-col items-center justify-center py-1 text-neutral-600">
            <IconUser className={iconClass('profile')} />
            <span className={textClass('profile')}>Connexion</span>
          </button>
        )}
      </div>
    </nav>
    {flyHeart && (
      <div className="fixed z-50 pointer-events-none" style={{ top: flyStyle.top, left: flyStyle.left, transform: flyStyle.transform, transition: 'transform 0.5s ease, top 0.5s ease, left 0.5s ease' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-neutral-800" aria-hidden>
          <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-8.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
        </svg>
      </div>
    )}
    {flyUser && (
      <div className="fixed z-50 pointer-events-none" style={{ top: flyStyle.top, left: flyStyle.left, transform: flyStyle.transform, transition: 'transform 0.5s ease, top 0.5s ease, left 0.5s ease' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-neutral-800" aria-hidden>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-3.5 3.5-6 8-6s8 2.5 8 6" />
        </svg>
      </div>
    )}
    </>
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

// Additional icons for categories
function IconBuilding({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="3" y="3" width="7" height="18" rx="1" />
      <rect x="14" y="7" width="7" height="14" rx="1" />
      <path d="M6.5 7h0M6.5 11h0M6.5 15h0M17.5 11h0M17.5 15h0" />
    </svg>
  );
}

function IconBed({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M3 7v10" />
      <path d="M3 12h18a2 2 0 0 1 2 2v3H3" />
      <rect x="6" y="8" width="6" height="4" rx="1.2" />
    </svg>
  );
}

function IconHouses({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M4 12l4-4 4 4" />
      <path d="M6 10v7h4v-7" />
      <path d="M12 14l3-3 3 3" />
      <path d="M13 13v4h4v-4" />
    </svg>
  );
}

// Additional expressive icons
function IconCar({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M3 13l2-5a3 3 0 0 1 2.8-2h6.4A3 3 0 0 1 17 8l2 5" />
      <path d="M5 13h14a2 2 0 0 1 2 2v3H3v-3a2 2 0 0 1 2-2Z" />
      <circle cx="7" cy="18" r="1.5" />
      <circle cx="17" cy="18" r="1.5" />
    </svg>
  );
}

function IconPickup({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M3 15v-3h8l2 3h6v3H3z" />
      <path d="M11 12V9a2 2 0 0 0-2-2H6v5" />
      <circle cx="7" cy="18" r="1.5" />
      <circle cx="17" cy="18" r="1.5" />
    </svg>
  );
}

function IconSUV({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M3 14l2-4 4-3h6l4 3 2 4" />
      <path d="M3 14h18v4H3z" />
      <circle cx="7" cy="18" r="1.5" />
      <circle cx="17" cy="18" r="1.5" />
    </svg>
  );
}

function IconTruck({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M3 16V8h10v8H3z" />
      <path d="M13 12h5l3 3v3h-8v-6z" />
      <circle cx="7" cy="19" r="1.5" />
      <circle cx="17" cy="19" r="1.5" />
    </svg>
  );
}

function IconStore({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M3 9l2-4h14l2 4" />
      <path d="M4 9h16v9H4z" />
      <path d="M8 9v9" />
    </svg>
  );
}

function IconStoreMezz({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M3 9l2-4h14l2 4" />
      <path d="M4 9h16v9H4z" />
      <path d="M4 13h16" />
    </svg>
  );
}

function IconHelmet({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M4 14a8 8 0 0 1 16 0v2H4v-2z" />
      <path d="M12 6v4" />
    </svg>
  );
}

function IconForklift({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M4 16V8h5l3 5h3v3" />
      <path d="M18 8v8h3" />
      <circle cx="7" cy="18" r="1.5" />
      <circle cx="15" cy="18" r="1.5" />
    </svg>
  );
}

function IconBarn({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M3 20V10l9-6 9 6v10H3z" />
      <path d="M9 20v-6h6v6" />
    </svg>
  );
}

function IconPickaxe({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M3 7c6-4 12-4 18 0" />
      <path d="M12 7v13" />
      <path d="M10 12l4 4" />
    </svg>
  );
}

function IconTractor({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <circle cx="7" cy="18" r="2.5" />
      <circle cx="17" cy="16" r="3.5" />
      <path d="M4 18h1l2-6h6l2 2h2" />
      <path d="M9 6h4v4H9z" />
    </svg>
  );
}

function IconBriefcase({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M3 8h18v11H3z" />
      <path d="M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      <path d="M3 12h18" />
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
  onResetAll = () => {},
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
    <header className="sticky top-0 z-40 bg-gradient-to-b from-neutral-50 to-white backdrop-blur supports-[backdrop-filter]:backdrop-blur-md shadow-sm">
      {/* Top bar with brand, nav and actions */}
      <div className="max-w-[1200px] mx-auto px-4 py-3 flex items-center gap-6">
        {/* Brand + Support */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#4A9B8E] text-white text-[12px] font-bold">M</span>
          <span className="font-semibold">GELocation</span>
        </div>
        {/* Mobile hamburger (original) hidden; moved to right actions */}
        <div className="hidden"></div>
        {/* Center nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-700 mx-auto">
          <a href="#" className="flex items-center gap-2 relative pb-2">
            <IconHome className="w-4 h-4" />
            <span className="font-medium">Logements</span>
            <span className="absolute left-0 right-0 -bottom-[9px] mx-auto h-[2px] w-10 bg-neutral-800 rounded-full" />
          </a>
          {isLoggedIn ? (
            <>
              {/* Bouton Messagerie commenté temporairement */}
              {/* <div className="relative inline-block">
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
              </div> */}
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
        <div className="flex items-center gap-3 text-sm text-neutral-700 ml-auto">
          <button
            type="button"
            aria-label="Contacter le support"
            className="flex items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-900 transition-colors font-semibold px-4 h-9 whitespace-nowrap shadow-sm"
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
          {/* Mobile hamburger to be rightmost on mobile */}
          <div className="md:hidden relative">
            <button aria-label="Menu" onClick={()=>setMenuOpen(v=>!v)} className="w-10 h-10 rounded-full bg-neutral-100 shadow-sm flex items-center justify-center">
              <IconMenu />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-neutral-50 shadow-sm backdrop-blur overflow-hidden z-50">
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
          {/* Modal Support */}
          {supportModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 min-h-screen py-8">
              <div className="bg-neutral-50 rounded-2xl shadow-sm w-full max-w-[420px] mx-4 p-6 relative my-auto">
                <button
                  className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 transition-colors"
                  onClick={() => setSupportModalOpen(false)}
                  aria-label="Fermer"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 6l12 12M6 18L18 6"/></svg>
                </button>
                <h2 className="text-2xl font-bold mb-5 text-neutral-900">Message</h2>
                <form onSubmit={handleSupportSubmit} className="space-y-4">
                  <div>
                    <textarea 
                      className="w-full rounded-lg px-4 py-3 min-h-[120px] bg-[#F5F5F5] text-base text-neutral-900 placeholder:text-neutral-500 shadow-inner focus:outline-none focus:bg-[#EDEDED] resize-none" 
                      placeholder="Écrivez votre message ou plainte ici..." 
                      required 
                      value={supportMessage} 
                      onChange={e=>setSupportMessage(e.target.value)} 
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="w-full bg-neutral-800 text-white rounded-lg py-3 font-semibold hover:bg-neutral-700 transition-colors text-base shadow-sm" 
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
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-red-500 bg-white text-red-600 hover:bg-red-50 transition-colors"
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
          <div className="flex items-center gap-2 rounded-full bg-[#F5F5F5] shadow-inner px-3 py-2" onClick={() => router.push('/clients/recherche')}>
            <IconSearch className="w-5 h-5 text-neutral-500" />
            <input
              type="text"
              className="flex-1 bg-transparent outline-none text-[16px] md:text-sm font-medium md:font-normal text-neutral-900 placeholder:text-neutral-500 placeholder:font-medium md:placeholder:font-normal"
              placeholder="Rechercher un bien"
              readOnly
              onFocus={() => router.push('/clients/recherche')}
            />
            <button aria-label="Rechercher" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-neutral-800 text-white">
              <IconSearch className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Large segmented search bar (desktop/tablette) */}
      <div className="hidden md:block pb-3">
        <div className="max-w-[1100px] mx-auto px-4 pb-5 relative" ref={containerRef}>
          <div ref={barRef} className="rounded-full bg-[#F5F5F5] shadow-inner overflow-hidden flex items-stretch relative">
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
              onClick={() => { 
                setActiveSeg("zone"); 
                setDestOpen(true); 
                setDateOpen(false);
                setTypeOpen(false);
                setShowCalendar(false);
                destInputRef.current?.focus(); 
              }}
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
                  setTypeOpen(false);
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
              onClick={() => { 
                setActiveSeg("type"); 
                setDestOpen(false); 
                setDateOpen(false);
                setShowCalendar(false);
              }}
              className="flex-1 min-w-0 px-6 py-4 cursor-pointer relative z-10"
            >
              <div className="text-[12px] font-semibold uppercase tracking-wide text-neutral-500">Type de bien</div>
              <div 
                className="w-full text-base outline-none bg-transparent cursor-pointer"
                onClick={() => {
                  setTypeOpen(!typeOpen);
                  setShowCalendar(false);
                  setDateOpen(false);
                }}
              >
                {selectedType === 'Tous' 
                  ? 'Tous les types' 
                  : selectedType
                }
              </div>
            </div>
            {/* Bouton Réinitialiser tout */}
            <div className="p-2 flex items-center">
              <button
                onClick={onResetAll}
                className="relative z-10 px-3 py-2 flex items-center justify-center cursor-pointer hover:bg-neutral-100/50 transition-colors rounded-full mr-2"
                aria-label="Réinitialiser tous les filtres"
                title="Réinitialiser tous les filtres"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-neutral-600">
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                  <path d="M21 3v5h-5" />
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                  <path d="M3 21v-5h5" />
                </svg>
              </button>
            </div>
            <div className="p-2 pr-3 flex items-center">
              <button aria-label="Rechercher" className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#4A9B8E] text-white shadow-[0_10px_20px_rgba(74,155,142,0.35)]">
                <IconSearch className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Menu déroulant des zones */}
          {destOpen && (
            <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-[min(92vw,760px)] rounded-3xl bg-white shadow-[0_24px_40px_rgba(0,0,0,0.12)] overflow-hidden z-50">
              <div className="flex justify-between items-center px-5 py-4 bg-neutral-50">
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
              <ul className="max-h[360px] overflow-y-auto">
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
            <div className="absolute right-0 mt-2 w-[min(92vw,400px)] rounded-3xl bg-white shadow-[0_24px_40px_rgba(0,0,0,0.12)] overflow-hidden z-50">
              <div className="flex justify-between items-center px-5 py-4 bg-neutral-50">
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
              <ul className="max-h-[360px] overflow-y-auto">
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
          <div className="relative z-0 mt-2">
            <div className="max-w-[1200px] mx-auto px-4 py-3 flex gap-4 overflow-x-auto text-sm hide-scrollbar">
              {!loadingAnnonces && !errorAnnonces && categories.map((category) => (
                <button
                  key={category}
                  className={`
                    px-4 h-9 md:h-10 rounded-full md:rounded-lg flex items-center justify-center
                    whitespace-nowrap flex-shrink-0
                    transition-all duration-200 ease-in-out
                    text-[15px] md:text-sm font-medium md:font-normal
                    ${selectedCategory === category
                      ? 'bg-neutral-200 text-neutral-900 shadow'
                      : 'bg-[#F5F5F5] text-neutral-800 hover:bg-[#EDEDED]'}
                    active:scale-95 focus:outline-none
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

// --- Glass Categories (icônes principales) ---

function GlassCategoriesGrid({ groupes, selectedType, setSelectedType }) {
  const [opened, setOpened] = useState(null); // key du groupe ouvert
  const popinRef = useRef(null);
  const btnsRef = useRef({});
  const scrollRef = useRef(null); // Pour le scroll horizontal
  const [isMobile, setIsMobile] = useState(false);

  // Détecter si on est sur mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fonctions de scroll pour les flèches
  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  // Clic dehors : ferme le menu déroulant
  useEffect(() => {
    if (!opened) return;
    function handleClickOutside(e) {
      const pop = popinRef.current;
      const btn = btnsRef.current[opened];
      if (
        pop && !pop.contains(e.target) &&
        (!btn || !btn.contains(e.target))
      ) {
        setOpened(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [opened]);

  // Gère l'ouverture/fermeture animation
  const toggleOpen = (key) => setOpened(opened === key ? null : key);

  return (
    <>
      {/* Message uniquement sur mobile */}
      {isMobile && (
        <div className="px-4 mb-2">
          <p className="text-lg text-neutral-500 text-center">
            Scrollez ou cliquez sur les flèches pour voir plus de catégories
          </p>
        </div>
      )}
      <div className="relative">
        {/* Flèche gauche - uniquement sur mobile, positionnée à gauche du conteneur */}
        {isMobile && (
          <button
            onClick={scrollLeft}
            className="absolute -left-6 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-white shadow-xl border-2 border-neutral-200 flex items-center justify-center hover:bg-neutral-50 active:scale-95 transition-all"
            aria-label="Défiler vers la gauche"
          >
            <svg className="w-7 h-7 text-neutral-700" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        {/* Flèche droite - uniquement sur mobile, positionnée à droite du conteneur */}
        {isMobile && (
          <button
            onClick={scrollRight}
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-white shadow-xl border-2 border-neutral-200 flex items-center justify-center hover:bg-neutral-50 active:scale-95 transition-all"
            aria-label="Défiler vers la droite"
          >
            <svg className="w-7 h-7 text-neutral-700" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
        <div ref={scrollRef} className={`w-full flex flex-row gap-x-6 overflow-x-auto hide-scrollbar py-6 items-start justify-start scroll-snap-x ${isMobile ? 'px-12' : 'px-2'}`}>
      {/* Bouton "Tous" en premier */}
      <div className="flex flex-col items-center min-w-[90px] md:min-w-[100px] snap-start">
        <button
          type="button"
          onClick={() => setSelectedType('Tous')}
          className={`relative group focus:outline-none transition-all duration-300 active:scale-95 hover:scale-105 \
             ${selectedType==='Tous'
              ? 'shadow-[0_0_20px_6px_#4A9B8E55] bg-white/60'
              : 'hover:border hover:border-[#4A9B8E]/50'}
             rounded-full`}
          aria-label="Tous"
          style={{
            border: selectedType==='Tous' ? '1.5px solid #4A9B8E44' : undefined
          }}
        >
          <span className="absolute inset-0 z-0 rounded-full pointer-events-none glass-bg" />
          <span className="relative z-10 flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full border border-white/40 bg-white/10 shadow-[0_4px_40px_rgba(0,0,0,0.13)] backdrop-blur-[6px] group-hover:bg-white/20 transition-colors">
            {/* Icône loupe générique */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 md:w-10 md:h-10 text-neutral-600"><circle cx="11" cy="11" r="7" /><path d="M21 21l-3.8-3.8" /></svg>
          </span>
        </button>
        <span className="mt-3 text-base font-bold text-neutral-900 text-center md:text-lg md:font-bold">Tous</span>
      </div>
      {/* Autres catégories */}
      {groupes.map(grp => (
        <div key={grp.key} className="flex flex-col items-center min-w-[90px] md:min-w-[100px] snap-start">
          <button
            ref={el => btnsRef.current[grp.key] = el}
            type="button"
            onClick={() => toggleOpen(grp.key)}
            className={
              `relative group focus:outline-none 
              transition-transform active:scale-95 
              hover:scale-105 ${opened===grp.key ? 'scale-105' : ''}`}
            aria-label={grp.title}
          >
            <span className="absolute inset-0 z-0 rounded-2xl pointer-events-none glass-bg" />
            <span className="relative z-10 flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl \
              border border-white/40 bg-white/10 shadow-[0_4px_40px_rgba(0,0,0,0.13)] backdrop-blur-[6px] \
              group-hover:bg-white/20 transition-colors">
              {/* icône de la catégorie */}
              {grp.icon && typeof grp.icon === 'object' && React.cloneElement(grp.icon, { className: 'w-8 h-8 md:w-10 md:h-10 text-neutral-50' })}
            </span>
          </button>
          <span className="mt-3 text-base font-bold text-neutral-900 text-center md:text-lg md:font-bold">
            {grp.title}
          </span>
          {opened === grp.key && (
            <div
              ref={popinRef}
              style={{
                opacity: 1,
                transform: 'translateY(10px) scale(1)',
                filter: 'blur(0px)'
              }}
              className="mt-4 w-[90vw] max-w-xs md:w-64 md:max-w-[96vw] p-4 rounded-2xl glass-bg backdrop-blur-[7px] \
                 border border-white/40 shadow-[0_4px_40px_rgba(0,0,0,0.22)] \
                 flex flex-col items-stretch gap-3 z-20 animate-glassFade"
            >
              {grp.items.map(item => (
                <button
                  key={item.value}
                  className={
                    `flex items-center gap-3 px-3 py-2 min-w-0 rounded-xl text-left \
                    bg-white/40 hover:bg-white/60 transition \
                    ${selectedType === item.value ? 'ring-2 ring-[#4A9B8E] font-bold bg-white/80' : ''}`
                  }
                  onClick={() => setSelectedType(item.value)}
                >
                  <span className="w-7 h-7 flex items-center justify-center">{item.icon}</span>
                  <span className="break-words whitespace-normal flex-1">{item.name}</span>
                  <span className="ml-auto text-xs bg-neutral-200/70 rounded px-2 py-0.5 text-neutral-700">
                    {item.count}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
        </div>
      <style jsx global>{`
        .glass-bg {
          background: linear-gradient(135deg, rgba(255,255,255,0.17), rgba(36,36,49,0.30)), rgba(21,19,49,0.26);
          box-shadow: 0 4px 44px 0 rgba(0,0,0,0.09), inset 0 -1px 6px 0 rgba(255,255,255,0.19);
        }
        .glass-bg.rounded-full { border-radius: 9999px; }
        @keyframes glassFade {
          from { opacity: 0; transform: translateY(40px) scale(0.95); filter: blur(6px); }
          to { opacity: 1; transform: translateY(10px) scale(1); filter: blur(0px); }
        }
        .animate-glassFade {
          animation: glassFade 0.30s cubic-bezier(.48,.42,.46,1.14);
        }
        .hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .scroll-snap-x { scroll-snap-type: x mandatory; }
        .snap-start { scroll-snap-align: start; }
      `}</style>
      </div>
    </>
  );
}

function formatDate(date) {
  if (!date) return '';
  return new Date(date).toISOString().split('T')[0];
}

// Component that uses useSearchParams - needs to be wrapped in Suspense
function ClientsPageContent() {
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

  // Réinitialiser tous les filtres
  const handleResetAll = () => {
    setSelectedDate(null);
    setSelectedQuartierVille('Tous');
    setSelectedType('Tous');
    setPriceRange({ min: '', max: '' });
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
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const searchParams = useSearchParams();

  // Initialiser les filtres depuis l'URL (type, prixMin, prixMax)
  useEffect(() => {
    if (!searchParams) return;
    const t = searchParams.get('type');
    const pmin = searchParams.get('prixMin');
    const pmax = searchParams.get('prixMax');
    if (t && t.trim()) setSelectedType(t);
    setPriceRange({ min: pmin || '', max: pmax || '' });
  }, [searchParams]);

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
      
      // Vérifier le prix
      const minOk = priceRange.min === '' || (typeof annonce.prixParNuit === 'number' && annonce.prixParNuit >= Number(priceRange.min));
      const maxOk = priceRange.max === '' || (typeof annonce.prixParNuit === 'number' && annonce.prixParNuit <= Number(priceRange.max));
      const matchPrice = minOk && maxOk;

      // Vérifier le quartier et la ville
      const matchQuartierVille = selectedQuartierVille === 'Tous' ||
        (annonce.quartier && 
         annonce.ville && 
         `${annonce.quartier}|||${annonce.ville}` === selectedQuartierVille);
      
      // Vérifier la date de création de l'annonce
      const matchDate = !selectedDate || 
        (annonce.createdAt && isSelectedDate(new Date(annonce.createdAt), selectedDate));
      
      return matchType && matchPrice && matchQuartierVille && matchDate;
    }),
    [annonces, selectedType, priceRange, selectedQuartierVille, selectedDate]
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
    <div className="min-h-screen bg-white font-sans font-medium md:font-[inherit] md:font-normal">
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
            onResetAll={handleResetAll}
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
         
          <div className="relative">
            {/* Nouvelle grille GlassIcons */}
            <GlassCategoriesGrid 
              groupes={[
                {
                  key: 'habitation',
                  title: 'Habitation',
                  icon: <IconHome className="w-9 h-9 md:w-12 md:h-12 text-neutral-50" />, 
                  items: [
                    { name: 'Appartement', value: 'Appartement', count: annonces.filter(a => a.type === 'Appartement').length, icon: <IconBuilding className="w-5 h-5" /> },
                    { name: 'Studio', value: 'Studio', count: annonces.filter(a => a.type === 'Studio').length, icon: <IconBed className="w-5 h-5" /> },
                    { name: 'Chambre', value: 'Chambre', count: annonces.filter(a => a.type === 'Chambre').length, icon: <IconBed className="w-5 h-5" /> },
                  ],
                },
                {
                  key: 'bureau',
                  title: 'Bureau',
                  icon: <IconBriefcase className="w-9 h-9 md:w-12 md:h-12 text-neutral-50" />, 
                  items: [
                    { name: 'Bureau individuel', value: 'Bureau individuel', count: annonces.filter(a => a.type === 'Bureau individuel').length, icon: <IconBuilding className="w-5 h-5" /> },
                    { name: 'Bureau double', value: 'Bureau double', count: annonces.filter(a => a.type === 'Bureau double').length, icon: <IconBuilding className="w-5 h-5" /> },
                    { name: 'Bureau 3 pièces', value: 'Bureau 3 pièces', count: annonces.filter(a => a.type === 'Bureau 3 pièces').length, icon: <IconBuilding className="w-5 h-5" /> },
                    { name: 'Bureau 4 pièces et plus', value: 'Bureau 4 pièces et plus', count: annonces.filter(a => a.type === 'Bureau 4 pièces et plus').length, icon: <IconBuilding className="w-5 h-5" /> },
                  ],
                },
                {
                  key: 'magasin',
                  title: 'Magasin',
                  icon: <IconStore className="w-9 h-9 md:w-12 md:h-12 text-neutral-50" />, 
                  items: [
                    { name: 'Magasin simple', value: 'Magasin simple', count: annonces.filter(a => a.type === 'Magasin simple').length, icon: <IconStore className="w-5 h-5" /> },
                    { name: 'Magasin en mezzanine', value: 'Magasin en mezzanine', count: annonces.filter(a => a.type === 'Magasin en mezzanine').length, icon: <IconStoreMezz className="w-5 h-5" /> },
                  ],
                },
                {
                  key: 'voiture',
                  title: 'Voiture',
                  icon: <IconCar className="w-9 h-9 md:w-12 md:h-12 text-neutral-50" />, 
                  items: [
                    { name: 'Berline', value: 'Berline', count: annonces.filter(a => a.type === 'Berline').length, icon: <IconCar className="w-5 h-5" /> },
                    { name: 'Pickup', value: 'Pickup', count: annonces.filter(a => a.type === 'Pickup').length, icon: <IconPickup className="w-5 h-5" /> },
                    { name: 'SUV', value: 'SUV', count: annonces.filter(a => a.type === 'SUV').length, icon: <IconSUV className="w-5 h-5" /> },
                  ],
                },
                {
                  key: 'engin',
                  title: 'Engin',
                  icon: <IconHelmet className="w-9 h-9 md:w-12 md:h-12 text-neutral-50" />, 
                  items: [
                    { name: 'Engin de chantier', value: 'Engin de chantier', count: annonces.filter(a => a.type === 'Engin de chantier').length, icon: <IconHelmet className="w-5 h-5" /> },
                    { name: 'Engin de manutention', value: 'Engin de manutention', count: annonces.filter(a => a.type === 'Engin de manutention').length, icon: <IconForklift className="w-5 h-5" /> },
                    { name: "Engin d'élevage", value: "Engin d'élevage", count: annonces.filter(a => a.type === "Engin d'élevage").length, icon: <IconBarn className="w-5 h-5" /> },
                    { name: 'Engin de mine', value: 'Engin de mine', count: annonces.filter(a => a.type === 'Engin de mine').length, icon: <IconPickaxe className="w-5 h-5" /> },
                    { name: 'Engin agricole', value: 'Engin agricole', count: annonces.filter(a => a.type === 'Engin agricole').length, icon: <IconTractor className="w-5 h-5" /> },
                    { name: 'Camion', value: 'Camion', count: annonces.filter(a => a.type?.startsWith('Camion')).length, icon: <IconTruck className="w-5 h-5" /> },
                  ],
                },
              ]}
              selectedType={selectedType}
              setSelectedType={setSelectedType}
            />
          </div>
        </div>

        {loadingAnnonces ? (
          <div className="w-full flex items-center justify-center py-12">
            <div className="text-center">
              <div className="relative h-16 w-16 mx-auto mb-2">
                <svg className="absolute inset-0 w-12 h-12 m-2 text-neutral-800 house-bounce" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M3 10.5 12 3l9 7.5" />
                  <path d="M5 10v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-9" />
                  <path d="M9 21v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6" />
                </svg>
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-10 h-2 rounded-full bg-neutral-300/60 house-shadow" />
              </div>
              <p className="text-neutral-600 text-sm">Chargement des annonces...</p>
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
        ) : (
          <Row title={(function(){
            const map = { Maison:'maisons', Appartement:'appartements', Bureau:'bureaux', Villa:'villas', Studio:'studios', Chambre:'chambres', Autres:'autres' };
            if (selectedType && selectedType !== 'Tous') {
              const label = map[selectedType] || selectedType.toLowerCase();
              return `Vos ${label} disponibles`;
            }
            return 'Récemment ajoutés';
          })()}>
          {filteredAnnonces.length === 0 ? (
            <div className="w-full flex justify-center px-4">
              <div className="w-full max-w-2xl px-4 py-10 text-center bg-neutral-50 rounded-2xl shadow-sm">
              {(() => {
                const map = { Maison:'maisons', Appartement:'appartements', Bureau:'bureaux', Villa:'villas', Studio:'studios', Chambre:'chambres', Autres:'autres' };
                const label = map[selectedType] || selectedType?.toLowerCase?.() || '';
                return (
                  <>
                    <p className="text-[15px] font-semibold text-neutral-900 mb-1">Aucune publication{selectedType && selectedType !== 'Tous' ? ` pour cette catégorie (${label})` : ''}</p>
                    <p className="text-[13px] text-neutral-600">Aucune publication n'a été faite pour l'instant. Repassez plus tard ou visitez d'autres types de biens disponibles.</p>
                  </>
                );
              })()}
              </div>
            </div>
          ) : (
            filteredAnnonces
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
              ))
          )}
        </Row>
        )}
      </main>
      {/* Mobile bottom toolbar */}
      <MobileTabBar isLoggedIn={isLoggedIn} />
    </div>
  );
}

// Loading component for Suspense fallback
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-white font-sans font-medium md:font-[inherit] md:font-normal">
      <div className="w-full flex items-center justify-center py-12">
        <div className="text-center">
          <div className="relative h-16 w-16 mx-auto mb-2">
            <svg className="absolute inset-0 w-12 h-12 m-2 text-neutral-800 house-bounce" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M3 10.5 12 3l9 7.5" />
              <path d="M5 10v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-9" />
              <path d="M9 21v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6" />
            </svg>
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-10 h-2 rounded-full bg-neutral-300/60 house-shadow" />
          </div>
          <p className="text-neutral-600 text-sm">Chargement...</p>
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
    </div>
  );
}

// Main export with Suspense wrapper
export default function ClientsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ClientsPageContent />
    </Suspense>
  );
}