"use client";
import { useEffect, useState } from "react";
import apiService from "@/services/api";
import ConfirmModal from "@/components/ConfirmModal";
import Notification from "@/components/Notification";

const TABS = ["Tarifs", "Modifier mot de passe"];

function TabButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`chip-glass px-3 py-1.5 text-sm ${active ? 'ring-1 ring-[#4A9B8E]' : ''}`}
    >
      {label}
    </button>
  );
}

export default function AdminParametres() {
  const [tab, setTab] = useState(1);  // Change from 0 to 1 to default to 'Modifier mot de passe'
  const [accent, setAccent] = useState("#4A9B8E");

  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({ name: '', durationDays: '', priceFcfa: '' });
  const [editing, setEditing] = useState(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalMessage, setConfirmModalMessage] = useState('');
  const [confirmModalTitle, setConfirmModalTitle] = useState('');
  const [confirmModalOnConfirm, setConfirmModalOnConfirm] = useState(null);

  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success'); // 'info', 'success', 'warning', 'error'

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // For confirmation
  const handlePasswordChange = async () => {
    if (!oldPassword || !newPassword || newPassword !== confirmPassword) {
      setNotificationMessage('Veuillez vérifier les champs (nouveau mot de passe doit correspondre à la confirmation)');
      setNotificationType('error');
      return;
    }
    try {
      await apiService.updatePassword({ oldPassword, newPassword });
      setNotificationMessage('Mot de passe mis à jour avec succès');
      setNotificationType('success');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e) {
      setNotificationMessage(e?.message || 'Erreur lors de la modification du mot de passe');
      setNotificationType('error');
    }
  };

  const loadPacks = async () => {
    try {
      setLoading(true);
      const res = await apiService.getTarifs();
      const items = res?.data?.items || res?.items || [];
      setPacks(items);
      setError('');
    } catch (e) {
      setError(e?.message || 'Erreur lors du chargement des tarifs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTab(0);  // Reset to Tarifs on mount
  }, []);

  useEffect(() => {
    if (tab === 1) loadPacks();
  }, [tab]);

  const onSubmit = async () => {
    try {
      setLoading(true);
      const payload = {
        name: form.name.trim(),
        durationDays: Number(form.durationDays),
        priceFcfa: Number(form.priceFcfa)
      };
      if (!payload.name || !payload.durationDays || payload.durationDays < 1) {
        setNotificationMessage('Renseignez un nom et une durée valide');
        setNotificationType('error');
        return;
      }
      if (editing) {
        await apiService.updateTarif(editing._id, payload);
      } else {
        await apiService.createTarif(payload);
      }
      setForm({ name: '', durationDays: '', priceFcfa: '' });
      setEditing(null);
      await loadPacks();
    } catch (e) {
      setNotificationMessage(e?.message || 'Erreur lors de l\'enregistrement');
      setNotificationType('error');
    } finally {
      setLoading(false);
    }
  };

  const onEdit = (pack) => {
    setEditing(pack);
    setForm({ name: pack.name || '', durationDays: String(pack.durationDays || ''), priceFcfa: String(pack.priceFcfa || '') });
  };

  const onDelete = async (pack) => {
    setConfirmModalMessage(`Supprimer le pack "${pack.name}" ?`);
    setConfirmModalTitle('Confirmation de suppression');
    setConfirmModalOnConfirm(() => async () => {
      try {
        setLoading(true);
        await apiService.deleteTarif(pack._id);
        await loadPacks();
      } catch (e) {
        setNotificationMessage(e?.message || 'Erreur lors de la suppression');
        setNotificationType('error');
      } finally {
        setLoading(false);
      }
    });
    setShowConfirmModal(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Paramètres</h1>
        <div className="flex gap-2 flex-wrap">
          {TABS.map((t, i) => (
            <TabButton key={t} label={t} active={tab === i} onClick={() => setTab(i)} />
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-black/10 bg-white/70 p-4 space-y-4">
        {tab === 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Tarifs & Packs</h2>
              <div className="text-sm text-neutral-500">{loading ? 'Chargement…' : (error ? <span className="text-red-700">{error}</span> : `${packs.length} pack${packs.length>1?'s':''}`)}</div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {packs.map((p)=> (
                <div key={p._id} className="rounded-xl border border-black/10 p-4 bg-white/70">
                  <div className="text-sm">{p.name}</div>
                  <div className="text-xl font-bold">{p.durationDays} jours</div>
                  <div className="text-sm text-neutral-600">{(p.priceFcfa||0).toLocaleString('fr-FR')} FCFA</div>
                  <div className="mt-3 flex gap-2">
                    <button onClick={()=>onEdit(p)} className="chip-glass px-3 py-1">Modifier</button>
                    <button onClick={()=>onDelete(p)} className="chip-glass px-3 py-1">Supprimer</button>
                  </div>
                </div>
              ))}
              {packs.length === 0 && !loading && !error && (
                <div className="text-sm text-neutral-600">Aucun pack défini pour le moment.</div>
              )}
            </div>

            <div className="rounded-xl border border-black/10 p-4 bg-white/70">
              <div className="font-semibold mb-2">{editing ? 'Modifier le pack' : 'Ajouter un pack'}</div>
              <div className="grid gap-2 md:grid-cols-4">
                <input value={form.name} onChange={(e)=>setForm(f=>({...f,name:e.target.value}))} placeholder="Nom" className="h-10 px-3 rounded-lg border border-black/10 bg-white/90 outline-none" />
                <input value={form.durationDays} onChange={(e)=>setForm(f=>({...f,durationDays:e.target.value}))} placeholder="Durée (jours)" type="number" className="h-10 px-3 rounded-lg border border-black/10 bg-white/90 outline-none" />
                <input value={form.priceFcfa} onChange={(e)=>setForm(f=>({...f,priceFcfa:e.target.value}))} placeholder="Prix (FCFA)" type="number" className="h-10 px-3 rounded-lg border border-black/10 bg-white/90 outline-none" />
                <div className="flex items-center gap-2">
                  <button disabled={loading} onClick={onSubmit} className="chip-glass px-3 py-1.5">{editing? 'Enregistrer' : 'Ajouter'}</button>
                  {editing && <button disabled={loading} onClick={()=>{ setEditing(null); setForm({ name:'', durationDays:'', priceFcfa:'' }); }} className="chip-glass px-3 py-1.5">Annuler</button>}
                </div>
              </div>
            </div>
          </section>
        )}
        {tab === 1 && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Modifier mot de passe</h2>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ancien mot de passe</label>
              <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="h-10 px-3 rounded-lg border border-black/10 bg-white/90 outline-none w-full" />
              <label className="text-sm font-medium">Nouveau mot de passe</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="h-10 px-3 rounded-lg border border-black/10 bg-white/90 outline-none w-full" />
              <label className="text-sm font-medium">Confirmer nouveau mot de passe</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="h-10 px-3 rounded-lg border border-black/10 bg-white/90 outline-none w-full" />
              <button onClick={handlePasswordChange} className="chip-glass px-3 py-1.5">Enregistrer</button>
            </div>
          </section>
        )}


      </div>
      <ConfirmModal
        open={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmModalOnConfirm}
        title={confirmModalTitle}
        description={confirmModalMessage}
      />
      <Notification
        message={notificationMessage}
        type={notificationType}
        onClose={() => setNotificationMessage('')}
      />
    </div>
  );
}
