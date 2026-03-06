// src/pages/estudiante/EstudianteDashboard.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { EstudianteSidebar } from '../../components/estudiante/EstudianteSidebar';
import { CambiarPasswordModal } from '../../components/ui/CambiarPasswordModal';
import { HistorialModal } from '../../components/estudiante/modals/HistorialModal';
import { MateriasTab }    from './tabs/MateriasTab';
import { ActividadesTab } from './tabs/ActividadesTab';
import { MaterialTab }    from './tabs/MaterialTab';
import { CalendarioTab }  from './tabs/CalendarioTab';

const GRADO_LABEL = g => g ? `${g}° Grado` : '';

const TABS = [
  { id: 'materias',    label: 'Mis Materias' },
  { id: 'actividades', label: 'Actividades'  },
  { id: 'material',    label: 'Material'     },
  { id: 'calendario',  label: 'Calendario'   },
];

const HamburgerIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
  </svg>
);

const EstudianteDashboard = () => {
  const { user, logout } = useAuth();

  const [activeTab,      setActiveTab]      = useState('materias');
  const [materias,       setMaterias]       = useState([]);
  const [materiaActiva,  setMateriaActiva]  = useState(null);
  const [actividades,    setActividades]    = useState([]);
  const [materiales,     setMateriales]     = useState([]);
  const [eventos,        setEventos]        = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [loadingTab,     setLoadingTab]     = useState(false);
  const [error,          setError]          = useState('');
  const [sidebarOpen,    setSidebarOpen]    = useState(false);
  const [passwordModal,  setPasswordModal]  = useState(false);
  const [historialModal, setHistorialModal] = useState(null);

  useEffect(() => { fetchMaterias(); }, []);

  useEffect(() => {
    if (materiaActiva) fetchTabData(activeTab, materiaActiva.id);
  }, [activeTab, materiaActiva]);

  const fetchMaterias = async () => {
    setLoading(true); setError('');
    try {
      const res = await api.get('/estudiante/mis-materias');
      const data = res.data.data || [];
      setMaterias(data);
      if (data.length > 0) setMateriaActiva(data[0]);
    } catch {
      setError('No se pudieron cargar las materias.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTabData = async (tab, grupoId) => {
    if (!grupoId) return;
    setLoadingTab(true);
    try {
      if (tab === 'actividades') {
        const res = await api.get(`/estudiante/grupos/${grupoId}/actividades`);
        setActividades(res.data.data || []);
      } else if (tab === 'material') {
        const res = await api.get(`/estudiante/grupos/${grupoId}/materiales`);
        setMateriales(res.data.data || []);
      } else if (tab === 'calendario') {
        const res = await api.get(`/estudiante/grupos/${grupoId}/eventos`);
        setEventos(res.data.data || []);
      }
    } catch { /* silently fail */ }
    finally { setLoadingTab(false); }
  };

  const handleTabChange     = tab => { setActiveTab(tab); setSidebarOpen(false); };
  const handleMateriaSelect = mat => { setMateriaActiva(mat); if (activeTab !== 'materias') fetchTabData(activeTab, mat.id); };
  const handleLogout        = ()  => { logout(); window.location.href = '/login'; };

  const initials   = `${user?.nombre?.[0] || ''}${user?.apellidos?.[0] || ''}`.toUpperCase();
  const activeLabel = TABS.find(t => t.id === activeTab)?.label;

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex">

      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-60 bg-[#3D52A0] shrink-0 h-screen sticky top-0">
        <EstudianteSidebar
          activeTab={activeTab} onTabChange={handleTabChange}
          materias={materias} materiaActiva={materiaActiva} onMateriaSelect={handleMateriaSelect}
          onPasswordModal={() => setPasswordModal(true)} onLogout={handleLogout}/>
      </aside>

      {/* Sidebar mobile */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/30" onClick={() => setSidebarOpen(false)}/>
          <aside className="relative flex flex-col w-64 bg-[#3D52A0] h-full shadow-xl z-50">
            <EstudianteSidebar
              activeTab={activeTab} onTabChange={handleTabChange}
              materias={materias} materiaActiva={materiaActiva} onMateriaSelect={handleMateriaSelect}
              onPasswordModal={() => { setPasswordModal(true); setSidebarOpen(false); }} onLogout={handleLogout}/>
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-screen">

        {/* Mobile header */}
        <header className="lg:hidden bg-white border-b border-slate-200 px-4 h-14 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600">
            <HamburgerIcon/>
          </button>
          <p className="text-sm font-bold text-[#3D52A0]">{activeLabel}</p>
          <div className="w-9 h-9 rounded-full bg-[#3D52A0] flex items-center justify-center text-white text-xs font-bold">
            {initials}
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 py-6">

          {/* Banner */}
          <div className="bg-gradient-to-r from-[#3D52A0] via-[#6366f1] to-[#8b5cf6] rounded-xl p-5 mb-6 text-white relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/15 rounded-full"/>
            <div className="absolute -bottom-8 right-16 w-24 h-24 bg-white/15 rounded-full"/>
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold shrink-0">
                {initials}
              </div>
              <div>
                <h1 className="text-xl font-bold">Hola, {user?.nombre}!</h1>
                <p className="text-white/70 text-sm">
                  {GRADO_LABEL(user?.grado)}{materiaActiva ? ` · ${materiaActiva.materia}` : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Contenido */}
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-[#3D52A0] border-t-transparent rounded-full animate-spin"/>
            </div>
          ) : error ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <p className="text-slate-400 text-sm mb-3">{error}</p>
              <button onClick={fetchMaterias} className="text-sm text-[#3D52A0] hover:underline">Reintentar</button>
            </div>
          ) : materias.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <p className="text-slate-400 text-sm">No estás inscrito en ningún grupo aún.</p>
            </div>
          ) : (
            <>
              {activeTab === 'materias'    && <MateriasTab    materias={materias} materiaActiva={materiaActiva} onSelect={handleMateriaSelect} onVerHistorial={setHistorialModal}/>}
              {activeTab === 'actividades' && <ActividadesTab actividades={actividades} loading={loadingTab} materiaActiva={materiaActiva}/>}
              {activeTab === 'material'    && <MaterialTab    materiales={materiales}   loading={loadingTab} materiaActiva={materiaActiva}/>}
              {activeTab === 'calendario'  && <CalendarioTab  eventos={eventos}         loading={loadingTab} materiaActiva={materiaActiva}/>}
            </>
          )}
        </main>
      </div>

      <CambiarPasswordModal isOpen={passwordModal} onClose={() => setPasswordModal(false)}/>
      <HistorialModal materia={historialModal} onClose={() => setHistorialModal(null)}/>
    </div>
  );
};

export default EstudianteDashboard;