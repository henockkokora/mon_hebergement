"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import apiService from "../../services/api";
import { io } from "socket.io-client";
import ConfirmModal from "@/components/ConfirmModal";

// Composants UI réutilisables
function IconBack({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function Loader() {
  return (
    <div className="flex justify-center items-center p-4">
      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

function ErrorMessage({ message, onRetry, onClose }) {
  return (
    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-4 flex justify-between items-center">
      <div className="flex-1">
        <p className="font-medium">Erreur</p>
        <p>{message}</p>
      </div>
      <div className="flex gap-2">
        {onRetry && (
          <button 
            onClick={onRetry}
            className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
          >
            Réessayer
          </button>
        )}
        <button 
          onClick={onClose}
          className="text-red-500 hover:text-red-700"
          aria-label="Fermer"
        >
          ×
        </button>
      </div>
    </div>
  );
}

// Composant pour la discussion temps réel
function ChatRoom({ roomId, user, onConnectionStatusChange, proprietaireName }) {
  function goBack() {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/clients";
    }
  }

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [socketInstance, setSocketInstance] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const messagesEndRef = useRef(null);

  // Gestion des reconnexions
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000; // 1 seconde

  const connectWebSocket = useCallback(() => {
    setIsLoading(true);
    setError(null);
    
    const socket = io(apiService.getWebSocketURL(), {
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: baseReconnectDelay,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    // Gestion des événements de connexion
    socket.on("connect", () => {
      console.log("Connecté au serveur de messagerie");
      setIsConnected(true);
      setIsReconnecting(false);
      reconnectAttempts.current = 0;
      onConnectionStatusChange?.(true);
      
      // Rejoindre la room après la connexion
      socket.emit("join", roomId);
    });

    socket.on("connect_error", (err) => {
      console.error("Erreur de connexion:", err);
      setIsConnected(false);
      onConnectionStatusChange?.(false);
      
      // Gestion des tentatives de reconnexion
      reconnectAttempts.current += 1;
      const delay = Math.min(
        baseReconnectDelay * Math.pow(2, reconnectAttempts.current - 1),
        30000 // délai maximum de 30 secondes
      );
      
      if (reconnectAttempts.current <= maxReconnectAttempts) {
        setIsReconnecting(true);
        setError(`Tentative de reconnexion (${reconnectAttempts.current}/${maxReconnectAttempts})...`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          socket.connect();
        }, delay);
      } else {
        setError("Impossible de se connecter au serveur. Veuillez rafraîchir la page.");
        setIsReconnecting(false);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("Déconnecté:", reason);
      setIsConnected(false);
      onConnectionStatusChange?.(false);
      
      if (reason === "io server disconnect") {
        // Reconnexion manuelle nécessaire
        socket.connect();
      }
    });

    // Gestion des messages
    socket.on("history", (msgs) => {
      setMessages(msgs);
      setIsLoading(false);
      scrollToBottom();
    });

    socket.on("message", (msg) => {
      setMessages(prev => {
        const msgId = (msg._id && msg._id.toString) ? msg._id.toString() : msg._id;
        // 1) si un message avec le même _id existe déjà, on met à jour et on ne duplique pas
        if (msgId && prev.some(p => ((p._id && p._id.toString ? p._id.toString() : p._id) === msgId))) {
          return prev.map(p => ((p._id && p._id.toString ? p._id.toString() : p._id) === msgId)
            ? { ...p, ...msg, isSending: false, hasError: false }
            : p
          );
        }
        // 2) si un message optimiste envoi en cours correspond (même body) on fusionne
        const currentUserId = (user && user._id ? user._id : user);
        const optimisticIndex = prev.findIndex(p => p.isSending && p.body === msg.body && (p.senderId === currentUserId));
        if (optimisticIndex !== -1) {
          const clone = [...prev];
          clone[optimisticIndex] = { ...clone[optimisticIndex], ...msg, isSending: false, hasError: false, _id: msg._id };
          return clone;
        }
        // sinon on ajoute à la fin
        return [...prev, msg];
      });
      scrollToBottom();
    });

    socket.on("error", (err) => {
      console.error("Erreur du serveur:", err);
      setError(err.message || "Une erreur est survenue avec le serveur");
    });

    // Gestion de l'ACK d'envoi de message
    socket.on("message_ack", (ack) => {
      console.log('ACK RECU', ack);
      setMessages(prev =>
        prev.map(msg => {
          // On match soit par _id temporaire (si encore présent), soit par body+isSending
          if (msg._id === ack.messageId || (msg.isSending && msg.body === ack.body)) {
            return { ...msg, _id: ack.messageId, isSending: false, createdAt: ack.createdAt };
          }
          return msg;
        })
      );
    });
    setSocketInstance(socket);

    // Nettoyage
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      socket.off("connect");
      socket.off("connect_error");
      socket.off("disconnect");
      socket.off("history");
      socket.off("message");
      socket.off("error");
      socket.disconnect();
    };
  }, [roomId, onConnectionStatusChange]);

  // Effet pour gérer la reconnexion manuelle
  useEffect(() => {
    connectWebSocket();
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connectWebSocket]);

  // Faire défiler vers le bas automatiquement
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!input.trim() || !socketInstance || !isConnected) return;
    
    const messageToSend = input;
    setInput("");
    
    // Optimistic UI update
    const tempId = Date.now().toString();
    const currentUserId = user && user._id ? user._id : user;
    const newMessage = {
      _id: tempId,
      senderId: currentUserId,
      body: messageToSend,
      time: new Date().toISOString(),
      isSending: true
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Envoyer le message
    console.log('ENVOI MESSAGE', { threadId: roomId, senderId: currentUserId });
    socketInstance.emit("message", { 
      threadId: roomId, 
      senderId: currentUserId, 
      body: messageToSend, 
      time: new Date().toISOString() 
    }, (ack) => {
      // Mettre à jour l'état une fois le message confirmé par le serveur
      if (ack && ack.success) {
        setMessages(prev => 
          prev.map(msg => 
            msg._id === tempId 
              ? { ...msg, _id: ack.messageId, isSending: false } 
              : msg
          )
        );
      } else {
        // Marquer le message comme échoué
        setMessages(prev =>
          prev.map(msg =>
            msg._id === tempId
              ? { ...msg, isSending: false, hasError: true }
              : msg
          )
        );
        setError("Impossible d'envoyer le message. Veuillez réessayer.");
      }
    });
    
    scrollToBottom();
  };
  
  const retryConnection = () => {
    if (reconnectAttempts.current < maxReconnectAttempts) {
      connectWebSocket();
    } else {
      window.location.reload();
    }
  };

  // Effet pour le défilement automatique
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  return (
    <div className="flex flex-col h-full">
      {/* En-tête avec statut de connexion */}
      <div className="border-b p-3 flex items-center justify-between bg-white">
        <div className="flex items-center">
          <h2 className="font-medium">
            {isReconnecting
              ? 'Connexion en cours...'
              : `Discussion${proprietaireName ? ' avec ' + proprietaireName : ''}`}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <div 
            className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`}
            title={isConnected ? 'Connecté' : 'Déconnecté'}
          ></div>
          <span className="text-xs text-gray-500">
            {isConnected ? 'En ligne' : isReconnecting ? 'Connexion...' : 'Hors ligne'}
          </span>
        </div>
      </div>

      {/* Zone des messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#efeae2]" style={{ maxHeight: 'calc(100vh - 180px)' }}>

        {error && (
          <ErrorMessage 
            message={error} 
            onRetry={retryConnection}
            onClose={() => setError(null)}
          />
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 text-center p-6">
            <p>Aucun message dans cette conversation.</p>
            <p className="text-sm mt-2">Envoyez un message pour commencer la discussion.</p>
          </div>
        ) : (
          messages.map((m, index) => {
            // On considère que m.senderId (ou m.sender) est l'id de l'expéditeur
            const senderId = (m.senderId || (typeof m.sender === 'object' ? m.sender._id : m.sender))?.toString?.() || '';
            const currentUserId = (user && user._id ? user._id : user)?.toString?.() || '';
            const isMine = Boolean(senderId) && Boolean(currentUserId) && senderId === currentUserId;
            const prev = messages[index - 1];
            const prevSender = (prev && (prev.senderId || (typeof prev.sender === 'object' ? prev.sender._id : prev.sender)))?.toString?.() || '';
            const isSameAsPrev = prev && prevSender === senderId;
            return (
              <div 
                key={m._id || m.tempId}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'} ${isSameAsPrev ? 'mt-1' : 'mt-3'}`}
              >
                <div 
                  className={`max-w-[80%] p-2.5 rounded-2xl relative ${
                    isMine
                      ? 'bg-[#DCF8C6] text-gray-900 rounded-br-none shadow-sm'
                      : 'bg-white border border-gray-200 rounded-bl-none'
                  } ${m.hasError ? 'border-red-300 bg-red-50' : ''} ${
                    m.isSending ? 'opacity-80' : ''
                  }`}
                >
                  <p className="text-[15px] whitespace-pre-wrap break-words leading-5">{m.body}</p>
                  <div className="flex items-center justify-end mt-1 space-x-1">
                    <span className="text-[11px] text-gray-500">
                      {(m.createdAt || m.time) && !isNaN(new Date(m.createdAt || m.time))
                        ? new Date(m.createdAt || m.time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false })
                        : ''}
                    </span>
                    {m.isSending && (
                      <span className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Zone de saisie */}
      <div className="p-3 border-t bg-white">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50" 
            placeholder={isConnected ? "Écrire un message..." : "Connexion en cours..."}
            disabled={!isConnected || isLoading}
            aria-label="Message"
          />
          <button 
            type="submit"
            disabled={!input.trim() || !isConnected || isLoading}
            className={`px-4 py-2 rounded-full transition-colors ${
              isConnected && input.trim() && !isLoading
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
            aria-label="Envoyer le message"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
            ) : (
              'Envoyer'
            )}
          </button>
        </form>
      </div>

      <ConfirmModal
        open={false}
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    </div>
  );
}

export default function ClientsMessages() {
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('userData')) : null;
  console.log('USER LOCALSTORAGE', user);
  const currentUserId = user?._id;
  const [threads, setThreads] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const threadsSocketRef = useRef(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Charger la liste des conversations (threads) du client
  useEffect(() => {
    const fetchThreads = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Récupérer les conversations depuis l'API
        const response = await apiService.get("/api/threads");
        
        if (response && Array.isArray(response.data)) {
          // Récupérer les non lus
          let unreadMap = {};
          try {
            const unreadRes = await apiService.get('/api/threads/unread-by-thread');
            unreadMap = unreadRes?.data || {};
          } catch {}

          // Formater les données des threads pour correspondre à la structure attendue
          const formattedThreads = response.data.map(thread => ({
            id: thread._id,
            name: thread.proprietaireId?.nom || thread.annonceId?.titre || 'Annonce sans titre',
            last: thread.lastMessage || 'Aucun message',
            annonceId: thread.annonceId?._id,
            proprietaireId: thread.proprietaireId?._id,
            lastUpdated: thread.updatedAt,
            unreadCount: unreadMap[thread._id] || 0
          }));
          setThreads(formattedThreads);
          // Sélection automatique via threadId dans l'URL
          const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
          const threadIdFromUrl = urlParams ? urlParams.get('threadId') : null;
          if (threadIdFromUrl && formattedThreads.some(t => t.id === threadIdFromUrl)) {
            setActiveThread(threadIdFromUrl);
          } else if (formattedThreads.length > 0) {
            setActiveThread(formattedThreads[0].id);
          }
        } else {
          setError("Format de réponse inattendu du serveur");
        }
      } catch (err) {
        setError(
          err.response?.data?.message || 
          "Impossible de charger les conversations. Veuillez réessayer plus tard."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchThreads();
    
    // Rafraîchir périodiquement les conversations (toutes les 30 secondes)
    const refreshInterval = setInterval(fetchThreads, 30000);
    
    // Nettoyer l'intervalle lors du démontage du composant
    return () => clearInterval(refreshInterval);
  }, []);

  // Marquer comme lu quand on ouvre une conversation
  useEffect(() => {
    if (!activeThread) return;
    (async () => {
      try {
        await apiService.post(`/api/threads/${activeThread}/read`, {});
        setThreads(prev => prev.map(t => t.id === activeThread ? { ...t, unreadCount: 0 } : t));
      } catch {}
    })();
  }, [activeThread]);

  // Socket pour mettre à jour la liste des conversations en temps réel
  useEffect(() => {
    if (!threads || threads.length === 0) return;

    if (threadsSocketRef.current) {
      threadsSocketRef.current.disconnect();
      threadsSocketRef.current = null;
    }

    const socket = io(apiService.getWebSocketURL(), {
      transports: ["websocket", "polling"],
      withCredentials: true,
    });
    threadsSocketRef.current = socket;

    socket.on('connect', () => {
      threads.forEach(t => {
        if (t?.id) socket.emit('join', t.id);
      });
    });

    socket.on('message', (msg) => {
      const threadId = (msg.threadId && msg.threadId.toString) ? msg.threadId.toString() : msg.threadId;
      setThreads(prev => prev.map(t => {
        const isSameThread = t.id === threadId;
        const isIncoming = msg.senderId && currentUserId && msg.senderId !== currentUserId;
        const shouldIncrement = isSameThread ? false : isIncoming;
        return isSameThread
          ? { ...t, last: msg.body, lastUpdated: msg.createdAt || new Date().toISOString() }
          : shouldIncrement ? { ...t, unreadCount: (t.unreadCount || 0) + 1 } : t;
      }));
    });

    socket.on('thread_deleted', (deletedThreadId) => {
      if (activeThread === deletedThreadId) {
        setActiveThread(null);
      }
      setThreads(prev => prev.filter(t => t.id !== deletedThreadId));
    });

    return () => {
      socket.off('message');
      socket.off('thread_deleted');
      socket.disconnect();
    };
  }, [threads, activeThread, currentUserId]);

  const handleConnectionStatus = useCallback((status) => {
    setIsConnected(status);
  }, []);

  function goBack() {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/clients";
    }
  }

  // Afficher l'erreur si elle existe
  if (error && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-6 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">Erreur de chargement</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-4">
          {/* Sidebar conversations */}
          <aside className="rounded-2xl border border-black/10 bg-white/70 overflow-hidden">
            <div className="w-80 border-r bg-white flex flex-col">
              <div className="border-b p-4 flex items-center gap-2">
                <button onClick={() => {
                  if (typeof window !== 'undefined' && window.history.length > 1) {
                    window.history.back();
                  } else {
                    window.location.href = "/clients";
                  }
                }} aria-label="Retour" className="mr-2 inline-flex items-center justify-center border border-black/10 bg-white/95 rounded-full w-9 h-9 chip-glass">
                  <IconBack className="w-5 h-5" />
                </button>
                <span className="font-semibold text-lg">Conversations</span>
              </div>
              <ul className="divide-y divide-black/10">
                {isLoading ? (
                  <li className="px-4 py-6 text-center text-gray-400">
                    <Loader />
                  </li>
                ) : threads.length === 0 ? (
                  <li className="px-4 py-6 text-center text-gray-400">Aucune conversation trouvée</li>
                ) : (
                  threads.map(t => (
                    <li key={t.id} className="px-4 py-3">
                      <button
                        onClick={() => setActiveThread(t.id)}
                        className={`block w-full text-left -mx-2 px-2 py-2 rounded-lg hover:bg-black/[.03] ${activeThread === t.id ? 'bg-blue-50' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium flex items-center gap-2">
                            {t.name}
                            {t.unreadCount > 0 && (
                              <span className="inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[11px]">
                                {t.unreadCount}
                              </span>
                            )}
                          </span>
                          <span className="text-xs text-neutral-500">{t.lastUpdated ? new Date(t.lastUpdated).toLocaleDateString('fr-FR', { weekday: 'short' }) : ''}</span>
                        </div>
                        <div className="text-sm text-neutral-600 line-clamp-1">{t.last}</div>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </aside>
          {/* Zone centrale */}
          <section className="rounded-2xl border border-black/10 bg-white/70 flex items-center justify-center p-6 text-sm text-neutral-600 min-h-[70vh]">
            {activeThread ? (
              <div className="w-full h-full">
                <div className="flex items-center justify-between px-2 pb-2">
                  <div className="text-sm text-gray-500">Conversation</div>
                  <button
                    onClick={() => setConfirmOpen(true)}
                    title="Supprimer la conversation"
                    aria-label="Supprimer la conversation"
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-red-200 text-red-600 hover:bg-red-50"
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
                <ChatRoom 
                  roomId={activeThread} 
                  user={user}
                  onConnectionStatusChange={handleConnectionStatus}
                  proprietaireName={(() => {
                    const thread = threads.find(t => t.id === activeThread);
                    return thread && thread.name ? thread.name : '';
                  })()}
                />
              </div>
            ) : (
              <div className="w-full flex flex-col items-center justify-center">
                <span className="text-4xl mb-2">💬</span>
                <span className="text-lg font-medium mb-1">Sélectionnez une conversation pour l’ouvrir.</span>
              </div>
            )}
          </section>
        </div>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="Supprimer la conversation"
        description="Cette action est définitive et retirera la conversation des deux côtés."
        confirmText="Supprimer"
        cancelText="Annuler"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={async () => {
          try {
            await apiService.delete(`/api/threads/${activeThread}`);
            setThreads(prev => prev.filter(t => t.id !== activeThread));
            setActiveThread(null);
          } catch (e) {
            alert(e.message || 'Suppression impossible');
          } finally {
            setConfirmOpen(false);
          }
        }}
      />
    </div>
  );
}
