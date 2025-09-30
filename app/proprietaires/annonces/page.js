"use client";
import { useMemo, useState, useEffect } from "react";
import ConfirmModal from "@/components/ConfirmModal";

function IconEdit({ className = "w-4 h-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
    </svg>
  );
}

function IconRefresh({ className = "w-4 h-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M21 12a9 9 0 1 1-3-6.7" />
      <path d="M21 3v6h-6" />
    </svg>
  );
}

function IconTrash({ className = "w-4 h-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

import apiService from "../../services/api";

function Badge({ status }) {
  const statusMap = {
    Actif: { text: 'Actif', className: 'bg-green-100 text-green-700 border-green-200' },
    Inactif: { text: 'Inactif', className: 'bg-red-100 text-red-700 border-red-200' },
    "En attente": { text: 'En attente', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  };
  const currentStatus = statusMap[status] || { text: status, className: 'bg-gray-100 text-gray-700 border-gray-200' };
  
  return <span className={`px-2 py-1 text-xs rounded-full border ${currentStatus.className}`}>
    {currentStatus.text}
  </span>;
}

export default function ProprietairesAnnonces() {
  // Types prédéfinis alignés avec la page de publication (hors "Autre")
  const PREDEFINED_TYPES = ["Appartement", "Maison", "Studio", "Chambre", "Villa"];
  
  // Options de tri disponibles
  const SORT_OPTIONS = [
    { value: 'date-desc', label: 'Plus récentes d\'abord' },
    { value: 'date-asc', label: 'Plus anciennes d\'abord' },
    { value: 'titre-asc', label: 'Titre (A-Z)' },
    { value: 'titre-desc', label: 'Titre (Z-A)' },
    { value: 'type-asc', label: 'Type (A-Z)' },
    { value: 'expiration-asc', label: 'Expiration (proche)' },
    { value: 'expiration-desc', label: 'Expiration (lointaine)' },
  ];
  
  // État pour le tri sélectionné
  const [sortBy, setSortBy] = useState('date-desc');
  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState("Tous");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [annonceToDelete, setAnnonceToDelete] = useState(null);

  useEffect(() => {
    const fetchAnnonces = async () => {
      try {
        const res = await apiService.getMyAnnonces();
        setAnnonces(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setError("Erreur lors du chargement des annonces.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnnonces();
  }, []);

  // Construire dynamiquement la liste des types (inclut ceux saisis via "Autre")
  const dynamicTypes = useMemo(() => {
    const set = new Set();
    for (const a of annonces) {
      if (a && typeof a.type === 'string' && a.type.trim()) set.add(a.type.trim());
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [annonces]);

  // Union: prédéfinis + dynamiques (sans doublons)
  const allTypes = useMemo(() => {
    const set = new Set(PREDEFINED_TYPES);
    for (const t of dynamicTypes) set.add(t);
    return Array.from(set);
  }, [dynamicTypes]);

  const grouped = useMemo(() => {
    const map = { Tous: annonces };
    for (const t of allTypes) {
      map[t] = annonces.filter((a) => (a.type || '').trim() === t);
    }
    return map;
  }, [annonces, allTypes]);

  // Dossiers affichés: Tous + tous les types (prédéfinis + saisis)
  const folders = useMemo(() => ["Tous", ...allTypes], [allTypes]);

  // Trier les éléments selon l'option sélectionnée
  const items = useMemo(() => {
    const itemsToSort = [...(grouped[selected] || [])];
    
    return itemsToSort.sort((a, b) => {
      const [field, order] = sortBy.split('-');
      const direction = order === 'asc' ? 1 : -1;
      
      switch (field) {
        case 'date':
          return direction * (new Date(b.createdAt) - new Date(a.createdAt));
        case 'titre':
          return direction * a.titre.localeCompare(b.titre);
        case 'type':
          return direction * (a.type || '').localeCompare(b.type || '');
        case 'expiration':
          const dateA = a.expiresAt ? new Date(a.expiresAt) : new Date(0);
          const dateB = b.expiresAt ? new Date(b.expiresAt) : new Date(0);
          return direction * (dateA - dateB);
        default:
          return 0;
      }
    });
  }, [grouped, selected, sortBy]);

  if (loading) return <div>Chargement des annonces...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">Mes annonces</h1>
        <a 
          href="/proprietaires/nouvelle" 
          className="inline-flex items-center h-10 px-6 rounded-full bg-[#10B981] hover:bg-[#059669] text-white font-medium transition-colors shadow-sm"
        >
          Publier
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4">
        {/* Sidebar dossiers */}
        <aside className="rounded-2xl border border-black/10 bg-white/70 p-3">
          <div className="text-sm font-semibold mb-2">Dossiers</div>
          <ul className="space-y-1">
            {folders.map((f) => (
              <li key={f}>
                <a
                  href={`/proprietaires/annonces/dossier/${encodeURIComponent(f.toLowerCase())}`}
                  className={`w-full flex items-center gap-2 px-2 py-2 rounded-xl text-sm hover:bg-black/[.04] ${selected===f? 'ring-1 ring-[#9BC1BC]':''}`}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden>
                    <path d="M3 7h6l2 2h10v6a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3z" />
                    <path d="M3 7v8a3 3 0 0 0 3 3h12" />
                  </svg>
                  <span>{f}</span>
                  <span className="ml-auto text-xs text-neutral-500">{grouped[f]?.length ?? 0}</span>
                </a>
              </li>
            ))}
          </ul>
        </aside>

        {/* Contenu: cartes d'annonces */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-neutral-600">{items.length} éléments dans « {selected} »</div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none chip-glass px-4 py-2 pr-8 text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#9BC1BC] focus:border-transparent"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((a) => (
              <div key={a._id || a.id || Math.random().toString(36).substr(2, 9)} className="rounded-2xl border border-black/10 bg-white/70 p-4 space-y-2">
                <div className="flex items-start gap-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6" />
                  </svg>
                  <div className="font-semibold flex-1">{a.titre}</div>
                  <span className="text-xs chip-glass px-2 py-1">{a.type}</span>
                </div>
                {/* Statut dynamique selon la date d'expiration */}
                <div className="text-sm">
                  Statut: <Badge status={(() => {
                    const now = new Date();
                    const expire = a.expiresAt ? new Date(a.expiresAt) : null;
                    if (expire && expire < now) return 'Inactif';
                    return 'Actif';
                  })()} />
                </div>
                <div className="text-xs text-neutral-500">
                  Durée de publication : {
                    a.duree ? `${a.duree} jours` : (
                      a.expiresAt && a.createdAt ? `${Math.round((new Date(a.expiresAt)-new Date(a.createdAt))/(1000*60*60*24))} jours` : '—'
                    )
                  }
                </div>
                <div className="pt-2 flex items-center gap-2 text-sm">
                  <button
                    className="inline-flex items-center gap-1 chip-glass px-3 py-1"
                    onClick={() => {
                      // Redirection vers la page de modification (à adapter selon ta structure)
                      window.location.href = `/proprietaires/nouvelle?id=${a._id}`;
                    }}
                  >
                    <span className="sr-only">Modifier</span><span>Modifier</span>
                  </button>
                  {/* Bouton Renouveler supprimé */}
                  <button
                    className="inline-flex items-center gap-1 chip-glass px-3 py-1"
                    onClick={() => { setAnnonceToDelete(a._id); setConfirmOpen(true); }}
                  >
                    <span className="sr-only">Supprimer</span><span>Supprimer</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="Supprimer l'annonce"
        description="Cette action est définitive. Voulez-vous supprimer cette annonce ?"
        confirmText="Supprimer"
        cancelText="Annuler"
        onCancel={() => { setConfirmOpen(false); setAnnonceToDelete(null); }}
        onConfirm={async () => {
          try {
            if (!annonceToDelete) return;
            await apiService.deleteAnnonce(annonceToDelete);
            setAnnonces(prev => prev.filter(ann => ann._id !== annonceToDelete));
          } catch (e) {
            // Optionnel: afficher une notification d'erreur
          } finally {
            setConfirmOpen(false);
            setAnnonceToDelete(null);
          }
        }}
      />
    </div>
  );
}
