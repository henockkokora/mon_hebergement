"use client";

const MOCK = [
  { id: 1, date: "2025-08-20", label: "Publication 15 jours — Studio Plateau", amount: 500, method: "Mobile Money", status: "Payé" },
  { id: 2, date: "2025-08-28", label: "Renouvellement 15 jours — Studio Plateau", amount: 500, method: "Carte", status: "Payé" },
  { id: 3, date: "2025-09-03", label: "Pack 10 annonces", amount: 5000, method: "Mobile Money", status: "Payé" },
];

export default function Paiements() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Paiements & Abonnements</h1>
        <div className="flex gap-2">
          <button className="h-11 px-5 rounded-full bg-[#4A9B8E] text-white">Acheter des crédits</button>
          <button className="h-11 px-5 rounded-full border border-black/10">Voir mes packs</button>
        </div>
      </div>

      <div className="rounded-2xl border border-black/10 overflow-hidden bg-white/70">
        <div className="px-4 py-3 border-b border-black/10 font-semibold">Historique</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left bg-black/[.02]">
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
                <tr key={r.id} className="border-t border-black/5">
                  <td className="px-4 py-2 whitespace-nowrap">{r.date}</td>
                  <td className="px-4 py-2">{r.label}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{r.amount.toLocaleString()} FCFA</td>
                  <td className="px-4 py-2 whitespace-nowrap">{r.method}</td>
                  <td className="px-4 py-2"><span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 border border-green-200">{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-black/10 p-4 bg-white/70">
        <h2 className="text-lg font-semibold mb-2">Mon abonnement</h2>
        <p className="text-sm text-neutral-700">Pack actuel: <span className="font-semibold">Base</span> — Restant: <span className="font-semibold">7 annonces</span></p>
        <div className="mt-3 flex gap-2 flex-wrap">
          {[{k:'base',t:'Base'},{k:'plus',t:'Plus'},{k:'pro',t:'Pro'}].map(p=> (
            <button key={p.k} className="chip-glass px-3 py-2">Choisir {p.t}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
