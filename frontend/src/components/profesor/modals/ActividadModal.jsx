// src/components/profesor/modals/ActividadModal.jsx
import { useState, useEffect } from 'react';
import { Modal } from '../../ui/Modal';
import { Spinner } from '../../ui/Spinner';

const TIPOS = {
  actividad: { label: 'Actividad' },
  examen:    { label: 'Examen'    },
  tarea:     { label: 'Tarea'     },
  evento:    { label: 'Evento'    },
};

export const ActividadModal = ({ isOpen, onClose, onSave, editingActividad }) => {
  const [form,    setForm]    = useState({ titulo: '', descripcion: '', fecha: '', tipo: 'actividad', importante: false });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    setForm(editingActividad ? {
      titulo:      editingActividad.titulo      || '',
      descripcion: editingActividad.descripcion || '',
      fecha:       editingActividad.fecha       || '',
      tipo:        editingActividad.tipo        || 'actividad',
      importante:  editingActividad.importante  || false,
    } : { titulo: '', descripcion: '', fecha: '', tipo: 'actividad', importante: false });
    setError('');
  }, [editingActividad, isOpen]);

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await onSave(form); onClose(); }
    catch (err) { setError(err.response?.data?.error || 'Error al guardar'); }
    finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}
      title={editingActividad ? 'Editar Actividad' : 'Agregar Actividad'}>
      <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">Título *</label>
          <input value={form.titulo} onChange={e => set('titulo', e.target.value)} required
            placeholder="Ej: Examen Parcial, Tarea 1..."
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D52A0]/20 focus:border-[#3D52A0]"/>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Fecha *</label>
            <input type="date" value={form.fecha} onChange={e => set('fecha', e.target.value)} required
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D52A0]/20 focus:border-[#3D52A0]"/>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Tipo</label>
            <select value={form.tipo} onChange={e => set('tipo', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D52A0]/20 focus:border-[#3D52A0]">
              {Object.entries(TIPOS).map(([v, { label }]) => (
                <option key={v} value={v}>{label}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">Descripción</label>
          <textarea value={form.descripcion} onChange={e => set('descripcion', e.target.value)}
            rows={2} placeholder="Descripción opcional..."
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D52A0]/20 focus:border-[#3D52A0] resize-none"/>
        </div>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" checked={form.importante} onChange={e => set('importante', e.target.checked)}
            className="w-4 h-4 rounded accent-[#3D52A0]"/>
          <span className="text-sm text-slate-600">Marcar como importante</span>
        </label>
        {error && <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
        <div className="flex justify-end gap-3 pt-1">
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg">
            Cancelar
          </button>
          <button type="submit" disabled={loading}
            className="px-4 py-2 text-sm text-white bg-[#3D52A0] hover:bg-[#2D3F8A] rounded-lg disabled:opacity-60 flex items-center gap-2">
            {loading && <Spinner/>}{editingActividad ? 'Guardar' : 'Agregar'}
          </button>
        </div>
      </form>
    </Modal>
  );
};