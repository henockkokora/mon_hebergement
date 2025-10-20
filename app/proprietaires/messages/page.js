"use client";
import { useEffect, useState, useRef } from "react";
import apiService from "@/services/api";
import { io } from "socket.io-client";
import ConversationClient from "./[id]/ConversationClient";
import ConfirmModal from "@/components/ConfirmModal";

export default function Messages() {
  const [threads, setThreads] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [threadToDelete, setThreadToDelete] = useState(null);

  useEffect(() => {
    async function fetchOwnerThreads() {
      try {
        setLoading(true);
        setError(null);
        const data = await apiService.get('/api/threads/owner'); // utilise auth_token_owner via apiService.getAuthToken()
        const list = data?.data || [];
        // Récupérer les non lus
        let unreadMap = {};
        try {
          const unreadRes = await apiService.get('/api/threads/unread-by-thread');
          unreadMap = unreadRes?.data || {};
        } catch {}
        const withUnread = list.map(t => ({ ...t, unreadCount: unreadMap[t._id] || 0 }));
        setThreads(withUnread);
        if (withUnread.length > 0) {
          setActiveThread(withUnread[0]._id);
        }
      } catch (e) {
        // Si non authentifié, guider l'utilisateur
        if (e.status === 401) {
          setError("Session expirée. Veuillez vous reconnecter.");
        } else {
          setError(e.message || 'Erreur lors du chargement des conversations');
        }
      } finally {
        setLoading(false);
      }
    }
    fetchOwnerThreads();
  }, []);

  // Marquer comme lu à l'ouverture
  useEffect(() => {
    if (!activeThread) return;
    (async () => {
      try {
        await apiService.post(`/api/threads/${activeThread}/read`, {});
        setThreads(prev => prev.map(t => t._id === activeThread ? { ...t, unreadCount: 0 } : t));
      } catch {}
    })();
  }, [activeThread]);

  // Temps réel: rejoindre toutes les rooms et mettre à jour l’aperçu
  useEffect(() => {
    if (!threads || threads.length === 0) return;

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const socket = io(apiService.getWebSocketURL(), {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      threads.forEach(t => {
        if (t?._id) socket.emit('join', t._id);
      });
    });

    socket.on('message', (msg) => {
      const threadId = (msg.threadId && msg.threadId.toString) ? msg.threadId.toString() : msg.threadId;
      setThreads(prev => prev.map(t => {
        const isSameThread = t._id === threadId;
        const isIncoming = msg.senderId && typeof window !== 'undefined' && (() => {
          const u = JSON.parse(localStorage.getItem('userData_owner') || 'null') || JSON.parse(localStorage.getItem('userData') || 'null');
          return u && u._id && msg.senderId !== u._id;
        })();
        const shouldIncrement = isSameThread ? false : isIncoming;
        return isSameThread
          ? { ...t, lastMessage: msg.body, updatedAt: msg.createdAt || new Date().toISOString() }
          : shouldIncrement ? { ...t, unreadCount: (t.unreadCount || 0) + 1 } : t;
      }));
    });

    socket.on('thread_deleted', ({ threadId }) => {
      setThreads(prev => prev.filter(t => t._id !== threadId));
      setActiveThread(prev => (prev === threadId ? null : prev));
    });

    return () => {
      socket.off('message');
      socket.off('thread_deleted');
      socket.disconnect();
    };
  }, [threads]);

  const goBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/proprietaires';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-4">
      <aside className="rounded-3xl bg-neutral-50 shadow-sm overflow-hidden">
        <div className="px-4 pt-3">
          <button onClick={goBack} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F5F5F5] hover:bg-[#EDEDED] text-[13px] font-medium text-neutral-700 shadow" aria-label="Retour">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden>
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Retour
          </button>
        </div>
        <div className="px-4 py-3 text-[15px] font-semibold text-neutral-900">Conversations</div>
        {loading ? (
          <div className="p-6">
            <div className="text-center">
              <div className="relative h-16 w-16 mx-auto mb-2">
                <svg className="absolute inset-0 w-12 h-12 m-2 text-neutral-800 house-bounce" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M21 15a4 4 0 0 1-4 4H8l-5 3 1.5-4.5A4 4 0 0 1 4 15V7a4 4 0 0 1 4-4h9a4 4 0 0 1 4 4z"/>
                </svg>
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-10 h-2 rounded-full bg-neutral-300/60 house-shadow" />
              </div>
              <p className="text-neutral-600 text-sm">Chargement des conversations...</p>
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
        ) : error ? (
          <div className="p-4 text-sm text-red-600 flex items-center justify-between">
            <span>{error}</span>
            {error?.includes('Session expirée') && (
              <a href="/proprietaires/connexion" className="text-red-700 underline">Se reconnecter</a>
            )}
          </div>
        ) : (
          <ul className="space-y-1">
            {threads.length === 0 && (
              <li className="px-4 py-3 text-[13px] text-neutral-500">Aucune conversation</li>
            )}
            {threads.map((t) => (
              <li key={t._id} className="px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <button onClick={() => setActiveThread(t._id)} className={`flex-1 text-left -mx-2 px-2 py-2 rounded-lg hover:bg-[#F5F5F5] ${activeThread === t._id ? 'bg-[#EDEDED] shadow-inner' : ''}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[15px] flex items-center gap-2 text-neutral-900">
                        {t.clientId?.nom || t.clientId?.email || 'Client'}
                        {(t.unreadCount || 0) > 0 && (
                          <span className="inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-neutral-800 text-white text-[11px]">
                            {t.unreadCount}
                          </span>
                        )}
                      </span>
                      <span className="text-[12px] text-neutral-500">
                        {t.updatedAt ? new Date(t.updatedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) : ''}
                      </span>
                    </div>
                    <div className="text-[13px] text-neutral-600 line-clamp-1">{t.lastMessage || '—'}</div>
                  </button>
                  <button
                    title="Supprimer"
                    onClick={(e) => {
                      e.preventDefault();
                      setThreadToDelete(t._id);
                      setConfirmOpen(true);
                    }}
                    aria-label="Supprimer"
                    className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full bg-neutral-100 text-neutral-800 hover:bg-neutral-200 shadow-sm"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden>
                      <path d="M6 7h12" />
                      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                      <path d="M7 7v10a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7" />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </aside>

      <section className="rounded-3xl bg-neutral-50 shadow-sm flex items-stretch justify-center p-0 text-[13px] text-neutral-600 min-h-[70vh]">
        {activeThread ? (
          <div className="w-full h-full">
            <ConversationClient roomId={activeThread} />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center p-6">Sélectionnez une conversation pour l’ouvrir.</div>
        )}
      </section>

      <ConfirmModal
        open={confirmOpen}
        title="Supprimer la conversation"
        description="Cette action est définitive et retirera la conversation des deux côtés."
        confirmText="Supprimer"
        cancelText="Annuler"
        onCancel={() => { setConfirmOpen(false); setThreadToDelete(null); }}
        onConfirm={async () => {
          try {
            if (!threadToDelete) return;
            await apiService.delete(`/api/threads/${threadToDelete}`);
            setThreads(prev => prev.filter(t => t._id !== threadToDelete));
            setActiveThread(prev => (prev === threadToDelete ? null : prev));
          } catch (e) {
            alert(e.message || 'Suppression impossible');
          } finally {
            setConfirmOpen(false);
            setThreadToDelete(null);
          }
        }}
      />
    </div>
  );
}
