import { useState, useMemo } from 'react';
import { ProfesorCard } from '../../components/admin/ProfesorCard';
import { UserModal } from '../../components/admin/modals/UserModal';
import { DeleteModal } from '../../components/admin/modals/DeleteModal';
import { Spinner } from '../../components/ui/Spinner';
import { PlusIcon, UserIcon } from '../../components/ui/Icons';

const SearchIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
  </svg>
);

const SORT_OPTIONS = [
  { value: 'az', label: 'A → Z' },
  { value: 'za', label: 'Z → A' },
];

export const ProfesoresTab = ({
  profesores, loading,
  userModal, setUserModal,
  editingUser, setEditingUser,
  delUser, setDelUser,
  onSave, onConfirmDelete,
}) => {
  const [search, setSearch] = useState('');
  const [sort,   setSort]   = useState('az');

  const openAdd  = ()  => { setEditingUser(null); setUserModal(true); };
  const openEdit = u   => { setEditingUser(u);    setUserModal(true); };
  const openDel  = u   => setDelUser({ open: true, user: u, loading: false });

  const filtered = useMemo(() => {
    let list = [...profesores];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(u =>
        u.nombre.toLowerCase().includes(q) ||
        u.apellidos.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      const na = `${a.nombre} ${a.apellidos}`.toLowerCase();
      const nb = `${b.nombre} ${b.apellidos}`.toLowerCase();
      return sort === 'az' ? na.localeCompare(nb) : nb.localeCompare(na);
    });
    return list;
  }, [profesores, search, sort]);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Panel de Administración</h1>
        <p className="text-sm text-slate-400">Gestiona usuarios, materias y grados</p>
      </div>

      <div className="bg-[#3D52A0] rounded-xl p-5 flex items-center justify-between mb-6 text-white">
        <div>
          <p className="text-xs text-white/70">Total Profesores</p>
          <p className="text-3xl font-bold">{loading ? '—' : profesores.length}</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center"><UserIcon/></div>
      </div>

      {/* Búsqueda y filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><SearchIcon/></span>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre o correo..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D52A0]/20 focus:border-[#3D52A0]"
          />
        </div>
        <select value={sort} onChange={e => setSort(e.target.value)}
          className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D52A0]/20 focus:border-[#3D52A0] text-slate-700">
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#3D52A0] hover:bg-[#2D3F8A] text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap">
          <PlusIcon/> Agregar Profesor
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner cls="w-8 h-8 text-[#3D52A0]"/></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-slate-400 text-sm">
            {search ? `Sin resultados para "${search}"` : 'No hay profesores registrados aún.'}
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs text-slate-400 mb-3">
            {filtered.length} {filtered.length === 1 ? 'profesor' : 'profesores'}
            {search && <span className="text-[#3D52A0]"> · "{search}"</span>}
          </p>
          <div className="space-y-3">
            {filtered.map(u => <ProfesorCard key={u.id} user={u} onEdit={openEdit} onDelete={openDel}/>)}
          </div>
        </>
      )}

      <UserModal isOpen={userModal} onClose={() => setUserModal(false)} onSave={onSave} editingUser={editingUser} rol="profesor"/>
      <DeleteModal
        isOpen={delUser.open} onClose={() => setDelUser({ open: false, user: null, loading: false })}
        onConfirm={onConfirmDelete} nombre={`${delUser.user?.nombre || ''} ${delUser.user?.apellidos || ''}`} loading={delUser.loading}
      />
    </>
  );
};