"use client";

import { useEffect, useState } from "react";

const MOCK = [
  { id: 1, date: "2025-08-20", label: "Publication 15 jours — Studio Plateau", amount: 500, method: "Mobile Money", status: "Payé" },
  { id: 2, date: "2025-08-28", label: "Renouvellement 15 jours — Studio Plateau", amount: 500, method: "Carte", status: "Payé" },
  { id: 3, date: "2025-09-03", label: "Pack 10 annonces", amount: 5000, method: "Mobile Money", status: "Payé" },
];

export default function Paiements() {
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setPageLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  if (pageLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="relative h-16 w-16 mx-auto mb-2">
            <svg className="absolute inset-0 w-12 h-12 m-2 text-neutral-800 house-bounce" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="3" y="5" width="18" height="14" rx="2" ry="2" />
              <line x1="3" y1="10" x2="21" y2="10" />
              <line x1="7" y1="15" x2="9" y2="15" />
              <line x1="11" y1="15" x2="17" y2="15" />
            </svg>
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-10 h-2 rounded-full bg-neutral-300/60 house-shadow" />
          </div>
          <p className="text-neutral-600 text-sm">Chargement des paiements...</p>
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
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] leading-7 md:text-2xl font-semibold text-neutral-900">Paiements & Abonnements</h1>
        <div className="flex gap-2">
          <button className="h-11 px-5 rounded-full bg-neutral-800 text-white font-semibold shadow-sm transition-colors hover:bg-neutral-700">Acheter des crédits</button>
          <button className="h-11 px-5 rounded-full bg-neutral-100 text-neutral-900 font-semibold shadow-sm transition-colors hover:bg-neutral-200">Voir mes packs</button>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden bg-neutral-50 shadow-sm">
        <div className="px-4 py-3 text-[15px] font-semibold text-neutral-900 bg-neutral-100">Historique</div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] text-neutral-800">
            <thead className="text-left bg-neutral-100">
              <tr>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Description</th>
                <th className="px-4 py-2">Montant</th>
                <th className="px-4 py-2">Méthode</th>
                <th className="px-4 py-2">Statut</th>
              </tr>
            </thead>
            <tbody>
              {MOCK.map((r)=> (
                <tr key={r.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-2 whitespace-nowrap align-middle">{r.date}</td>
                  <td className="px-4 py-2 align-middle">{r.label}</td>
                  <td className="px-4 py-2 whitespace-nowrap align-middle">{r.amount.toLocaleString()} FCFA</td>
                  <td className="px-4 py-2 whitespace-nowrap align-middle">{r.method}</td>
                  <td className="px-4 py-2 align-middle"><span className="px-2 py-1 text-[12px] rounded-full bg-neutral-200 text-neutral-700 font-medium">{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl p-4 bg-neutral-50 shadow-sm">
        <h2 className="text-[15px] font-semibold mb-2 text-neutral-900">Mon abonnement</h2>
        <p className="text-[13px] text-neutral-700">Pack actuel: <span className="font-semibold">Base</span> — Restant: <span className="font-semibold">7 annonces</span></p>
        <div className="mt-3 flex gap-2 flex-wrap">
          {[{k:'base',t:'Base'},{k:'plus',t:'Plus'},{k:'pro',t:'Pro'}].map(p=> (
            <button key={p.k} className="px-3 py-2 text-[13px] font-medium rounded-full bg-neutral-100 text-neutral-800 shadow-sm transition-colors hover:bg-neutral-200">Choisir {p.t}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
