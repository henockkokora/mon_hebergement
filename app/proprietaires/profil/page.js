"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import api from "../../services/api"; // Chemin correct pour accéder à app/services/api.js

const TABS = [
  { label: "Profil", key: "profil" },
  { label: "Sécurité", key: "securite" },
];



export default function ProfilPage() {
  const [user, setUser] = useState({
    nom: "",
    email: "",
    telephone: ""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profil");
  const [passwordData, setPasswordData] = useState({ 
    oldPassword: "", 
    newPassword: "", 
    confirm: "" 
  });
  const [message, setMessage] = useState({ text: "", type: "" });
  const [passwordMsg, setPasswordMsg] = useState("");

  // Fonction pour charger les données du profil
  const fetchUserProfile = async () => {
    setLoading(true);
    try {

      const response = await api.getProfile();
      console.log('Réponse brute de l\'API getProfile:', response);
      
      if (response && response.id) {
        setUser({
          id: response.id,
          nom: response.nom || '',
          email: response.email || '',
          telephone: response.telephone || '',
          role: response.role || 'proprietaire',
          createdAt: response.createdAt || ''
        });
        setError(null);
      } else {
        throw new Error("Format de réponse inattendu de l'API");
      }
    } catch (err) {
      setError("Erreur lors du chargement du profil utilisateur.");
      console.error("Erreur:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);



  // Gestion des changements des champs du formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Soumission du formulaire de profil
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {

      
      // Préparer les données à envoyer (exclure les champs non modifiables)
      const { id, role, createdAt, ...userData } = user;
      
      // Appel API de mise à jour
      const response = await api.put('/api/auth/me', userData);
      
      if (response.success) {
        setMessage({ text: "Profil mis à jour avec succès !", type: "success" });
        setEditing(false);
        // Recharger les données pour s'assurer qu'elles sont à jour
        await fetchUserProfile();
      } else {
        throw new Error(response.message || 'Erreur lors de la mise à jour du profil');
      }
    } catch (err) {
      setMessage({ 
        text: err.response?.data?.message || "Erreur lors de la mise à jour du profil", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMsg("");
    
    // Validation des mots de passe
    if (!passwordData.oldPassword) {
      setPasswordMsg({ text: "Veuillez entrer votre mot de passe actuel.", type: "error" });
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setPasswordMsg({ text: "Le nouveau mot de passe doit contenir au moins 6 caractères.", type: "error" });
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirm) {
      setPasswordMsg({ text: "Les nouveaux mots de passe ne correspondent pas.", type: "error" });
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await api.updatePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });
      
      if (response.success) {
        setPasswordMsg({ 
          text: "Mot de passe modifié avec succès !", 
          type: "success" 
        });
        setPasswordData({ 
          oldPassword: "", 
          newPassword: "", 
          confirm: "" 
        });
      } else {
        throw new Error(response.message || 'Erreur lors du changement de mot de passe');
      }
    } catch (err) {
      const errorMessage = err.message.includes('401') 
        ? "L'ancien mot de passe est incorrect."
        : err.message || "Une erreur est survenue lors du changement de mot de passe.";
      
      setPasswordMsg({ 
        text: errorMessage,
        type: "error"
      });
      console.error("Erreur lors du changement de mot de passe:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4A9B8E]"></div>
    </div>
  );
  
  if (error) return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    </div>
  );
  
  // Message de succès/erreur
  const MessageAlert = () => {
    if (!message.text) return null;
    
    const bgColor = message.type === 'success' ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500';
    const textColor = message.type === 'success' ? 'text-green-700' : 'text-red-700';
    
    return (
      <div className={`border-l-4 p-4 mb-6 ${bgColor}`}>
        <div className="flex">
          <div className="flex-shrink-0">
            {message.type === 'success' ? (
              <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <div className="ml-3">
            <p className={`text-sm ${textColor}`}>{message.text}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] leading-7 md:text-2xl font-semibold text-neutral-900">Mon profil</h1>
        <Link href="/proprietaires" className="inline-flex items-center h-10 px-4 rounded-full bg-[#4A9B8E] text-white font-semibold">Retour</Link>
      </div>
      <div className="rounded-2xl border border-black/10 bg-white/70 p-0">
        <div className="flex border-b border-black/10">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3 font-semibold text-lg transition-colors ${activeTab === tab.key ? 'bg-[#4A9B8E] text-white' : 'bg-transparent text-[#4A9B8E]'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="p-6">
          {activeTab === "profil" && (
            <div className="space-y-6">
              <MessageAlert />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-[#4A9B8E] flex items-center justify-center text-3xl font-bold text-white">
                    {user?.nom?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <div className="text-xl font-semibold">{user?.nom || ''}</div>
                    <div className="text-sm text-neutral-500">
                      {user?.role === 'proprietaire' ? 'Propriétaire' : user?.role || 'Utilisateur'}
                    </div>
                  </div>
                </div>
                
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="px-4 py-2 text-sm font-semibold text-white bg-[#4A9B8E] rounded-lg hover:bg-[#3a877b] transition-colors"
                  >
                    Modifier le profil
                  </button>
                ) : (
                  <div className="space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false);
                        fetchUserProfile(); // Recharger les données originales
                      }}
                      className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      form="profile-form"
                      className="px-4 py-2 text-sm font-semibold text-white bg-[#4A9B8E] rounded-lg hover:bg-[#3a877b] transition-colors"
                      disabled={loading}
                    >
                      {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                    </button>
                  </div>
                )}
              </div>

              <form id="profile-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  {/* Nom et prénom */}
                  <div>
                    <label htmlFor="nom" className="block text-[15px] font-semibold text-neutral-900 mb-1">
                      Nom et prénom
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        id="nom"
                        name="nom"
                        value={user.nom || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A9B8E] focus:border-transparent text-[16px] placeholder:text-neutral-600 placeholder:font-medium"
                        required
                      />
                    ) : (
                      <div className="p-2 bg-gray-50 rounded-lg">{user.nom || 'Non renseigné'}</div>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-[15px] font-semibold text-neutral-900 mb-1">
                      Email
                    </label>
                    {editing ? (
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={user.email || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A9B8E] focus:border-transparent text-[16px] placeholder:text-neutral-600 placeholder:font-medium"
                        required
                      />
                    ) : (
                      <div className="p-2 bg-gray-50 rounded-lg">{user.email || 'Non renseigné'}</div>
                    )}
                  </div>

                  {/* Téléphone */}
                  <div>
                    <label htmlFor="telephone" className="block text-[15px] font-semibold text-neutral-900 mb-1">
                      Téléphone
                    </label>
                    {editing ? (
                      <input
                        type="tel"
                        id="telephone"
                        name="telephone"
                        value={user.telephone || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A9B8E] focus:border-transparent text-[16px] placeholder:text-neutral-600 placeholder:font-medium"
                      />
                    ) : (
                      <div className="p-2 bg-gray-50 rounded-lg">{user.telephone || 'Non renseigné'}</div>
                    )}
                  </div>
                </div>

                {!editing && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="text-[12px] text-neutral-500">Rôle</div>
                        <div className="font-medium capitalize">{user?.role || 'utilisateur'}</div>
                      </div>
                      <div>
                        <div className="text-[12px] text-neutral-500">ID utilisateur</div>
                        <div className="font-mono text-[13px]">{user?.id || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-[12px] text-neutral-500">Date d'inscription</div>
                        <div className="font-medium">
                          {user?.createdAt ? (
                            new Date(user.createdAt).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          ) : 'Non disponible'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>
          )}
          {activeTab === "securite" && (
            <form className="space-y-5 max-w-md" onSubmit={handlePasswordChange}>
              <div className="space-y-1">
                <label className="block text-[15px] font-semibold text-neutral-900">Ancien mot de passe</label>
                <input 
                  type="password" 
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A9B8E] focus:border-transparent transition-all duration-200 outline-none text-[16px] placeholder:text-neutral-600 placeholder:font-medium"
                  placeholder="••••••••"
                  value={passwordData.oldPassword} 
                  onChange={e => setPasswordData({ ...passwordData, oldPassword: e.target.value })} 
                  required 
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[15px] font-semibold text-neutral-900">Nouveau mot de passe</label>
                <input 
                  type="password" 
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A9B8E] focus:border-transparent transition-all duration-200 outline-none text-[16px] placeholder:text-neutral-600 placeholder:font-medium"
                  placeholder="••••••••"
                  value={passwordData.newPassword} 
                  onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })} 
                  required 
                  minLength={6} 
                />
                <p className="text-[12px] text-gray-500 mt-1">Minimum 6 caractères</p>
              </div>
              <div className="space-y-1">
                <label className="block text-[15px] font-semibold text-neutral-900">Confirmer le mot de passe</label>
                <input 
                  type="password" 
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A9B8E] focus:border-transparent transition-all duration-200 outline-none text-[16px] placeholder:text-neutral-600 placeholder:font-medium"
                  placeholder="••••••••"
                  value={passwordData.confirm} 
                  onChange={e => setPasswordData({ ...passwordData, confirm: e.target.value })} 
                  required 
                  minLength={6} 
                />
              </div>
              {passwordMsg && (
                <div className={`p-3 rounded-lg text-sm ${
                  passwordMsg.type === 'success' 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-600 border border-red-200'
                }`}>
                  <div className="flex items-center">
                    {passwordMsg.type === 'success' ? (
                      <svg className="h-5 w-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                    <span>{passwordMsg.text}</span>
                  </div>
                </div>
              )}
              <button 
                type="submit" 
                className="w-full mt-2 px-6 py-3 rounded-lg bg-[#4A9B8E] text-white font-semibold hover:bg-[#3a877b] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#4A9B8E] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirm || loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enregistrement...
                  </div>
                ) : (
                  'Changer le mot de passe'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

