"use client";
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiService from '@/services/api';

function Badge({ ok, label }) {
  return <span className={`px-2 py-1 text-xs rounded-full border ${ok? 'bg-green-100 text-green-700 border-green-200':'bg-amber-100 text-amber-700 border-amber-200'}`}>{label}</span>;
}

export default function AdminUsers() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('');
  const [total, setTotal] = useState(0);
  const [reasonOpen, setReasonOpen] = useState(false);
  const [reasonText, setReasonText] = useState('');
  const [targetUser, setTargetUser] = useState(null);

  const fetchUsers = async (q = '', r = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (r && r !== 'all') params.set('role', r);
      const res = await apiService.get(`/api/auth/users?${params.toString()}`);
      const data = res?.data || res;
      const nextItems = Array.isArray(data.items) ? data.items : data.items || [];
      setItems(nextItems);
      // Ne pas compter les admins dans le total (sauf si filtre role=admin est actif)
      const totalNonAdmins = nextItems.filter(u => u.role !== 'admin').length;
      setTotal(Number((role && role !== 'all') ? (role === 'admin' ? nextItems.length : totalNonAdmins) : totalNonAdmins));
    } catch (e) {
      setError(e?.message || 'Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  // Chargement initial
  useEffect(() => { fetchUsers(); }, []);

  // Debounce sur la recherche / filtre
  useEffect(() => {
    const t = setTimeout(() => {
      fetchUsers(query, role);
    }, 350);
    return () => clearTimeout(t);
  }, [query, role]);

  const filtered = useMemo(() => {
    // Si le filtre de rôle est explicitement 'admin', ne rien exclure
    // Sinon, exclure les admins de l'affichage par défaut
    return role === 'admin' ? items : items.filter(u => u.role !== 'admin');
  }, [items, role]);

  const openReasonModal = (user) => {
    setTargetUser(user);
    setReasonText(user.blockedReason || '');
    setReasonOpen(true);
  };

  const confirmBlock = async () => {
    if (!targetUser) return;
    try {
      await apiService.post(`/api/auth/users/${targetUser._id}/block`, { reason: reasonText });
      setReasonOpen(false);
      setTargetUser(null);
      setReasonText('');
      await fetchUsers(query, role);
    } catch (e) {
      alert(e?.message || 'Erreur lors du blocage');
    }
  };

  const onUnblock = async (user) => {
    try {
      await apiService.post(`/api/auth/users/${user._id}/unblock`);
      await fetchUsers(query, role);
    } catch (e) {
      alert(e?.message || 'Erreur lors du déblocage');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Utilisateurs</h1>
        <div className="flex items-center gap-2 text-sm">
          <div className="relative">
            <input
              value={query}
              onChange={(e)=>setQuery(e.target.value)}
              onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); fetchUsers(query, role); } }}
              placeholder="Rechercher (nom, email, téléphone)"
              className="h-9 pl-3 pr-8 rounded-xl border border-black/10 bg-white/80 outline-none"
            />
            {query && (
              <button
                aria-label="Effacer"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
                onClick={()=>setQuery('')}
              >×</button>
            )}
          </div>
          <select value={role} onChange={(e)=>setRole(e.target.value)} className="h-9 px-3 rounded-xl border border-black/10 bg-white/80">
            <option value="all">Tout</option>
            <option value="proprietaire">Propriétaires</option>
            <option value="client">Clients</option>
            <option value="admin">Admins</option>
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
                <th className="px-4 py-2">Nom</th>
                <th className="px-4 py-2">Téléphone</th>
                <th className="px-4 py-2">Rôle</th>
                <th className="px-4 py-2">Statut</th>
                <th className="px-4 py-2">Créé le</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u._id} className="border-t border-black/5">
                  <td className="px-4 py-2 whitespace-nowrap">{u.nom || '—'}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{u.telephone || '—'}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{u.role === 'proprietaire' ? 'Propriétaire' : u.role === 'client' ? 'Client' : 'Admin'}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {u.status === 'blocked' ? (
                      <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700 border border-red-200" title={u.blockedReason || ''}>Bloqué</span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700 border border-green-200">Actif</span>
                    )}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">{u.createdAt ? new Date(u.createdAt).toLocaleDateString('fr-FR') : '—'}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {u.status === 'blocked' ? (
                        <button onClick={() => onUnblock(u)} className="chip-glass px-3 py-1">Débloquer</button>
                      ) : (
                        <button onClick={() => openReasonModal(u)} className="chip-glass px-3 py-1">Bloquer</button>
                      )}
                      {u.role === 'proprietaire' && (
                        <button onClick={() => router.push(`/admin/annonces?proprietaire=${u._id}`)} className="chip-glass px-3 py-1">Annonces</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      </div>

      {/* Modal raison de blocage */}
      {reasonOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-black/10 font-semibold">Bloquer l'utilisateur</div>
            <div className="p-5 space-y-3">
              <div className="text-sm text-neutral-600">
                Saisissez la raison du blocage. Elle sera affichée à l'utilisateur lors d'une tentative de connexion.
              </div>
              <textarea
                value={reasonText}
                onChange={(e)=>setReasonText(e.target.value)}
                rows={4}
                maxLength={500}
                className="w-full px-3 py-2 rounded-xl border border-black/10 bg-white/80 outline-none focus:ring-2 focus:ring-[#4A9B8E]"
                placeholder="Ex: Activité suspecte, non-respect des règles..."
              />
              <div className="text-xs text-neutral-500 text-right">{reasonText.length}/500</div>
            </div>
            <div className="px-5 py-4 border-t border-black/10 flex items-center justify-end gap-2 bg-neutral-50">
              <button onClick={()=>{setReasonOpen(false); setTargetUser(null);}} className="chip-glass px-4 py-2">Annuler</button>
              <button onClick={confirmBlock} className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white">Confirmer le blocage</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
