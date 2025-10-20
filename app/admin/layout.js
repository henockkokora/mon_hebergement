"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import apiService from '@/services/api';
import Notification from "@/components/Notification";

function Icon({ name, className = "w-5 h-5" }) {
  const common = `fill-none stroke-current ${className}`;
  switch (name) {
    case "dashboard":
      return (
        <svg viewBox="0 0 24 24" className={common} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M3 13h8V3H3z"/><path d="M13 21h8V11h-8z"/><path d="M3 21h8v-6H3z"/><path d="M13 9h8V3h-8z"/>
        </svg>
      );
    case "users":
      return (
        <svg viewBox="0 0 24 24" className={common} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="9" cy="8" r="4" /><path d="M1 21c0-3.5 3.5-6 8-6" /><circle cx="19" cy="8" r="3" /><path d="M13 21c0-2.6 2.6-4.5 6-4.5" />
        </svg>
      );
    case "list":
      return (
        <svg viewBox="0 0 24 24" className={common} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M8 6h13M8 12h13M8 18h13" /><path d="M3 6h.01M3 12h.01M3 18h.01" />
        </svg>
      );
    case "money":
      return (
        <svg viewBox="0 0 24 24" className={common} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 12h.01"/><path d="M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0z"/>
        </svg>
      );
    case "shield":
      return (
        <svg viewBox="0 0 24 24" className={common} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z"/>
        </svg>
      );
    case "chat":
      return (
        <svg viewBox="0 0 24 24" className={common} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M21 15a4 4 0 0 1-4 4H8l-5 3 1.5-4.5A4 4 0 0 1 4 15V7a4 4 0 0 1 4-4h9a4 4 0 0 1 4 4z"/>
        </svg>
      );
    case "settings":
      return (
        <svg viewBox="0 0 24 24" className={common} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9c0 .6.4 1.1 1 1.5.3.2.6.3 1 .3H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>
        </svg>
      );
    case "roles":
      return (
        <svg viewBox="0 0 24 24" className={common} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 2l7 4v4c0 5-3 8-7 10-4-2-7-5-7-10V6z"/><path d="M12 9v6"/><path d="M9 12h6"/>
        </svg>
      );
    case "theme":
      return (
        <svg viewBox="0 0 24 24" className={common} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2" />
          <path d="M12 21v2" />
          <path d="M4.22 4.22l1.42 1.42" />
          <path d="M18.36 18.36l1.42 1.42" />
          <path d="M1 12h2" />
          <path d="M21 12h2" />
          <path d="M4.22 19.78l1.42-1.42" />
          <path d="M18.36 5.64l1.42-1.42" />
        </svg>
      );
    default:
      return null;
  }
}

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const isLogin = pathname?.startsWith('/admin/login');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('info');

  const showNotification = (message, type = 'info') => {
    setNotificationMessage(message);
    setNotificationType(type);
  };

  const handlePasswordChange = async () => {
    if (!oldPassword || !newPassword || newPassword !== confirmPassword) {
      showNotification('Veuillez vérifier les champs (nouveau mot de passe doit correspondre à la confirmation)');
      return;
    }
    try {
      await apiService.updatePassword({ oldPassword, newPassword });
      showNotification('Mot de passe mis à jour avec succès');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e) {
      showNotification(e?.message || 'Erreur lors de la modification du mot de passe');
    }
  };

  const handleLogout = async () => {
    try {
      // Clear the authentication tokens from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
      }
      // Show success message before redirecting
      showNotification('Déconnexion réussie! Redirection...', 'success');
      setTimeout(() => {
        window.location.href = '/admin/login';
      }, 1000);
    } catch (e) {
      console.error('Logout error', e);
      // Fallback: still redirect even if there's an error
      window.location.href = '/admin/login';
    }
  };

  const NavItem = ({ href, icon, label }) => {
    const active = pathname === href;
    return (
      <Link href={href} className={`flex items-center gap-3 px-3 py-2 rounded-xl transition ${active? 'bg-[#4A9B8E]/15 text-[#2b4a47]':'hover:bg-black/5'}`}>
        <Icon name={icon} className="w-5 h-5" />
        <span className="hidden md:inline text-sm">{label}</span>
      </Link>
    );
  };

  // Vérification de session admin côté client
  const [adminChecked, setAdminChecked] = useState(false);

  useEffect(() => {
    // Si c'est la page de login, on ne fait rien
    if (isLogin) {
      setAdminChecked(true);
      return;
    }

    // Vérification du token admin
    const token = localStorage.getItem('admin_token');
    
    if (!token) {
      // Si pas de token, rediriger vers la page de login
      window.location.href = '/admin/login';
    } else {
      // Si token présent, on valide l'accès
      setAdminChecked(true);
    }
  }, [isLogin]);

  // Afficher un écran de chargement pendant la vérification
  if (!adminChecked && !isLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Vérification de la session...</div>
      </div>
    );
  }

  if (isLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white text-neutral-900">
        <main className="max-w-[1400px] w-full mx-auto px-4 py-6">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[240px_1fr] bg-gradient-to-b from-neutral-50 to-white text-neutral-900">
      <aside className="sticky top-0 h-svh md:h-screen md:block z-30 border-r border-black/10 bg-white/70 backdrop-blur px-3 py-4 hidden">
        <div className="flex items-center gap-2 px-2">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#4A9B8E] text-white">
            <Icon name="shield" className="w-4 h-4" />
          </div>
          <div className="font-semibold">Administrateur</div>
        </div>
        <nav className="mt-4 space-y-1">
          <NavItem href="/admin" icon="dashboard" label="Dashboard" />
          <NavItem href="/admin/utilisateurs" icon="users" label="Utilisateurs" />
          <NavItem href="/admin/annonces" icon="list" label="Annonces" />
          <NavItem href="/admin/finances" icon="money" label="Finances" />
          <NavItem href="/admin/signalements" icon="shield" label="Signalements" />
          <NavItem href="/admin/messagerie" icon="chat" label="Messagerie" />
          <NavItem href="/admin/parametres" icon="settings" label="Paramètres" />
          <NavItem href="/admin/theme" icon="theme" label="Theme" />
          <div className="pt-4 mt-4 border-t border-black/10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl transition hover:bg-red-50 text-red-600 hover:text-red-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16,17 21,12 16,7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <span className="hidden md:inline text-sm">Déconnexion</span>
            </button>
          </div>
        </nav>
      </aside>
      <main className="max-w-[1400px] w-full mx-auto px-4 py-6">
        <Notification message={notificationMessage} type={notificationType} onClose={() => setNotificationMessage('')} />
        {children}
      </main>
    </div>
  );
}
