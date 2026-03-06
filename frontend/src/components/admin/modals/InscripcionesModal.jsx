// src/components/admin/InscripcionesModal.jsx
import { useState, useEffect } from 'react';
import { Modal } from '../../ui/Modal';
import { Avatar } from '../../ui/Avatar';
import { Spinner } from '../../ui/Spinner';
import { TrashIcon, PlusIcon } from '../../ui/Icons';
import api from '../../../services/api';

export const InscripcionesModal = ({ isOpen, onClose, grupo, todosEstudiantes }) => {
  const [inscritos,  setInscritos]  = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [addId,      setAddId]      = useState('');
  const [error,      setError]      = useState('');
  const [delConfirm, setDelConfirm] = useState(null);

  useEffect(() => {
    if (isOpen && grupo) fetchInscritos();
    else { setInscritos([]); setAddId(''); setError(''); setDelConfirm(null); }
  }, [isOpen, grupo]);

  const fetchInscritos = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/grupos/${grupo.id}/estudiantes`);
      setInscritos(res.data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleAdd = async () => {
    if (!addId) return;
    setError('');
    try {
      await api.post(`/admin/grupos/${grupo.id}/estudiantes`, { estudiante_id: addId });
      setAddId('');
      await fetchInscritos();
    } catch (e) {
      setError(e.response?.data?.error || 'Error al inscribir');
    }
  };

  const handleRemove = async () => {
    try {
      await api.delete(`/admin/grupos/${grupo.id}/estudiantes/${delConfirm.id}`);
      setDelConfirm(null);
      await fetchInscritos();
    } catch (e) { console.error(e); }
  };

  const disponibles = todosEstudiantes.filter(e => !inscritos.find(i => i.id === e.id));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Estudiantes — ${grupo?.nombre || ''}`} maxW="max-w-lg">
      <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">

        {/* Agregar */}
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1.5 block">Agregar estudiante al grupo</label>
          <div className="flex gap-2">
            <select value={addId} onChange={e => { setAddId(e.target.value); setError(''); }}
              className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D52A0]/20 focus:border-[#3D52A0]">
              <option value="">Seleccionar estudiante</option>
              {disponibles.map(e => (
                <option key={e.id} value={e.id}>{e.nombre} {e.apellidos} — {e.grado}°</option>
              ))}
            </select>
            <button onClick={handleAdd} disabled={!addId}
              className="px-4 py-2 bg-[#3D52A0] hover:bg-[#2D3F8A] text-white text-sm font-medium rounded-lg disabled:opacity-40 transition-colors">
              <PlusIcon/>
            </button>
          </div>
          {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
          {disponibles.length === 0 && !loading && (
            <p className="text-xs text-slate-400 mt-1.5">Todos los estudiantes ya están inscritos.</p>
          )}
        </div>

        {/* Lista inscritos */}
        <div>
          <p className="text-xs font-medium text-slate-600 mb-2">
            Inscritos ({loading ? '…' : inscritos.length})
          </p>
          {loading ? (
            <div className="flex justify-center py-6"><Spinner cls="w-6 h-6 text-[#3D52A0]"/></div>
          ) : inscritos.length === 0 ? (
            <div className="bg-slate-50 rounded-xl p-6 text-center">
              <p className="text-sm text-slate-400">No hay estudiantes inscritos aún.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {inscritos.map(e => (
                <div key={e.id} className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2.5">
                  <div className="flex items-center gap-3">
                    <Avatar nombre={e.nombre} apellidos={e.apellidos}/>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{e.nombre} {e.apellidos}</p>
                      <p className="text-xs text-slate-400">{e.grado}° grado · {e.email}</p>
                    </div>
                  </div>
                  {delConfirm?.id === e.id ? (
                    <div className="flex gap-1.5">
                      <button onClick={handleRemove}
                        className="px-2.5 py-1 text-xs bg-red-500 text-white rounded-lg font-medium">
                        Quitar
                      </button>
                      <button onClick={() => setDelConfirm(null)}
                        className="px-2.5 py-1 text-xs bg-slate-200 text-slate-600 rounded-lg">
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setDelConfirm(e)}
                      className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
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