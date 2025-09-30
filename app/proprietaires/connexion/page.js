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
      setError(error.message || "Erreur de connexion");
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 flex items-center justify-center p-4 relative">
      <Toaster />
      <button 
        onClick={() => router.back()}
        className="absolute top-4 left-4 p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors"
        aria-label="Retour"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
      </button>
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-base font-semibold text-neutral-900 mb-1">Connexion Propriétaire</h1>
            <p className="text-xs text-neutral-600">Accédez à votre espace propriétaire</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Email</label>
              <input
                type="email"
                value={data.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-[#4A9B8E] focus:border-transparent transition-colors"
                placeholder="votre@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Mot de passe</label>
              <input
                type="password"
                value={data.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-[#4A9B8E] focus:border-transparent transition-colors"
                placeholder="Votre mot de passe"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full px-6 py-3 bg-[#4A9B8E] text-white rounded-xl hover:bg-[#3a8b7e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-md text-neutral-600">
              Pas encore de compte ?{" "}
              <button
                onClick={() => router.push("/proprietaires/inscription")}
                className="text-[#4A9B8E] hover:text-[#3a8b7e] font-medium transition-colors"
              >
                S'inscrire
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
