"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";
import apiService from "@/services/api";

// Composant d'icône de retour réutilisable
function IconBack({ className = "w-5 h-5", onClick }) {
  return (
    <button 
      onClick={onClick}
      className="p-1 rounded-full hover:bg-gray-100 transition-colors"
      aria-label="Retour"
    >
      <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.8" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className} 
        aria-hidden
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
  );
}

export default function ConversationClient({ roomId }) {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const socketRef = useRef(null);
  const [clientName, setClientName] = useState("");

  const currentUser = typeof window !== 'undefined' ? (JSON.parse(localStorage.getItem('userData_owner')) || JSON.parse(localStorage.getItem('userData')) ) : null;
  const currentUserId = currentUser?._id;

  // Charger les infos du thread pour le header (nom du client)
  useEffect(() => {
    async function loadThread() {
      try {
        if (!roomId) return;
        const data = await apiService.get(`/api/threads/${roomId}`);
        const name = data?.thread?.client?.nom || data?.thread?.client?.email || "";
        setClientName(name);
      } catch (e) {
        // silencieux si erreur
      }
    }
    loadThread();
  }, [roomId]);

  // Gestion des messages
  useEffect(() => {
    if (!roomId || typeof roomId !== 'string') {
      setError("ID de conversation invalide");
      setIsLoading(false);
      return;
    }

    const socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000", {
      reconnection: true,
      transports: ["websocket", "polling"],
      withCredentials: true,
    });
    socketRef.current = socket;

    const handleConnect = () => {
      setIsConnected(true);
      setError(null);
      socket.emit("join", roomId);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleError = (err) => {
      setError(err?.message || 'Erreur de connexion');
      setIsLoading(false);
    };

    const handleHistory = (msgs) => {
      setMessages(msgs);
      setIsLoading(false);
    };

    const handleNewMessage = (msg) => {
      setMessages(prev => {
        const msgId = (msg._id && msg._id.toString) ? msg._id.toString() : msg._id;
        if (msgId && prev.some(p => ((p._id && p._id.toString ? p._id.toString() : p._id) === msgId))) {
          return prev.map(p => ((p._id && p._id.toString ? p._id.toString() : p._id) === msgId)
            ? { ...p, ...msg, isSending: false, hasError: false }
            : p
          );
        }
        const optimisticIndex = prev.findIndex(p => p.isSending && p.body === msg.body && (p.senderId === (typeof currentUserId === 'object' ? currentUserId._id : currentUserId)));
        if (optimisticIndex !== -1) {
          const clone = [...prev];
          clone[optimisticIndex] = { ...clone[optimisticIndex], ...msg, isSending: false, hasError: false, _id: msg._id };
          return clone;
        }
        return [...prev, msg];
      });
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleError);
    socket.on("history", handleHistory);
    socket.on("message", handleNewMessage);
    socket.on("error", handleError);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleError);
      socket.off("history", handleHistory);
      socket.off("message", handleNewMessage);
      socket.off("error", handleError);
      socket.disconnect();
    };
  }, [roomId]);

  // Faire défiler vers le bas à chaque nouveau message
  useEffect(() => {
    if (messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  
  // Gestion de l'envoi de message
  const handleSendMessage = useCallback((e) => {
    e.preventDefault();
    if (!text.trim() || !isConnected || !socketRef.current || !currentUserId) return;

    const messageToSend = text.trim();
    setText("");

    // Envoi via le même socket et protocole du backend
    socketRef.current.emit("message", {
      threadId: roomId,
      senderId: currentUserId,
      body: messageToSend,
      time: new Date().toISOString()
    });

    inputRef.current?.focus();
  }, [text, isConnected, roomId, currentUserId]);
  
  // Gestion du retour en arrière
  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* En-tête */}
      <header className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">
            {clientName ? `Discussion avec ${clientName}` : 'Messages'}
          </h1>
          <div className="flex items-center gap-3">
            <div 
              className={`w-3 h-3 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}
              title={isConnected ? 'Connecté' : 'Déconnecté'}
            />
            <span className="text-xs text-gray-500">{isConnected ? 'En ligne' : 'Hors ligne'}</span>
          </div>
        </div>
      </header>

      {/* Zone des messages */}
      <main className="flex-1 overflow-y-auto bg-[#efeae2]">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Réessayer
            </button>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Aucun message pour le moment. Envoyez le premier message !
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {messages.map((msg, index) => {
              const senderId = (msg.senderId || (typeof msg.sender === 'object' ? msg.sender._id : msg.sender))?.toString?.() || '';
              const meId = (currentUserId && currentUserId.toString) ? currentUserId.toString() : (currentUserId ? String(currentUserId) : '');
              const isMe = Boolean(senderId) && Boolean(meId) && senderId === meId;
              const prev = messages[index - 1];
              const prevSender = (prev && (prev.senderId || (typeof prev.sender === 'object' ? prev.sender._id : prev.sender)))?.toString?.() || '';
              const isSameAsPrev = prev && prevSender === senderId;
              return (
                <div 
                  key={msg._id || index} 
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${isSameAsPrev ? 'mt-1' : 'mt-3'}`}
                >
                  <div 
                    className={`max-w-[80%] p-2.5 rounded-2xl relative ${
                      isMe 
                        ? 'bg-[#DCF8C6] text-gray-900 rounded-br-none shadow-sm' 
                        : 'bg-white border border-gray-200 rounded-bl-none'
                    } ${msg.hasError ? 'border-red-300 bg-red-50' : ''} ${
                      msg.isSending ? 'opacity-80' : ''
                    }`}
                  >
                    <p className="text-[15px] whitespace-pre-wrap break-words leading-5">{msg.body}</p>
                    <div className="flex items-center justify-end mt-1 space-x-1">
                      <span className="text-[11px] text-gray-500">
                        {formatTime(msg.createdAt || msg.time || new Date())}
                      </span>
                      {msg.isSending && (
                        <span className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </main>

      {/* Zone de saisie */}
      <footer className="border-t border-gray-200 bg-white p-3">
        <form onSubmit={handleSendMessage}>
          <div className="flex items-center space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Écrivez votre message..."
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              disabled={!isConnected}
              aria-label="Message"
            />
            <button
              type="submit"
              disabled={!text.trim() || !isConnected}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Envoyer le message"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 101.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" 
                  clipRule="evenodd" 
                />
              </svg>
            </button>
          </div>
        </form>
      </footer>
    </div>
  );
}
