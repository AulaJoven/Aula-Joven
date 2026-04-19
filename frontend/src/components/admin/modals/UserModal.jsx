// src/components/admin/modals/UserModal.jsx
import { useState, useEffect } from 'react';
import { Modal } from '../../ui/Modal';
import { Spinner } from '../../ui/Spinner';
import api from '../../../services/api'; // ajusta el path si es diferente

export const UserModal = ({ isOpen, onClose, onSave, editingUser, rol }) => {
  const [form,    setForm]    = useState({ nombre: '', apellidos: '', email: '', cedula: '', grado: '' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [emailStatus, setEmailStatus] = useState(null); // 'sent' | 'error' | null
  const [emailLoading, setEmailLoading] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    setForm(editingUser
      ? { nombre: editingUser.nombre, apellidos: editingUser.apellidos, email: editingUser.email, cedula: editingUser.cedula || '', grado: editingUser.grado || '' }
      : { nombre: '', apellidos: '', email: '', cedula: '', grado: '' });
    setError('');
    setEmailStatus(null); // resetear al abrir
  }, [editingUser, isOpen]);

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await onSave({ ...form, rol }); onClose(); }
    catch (err) { setError(err.response?.data?.error || 'Error al guardar'); }
    finally { setLoading(false); }
  };

  const handleResendEmail = async () => {
    setEmailLoading(true); setEmailStatus(null);
    try {
      await api.post(`/admin/users/${editingUser.id}/resend-email`);
      setEmailStatus('sent');
    } catch {
      setEmailStatus('error');
    } finally {
      setEmailLoading(false);
    }
  };

  const isEst = rol === 'estudiante';
  const label = isEst ? 'Estudiante' : 'Profesor';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${editingUser ? 'Editar' : 'Agregar'} ${label}`}>
      <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

        <div className="grid grid-cols-2 gap-3">
          {[['nombre', 'Nombre'], ['apellidos', 'Apellidos']].map(([k, l]) => (
            <div key={k}>
              <label className="text-xs font-medium text-slate-600 mb-1 block">{l} *</label>
              <input value={form[k]} onChange={e => set(k, e.target.value)} required placeholder={l}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D52A0]/20 focus:border-[#3D52A0]"/>
            </div>
          ))}
        </div>

        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">
            Cédula <span className="text-slate-400 font-normal">(opcional)</span>
          </label>
          <input value={form.cedula} onChange={e => set('cedula', e.target.value)} placeholder="Ej: 112345678"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D52A0]/20 focus:border-[#3D52A0]"/>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">Correo *</label>
          <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
            required disabled={!!editingUser} placeholder="correo@ejemplo.com"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D52A0]/20 focus:border-[#3D52A0] disabled:bg-slate-50 disabled:text-slate-400"/>
        </div>

        {isEst && (
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Grado *</label>
            <select value={form.grado} onChange={e => set('grado', e.target.value)} required
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D52A0]/20 focus:border-[#3D52A0]">
              <option value="">Seleccionar grado</option>
              {[7, 8, 9, 10, 11, 12].map(g => <option key={g} value={g}>{g}°</option>)}
            </select>
          </div>
        )}

        {/* Botón reenviar — solo en modo edición */}
        {editingUser && (
          <div className="border border-slate-200 rounded-lg px-4 py-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-700">Correo de bienvenida</p>
              <p className="text-xs text-slate-400">Genera una nueva contraseña temporal y la envía al estudiante.</p>
            </div>
            <button type="button" onClick={handleResendEmail} disabled={emailLoading}
              className="shrink-0 flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[#3D52A0] border border-[#3D52A0] rounded-lg hover:bg-[#EEF2FF] disabled:opacity-60 transition-colors">
              {emailLoading ? <Spinner /> : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              )}
              Reenviar
            </button>
          </div>
        )}

        {emailStatus === 'sent' && (
          <p className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
            Correo enviado correctamente.
          </p>
        )}
        {emailStatus === 'error' && (
          <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            No se pudo enviar el correo. Intenta de nuevo.
          </p>
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
            {loading && <Spinner />}{editingUser ? 'Guardar' : 'Crear'}
          </button>
        </div>
      </form>
    </Modal>
  );
};