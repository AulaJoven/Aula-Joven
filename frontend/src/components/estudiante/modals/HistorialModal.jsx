// src/components/estudiante/modals/HistorialModal.jsx
import { useState, useEffect } from 'react';
import { Spinner } from '../../ui/Spinner';
import api from '../../../services/api';

const promedioColor = (p) => {
  if (p === null || p === undefined) return { bar: 'bg-slate-200', text: 'text-slate-400' };
  if (p >= 80) return { bar: 'bg-emerald-400', text: 'text-emerald-600' };
  if (p >= 65) return { bar: 'bg-amber-400',   text: 'text-amber-600'  };
  return           { bar: 'bg-red-400',         text: 'text-red-500'   };
};

const formatFecha = (fecha) => {
  if (!fecha) return '';
  const [y, m, d] = fecha.split('-');
  const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  return `${d} ${MESES[Number(m) - 1]} ${y}`;
};

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
  </svg>
);
const CheckIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
  </svg>
);
const XIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
  </svg>
);

// ── Tab Calificaciones ────────────────────────────────────────────────────
const TabCalificaciones = ({ materia }) => (
  materia.notas?.length > 0 ? (
    <div className="space-y-2">
      {materia.notas.map(n => {
        const { text: nt, bar } = promedioColor(n.nota);
        return (
          <div key={n.id} className="bg-slate-50 rounded-xl px-4 py-3">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-sm font-semibold text-slate-800 flex-1 truncate pr-3">{n.titulo}</p>
              <span className={`text-base font-bold ${nt}`}>{n.nota}</span>
            </div>
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${bar}`} style={{ width: `${Math.min(n.nota, 100)}%` }}/>
            </div>
            {n.descripcion && <p className="text-xs text-slate-400 mt-1.5">{n.descripcion}</p>}
          </div>
        );
      })}
    </div>
  ) : (
    <p className="text-sm text-slate-300 italic text-center py-8">Sin calificaciones aún</p>
  )
);

// ── Tab Asistencia ────────────────────────────────────────────────────────
const TabAsistencia = ({ grupoId }) => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/estudiante/grupos/${grupoId}/asistencia`);
        setData(res.data.data);
      } catch { setError('No se pudo cargar la asistencia'); }
      finally { setLoading(false); }
    };
    if (grupoId) fetch();
  }, [grupoId]);

  if (loading) return <div className="flex justify-center py-10"><Spinner cls="w-6 h-6 text-[#3D52A0]"/></div>;
  if (error)   return <p className="text-sm text-red-400 text-center py-8">{error}</p>;
  if (!data)   return null;

  const { registros, resumen } = data;

  return (
    <div className="space-y-4">
      {/* Resumen */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-slate-50 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-slate-700">{resumen.total}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Total</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-emerald-600">{resumen.presentes}</p>
          <p className="text-[10px] text-emerald-600 mt-0.5">Presente</p>
        </div>
        <div className="bg-red-50 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-red-500">{resumen.ausentes}</p>
          <p className="text-[10px] text-red-500 mt-0.5">Ausente</p>
        </div>
        <div className="bg-[#EEF2FF] rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-[#3D52A0]">
            {resumen.porcentaje !== null ? `${resumen.porcentaje}%` : '—'}
          </p>
          <p className="text-[10px] text-[#3D52A0] mt-0.5">Asistencia</p>
        </div>
      </div>

      {/* Barra de progreso porcentaje */}
      {resumen.porcentaje !== null && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Porcentaje de asistencia</span>
            <span className="font-semibold">{resumen.porcentaje}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                resumen.porcentaje >= 80 ? 'bg-emerald-400' :
                resumen.porcentaje >= 60 ? 'bg-amber-400' : 'bg-red-400'
              }`}
              style={{ width: `${resumen.porcentaje}%` }}
            />
          </div>
        </div>
      )}

      {/* Lista registros */}
      {registros.length === 0 ? (
        <p className="text-sm text-slate-300 italic text-center py-6">Sin registros de asistencia aún</p>
      ) : (
        <div className="space-y-2">
          {registros.map(r => (
            <div key={r.id}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 border
                ${r.presente ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0
                ${r.presente ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                {r.presente ? <CheckIcon/> : <XIcon/>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800">{formatFecha(r.fecha)}</p>
                {r.descripcion && <p className="text-xs text-slate-500 truncate">{r.descripcion}</p>}
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                ${r.presente ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                {r.presente ? 'Presente' : 'Ausente'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── HistorialModal ────────────────────────────────────────────────────────
export const HistorialModal = ({ materia, onClose }) => {
  const [activeTab, setActiveTab] = useState('calificaciones');

  useEffect(() => {
    if (materia) setActiveTab('calificaciones');
  }, [materia]);

  if (!materia) return null;
  const { text } = promedioColor(materia.promedio);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}/>
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-[#3D52A0] uppercase tracking-wide">{materia.materia}</p>
            <h3 className="text-sm font-bold text-slate-800">{materia.nombre}</h3>
            <p className="text-xs text-slate-400">Prof. {materia.profesor}</p>
          </div>
          <div className="flex items-center gap-3">
            {materia.promedio !== null && (
              <div className="text-right">
                <p className="text-[10px] text-slate-400">Promedio</p>
                <p className={`text-xl font-bold ${text}`}>{materia.promedio}</p>
              </div>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
              <CloseIcon/>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-6 pt-3 pb-0">
          {[['calificaciones', 'Calificaciones'], ['asistencia', 'Asistencia']].map(([id, label]) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`px-4 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-colors
                ${activeTab === id
                  ? 'text-[#3D52A0] border-[#3D52A0] bg-[#EEF2FF]'
                  : 'text-slate-400 border-transparent hover:text-slate-600'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {activeTab === 'calificaciones' && <TabCalificaciones materia={materia}/>}
          {activeTab === 'asistencia'     && <TabAsistencia grupoId={materia.id}/>}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            {activeTab === 'calificaciones'
              ? `${materia.notas?.length || 0} calificaciones registradas`
              : 'Registro de asistencia del grupo'}
          </p>
          <button onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-[#3D52A0] hover:bg-[#2D3F8A] rounded-lg transition-colors">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};