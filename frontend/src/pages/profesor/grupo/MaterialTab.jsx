// src/pages/profesor/grupo/MaterialTab.jsx
import { useState, useEffect } from 'react';
import api from '../../../services/api';
import { Spinner } from '../../../components/ui/Spinner';
import { PlusIcon, TrashIcon } from '../../../components/ui/Icons';
import { MaterialModal } from '../../../components/profesor/modals/MaterialModal';

const FileIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
  </svg>
);
const ImageIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
  </svg>
);
const ExternalIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
  </svg>
);

const CATEGORIAS = {
  'PDF':    { bg: 'bg-red-50',    icon: 'text-red-500',    border: 'border-red-100',    Icon: FileIcon  },
  'Imagen': { bg: 'bg-purple-50', icon: 'text-purple-500', border: 'border-purple-100', Icon: ImageIcon },
  'Otro':   { bg: 'bg-slate-50',  icon: 'text-slate-500',  border: 'border-slate-200',  Icon: FileIcon  },
};

const formatFecha = (fecha) => {
  if (!fecha) return '';
  return new Date(fecha).toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ── MaterialCard ───────────────────────────────────────────────────────────
const MaterialCard = ({ material, onDelete }) => {
  const [confirm,    setConfirm]    = useState(false);
  const [delLoading, setDelLoading] = useState(false);
  const { Icon, bg, icon, border } = CATEGORIAS[material.categoria] || CATEGORIAS['Otro'];

  const handleDelete = async () => {
    setDelLoading(true);
    await onDelete(material.id);
    setDelLoading(false);
  };

  return (
    <div className={`${bg} border ${border} rounded-xl p-4 flex items-start gap-3 hover:shadow-sm transition-shadow`}>
      <div className={`w-10 h-10 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm ${icon}`}>
        <Icon/>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{material.titulo}</p>
            {material.descripcion && (
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{material.descripcion}</p>
            )}
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/70 ${icon}`}>
                {material.categoria || 'Archivo'}
              </span>
              {material.archivo_size && (
                <span className="text-[10px] text-slate-400">{formatSize(material.archivo_size)}</span>
              )}
              <span className="text-[10px] text-slate-400">{formatFecha(material.created_at)}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <a href={material.archivo_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#3D52A0] bg-white hover:bg-[#EEF2FF] rounded-lg border border-white shadow-sm transition-colors">
              <ExternalIcon/> Abrir
            </a>
            {confirm ? (
              <div className="flex items-center gap-1.5 bg-red-50 border border-red-100 rounded-lg px-2 py-1.5">
                <span className="text-xs text-red-600">¿Eliminar?</span>
                <button onClick={handleDelete} disabled={delLoading}
                  className="text-xs font-bold text-red-600 hover:text-red-800 disabled:opacity-50">
                  {delLoading ? '...' : 'Sí'}
                </button>
                <button onClick={() => setConfirm(false)} className="text-xs text-slate-400 hover:text-slate-600">No</button>
              </div>
            ) : (
              <button onClick={() => setConfirm(true)}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                <TrashIcon/>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── MaterialTab ────────────────────────────────────────────────────────────
export const MaterialTab = ({ grupo }) => {
  const [materiales, setMateriales] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [modal,      setModal]      = useState(false);

  useEffect(() => { fetchMateriales(); }, [grupo.id]);

  const fetchMateriales = async () => {
    setLoading(true); setError('');
    try {
      const res = await api.get(`/profesor/grupos/${grupo.id}/materiales`);
      setMateriales(res.data.data || []);
    } catch { setError('No se pudieron cargar los materiales.'); }
    finally  { setLoading(false); }
  };

  const handleSave = async (data) => {
    await api.post(`/profesor/grupos/${grupo.id}/materiales`, data);
    fetchMateriales();
  };

  const handleDelete = async (materialId) => {
    await api.delete(`/profesor/grupos/${grupo.id}/materiales/${materialId}`);
    fetchMateriales();
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-700">Material del Grupo</h2>
          {!loading && (
            <p className="text-xs text-slate-400 mt-0.5">
              {materiales.length} {materiales.length === 1 ? 'archivo' : 'archivos'}
            </p>
          )}
        </div>
        <button onClick={() => setModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#3D52A0] hover:bg-[#2D3F8A] rounded-lg transition-colors">
          <PlusIcon/> Subir Archivo
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner cls="w-8 h-8 text-[#3D52A0]"/></div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center">
          <p className="text-sm text-red-500 mb-2">{error}</p>
          <button onClick={fetchMateriales} className="text-xs text-red-400 hover:text-red-600 underline">Reintentar</button>
        </div>
      ) : materiales.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-slate-500 font-medium text-sm">No hay archivos subidos</p>
          <p className="text-slate-400 text-xs mt-1">Sube el primer archivo para compartirlo con tus estudiantes.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {materiales.map(m => (
            <MaterialCard key={m.id} material={m} onDelete={handleDelete}/>
          ))}
        </div>
      )}

      <MaterialModal isOpen={modal} onClose={() => setModal(false)} onSave={handleSave}/>
    </>
  );
};