// src/pages/admin/AdminDashboard.jsx
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { LogoutIcon } from "../../components/ui/Icons";
import { CambiarPasswordModal } from "../../components/ui/CambiarPasswordModal";
import { ProfesoresTab } from "./ProfesoresTab";
import { EstudiantesTab } from "./EstudiantesTab";
import { GruposTab } from "./GruposTab";
import { CalendarioTab } from "./CalendarioTab";
import logoFundacion from "../../assets/logo-fundacion.png";

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

const TABS = [
  ["profesores", "Profesores"],
  ["estudiantes", "Estudiantes"],
  ["grupos", "Grupos"],
  ["calendario", "Calendario"],
];

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const dropdownRef = useRef(null);
  const menuRef     = useRef(null);

  const [activeTab,   setActiveTab]   = useState("profesores");
  const [profesores,  setProfesores]  = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [grupos,      setGrupos]      = useState([]);
  const [eventos,     setEventos]     = useState([]);
  const [loading,     setLoading]     = useState(true);

  const [dropdownOpen,  setDropdownOpen]  = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  const [menuOpen,      setMenuOpen]      = useState(false);

  const [userModal,    setUserModal]   = useState(false);
  const [editingUser,  setEditingUser] = useState(null);
  const [delUser,      setDelUser]     = useState({ open: false, user: null, loading: false });

  const [grupoModal,   setGrupoModal]   = useState(false);
  const [editingGrupo, setEditingGrupo] = useState(null);
  const [delGrupo,     setDelGrupo]     = useState({ open: false, grupo: null, loading: false });

  const [inscModal, setInscModal] = useState(false);
  const [inscGrupo, setInscGrupo] = useState(null);

  const [evModal,   setEvModal]   = useState(false);
  const [editingEv, setEditingEv] = useState(null);
  const [delEv,     setDelEv]     = useState({ open: false, ev: null, loading: false });

  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [usersRes, gruposRes, evRes] = await Promise.all([
        api.get("/admin/users"),
        api.get("/admin/grupos").catch(() => ({ data: { data: [] } })),
        api.get("/admin/eventos").catch(() => ({ data: { data: [] } })),
      ]);
      const all = usersRes.data.data || [];
      setProfesores(all.filter((u) => u.rol === "profesor"));
      setEstudiantes(all.filter((u) => u.rol === "estudiante"));
      setGrupos(gruposRes.data.data || []);
      setEventos(evRes.data.data || []);
    } catch (e) {
      console.error("Error al cargar datos:", e);
    } finally {
      setLoading(false);
    }
  };

  const saveUser = async (data) => {
    editingUser ? await api.put(`/admin/users/${editingUser.id}`, data) : await api.post("/admin/users", data);
    await fetchAll();
  };
  const confirmDeleteUser = async () => {
    setDelUser((p) => ({ ...p, loading: true }));
    try { await api.delete(`/admin/users/${delUser.user.id}`); await fetchAll(); setDelUser({ open: false, user: null, loading: false }); }
    catch { setDelUser((p) => ({ ...p, loading: false })); }
  };

  const saveGrupo = async (data) => {
    editingGrupo ? await api.put(`/admin/grupos/${editingGrupo.id}`, data) : await api.post("/admin/grupos", data);
    await fetchAll();
  };
  const confirmDeleteGrupo = async () => {
    setDelGrupo((p) => ({ ...p, loading: true }));
    try { await api.delete(`/admin/grupos/${delGrupo.grupo.id}`); await fetchAll(); setDelGrupo({ open: false, grupo: null, loading: false }); }
    catch { setDelGrupo((p) => ({ ...p, loading: false })); }
  };

  const saveEvento = async (data) => {
    editingEv ? await api.put(`/admin/eventos/${editingEv.id}`, data) : await api.post("/admin/eventos", data);
    await fetchAll();
  };
  const confirmDeleteEv = async () => {
    const eventoId = delEv.ev?.id;
    if (!eventoId) return;
    setDelEv((p) => ({ ...p, loading: true }));
    try { await api.delete(`/admin/eventos/${eventoId}`); await fetchAll(); setDelEv({ open: false, ev: null, loading: false }); }
    catch { setDelEv((p) => ({ ...p, loading: false })); }
  };

  const tabLabel = TABS.find(([id]) => id === activeTab)?.[1];

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col">
      <header className="bg-white border-b border-slate-200">
        <div className="w-full px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">

          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <img src={logoFundacion} alt="Logo" className="w-8 h-8 sm:w-10 sm:h-10 object-contain"/>
            <div className="hidden sm:block">
              <p className="text-[11px] text-slate-400 leading-none">Administrador</p>
              <p className="text-sm font-semibold text-slate-800">{user?.nombre} {user?.apellidos}</p>
            </div>
          </div>

          {/* Tabs — desktop */}
          <nav className="hidden sm:flex items-center gap-1 bg-slate-100 rounded-full p-1 flex-1 max-w-md mx-auto">
            {TABS.map(([id, label]) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`flex-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap
                  ${activeTab === id ? "bg-[#3D52A0] text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                {label}
              </button>
            ))}
          </nav>

          {/* Tab activo — mobile */}
          <span className="sm:hidden text-sm font-semibold text-[#3D52A0] flex-1 text-center">{tabLabel}</span>

          {/* Derecha: usuario dropdown (desktop) + hamburguesa (mobile) */}
          <div className="flex items-center gap-2 shrink-0">

            {/* Usuario dropdown — desktop */}
            <div className="relative hidden sm:block" ref={dropdownRef}>
              <button onClick={() => setDropdownOpen(p => !p)}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="text-right">
                  <p className="text-xs font-semibold text-slate-700 leading-none">{user?.nombre} {user?.apellidos}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Administrador</p>
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
                  <button onClick={() => { logout(); window.location.href = "/login"; }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                    <LogoutIcon/> Cerrar sesion
                  </button>
                </div>
              )}
            </div>

            {/* Hamburguesa — mobile */}
            <div className="relative sm:hidden" ref={menuRef}>
              <button onClick={() => setMenuOpen(p => !p)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors">
                <HamburgerIcon/>
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                  {/* Info usuario */}
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-700 truncate">{user?.nombre} {user?.apellidos}</p>
                    <p className="text-[11px] text-slate-400">Administrador</p>
                  </div>
                  {/* Tabs */}
                  <div className="py-1">
                    <p className="px-4 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Navegacion</p>
                    {TABS.map(([id, label]) => (
                      <button key={id} onClick={() => { setActiveTab(id); setMenuOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors
                          ${activeTab === id ? "text-[#3D52A0] bg-[#EEF2FF]" : "text-slate-600 hover:bg-slate-50"}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                  {/* Acciones */}
                  <div className="border-t border-slate-100 py-1">
                    <button onClick={() => { setMenuOpen(false); setPasswordModal(true); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                      <KeyIcon/> Cambiar contrasena
                    </button>
                    <button onClick={() => { logout(); window.location.href = "/login"; }}
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

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        {activeTab === "profesores" && (
          <ProfesoresTab profesores={profesores} loading={loading}
            userModal={userModal} setUserModal={setUserModal}
            editingUser={editingUser} setEditingUser={setEditingUser}
            delUser={delUser} setDelUser={setDelUser}
            onSave={saveUser} onConfirmDelete={confirmDeleteUser}/>
        )}
        {activeTab === "estudiantes" && (
          <EstudiantesTab estudiantes={estudiantes} loading={loading}
            userModal={userModal} setUserModal={setUserModal}
            editingUser={editingUser} setEditingUser={setEditingUser}
            delUser={delUser} setDelUser={setDelUser}
            onSave={saveUser} onConfirmDelete={confirmDeleteUser}/>
        )}
        {activeTab === "grupos" && (
          <GruposTab grupos={grupos} profesores={profesores} estudiantes={estudiantes} loading={loading}
            grupoModal={grupoModal} setGrupoModal={setGrupoModal}
            editingGrupo={editingGrupo} setEditingGrupo={setEditingGrupo}
            delGrupo={delGrupo} setDelGrupo={setDelGrupo}
            inscModal={inscModal} setInscModal={setInscModal}
            inscGrupo={inscGrupo} setInscGrupo={setInscGrupo}
            onSave={saveGrupo} onConfirmDelete={confirmDeleteGrupo}/>
        )}
        {activeTab === "calendario" && (
          <CalendarioTab eventos={eventos} onEventosChange={fetchAll}
            evModal={evModal} setEvModal={setEvModal}
            editingEv={editingEv} setEditingEv={setEditingEv}
            delEv={delEv} setDelEv={setDelEv}
            onSave={saveEvento} onConfirmDelete={confirmDeleteEv}/>
        )}
      </main>

      <CambiarPasswordModal isOpen={passwordModal} onClose={() => setPasswordModal(false)}/>
    </div>
  );
};

export default AdminDashboard;