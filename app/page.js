'use client';

import { useEffect, useState, useRef } from 'react';

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
  const heroVideoRef = useRef(null);
  const videoBannerRef = useRef(null);

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

  useEffect(() => {
    const ensureSmoothLoop = (video) => {
      if (!video) return () => {};

      const threshold = 0.12;

      const handleTimeUpdate = () => {
        if (video.duration && video.currentTime >= video.duration - threshold) {
          video.currentTime = 0.02;
          video.play();
        }
      };

      const handleLoaded = () => {
        video.currentTime = 0;
        video.play();
      };

      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('loadedmetadata', handleLoaded);

      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('loadedmetadata', handleLoaded);
      };
    };

    const cleanupHero = ensureSmoothLoop(heroVideoRef.current);
    const cleanupBanner = ensureSmoothLoop(videoBannerRef.current);

    return () => {
      cleanupHero?.();
      cleanupBanner?.();
    };
  }, []);

  return (
    <div className="font-sans min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
      {/* HERO avec image pleine largeur et overlay avec vidéo optionnelle */}
      <section className="relative min-h-[400px] sm:min-h-[440px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          {/* Vidéo de fond */}
          <video
            ref={heroVideoRef}
            src="/maison.mp4"
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            disableRemotePlayback
            aria-hidden="true"
          />
          {/* Overlay avec gradient teal */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#4A9B8E]/60 via-[#4A9B8E]/40 to-neutral-900/70"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-6 py-6 sm:py-8 w-full z-10">
          <div 
            data-reveal 
            id="hero-text" 
            className={`max-w-3xl transition-all duration-1000 ${isVisible['hero-text'] ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <IconStar className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">Meilleure plateforme de location</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-tight mb-6">
              Visitez votre futur logement
              <span className="block mt-2 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                sans bouger de chez vous
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-white/90 leading-relaxed mb-8 max-w-2xl">
              Découvrez des milliers de biens immobiliers depuis votre canapé. Explorez chaque pièce, chaque détail, et trouvez votre logement idéal en toute tranquillité.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="#search" 
                className="group inline-flex items-center justify-center gap-3 h-14 px-8 rounded-2xl bg-gradient-to-r from-[#4A9B8E] to-[#3a8b7e] text-white font-semibold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                <IconSearch className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                Commencer la recherche
              </a>
              <a 
                href="/clients" 
                className="group inline-flex items-center justify-center gap-3 h-14 px-8 rounded-2xl border-2 border-white/50 text-white font-semibold hover:bg-white/10 backdrop-blur-sm transition-all duration-300"
              >
                <IconHome className="w-5 h-5" />
                Découvrir les logements
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section className="px-6 py-16 bg-gradient-to-br from-neutral-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div 
            data-reveal
            id="services-title"
            className={`text-center mb-12 transition-all duration-1000 ${isVisible['services-title'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">Comment ça marche</h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Suivez trois étapes simples pour trouver et réserver votre prochain logement en toute sérénité.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {title:'1. Créez votre compte', icon:<IconRocket className="w-8 h-8" />, desc:'Inscrivez-vous ou connectez-vous pour accéder à toutes nos fonctionnalités.'},
              {title:'2. Explorez nos biens', icon:<IconSearch className="w-8 h-8" />, desc:'Parcourez nos annonces détaillées et découvrez chaque logement en visite virtuelle.'},
              {title:'3. Visitez et réservez', icon:<IconHome className="w-8 h-8" />, desc:'Planifiez une visite, contactez le propriétaire et finalisez votre réservation.'},
            ].map((step, idx) => (
              <div 
                key={idx}
                data-reveal
                id={`service-${idx}`}
                className={`group p-8 rounded-2xl bg-white border-2 border-neutral-200 shadow-lg hover:shadow-2xl hover:border-[#4A9B8E] transition-all duration-500 hover:-translate-y-2 text-center ${isVisible[`service-${idx}`] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              >
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4A9B8E] to-[#3a8b7e] text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">{step.title}</h3>
                <div className="h-1 w-16 bg-gradient-to-r from-[#4A9B8E] to-[#3a8b7e] mx-auto mb-4"></div>
                <p className="text-neutral-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BANDEAU FEATURES SUR IMAGE */}
      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto overflow-hidden rounded-3xl relative shadow-2xl min-h-[520px] lg:min-h-[600px]">
          <img 
            src="https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?q=80&w=2200&auto=format&fit=crop" 
            alt="Luxury interior" 
            className="w-full h-[520px] lg:h-[600px] object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#4A9B8E]/95 via-[#4A9B8E]/90 to-transparent"></div>
          <div className="absolute inset-y-0 left-0 w-full sm:w-1/2 flex items-center p-8 sm:p-12 lg:p-16">
            <div 
              data-reveal
              id="awesome-features"
              className={`max-w-xl text-white transition-all duration-1000 ${isVisible['awesome-features'] ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
            >
              <h3 className="text-3xl sm:text-4xl font-bold mb-6">Découvrez la visite virtuelle</h3>
              <p className="text-lg text-white/90 mb-10 leading-relaxed">
                Immersion totale, disponibilité 24h/24 et narration guidée : explorez chaque bien comme si vous y étiez réellement avant même de vous déplacer.
              </p>
              <div className="space-y-6">
                {[
                  {title: 'Immersion 360°', icon: '🌀', desc: 'Déplacez-vous librement dans chaque pièce, changez d’angle et zoomez sur les détails importants.'},
                  {title: 'Visite à votre rythme', icon: '🕒', desc: 'Revenez autant de fois que nécessaire et partagez le lien avec votre entourage en toute simplicité.'},
                  {title: 'Décisions éclairées', icon: '🔍', desc: 'Comparez les biens en ligne, prenez des notes et préparez votre shortlist avant toute visite physique.'},
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-2xl">
                      <span>{feature.icon}</span>
                    </div>
                    <div className="text-left">
                      <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
                      <p className="text-sm sm:text-base text-white/85 leading-relaxed">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="px-6 py-16 bg-gradient-to-br from-neutral-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div 
            data-reveal
            id="testimonials-title"
            className={`text-center mb-12 transition-all duration-1000 ${isVisible['testimonials-title'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">Témoignages clients</h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Découvrez ce que nos clients pensent de leur expérience avec Mon Hebergement
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {name: 'Sarah Kouassi', role: 'Locataire', img: '/photo1.jpg', quote: "Service rapide et fiable. La visite virtuelle m'a fait gagner beaucoup de temps. J'ai trouvé mon appartement idéal sans me déplacer !"},
              {name: 'Jean-Pierre Diabaté', role: 'Propriétaire', img: '/photo2.jpg', quote: 'Excellente plateforme pour mettre en location mon bien. Les visites virtuelles sont de qualité et les locataires sont sérieux.'},
              {name: 'Aminata Traoré', role: 'Locataire', img: '/photo3.jpg', quote: 'Je recommande vivement ! Le processus est simple, transparent et efficace. Mon nouveau logement correspond parfaitement à mes attentes.'},
            ].map((testimonial, i) => (
              <div 
                key={i}
                data-reveal
                id={`testimonial-${i}`}
                className={`group rounded-2xl border-2 border-neutral-200 bg-white p-8 shadow-lg hover:shadow-2xl hover:border-[#4A9B8E] transition-all duration-500 ${isVisible[`testimonial-${i}`] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              >
                <div className="flex items-center justify-center mb-6">
                  <img 
                    src={testimonial.img}
                    alt={testimonial.name}
                    className="h-20 w-20 rounded-full object-cover border-4 border-[#4A9B8E]/20"
                  />
                </div>
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, idx) => (
                    <IconStar key={idx} className="w-5 h-5 text-[#4A9B8E]" />
                  ))}
                </div>
                <p className="text-neutral-700 italic leading-relaxed mb-6 text-center">
                  "{testimonial.quote}"
                </p>
                <div className="text-center">
                  <div className="font-bold text-neutral-900">{testimonial.name}</div>
                  <div className="text-sm text-neutral-600">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VIDEO BANNER */}
      <section className="relative min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <video
            ref={videoBannerRef}
            src="/360%20maison.mp4"
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            disableRemotePlayback
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#4A9B8E]/70 via-neutral-900/80 to-neutral-900/90"></div>
        </div>
        <div className="relative z-10 text-center px-6">
          <div 
            data-reveal
            id="video-banner"
            className={`transition-all duration-1000 ${isVisible['video-banner'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Découvrez nos propriétés en vidéo
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Explorez chaque détail de nos biens immobiliers avec nos visites virtuelles haute qualité
            </p>
            <button className="group inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/95 backdrop-blur-sm text-[#4A9B8E] shadow-2xl hover:scale-110 transition-all duration-300">
              <svg className="w-10 h-10 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* LATEST BLOG */}
      <section className="px-6 py-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div 
            data-reveal
            id="blog-title"
            className={`text-center mb-12 transition-all duration-1000 ${isVisible['blog-title'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">Derniers articles</h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Conseils, astuces et inspirations pour votre projet immobilier
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {img: '1570129477492-45c003edd2be', date: '15 Mars 2025', author: 'Admin', title: 'Achat immobilier: erreurs à éviter', desc: 'Découvrez les principales erreurs à éviter lors de l\'achat d\'un bien immobilier et nos conseils pour un investissement réussi.'},
              {img: '1522708323590-d24dbb6b0267', date: '12 Mars 2025', author: 'Admin', title: 'Comment préparer une visite virtuelle', desc: 'Tous nos conseils pour optimiser votre visite virtuelle et ne rien manquer lors de l\'exploration d\'un bien.'},
              {img: '1505691723518-36a5ac3be353', date: '10 Mars 2025', author: 'Admin', title: 'Les tendances immobilières 2025', desc: 'Découvrez les tendances qui marquent le secteur immobilier cette année et les opportunités à saisir.'},
            ].map((article, i) => (
              <article 
                key={i}
                data-reveal
                id={`blog-${i}`}
                className={`group rounded-2xl overflow-hidden border-2 border-neutral-200 bg-white shadow-lg hover:shadow-2xl hover:border-[#4A9B8E] transition-all duration-500 hover:-translate-y-2 ${isVisible[`blog-${i}`] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              >
                <div className="relative overflow-hidden">
                  <img 
                    src={`https://images.unsplash.com/photo-${article.img}?q=80&w=800&auto=format&fit=crop`} 
                    alt={article.title}
                    className="h-56 w-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#4A9B8E] text-white shadow-lg">
                      Article
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="text-xs text-neutral-500 mb-3">
                    {article.author} • {article.date}
                  </div>
                  <h3 className="font-bold text-xl text-neutral-900 mb-3 group-hover:text-[#4A9B8E] transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-neutral-600 leading-relaxed mb-4">
                    {article.desc}
                  </p>
                  <a 
                    href="#"
                    className="inline-flex items-center gap-2 text-[#4A9B8E] font-semibold hover:underline"
                  >
                    Lire la suite
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer 
        data-reveal 
        id="footer" 
        className={`relative bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white overflow-hidden transition-all duration-1000 ${isVisible['footer'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#4A9B8E]/10 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4 mb-12">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#4A9B8E] to-[#3a8b7e] flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">MH</span>
                </div>
                <span className="text-2xl font-bold">Mon Hebergement</span>
              </div>
              <p className="text-white/80 leading-relaxed mb-6 max-w-md">
                La plateforme de référence pour découvrir votre logement idéal depuis votre domicile en Côte d'Ivoire. Explorez, visitez virtuellement et trouvez votre bien en toute simplicité.
              </p>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#4A9B8E]">100+</div>
                  <div className="text-sm text-white/70">Biens publiés</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#4A9B8E]">5K+</div>
                  <div className="text-sm text-white/70">Clients satisfaits</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#4A9B8E]">95%</div>
                  <div className="text-sm text-white/70">Satisfaction</div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Liens rapides</h4>
              <ul className="space-y-3 text-white/70">
                <li><a href="/clients" className="hover:text-[#4A9B8E] transition-colors">Rechercher un logement</a></li>
                <li><a href="/clients" className="hover:text-[#4A9B8E] transition-colors">Découvrir les logements</a></li>
                <li><a href="#" className="hover:text-[#4A9B8E] transition-colors">Comment ça marche</a></li>
                <li><a href="#" className="hover:text-[#4A9B8E] transition-colors">À propos de nous</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Support</h4>
              <ul className="space-y-3 text-white/70">
                <li><a href="#" className="hover:text-[#4A9B8E] transition-colors">Centre d'aide</a></li>
                <li><a href="#" className="hover:text-[#4A9B8E] transition-colors">Nous contacter</a></li>
                <li><a href="#" className="hover:text-[#4A9B8E] transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-[#4A9B8E] transition-colors">Guide vidéo</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/60 text-sm">
              © {new Date().getFullYear()} Mon Hebergement — Tous droits réservés
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-white/60 hover:text-[#4A9B8E] transition-colors">Conditions d'utilisation</a>
              <a href="#" className="text-white/60 hover:text-[#4A9B8E] transition-colors">Confidentialité</a>
              <a href="#" className="text-white/60 hover:text-[#4A9B8E] transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

