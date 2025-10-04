"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import apiService from "@/services/api";
import { getImageUrl } from '../utils/imageUtils';

const STEPS = ["Informations", "Médias", "Durée", "Paiement"];

function NouvelleAnnonce() {
  const searchParams = useSearchParams();
  const annonceId = searchParams.get('id');

  // Préremplissage si édition
  useEffect(() => {
    if (annonceId) {
      setIsEditing(true);
      (async () => {
        try {
          const res = await apiService.getAnnoncePrivee(annonceId);
          const annonce = res.data;
          if (annonce) {
            setData((prev) => ({
              ...prev,
              ...annonce,
              prix: annonce.prixParNuit ?? annonce.prix ?? '',
              photosText: Array.isArray(annonce.photos) ? annonce.photos.join(',') : '',
              duree: annonce.duree ?? 15
            }));
            setPhotosUploaded(Array.isArray(annonce.photos) ? annonce.photos : []);
            setVideosUploaded(Array.isArray(annonce.videos) ? annonce.videos : []);
          }
        } catch (e) {
          // Optionnel : afficher une erreur
        }
      })();
    }
  }, [annonceId]);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('success'); // 'success' | 'error'
  const [modalMessage, setModalMessage] = useState('');
  const [publishClicked, setPublishClicked] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [touched, setTouched] = useState({
    titre: false,
    type: false,
    prix: false,
    adresse: false,
    ville: false,
    quartier: false,
    description: false
  });
  const [formErrors, setFormErrors] = useState({});
  const [data, setData] = useState({
    titre: "",
    description: "",
    adresse: "",
    ville: "",
    quartier: "",
    capacite: 1,
    type: "Appartement",
    typeAutre: "", // champ pour saisie manuelle du type
    // Types disponibles: Appartement, Maison, Studio, Chambre, Villa, Autre
    prix: "",
    localisation: "",
    photos: [],
    photosText: "", // champ utilitaire pour saisir des URLs séparées par des virgules
    videos: [],
    duree: 15,
  });
  const [photosUploaded, setPhotosUploaded] = useState([]); // URLs renvoyées par l'API
  const [videosUploaded, setVideosUploaded] = useState([]);
  const [mediaUploading, setMediaUploading] = useState(false);
  const [mediaError, setMediaError] = useState("");
  const [acceptImages, setAcceptImages] = useState(true);
  const [acceptVideos, setAcceptVideos] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  function validateStep(step) {
    const errors = {};
    
    if (step === 0) {
      if (!data.titre.trim()) errors.titre = 'Le titre est obligatoire';
      if (!data.type) errors.type = 'Le type de bien est obligatoire';
      if (data.type === 'Autre' && !data.typeAutre.trim()) errors.typeAutre = 'Veuillez préciser le type de bien';
      if (!data.prix || isNaN(data.prix) || data.prix <= 0) errors.prix = 'Un prix valide est obligatoire';
      if (!data.adresse.trim()) errors.adresse = 'L\'adresse est obligatoire';
      if (!data.ville.trim()) errors.ville = 'La ville est obligatoire';
      if (!data.quartier.trim()) errors.quartier = 'Le quartier est obligatoire';
      if (!data.description.trim()) errors.description = 'La description est obligatoire';
    } else if (step === 1) {
      const hasPhotos = (data.photosText?.trim() && data.photosText.split(',').some(p => p.trim())) || photosUploaded.length > 0;
      const hasVideos = videosUploaded.length > 0;
      
      if (!hasPhotos && !hasVideos) {
        errors.media = 'Au moins une photo ou une vidéo est requise';
      }
    } else if (step === 2) {
      if (!data.duree) errors.duree = 'Veuillez sélectionner une durée de publication';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function next() { 
    if (validateStep(step)) {
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    }
  }
  function prev() { setStep((s) => Math.max(s - 1, 0)); }

  async function handleSubmit() {
    setError("");
    setSuccess("");
    setSubmitting(true);
    setPublishClicked(true);
    
    try {
      // Vérifier la connexion
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (!token) {
        setSubmitting(false);
        setError("Vous devez être connecté pour publier une annonce.");
        if (typeof window !== 'undefined') window.location.href = '/proprietaires/connexion';
        return;
      }

      // Préparer les médias
      const photosFromText = data.photosText
        ? data.photosText.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
      const allPhotos = [...photosUploaded, ...photosFromText];
      const allVideos = [...videosUploaded];

      if (allPhotos.length === 0 && allVideos.length === 0) {
        setSubmitting(false);
        setError("Au moins une image ou une vidéo est requise pour publier.");
        setStep(1);
        return;
      }

      // Préparer les données pour l'API
      const payload = {
        titre: data.titre,
        description: data.description,
        adresse: data.adresse,
        ville: data.ville,
        quartier: data.quartier || undefined,
        type: data.type === "Autre" ? data.typeAutre : data.type,
        prixParNuit: Number(data.prix) || 0,
        capacite: Number(data.capacite) || 1,
        photos: allPhotos,
        videos: allVideos,
        duree: data.duree || 15,
        status: 'active' // ou un autre statut par défaut
      };

      let response;
      
      // Choisir entre création et mise à jour
      if (isEditing && annonceId) {
        // Mise à jour d'une annonce existante
        response = await apiService.updateAnnonce(annonceId, payload);
      } else {
        // Création d'une nouvelle annonce
        response = await apiService.createAnnonce(payload);
      }
      
      // Gérer la réponse
      if (response.success) {
        const successMessage = isEditing 
          ? 'Annonce mise à jour avec succès !' 
          : 'Annonce publiée avec succès !';
          
        setSuccess(successMessage);
        setShowModal(true);
        setModalType('success');
        setModalMessage(successMessage);
        
        // Rediriger vers la liste des annonces après un délai
        setTimeout(() => {
          window.location.href = '/proprietaires/annonces';
        }, 2000);
      } else {
        throw new Error(response.message || 'Une erreur est survenue');
      }
    } catch (err) {
      console.error('Erreur :', err);
      const errorMessage = err.message || 'Une erreur est survenue';
      setError(errorMessage);
      setShowModal(true);
      setModalType('error');
      setModalMessage(errorMessage);
    } finally {
      setSubmitting(false);
    }
  }

  const getAcceptAttr = () => {
    return 'image/*';
  };

  // Utilise maintenant getImageUrl() de imageUtils

  async function handleFilesSelected(files){
    setMediaError("");
    if (files.length === 0) return;
    // Récupérer token
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (!token) {
      setMediaError("Vous devez être connecté pour importer des médias.");
      return;
    }
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    setMediaUploading(true);
    try {
      const res = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || 'Échec de l\'upload');
      const newPhotos = [];
      const newVideos = [];
      (json.files || []).forEach(f => {
        if (f.type === 'image') newPhotos.push(f.url);
        else if (f.type === 'video') newVideos.push(f.url);
      });
      if (newPhotos.length === 0 && acceptImages) {
        // rien à faire
      }
      setPhotosUploaded(prev => [...prev, ...newPhotos]);
      setVideosUploaded(prev => [...prev, ...newVideos]);
    } catch (err) {
      setMediaError(err.message);
    } finally {
      setMediaUploading(false);
    }
  }

  function removePhoto(idx){
    setPhotosUploaded(arr => arr.filter((_,i)=>i!==idx));
  }
  function removeVideo(idx){
    setVideosUploaded(arr => arr.filter((_,i)=>i!==idx));
  }

  // Gestion du drag & drop
  function handleDragOver(e) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setIsDragOver(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFilesSelected(files);
    }
  }

  function handleFileInputChange(e) {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFilesSelected(files);
    }
    // clear input value to allow re-upload same file if needed
    e.target.value = '';
  }

  // Options de durée récupérées depuis l'API Tarifs
  const [dureeOptions, setDureeOptions] = useState([
    {d: 15, p: 500, label: "15 jours"},
    {d: 30, p: 900, label: "30 jours", popular: true},
    {d: 60, p: 1500, label: "60 jours"}
  ]);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiService.getProprietaireTarifs();
        const items = res?.data?.items || res?.items || [];
        if (Array.isArray(items) && items.length > 0) {
          const mapped = items.map(t => ({ d: t.durationDays, p: t.priceFcfa, label: `${t.durationDays} jours` }));
          setDureeOptions(mapped);
          if (!data.duree && mapped[0]) setData(prev => ({ ...prev, duree: mapped[0].d }));
        }
      } catch (_) {
        // fallback to defaults
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] leading-7 md:text-2xl font-semibold text-neutral-900">Publier une annonce</h1>
        <div className="text-[13px] text-neutral-700">Étape {step + 1}/{STEPS.length}</div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 rounded-full bg-neutral-200 overflow-hidden">
        <div className="h-full bg-neutral-800 transition-all" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
      </div>

      <div className="rounded-3xl bg-neutral-50 shadow-sm p-4 space-y-4">
        {step === 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-[15px] font-semibold text-neutral-900">Titre <span className="text-red-500">*</span></label>
              <input 
                value={data.titre} 
                onChange={e => setData({...data, titre: e.target.value})} 
                onBlur={() => setTouched({...touched, titre: true})}
                className="mt-1 w-full h-11 px-3 rounded-xl bg-[#F5F5F5] outline-none text-[16px] placeholder:text-neutral-600 placeholder:font-medium shadow-inner focus:bg-[#EDEDED]" 
                placeholder="Appartement 3 pièces – Cocody" 
              />
              {touched.titre && formErrors.titre && (
                <p className="mt-1 text-xs text-red-600">{formErrors.titre}</p>
              )}
            </div>
            <div>
              <label className="text-[15px] font-semibold text-neutral-900">Type de bien <span className="text-red-500">*</span></label>
              <select 
                value={data.type} 
                onChange={e => setData({...data, type: e.target.value})}
                onBlur={() => setTouched({...touched, type: true})}
                className="mt-1 w-full h-11 px-3 rounded-xl bg-[#F5F5F5] outline-none text-[16px] shadow-inner focus:bg-[#EDEDED]"
              >
                {['Appartement','Maison','Studio','Chambre','Villa','Autre'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            {data.type === "Autre" && (
              <div className="sm:col-span-2">
                <label className="text-[15px] font-semibold text-neutral-900">Précisez le type de bien <span className="text-red-500">*</span></label>
                <input 
                  value={data.typeAutre} 
                  onChange={e => setData({...data, typeAutre: e.target.value})}
                  onBlur={() => setTouched({...touched, type: true})}
                  className="mt-1 w-full h-11 px-3 rounded-xl bg-[#F5F5F5] outline-none text-[16px] placeholder:text-neutral-600 placeholder:font-medium shadow-inner focus:bg-[#EDEDED]" 
                  placeholder="Ex: Bungalow, Penthouse, etc." 
                />
                {touched.type && formErrors.typeAutre && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.typeAutre}</p>
                )}
              </div>
            )}
            <div>
              <label className="text-[15px] font-semibold text-neutral-900">Prix par mois <span className="text-red-500">*</span></label>
              <input 
                value={data.prix} 
                onChange={e => setData({...data, prix: e.target.value})}
                onBlur={() => setTouched({...touched, prix: true})}
                type="number" 
                min="0"
                className="mt-1 w-full h-11 px-3 rounded-xl bg-[#F5F5F5] outline-none text-[16px] placeholder:text-neutral-600 placeholder:font-medium shadow-inner focus:bg-[#EDEDED]" 
                placeholder="35000" 
              />
              {touched.prix && formErrors.prix && (
                <p className="mt-1 text-xs text-red-600">{formErrors.prix}</p>
              )}
            </div>
            <div>
              <label className="text-[15px] font-semibold text-neutral-900">Adresse complète <span className="text-red-500">*</span></label>
              <input 
                value={data.adresse} 
                onChange={e => setData({...data, adresse: e.target.value})}
                onBlur={() => setTouched({...touched, adresse: true})}
                className="mt-1 w-full h-11 px-3 rounded-xl bg-[#F5F5F5] outline-none text-[16px] placeholder:text-neutral-600 placeholder:font-medium shadow-inner focus:bg-[#EDEDED]" 
                placeholder="12 Rue des Fleurs" 
              />
              {touched.adresse && formErrors.adresse && (
                <p className="mt-1 text-xs text-red-600">{formErrors.adresse}</p>
              )}
            </div>
            <div>
              <label className="text-[15px] font-semibold text-neutral-900">Ville <span className="text-red-500">*</span></label>
              <input 
                value={data.ville} 
                onChange={e => setData({...data, ville: e.target.value})}
                onBlur={() => setTouched({...touched, ville: true})}
                className="mt-1 w-full h-11 px-3 rounded-xl bg-[#F5F5F5] outline-none text-[16px] placeholder:text-neutral-600 placeholder:font-medium shadow-inner focus:bg-[#EDEDED]" 
                placeholder="Abidjan" 
              />
              {touched.ville && formErrors.ville && (
                <p className="mt-1 text-xs text-red-600">{formErrors.ville}</p>
              )}
            </div>
            <div>
              <label className="text-[15px] font-semibold text-neutral-900">Quartier <span className="text-red-500">*</span></label>
              <input 
                value={data.quartier} 
                onChange={e => setData({...data, quartier: e.target.value})}
                onBlur={() => setTouched({...touched, quartier: true})}
                className="mt-1 w-full h-11 px-3 rounded-xl bg-[#F5F5F5] outline-none text-[16px] placeholder:text-neutral-600 placeholder:font-medium shadow-inner focus:bg-[#EDEDED]" 
                placeholder="Cocody" 
              />
              {touched.quartier && formErrors.quartier && (
                <p className="mt-1 text-xs text-red-600">{formErrors.quartier}</p>
              )}
            </div>
            <div>
              <label className="text-[15px] font-semibold text-neutral-900">Nombre de pièces</label>
              <input 
                value={data.capacite ?? ''} 
                onChange={e => {
                  const value = e.target.value === '' ? undefined : parseInt(e.target.value);
                  setData({...data, capacite: value});
                }}
                type="number" 
                min="1"
                className="mt-1 w-full h-11 px-3 rounded-xl bg-[#F5F5F5] outline-none text-[16px] placeholder:text-neutral-600 placeholder:font-medium shadow-inner focus:bg-[#EDEDED]" 
                placeholder="1" 
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[15px] font-semibold text-neutral-900">Description <span className="text-red-500">*</span></label>
              <textarea 
                value={data.description} 
                onChange={e => setData({...data, description: e.target.value})}
                onBlur={() => setTouched({...touched, description: true})}
                className="mt-1 w-full min-h-[90px] px-3 py-2 rounded-xl bg-[#F5F5F5] outline-none text-[16px] placeholder:text-neutral-600 placeholder:font-medium shadow-inner focus:bg-[#EDEDED]" 
                placeholder="Bel appartement lumineux proche des commodités." 
              />
              {touched.description && formErrors.description && (
                <p className="mt-1 text-xs text-red-600">{formErrors.description}</p>
              )}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <label className="text-[15px] font-semibold text-neutral-900">Médias <span className="text-red-500">*</span></label>
            {formErrors.media && (
              <p className="text-xs text-red-600 -mt-2">{formErrors.media}</p>
            )}
            <div 
              className={`rounded-xl p-6 text-center transition-colors cursor-pointer ${
                isDragOver 
                  ? 'bg-[#EDEDED]' 
                  : 'bg-[#F5F5F5] shadow-inner hover:bg-[#EDEDED]'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input').click()}
            >
              <div className="text-sm">
                {isDragOver ? 'Déposez vos images ici' : 'Glissez-déposez vos photos ici ou cliquez pour sélectionner'}
              </div>
              <div className="mt-2 text-xs text-neutral-600">JPG/PNG uniquement, jusqu'à 100 Mo</div>
            </div>
            <input 
              id="file-input"
              type="file" 
              multiple 
              accept={getAcceptAttr()} 
              onChange={handleFileInputChange} 
              className="hidden"
            />
            {/* Suppression des cases à cocher pour forcer l'upload d'images uniquement */}
            {mediaUploading && <div className="text-sm text-neutral-600">Upload en cours...</div>}
            {mediaError && <div className="text-sm text-red-600">{mediaError}</div>}
            {(photosUploaded.length > 0 || videosUploaded.length > 0) && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {photosUploaded.map((u, idx) => (
                  <div key={`p-${idx}`} className="relative group">
                    <img src={getImageUrl(u)} alt="photo" className="w-full h-28 object-cover rounded-lg" />
                    <button 
                      type="button" 
                      onClick={() => removePhoto(idx)} 
                      className="absolute top-1 right-1 bg-black/60 text-white text-xs rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100"
                    >
                      Suppr
                    </button>
                  </div>
                ))}
                {videosUploaded.map((u, idx) => (
                  <div key={`v-${idx}`} className="relative group">
                    <video src={withApiUrl(u)} className="w-full h-28 object-cover rounded-lg" controls />
                    <button 
                      type="button" 
                      onClick={() => removeVideo(idx)} 
                      className="absolute top-1 right-1 bg-black/60 text-white text-xs rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100"
                    >
                      Suppr
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div>
              <label className="text-[15px] font-semibold text-neutral-900">Photos (URLs séparées par des virgules)</label>
              <input 
                value={data.photosText} 
                onChange={e => setData({...data, photosText: e.target.value})} 
                className="mt-1 w-full h-11 px-3 rounded-xl bg-[#F5F5F5] outline-none text-[16px] placeholder:text-neutral-600 placeholder:font-medium shadow-inner focus:bg-[#EDEDED]" 
                placeholder="https://exemple.com/img1.jpg, https://exemple.com/img2.jpg" 
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="text-[15px] font-semibold text-neutral-900">Durée de publication <span className="text-red-500">*</span></label>
              {formErrors.duree && (
                <p className="text-xs text-red-600 -mt-2">{formErrors.duree}</p>
              )}
              <div className="grid gap-3 sm:grid-cols-3">
                {dureeOptions.map(option => (
                  <button 
                    key={option.d} 
                    type="button"
                    onClick={() => setData({...data, duree: option.d})} 
                    className={`p-4 rounded-2xl transition-all text-left relative ${
                      data.duree === option.d 
                        ? 'bg-neutral-50 shadow-sm' 
                        : 'bg-[#F5F5F5] hover:bg-[#EDEDED]'
                    }`}
                  >
                    {option.popular && (
                      <div className="absolute -top-2 -right-2 bg-neutral-800 text-white text-xs px-2 py-1 rounded-full font-medium">
                        Populaire
                      </div>
                    )}
                    <div className="font-semibold text-lg">{option.label}</div>
                    <div className="text-sm text-neutral-600 mt-1">{option.p} FCFA</div>
                    {data.duree === option.d && (
                      <div className="text-xs text-neutral-800 font-medium mt-2">✓ Sélectionné</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Affichage de la sélection actuelle */}
            {data.duree && (
              <div className="rounded-2xl bg-neutral-50 shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-neutral-900">Durée sélectionnée</div>
                    <div className="text-sm text-neutral-700">
                      {dureeOptions.find(opt => opt.d === data.duree)?.label} - {dureeOptions.find(opt => opt.d === data.duree)?.p} FCFA
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setData({...data, duree: null})}
                    className="text-xs text-neutral-600 hover:text-neutral-800 px-2 py-1 rounded"
                  >
                    Changer
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="rounded-xl p-4 bg-neutral-50 shadow-sm">
              <div className="font-semibold mb-1">Résumé</div>
              <ul className="text-sm text-neutral-700 list-disc pl-5">
                <li>Titre: {data.titre || '—'}</li>
                <li>Type: {data.type === "Autre" ? data.typeAutre : data.type}</li>
                <li>Prix: {data.prix || '—'} FCFA</li>
                <li>Adresse: {data.adresse || '—'}</li>
                <li>Ville: {data.ville || '—'}</li>
                <li>Quartier: {data.quartier || '—'}</li>
                <li>Durée: {data.duree ? dureeOptions.find(opt => opt.d === data.duree)?.label : '—'}</li>
              </ul>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-[13px] text-neutral-700">
                Total: <span className="font-semibold">
                  {data.duree ? dureeOptions.find(opt => opt.d === data.duree)?.p : 0} FCFA
                </span>
              </div>
              {!publishClicked && (
                <button 
                  type="button"
                  onClick={handleSubmit} 
                  disabled={submitting} 
                  className="inline-flex items-center h-11 px-5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white font-semibold disabled:opacity-60 shadow-sm"
                >
                  {submitting ? 'Publication...' : "Publier votre annonce"}
                </button>
              )}
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}
            {success && <div className="text-sm text-green-600">{success}</div>}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button 
          type="button"
          onClick={prev} 
          disabled={step === 0} 
          className="px-4 h-11 rounded-full bg-[#F5F5F5] hover:bg-[#EDEDED] shadow font-semibold text-neutral-800 disabled:opacity-50"
        >
          Précédent
        </button>
        {step < STEPS.length - 1 && (
          <button 
            type="button"
            onClick={next} 
            className="px-5 h-11 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white font-semibold disabled:opacity-50 shadow-sm"
          >
            Suivant
          </button>
        )}
        {/* À la dernière étape, le bouton est dans le bloc résumé et remplacé par "Publier votre annonce" */}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button 
            type="button"
            className="absolute inset-0 w-full h-full bg-black/40 backdrop-blur-sm" 
            onClick={() => setShowModal(false)}
            aria-label="Fermer la modale"
          />
          <div className="relative w-full max-w-md rounded-2xl bg-neutral-50 p-5 shadow-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${modalType==='success' ? 'bg-green-500/20 text-green-700' : 'bg-red-500/20 text-red-700'}`}>
                {modalType==='success' ? '✓' : '✕'}
              </div>
              <div className="text-lg font-semibold">
                {modalType==='success' ? "Annonce publiée" : "Publication refusée"}
              </div>
            </div>
            <div className="text-sm text-neutral-700">
              {modalMessage}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button 
                type="button"
                onClick={() => setShowModal(false)} 
                className="h-10 px-4 rounded-full bg-[#F5F5F5] hover:bg-[#EDEDED] shadow transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative h-16 w-16 mx-auto mb-2">
            <svg className="absolute inset-0 w-12 h-12 m-2 text-neutral-800 house-bounce" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" />
            </svg>
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-10 h-2 rounded-full bg-neutral-300/60 house-shadow" />
          </div>
          <p className="text-neutral-600 text-sm">Chargement du formulaire de publication...</p>
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
    }>
      <NouvelleAnnonce />
    </Suspense>
  );
}
