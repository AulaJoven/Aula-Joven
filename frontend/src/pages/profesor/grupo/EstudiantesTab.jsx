// src/pages/profesor/grupo/EstudiantesTab.jsx
import { useState, useEffect } from 'react';
import api from '../../../services/api';
import { Avatar } from '../../../components/ui/Avatar';
import { Spinner } from '../../../components/ui/Spinner';
import { PlusIcon, TrashIcon, EditIcon } from '../../../components/ui/Icons';
import { NotaModal } from '../../../components/profesor/modals/NotaModal';

// ── NotaChip ───────────────────────────────────────────────────────────────
const NotaChip = ({ nota, onEdit, onDelete, confirmId, setConfirmId }) => {
  const color =
    nota.nota >= 90 ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
    nota.nota >= 75 ? 'bg-blue-100 text-blue-700 border-blue-200' :
    nota.nota >= 60 ? 'bg-amber-100 text-amber-700 border-amber-200' :
                      'bg-red-100 text-red-700 border-red-200';

  return (
    <div className={`group flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${color} transition-all`}>
      <span className="font-semibold">{nota.nota}</span>
      <span className="text-current opacity-70 max-w-[80px] truncate">{nota.titulo}</span>
      <div className="flex items-center gap-0.5 ml-0.5">
        <button onClick={() => onEdit(nota)}
          className="opacity-0 group-hover:opacity-100 p-0.5 rounded transition-opacity">
          <EditIcon/>
        </button>
        {confirmId === nota.id ? (
          <>
            <button onClick={() => onDelete(nota.id)}
              className="text-[10px] font-bold text-red-600 hover:text-red-800 px-1">✕</button>
            <button onClick={() => setConfirmId(null)}
              className="text-[10px] text-slate-400 hover:text-slate-600 px-1">—</button>
          </>
        ) : (
          <button onClick={() => setConfirmId(nota.id)}
            className="opacity-0 group-hover:opacity-100 p-0.5 rounded transition-opacity">
            <TrashIcon/>
          </button>
        )}
      </div>
    </div>
  );
};

// ── EstudianteRow ──────────────────────────────────────────────────────────
const EstudianteRow = ({ estudiante, grupoId, onNotaChange }) => {
  const [notaModal,   setNotaModal]   = useState(false);
  const [editingNota, setEditingNota] = useState(null);
  const [confirmId,   setConfirmId]   = useState(null);

  const notas    = estudiante.notas || [];
  const promedio = notas.length > 0
    ? (notas.reduce((s, n) => s + Number(n.nota), 0) / notas.length).toFixed(1)
    : null;

  const promedioColor =
    !promedio      ? 'text-slate-400'   :
    promedio >= 90 ? 'text-emerald-600' :
    promedio >= 75 ? 'text-blue-600'    :
    promedio >= 60 ? 'text-amber-600'   : 'text-red-600';

  const openAdd  = () => { setEditingNota(null); setNotaModal(true); };
  const openEdit = n  => { setEditingNota(n);    setNotaModal(true); };

  const handleSave = async (data) => {
    if (editingNota) {
      await api.put(`/profesor/grupos/${grupoId}/estudiantes/${estudiante.id}/notas/${editingNota.id}`, data);
    } else {
      await api.post(`/profesor/grupos/${grupoId}/estudiantes/${estudiante.id}/notas`, data);
    }
    onNotaChange();
  };

  const handleDelete = async (notaId) => {
    await api.delete(`/profesor/grupos/${grupoId}/estudiantes/${estudiante.id}/notas/${notaId}`);
    setConfirmId(null);
    onNotaChange();
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow">
        <div className="flex items-start gap-3">
          <Avatar nombre={estudiante.nombre} apellidos={estudiante.apellidos}/>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {estudiante.nombre} {estudiante.apellidos}
                </p>
                <p className="text-xs text-slate-400">{estudiante.grado}° grado</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {promedio && (
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 leading-none mb-0.5">Promedio</p>
                    <p className={`text-lg font-bold leading-none ${promedioColor}`}>{promedio}</p>
                  </div>
                )}
                <button onClick={openAdd}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#3D52A0] bg-[#EEF2FF] hover:bg-[#dde6ff] rounded-lg transition-colors">
                  <PlusIcon/> Nota
                </button>
              </div>
            </div>
            {notas.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {notas.map(n => (
                  <NotaChip key={n.id} nota={n}
                    onEdit={openEdit} onDelete={handleDelete}
                    confirmId={confirmId} setConfirmId={setConfirmId}/>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-300 italic">Sin notas aún</p>
            )}
          </div>
        </div>
      </div>

      <NotaModal
        isOpen={notaModal} onClose={() => setNotaModal(false)}
        onSave={handleSave} editingNota={editingNota}
        studentName={`${estudiante.nombre} ${estudiante.apellidos}`}
      />
    </>
  );
};

// ── EstudiantesTab ─────────────────────────────────────────────────────────
export const EstudiantesTab = ({ grupo }) => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');

  useEffect(() => { fetchEstudiantes(); }, [grupo.id]);

  const fetchEstudiantes = async () => {
    setLoading(true); setError('');
    try {
      const res = await api.get(`/profesor/grupos/${grupo.id}/estudiantes`);
      setEstudiantes(res.data.data || []);
    } catch { setError('No se pudieron cargar los estudiantes.'); }
    finally  { setLoading(false); }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-700">Estudiantes del Grupo</h2>
          {!loading && (
            <p className="text-xs text-slate-400 mt-0.5">
              {estudiantes.length} {estudiantes.length === 1 ? 'estudiante' : 'estudiantes'}
            </p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner cls="w-8 h-8 text-[#3D52A0]"/></div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center">
          <p className="text-sm text-red-500 mb-2">{error}</p>
          <button onClick={fetchEstudiantes} className="text-xs text-red-400 hover:text-red-600 underline">Reintentar</button>
        </div>
      ) : estudiantes.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-slate-400 text-sm">No hay estudiantes inscritos en este grupo.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {estudiantes.map(e => (
            <EstudianteRow key={e.id} estudiante={e} grupoId={grupo.id} onNotaChange={fetchEstudiantes}/>
          ))}
        </div>
      )}
    </>
  );
};