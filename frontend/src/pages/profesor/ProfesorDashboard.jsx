// src/pages/profesor/ProfesorDashboard.jsx
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { GruposTab } from './GruposTab';
import { GrupoDashboard } from './GrupoDashboard';
import { CambiarPasswordModal } from '../../components/ui/CambiarPasswordModal';
import logoFundacion from '../../assets/logo-fundacion.png';

const LogoutIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
  </svg>
);
const BookIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
  </svg>
);
const BackIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
  </svg>
);
const KeyIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
  </svg>
);
const ChevronDown = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
  </svg>
);
const HamburgerIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
  </svg>
);

const Avatar = ({ nombre, apellidos }) => (
  <div className="w-9 h-9 rounded-full bg-[#3D52A0] flex items-center justify-center text-white text-sm font-bold shrink-0">
    {`${nombre?.[0] || ''}${apellidos?.[0] || ''}`.toUpperCase()}
  </div>
);

const TABS = [['grupos', 'Mis Grupos', BookIcon]];

const ProfesorDashboard = () => {
  const { user, logout } = useAuth();
  const dropdownRef = useRef(null);
  const menuRef     = useRef(null);

  const [activeTab,     setActiveTab]     = useState('grupos');
  const [grupos,        setGrupos]        = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [grupoActivo,   setGrupoActivo]   = useState(null);
  const [dropdownOpen,  setDropdownOpen]  = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  const [menuOpen,      setMenuOpen]      = useState(false);

  useEffect(() => { fetchGrupos(); }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const fetchGrupos = async () => {
    setLoading(true); setError('');
    try {
      const res = await api.get('/profesor/grupos');
      setGrupos(res.data.data || []);
    } catch {
      setError('No se pudieron cargar los grupos.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { logout(); window.location.href = '/login'; };

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col">

      <header className="bg-white border-b border-slate-200">
        <div className="w-full px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <img src={logoFundacion} alt="Logo" className="w-8 h-8 sm:w-9 sm:h-9 object-contain"/>
            <div className="hidden sm:block">
              <p className="text-[10px] text-slate-400 leading-none uppercase tracking-wide">Aula Joven</p>
              <p className="text-sm font-bold text-[#3D52A0]">Portal Profesor</p>
            </div>
          </div>

          {/* Centro: breadcrumb si hay grupo activo, o tab en mobile, o nav en desktop */}
          {grupoActivo ? (
            <div className="flex items-center gap-2 text-sm flex-1 min-w-0">
              <button onClick={() => setGrupoActivo(null)}
                className="flex items-center gap-1 text-slate-400 hover:text-[#3D52A0] transition-colors shrink-0">
                <BackIcon/><span className="hidden sm:inline">Mis Grupos</span>
              </button>
              <span className="text-slate-300">/</span>
              <span className="font-semibold text-slate-700 truncate">{grupoActivo.nombre}</span>
            </div>
          ) : (
            <>
              {/* Tabs — desktop */}
              <nav className="hidden sm:flex items-center gap-1 bg-slate-100 rounded-full p-1 flex-1 max-w-xs mx-auto">
                {TABS.map(([id, label, Icon]) => (
                  <button key={id} onClick={() => setActiveTab(id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all
                      ${activeTab === id ? 'bg-[#3D52A0] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                    <Icon/><span>{label}</span>
                  </button>
                ))}
              </nav>
              {/* Tab activo — mobile */}
              <span className="sm:hidden text-sm font-semibold text-[#3D52A0] flex-1 text-center">
                {TABS.find(([id]) => id === activeTab)?.[1]}
              </span>
            </>
          )}

          {/* Derecha */}
          <div className="flex items-center gap-2 shrink-0">

            {/* Usuario dropdown — desktop */}
            <div className="relative hidden md:block" ref={dropdownRef}>
              <button onClick={() => setDropdownOpen(p => !p)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                <Avatar nombre={user?.nombre} apellidos={user?.apellidos}/>
                <div className="leading-tight text-left">
                  <p className="text-xs font-semibold text-slate-700">{user?.nombre} {user?.apellidos}</p>
                  <p className="text-[10px] text-slate-400">Profesor</p>
                </div>
                <ChevronDown/>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-700 truncate">{user?.nombre} {user?.apellidos}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                  </div>
                  <button onClick={() => { setDropdownOpen(false); setPasswordModal(true); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                    <KeyIcon/> Cambiar contraseña
                  </button>
                  <div className="border-t border-slate-100"/>
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                    <LogoutIcon/> Cerrar sesion
                  </button>
                </div>
              )}
            </div>

            {/* Hamburguesa — mobile */}
            <div className="relative md:hidden" ref={menuRef}>
              <button onClick={() => setMenuOpen(p => !p)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors">
                <HamburgerIcon/>
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-700 truncate">{user?.nombre} {user?.apellidos}</p>
                    <p className="text-[11px] text-slate-400">Profesor</p>
                  </div>
                  {!grupoActivo && (
                    <div className="py-1">
                      <p className="px-4 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Navegacion</p>
                      {TABS.map(([id, label]) => (
                        <button key={id} onClick={() => { setActiveTab(id); setMenuOpen(false); }}
                          className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors
                            ${activeTab === id ? 'text-[#3D52A0] bg-[#EEF2FF]' : 'text-slate-600 hover:bg-slate-50'}`}>
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                  {grupoActivo && (
                    <button onClick={() => { setGrupoActivo(null); setMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50">
                      <BackIcon/> Volver a Mis Grupos
                    </button>
                  )}
                  <div className="border-t border-slate-100 py-1">
                    <button onClick={() => { setMenuOpen(false); setPasswordModal(true); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                      <KeyIcon/> Cambiar contraseña
                    </button>
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                      <LogoutIcon/> Cerrar sesion
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
        <div className="h-0.5 bg-[#3D52A0]"/>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        {grupoActivo ? (
          <GrupoDashboard grupo={grupoActivo}/>
        ) : (
          activeTab === 'grupos' && (
            <GruposTab
              grupos={grupos} loading={loading} error={error}
              onRetry={fetchGrupos} onVerGrupo={setGrupoActivo}
            />
          )
        )}
      </main>

      <CambiarPasswordModal isOpen={passwordModal} onClose={() => setPasswordModal(false)}/>
    </div>
  );
};

export default ProfesorDashboard;