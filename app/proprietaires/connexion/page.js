"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import apiService from "@/services/api";
import { Toaster, toast } from 'react-hot-toast';

export default function ConnexionProprietaire() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState({
    email: "",
    password: ""
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await apiService.login({
        email: data.email,
        password: data.password
      });

      // Stocker le token d'authentification (clé dédiée propriétaire)
      if (response.token) {
        localStorage.setItem("auth_token_owner", response.token);
      } else {
        throw new Error('Erreur lors de la connexion: pas de token reçu');
      }
      
      // Stocker les données utilisateur (clé dédiée propriétaire)
      if (response.user) {
        const userData = {
          ...response.user,
          _id: response.user.id || response.user._id
        };
        localStorage.setItem("userData_owner", JSON.stringify(userData));
      }
      
      toast.success('Connexion réussie ! Redirection en cours...', {
        duration: 2000,
        position: 'top-center',
      });

      setTimeout(() => {
        window.location.href = "/proprietaires#loggedin";
      }, 2000);
    } catch (error) {
      console.error('Erreur de connexion:', error);
      
      // Messages d'erreur plus explicites
      let errorMessage = "Erreur de connexion";
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.message) {
        errorMessage = error.response.message;
      } else if (error.status === 401) {
        errorMessage = "Email ou mot de passe incorrect";
      } else if (error.status === 400) {
        errorMessage = "Veuillez vérifier vos informations";
      } else if (error.status >= 500) {
        errorMessage = "Problème de serveur. Veuillez réessayer plus tard";
      }
      
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const t = setTimeout(() => setPageLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4 font-sans font-medium md:font-normal">
        <div className="text-center">
          <div className="relative h-16 w-16 mx-auto mb-2">
            <svg className="absolute inset-0 w-12 h-12 m-2 text-neutral-800 house-bounce" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M3 10.5 12 3l9 7.5" />
              <path d="M5 10v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-9" />
              <path d="M9 21v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6" />
            </svg>
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-10 h-2 rounded-full bg-neutral-300/60 house-shadow" />
          </div>
          <p className="text-gray-600">Chargement...</p>
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
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4 relative font-sans font-medium md:font-normal">
      <Toaster
        position="top-center"
        toastOptions={{
          className: 'rounded-2xl shadow text-[13px] font-medium',
          style: { background: '#ffffff', color: '#111827' },
          success: {
            iconTheme: { primary: '#16a34a', secondary: '#eaffea' },
            style: { borderLeft: '4px solid #16a34a' }
          },
          error: {
            iconTheme: { primary: '#dc2626', secondary: '#ffecec' },
            style: { borderLeft: '4px solid #dc2626' }
          }
        }}
      />
      {/* Header right actions: Support & Hamburger */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <button
          type="button"
          aria-label="Contacter le support"
          className="hidden sm:inline-flex items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-900 transition-colors font-semibold px-4 h-9 whitespace-nowrap shadow-sm"
          onClick={() => setSupportModalOpen(true)}
        >
          <svg className="w-5 h-5 min-w-[20px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-1c0-1.1.9-2 2-2s2-.9 2-2-1-2-2-2-2 .9-2 2"/>
            <circle cx="12" cy="18" r="1.2"/>
          </svg>
          <span className="ml-2 text-[15px]">Support</span>
        </button>
        <button
          aria-label="Menu"
          onClick={() => setMenuOpen(v => !v)}
          className="w-10 h-10 rounded-full bg-neutral-100 shadow-sm flex items-center justify-center"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-12 w-56 rounded-2xl bg-neutral-50 shadow-sm backdrop-blur overflow-hidden z-50">
            <div className="py-1 text-sm">
              <a href="/proprietaires" onClick={() => setMenuOpen(false)} className="block px-4 py-3 hover:bg-black/[.04]">Accueil propriétaires</a>
              <a href="/proprietaires/inscription" onClick={() => setMenuOpen(false)} className="block px-4 py-3 hover:bg-black/[.04]">Créer un compte</a>
              <a href="/clients" onClick={() => setMenuOpen(false)} className="block px-4 py-3 hover:bg-black/[.04]">Espace clients</a>
            </div>
          </div>
        )}
      </div>
      <button 
        onClick={() => router.back()}
        className="absolute top-4 left-4 inline-flex items-center justify-center rounded-full px-4 h-10 bg-neutral-100 hover:bg-neutral-200 transition-colors shadow-sm"
        aria-label="Retour"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-gray-600">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
      </button>
      <div className="w-full max-w-md">
        <div className="bg-neutral-50 rounded-3xl shadow-sm p-8">
          <div className="text-center mb-8">
            <h1 className="text-[22px] leading-7 md:text-base font-semibold text-neutral-900 mb-1">Connexion Propriétaire</h1>
            <p className="text-[12px] text-neutral-600">Accédez à votre espace propriétaire</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 rounded-xl text-red-700 text-sm shadow-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[15px] font-semibold text-neutral-900 mb-2">Email</label>
              <input
                type="email"
                value={data.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#F5F5F5] text-[16px] text-neutral-900 placeholder:text-neutral-600 placeholder:font-medium shadow-inner focus:outline-none focus:bg-[#EDEDED]"
                placeholder="votre@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-[15px] font-semibold text-neutral-900 mb-2">Mot de passe</label>
              <input
                type="password"
                value={data.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#F5F5F5] text-[16px] text-neutral-900 placeholder:text-neutral-600 placeholder:font-medium shadow-inner focus:outline-none focus:bg-[#EDEDED]"
                placeholder="Votre mot de passe"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full px-6 py-3 rounded-full bg-neutral-800 text-white shadow-sm hover:bg-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {submitting ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[15px] text-neutral-600">
              Pas encore de compte ?{" "}
              <button
                onClick={() => router.push("/proprietaires/inscription")}
                className="text-[#4A9B8E] hover:text-[#3a8b7e] font-semibold transition-colors"
              >
                S'inscrire
              </button>
            </p>
          </div>
        </div>
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
              ✕
            </button>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Contacter le support</h3>
            <p className="text-sm text-neutral-700 mb-4">Notre équipe est disponible pour vous aider.</p>
            <div className="space-y-3 text-sm">
              <a href="mailto:support@monhebergement.com" className="block px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 transition-colors">support@monhebergement.com</a>
              <a href="tel:+33123456789" className="block px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 transition-colors">+33 1 23 45 67 89</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
