// src/components/profesor/modals/NotaModal.jsx
import { useState, useEffect } from 'react';
import { Modal } from '../../ui/Modal';
import { Spinner } from '../../ui/Spinner';

export const NotaModal = ({ isOpen, onClose, onSave, editingNota, studentName }) => {
  const [form,    setForm]    = useState({ titulo: '', nota: '', descripcion: '' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    setForm(editingNota
      ? { titulo: editingNota.titulo || '', nota: editingNota.nota, descripcion: editingNota.descripcion || '' }
      : { titulo: '', nota: '', descripcion: '' });
    setError('');
  }, [editingNota, isOpen]);

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    const val = Number(form.nota);
    if (isNaN(val) || val < 0 || val > 100) {
      setError('La nota debe ser un número entre 0 y 100');
      setLoading(false); return;
    }
    try { await onSave({ ...form, nota: val }); onClose(); }
    catch (err) { setError(err.response?.data?.error || 'Error al guardar'); }
    finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}
      title={`${editingNota ? 'Editar' : 'Agregar'} Nota — ${studentName}`}>
      <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">Título *</label>
          <input value={form.titulo} onChange={e => set('titulo', e.target.value)} required
            placeholder="Ej: Examen 1, Tarea 3..."
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D52A0]/20 focus:border-[#3D52A0]"/>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">Nota (0-100) *</label>
          <input type="number" min="0" max="100" value={form.nota}
            onChange={e => set('nota', e.target.value)} required placeholder="85"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D52A0]/20 focus:border-[#3D52A0]"/>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">Descripción</label>
          <textarea value={form.descripcion} onChange={e => set('descripcion', e.target.value)}
            rows={2} placeholder="Comentario opcional..."
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D52A0]/20 focus:border-[#3D52A0] resize-none"/>
        </div>
        {error && <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
        <div className="flex justify-end gap-3 pt-1">
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg">
            Cancelar
          </button>
          <button type="submit" disabled={loading}
            className="px-4 py-2 text-sm text-white bg-[#3D52A0] hover:bg-[#2D3F8A] rounded-lg disabled:opacity-60 flex items-center gap-2">
            {loading && <Spinner/>}{editingNota ? 'Guardar' : 'Agregar'}
          </button>
        </div>
      </form>
    </Modal>
  );
};