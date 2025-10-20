"use client";
import Link from "next/link";
import { useState } from "react";

const STORE = Array.from({ length: 8 }).map((_, i) => ({
  id: 4000 + i,
  subject: [
    "Problème de paiement",
    "Annonce refusée",
    "Demande de vérification",
    "Bug sur la messagerie",
  ][i % 4],
  from: ["Kouadio Marie","Jean Dupont","Awa K.","Client anonyme"][i % 4],
  status: ["Ouvert","En cours","Résolu"][i % 3],
  messages: [
    { from: "client", text: "Bonjour, j'ai un souci avec mon paiement." },
    { from: "admin", text: "Bonjour, nous regardons cela. Pouvez-vous préciser l'erreur ?" },
    { from: "client", text: "Paiement refusé code 05." },
  ],
}));

function IconBack({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

export default function ConversationPage({ params }) {
  const conv = STORE.find(x => String(x.id) === String(params.id)) || STORE[0];
  const [reply, setReply] = useState("");
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/admin/messagerie" className="chip-glass px-3 py-1.5 inline-flex items-center gap-2"><IconBack /> Retour</Link>
          <h1 className="text-2xl font-bold">{conv.subject}</h1>
        </div>
        <span className="chip-glass px-3 py-1.5 text-sm">{conv.status}</span>
      </div>

      <section className="rounded-2xl border border-black/10 bg-white/70 overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-black/10 text-sm text-neutral-500">De: {conv.from}</div>
        <div className="flex-1 p-4 space-y-3 overflow-y-auto" style={{minHeight: '45vh'}}>
          {conv.messages.map((m, i) => (
            <div key={i} className={`chip-glass px-3 py-2 max-w-[75%] ${m.from==='admin'? 'self-end':''}`}>{m.text}</div>
          ))}
        </div>
        <form onSubmit={(e)=>{e.preventDefault(); setReply("");}} className="p-3 border-t border-black/10 flex items-center gap-2">
          <input value={reply} onChange={e=>setReply(e.target.value)} className="flex-1 h-11 px-3 rounded-xl border border-black/10 bg-white/90 outline-none" placeholder="Écrire un message..." />
          <button className="h-11 px-4 rounded-full bg-[#4A9B8E] text-white">Envoyer</button>
        </form>
      </section>
    </div>
  );
}
