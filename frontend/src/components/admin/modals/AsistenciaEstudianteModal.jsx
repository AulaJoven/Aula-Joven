// src/components/admin/modals/AsistenciaEstudianteModal.jsx
import { useState, useEffect } from 'react';
import { Modal } from '../../ui/Modal';
import { Spinner } from '../../ui/Spinner';
import { Avatar } from '../../ui/Avatar';
import { TrashIcon } from '../../ui/Icons';
import api from '../../../services/api';

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
  </svg>
);
const XIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
  </svg>
);
const BackIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
  </svg>
);

const formatFecha = (fecha) => {
  if (!fecha) return '';
  const [y, m, d] = fecha.split('-');
  const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  return `${d} ${MESES[Number(m) - 1]} ${y}`;
};

export const AsistenciaEstudianteModal = ({ isOpen, onClose, onBack, estudiante, grupoId }) => {
  const [registros,  setRegistros]  = useState([]);
  const [resumen,    setResumen]    = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState('');
  const [confirmDel, setConfirmDel] = useState(null);

  // Form nuevo registro
  const [fecha,       setFecha]       = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [presente,    setPresente]    = useState(true);

  useEffect(() => {
    if (isOpen && estudiante && grupoId) fetchAsistencia();
    else { setRegistros([]); setResumen(null); setError(''); resetForm(); }
  }, [isOpen, estudiante, grupoId]);

  const resetForm = () => {
    setFecha(''); setDescripcion(''); setPresente(true);
  };

  const fetchAsistencia = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/grupos/${grupoId}/estudiantes/${estudiante.id}/asistencia`);
      setRegistros(res.data.data.registros || []);
      setResumen(res.data.data.resumen);
    } catch { setError('Error al cargar asistencia'); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!fecha) { setError('La fecha es requerida'); return; }
    setSaving(true); setError('');
    try {
      await api.post(`/admin/grupos/${grupoId}/estudiantes/${estudiante.id}/asistencia`, {
        fecha, descripcion: descripcion.trim() || null, presente,
      });
      resetForm();
      await fetchAsistencia();
    } catch (e) {
      setError(e.response?.data?.error || 'Error al guardar');
    } finally { setSaving(false); }
  };

  const handleDelete = async (registroId) => {
    try {
      await api.delete(`/admin/grupos/${grupoId}/estudiantes/${estudiante.id}/asistencia/${registroId}`);
      setConfirmDel(null);
      await fetchAsistencia();
    } catch { setError('Error al eliminar'); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" maxW="max-w-lg">
      <div className="px-6 py-5 space-y-4 max-h-[80vh] overflow-y-auto">

        {/* Header estudiante */}
        <div className="flex items-center gap-3">
          <button onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors shrink-0">
            <BackIcon/>
          </button>
          <Avatar nombre={estudiante?.nombre} apellidos={estudiante?.apellidos}/>
          <div>
            <p className="text-sm font-bold text-slate-800">{estudiante?.nombre} {estudiante?.apellidos}</p>
            <p className="text-xs text-slate-400">{estudiante?.grado}° grado</p>
          </div>
        </div>

        {/* Resumen */}
        {resumen && (
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-slate-700">{resumen.total}</p>
              <p className="text-xs text-slate-400 mt-0.5">Total clases</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-emerald-600">{resumen.presentes}</p>
              <p className="text-xs text-emerald-600 mt-0.5">Presente</p>
            </div>
            <div className="bg-red-50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-red-500">{resumen.ausentes}</p>
              <p className="text-xs text-red-500 mt-0.5">Ausente</p>
            </div>
          </div>
        )}

        {/* Formulario nuevo registro */}
        <div className="bg-[#EEF2FF] border border-[#3D52A0]/20 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-[#3D52A0]">Registrar asistencia</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Fecha *</label>
              <input type="date" value={fecha} onChange={e => setFecha(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#3D52A0]/20 focus:border-[#3D52A0]"/>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Estado</label>
              <div className="flex gap-2 mt-1">
                <button onClick={() => setPresente(true)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold border transition-colors
                    ${presente ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-300'}`}>
                  <CheckIcon/> Presente
                </button>
                <button onClick={() => setPresente(false)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold border transition-colors
                    ${!presente ? 'bg-red-500 text-white border-red-500' : 'bg-white text-slate-500 border-slate-200 hover:border-red-300'}`}>
                  <XIcon/> Ausente
                </button>
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Descripción</label>
            <input value={descripcion} onChange={e => setDescripcion(e.target.value)}
              placeholder="Ej: Clase de repaso, examen parcial..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#3D52A0]/20 focus:border-[#3D52A0]"/>
          </div>
          {error && <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
          <button onClick={handleSave} disabled={saving || !fecha}
            className="w-full py-2 text-sm font-medium text-white bg-[#3D52A0] hover:bg-[#2D3F8A] rounded-lg disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <><Spinner/> Guardando...</> : 'Guardar registro'}
          </button>
        </div>

        {/* Lista de registros */}
        <div>
          <p className="text-xs font-medium text-slate-600 mb-2">
            Historial ({loading ? '…' : registros.length} registros)
          </p>
          {loading ? (
            <div className="flex justify-center py-8"><Spinner cls="w-6 h-6 text-[#3D52A0]"/></div>
          ) : registros.length === 0 ? (
            <div className="bg-slate-50 rounded-xl p-6 text-center">
              <p className="text-sm text-slate-400">No hay registros de asistencia aún.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {registros.map(r => (
                <div key={r.id}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 border
                    ${r.presente ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0
                      ${r.presente ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                      {r.presente ? <CheckIcon/> : <XIcon/>}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{formatFecha(r.fecha)}</p>
                      {r.descripcion && <p className="text-xs text-slate-500">{r.descripcion}</p>}
                    </div>
                  </div>
                  {confirmDel === r.id ? (
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => handleDelete(r.id)}
                        className="text-xs font-bold text-red-600 hover:text-red-800 px-2 py-1 bg-white rounded-lg border border-red-200">
                        Eliminar
                      </button>
                      <button onClick={() => setConfirmDel(null)}
                        className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 bg-white rounded-lg border border-slate-200">
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDel(r.id)}
                      className="p-1.5 text-slate-300 hover:text-red-400 hover:bg-white rounded-lg transition-colors">
                      <TrashIcon/>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};