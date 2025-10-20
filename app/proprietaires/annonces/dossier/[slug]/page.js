"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import apiService from "../../../../services/api";

const CATEGORIES = ["tous","studio","appartement","bureau","maison","villa","chambre","loft","duplex"];

function IconBack({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

export default function DossierPage() {
  const params = useParams();
  const raw = params?.slug;
  const slug = (raw || "tous").toLowerCase();
  const label = slug === "tous" ? "Tous" : slug.charAt(0).toUpperCase() + slug.slice(1);

  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnnonces = async () => {
      try {
        const res = await apiService.getMyAnnonces();
        setAnnonces(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        setError("Erreur lors du chargement des annonces.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnnonces();
  }, []);

  const items = slug === "tous" ? annonces : annonces.filter(a => (a.type || "").toLowerCase() === slug);

  if (loading) return <div>Chargement des annonces...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/proprietaires/annonces" className="chip-glass px-3 py-1.5 inline-flex items-center gap-2"><IconBack /> Retour</Link>
          <h1 className="text-lg font-bold">Dossier — {label}</h1>
        </div>
        <Link href="/proprietaires/nouvelle" className="inline-flex items-center h-10 px-4 rounded-full bg-[#4A9B8E] text-white">Publier</Link>
      </div>

      <div className="rounded-2xl border border-black/10 bg-white/70 p-3">
        <div className="text-sm text-neutral-600">{items.length} éléments</div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((a, index) => (
          <div key={a._id || `item-${index}`} className="rounded-2xl border border-black/10 bg-white/70 p-4 space-y-2">
            <div className="flex items-start gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
              </svg>
              <div className="font-semibold flex-1">{a.titre}</div>
              <span className="text-xs chip-glass px-2 py-1">{a.type?.charAt(0).toUpperCase()+a.type?.slice(1)}</span>
            </div>
            {/* Statut dynamique selon la date d'expiration */}
            <div className="text-sm text-neutral-600">
              Statut: {(() => {
                const now = new Date();
                const expire = a.expiresAt ? new Date(a.expiresAt) : null;
                if (expire && expire < now) return 'inactif';
                return 'actif';
              })()}
            </div>
            <div className="text-sm text-neutral-600">
              Expire: {a.expiresAt ? new Date(a.expiresAt).toLocaleDateString() : '—'}
            </div>
            <div className="text-xs text-neutral-500">
              Durée de publication : {
                a.duree ? `${a.duree} jours` : (
                  a.expiresAt && a.createdAt ? `${Math.round((new Date(a.expiresAt)-new Date(a.createdAt))/(1000*60*60*24))} jours` : '—'
                )
              }
            </div>
            <div className="pt-2 flex items-center gap-2 text-sm">
              <button className="chip-glass px-3 py-1">Modifier</button>
              <button className="chip-glass px-3 py-1">Renouveler</button>
              <button className="chip-glass px-3 py-1">Supprimer</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
