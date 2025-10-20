'use client';

import { useEffect, useState } from 'react';

// Icônes SVG
function IconRocket({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
    </svg>
  );
}

function IconClock({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12,6 12,12 16,14"/>
    </svg>
  );
}

function IconSearch({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="11" cy="11" r="7"/>
      <path d="M21 21l-4.35-4.35"/>
    </svg>
  );
}

function IconUpload({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
      <polyline points="14,2 14,8 20,8"/>
      <line x1="12" y1="18" x2="12" y2="12"/>
      <polyline points="9,15 12,12 15,15"/>
    </svg>
  );
}

function IconHome({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 10.5 12 3l9 7.5"/>
      <path d="M5 10v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-9"/>
      <path d="M9 21v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6"/>
    </svg>
  );
}

function IconShield({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  );
}

function IconStar({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  );
}

export default function Home() {
  const [isVisible, setIsVisible] = useState({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({
              ...prev,
              [entry.target.id]: true
            }));
          } else {
            // Réinitialiser l'état quand l'élément sort du viewport
            // pour permettre l'animation quand on remonte
            setIsVisible(prev => ({
              ...prev,
              [entry.target.id]: false
            }));
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = document.querySelectorAll('[data-reveal]');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="font-sans min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
      {/* Hero */}
      <section className="relative px-6 pt-6 pb-12 sm:pt-8 sm:pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#4A9B8E]/5 via-transparent to-[#4A9B8E]/10"></div>
        <div className="relative max-w-7xl mx-auto grid gap-8 lg:grid-cols-2 items-center">
          <div 
            data-reveal
            id="hero-text"
            className={`space-y-6 transition-all duration-1000 ${isVisible['hero-text'] ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#4A9B8E]/10 border border-[#4A9B8E]/20">
              <IconStar className="w-4 h-4 text-[#4A9B8E]" />
              <span className="text-sm font-medium text-[#4A9B8E]">Meilleur plateforme de location</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-900 bg-clip-text text-transparent">
              Louer et vendre plus vite grâce aux 
              <span className="text-[#4A9B8E]"> visites virtuelles</span>
            </h1>
            <p className="text-lg text-neutral-600 leading-relaxed max-w-2xl">
              Révolutionnez votre expérience immobilière avec des visites 360°, des publications intelligentes et une plateforme qui connecte propriétaires et clients en toute simplicité.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="/proprietaires/inscription" className="group inline-flex items-center justify-center gap-3 h-14 px-8 rounded-2xl bg-gradient-to-r from-[#4A9B8E] to-[#3a8b7e] text-white font-semibold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                <IconRocket className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                Espace propriétaire
              </a>
              <a href="/clients" className="group inline-flex items-center justify-center gap-3 h-14 px-8 rounded-2xl border-2 border-[#4A9B8E] text-[#4A9B8E] font-semibold hover:bg-[#4A9B8E] hover:text-white transition-all duration-300">
                <IconSearch className="w-5 h-5" />
                Parcourir les biens
              </a>
            </div>
          </div>
          <div 
            data-reveal
            id="hero-video"
            className={`relative group transition-all duration-1000 delay-300 ${isVisible['hero-video'] ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0'}`}
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-[#4A9B8E]/20 to-[#3a8b7e]/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-300"></div>
            <div className="relative aspect-video w-full rounded-3xl overflow-hidden border-2 border-white/50 bg-black shadow-2xl">
              <video 
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                poster="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80"
                suppressHydrationWarning={true}
              >
                <source src="/360 maison.mp4" type="video/mp4" />
                <source src="/maison.mp4" type="video/mp4" />
                Votre navigateur ne supporte pas la lecture vidéo.
              </video>
              <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-neutral-800">🏠 Visite 360° en direct</span>
                </div>
              </div>
              <div className="absolute bottom-6 right-6 bg-gradient-to-r from-black/70 to-black/50 backdrop-blur text-white px-4 py-2 rounded-2xl shadow-lg">
                <span className="text-sm font-medium">✨ Immersion totale</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-10 bg-white text-neutral-900">
        <div className="max-w-6xl mx-auto grid gap-6 md:grid-cols-3">
          <div 
            data-reveal
            id="feature-1"
            className={`group p-7 rounded-2xl border border-neutral-200 bg-gradient-to-br from-white to-neutral-50 hover:border-[#4A9B8E]/30 hover:shadow-xl transition-all duration-700 hover:-translate-y-1 text-center ${isVisible['feature-1'] ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#4A9B8E] to-[#3a8b7e] text-white mb-4 group-hover:scale-110 transition-transform duration-300 mx-auto">
              <IconUpload className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-3">Publication facile</h3>
            <p className="text-neutral-600 leading-relaxed">
              Uploadez vos photos/vidéos, précisez la localisation et le type de bien. Mise en ligne en quelques minutes.
            </p>
          </div>
          <div 
            data-reveal
            id="feature-2"
            className={`group p-7 rounded-2xl border border-neutral-200 bg-gradient-to-br from-white to-neutral-50 hover:border-[#4A9B8E]/30 hover:shadow-xl transition-all duration-700 delay-200 hover:-translate-y-1 text-center ${isVisible['feature-2'] ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#4A9B8E] to-[#3a8b7e] text-white mb-4 group-hover:scale-110 transition-transform duration-300 mx-auto">
              <IconClock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-3">Durée flexible</h3>
            <p className="text-neutral-600 leading-relaxed">
              Choisissez 7, 15 ou 30 jours. À expiration, l'annonce est retirée automatiquement, avec option de renouvellement.
            </p>
          </div>
          <div 
            data-reveal
            id="feature-3"
            className={`group p-7 rounded-2xl border border-neutral-200 bg-gradient-to-br from-white to-neutral-50 hover:border-[#4A9B8E]/30 hover:shadow-xl transition-all duration-700 delay-400 hover:-translate-y-1 text-center ${isVisible['feature-3'] ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#4A9B8E] to-[#3a8b7e] text-white mb-4 group-hover:scale-110 transition-transform duration-300 mx-auto">
              <IconSearch className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-3">Recherche avancée</h3>
            <p className="text-neutral-600 leading-relaxed">
              Filtrez par ville, quartier, prix et type de bien. Visionnez les médias et contactez le propriétaire.
            </p>
          </div>
        </div>
      </section>

      {/* Propriétaires */}
      <section id="proprietaires" className="px-6 py-12 bg-[var(--background)] text-[var(--foreground)]">
        <div className="max-w-6xl mx-auto grid gap-8 md:grid-cols-2 items-center">
          <div 
            data-reveal
            id="proprietaires-text"
            className={`transition-all duration-1000 ${isVisible['proprietaires-text'] ? 'translate-x-0 opacity-100' : '-translate-x-12 opacity-0'}`}
          >
            <h2 className="text-2xl sm:text-3xl font-bold">Espace propriétaire</h2>
            <ul className="mt-4 space-y-2 text-sm text-neutral-700 list-disc pl-5">
              <li>Publiez en quelques étapes (photos/vidéos, localisation, prix).</li>
              <li>Payez les frais de publication (ex. 500–1 000 FCFA) selon la durée.</li>
              <li>Renouvelez pour prolonger la visibilité.</li>
            </ul>
            <a href="/proprietaires/inscription" className="mt-6 inline-flex h-11 px-5 items-center justify-center rounded-full bg-[#4A9B8E] text-white font-medium">
              Commencer une annonce
            </a>
          </div>
          <div 
            data-reveal
            id="proprietaires-image"
            className={`transition-all duration-1000 delay-300 ${isVisible['proprietaires-image'] ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0'}`}
          >
            <div className="rounded-2xl overflow-hidden">
              <img 
                src="/proprietaire.jpg" 
                alt="Espace propriétaire" 
                className="w-full h-72 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Clients */}
      <section id="clients" className="px-6 py-12 bg-white text-neutral-900">
        <div className="max-w-6xl mx-auto grid gap-8 md:grid-cols-2 items-center">
          <div 
            data-reveal
            id="clients-image"
            className={`order-2 md:order-1 transition-all duration-1000 ${isVisible['clients-image'] ? 'translate-x-0 opacity-100' : '-translate-x-12 opacity-0'}`}
          >
            <div className="rounded-2xl overflow-hidden">
              <img 
                src="/client.jpg" 
                alt="Espace client" 
                className="w-full h-72 object-cover"
              />
            </div>
          </div>
          <div 
            data-reveal
            id="clients-text"
            className={`order-1 md:order-2 transition-all duration-1000 delay-300 ${isVisible['clients-text'] ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0'}`}
          >
            <h2 className="text-2xl sm:text-3xl font-bold">Espace client</h2>
            <ul className="mt-4 space-y-2 text-sm text-neutral-700 list-disc pl-5">
              <li>Recherchez par ville, quartier, prix, type de bien.</li>
              <li>Visionnez les photos et vidéos avant de vous déplacer.</li>
              <li>Contactez le propriétaire en toute simplicité.</li>
            </ul>
            <a href="/clients" className="mt-6 inline-flex h-11 px-5 items-center justify-center rounded-full border border-[#4A9B8E] text-[#4A9B8E] hover:bg-[#4A9B8E]/10 font-medium">
              Chercher un bien
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-gradient-to-br from-neutral-900 to-neutral-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#4A9B8E]/10 to-transparent"></div>
        <div className="relative px-6 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid gap-10 md:grid-cols-4 mb-10">
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#4A9B8E] to-[#3a8b7e] flex items-center justify-center">
                    <span className="text-white font-bold text-lg">M</span>
                  </div>
                  <span className="text-2xl font-bold">Mon Hebergement</span>
                </div>
                <p className="text-neutral-300 text-lg leading-relaxed mb-6">
                  La plateforme de référence pour louer et vendre vos biens immobiliers grâce aux visites virtuelles 360°.
                </p>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#4A9B8E]">100+</div>
                    <div className="text-sm text-neutral-400">Biens publiés</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#4A9B8E]">5K+</div>
                    <div className="text-sm text-neutral-400">Clients</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#4A9B8E]">95%</div>
                    <div className="text-sm text-neutral-400">Satisfaction</div>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Liens rapides</h4>
                <div className="space-y-3">
                  <a href="/proprietaires/inscription" className="block text-neutral-300 hover:text-[#4A9B8E] transition-colors">Espace propriétaire</a>
                  <a href="/clients" className="block text-neutral-300 hover:text-[#4A9B8E] transition-colors">Espace client</a>
                  <a href="#" className="block text-neutral-300 hover:text-[#4A9B8E] transition-colors">Tarifs</a>
                  <a href="#" className="block text-neutral-300 hover:text-[#4A9B8E] transition-colors">À propos</a>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Support</h4>
                <div className="space-y-3">
                  <a href="#" className="block text-neutral-300 hover:text-[#4A9B8E] transition-colors">Centre d'aide</a>
                  <a href="#" className="block text-neutral-300 hover:text-[#4A9B8E] transition-colors">Contact</a>
                  <a href="#" className="block text-neutral-300 hover:text-[#4A9B8E] transition-colors">FAQ</a>
                  <a href="#" className="block text-neutral-300 hover:text-[#4A9B8E] transition-colors">Guide vidéo</a>
                </div>
              </div>
            </div>
            <div className="border-t border-neutral-700 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-neutral-400">
                © {new Date().getFullYear()} Mon Hebergement — Tous droits réservés
              </p>
              <div className="flex gap-6">
                <a href="#" className="text-neutral-400 hover:text-[#4A9B8E] transition-colors">Conditions</a>
                <a href="#" className="text-neutral-400 hover:text-[#4A9B8E] transition-colors">Confidentialité</a>
                <a href="#" className="text-neutral-400 hover:text-[#4A9B8E] transition-colors">Cookies</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

