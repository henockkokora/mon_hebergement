"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import apiService from "@/services/api";
import Notification from "@/components/Notification";

function IconBack({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

const STEPS = ["Identité", "Sécurité", "Téléphone", "Vérification"];

function StepDots({ step }) {
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((_, i) => (
        <span key={i} className={`w-2 h-2 rounded-full ${i <= step ? "bg-neutral-800" : "bg-neutral-200"}`} />
      ))}
    </div>
  );
}

// Style global pour supprimer le contour de focus par défaut
const globalStyles = `
  input:focus, select:focus, textarea:focus, button:focus {
    outline: none !important;
    box-shadow: none !important;
  }
`;

export default function InscriptionClient() {
  const router = useRouter();
  
  // Injecter le style global
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = globalStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: 'error' });
  
  const showNotification = useCallback((message, type = 'error') => {
    setNotification({ message, type });
  }, []);

  const closeNotification = useCallback(() => {
    setNotification({ message: '', type: 'error' });
  }, []);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [otpStatus, setOtpStatus] = useState(null);
  
  const [data, setData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    password: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState({});

  // Timer pour le renvoi d'OTP
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(resendTimer => resendTimer - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Vérifier le statut OTP
  const checkOtpStatus = async (phoneNumber) => {
    try {
      const response = await apiService.getOTPStatus(phoneNumber);
      setOtpStatus(response);
      setResendCount(response.resendCount || 0);
      setCanResend(response.canResend || false);
      if (response.resendTimer) {
        setResendTimer(response.resendTimer);
      }
    } catch (error) {
      console.error("Erreur lors de la vérification du statut OTP:", error);
    }
  };

  // Renvoyer le code OTP
  const resendOtp = async () => {
    if (!canResend || resendCount >= 2) return;
    
    setSubmitting(true);
    setOtpError("");
    
    try {
      const response = await apiService.resendOTP(data.telephone);
      
      showNotification("Code OTP renvoyé avec succès !");
      setResendCount(prev => prev + 1);
      setCanResend(false);
      setResendTimer(60); // 1 minute
      
      setTimeout(() => setNotification({ message: '', type: 'error' }), 3000);
    } catch (error) {
      setOtpError(error.message || "Erreur lors du renvoi du code");
    } finally {
      setSubmitting(false);
    }
  };

  // Envoyer le code OTP
  const sendOtp = async (isResend = false) => {
    if (isSendingOtp) return false;
    
    setSubmitting(true);
    setIsSendingOtp(true);
    setOtpError("");
    
    try {
      const response = isResend 
        ? await apiService.resendOTP(data.telephone)
        : await apiService.sendOTP(data.telephone);
      
      // Mettre à jour l'état et afficher le message de succès
      setOtpSent(true);
      showNotification(`Code OTP ${isResend ? 'renvoyé' : 'envoyé'} avec succès !`, 'success');
      setResendTimer(60); // 1 minute avant de pouvoir renvoyer
      setCanResend(false);
      
      // Démarrer le compte à rebours
      const timer = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Nettoyer l'intervalle si le composant est démonté
      return () => clearInterval(timer);
      
    } catch (error) {
      // Si un code a déjà été envoyé, on considère que c'est un succès
      if (error.message.includes('déjà été envoyé')) {
        setOtpSent(true);
        showNotification("Un code a déjà été envoyé. Vérifiez votre téléphone.");
        return true;
      }
      
      const errorMessage = error.message || "Erreur lors de l'envoi du code";
      showNotification(errorMessage);
      setOtpError(errorMessage);
      setCanResend(true);
      return false;
    } finally {
      setSubmitting(false);
      setIsSendingOtp(false);
    }
    
    return true;
  };

  // Vérifier le code OTP
  const verifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setOtpError("Veuillez saisir un code à 6 chiffres");
      return;
    }
    
    setSubmitting(true);
    setOtpError("");
    
    try {
      const response = await apiService.verifyOTP(data.telephone, otpCode);
      
      setOtpVerified(true);
      showNotification("Code OTP vérifié avec succès !", 'success');
    } catch (error) {
      // Message d'erreur convivial pour l'utilisateur
      const userFriendlyMessage = "Le code de vérification est incorrect ou a expiré. Veuillez demander un nouveau code si nécessaire.";
      showNotification(userFriendlyMessage);
      setOtpError(userFriendlyMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const validateStep = (stepIndex) => {
    const newErrors = {};
    
    switch (stepIndex) {
      case 0: // Identité
        if (!data.nom.trim()) newErrors.nom = "Le nom est requis";
        if (!data.prenom.trim()) newErrors.prenom = "Le prénom est requis";
        if (!data.email.trim()) newErrors.email = "L'email est requis";
        else if (!/\S+@\S+\.\S+/.test(data.email)) newErrors.email = "Email invalide";
        break;
        
      case 1: // Sécurité
        if (!data.password) newErrors.password = "Le mot de passe est requis";
        else if (data.password.length < 6) newErrors.password = "Le mot de passe doit contenir au moins 6 caractères";
        if (!data.confirmPassword) newErrors.confirmPassword = "Confirmez votre mot de passe";
        else if (data.password !== data.confirmPassword) newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
        break;
        
      case 2: // Téléphone
        if (!data.telephone.trim()) newErrors.telephone = "Le numéro de téléphone est requis";
        else if (!/^225[0-9]{10}$/.test(data.telephone.replace(/[\s\-\(\)]/g, ''))) {
          newErrors.telephone = "Format invalide. Utilisez le format 225xxxxxxxxx";
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Fonction pour vérifier si un numéro existe déjà
  const checkPhoneNumberExists = async (phoneNumber) => {
    try {
      // Formater le numéro
      let formattedPhone = phoneNumber.replace(/\D/g, '');
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '225' + formattedPhone.substring(1);
      } else if (!formattedPhone.startsWith('225')) {
        formattedPhone = '225' + formattedPhone;
      }
      const response = await apiService.checkPhoneNumber(formattedPhone);
      return response.exists;
    } catch (error) {
      console.error('❌ Erreur lors de la vérification du numéro:', error);
      throw new Error(error.message || 'Erreur lors de la vérification du numéro');
    }
  };

  const handleNext = async () => {
    if (!validateStep(step)) return;
    
    if (step === 2) {
      // Étape téléphone - vérifier d'abord si le numéro existe
      try {
        setSubmitting(true);
        
        // Vérifier d'abord si le numéro est valide
        const phoneNumber = data.telephone.replace(/\D/g, '');
        if (phoneNumber.length < 10) {
          showNotification("Veuillez entrer un numéro de téléphone valide");
          return;
        }
        
        // Vérifier si le numéro existe déjà
        const phoneExists = await checkPhoneNumberExists(phoneNumber);
        if (phoneExists) {
          showNotification("Ce numéro de téléphone est déjà utilisé. Veuillez vous connecter ou utiliser un autre numéro.");
          return;
        }
        
        // Si le numéro n'existe pas, envoyer l'OTP
        const otpSentSuccessfully = await sendOtp();
        if (otpSentSuccessfully) {
          setStep(step + 1);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification du numéro:", error);
        showNotification(error.message || "Une erreur est survenue lors de la vérification du numéro");
      } finally {
        setSubmitting(false);
      }
      return;
    }
    
    if (step === 3) {
      // Étape vérification - vérifier OTP
      await verifyOtp();
      return;
    }

    setStep(step + 1);
  };


  const handleSubmit = async () => {
    if (!otpVerified) {
      showNotification("Veuillez vérifier votre numéro de téléphone");
      return;
    }
    
    setSubmitting(true);
    closeNotification();
    
    try {
      const response = await apiService.register({
        ...data,
        role: "client"
      });
      
      showNotification("Inscription réussie ! Redirection...", 'success');
      localStorage.setItem("auth_token", response.token);
      
      setTimeout(() => {
        router.push("/clients");
      }, 2000);
      
    } catch (error) {
      showNotification(error.message || "Erreur lors de l'inscription");
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 font-sans font-medium md:font-normal">
      {/* Header */}
      <div className="bg-neutral-50 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
            aria-label="Retour"
          >
            <IconBack />
          </button>
          <div className="flex-1 flex items-center gap-4">
            <h1 className="text-[22px] leading-7 md:text-base font-semibold text-neutral-900 whitespace-nowrap">Inscription Client</h1>
            <div className="flex-1">
              <StepDots step={step} />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-8">
        <Notification 
          message={notification.message}
          type={notification.type}
          onClose={closeNotification}
        />

        {/* Étape 0: Identité */}
        {step === 0 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-md font-semibold text-neutral-900 mb-1">Identité</h3>
              <p className="text-neutral-600 text-xs">Renseignez vos informations personnelles</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[15px] font-semibold text-neutral-900 mb-2">Nom *</label>
                <input
                  type="text"
                  value={data.nom}
                  onChange={(e) => handleInputChange("nom", e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl text-[16px] placeholder:text-neutral-600 placeholder:font-medium bg-[#F5F5F5] shadow-inner focus:bg-[#EDEDED]`}
                  placeholder="Votre nom"
                />
                {errors.nom && <p className="mt-1 text-sm text-red-600">{errors.nom}</p>}
              </div>
              
              <div>
                <label className="block text-[15px] font-semibold text-neutral-900 mb-2">Prénom *</label>
                <input
                  type="text"
                  value={data.prenom}
                  onChange={(e) => handleInputChange("prenom", e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl text-[16px] placeholder:text-neutral-600 placeholder:font-medium bg-[#F5F5F5] shadow-inner focus:bg-[#EDEDED]`}
                  placeholder="Votre prénom"
                />
                {errors.prenom && <p className="mt-1 text-sm text-red-600">{errors.prenom}</p>}
              </div>
              
              <div>
                <label className="block text-[15px] font-semibold text-neutral-900 mb-2">Email *</label>
                <input
                  type="email"
                  value={data.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl text-[16px] placeholder:text-neutral-600 placeholder:font-medium bg-[#F5F5F5] shadow-inner focus:bg-[#EDEDED]`}
                  placeholder="votre@email.com"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Étape 1: Sécurité */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-md font-semibold text-neutral-900 mb-1">Sécurité</h3>
              <p className="text-neutral-600 text-xs">Créez un mot de passe sécurisé</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[15px] font-semibold text-neutral-900 mb-2">Mot de passe *</label>
                <input
                  type="password"
                  value={data.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl text-[16px] placeholder:text-neutral-600 placeholder:font-medium bg-[#F5F5F5] shadow-inner focus:bg-[#EDEDED]`}
                  placeholder="Minimum 6 caractères"
                />
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>
              
              <div>
                <label className="block text-[15px] font-semibold text-neutral-900 mb-2">Confirmer le mot de passe *</label>
                <input
                  type="password"
                  value={data.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl text-[16px] placeholder:text-neutral-600 placeholder:font-medium bg-[#F5F5F5] shadow-inner focus:bg-[#EDEDED]`}
                  placeholder="Répétez votre mot de passe"
                />
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Étape 2: Téléphone */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 mb-1">Vérification téléphone</h2>
              <p className="text-neutral-600 text-xs">Nous allons vous envoyer un code de vérification</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[15px] font-semibold text-neutral-900 mb-2">Numéro de téléphone *</label>
                <input
                  type="tel"
                  value={data.telephone}
                  onChange={(e) => handleInputChange("telephone", e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl text-[16px] placeholder:text-neutral-600 placeholder:font-medium bg-[#F5F5F5] shadow-inner focus:bg-[#EDEDED]`}
                  placeholder="225xxxxxxxxx"
                />
                {errors.telephone && <p className="mt-1 text-sm text-red-600">{errors.telephone}</p>}
                <p className="mt-1 text-xs text-neutral-500">Format: 225 suivi de 10 chiffres</p>
              </div>
            </div>
          </div>
        )}

        {/* Étape 3: Vérification OTP */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 mb-2">Code de vérification</h2>
              <p className="text-neutral-600 text-sm">
                Entrez le code à 6 chiffres envoyé au {data.telephone}
              </p>
            </div>
            
            <div className="space-y-4">
              {otpSent && !otpVerified && (
                <div className="mt-4 space-y-3">
                  <div className="text-sm text-neutral-600">
                    Un code de vérification a été envoyé au {data.telephone}
                  </div>
                  <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="Code OTP"
                        className="flex-1 h-11 px-3 rounded-xl bg-[#F5F5F5] outline-none shadow-inner focus:bg-[#EDEDED] text-center text-lg font-mono tracking-widest"
                        maxLength={6}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                      />
                      <button
                        type="button"
                        onClick={verifyOtp}
                        disabled={submitting || otpCode.length !== 6}
                        className="h-11 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold disabled:opacity-50 whitespace-nowrap shadow-sm"
                      >
                        {submitting ? 'Vérification...' : 'Vérifier'}
                      </button>
                  </div>
                  <div className="text-sm text-center">
                    {!canResend ? (
                      <span className="text-neutral-500">
                        Nouveau code disponible dans {resendTimer}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => sendOtp(true)}
                        disabled={!canResend || isSendingOtp}
                        className="text-[#4A9B8E] hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSendingOtp ? 'Envoi en cours...' : 'Renvoyer le code'}
                      </button>
                    )}
                  </div>
                  {otpError && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
                      {otpError}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Boutons de navigation */}
        <div className="mt-8 flex gap-3">
          {step > 0 && step < 3 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 px-6 py-3 text-neutral-900 rounded-xl bg-neutral-100 hover:bg-neutral-200 transition-colors font-semibold shadow-sm"
            >
              Précédent
            </button>
          )}
          
          {step < 3 ? (
            <button
              onClick={handleNext}
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-neutral-800 text-white rounded-xl hover:bg-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-sm"
            >
              {submitting ? "En cours..." : step === 2 ? "Envoyer le code" : "Suivant"}
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting || !otpVerified}
              className="flex-1 px-6 py-3 bg-neutral-800 text-white rounded-xl hover:bg-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-sm"
            >
              {submitting ? "Inscription..." : "Finaliser l'inscription"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
