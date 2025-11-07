"use client";
import { useState } from "react";

const THREADS = [
  { id: 1, name: "CÉDRIC (Propriétaire)", time: "10:12" },
  { id: 2, name: "Service Support", time: "Hier" },
];

function IconBack({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

import { useParams } from 'next/navigation';

export default function ClientsConversation() {
  const params = useParams();
  const id = Number(params?.id);
  const conv = THREADS.find(t => t.id === id) || THREADS[0];
  const [text, setText] = useState("");
  function goBackToAnnonce(){
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      // Fallback vers une annonce générique si l'historique n'existe pas
      window.location.href = "/clients/annonce/" + (id || 1);
    }
  }
  return (
    <div className="min-h-screen vh-stable bg-gradient-to-b from-neutral-50 to-white">
      <div className="max-w-[1200px] mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Back control: icon only on mobile (<md), chip with text on desktop (>=md) */}
            <div className="block md:hidden">
              <button onClick={goBackToAnnonce} aria-label="Retour" className="inline-flex items-center justify-center border border-black/10 bg-white/95 rounded-full w-10 h-10 chip-glass">
                <IconBack className="w-5 h-5" />
              </button>
            </div>
            <div className="hidden md:block">
              <button onClick={goBackToAnnonce} className="inline-flex items-center gap-2 chip-glass px-3 py-1.5">
                <IconBack className="w-4 h-4" />
                Retour
              </button>
            </div>
            <h1 className="text-2xl font-bold">{conv.name}</h1>
          </div>
          <span className="chip-glass px-3 py-1.5 text-sm">Dernier: {conv.time}</span>
        </div>

        <section className="rounded-2xl border border-black/10 bg-white/70 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-black/10 text-sm text-neutral-500">Conversation</div>
          <div className="flex-1 px-4 py-3 space-y-3 overflow-y-auto" style={{minHeight: '50vh'}}>
            <div className="self-start max-w-[70%] chip-glass px-3 py-2">Bonjour, je suis intéressé par votre logement.</div>
            <div className="self-end max-w-[70%] chip-glass px-3 py-2">Bonjour, merci pour votre message !</div>
          </div>
          <form className="p-3 border-t border-black/10 flex items-center gap-2" onSubmit={e=>{e.preventDefault(); setText("");}}>
            <input value={text} onChange={e=>setText(e.target.value)} className="flex-1 h-11 px-3 rounded-xl border border-black/10 bg-white/90 outline-none" placeholder="Écrire un message..." />
            <button className="h-11 px-4 rounded-full bg-[#4A9B8E] text-white">Envoyer</button>
          </form>
        </section>
      </div>
    </div>
  );
}
