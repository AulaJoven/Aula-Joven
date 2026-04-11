import { useState, useEffect } from 'react';
import { Modal } from '../../ui/Modal';
import { Spinner } from '../../ui/Spinner';

export const GrupoModal = ({ isOpen, onClose, onSave, editingGrupo, profesores }) => {
  const [form, setForm]       = useState({ nombre: '', materia: '', grado: '', codigo: '', profesor_id: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    setForm(editingGrupo ? {
      nombre:      editingGrupo.nombre,
      materia:     editingGrupo.materia,
      grado:       editingGrupo.grado,
      codigo:      editingGrupo.codigo,
      profesor_id: editingGrupo.profesor_id || '',
    } : { nombre: '', materia: '', grado: '', codigo: '', profesor_id: '' });
    setError('');
  }, [editingGrupo, isOpen]);

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await onSave(form); onClose(); }
    catch (err) { setError(err.response?.data?.error || 'Error al guardar'); }
    finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingGrupo ? 'Editar Grupo' : 'Crear Grupo'}>
      <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Nombre *</label>
            <input value={form.nombre} onChange={e => set('nombre', e.target.value)} required placeholder="Ej: 7-A"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D52A0]/20 focus:border-[#3D52A0]"/>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Código *</label>
            <input value={form.codigo} onChange={e => set('codigo', e.target.value.toUpperCase())} required placeholder="Ej: MAT-7A"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D52A0]/20 focus:border-[#3D52A0]"/>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">Materia *</label>
          <input value={form.materia} onChange={e => set('materia', e.target.value)} required placeholder="Ej: Matemáticas"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D52A0]/20 focus:border-[#3D52A0]"/>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Grado *</label>
            <select value={form.grado} onChange={e => set('grado', e.target.value)} required
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D52A0]/20 focus:border-[#3D52A0]">
              <option value="">Seleccionar</option>
              {[7,8,9,10,11, 12].map(g => <option key={g} value={g}>{g}°</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Profesor *</label>
            <select value={form.profesor_id} onChange={e => set('profesor_id', e.target.value)} required
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D52A0]/20 focus:border-[#3D52A0]">
              <option value="">Seleccionar</option>
              {profesores.map(p => (
                <option key={p.id} value={p.id}>{p.nombre} {p.apellidos}</option>
              ))}
            </select>
          </div>
        </div>
        {error && <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
        <div className="flex justify-end gap-3 pt-1">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg">Cancelar</button>
          <button type="submit" disabled={loading} className="px-4 py-2 text-sm text-white bg-[#3D52A0] hover:bg-[#2D3F8A] rounded-lg disabled:opacity-60 flex items-center gap-2">
            {loading && <Spinner/>}{editingGrupo ? 'Guardar' : 'Crear'}
          </button>
        </div>
      </form>
    </Modal>
  );
};