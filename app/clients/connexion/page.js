"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Notification from "@/components/Notification";

function IconBack({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

export default function ConnexionClient() {
  const [phone, setPhone] = useState("225");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  function goBack(){
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/clients";
    }
  }

  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: 'error' });
  const router = useRouter();

  const showNotification = useCallback((message, type = 'error') => {
    setNotification({ message, type });
  }, []);

  const closeNotification = useCallback(() => {
    setNotification({ message: '', type: 'error' });
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    closeNotification();
    
    // Validation des champs
    if (!phone.trim() || !password) {
      showNotification("Veuillez remplir tous les champs");
      setSubmitting(false);
      return;
    }
    
    try {
      // Formater le numéro de téléphone si nécessaire
      let formattedPhone = phone.replace(/\D/g, ''); // Supprime tous les caractères non numériques
      
      // S'assurer que le numéro commence par 225 si nécessaire
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '225' + formattedPhone.substring(1);
      } else if (!formattedPhone.startsWith('225')) {
        formattedPhone = '225' + formattedPhone;
      }
      
      const api = (await import("../../services/api")).default;
      const loginData = { 
        telephone: formattedPhone, 
        password 
      };
      
      // Utiliser la méthode loginPhone
      const res = await api.loginPhone(loginData);
      
      if (res.token) {
        // Stocker le token d'authentification
        localStorage.setItem("auth_token", res.token);
        
        // Stocker les données utilisateur si disponibles
        if (res.user) {
          const userData = {
            _id: res.user.id || res.user._id,
            email: res.user.email,
            role: res.user.role,
            nom: res.user.nom,
            telephone: res.user.telephone
          };
          localStorage.setItem("userData", JSON.stringify(userData));
          console.log('Données utilisateur stockées:', userData);
        } else {
          console.warn('Aucune donnée utilisateur reçue dans la réponse de connexion');
        }
        
        showNotification("Connexion réussie ! Redirection...", 'success');
        
        // Notification système native du navigateur
        if (typeof window !== 'undefined' && 'Notification' in window) {
          if (Notification.permission === 'granted') {
            new window.Notification('Connexion réussie !', {
              body: 'Bienvenue dans votre espace client',
              icon: '/icon.png'
            });
          } else if (Notification.permission !== 'denied') {
            window.Notification.requestPermission().then(permission => {
              if (permission === 'granted') {
                new window.Notification('Connexion réussie !', {
                  body: 'Bienvenue dans votre espace client',
                  icon: '/icon.png'
                });
              }
            });
          }
        }
        
        setTimeout(() => router.push("/clients"), 1000);
      } else {
        showNotification(res.message || "Connexion impossible. Veuillez vérifier vos identifiants.");
      }
    } catch (err) {
      let errorMessage = "Une erreur est survenue lors de la connexion. Veuillez réessayer.";
      
      if (err.response) {
        errorMessage = err.response.data?.message || "Identifiants incorrects";
      } else if (err.request) {
        errorMessage = "Impossible de se connecter au serveur. Vérifiez votre connexion internet.";
      } else if (err.message) {
        errorMessage = `Erreur: ${err.message}`;
      }
      
      showNotification(errorMessage);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen vh-stable bg-gradient-to-b from-neutral-50 to-white font-sans font-medium md:font-normal">
      <div className="max-w-[520px] mx-auto px-4 py-10">
        {/* Back controls: icon on mobile, button on desktop */}
        <div className="flex items-center gap-2 mb-4">
          <div className="block md:hidden">
            <button onClick={goBack} aria-label="Retour" className="inline-flex items-center justify-center rounded-full w-10 h-10 bg-neutral-100 hover:bg-neutral-200 shadow-sm">
              <IconBack className="w-5 h-5" />
            </button>
          </div>
          <div className="hidden md:block">
            <button onClick={goBack} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 shadow-sm">
              <IconBack className="w-4 h-4" />
              Retour
            </button>
          </div>
        </div>
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-neutral-800 text-white font-bold text-lg">M</div>
          <h1 className="mt-3 text-[22px] leading-7 md:text-base font-semibold text-neutral-900">Connexion</h1>
          <p className="mt-1 text-[12px] text-neutral-600">Accédez à votre espace client</p>
        </div>

        <form onSubmit={onSubmit} className="rounded-2xl bg-neutral-50 shadow-sm p-4 space-y-4">
          <div>
            <label className="text-[15px] font-semibold text-neutral-900">Numéro de téléphone (225xxxxxxxxx)</label>
            <div className="relative mt-1">
              <div className="absolute left-3 top-0 bottom-0 flex items-center text-neutral-500 pointer-events-none">
                +225
              </div>
              <input
                type="tel"
                value={phone.replace('225', '')}
                onChange={(e) => {
                  // Ne garder que les chiffres et limiter à 10 chiffres (après le 225)
                  let value = e.target.value.replace(/\D/g, '').substring(0, 10);
                  setPhone('225' + value);
                }}
                placeholder="0700000000"
                className="w-full h-11 pl-14 pr-3 rounded-xl bg-[#F5F5F5] outline-none text-[16px] placeholder:text-neutral-600 placeholder:font-medium shadow-inner focus:bg-[#EDEDED]"
                maxLength={10}
              />
            </div>
          </div>
          <div>
            <label className="text-[15px] font-semibold text-neutral-900">Mot de passe</label>
            <div className="mt-1 relative">
              <input
                type={showPwd? 'text':'password'}
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                placeholder="Votre mot de passe"
                className="w-full h-11 px-3 pr-20 rounded-xl bg-[#F5F5F5] outline-none text-[16px] placeholder:text-neutral-600 placeholder:font-medium shadow-inner focus:bg-[#EDEDED]"
              />
              <button type="button" onClick={()=>setShowPwd(v=>!v)} className="absolute right-2 top-1/2 -translate-y-1/2 px-3 h-8 text-xs rounded-full bg-neutral-100 hover:bg-neutral-200 shadow-sm">{showPwd? 'Masquer':'Afficher'}</button>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <a href="#" className="text-[#4A9B8E] hover:underline font-semibold">Mot de passe oublié ?</a>
            <a href="/clients/inscription" className="text-[#4A9B8E] hover:underline font-semibold">Créer un compte</a>
          </div>
          <div className="pt-2">
            <button type="submit" className="w-full h-11 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white font-semibold disabled:opacity-60 shadow-sm" disabled={submitting}>{submitting ? "Connexion..." : "Se connecter"}</button>
          </div>
        </form>
        
        <Notification 
          message={notification.message}
          type={notification.type}
          onClose={closeNotification}
        />
        <div className="mt-6 text-center text-[15px] text-neutral-600">
          Pas encore de compte ? <a href="/clients/inscription" className="text-[#4A9B8E] hover:underline font-semibold">Créer un compte</a>
        </div>
      </div>
    </div>
  );
}
