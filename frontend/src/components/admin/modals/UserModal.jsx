// src/components/admin/modals/UserModal.jsx
import { useState, useEffect } from 'react';
import { Modal } from '../../ui/Modal';
import { Spinner } from '../../ui/Spinner';

export const UserModal = ({ isOpen, onClose, onSave, editingUser, rol }) => {
  const [form,    setForm]    = useState({ nombre: '', apellidos: '', email: '', cedula: '', grado: '' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    setForm(editingUser
      ? {
          nombre:    editingUser.nombre,
          apellidos: editingUser.apellidos,
          email:     editingUser.email,
          cedula:    editingUser.cedula || '',
          grado:     editingUser.grado  || '',
        }
      : { nombre: '', apellidos: '', email: '', cedula: '', grado: '' });
    setError('');
  }, [editingUser, isOpen]);

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await onSave({ ...form, rol }); onClose(); }
    catch (err) { setError(err.response?.data?.error || 'Error al guardar'); }
    finally { setLoading(false); }
  };

  const isEst = rol === 'estudiante';
  const label = isEst ? 'Estudiante' : 'Profesor';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${editingUser ? 'Editar' : 'Agregar'} ${label}`}>
      <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

        {/* Nombre y apellidos */}
        <div className="grid grid-cols-2 gap-3">
          {[['nombre', 'Nombre'], ['apellidos', 'Apellidos']].map(([k, l]) => (
            <div key={k}>
              <label className="text-xs font-medium text-slate-600 mb-1 block">{l} *</label>
              <input value={form[k]} onChange={e => set(k, e.target.value)} required placeholder={l}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D52A0]/20 focus:border-[#3D52A0]"/>
            </div>
          ))}
        </div>

        {/* Cédula — opcional para ambos roles */}
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">
            Cédula <span className="text-slate-400 font-normal">(opcional)</span>
          </label>
          <input
            value={form.cedula}
            onChange={e => set('cedula', e.target.value)}
            placeholder="Ej: 112345678"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D52A0]/20 focus:border-[#3D52A0]"/>
        </div>

        {/* Correo */}
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">Correo *</label>
          <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
            required disabled={!!editingUser} placeholder="correo@ejemplo.com"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D52A0]/20 focus:border-[#3D52A0] disabled:bg-slate-50 disabled:text-slate-400"/>
        </div>

        {/* Grado — solo estudiantes */}
        {isEst && (
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Grado *</label>
            <select value={form.grado} onChange={e => set('grado', e.target.value)} required
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D52A0]/20 focus:border-[#3D52A0]">
              <option value="">Seleccionar grado</option>
              {[7, 8, 9, 10, 11].map(g => <option key={g} value={g}>{g}°</option>)}
            </select>
          </div>
        )}

        {error && (
          <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex justify-end gap-3 pt-1">
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg">
            Cancelar
          </button>
          <button type="submit" disabled={loading}
            className="px-4 py-2 text-sm text-white bg-[#3D52A0] hover:bg-[#2D3F8A] rounded-lg disabled:opacity-60 flex items-center gap-2">
            {loading && <Spinner/>}{editingUser ? 'Guardar' : 'Crear'}
          </button>
        </div>
      </form>
    </Modal>
  );
};