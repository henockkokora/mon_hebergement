"use client";
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiService from '@/services/api';
import Notification from '@/components/Notification';

function Status({ s }){
  const label = s === 'new' ? 'Nouveau' : s === 'in_progress' ? 'En cours' : 'Résolu';
  const map = { new: 'bg-amber-100 text-amber-700 border-amber-200', in_progress: 'bg-blue-100 text-blue-700 border-blue-200', resolved: 'bg-green-100 text-green-700 border-green-200' };
  return <span className={`px-2 py-1 text-xs rounded-full border ${map[s]}`}>{label}</span>;
}

export default function AdminSignalements(){
  // ...
  // Ajoute la fonction pour annuler la résolution d'un signalement
  const onUnresolve = async (rep) => {
    setConfirmMessage('Annuler la résolution de ce signalement ?');
    setConfirmAction(() => async () => {
      try {
        await apiService.setReportInProgress(rep._id);
        setNotification({ message: 'Signalement remis en cours.', type: 'success' });
        setShowNotif(true);
        await fetchReports();
      } catch (e) {
        setNotification({ message: e?.message || 'Erreur lors de la remise en cours', type: 'error' });
        setShowNotif(true);
      }
      setConfirmAction(null);
      setConfirmMessage('');
      setConfirmTarget(null);
    });
    setConfirmTarget(rep);
  };

  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('all');
  const [total, setTotal] = useState(0);
  const [notification, setNotification] = useState({ message: '', type: 'success' });
  const [showNotif, setShowNotif] = useState(false);

  // Masque automatiquement la notification après 3s
  useEffect(() => {
    if (showNotif) {
      const timer = setTimeout(() => setShowNotif(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showNotif]);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmTarget, setConfirmTarget] = useState(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await apiService.getReports({ status });
      const data = res?.data || res;
      const next = data?.items || data?.data?.items || [];
      setItems(next);
      setTotal(Number(data?.total || data?.data?.total || next.length || 0));
    } catch (e) {
      setError(e?.message || 'Erreur lors du chargement des signalements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, [status]);

  const onVerify = async (rep) => {
    try {
      await apiService.setReportInProgress(rep._id);
      const annonceId = rep.annonceId?._id || rep.annonceId;
      if (annonceId) router.push(`/clients/annonce/${annonceId}`);
      setNotification({ message: 'Signalement mis en vérification.', type: 'success' });
      setShowNotif(true);
      await fetchReports();
    } catch (e) {
      setNotification({ message: e?.message || 'Erreur lors de la vérification', type: 'error' });
      setShowNotif(true);
    }
  };

  const onResolve = async (rep) => {
    setConfirmMessage('Marquer ce signalement comme résolu ?');
    setConfirmAction(() => async () => {
      try {
        await apiService.resolveReport(rep._id);
        setNotification({ message: 'Signalement marqué comme résolu.', type: 'success' });
        setShowNotif(true);
        await fetchReports();
      } catch (e) {
        setNotification({ message: e?.message || 'Erreur lors de la résolution', type: 'error' });
        setShowNotif(true);
      }
      setConfirmAction(null);
      setConfirmMessage('');
      setConfirmTarget(null);
    });
    setConfirmTarget(rep);
  };

  const onResolveDelete = async (rep) => {
    setConfirmMessage("Supprimer l'annonce et marquer le signalement comme résolu ? Cette action est irréversible.");
    setConfirmAction(() => async () => {
      try {
        await apiService.resolveDeleteReport(rep._id);
        setNotification({ message: "Annonce supprimée et signalement résolu.", type: 'success' });
        setShowNotif(true);
        await fetchReports();
      } catch (e) {
        setNotification({ message: e?.message || 'Erreur lors de la suppression', type: 'error' });
        setShowNotif(true);
      }
      setConfirmAction(null);
      setConfirmMessage('');
      setConfirmTarget(null);
    });
    setConfirmTarget(rep);
  };

  const handleConfirm = async () => {
    if (confirmAction) await confirmAction();
  };

  const handleCancel = () => {
    setConfirmAction(null);
    setConfirmMessage('');
    setConfirmTarget(null);
  };


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Signalements</h1>
        <div className="flex items-center gap-2 text-sm">
          <select value={status} onChange={(e)=>setStatus(e.target.value)} className="h-9 px-3 rounded-xl border border-black/10 bg-white/80">
            <option value="all">Tous</option>
            <option value="in_progress">En cours</option>
            <option value="resolved">Résolu</option>
          </select>
          <div className="text-xs text-neutral-500">Total: {total}</div>
        </div>
      </div>

      <div className="rounded-2xl border border-black/10 overflow-hidden bg-white/70">
        <div className="overflow-x-auto">
          {error && (<div className="p-3 text-sm text-red-700 bg-red-50 border-b border-red-200">{error}</div>)}
          {loading ? (
            <div className="p-6 text-sm text-neutral-600">Chargement…</div>
          ) : (
          <table className="w-full text-sm">
            <thead className="text-left bg-black/[.02]">
              <tr>
                <th className="px-4 py-2">Signalé</th>
                <th className="px-4 py-2">Motif</th>
                <th className="px-4 py-2">Signalé par</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Statut</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(r => (
                <tr key={r._id} className="border-t border-black/5">
                  <td className="px-4 py-2 whitespace-nowrap">
                    {r.userId?.nom ? (
                      <span className="font-semibold text-blue-700">{r.userId.nom} <span className="text-xs text-neutral-500">(Profil)</span></span>
                    ) : (r.annonceId?.titre ? (
                      <span className="font-semibold">{r.annonceId.titre} <span className="text-xs text-neutral-500">(Annonce)</span></span>
                    ) : '—')}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap max-w-[360px] truncate" title={r.reason}>{r.reason}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
  {r.reporterId?.nom
    ? r.reporterId.nom
    : (r.reporterId?.email || r.reporterId?._id || '—')}
</td>
                  <td className="px-4 py-2 whitespace-nowrap">{r.createdAt ? new Date(r.createdAt).toLocaleDateString('fr-FR') : '—'}</td>
                  <td className="px-4 py-2 whitespace-nowrap"><Status s={r.status} /></td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button onClick={()=>onVerify(r)} className="chip-glass px-3 py-1">Voir l'annonce</button>
                      {r.status === 'resolved' ? (
                        <button onClick={()=>onUnresolve(r)} className="chip-glass px-3 py-1">Annuler résolution</button>
                      ) : (
                        <button onClick={()=>onResolve(r)} className="chip-glass px-3 py-1">Marquer vérifiée</button>
                      )}
                      <button onClick={()=>onResolveDelete(r)} className="chip-glass px-3 py-1">Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      </div>
      {/* Notification moderne */}
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={() => setShowNotif(false)}
        duration={3000}
        visible={showNotif}
      />

      {/* Modale de confirmation moderne */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6">
            <div className="font-semibold text-lg mb-2">Confirmation</div>
            <div className="text-neutral-700 mb-4">{confirmMessage}</div>
            <div className="flex justify-end gap-2">
              <button onClick={handleCancel} className="chip-glass px-4 py-2">Annuler</button>
              <button onClick={handleConfirm} className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white">Confirmer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
