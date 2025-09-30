"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import apiService from '@/services/api';

// Fonction utilitaire pour générer les initiales à partir d'un nom
const getInitials = (name) => {
  if (!name) return '??';
  
  const names = name.trim().split(' ');
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  
  return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
};

// Fonction pour générer une couleur de fond basée sur le nom
const stringToColor = (str) => {
  if (!str) return '#4A9B8E'; // Couleur par défaut
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 60%)`;
};

// Icône crayon SVG inline
function PencilIcon({ className = "w-5 h-5" }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24" 
      strokeWidth={1.5} 
      stroke="currentColor" 
      className={className}
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" 
      />
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

const SAVED = Array.from({ length: 8 }).map((_, i) => ({
  id: i + 1,
  title: [
    "Studio lumineux",
    "Appartement cosy",
    "Chambre privée",
    "Loft moderne",
    "Suite urbaine",
    "Appartement design",
  ][i % 6],
  subtitle: [
    "2 voyageurs · 1 lit · 1 salle de bain",
    "4 voyageurs · 2 lits · 1 salle de bain",
    "1 voyageur · 1 lit · sdb partagée",
    "3 voyageurs · 2 lits · 1 salle de bain",
    "2 voyageurs · 1 lit · 1 salle de bain",
    "4 voyageurs · 2 lits · 2 salles de bain",
  ][i % 6],
  price: ["25 000", "30 000", "18 000", "40 000", "35 000", "50 000"][i % 6],
  rating: [4.7, 4.9, 4.5, 5.0, 4.8, 4.6][i % 6],
  image: `https://images.unsplash.com/photo-${[
    "1505693416388-ac5ce068fe85",
    "1505692794403-34cb0f90fd1f",
    "1501183638710-841dd1904471",
    "1493809842364-78817add7ffb",
    "1507089947368-19c1da9775ae",
    "1497366216548-37526070297c",
  ][i % 6]}?auto=format&fit=crop&w=1200&q=60`,
}));

function ClientProfil() {
  // --- Ajout signalement ---
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [reportSuccess, setReportSuccess] = useState('');
  const [reportError, setReportError] = useState('');

  const router = useRouter();
  const [activeTab, setActiveTab] = useState(() => {
    // Récupérer l'onglet actif depuis le localStorage si disponible
    if (typeof window !== 'undefined') {
      return localStorage.getItem('profilActiveTab') || 'profil';
    }
    return 'profil';
  });
  const [initialLoad, setInitialLoad] = useState(true);
  const [profil, setProfil] = useState({ 
    nom: "", 
    email: "", 
    telephone: "" 
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedListings, setSavedListings] = useState([]);

  const handleChange = (e) => {
    setProfil({ ...profil, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Sauvegarder l'onglet actif dans le localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('profilActiveTab', tab);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    handleTabChange('profil');
  };

  const handleCancel = () => {
    handleTabChange('profil');
    setError('');
    setMessage('');
    // Réinitialiser les champs de mot de passe
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
  };

  const [showConfirm, setShowConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleRemoveSaved = async (listingId) => {
    setDeletingId(listingId);
    setShowConfirm(true);
  };

  const confirmRemove = async (confirmed) => {
    if (!confirmed) {
      setShowConfirm(false);
      setDeletingId(null);
      return;
    }

    setIsDeleting(true);
    
    try {
      const response = await apiService.removeFavorite(deletingId);
      if (response && response.success) {
        setSavedListings(prev => prev.filter(item => 
          item.id !== deletingId && item._id !== deletingId
        ));
        setMessage('Annonce retirée des favoris');
        // Cacher le message après 3 secondes
        setTimeout(() => setMessage(''), 3000);
      } else {
        throw new Error(response?.message || 'Erreur lors de la suppression');
      }
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      setError(err.message || 'Impossible de retirer cette annonce');
      // Cacher l'erreur après 3 secondes
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
      setDeletingId(null);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      if (activeTab === 'profil') {
        // Mise à jour du profil
        await apiService.put('/api/auth/me', profil);
        setMessage("Profil mis à jour avec succès");
      } else {
        // Changement de mot de passe
        if (passwordData.newPassword !== passwordData.confirmPassword) {
          throw new Error("Les mots de passe ne correspondent pas");
        }
        
        await apiService.updatePassword({
          oldPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        });
        
        setMessage("Mot de passe mis à jour avec succès");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setSaving(false);
      
      // Effacer le message après 5 secondes
      setTimeout(() => setMessage(""), 5000);
    }
  };

  // Chargement initial des données
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        // Vérification du token
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        if (!token) {
          router.push('/clients/connexion');
          return;
        }
        
        // Charger le profil utilisateur
        const loadProfile = async () => {
          const data = await apiService.getProfile();
          if (isMounted && data) {
            setProfil({
              nom: data.nom || '',
              email: data.email || '',
              telephone: data.telephone || ''
            });
            return true;
          }
          return false;
        };
        
        // Charger les favoris
        const loadFavorites = async () => {
          try {
            console.log('Chargement des favoris...');
            const saved = await apiService.getFavorites();
            console.log('Réponse brute de getFavorites:', JSON.stringify(saved, null, 2));
            if (isMounted) {
              // Essayer différents chemins de données possibles
              const favorites = (saved?.data || saved?.annonces || (Array.isArray(saved) ? saved : []));
              console.log('Favoris extraits:', favorites);
              console.log('Type de favorites:', Array.isArray(favorites) ? 'Array' : typeof favorites);
              console.log('Nombre de favoris:', Array.isArray(favorites) ? favorites.length : 'N/A');
              
              // Ajouter un log pour chaque élément du tableau
              if (Array.isArray(favorites)) {
                favorites.forEach((fav, index) => {
                  console.log(`Favori ${index + 1}:`, {
                    id: fav._id || fav.id,
                    titre: fav.titre || fav.title,
                    type: typeof fav,
                    keys: Object.keys(fav)
                  });
                });
              }
              
              setSavedListings(Array.isArray(favorites) ? favorites : []);
              console.log('Favoris enregistrés dans le state:', savedListings.length);
            }
          } catch (err) {
            console.error('Erreur lors du chargement des favoris:', err);
            if (isMounted) {
              setError('Impossible de charger les annonces enregistrées');
            }
          }
        };
        
        // Charger les données en parallèle
        await Promise.all([loadProfile(), loadFavorites()]);
        
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        if (isMounted) {
          setError('Une erreur est survenue lors du chargement des données');
        }
      } finally {
        if (isMounted) {
          setInitialLoad(false);
          setLoading(false);
        }
      }
    };
    
    // Ne charger les données que lors du premier rendu
    if (initialLoad) {
      loadData();
    } else {
      setLoading(false);
    }
    
    return () => { isMounted = false; };
  }, [router, initialLoad]);


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Bouton signaler profil */}
      <div className="flex justify-end">
        <button
          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg border border-red-200 hover:bg-red-200 text-sm font-medium"
          onClick={() => setShowReportModal(true)}
        >
          Signaler ce profil
        </button>
      </div>
      {/* Header */}
      {(error || message) && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg z-50 ${error ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
          {error || message}
        </div>
      )}
      
      <div className="bg-white shadow-sm">
        <div className="w-full py-6 px-4">
          <div className="flex items-center">
            <button 
              className="mr-4 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
              onClick={() => router.back()}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Retour
            </button>
            <h1 className="text-2xl font-bold text-gray-900 flex-1 text-center">Mon compte</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="w-full py-6 px-0">
        {/* Profile Section */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-8 w-full">
          {/* Avatar */}
          <div className="flex justify-center pt-4 pb-2">
            <div 
              className="relative h-28 w-28 rounded-full overflow-hidden border-4 border-white shadow-lg flex items-center justify-center"
              style={{
                backgroundColor: stringToColor(profil.nom || 'U')
              }}
            >
              <span className="text-4xl font-bold text-white">
                {getInitials(profil.nom || 'Utilisateur')}
              </span>
            </div>
          </div>

          {/* Profile Form */}
          <div className="px-8 py-4 w-full">
            {/* Tab Navigation */}
            <nav className="flex space-x-8 border-b border-gray-200">
              <button
                onClick={() => handleTabChange('profil')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'profil' 
                  ? 'border-[#4A9B8E] text-[#4A9B8E]' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                suppressHydrationWarning
              >
                Informations personnelles
              </button>
              <button
                onClick={() => handleTabChange('password')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'password' 
                  ? 'border-[#4A9B8E] text-[#4A9B8E]' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                suppressHydrationWarning
              >
                Mot de passe
              </button>
            </nav>

            {/* Tab Content */}
            <div className="py-4">
              {loading ? (
                console.log('Affichage du loader...'),
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4A9B8E] mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement de votre profil...</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSave} className="space-y-4">
                  {activeTab === 'profil' ? (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold text-gray-900 mb-6">Informations personnelles</h2>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                          <input 
                            type="text" 
                            name="nom" 
                            value={profil?.nom || ''} 
                            onChange={handleChange} 
                            className="w-full max-w-md px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#4A9B8E]/50 focus:border-[#4A9B8E] bg-white/90 shadow-sm transition-all duration-200 ease-out focus:shadow-md focus:shadow-[#4A9B8E]/20 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <input 
                            type="email" 
                            name="email" 
                            value={profil?.email || ''} 
                            onChange={handleChange} 
                            className="w-full max-w-md px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#4A9B8E]/50 focus:border-[#4A9B8E] bg-white/90 shadow-sm transition-all duration-200 ease-out focus:shadow-md focus:shadow-[#4A9B8E]/20 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                          <input 
                            type="text" 
                            name="telephone" 
                            value={profil?.telephone || ''} 
                            onChange={handleChange} 
                            className="w-full max-w-md px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#4A9B8E]/50 focus:border-[#4A9B8E] bg-white/90 shadow-sm transition-all duration-200 ease-out focus:shadow-md focus:shadow-[#4A9B8E]/20 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="mt-8 pt-6 border-t border-gray-200 flex justify-start space-x-3">
                        <button
                          type="button"
                          onClick={handleCancel}
                          className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4A9B8E]/50 transition-all duration-200 ease-out transform hover:scale-[1.02] active:scale-95 shadow-sm hover:shadow-md"
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2.5 border-0 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-[#4A9B8E] to-[#3a8b7e] hover:from-[#3a8b7e] hover:to-[#2e6e63] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4A9B8E]/50 transition-all duration-300 ease-out transform hover:scale-[1.02] active:scale-95 shadow-lg hover:shadow-xl hover:shadow-[#4A9B8E]/30 relative overflow-hidden group"
                        >
                          Enregistrer les modifications
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold text-gray-900 mb-6">Modifier le mot de passe</h2>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
                          <input 
                            type="password" 
                            name="currentPassword" 
                            value={passwordData.currentPassword} 
                            onChange={handlePasswordChange}
                            className="w-full max-w-md px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#4A9B8E]/50 focus:border-[#4A9B8E] bg-white/90 shadow-sm transition-all duration-200 ease-out focus:shadow-md focus:shadow-[#4A9B8E]/20 focus:outline-none"
                            placeholder="••••••••"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
                          <input 
                            type="password" 
                            name="newPassword" 
                            value={passwordData.newPassword} 
                            onChange={handlePasswordChange}
                            className="w-full max-w-md px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#4A9B8E]/50 focus:border-[#4A9B8E] bg-white/90 shadow-sm transition-all duration-200 ease-out focus:shadow-md focus:shadow-[#4A9B8E]/20 focus:outline-none"
                            placeholder="••••••••"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le nouveau mot de passe</label>
                          <input 
                            type="password" 
                            name="confirmPassword" 
                            value={passwordData.confirmPassword} 
                            onChange={handlePasswordChange}
                            className="w-full max-w-md px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#4A9B8E]/50 focus:border-[#4A9B8E] bg-white/90 shadow-sm transition-all duration-200 ease-out focus:shadow-md focus:shadow-[#4A9B8E]/20 focus:outline-none"
                            placeholder="••••••••"
                          />
                        </div>
                        <div className="mt-8 pt-6 border-t border-gray-200 flex justify-start space-x-3">
                          <button
                            type="button"
                            onClick={handleCancel}
                            className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4A9B8E]/50 transition-all duration-200 ease-out transform hover:scale-[1.02] active:scale-95 shadow-sm hover:shadow-md"
                          >
                            Annuler
                          </button>
                          <button
                            type="submit"
                            className="px-6 py-2.5 border-0 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-[#4A9B8E] to-[#3a8b7e] hover:from-[#3a8b7e] hover:to-[#2e6e63] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4A9B8E]/50 transition-all duration-300 ease-out transform hover:scale-[1.02] active:scale-95 shadow-lg hover:shadow-xl hover:shadow-[#4A9B8E]/30 relative overflow-hidden group"
                          >
                            Mettre à jour le mot de passe
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Saved Listings Section */}
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="text-2xl font-bold mb-8">Vos favoris</h2>
          
          {savedListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {savedListings.map((item) => {
                // Debug: Afficher la structure complète de l'item
                console.log('Données de l\'annonce:', JSON.stringify(item, null, 2));
                
                // Gestion de l'image avec fallback
                let imageSrc = item.image || item.images?.[0]?.url || item.images?.[0] || item.photos?.[0]?.url || item.photos?.[0] || item.imagesList?.[0];
                
                // Si c'est un chemin relatif (commence par /uploads/), on construit l'URL complète
                if (imageSrc && typeof imageSrc === 'string' && imageSrc.startsWith('/uploads/')) {
                  imageSrc = `http://localhost:4000${imageSrc}`;
                }
                
                // Fallback si aucune image n'est disponible
                if (!imageSrc) {
                  imageSrc = "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=60";
                }
                
                // Récupération du prix depuis différentes propriétés possibles
                const prix = item.prixParNuit || item.prix || item.prixParMois || item.price || item.tarif || item.tarifMensuel || 
                            (item.details && (item.details.prixParNuit || item.details.prix || item.details.prixParMois || item.details.tarif));
                
                console.log('Prix extrait:', { 
                  prix, 
                  hasPrix: !!prix, 
                  keys: Object.keys(item),
                  detailsKeys: item.details ? Object.keys(item.details) : 'Pas de détails'
                });
                
                return (
                  <div key={item._id || item.id} className="group">
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <Image 
                        src={imageSrc}
                        alt={item.titre || item.title || 'Annonce'}
                        width={300}
                        height={225}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        quality={85}
                        priority={false}
                        loading="lazy"
                      />
                      <button
                        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 border border-black/10 text-[16px] flex items-center justify-center transition-all duration-150 text-red-500 hover:scale-110 hover:bg-red-50"
                        aria-label="Retirer des favoris"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemoveSaved(item.id || item._id);
                        }}
                      >
                        ❤️
                      </button>
                    </div>
                    <div className="mt-3 px-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-semibold text-gray-900 truncate pr-2">
                          {item.titre || item.title || 'Sans titre'}
                        </h3>
                        {item.rating && (
                          <div className="flex items-center text-xs text-gray-600 whitespace-nowrap">
                            <span className="text-amber-500 mr-1">★</span>
                            {item.rating.toFixed?.(1) || item.rating}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-600 truncate mb-2">
                        {item.ville || item.adresse?.ville || item.location || 'Localisation non spécifiée'}
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {typeof prix === 'number' || (typeof prix === 'string' && prix.trim() !== '') ? (
                          <>
                            <span className="text-[15px] font-semibold text-[#4A9B8E]">
                              {new Intl.NumberFormat('fr-FR').format(Number(prix))} FCFA
                            </span>
                            <span className="text-xs text-gray-500 ml-1">/mois</span>
                          </>
                        ) : (
                          <div className="text-xs text-gray-500">
                            <div>Prix sur demande</div>
                          </div>
                        )}
                        <a 
                          href={`/clients/annonce/${item._id || item.id}`}
                          className="mt-3 block w-full text-center text-sm bg-[#4A9B8E] text-white py-2 px-4 rounded-lg hover:bg-[#3a8b7e] transition-colors font-medium"
                        >
                          Voir détails
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 px-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <div className="mx-auto w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Aucun favori pour l'instant</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Enregistrez vos hébergements préférés pour les retrouver facilement plus tard.
              </p>
              <button 
                onClick={() => router.push('/clients')}
                className="flex items-center justify-center px-6 py-3 bg-[#4A9B8E] text-white rounded-lg font-medium hover:bg-[#3a8b7e] transition-colors mx-auto"
              >
                <svg className="w-5 h-5 mr-2 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Explorer les annonces
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Modal de confirmation de suppression */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 transform transition-all">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Retirer des favoris</h3>
            <p className="text-gray-600 mb-6">Voulez-vous vraiment retirer cette annonce de vos favoris ?</p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => confirmRemove(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Annuler
              </button>
              <button
                onClick={() => confirmRemove(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Suppression...
                  </>
                ) : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    {/* Modal de signalement */}
    {showReportModal && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 relative">
          <button
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            onClick={() => { setShowReportModal(false); setReportReason(''); setReportSuccess(''); setReportError(''); }}
            aria-label="Fermer"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <h3 className="text-lg font-semibold mb-4">Signaler ce profil</h3>
          {reportSuccess ? (
            <div className="mb-4 text-green-700 bg-green-50 border border-green-200 rounded p-3 text-sm">{reportSuccess}</div>
          ) : (
            <form onSubmit={async (e) => {
              e.preventDefault();
              setReportLoading(true);
              setReportError('');
              setReportSuccess('');
              try {
                // On suppose que profil contient l'id du profil affiché
                await apiService.createReport({
                  userId: profil._id, // id du profil signalé
                  reason: reportReason,
                });
                setReportSuccess('Merci, votre signalement a bien été transmis.');
                setReportReason('');
              } catch (err) {
                let msg = err?.message || 'Erreur lors de l’envoi du signalement.';
                if (err?.response?.errors && Array.isArray(err.response.errors)) {
                  msg += ' : ' + err.response.errors.map(e => e.msg).join(', ');
                }
                setReportError(msg);
              } finally {
                setReportLoading(false);
              }
            }}>
              <label className="block mb-2 text-sm font-medium">Motif du signalement</label>
              <textarea
                className="w-full border rounded-lg p-2 mb-3 min-h-[70px]"
                value={reportReason}
                onChange={e => setReportReason(e.target.value)}
                required
                placeholder="Décrivez la raison du signalement..."
              />
              {reportError && <div className="mb-3 text-red-600 text-sm">{reportError}</div>}
              <button
                type="submit"
                className="w-full py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-60"
                disabled={reportLoading || !reportReason}
              >
                {reportLoading ? 'Envoi...' : 'Envoyer le signalement'}
              </button>
            </form>
          )}
        </div>
      </div>
    )}

    </div>
  );
}

export default ClientProfil;
