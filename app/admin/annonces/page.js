"use client";
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import apiService from '@/services/api';
import Image from 'next/image';
import { getImageUrl } from '@/utils/imageUtils';

function StatusBadge({ status }) {
  const map = {
    active: "bg-green-100 text-green-700 border-green-200",
    expired: "bg-red-100 text-red-700 border-red-200",
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    draft: "bg-neutral-100 text-neutral-700 border-neutral-200",
  };
  return <span className={`px-2 py-1 text-xs rounded-full border ${map[status] || 'bg-neutral-100 text-neutral-700 border-neutral-200'}`}>{status}</span>;
}

export default function AdminAds() {
  const params = useSearchParams();
  const initialOwner = params.get('proprietaire') || '';
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [owner, setOwner] = useState(initialOwner);
  const [total, setTotal] = useState(0);
  const [mpOpen, setMpOpen] = useState(false);
  const [mpAnnonce, setMpAnnonce] = useState(null);
  const [mpModelId, setMpModelId] = useState('');
  const [mpShareUrl, setMpShareUrl] = useState('');

  const fetchAds = async (query = q, st = status, own = owner) => {
    try {
      setLoading(true);
      const sp = new URLSearchParams();
      if (query) sp.set('q', query);
      if (st && st !== 'all') sp.set('status', st);
      if (own) sp.set('proprietaire', own);
      const res = await apiService.get(`/api/annonces/admin?${sp.toString()}`);
      const data = res?.data || res;
      const nextItems = Array.isArray(data.items) ? data.items : data.items || [];
      setItems(nextItems);
      setTotal(Number(data.total || nextItems.length || 0));
    } catch (e) {
      setError(e?.message || 'Erreur lors du chargement des annonces');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAds(); }, []);
  useEffect(() => {
    // si l'URL contient proprietaire au chargement
    if (initialOwner) fetchAds(q, status, initialOwner);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialOwner]);

  const list = useMemo(() => items, [items]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Annonces</h1>
        <div className="flex items-center gap-2 text-sm">
          <input
            value={q}
            onChange={(e)=>setQ(e.target.value)}
            onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); fetchAds(); } }}
            placeholder="Rechercher (titre, ville, quartier, description)"
            className="h-9 px-3 rounded-xl border border-black/10 bg-white/80 outline-none"
          />
          <select value={status} onChange={(e)=>{ setStatus(e.target.value); fetchAds(q, e.target.value, owner); }} className="h-9 px-3 rounded-xl border border-black/10 bg-white/80">
            <option value="all">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="expired">Expiré</option>
            <option value="pending">En attente</option>
            <option value="draft">Brouillon</option>
          </select>
          <div className="text-xs text-neutral-500">Total: {total}</div>
        </div>
      </div>

      <div className="rounded-2xl border border-black/10 overflow-hidden bg-white/70">
        <div className="overflow-x-auto">
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-50 border-b border-red-200">{error}</div>
          )}
          {loading ? (
            <div className="p-6 text-sm text-neutral-600">Chargement…</div>
          ) : (
          <table className="w-full text-sm">
            <thead className="text-left bg-black/[.02]">
              <tr>
                <th className="px-4 py-2">Annonce</th>
                <th className="px-4 py-2">Propriétaire</th>
                <th className="px-4 py-2">Statut</th>
                <th className="px-4 py-2">Publiée</th>
                <th className="px-4 py-2">Expire</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map(a => (
                <tr key={a._id} className="border-t border-black/5">
                  <td className="px-4 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-10 rounded-md bg-neutral-300/60 overflow-hidden">
                        {a.photos?.[0] ? (
                          <Image src={getImageUrl(a.photos[0]) || '/client.jpg'} alt="Photo de l'annonce" width={64} height={40} className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = '/client.jpg'; }} />
                        ) : (
                          <div className="w-full h-full bg-neutral-200 flex items-center justify-center">
                            <span className="text-xs text-neutral-500">Aucune photo</span>
                          </div>
                        )}
                      </div>
                      <div className="truncate max-w-[320px] flex items-center gap-2">
                        <span className="truncate">{a.titre}</span>
                        {a.matterportStatus === 'ready' && (
                          <span className="px-2 py-0.5 text-[11px] rounded-full border border-green-200 bg-green-50 text-green-700 whitespace-nowrap">3D prête</span>
                        )}
                        {a.matterportStatus === 'pending' && (
                          <span className="px-2 py-0.5 text-[11px] rounded-full border border-amber-200 bg-amber-50 text-amber-700 whitespace-nowrap">3D en cours</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">{a.proprietaireId?.nom || '—'}</td>
                  <td className="px-4 py-2 whitespace-nowrap"><StatusBadge status={a.status} /></td>
                  <td className="px-4 py-2 whitespace-nowrap">{a.createdAt ? new Date(a.createdAt).toLocaleDateString('fr-FR') : '—'}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{a.expiresAt ? new Date(a.expiresAt).toLocaleDateString('fr-FR') : '—'}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setMpAnnonce(a);
                          setMpModelId(a.matterportModelId || '');
                          setMpShareUrl(a.matterportShareUrl || '');
                          setMpOpen(true);
                        }}
                        className="chip-glass px-3 py-1"
                      >
                        Ajouter visite 3D
                      </button>
                      <button className="chip-glass px-3 py-1">🗑️ Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      </div>

      {/* Modale d'ajout de visite 3D */}
      {mpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-black/10 font-semibold">Ajouter une visite 3D</div>
            <div className="p-5 space-y-3">
              <div className="text-sm text-neutral-600">Renseignez l'identifiant Matterport (m) ou collez une URL de partage.</div>
              <div className="space-y-2">
                <label className="text-xs text-neutral-600">Model ID (m)</label>
                <input
                  value={mpModelId}
                  onChange={(e)=>setMpModelId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-black/10 bg-white/80 outline-none focus:ring-2 focus:ring-[#4A9B8E]"
                  placeholder="Ex: XyZ123AbC"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-neutral-600">Share URL</label>
                <input
                  value={mpShareUrl}
                  onChange={(e)=>setMpShareUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-black/10 bg-white/80 outline-none focus:ring-2 focus:ring-[#4A9B8E]"
                  placeholder="https://my.matterport.com/show/?m=..."
                />
              </div>
            </div>
            <div className="px-5 py-4 border-t border-black/10 flex items-center justify-end gap-2 bg-neutral-50">
              <button onClick={()=>setMpOpen(false)} className="chip-glass px-4 py-2">Annuler</button>
              <button
                onClick={async ()=>{
                  try {
                    if (!mpModelId && !mpShareUrl) {
                      alert('Fournissez un Model ID ou une URL de partage');
                      return;
                    }
                    await apiService.adminAttachMatterport(mpAnnonce._id, { matterportModelId: mpModelId || undefined, matterportShareUrl: mpShareUrl || undefined });
                    setMpOpen(false);
                    setMpAnnonce(null);
                    setMpModelId('');
                    setMpShareUrl('');
                    await fetchAds();
                    alert('Visite 3D associée');
                  } catch(e) {
                    alert(e?.message || 'Erreur lors de l\'association de la visite 3D');
                  }
                }}
                className="px-4 py-2 rounded-xl bg-[#4A9B8E] hover:bg-[#3B8276] text-white"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
