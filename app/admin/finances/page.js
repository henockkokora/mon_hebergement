"use client";
import { useState } from "react";

function Kpi({ label, value }) {
  return (
    <div className="chip-glass px-4 py-3 rounded-2xl min-w-[160px] flex-1">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-neutral-600">{label}</div>
    </div>
  );
}

const ROWS = Array.from({ length: 12 }).map((_, i) => ({
  id: 2000 + i,
  user: ["Kouadio Marie","Jean Dupont","Awa K.","Yao P."][i % 4],
  label: ["Publication 15j","Renouvellement","Pack 10 annonces"][i % 3],
  amount: [500, 900, 5000][i % 3],
  method: ["Mobile Money","Carte"][i % 2],
  date: `2025-09-${10 + (i % 10)}`,
  status: ["Payé","Échoué"][i % 6 === 0 ? 1 : 0],
}));

export default function AdminFinances() {
  const [range, setRange] = useState("30d");
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Finances</h1>
        <div className="flex gap-2 text-sm">
          {["7d","30d","90d"].map(r=> (
            <button key={r} onClick={()=>setRange(r)} className={`chip-glass px-3 py-1 ${range===r? 'ring-1 ring-[#4A9B8E]':''}`}>{r}</button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Kpi label="Revenus (jour)" value="120 000 FCFA" />
        <Kpi label="Revenus (semaine)" value="820 000 FCFA" />
        <Kpi label="Revenus (mois)" value="3 450 000 FCFA" />
        <Kpi label="Paiements échoués (mois)" value="7" />
      </div>

      <div className="rounded-2xl border border-black/10 bg-white/70 overflow-hidden">
        <div className="px-4 py-3 border-b border-black/10 font-semibold">Revenus (aperçu)</div>
        <div className="h-56 grid grid-cols-12 gap-2 items-end p-4 relative">
          {Array.from({length:12}).map((_,i)=>{
            const h = 15 + Math.round(Math.abs(Math.sin((i+1)*0.8))*75);
            return <div key={i} className="bg-[#4A9B8E] rounded-md" style={{height:`${h}%`}}/>;
          })}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            <div className="liquid-glass" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-black/10 overflow-hidden bg-white/70">
        <div className="px-4 py-3 border-b border-black/10 font-semibold">Historique des paiements</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left bg-black/[.02]">
              <tr>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Utilisateur</th>
                <th className="px-4 py-2">Description</th>
                <th className="px-4 py-2">Montant</th>
                <th className="px-4 py-2">Méthode</th>
                <th className="px-4 py-2">Statut</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map(r=> (
                <tr key={r.id} className="border-t border-black/5">
                  <td className="px-4 py-2 whitespace-nowrap">{r.date}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{r.user}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{r.label}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{r.amount.toLocaleString()} FCFA</td>
                  <td className="px-4 py-2 whitespace-nowrap">{r.method}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
