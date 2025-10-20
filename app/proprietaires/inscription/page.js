"use client";
import { useEffect, useRef, useState } from "react";
import apiService from "@/services/api";
import { Toaster, toast } from 'react-hot-toast';

const STEPS = ["Identité", "Sécurité", "Localisation", "Téléphone", "Vérification"];

function IconBack({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function StepDots({ step }) {
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((_, i) => (
        <span key={i} className={`w-2 h-2 rounded-full ${i<=step? 'bg-neutral-800' : 'bg-neutral-300'}`} />
      ))}
    </div>
  );
}

// Fonctions utilitaires pour le téléphone
const normalizePhoneNumber = (phoneNumber) => {
  let cleaned = phoneNumber.replace(/[\s\-\(\)\+]/g, '');
  
  if (cleaned.startsWith('225')) {
    return cleaned;
  }
  
  if (cleaned.startsWith('0')) {
    return '225' + cleaned.substring(1);
  }
  
  if (!cleaned.startsWith('225')) {
    return '225' + cleaned;
  }
  
  return cleaned;
};

const validatePhoneNumber = (phoneNumber) => {
  const normalized = normalizePhoneNumber(phoneNumber);
  const phoneRegex = /^225[0-9]{10}$/;
  
  return {
    isValid: phoneRegex.test(normalized),
    normalized: normalized,
    error: phoneRegex.test(normalized) ? null : 'Le numéro doit être au format 225xxxxxxxxx (13 chiffres)'
  };
};

