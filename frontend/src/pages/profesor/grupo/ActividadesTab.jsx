// src/pages/profesor/grupo/ActividadesTab.jsx
import { useState, useEffect } from 'react';
import api from '../../../services/api';
import { Spinner } from '../../../components/ui/Spinner';
import { EditIcon, TrashIcon, PlusIcon } from '../../../components/ui/Icons';
import { ActividadModal } from '../../../components/profesor/modals/ActividadModal';

const TIPOS = {
  actividad: { label: 'Actividad', cls: 'bg-blue-100 text-blue-700 border-blue-200'         },
  examen:    { label: 'Examen',    cls: 'bg-red-100 text-red-700 border-red-200'             },
  tarea:     { label: 'Tarea',     cls: 'bg-amber-100 text-amber-700 border-amber-200'       },
  evento:    { label: 'Evento',    cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
};

const formatFecha = (fecha) => {
  if (!fecha) return '';
  const [y, m, d] = fecha.split('-');
  return `${d}/${m}/${y}`;
};

// ── ActividadCard ──────────────────────────────────────────────────────────
const ActividadCard = ({ actividad, onEdit, onDelete }) => {
  const [confirm,    setConfirm]    = useState(false);
  const [delLoading, setDelLoading] = useState(false);
  const tipo = TIPOS[actividad.tipo] || TIPOS.actividad;

  const handleDelete = async () => {
    setDelLoading(true);
    await onDelete(actividad.id);
    setDelLoading(false);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${tipo.cls}`}>
              {tipo.label}
            </span>
            {actividad.importante && (
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full border bg-red-100 text-red-700 border-red-200">
                ⚑ Importante
              </span>
            )}
            <span className="text-xs text-slate-400 ml-auto">{formatFecha(actividad.fecha)}</span>
          </div>
          <p className="text-sm font-semibold text-slate-800">{actividad.titulo}</p>
          {actividad.descripcion && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{actividad.descripcion}</p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {confirm ? (
            <div className="flex items-center gap-1.5 bg-red-50 border border-red-100 rounded-lg px-2 py-1">
              <span className="text-xs text-red-600">¿Eliminar?</span>
              <button onClick={handleDelete} disabled={delLoading}
                className="text-xs font-bold text-red-600 hover:text-red-800 disabled:opacity-50">
                {delLoading ? '...' : 'Sí'}
              </button>
              <button onClick={() => setConfirm(false)} className="text-xs text-slate-400 hover:text-slate-600">No</button>
            </div>
          ) : (
            <>
              <button onClick={() => onEdit(actividad)}
                className="p-1.5 text-slate-400 hover:text-[#3D52A0] hover:bg-[#EEF2FF] rounded-lg transition-colors">
                <EditIcon/>
              </button>
              <button onClick={() => setConfirm(true)}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                <TrashIcon/>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ── ActividadesTab ─────────────────────────────────────────────────────────
export const ActividadesTab = ({ grupo }) => {
  const [actividades,      setActividades]      = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState('');
  const [modal,            setModal]            = useState(false);
  const [editingActividad, setEditingActividad] = useState(null);

  useEffect(() => { fetchActividades(); }, [grupo.id]);

  const fetchActividades = async () => {
    setLoading(true); setError('');
    try {
      const res = await api.get(`/profesor/grupos/${grupo.id}/actividades`);
      setActividades(res.data.data || []);
    } catch { setError('No se pudieron cargar las actividades.'); }
    finally  { setLoading(false); }
  };

  const openAdd  = ()  => { setEditingActividad(null); setModal(true); };
  const openEdit = a   => { setEditingActividad(a);    setModal(true); };

  const handleSave = async (data) => {
    if (editingActividad) {
      await api.put(`/profesor/grupos/${grupo.id}/actividades/${editingActividad.id}`, data);
    } else {
      await api.post(`/profesor/grupos/${grupo.id}/actividades`, data);
    }
    fetchActividades();
  };

  const handleDelete = async (actividadId) => {
    await api.delete(`/profesor/grupos/${grupo.id}/actividades/${actividadId}`);
    fetchActividades();
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-700">Actividades del Grupo</h2>
          {!loading && (
            <p className="text-xs text-slate-400 mt-0.5">
              {actividades.length} {actividades.length === 1 ? 'actividad' : 'actividades'}
            </p>
          )}
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#3D52A0] hover:bg-[#2D3F8A] rounded-lg transition-colors">
          <PlusIcon/> Agregar Actividad
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner cls="w-8 h-8 text-[#3D52A0]"/></div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center">
          <p className="text-sm text-red-500 mb-2">{error}</p>
          <button onClick={fetchActividades} className="text-xs text-red-400 hover:text-red-600 underline">Reintentar</button>
        </div>
      ) : actividades.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-slate-500 font-medium text-sm">No hay actividades registradas</p>
          <p className="text-slate-400 text-xs mt-1">Agrega la primera actividad para este grupo.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {actividades.map(a => (
            <ActividadCard key={a.id} actividad={a} onEdit={openEdit} onDelete={handleDelete}/>
          ))}
        </div>
      )}

      <ActividadModal
        isOpen={modal} onClose={() => setModal(false)}
        onSave={handleSave} editingActividad={editingActividad}
      />
    </>
  );
};