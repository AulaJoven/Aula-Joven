// src/components/estudiante/EstudianteSidebar.jsx
import { useAuth } from '../../context/AuthContext';
import logoFundacion from '../../assets/logo-fundacion.png';

const GRADO_LABEL = g => g ? `${g}° Grado` : '';

const TABS = [
  { id: 'materias',    label: 'Mis Materias' },
  { id: 'actividades', label: 'Actividades'  },
  { id: 'material',    label: 'Material'     },
  { id: 'calendario',  label: 'Calendario'   },
];

const BookIcon   = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>;
const FolderIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7a2 2 0 012-2h4l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/></svg>;
const CalIcon    = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>;
const TaskIcon   = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>;
const KeyIcon    = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>;
const LogoutIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>;

const TAB_ICONS = { materias: BookIcon, actividades: TaskIcon, material: FolderIcon, calendario: CalIcon };

export const EstudianteSidebar = ({ activeTab, onTabChange, materias, materiaActiva, onMateriaSelect, onPasswordModal, onLogout }) => {
  const { user } = useAuth();
  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <img src={logoFundacion} alt="Logo" className="w-8 h-8 object-contain brightness-0 invert"/>
          <div>
            <p className="text-[10px] text-white/60 leading-none uppercase tracking-wide">Aula Joven</p>
            <p className="text-xs font-bold text-white">Portal Estudiante</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 border-b border-white/10">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-bold mb-2">
          {`${user?.nombre?.[0] || ''}${user?.apellidos?.[0] || ''}`.toUpperCase()}
        </div>
        <p className="text-sm font-semibold text-white truncate">{user?.nombre} {user?.apellidos}</p>
        <p className="text-xs text-white/60">{GRADO_LABEL(user?.grado)}</p>
      </div>

      {materias.length > 0 && (
        <div className="px-5 py-3 border-b border-white/10">
          <p className="text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-2">Grupo activo</p>
          <select value={materiaActiva?.id || ''}
            onChange={e => { const m = materias.find(x => x.id === e.target.value); if (m) onMateriaSelect(m); }}
            className="w-full text-xs px-2 py-1.5 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30">
            {materias.map(m => (
              <option key={m.id} value={m.id} className="text-slate-800 bg-white">{m.materia} — {m.nombre}</option>
            ))}
          </select>
        </div>
      )}

      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {TABS.map(({ id, label }) => {
          const Icon = TAB_ICONS[id];
          return (
            <button key={id} onClick={() => onTabChange(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                ${activeTab === id ? 'bg-white/20 text-white shadow-sm' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
              <Icon/>{label}
            </button>
          );
        })}
      </nav>

      <div className="px-3 py-3 border-t border-white/10 space-y-0.5">
        <button onClick={onPasswordModal}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors">
          <KeyIcon/> Cambiar contraseña
        </button>
        <button onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-colors">
          <LogoutIcon/> Salir
        </button>
      </div>
    </div>
  );
};