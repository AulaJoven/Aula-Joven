// src/pages/profesor/GruposTab.jsx
import { useState, useMemo } from 'react';
import { GrupoCard } from '../../components/profesor/GrupoCard';
import { Spinner } from '../../components/ui/Spinner';

const SearchIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
  </svg>
);

const BookIcon = () => (
  <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
  </svg>
);

const SORT_OPTIONS = [
  { value: 'az',    label: 'A → Z' },
  { value: 'za',    label: 'Z → A' },
  { value: 'grado', label: 'Por Grado' },
];

const GRADOS = [7, 8, 9, 10, 11, 12];

export const GruposTab = ({ grupos, loading, error, onRetry, onVerGrupo }) => {
  const [search, setSearch] = useState('');
  const [sort,   setSort]   = useState('az');
  const [grado,  setGrado]  = useState('');

  const filtered = useMemo(() => {
    let list = [...grupos];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(g =>
        g.nombre.toLowerCase().includes(q)  ||
        g.codigo.toLowerCase().includes(q)  ||
        g.materia.toLowerCase().includes(q)
      );
    }

    if (grado) {
      list = list.filter(g => String(g.grado) === grado);
    }

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
        <h1 className="text-xl font-bold text-slate-800">Mis Grupos</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          {loading ? 'Cargando...' : `${grupos.length} ${grupos.length === 1 ? 'grupo asignado' : 'grupos asignados'}`}
        </p>
      </div>

      {/* Búsqueda y filtros */}
      {!loading && !error && grupos.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <SearchIcon/>
            </span>
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
        </div>
      )}

      {/* Chips filtros activos */}
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
            <span className="flex items-center gap-1 text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
              {grado}° grado
              <button onClick={() => setGrado('')} className="hover:text-red-500 ml-0.5 font-bold">×</button>
            </span>
          )}
          <button onClick={() => { setSearch(''); setGrado(''); }}
            className="text-xs text-slate-400 hover:text-red-400 ml-1">
            Limpiar todo
          </button>
        </div>
      )}

      {/* Contenido */}
      {loading ? (
        <div className="flex justify-center py-24">
          <Spinner cls="w-8 h-8 text-[#3D52A0]"/>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 rounded-xl p-8 text-center">
          <p className="text-sm text-red-500 mb-3">{error}</p>
          <button onClick={onRetry}
            className="text-xs text-red-400 hover:text-red-600 underline">
            Reintentar
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <BookIcon/>
          <p className="text-slate-600 font-medium mt-4">
            {hasFilters ? 'Sin resultados con los filtros aplicados' : 'No tienes grupos asignados'}
          </p>
          <p className="text-sm text-slate-400 mt-1">
            {hasFilters ? '' : 'Contacta al administrador para que te asigne grupos.'}
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs text-slate-400 mb-3">
            {filtered.length} {filtered.length === 1 ? 'grupo' : 'grupos'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(g => (
              <GrupoCard key={g.id} grupo={g} onClick={onVerGrupo}/>
            ))}
          </div>
        </>
      )}
    </>
  );
};