"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import apiService from "@/services/api";
import Notification from "@/components/Notification";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("error");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotificationMessage("");
    setLoading(true);
    try {
      // Utiliser l'endpoint dédié admin (username + password)
      const res = await apiService.request('/api/auth/login-admin', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
      const token = res?.token;
      const user = res?.user || res?.data?.user;
      if (!token || !user) {
        throw new Error("Réponse inattendue du serveur");
      }
      if (typeof window !== "undefined") {
        // Stocker les informations d'administration avec des clés spécifiques
        localStorage.setItem("admin_token", token);
        localStorage.setItem("admin_user", JSON.stringify(user));
        // Nettoyer les anciens tokens pour éviter les conflits
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_token_owner");
      }
      // Vérifier rôle admin
      if (user.role && user.role !== "admin") {
        setNotificationMessage("Accès refusé: compte non administrateur");
        setNotificationType("error");
        setLoading(false);
        return;
      }
      // Show success notification
      setNotificationMessage("Connexion réussie! Redirection...");
      setNotificationType("success");
      setTimeout(() => {
        router.replace("/admin");
      }, 1000);
    } catch (err) {
      const msg = err?.response?.message || err?.message || "Échec de la connexion";
      setNotificationMessage(msg);
      setNotificationType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Notification 
        message={notificationMessage} 
        type={notificationType} 
        onClose={() => setNotificationMessage("")} 
        duration={3000}
      />
      <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white/70 backdrop-blur-sm shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-black/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#4A9B8E]/10 flex items-center justify-center text-[#4A9B8E] font-bold">A</div>
          <div>
            <h1 className="text-lg font-semibold">Espace Administrateur</h1>
            <p className="text-xs text-neutral-500">Connexion requise</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
          {notificationMessage && notificationType === 'error' && (
            <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
              {notificationMessage}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Nom d'utilisateur</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nom d'utilisateur administrateur"
              className="w-full px-4 py-2.5 rounded-xl border border-black/10 bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#4A9B8E]"
              required
              autoComplete="username"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl border border-black/10 bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#4A9B8E]"
              required
              autoComplete="current-password"
              minLength={1}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4A9B8E] hover:bg-[#3B8276] disabled:opacity-60 text-white py-2.5 rounded-xl font-semibold transition-colors"
          >
            {loading ? "Connexion…" : "Se connecter"}
          </button>

          <div className="text-xs text-neutral-500 text-center">
            Astuce: Assurez-vous que votre compte a le rôle <span className="font-semibold">admin</span>.
          </div>
        </form>
      </div>
    </div>
  );
}