export default function InscriptionProprietaire() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    confirmPassword: '',
    lieu: '',
    coords: null,
    phone: '',
    otp: ['', '', '', '', '', '']
  });
  const [touched, setTouched] = useState({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loadingOTP, setLoadingOTP] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [loadingLoc, setLoadingLoc] = useState(false);
  
  // États pour le renouvellement d'OTP
  const [otpStatus, setOtpStatus] = useState(null);
  const [canResend, setCanResend] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  const otpRefs = useRef([]);

  // Vérifier le statut OTP
  const checkOTPStatus = async (phoneNumber) => {
    try {
      const data = await apiService.getOTPStatus(phoneNumber);
      
      if (data.success) {
        setOtpStatus(data);
        setCanResend(data.canResend);
        setResendCount(data.resendCount || 0);
        
        // Démarrer le cooldown si nécessaire
        if (!data.canResend && data.hasActiveOTP) {
          startResendCooldown();
        }
      }
    } catch (error) {
      console.error('Erreur vérification statut OTP:', error);
    }
  };

  // Démarrer le cooldown de renvoi
  const startResendCooldown = () => {
    setResendCooldown(60);
    setCanResend(false);
    const interval = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };


  // Renvoyer un OTP
  const resendOTP = async () => {
    // N'autorise le renvoi que si un OTP actif existe
    if (!canResend || !otpStatus?.hasActiveOTP) {
      setOtpError("Aucun code OTP en attente. Veuillez d'abord demander un code.");
      return;
    }
    
    setLoadingOTP(true);
    setOtpError('');
    
    try {
      const phoneValidation = validatePhoneNumber(form.phone);
      
      const data = await apiService.resendOTP(phoneValidation.normalized);
      
      if (data.success) {
        setResendCount(data.resendCount);
        setCanResend(false);
        startResendCooldown();
        setOtpError('');
        // Réinitialiser les champs OTP
        setForm(prev => ({ ...prev, otp: ['', '', '', '', '', ''] }));
      } else {
        setOtpError(data.message || 'Erreur lors du renvoi');
      }
    } catch (error) {
      setOtpError(error.message || 'Erreur de connexion');
    } finally {
      setLoadingOTP(false);
    }
  };

  // Envoyer un OTP
  const sendOTP = async () => {
    setLoadingOTP(true);
    setOtpError('');
    
    try {
      const phoneValidation = validatePhoneNumber(form.phone);
      
      const data = await apiService.sendOTP(phoneValidation.normalized);
      
      if (data.success) {
        setResendCount(0);
        setCanResend(false);
        startResendCooldown();
        setOtpError('');
        // Vérifier le statut après envoi
        setTimeout(() => checkOTPStatus(phoneValidation.normalized), 1000);
      } else {
        setOtpError(data.message || 'Erreur lors de l\'envoi');
      }
    } catch (error) {
      setOtpError(error.message || 'Erreur de connexion');
    } finally {
      setLoadingOTP(false);
    }
  };

  // Vérifier un OTP
  const handleVerifyOTP = async () => {
    setLoadingOTP(true);
    setOtpError('');
    
    try {
      const phoneValidation = validatePhoneNumber(form.phone);
      
      const data = await apiService.verifyOTP(phoneValidation.normalized, form.otp.join(''));
      
      if (data.success) {
        // OTP vérifié, procéder à l'inscription
        await handleRegister();
      } else {
        setOtpError('Le code de vérification est incorrect ou expiré.');
      }
    } catch (error) {
      setOtpError('Le code de vérification est incorrect ou expiré.');
    } finally {
      setLoadingOTP(false);
    }
  };

  // Inscription finale
  async function handleRegister() {
    setError("");
    setSubmitting(true);
    
    try {
      const phoneValidation = validatePhoneNumber(form.phone);
      
      const payload = {
        nom: `${form.nom} ${form.prenom}`.trim(),
        email: form.email,
        telephone: phoneValidation.normalized,
        password: form.password,
        role: 'proprietaire'
      };

      const json = await apiService.register(payload);
      
      // Afficher une notification de succès avant redirection
      toast.success('Inscription réussie ! Redirection en cours...', {
        duration: 2000,
        position: 'top-center',
      });

      // Redirection après un court délai pour laisser le temps de voir le message
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.href = '/proprietaires/connexion?registered=1';
        }
      }, 2000);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  // Gestion des erreurs
  const allErrors = {
    nom: touched.nom && !form.nom.trim() ? 'Le nom est requis' : '',
    prenom: touched.prenom && !form.prenom.trim() ? 'Le prénom est requis' : '',
    email: touched.email && (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) ? 'Email invalide' : '',
    password: touched.password && form.password.length < 6 ? 'Le mot de passe doit contenir au moins 6 caractères' : '',
    confirmPassword: touched.confirmPassword && form.password !== form.confirmPassword ? 'Les mots de passe ne correspondent pas' : '',
    lieu: touched.lieu && !form.lieu.trim() ? 'Le lieu est requis' : '',
    phone: touched.phone && !validatePhoneNumber(form.phone).isValid ? validatePhoneNumber(form.phone).error : ''
  };

  const setField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (allErrors[field]) {
      setTouched(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...form.otp];
    newOtp[index] = value;
    setForm(prev => ({ ...prev, otp: newOtp }));
    
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  // Fonction pour vérifier si un numéro existe déjà
  const checkPhoneNumberExists = async (phoneNumber) => {
  // Valide côté front AVANT l'appel API
  const validation = validatePhoneNumber(phoneNumber);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }
    if (!phoneNumber || phoneNumber.replace(/\D/g, '').length < 10) {
      throw new Error("Numéro de téléphone invalide");
    }

    try {
      // Formater le numéro
      let formattedPhone = phoneNumber.replace(/\D/g, '');
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '225' + formattedPhone.substring(1);
      } else if (!formattedPhone.startsWith('225')) {
        formattedPhone = '225' + formattedPhone;
      }
      
      // Vérifier la longueur du numéro après formatage
      if (formattedPhone.length < 12) {
        throw new Error("Numéro de téléphone trop court");
      }
      
      // Appeler l'API du backend avec timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 secondes de timeout
      
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/auth/check-phone?phone=${encodeURIComponent(formattedPhone)}`,
          { signal: controller.signal }
        );
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          // Essayer de récupérer le message d'erreur du serveur
          try {
            const errorData = await response.json();
            // Affiche le vrai message d'erreur du backend
            throw new Error(errorData.message || `Erreur serveur: ${response.status}`);
          } catch (parseError) {
            throw new Error(`Erreur serveur: ${response.status} ${response.statusText}`);
          }
        }
        
        const data = await response.json();
        return !!data.exists; // S'assurer qu'on renvoie un booléen
        
      } catch (fetchError) {
        if (fetchError.name === 'AbortError') {
          throw new Error("La vérification du numéro a pris trop de temps. Veuillez réessayer.");
        }
        throw fetchError;
      }
      
    } catch (error) {
      console.error("Erreur lors de la vérification du numéro:", error);
      // Renvoyer false en cas d'erreur pour permettre la continuation du processus
      // plutôt que de bloquer l'utilisateur
      return false;
      // Si vous préférez bloquer en cas d'erreur, décommentez la ligne ci-dessous
      // throw new Error(error.message || "Impossible de vérifier le numéro. Veuillez réessayer plus tard.");
    }
  };

  // Fonction pour valider les champs d'une étape
  const isStepValid = (step) => {
    switch (step) {
      case 0: // Identité
        if (!form.nom.trim() || !form.prenom.trim()) {
          setError("Veuillez renseigner votre nom et prénom");
          return false;
        }
        return true;
        
      case 1: // Sécurité
        if (!form.email.trim()) {
          setError("L'email est requis");
          return false;
        }
        if (!/\S+@\S+\.\S+/.test(form.email)) {
          setError("Veuillez entrer une adresse email valide");
          return false;
        }
        if (!form.password) {
          setError("Le mot de passe est requis");
          return false;
        }
        if (form.password.length < 6) {
          setError("Le mot de passe doit contenir au moins 6 caractères");
          return false;
        }
        if (form.password !== form.confirmPassword) {
          setError("Les mots de passe ne correspondent pas");
          return false;
        }
        return true;
        
      case 2: // Localisation
        if (!form.lieu.trim()) {
          setError("Veuvez sélectionner votre localisation");
          return false;
        }
        return true;
        
      case 3: // Téléphone
        if (!form.phone || form.phone.replace(/\D/g, '').length < 10) {
          setError("Veuillez entrer un numéro de téléphone valide");
          return false;
        }
        return true;
        
      case 4: // Vérification
        if (otpCode.length !== 6) {
          setError("Veuillez entrer le code de vérification complet");
          return false;
        }
        return true;
        
      default:
        return true;
    }
  };

  // La fonction isStepValid est définie plus bas dans le code

  const next = async () => {
    if (!isStepValid(step)) {
      return;
    }

    if (step === 3) {
      // Étape téléphone - vérifier d'abord si le numéro existe
      try {
        setSubmitting(true);
        setError('');
        
        // Vérifier d'abord si le numéro est valide
        const phoneNumber = form.phone.replace(/\D/g, '');
        if (phoneNumber.length < 10) {
          setError("Veuillez entrer un numéro de téléphone valide");
          setSubmitting(false);
          return;
        }
        
        // Vérifier si le numéro existe déjà
        const phoneExists = await checkPhoneNumberExists(phoneNumber);
        if (phoneExists) {
          setError("Ce numéro de téléphone est déjà utilisé. Veuillez vous connecter ou utiliser un autre numéro.");
          setSubmitting(false);
          return;
        }
        
        // Si le numéro n'existe pas, envoyer l'OTP
        const otpSentSuccessfully = await sendOTP();
        if (otpSentSuccessfully !== false) {
          setStep(prev => prev + 1);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification du numéro:", error);
        setError(error.message || "Une erreur est survenue lors de la vérification du numéro");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    setStep(prev => Math.min(prev + 1, STEPS.length - 1));
  };

  const prev = () => {
    setStep(prev => Math.max(prev - 1, 0));
  };

  async function locateMe() {
    if (!navigator.geolocation) {
      setError("La géolocalisation n'est pas supportée par votre navigateur");
      return;
    }

    setLoadingLoc(true);
    setError('');
    let position;

    try {
      // Récupérer la position GPS
      position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000
        });
      });

      const { latitude, longitude } = position.coords;
      
      // Utiliser le service de géocodage de OpenStreetMap (gratuit, sans clé API)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=fr`
      );
      
      if (!response.ok) {
        throw new Error('Impossible de récupérer l\'adresse');
      }

      const data = await response.json();
      
      // Construire une adresse au format "Ville, Quartier"
      let address = '';
      if (data.address) {
        const addr = data.address;
        
        // Pour Abidjan, on veut le format "Abidjan, Quartier"
        if (data.display_name && data.display_name.includes('Abidjan')) {
          const parts = data.display_name.split(',').map(p => p.trim());
          // On cherche "Abidjan" et le quartier (généralement l'élément juste avant)
          const abidjanIndex = parts.findIndex(p => p === 'Abidjan');
          if (abidjanIndex > 0) {
            const quartier = parts[abidjanIndex - 1];
            address = `Abidjan, ${quartier}`;
          } else if (abidjanIndex === 0 && parts.length > 1) {
            // Si Abidjan est le premier élément, on prend le suivant
            address = `Abidjan, ${parts[1]}`;
          }
        }
        
        // Si on n'a pas pu construire l'adresse avec la méthode ci-dessus
        if (!address) {
          // On essaie de récupérer la ville et le quartier depuis les champs individuels
          const city = addr.city || addr.town || addr.state || '';
          const quartier = addr.suburb || addr.village || addr.hamlet || '';
          
          if (city && quartier) {
            address = `${city}, ${quartier}`;
          } else if (city) {
            address = city;
          } else if (quartier) {
            address = quartier;
          }
        }
      }
      
      // Si on n'a toujours pas d'adresse, utiliser les coordonnées
      if (!address.trim()) {
        address = `Position: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      }

      // Si on a une adresse, on l'utilise, sinon on utilise les coordonnées
      setForm(f => ({ 
        ...f, 
        coords: { latitude, longitude }, 
        lieu: address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
      }));

    } catch (error) {
      console.error('Erreur de géolocalisation:', error);
      if (position?.coords) {
        // En cas d'erreur, on garde les coordonnées brutes
        setForm(f => ({ 
          ...f, 
          coords: { 
            latitude: position.coords.latitude, 
            longitude: position.coords.longitude 
          }, 
          lieu: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}` 
        }));
      }
      setError('Adresse non trouvée, coordonnées GPS utilisées');
    } finally {
      setLoadingLoc(false);
    }
  }

  function goBack(){
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/proprietaires";
    }
  }

  // La fonction isStepValid est définie plus haut dans le code

  return (
    <div className="min-h-screen vh-stable bg-neutral-50 font-sans font-medium md:font-normal">
      <div className="max-w-[720px] mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="block md:hidden">
              <button onClick={goBack} aria-label="Retour" className="inline-flex items-center justify-center rounded-full w-10 h-10 bg-neutral-100 hover:bg-neutral-200 shadow-sm transition-colors">
                <IconBack className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div className="hidden md:block">
              <button onClick={goBack} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 shadow-sm transition-colors">
                <IconBack className="w-4 h-4 text-gray-600" />
                Retour
              </button>
            </div>
            <h1 className="text-[22px] leading-7 md:text-lg font-semibold text-neutral-900">Créer un compte propriétaire</h1>
          </div>
          <StepDots step={step} />
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 rounded-full bg-neutral-200 overflow-hidden mb-5">
          <div className="h-full bg-neutral-800 transition-all" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
        </div>

        <div className="rounded-3xl bg-neutral-50 shadow-sm p-4 space-y-4">
          {step === 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-[15px] font-semibold text-neutral-900">Nom</label>
                <input 
                  value={form.nom} 
                  onChange={e => setField('nom', e.target.value)} 
                  onBlur={() => setTouched(t => ({...t, nom: true}))}
                  className={`mt-1 w-full h-11 px-3 rounded-xl ${touched.nom && allErrors.nom ? 'border border-red-500' : 'border border-transparent'} bg-[#F5F5F5] outline-none text-[16px] text-neutral-900 placeholder:text-neutral-600 placeholder:font-medium shadow-inner focus:bg-[#EDEDED]`} 
                  placeholder="Votre nom" 
                />
                {touched.nom && allErrors.nom && <p className="mt-1 text-xs text-red-600">{allErrors.nom}</p>}
              </div>
              <div>
                <label className="text-[15px] font-semibold text-neutral-900">Prénom</label>
                <input 
                  value={form.prenom} 
                  onChange={e => setField('prenom', e.target.value)} 
                  onBlur={() => setTouched(t => ({...t, prenom: true}))}
                  className={`mt-1 w-full h-11 px-3 rounded-xl ${touched.prenom && allErrors.prenom ? 'border border-red-500' : 'border border-transparent'} bg-[#F5F5F5] outline-none text-[16px] text-neutral-900 placeholder:text-neutral-600 placeholder:font-medium shadow-inner focus:bg-[#EDEDED]`} 
                  placeholder="Votre prénom" 
                />
                {touched.prenom && allErrors.prenom && <p className="mt-1 text-xs text-red-600">{allErrors.prenom}</p>}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-[15px] font-semibold text-neutral-900">Email</label>
                <input 
                  type="email"
                  value={form.email} 
                  onChange={e => setField('email', e.target.value)} 
                  onBlur={() => setTouched(t => ({...t, email: true}))}
                  className={`mt-1 w-full h-11 px-3 rounded-xl ${touched.email && allErrors.email ? 'border border-red-500' : 'border border-transparent'} bg-[#F5F5F5] outline-none text-[16px] text-neutral-900 placeholder:text-neutral-600 placeholder:font-medium shadow-inner focus:bg-[#EDEDED]`} 
                  placeholder="votre@email.com" 
                />
                {touched.email && allErrors.email && <p className="mt-1 text-xs text-red-600">{allErrors.email}</p>}
              </div>
              <div>
                <label className="text-[15px] font-semibold text-neutral-900">Mot de passe</label>
                <input 
                  type="password"
                  value={form.password} 
                  onChange={e => setField('password', e.target.value)} 
                  onBlur={() => setTouched(t => ({...t, password: true}))}
                  className={`mt-1 w-full h-11 px-3 rounded-xl ${touched.password && allErrors.password ? 'border border-red-500' : 'border border-transparent'} bg-[#F5F5F5] outline-none text-[16px] text-neutral-900 placeholder:text-neutral-600 placeholder:font-medium shadow-inner focus:bg-[#EDEDED]`} 
                  placeholder="Minimum 6 caractères" 
                />
                {touched.password && allErrors.password && <p className="mt-1 text-xs text-red-600">{allErrors.password}</p>}
              </div>
              <div>
                <label className="text-[15px] font-semibold text-neutral-900">Confirmer le mot de passe</label>
                <input 
                  type="password"
                  value={form.confirmPassword} 
                  onChange={e => setField('confirmPassword', e.target.value)} 
                  onBlur={() => setTouched(t => ({...t, confirmPassword: true}))}
                  className={`mt-1 w-full h-11 px-3 rounded-xl ${touched.confirmPassword && allErrors.confirmPassword ? 'border border-red-500' : 'border border-transparent'} bg-[#F5F5F5] outline-none text-[16px] text-neutral-900 placeholder:text-neutral-600 placeholder:font-medium shadow-inner focus:bg-[#EDEDED]`} 
                  placeholder="Répétez votre mot de passe" 
                />
                {touched.confirmPassword && allErrors.confirmPassword && <p className="mt-1 text-xs text-red-600">{allErrors.confirmPassword}</p>}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <label className="text-[15px] font-semibold text-neutral-900">Localisation</label>
              <div className="mt-1 flex gap-2">
                <input 
                  value={form.lieu} 
                  onChange={e => setField('lieu', e.target.value)} 
                  onBlur={() => setTouched(t => ({...t, lieu: true}))}
                  className={`flex-1 h-11 px-3 rounded-xl ${touched.lieu && allErrors.lieu ? 'border border-red-500' : 'border border-transparent'} bg-[#F5F5F5] outline-none text-[16px] text-neutral-900 placeholder:text-neutral-600 placeholder:font-medium shadow-inner focus:bg-[#EDEDED]`} 
                  placeholder="Ville, quartier..." 
                />
                <button type="button" onClick={locateMe} className="h-11 px-4 rounded-full bg-neutral-100 hover:bg-neutral-200 shadow-sm">
                  {loadingLoc ? 'Localisation...' : 'Me localiser'}
                </button>
              </div>
              {touched.lieu && allErrors.lieu && <p className="mt-1 text-xs text-red-600">{allErrors.lieu}</p>}
              {form.coords && (
                <div className="mt-2 text-[12px] text-neutral-600">Coordonnées: {form.coords.latitude.toFixed(4)}, {form.coords.longitude.toFixed(4)}</div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-[15px] font-semibold text-neutral-900">Numéro de téléphone</label>
                <input 
                  value={form.phone} 
                  onChange={e => setField('phone', e.target.value)} 
                  onBlur={() => setTouched(t => ({...t, phone: true}))}
                  className={`mt-1 w-full h-11 px-3 rounded-xl ${touched.phone && allErrors.phone ? 'border border-red-500' : 'border border-transparent'} bg-[#F5F5F5] outline-none text-[16px] text-neutral-900 placeholder:text-neutral-600 placeholder:font-medium shadow-inner focus:bg-[#EDEDED]`} 
                  placeholder="Ex. 2250701234567" 
                />
                {touched.phone && allErrors.phone && <p className="mt-1 text-xs text-red-600">{allErrors.phone}</p>}
                <p className="mt-1 text-[12px] text-neutral-600">Format requis: 225xxxxxxxxx (ex: 2250701234567)</p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div>
                <label className="text-[15px] font-semibold text-neutral-900">Code OTP</label>
                <div className="mt-1 grid grid-cols-6 gap-2">
                  {Array.from({length:6}).map((_,i)=> (
                    <input
                      key={i}
                      ref={el => otpRefs.current[i] = el}
                      maxLength={1}
                      value={form.otp[i]}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      className="text-center h-11 rounded-xl border border-transparent bg-[#F5F5F5] outline-none shadow-inner focus:bg-[#EDEDED]"
                    />
                  ))}
                </div>
                <div className="text-[12px] text-neutral-600 mt-2">
                  Saisissez le code reçu par SMS pour vérifier votre numéro.
                </div>
                {otpError && <p className="mt-1 text-xs text-red-600">{otpError}</p>}
              </div>
              
              {/* Section renvoi d'OTP */}
              <div className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-neutral-600">
                    {otpStatus?.hasActiveOTP && (
                      <span>Code non reçu ?</span>
                    )}
                  </div>
                  
                  <button
                    type="button"
                    onClick={resendOTP}
                    disabled={!canResend || loadingOTP || !otpStatus?.hasActiveOTP}
                    className={`px-4 py-2 text-sm rounded-full transition-colors ${
                      canResend && !loadingOTP
                        ? 'bg-neutral-800 text-white hover:bg-neutral-700 shadow-sm'
                        : 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                    }`}
                  >
                    {loadingOTP ? 'Envoi...' : 
                     resendCooldown > 0 ? `Attendre ${resendCooldown}s` :
                     resendCount >= 2 ? 'Limite atteinte' :
                     'Renvoyer le code'}
                  </button>
                </div>
                
                {resendCount > 0 && (
                  <p className="text-[12px] text-neutral-500 mt-1">
                    {resendCount === 2 ? 'Limite de renvoi atteinte' : 
                     `Vous avez renvoyé ${resendCount} fois`}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
    </div>

    <div className="mt-4 flex items-center justify-between">
      <button 
        onClick={prev} 
        disabled={step === 0} 
        className="px-4 h-11 rounded-full bg-neutral-100 hover:bg-neutral-200 shadow-sm font-semibold text-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Précédent
      </button>
      
      {step === 4 ? (
        <div className="flex gap-2 justify-center">
          <button
            type="button"
            onClick={handleVerifyOTP}
            disabled={submitting || form.otp.some(digit => digit === '')}
            className="px-4 py-2 rounded-full bg-neutral-800 text-white font-semibold shadow-sm hover:bg-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Vérification...' : 'Valider le code'}
          </button>
          <button
            type="button"
            onClick={resendOTP}
            disabled={!canResend || loadingOTP || !otpStatus?.hasActiveOTP}
            className={`px-4 py-2 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loadingOTP ? 'Envoi...' : 'Renvoyer le code'}
          </button>
          {!canResend && resendCooldown > 0 && (
            <span className="text-sm text-neutral-500 flex items-center">({resendCooldown}s)</span>
          )}
        </div>
      ) : (
        <button
          onClick={(e) => {
            e.preventDefault();
            setError(''); // Réinitialiser les erreurs précédentes
            if (isStepValid(step)) {
              next();
            } else {
              // Afficher un message d'erreur si la validation échoue
              if (step === 0 && (!form.nom.trim() || !form.prenom.trim())) {
                setError("Veuillez remplir tous les champs obligatoires");
              } else if (step === 1 && (!form.email || !form.password || form.password !== form.confirmPassword)) {
                setError("Veuillez vérifier votre email et votre mot de passe");
              } else if (step === 2 && !form.lieu) {
                setError("Veuvez sélectionner votre localisation");
              } else if (step === 3 && form.phone.replace(/\D/g, '').length < 10) {
                setError("Veuillez entrer un numéro de téléphone valide");
              }
            }
          }}
          disabled={submitting}
          className="px-6 h-11 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {submitting ? 'Chargement...' : step === 3 ? 'Envoyer le code' : 'Suivant'}
        </button>
      )}
      
    </div>
    {error && (
      <div className="mt-3 text-sm text-red-600 text-center">{error}</div>
    )}
    <div className="mt-6 text-center text-[15px] text-neutral-600">
      Vous avez déjà un compte ? <a href="/proprietaires/connexion" className="text-[#4A9B8E] hover:underline">Se connecter</a>
    </div>
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
  </div>
);
}
