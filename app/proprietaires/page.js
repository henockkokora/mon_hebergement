"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

function IconPin({ className = "w-4 h-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M16 3l5 5-6.5 6.5" />
      <path d="M17 8l-6 6" />
      <path d="M2 22l7-7" />
    </svg>
  );
}

function IconTrendingUp({ className = "w-4 h-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 7L13.5 15.5L8.5 10.5L2 17"/>
      <path d="M16 7H22V13"/>
    </svg>
  );
}

function IconEye({ className = "w-4 h-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function IconMessageCircle({ className = "w-4 h-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    </svg>
  );
}

function IconCalendar({ className = "w-4 h-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}

function Kpi({ label, value, icon: Icon, color = "emerald" }) {
  const colorClasses = {
    emerald: {
      bg: "bg-gradient-to-br from-emerald-50 to-white",
      icon: "text-emerald-500",
      border: "border-emerald-200",
      text: "text-emerald-700"
    },
    blue: {
      bg: "bg-gradient-to-br from-blue-50 to-white", 
      icon: "text-blue-500",
      border: "border-blue-200",
      text: "text-blue-700"
    },
    purple: {
      bg: "bg-gradient-to-br from-purple-50 to-white", 
      icon: "text-purple-500",
      border: "border-purple-200",
      text: "text-purple-700"
    },
    orange: {
      bg: "bg-gradient-to-br from-orange-50 to-white", 
      icon: "text-orange-500",
      border: "border-orange-200",
      text: "text-orange-700"
    },
    red: {
      bg: "bg-gradient-to-br from-red-50 to-white", 
      icon: "text-red-500",
      border: "border-red-200",
      text: "text-red-700"
    }
  };

  const colors = colorClasses[color] || colorClasses.emerald;

  return (
    <div className={`relative overflow-hidden rounded-3xl bg-neutral-50 shadow-sm p-5 transition-all duration-300 hover:shadow group border-none`}>
      
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="p-2.5 rounded-full bg-[#F5F5F5] shadow-inner border-none">
          <Icon className={`w-5 h-5 ${colors.icon}`} />
        </div>
      </div>
      
      {/* Tracés décoratifs supprimés pour un rendu Flat (profondeur par ombre uniquement) */}
    </div>
  );
}

import apiService from "../services/api";

export default function ProprietairesDashboard() {
  const [range, setRange] = useState("7d");
  const [toast, setToast] = useState("");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // États pour le support
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [supportMessage, setSupportMessage] = useState("");
  const [supportLoading, setSupportLoading] = useState(false);
  const [supportFeedback, setSupportFeedback] = useState(null);

  useEffect(() => {
    if (window.location.hash === "#loggedin") {
      setToast("Connexion réussie !");
      setTimeout(()=>setToast(""), 3000);
      window.location.hash = "";
    }
  }, []);

  // Fonction pour gérer l'envoi du formulaire de support
  async function handleSupportSubmit(e) {
    e.preventDefault();
    setSupportLoading(true);
    setSupportFeedback(null);
    
    // Récupérer les infos du propriétaire depuis localStorage
    const userData = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('userData_owner') || '{}') : {};
    
    // Préparer les données du formulaire
    const formData = {
      nom: userData.nom || 'Propriétaire',
      email: userData.email || '',
      telephone: userData.telephone || '',
      message: supportMessage,
      type: 'proprietaire' // Ajout du type pour le backend
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
        setTimeout(() => {
          setSupportModalOpen(false);
          setSupportFeedback(null);
        }, 1800);
      } else {
        throw new Error(res.message || 'Erreur lors de l\'envoi');
      }
    } catch (err) {
      console.error('Erreur:', err);
      setSupportFeedback({ 
        type: 'error', 
        message: 'Une erreur est survenue. Veuillez réessayer plus tard.' 
      });
    } finally {
      setSupportLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    setError("");
    apiService.getProprietaireStats()
      .then(data => setStats(data))
      .catch(e => setError(e.message || "Erreur de chargement des stats"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setSupportModalOpen(true)}
            className="inline-flex items-center gap-2 h-11 px-4 rounded-full bg-[#F5F5F5] hover:bg-[#EDEDED] text-[#24766A] transition-all font-semibold shadow"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-1c0-1.1.9-2 2-2s2-.9 2-2-1-2-2-2-2 .9-2 2"/><circle cx="12" cy="18" r="1.2"/></svg>
            <span className="hidden sm:inline">Support</span>
          </button>
          
          {/* Modal Support */}
          {supportModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 min-h-screen py-8">
              <div className="bg-neutral-50 rounded-2xl shadow-sm w-full max-w-[420px] mx-4 p-6 relative my-auto">
                <button
                  className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 transition-colors"
                  onClick={() => {
                    setSupportModalOpen(false);
                    setSupportFeedback(null);
                  }}
                  aria-label="Fermer"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 6l12 12M6 18L18 6"/></svg>
                </button>
                <h2 className="text-2xl font-bold mb-5 text-neutral-900">Contacter le support</h2>
                <form onSubmit={handleSupportSubmit} className="space-y-4">
                  <div>
                    <textarea 
                      className="w-full rounded-lg px-4 py-3 min-h-[120px] bg-[#F5F5F5] text-base text-neutral-900 placeholder:text-neutral-500 shadow-inner focus:outline-none focus:bg-[#EDEDED] resize-none" 
                      placeholder="Décrivez votre problème ou posez votre question..." 
                      required 
                      value={supportMessage} 
                      onChange={e => setSupportMessage(e.target.value)} 
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="w-full bg-neutral-800 text-white rounded-full py-3 font-semibold hover:bg-neutral-700 transition-colors text-base shadow-sm" 
                    disabled={supportLoading}
                  >
                    {supportLoading ? 'Envoi en cours...' : 'Envoyer'}
                  </button>
                  {supportFeedback && (
                    <div className={`flex items-center justify-center gap-2 mt-3 p-3 rounded-lg ${
                      supportFeedback.type === 'success' 
                        ? 'bg-green-50 text-green-700' 
                        : 'bg-red-50 text-red-700'
                    }`}>
                      {supportFeedback.type === 'success' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path d="M5 13l4 4L19 7"/>
                        </svg>
                      )}
                      <span className="text-sm font-medium">{supportFeedback.message}</span>
                    </div>
                  )}
                </form>
              </div>
            </div>
          )}
          <a href="/proprietaires/nouvelle" className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-neutral-800 text-white font-medium shadow-sm transition-colors hover:bg-neutral-700">
            <IconPin className="w-4 h-4" /> Publier une nouvelle annonce
          </a>
        </div>
      </div>

      {/* Grille de statistiques stylées */}
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="text-center">
            <div className="relative h-16 w-16 mx-auto mb-2">
              <svg className="absolute inset-0 w-12 h-12 m-2 text-neutral-800 house-bounce" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M3 10.5 12 3l9 7.5" />
                <path d="M5 10v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-9" />
                <path d="M9 21v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6" />
              </svg>
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-10 h-2 rounded-full bg-neutral-300/60 house-shadow" />
            </div>
            <p className="text-neutral-600 text-sm">Chargement des statistiques...</p>
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
      ) : error ? (
        <div className="text-red-600 text-center">{error}</div>
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Kpi 
            label="Annonces actives" 
            value={stats.annoncesActives ?? 0} 
            icon={IconCalendar}
            trend={stats.tauxEvolutionActives ?? 0}
            color="emerald"
          />
          <Kpi 
            label="Annonces expirées" 
            value={stats.annoncesExpirees ?? 0} 
            icon={IconCalendar}
            trend={stats.tauxEvolutionExpirees ?? 0}
            color="red"
          />
          <Kpi 
            label="Total des Vues des annonces (7j)" 
            value={stats.vues7j ?? 0} 
            icon={IconEye}
            trend={stats.tauxEvolutionVues ?? 0}
            color="purple"
          />
          <Kpi 
            label="Contacts (7j)" 
            value={stats.contacts7j ?? 0} 
            icon={IconMessageCircle}
            trend={stats.tauxEvolutionContacts ?? 0}
            color="orange"
          />
        </div>
      ) : null}

      <div className="rounded-3xl bg-neutral-50 shadow-sm p-4">
        <h2 className="text-lg font-semibold mb-4">Statut des annonces</h2>
        <div className="h-64 flex items-center justify-center">
          <div className="relative w-48 h-48">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {stats?.annoncesActives + stats?.annoncesExpirees || 0}
                </div>
                <div className="text-sm text-gray-500">Total annonces</div>
              </div>
            </div>
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="10"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#10b981"
                strokeWidth="10"
                strokeDasharray={`${(stats?.annoncesActives / (stats?.annoncesActives + stats?.annoncesExpirees)) * 283} 283`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
                className="transition-all duration-1000"
              />
            </svg>
          </div>
          <div className="ml-8 space-y-3">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div>
              <span className="text-sm">Actives: {stats?.annoncesActives || 0}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
              <span className="text-sm">Expirées: {stats?.annoncesExpirees || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
