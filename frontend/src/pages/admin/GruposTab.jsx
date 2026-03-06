// src/pages/admin/GruposTab.jsx
import { useState, useMemo } from 'react';
import { GrupoCard } from '../../components/admin/GrupoCard';
import { GrupoModal } from '../../components/admin/modals/GrupoModal';
import { DeleteModal } from '../../components/admin/modals/DeleteModal';
import { InscripcionesModal } from '../../components/admin/modals/InscripcionesModal';
import { AsistenciaModal } from '../../components/admin/modals/AsistenciaModal';
import { Spinner } from '../../components/ui/Spinner';
import { PlusIcon, GrupoIcon } from '../../components/ui/Icons';

const SearchIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
  </svg>
);

const SORT_OPTIONS = [
  { value: 'az',    label: 'A → Z' },
  { value: 'za',    label: 'Z → A' },
  { value: 'grado', label: 'Por Grado' },
];

const GRADOS = [7, 8, 9, 10, 11];

export const GruposTab = ({
  grupos, profesores, estudiantes, loading,
  grupoModal, setGrupoModal,
  editingGrupo, setEditingGrupo,
  delGrupo, setDelGrupo,
  inscModal, setInscModal,
  inscGrupo, setInscGrupo,
  onSave, onConfirmDelete,
}) => {
  const [search,        setSearch]        = useState('');
  const [sort,          setSort]          = useState('az');
  const [grado,         setGrado]         = useState('');
  const [asistModal,    setAsistModal]    = useState(false);
  const [asistGrupo,    setAsistGrupo]    = useState(null);

  const openAdd           = ()  => { setEditingGrupo(null); setGrupoModal(true); };
  const openEdit          = g   => { setEditingGrupo(g);    setGrupoModal(true); };
  const openDel           = g   => setDelGrupo({ open: true, grupo: g, loading: false });
  const openInscripciones = g   => { setInscGrupo(g);       setInscModal(true);  };
  const openAsistencia    = g   => { setAsistGrupo(g);      setAsistModal(true); };

  const filtered = useMemo(() => {
    let list = [...grupos];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(g =>
        g.nombre.toLowerCase().includes(q)   ||
        g.codigo.toLowerCase().includes(q)   ||
        g.materia.toLowerCase().includes(q)  ||
        g.profesor.toLowerCase().includes(q)
      );
    }

    if (grado) list = list.filter(g => String(g.grado) === grado);

    list.sort((a, b) => {
      if (sort === 'grado') return (a.grado || 0) - (b.grado || 0);
      const na = a.nombre.toLowerCase();
      const nb = b.nombre.toLowerCase();
      return sort === 'az' ? na.localeCompare(nb) : nb.localeCompare(na);
    });

    return list;
  }, [grupos, search, sort, grado]);

  const hasFilters = search || grado;

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Panel de Administración</h1>
        <p className="text-sm text-slate-400">Gestiona los grupos y asignaciones de profesores</p>
      </div>

      <div className="bg-indigo-500 rounded-xl p-5 flex items-center justify-between mb-6 text-white">
        <div>
          <p className="text-xs text-white/70">Total Grupos</p>
          <p className="text-3xl font-bold">{loading ? '—' : grupos.length}</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center"><GrupoIcon/></div>
      </div>

      {/* Búsqueda y filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><SearchIcon/></span>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, código o materia..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D52A0]/20 focus:border-[#3D52A0]"
          />
        </div>
        <select value={grado} onChange={e => setGrado(e.target.value)}
          className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D52A0]/20 focus:border-[#3D52A0] text-slate-700">
          <option value="">Todos los grados</option>
          {GRADOS.map(g => <option key={g} value={g}>{g}° grado</option>)}
        </select>
        <select value={sort} onChange={e => setSort(e.target.value)}
          className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D52A0]/20 focus:border-[#3D52A0] text-slate-700">
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#3D52A0] hover:bg-[#2D3F8A] text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap">
          <PlusIcon/> Crear Grupo
        </button>
      </div>

      {/* Chips de filtros activos */}
      {hasFilters && (
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-xs text-slate-400">Filtros:</span>
          {search && (
            <span className="flex items-center gap-1 text-xs bg-[#EEF2FF] text-[#3D52A0] px-2.5 py-1 rounded-full">
              "{search}"
              <button onClick={() => setSearch('')} className="hover:text-red-500 ml-0.5 font-bold">×</button>
            </span>
          )}
          {grado && (
            <span className="flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full">
              {grado}° grado
              <button onClick={() => setGrado('')} className="hover:text-red-500 ml-0.5 font-bold">×</button>
            </span>
          )}
          <button onClick={() => { setSearch(''); setGrado(''); }} className="text-xs text-slate-400 hover:text-red-400 ml-1">
            Limpiar todo
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Spinner cls="w-8 h-8 text-[#3D52A0]"/></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-slate-400 text-sm">
            {hasFilters ? 'Sin resultados con los filtros aplicados.' : 'No hay grupos creados aún.'}
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs text-slate-400 mb-3">
            {filtered.length} {filtered.length === 1 ? 'grupo' : 'grupos'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map(g => (
              <GrupoCard key={g.id} grupo={g}
                onEdit={openEdit}
                onDelete={openDel}
                onVerEstudiantes={openInscripciones}
                onAsistencia={openAsistencia}
              />
            ))}
          </div>
        </>
      )}

      <GrupoModal isOpen={grupoModal} onClose={() => setGrupoModal(false)} onSave={onSave} editingGrupo={editingGrupo} profesores={profesores}/>
      <DeleteModal
        isOpen={delGrupo.open} onClose={() => setDelGrupo({ open: false, grupo: null, loading: false })}
        onConfirm={onConfirmDelete} nombre={delGrupo.grupo?.nombre} loading={delGrupo.loading}
      />
      <InscripcionesModal isOpen={inscModal} onClose={() => setInscModal(false)} grupo={inscGrupo} todosEstudiantes={estudiantes}/>
      <AsistenciaModal isOpen={asistModal} onClose={() => { setAsistModal(false); setAsistGrupo(null); }} grupo={asistGrupo}/>
    </>
  );
};