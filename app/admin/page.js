"use client";
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import apiService from "@/services/api";

function Kpi({ label, value, hint }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/30 shadow-lg p-5 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:bg-white/90">
      <div className="text-3xl font-bold text-gray-800 mb-1">{value}</div>
      <div className="text-sm font-medium text-gray-600">{label}</div>
      {hint && <div className="mt-2 text-xs text-gray-500 font-light">{hint}</div>}
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [range, setRange] = useState("7d");
  const [totalUsers, setTotalUsers] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [errorUsers, setErrorUsers] = useState(null);
  const [activeAnnonces, setActiveAnnonces] = useState(null);
  const [activeLoading, setActiveLoading] = useState(true);
  const [activeError, setActiveError] = useState(null);
  const [views, setViews] = useState(null);
  const [viewsLoading, setViewsLoading] = useState(true);
  const [viewsError, setViewsError] = useState(null);
  const [reportsNew, setReportsNew] = useState(0);
  const [reportsNewLoading, setReportsNewLoading] = useState(true);
  const [reportsNewError, setReportsNewError] = useState(null);
  const [newUsers, setNewUsers] = useState(0);
  const [newUsersLoading, setNewUsersLoading] = useState(true);
  const [newUsersError, setNewUsersError] = useState(null);
  const [series, setSeries] = useState([]);
  const [seriesLoading, setSeriesLoading] = useState(true);
  const [seriesError, setSeriesError] = useState(null);
  const [logoutOpen, setLogoutOpen] = useState(false);

  // Garde d'authentification admin
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('admin_token');
        const userRaw = localStorage.getItem('admin_user');
        const user = userRaw ? JSON.parse(userRaw) : null;
        if (!token || !user || user.role !== 'admin') {
          router.replace('/admin/login');
        }
      }
    } catch (_) {
      router.replace('/admin/login');
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingUsers(true);
        const res = await apiService.get('/api/auth/users/count');
        const value = res?.total ?? res?.data?.total ?? 0;
        if (mounted) setTotalUsers(value);
      } catch (e) {
        if (mounted) setErrorUsers(e.message || 'Erreur chargement utilisateurs');
      } finally {
        if (mounted) setLoadingUsers(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setViewsLoading(true);
        const res = await apiService.getViewsStats(range);
        const v = res?.data?.total ?? res?.total ?? 0;
        if (mounted) setViews(v);
      } catch (e) {
        if (e?.status === 401 || e?.status === 403) {
          router.replace('/admin/login');
          return;
        }
        if (mounted) {
          setViews(0);
          setViewsError(e.message || 'Erreur chargement vues');
        }
      } finally {
        if (mounted) setViewsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [range]);

  // Charger le nombre de signalements en statut "Nouveau"
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setReportsNewLoading(true);
        const res = await apiService.getReports({ status: 'new', page: 1, limit: 1 });
        // L'API retourne { data: { items, total } }
        const total = res?.data?.total ?? res?.total ?? 0;
        if (mounted) setReportsNew(total);
      } catch (e) {
        if (mounted) setReportsNewError(e.message || 'Erreur chargement signalements');
      } finally {
        if (mounted) setReportsNewLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setActiveLoading(true);
        const res = await apiService.getActiveStats(range);
        const v = res?.data?.total ?? res?.total ?? 0;
        if (mounted) setActiveAnnonces(v);
      } catch (e) {
        if (e?.status === 401 || e?.status === 403) {
          router.replace('/admin/login');
          return;
        }
        if (mounted) {
          setActiveAnnonces(0);
          setActiveError(e.message || 'Erreur chargement annonces actives');
        }
      } finally {
        if (mounted) setActiveLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [range]);

  // Charger la série "Nouvelles annonces par jour" selon la période sélectionnée
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setSeriesLoading(true);
        setSeriesError(null);
        const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
        const res = await apiService.getNewAnnoncesPerDay(days);
        const items = res?.data?.items ?? res?.items ?? [];
        if (mounted) setSeries(items);
      } catch (e) {
        if (mounted) setSeriesError(e?.message || 'Erreur chargement série des annonces');
      } finally {
        if (mounted) setSeriesLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [range]);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Kpi 
          label="Utilisateurs (hors admin)" 
          value={loadingUsers ? '…' : (errorUsers ? '—' : (totalUsers ?? 0).toLocaleString('fr-FR'))} 
          hint="Clients et propriétaires uniquement" 
        />
        <Kpi 
          label={`Annonces actives (${range})`} 
          value={activeLoading ? '…' : ((activeAnnonces ?? 0).toLocaleString('fr-FR'))} 
          hint={range === '7d' ? 'Créées sur 7 jours' : range === '30d' ? 'Créées sur 30 jours' : 'Créées sur 90 jours'}
        />
        <Kpi label="Revenus (mois)" value="1 250 000 FCFA" />
      </div>

      <div className="rounded-2xl border border-black/10 bg-white/70 overflow-hidden">
        <div className="px-4 py-3 border-b border-black/10 font-semibold">Courbe des revenus</div>
        <div className="h-56 grid grid-cols-12 gap-2 items-end p-4 relative">
          {Array.from({length:12}).map((_,i)=>{
            const h = 20 + Math.round(Math.abs(Math.sin((i+1)*1.2))*70);
            return <div key={i} className="bg-[#4A9B8E] rounded-md" style={{height:`${h}%`}}/>;
          })}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            <div className="liquid-glass" />
          </div>
        </div>
      </div>

      {/* Modal de confirmation de déconnexion */}
      {logoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-black/10 font-semibold">Se déconnecter</div>
            <div className="p-5 space-y-3">
              <div className="text-sm text-neutral-700">
                Voulez-vous vraiment vous déconnecter de l'espace administrateur ?
              </div>
            </div>
            <div className="px-5 py-4 border-t border-black/10 flex items-center justify-end gap-2 bg-neutral-50">
              <button onClick={() => setLogoutOpen(false)} className="chip-glass px-4 py-2">Annuler</button>
              <button
                onClick={() => {
                  try { if (typeof window !== 'undefined') localStorage.removeItem('auth_token'); } catch(_) {}
                  setLogoutOpen(false);
                  router.push('/admin/login');
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
