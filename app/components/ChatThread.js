import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function ChatThread({ threadId, currentUserId, otherUser }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  // Charger l'historique
  useEffect(() => {
    async function fetchHistory() {
      setLoading(true);
      const res = await fetch(`${SOCKET_URL}/api/messages/thread/${threadId}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) setMessages(data.messages);
      setLoading(false);
    }
    if (threadId) fetchHistory();
  }, [threadId]);

  // Connexion socket
  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'], withCredentials: true });
    socketRef.current = socket;
    if (threadId) {
      socket.emit('join', threadId);
    }
    socket.on('history', (msgs) => setMessages(msgs));
    socket.on('message', (msg) => setMessages((prev) => [...prev, msg]));
    return () => socket.disconnect();
  }, [threadId]);

  // Scroll auto
  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Envoi message
  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || !socketRef.current) return;
    socketRef.current.emit('message', { threadId, senderId: currentUserId, body: text });
    setInput('');
  };

  return (
    <div className="flex flex-col h-full border rounded-xl bg-white">
      {/* Header */}
      <div className="p-4 border-b font-semibold flex items-center gap-2">
        <span>Discussion</span>
        {otherUser && <span className="text-sm text-neutral-500">avec {otherUser.nom || otherUser.email}</span>}
      </div>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-neutral-50">
        {loading ? (
          <div className="text-center text-sm text-neutral-500">Chargement...</div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={`max-w-[70%] px-3 py-2 rounded-lg text-sm whitespace-pre-line ${
                msg.senderId === currentUserId ? 'bg-[#4A9B8E] text-white ml-auto' : 'bg-white border'
              }`}
            >
              {msg.body}
              <div className="text-xs text-right mt-1 opacity-60">
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
      {/* Input */}
      <form onSubmit={handleSend} className="p-3 border-t flex gap-2 bg-white">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg border focus:ring-2 focus:ring-[#4A9B8E] outline-none"
          placeholder="Votre message..."
        />
        <button type="submit" className="px-4 py-2 rounded-lg bg-[#4A9B8E] text-white font-semibold disabled:opacity-50" disabled={!input.trim()}>
          Envoyer
        </button>
      </form>
    </div>
  );
}
