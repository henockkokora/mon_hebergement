"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { ChevronLeftIcon, ChevronRightIcon, ShareIcon } from '@heroicons/react/24/outline';
import apiService from '@/services/api';
import toast from 'react-hot-toast';
import MatterportViewer from '@/components/MatterportViewer';
import { getImageUrl } from '@/utils/imageUtils';

function IconStar({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 17.27l6.18 3.73-1.64-7.03L21 9.24l-7.19-.61L12 2 10.19 8.63 3 9.24l4.46 4.73L5.82 21z" />
    </svg>
  );
}

function IconBack({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

// Utilise maintenant la fonction utilitaire commune

function SimpleCarousel({ images, title }) {
  // Nettoyage et normalisation des images
  const safeImages = useMemo(() => {
    if (!images) return [];
    
    // Convertir en tableau si nécessaire
    const imagesArray = Array.isArray(images) ? images : [images];
    
    // Filtrer et traiter chaque image
    return imagesArray
      .map(img => {
        const url = getImageUrl(img);
        return url ? { src: url, original: img } : null;
      })
      .filter(Boolean) // Enlever les valeurs null/undefined
      .filter((img, index, self) => // Supprimer les doublons
        index === self.findIndex(i => i.src === img.src)
      );
  }, [images]);
  
  const hasMultipleImages = safeImages.length > 1;
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [current]);

  const prev = () => setCurrent(c => (c === 0 ? safeImages.length - 1 : c - 1));
  const next = () => setCurrent(c => (c === safeImages.length - 1 ? 0 : c + 1));

  if (safeImages.length === 0) {
    return (
      <div className="h-[500px] flex items-center justify-center bg-gray-50 rounded-3xl mb-8">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="mt-4 text-gray-400">Aucune image disponible</p>
        </div>
      </div>
    );
  }

  const currentImage = safeImages[current];
  const imageUrl = currentImage?.src;

  return (
    <div className="relative w-full h-[500px] mb-8 rounded-3xl overflow-hidden bg-gray-50 group">
      {/* Boutons de navigation */}
      {hasMultipleImages && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-3 rounded-full z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg backdrop-blur-sm"
            aria-label="Image précédente"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-3 rounded-full z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg backdrop-blur-sm"
            aria-label="Image suivante"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Image principale */}
      <div className="relative w-full h-full">
        {loading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
        )}
        
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 p-6">
            <svg className="w-12 h-12 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-gray-600 mb-3">Impossible de charger l'image</p>
            <button
              onClick={() => setError(false)}
              className="px-4 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors"
            >
              Réessayer
            </button>
          </div>
        ) : (
          <div className="relative w-full h-full">
            <Image
              src={imageUrl}
              alt={`${title || 'Annonce'} - Photo ${current + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 75vw"
              priority
              className={`object-cover transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
              onLoad={() => {
                setLoading(false);
              }}
              onError={(e) => {
                console.error('Erreur de chargement de l\'image:', e);
                setLoading(false);
                setError(true);
              }}
              loading="eager"
              unoptimized={process.env.NODE_ENV !== 'production'}
            />
          </div>
        )}

        {/* Indicateurs */}
        {hasMultipleImages && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {safeImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${idx === current ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/70'}`}
                aria-label={`Image ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Galerie type maquette: grande image à gauche, deux vignettes à droite
function Gallery({ images, title }) {
  const safe = useMemo(() => {
    const arr = Array.isArray(images) ? images : (images ? [images] : []);
    return arr
      .map(getImageUrl)
      .filter(Boolean)
      .filter((src, i, self) => i === self.findIndex((s) => s === src));
  }, [images]);

  if (safe.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 mb-6">
        <div className="h-[280px] sm:h-[380px] lg:h-[420px] rounded-3xl bg-gray-100" />
        <div className="grid grid-rows-2 gap-4">
          <div className="rounded-3xl bg-gray-100" />
          <div className="rounded-3xl bg-gray-100" />
        </div>
      </div>
    );
  }

  const main = safe[0];
  const side1 = safe[1] || main;
  const side2 = safe[2] || side1;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 mb-6">
      <div className="relative h-[280px] sm:h-[380px] lg:h-[420px] rounded-3xl overflow-hidden">
        <Image src={main} alt={title || 'Photo principale'} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 66vw" />
      </div>
      <div className="grid grid-rows-2 gap-4">
        <div className="relative rounded-3xl overflow-hidden h-[130px] sm:h-[180px] lg:h-[200px]">
          <Image src={side1} alt="Photo secondaire 1" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 34vw" />
        </div>
        <div className="relative rounded-3xl overflow-hidden h-[130px] sm:h-[180px] lg:h-[200px]">
          <Image src={side2} alt="Photo secondaire 2" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 34vw" />
        </div>
      </div>
    </div>
  );
}

export default function AnnonceDetails() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  // Fonction pour gérer le partage de l'annonce
  const handleShare = async () => {
    try {
      // Créer l'URL complète de l'annonce
      const shareUrl = `${window.location.origin}/clients/annonce/${id}`;
      
      // Vérifier si l'API Web Share est disponible (mobile)
      if (navigator.share) {
        await navigator.share({
          title: annonce?.titre || 'Annonce immobilière',
          text: annonce?.description?.substring(0, 100) + '...' || 'Découvrez cette annonce immobilière',
          url: shareUrl,
        });
      } else {
        // Fallback pour les navigateurs qui ne supportent pas l'API Web Share
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Lien copié dans le presse-papiers !');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Erreur lors du partage:', error);
        toast.error('Erreur lors du partage de l\'annonce');
      }
    }
  };

  // Tous les hooks doivent être déclarés ici AVANT tout return
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [annonce, setAnnonce] = useState(null);
  const [loadingAnnonce, setLoadingAnnonce] = useState(true);
  const [errorAnnonce, setErrorAnnonce] = useState(null);
  // --- AVIS DYNAMIQUES ---
  const [avis, setAvis] = useState([]);
  const [avisLoading, setAvisLoading] = useState(true);
  const [avisError, setAvisError] = useState(null);
  const [note, setNote] = useState(5);
  const [commentaire, setCommentaire] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [currentAvisIndex, setCurrentAvisIndex] = useState(0);
  const [userAvis, setUserAvis] = useState(null);
  // Keyboard offset for keeping inputs/buttons visible on mobile
  const [kbOffset, setKbOffset] = useState(0);

  useEffect(() => {
    const vv = typeof window !== 'undefined' ? window.visualViewport : null;
    if (!vv) return;
    const update = () => {
      try {
        const offset = Math.max(0, (window.innerHeight - vv.height - vv.offsetTop));
        setKbOffset(offset);
      } catch (_) {}
    };
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    update();
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, []);
  // Fonction pour contacter l'hôte
  const handleContactHost = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (!token) {
        toast.error('Veuvez-vous vous connecter pour envoyer un message');
        router.push('/clients/connexion');
        return;
      }

      if (!annonce?.proprietaireId?._id) {
        toast.error('Impossible de contacter l\'hôte pour le moment');
        return;
      }

      // Rediriger vers la messagerie avec l'ID du propriétaire et l'annonce
      router.push(`/clients/messages?recipient=${annonce.proprietaireId._id}&annonce=${annonce._id}`);
    } catch (error) {
      console.error('Erreur lors de la redirection vers la messagerie:', error);
      toast.error('Une erreur est survenue lors de la redirection');
    }
  };

  // Gestion favoris
  const handleToggleSave = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (!token) {
        toast.error('Connectez-vous pour enregistrer des annonces');
        router.push('/clients/connexion');
        return;
      }
      const annonceId = annonce?._id || id;
      if (!annonceId) return;
      if (isFavorite) {
        await apiService.removeFavorite(annonceId);
        setIsFavorite(false);
        toast.success('Annonce retirée de vos favoris');
      } else {
        await apiService.addFavorite(annonceId);
        setIsFavorite(true);
        toast.success('Annonce ajoutée à vos favoris');
      }
    } catch (e) {
      toast.error(e?.message || 'Erreur lors de la mise à jour des favoris');
    }
  };

  // Gestion signalement
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  const [alreadyReported, setAlreadyReported] = useState(false);

  useEffect(() => {
    // Vérifie si l'utilisateur a déjà signalé cette annonce
    const checkAlreadyReported = async () => {
      if (!isConnected || !annonce?._id) return;
      try {
        const res = await apiService.request(`/api/reports/already-reported?annonceId=${annonce._id}`);
        setAlreadyReported(!!res?.alreadyReported);
      } catch (e) {
        // Optionnel: afficher une notification d'erreur
      }
    };
    checkAlreadyReported();
  }, [isConnected, annonce?._id]);

  const handleOpenReport = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (!token) {
      toast.error('Connectez-vous pour signaler une annonce');
      router.push('/clients/connexion');
      return;
    }
    setReportReason('');
    setReportOpen(true);
  };
  const submitReport = async () => {
    try {
      const annonceId = annonce?._id || id;
      if (!annonceId) return;
      if (!reportReason || reportReason.trim().length < 5) {
        toast.error('Veuillez saisir un motif (au moins 5 caractères)');
        return;
      }
      setSubmittingReport(true);
      await apiService.createReport({
        annonceId: annonceId,
        reason: reportReason.trim(),
      });
      toast.success('Annonce signalée');
      setReportOpen(false);
      setReportReason('');
      setAlreadyReported(true);
      // Relance le check pour garantir la synchro
      checkAlreadyReported && checkAlreadyReported();
    } catch (e) {
      if (e?.status === 409) {
        setAlreadyReported(true);
        toast.error('Annonce déjà signalée');
      } else {
        toast.error(e?.message || 'Erreur lors du signalement');
      }
    } finally {
      setSubmittingReport(false);
    }
  };

  // Vérifier l'état de connexion de manière réactive
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('auth_token');
      setIsConnected(!!token);
    };
    
    // Vérifier immédiatement
    checkAuth();
    
    // Écouter les changements de localStorage
    const handleStorageChange = () => checkAuth();
    window.addEventListener('storage', handleStorageChange);
    
    // Nettoyer l'écouteur d'événements
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Vérifier si l'annonce est dans les favoris au chargement
  useEffect(() => {
    const checkIfFavorite = async () => {
      try {
        const response = await apiService.getFavorites();
        const favorites = response?.data || [];
        const isInFavorites = Array.isArray(favorites) && 
          favorites.some(fav => (fav._id || fav.id) === id);
        setIsFavorite(isInFavorites);
      } catch (error) {
        console.error('Erreur lors de la vérification des favoris:', error);
      } finally {
        setLoading(false);
      }
    };
    checkIfFavorite();
  }, [id]);

  // Incrémenter le compteur de vues (et enregistrer pour stats) quand l'annonce est chargée
  useEffect(() => {
    if (!id || !annonce) return;
    apiService.post(`/api/annonces/${id}/view`, {}).catch(() => {});
  }, [id, annonce]);

  // Chargement des données de l'annonce
  useEffect(() => {
    let isMounted = true;

    const fetchAnnonce = async () => {
  try {
    setLoadingAnnonce(true);
    const response = await apiService.getAnnonce(id);
    const annonceData = response.data || {};
    if (isMounted) {
      setAnnonce(annonceData);
    }
  } catch (err) {
    setErrorAnnonce('Impossible de charger les détails de l\'annonce');
  } finally {
    setLoadingAnnonce(false);
  }
};
    fetchAnnonce();
  }, [id]);

  // Polling du statut Matterport pour afficher automatiquement la visite 3D quand prête
  useEffect(() => {
    if (!id) return;
    // Si on a déjà un modelId/shareUrl, pas besoin de poller
    if (annonce?.matterportModelId || annonce?.matterportShareUrl) return;

    let timer;
    const poll = async () => {
      try {
        const res = await apiService.getMatterportStatus(id);
        const st = res?.data || res; // compat
        if (st?.status === 'ready' && (st?.modelId || st?.shareUrl)) {
          setAnnonce(prev => ({
            ...prev,
            matterportModelId: st.modelId || prev?.matterportModelId,
            matterportShareUrl: st.shareUrl || prev?.matterportShareUrl,
          }));
          if (timer) clearInterval(timer);
        }
      } catch (e) {
        // ignorer les erreurs de polling
      }
    };
    // Démarrer le polling
    timer = setInterval(poll, 4000);
    poll();
    return () => timer && clearInterval(timer);
  }, [id, annonce?.matterportModelId, annonce?.matterportShareUrl]);

  // Charger les avis sur le propriétaire et vérifier si l'utilisateur a déjà évalué
  useEffect(() => {
    const loadAvis = async () => {
      try {
        setAvisLoading(true);
        const res = await apiService.getAvis(id);
        const avisList = Array.isArray(res.avis) ? res.avis : [];
        setAvis(avisList);
        
        // Vérifier si l'utilisateur est connecté
        if (isConnected) {
          const userData = JSON.parse(localStorage.getItem('userData') || '{}');
          
          if (userData && userData._id) {
            // Vérification stricte de l'existence d'un avis
            const userAvisExist = avisList.find(avis => {
              const auteurId = typeof avis.auteur === 'object' ? avis.auteur?._id : avis.auteur;
              return auteurId === userData._id;
            });
            
            setUserAvis(userAvisExist || null);
          }
        }
      } catch (e) {
        console.error('Erreur lors du chargement des avis:', e);
        setAvisError("Impossible de charger les avis. Veuillez réessayer plus tard.");
      } finally {
        setAvisLoading(false);
      }
    };
    
    loadAvis();
  }, [id, isConnected]);

  if (loadingAnnonce) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative h-16 w-16 mx-auto mb-2">
            <svg className="absolute inset-0 w-12 h-12 m-2 text-neutral-800 house-bounce" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M3 10.5 12 3l9 7.5" />
              <path d="M5 10v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-9" />
              <path d="M9 21v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6" />
            </svg>
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-10 h-2 rounded-full bg-neutral-300/60 house-shadow" />
          </div>
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

  if (errorAnnonce || !annonce) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oups !</h2>
          <p className="text-gray-600 mb-6">
            {errorAnnonce || 'Nous n\'avons pas pu charger cette annonce. Elle a peut-être été supprimée ou déplacée.'}
          </p>
          <div className="space-y-3">
            <button 
              onClick={() => router.back()}
              className="w-full px-4 py-2 bg-neutral-800 text-white rounded-md hover:bg-neutral-700 transition-colors"
            >
              ← Retour à la page précédente
            </button>
            <button 
              onClick={() => router.push('/')}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Voir les annonces disponibles
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Fonction utilitaire pour récupérer les données utilisateur de manière sécurisée
  const getUserData = () => {
    if (typeof window === 'undefined') {
      return null;
    }
    
    try {
      // Vérifier si le localStorage est disponible
      if (!window.localStorage) {
        return null;
      }
      
      // Récupérer les données utilisateur
      const userDataStr = localStorage.getItem('userData');
      
      if (!userDataStr) {
        return null;
      }
      
      // Parser les données utilisateur
      let userData;
      try {
        userData = JSON.parse(userDataStr);
      } catch (parseError) {
        return null;
      }
      
      // Vérifier si l'ID utilisateur est présent
      const userId = userData?._id || userData?.id;
      if (!userId) {
        return null;
      }
      
      // Retourner les données utilisateur avec l'ID normalisé
      return {
        ...userData,
        _id: userId
      };
      
    } catch (error) {
      console.error('Erreur lors de la récupération des données utilisateur:', error);
      return null;
    }
  };

  // Ajouter un avis sur le propriétaire
  const handleAddAvis = async (e) => {
    e.preventDefault();
    
    // Vérifications initiales
    if (submitting) {
      console.log('Soumission déjà en cours');
      return;
    }

    if (!commentaire.trim()) {
      setAvisError("Veuillez écrire un commentaire.");
      return;
    }

    setSubmitting(true);
    setAvisError(null);

    try {
      // Récupération des données utilisateur
      const userData = getUserData();
      if (!userData) {
        setAvisError("Session expirée. Veuillez vous reconnecter.");
        setSubmitting(false);
        return;
      }
      
      // Vérification stricte avant soumission
      if (userAvis) {
        setAvisError("Vous avez déjà évalué ce propriétaire.");
        setSubmitting(false);
        return;
      }

      // Dernière vérification dans la liste des avis la plus à jour
      const resCheck = await apiService.getAvis(id);
      const avisList = Array.isArray(resCheck.avis) ? resCheck.avis : [];
      
      // Vérification stricte de l'existence d'un avis
      const avisExistant = avisList.find(avis => {
        const auteurId = typeof avis.auteur === 'object' ? avis.auteur?._id : avis.auteur;
        return auteurId === userData._id;
      });

      if (avisExistant) {
        console.log('Avis existant détecté lors de la vérification finale');
        setUserAvis(avisExistant);
        setAvisError("Vous avez déjà évalué ce propriétaire.");
        setSubmitting(false);
        return;
      }

      // Si tout est bon, on envoie l'avis
      const response = await apiService.addAvis(id, { 
        note: Number(note), 
        commentaire: commentaire.trim() 
      });

      if (response && response.success === false) {
        throw new Error(response.message || "Erreur lors de l'envoi de l'avis");
      }

      // Mise à jour de l'interface
      setCommentaire("");
      setNote(5);
      
      // Rechargement des avis
      const res = await apiService.getAvis(id);
      const updatedAvis = Array.isArray(res.avis) ? res.avis : [];
      setAvis(updatedAvis);
      
      // Mise à jour de l'état userAvis
      const nouvelAvis = updatedAvis.find(a => {
        const auteurId = typeof a.auteur === 'object' ? a.auteur?._id : a.auteur;
        return auteurId === userData._id;
      });

      if (nouvelAvis) {
        console.log('Nouvel avis enregistré avec succès');
        setUserAvis(nouvelAvis);
      }
    } catch (error) {
      // Affichage d'un message utilisateur (pas d'alerte, pas de bruit console)
      const msg = (error?.status === 400 || /déjà.*avis/i.test(error?.message || ''))
        ? "Vous avez déjà laissé un avis pour cette annonce."
        : (error?.message || "Une erreur est survenue lors de l'envoi de votre avis. Veuillez réessayer.");
      setAvisError(msg);
      // Optionnel: si doublon, on désactive la possibilité de resoumettre
      if ((error?.status === 400) || /déjà.*avis/i.test(error?.message || '')) {
        setUserAvis({ note, commentaire });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-neutral-50 min-h-screen">
      <main className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8" style={{ paddingBottom: kbOffset ? kbOffset + 24 : undefined }}>
        {/* --- Header --- */}
        <div className="mb-6">
          <button onClick={() => router.back()} className="inline-flex items-center justify-center rounded-full px-4 h-10 bg-neutral-100 hover:bg-neutral-200 transition-colors space-x-2 shadow-sm">
            <IconBack className="w-4 h-4 text-gray-600" />
            <span className="text-[13px] font-medium text-gray-700">Retour</span>
          </button>
          <h1 className="text-[22px] leading-7 md:text-3xl font-semibold text-neutral-900 mb-2">{annonce.title || annonce.titre || 'Titre non renseigné'}</h1>
          <div className="text-[13px] text-neutral-700">
              {annonce.ville || annonce.address?.ville || ''}{(annonce.quartier || annonce.pays || annonce.address?.pays) ? ' · ' : ''}
              {annonce.quartier || ''}{annonce.quartier && (annonce.pays || annonce.address?.pays) ? ', ' : ''}{annonce.pays || annonce.address?.pays || ''}
            </div>
        </div>

        {/* --- Galerie conforme à la maquette --- */}
        <Gallery images={[...(annonce.images || []), ...(annonce.photos || [])]} title={annonce.title || annonce.titre || 'Annonce'} />

        {/* --- Titre + actions (partager / enregistrer / signaler) --- */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <button 
              onClick={handleShare}
              className="px-3 py-1.5 rounded-full bg-[#F5F5F5] hover:bg-[#EDEDED] text-[13px] font-medium shadow"
            >
              Partager
            </button>
            <button onClick={handleToggleSave} className={`px-3 py-1.5 rounded-full bg-[#F5F5F5] hover:bg-[#EDEDED] text-[13px] font-medium shadow ${isFavorite ? 'text-[#d23b3b]' : ''}`}>{isFavorite ? 'Enregistré' : 'Enregistrer'}</button>
            <button onClick={handleOpenReport} className="px-3 py-1.5 rounded-full bg-[#F5F5F5] hover:bg-[#EDEDED] text-[13px] font-medium shadow">Signaler</button>
            {(annonce.matterportModelId || annonce.matterportShareUrl) && (
              <button
                onClick={() => router.push(`/clients/annonce/${id}/visite3d`)}
                className="px-3 py-1.5 rounded-full bg-[#F5F5F5] hover:bg-[#EDEDED] text-[13px] font-medium shadow"
              >
                Visite 3D
              </button>
            )}
          </div>
        </div>

        {/* Section 'Visite virtuelle' supprimée: la visite 3D est désormais accessible via la page dédiée /clients/annonce/[id]/visite3d */}

        {/* --- Main Content --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-3xl bg-neutral-50 shadow-sm p-6">
              <h2 className="text-[15px] font-semibold text-neutral-900">
                {annonce.type || 'Logement'}{annonce.type ? ' · ' : ''}Hôte : {annonce.proprietaireId?.nom || annonce.proprietaire?.nom || 'Non renseigné'}
              </h2>
            </div>
            <div className="rounded-3xl bg-neutral-50 shadow-sm p-6">
              <h3 className="text-[15px] font-semibold mb-3 text-neutral-900">Description</h3>
              <p className="text-[13px] text-neutral-700 leading-relaxed">{annonce.description || 'Description non renseignée.'}</p>
            </div>
          </div>

          {/* Right Column (Sticky Widget) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 flex flex-col gap-6">
              {/* Carte hôte */}
              <div className="rounded-3xl bg-neutral-50 shadow-sm p-5">
                <h4 className="text-[15px] font-semibold text-neutral-900 mb-3">Hôte</h4>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="text-[13px]">
                      <div className="font-semibold">{annonce.proprietaireId?.nom || 'Hôte'}</div>
                    </div>
                  </div>
                  <button 
                    onClick={handleShare}
                    className="p-2 text-gray-500 hover:text-neutral-800 transition-colors"
                    aria-label="Partager cette annonce"
                    title="Partager cette annonce"
                  >
                    <ShareIcon className="w-5 h-5" />
                  </button>
                </div>
                <button 
                  onClick={handleContactHost}
                  className="mt-3 w-full px-3 py-2 rounded-full bg-[#F5F5F5] hover:bg-[#EDEDED] transition-colors text-[13px] font-semibold shadow-sm"
                >
                  Contacter l'hôte
                </button>
              </div>

              {/* Carte réservation/visite */}
              <div className="bg-neutral-50 rounded-3xl shadow-sm p-6">
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900">{(annonce.price || annonce.prixParNuit || 0).toLocaleString()} FCFA</span>
                    <span className="ml-2 text-gray-500 text-base">/mois</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <button
                    className="w-full bg-[#F5F5F5] hover:bg-[#EDEDED] text-neutral-900 py-3 rounded-full font-semibold text-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                    onClick={() => {
                      if (annonce?.matterportModelId || annonce?.matterportShareUrl) {
                        router.push(`/clients/annonce/${id}/visite3d`);
                      } else {
                        toast.error('Visite 3D non disponible pour cette annonce');
                      }
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Visiter la maison
                  </button>
                </div>
                <p className="mt-4 text-center text-xs text-gray-500">Aucun montant ne vous sera débité pour l'instant</p>
              </div>
            </div>
          </div>
        </div>

        {/* --- Avis Section --- */}
        <div className="mt-10 pt-6 pb-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-[22px] leading-7 md:text-3xl font-semibold mb-6 flex items-center gap-3 text-neutral-900">
              <svg className="w-8 h-8 text-neutral-800" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 20l9 2-7-7 7-7-9 2-2-9-2 9-9-2 7 7-7 7 9-2 2 9z"/>
              </svg>
              Avis sur le propriétaire <span className="ml-2 text-[13px] font-medium text-neutral-600">({avis.length})</span>
            </h2>
            {avisLoading && <div className="text-[13px] text-neutral-500 animate-pulse text-center py-6">Chargement des avis…</div>}
            {avisError && <div className="text-[13px] text-red-600 text-center py-4">{avisError}</div>}
            <div className="relative">
            {!avisLoading && avis.length === 0 ? (
              <div className="flex flex-col items-center py-6">
                <svg className="w-20 h-20 text-gray-300 mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <p className="text-lg text-gray-500 mb-2">Aucun avis sur ce propriétaire pour le moment</p>
                <span className="text-neutral-800 font-medium">Soyez le premier à partager votre expérience !</span>
              </div>
            ) : (
              <>
                <div className="relative overflow-hidden pb-8">
                  <div 
                    className="flex transition-transform duration-300 ease-out"
                    style={{ transform: `translateX(-${currentAvisIndex * 100}%)` }}
                  >
                    {avis.map((a, index) => (
                      <div 
                        key={a._id || a.date} 
                        className="w-full flex-shrink-0 px-2 transition-all duration-300 transform hover:scale-[1.01]"
                      >
                        <div className="bg-neutral-50 rounded-3xl shadow-sm p-6 h-full">
                          <div className="flex items-center mb-4">
                            <div className="w-12 h-12 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-800 text-xl font-bold mr-3">
                              {a.auteur?.nom?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">{a.auteur?.nom || "Utilisateur"}</p>
                              <p className="text-xs text-gray-400">
                                {new Date(a.date).toLocaleDateString('fr-FR', { 
                                  day: 'numeric', 
                                  month: 'long', 
                                  year: 'numeric' 
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center mb-3">
                            <div className="flex text-yellow-400">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                  key={star}
                                  className={`w-5 h-5 ${a.note >= star ? 'fill-current' : 'text-gray-300'}`}
                                  viewBox="0 0 20 20"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-700 leading-relaxed italic">"{a.commentaire}"</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {avis.length > 1 && (
                  <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentAvisIndex(prev => Math.max(0, prev - 1));
                      }}
                      disabled={currentAvisIndex === 0}
                      className="p-3 rounded-full bg-neutral-100 shadow-sm text-gray-700 hover:bg-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                      aria-label="Avis précédent"
                    >
                      <ChevronLeftIcon className="w-6 h-6" />
                    </button>
                    
                    <div className="flex space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-inner">
                      {avis.map((_, index) => (
                        <button
                          key={index}
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentAvisIndex(index);
                          }}
                          className={`h-2 rounded-full transition-all ${
                            index === currentAvisIndex ? 'bg-neutral-800 w-6' : 'bg-gray-300 w-2.5'
                          }`}
                          aria-label={`Aller à l'avis ${index + 1}`}
                        />
                      ))}
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentAvisIndex(prev => Math.min(avis.length - 1, prev + 1));
                      }}
                      disabled={currentAvisIndex >= avis.length - 1}
                      className="p-3 rounded-full bg-white shadow-lg text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110"
                      aria-label="Avis suivant"
                    >
                      <ChevronRightIcon className="w-6 h-6" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
          </div>
          {/* Formulaire d'ajout d'avis */}
          <div className="max-w-4xl mx-auto mt-10 pt-6">
            <h3 className="text-[22px] leading-7 md:text-2xl font-semibold mb-4 text-neutral-900 flex items-center gap-2">
              <svg className="w-6 h-6 text-neutral-800" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 20l9 2-7-7 7-7-9 2-2-9-2 9-9-2 7 7-7 7 9-2 2 9z"/>
              </svg>
              {userAvis ? 'Votre évaluation' : isConnected ? 'Évaluer ce propriétaire' : 'Connectez-vous pour évaluer'}
            </h3>
            {isConnected && avisError && (
              <div className="max-w-xl mb-4 p-4 bg-red-50 text-red-700 rounded-xl text-[13px] shadow-sm">
                {avisError}
              </div>
            )}
            
            {!isConnected ? (
              <div className="max-w-xl bg-neutral-50 rounded-xl shadow-sm p-6 text-center">
                <p className="text-[13px] text-neutral-700 mb-4">Connectez-vous pour évaluer ce propriétaire.</p>
                <button 
                  onClick={() => router.push('/clients/connexion')}
                  className="px-6 py-2 bg-neutral-800 text-white rounded-md hover:bg-neutral-700 transition-colors font-semibold shadow-sm"
                >
                  Se connecter
                </button>
              </div>
            ) : userAvis ? (
              <div className="max-w-xl bg-neutral-50 rounded-xl shadow-sm p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-800 text-xl font-bold mr-3">
                    {userAvis.auteur?.nom?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900">Votre avis</p>
                    <p className="text-[12px] text-neutral-500">
                      {new Date(userAvis.date).toLocaleDateString('fr-FR', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center mb-3">
                  <div className="flex text-yellow-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-5 h-5 ${userAvis.note >= star ? 'fill-current' : 'text-gray-300'}`}
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-[13px] text-neutral-700 italic">"{userAvis.commentaire}"</p>
                <div className="mt-6 pt-4">
                  <p className="text-[13px] text-neutral-600">Merci d'avoir évalué ce propriétaire !</p>
                </div>
              </div>
            ) : isConnected ? (
              <form 
                onSubmit={handleAddAvis} 
                className={`space-y-5 max-w-xl bg-neutral-50 rounded-xl shadow-sm p-6 ${userAvis ? 'opacity-70 pointer-events-none' : ''}`}
              >
                <div>
                  <label className="block text-[15px] font-semibold text-neutral-900 mb-3">Votre note</label>
                  <div className="flex items-center space-x-1 mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNote(star)}
                        className="focus:outline-none"
                      >
                        <svg
                          className={`w-10 h-10 transition-transform duration-200 hover:scale-125 ${note >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                  <p className="text-[13px] text-neutral-600 mt-1">
                    {note} étoile{note > 1 ? 's' : ''} - {note >= 4 ? 'Excellent' : note >= 3 ? 'Bien' : 'Moyen'}
                  </p>
                </div>
                <div className="mt-6">
                  <label htmlFor="commentaire" className="block text-[15px] font-semibold text-neutral-900 mb-2">
                    Votre commentaire sur le propriétaire
                  </label>
                  <textarea
                    id="commentaire"
                    rows={4}
                    className="w-full px-3 py-2 rounded-xl bg-[#F5F5F5] text-[16px] text-neutral-900 placeholder:text-neutral-600 placeholder:font-medium shadow-inner focus:outline-none focus:bg-[#EDEDED]"
                    placeholder="Décrivez votre expérience avec ce propriétaire..."
                    value={commentaire}
                    onChange={(e) => setCommentaire(e.target.value)}
                    required
                  />
                </div>
                <div className="sticky bottom-0 pt-2" style={{ bottom: kbOffset }}>
                  <button
                    type="submit"
                    disabled={submitting || userAvis}
                    className={`w-full flex justify-center py-3 px-4 rounded-md shadow-sm text-sm font-semibold text-white bg-neutral-800 hover:bg-neutral-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${userAvis ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    {userAvis ? 'Vous avez déjà évalué ce propriétaire' : (submitting ? 'Envoi en cours...' : 'Publier mon évaluation')}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-4 rounded-lg bg-neutral-50 shadow-sm">
                <p className="text-[13px] text-neutral-700">
                  <button onClick={() => router.push('/connexion')} className="text-neutral-800 hover:underline font-semibold">Connectez-vous</button> pour laisser un avis.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Signalement */}
        {reportOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
              <div className="px-5 py-4 text-[15px] font-semibold text-neutral-900">Signaler cette annonce</div>
              <div className="p-5 space-y-3">
                <div className="text-[13px] text-neutral-700">
                  Décrivez brièvement le motif du signalement. Notre équipe examinera votre requête.
                </div>
                <textarea
                  value={reportReason}
                  onChange={(e)=>setReportReason(e.target.value)}
                  rows={5}
                  maxLength={1000}
                  className="w-full px-3 py-2 rounded-xl bg-[#F5F5F5] text-[16px] text-neutral-900 placeholder:text-neutral-500 shadow-inner focus:outline-none focus:bg-[#EDEDED]"
                  placeholder="Ex: Contenu inapproprié, informations trompeuses, etc."
                />
                <div className="text-[12px] text-neutral-500 text-right">{reportReason.length}/1000</div>
              </div>
              <div className="px-5 py-4 flex items-center justify-end gap-2 bg-neutral-50">
                <button onClick={()=>setReportOpen(false)} className="px-4 py-2 rounded-full bg-[#F5F5F5] hover:bg-[#EDEDED] text-[13px] font-medium shadow">Annuler</button>
                {alreadyReported ? (
                  <span className="text-red-600 font-semibold text-[13px]">Annonce déjà signalée</span>
                ) : (
                  <button onClick={submitReport} className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold shadow">Envoyer le signalement</button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
