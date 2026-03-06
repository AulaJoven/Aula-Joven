// src/components/admin/modals/AsistenciaModal.jsx
import { useState, useEffect } from 'react';
import { Modal } from '../../ui/Modal';
import { Avatar } from '../../ui/Avatar';
import { Spinner } from '../../ui/Spinner';
import { AsistenciaEstudianteModal } from './AsistenciaEstudianteModal';
import api from '../../../services/api';

const CalIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
  </svg>
);

export const AsistenciaModal = ({ isOpen, onClose, grupo }) => {
  const [estudiantes,  setEstudiantes]  = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const [selected,     setSelected]     = useState(null); // estudiante seleccionado

  useEffect(() => {
    if (isOpen && grupo) fetchEstudiantes();
    else { setEstudiantes([]); setError(''); setSelected(null); }
  }, [isOpen, grupo]);

  const fetchEstudiantes = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/grupos/${grupo.id}/estudiantes`);
      setEstudiantes(res.data.data || []);
    } catch { setError('Error al cargar estudiantes'); }
    finally { setLoading(false); }
  };

  return (
    <>
      <Modal isOpen={isOpen && !selected} onClose={onClose}
        title={`Asistencia — ${grupo?.nombre || ''}`} maxW="max-w-lg">
        <div className="px-6 py-5 space-y-3 max-h-[70vh] overflow-y-auto">

          <p className="text-xs text-slate-400">
            Selecciona un estudiante para registrar o ver su asistencia.
          </p>

          {loading ? (
            <div className="flex justify-center py-10"><Spinner cls="w-7 h-7 text-[#3D52A0]"/></div>
          ) : error ? (
            <p className="text-sm text-red-500 text-center py-6">{error}</p>
          ) : estudiantes.length === 0 ? (
            <div className="bg-slate-50 rounded-xl p-8 text-center">
              <p className="text-sm text-slate-400">No hay estudiantes inscritos en este grupo.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {estudiantes.map(e => (
                <button key={e.id} onClick={() => setSelected(e)}
                  className="w-full flex items-center justify-between bg-slate-50 hover:bg-[#EEF2FF] border border-transparent hover:border-[#3D52A0]/20 rounded-xl px-4 py-3 transition-colors group">
                  <div className="flex items-center gap-3">
                    <Avatar nombre={e.nombre} apellidos={e.apellidos}/>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-slate-800">{e.nombre} {e.apellidos}</p>
                      <p className="text-xs text-slate-400">{e.grado}° grado · {e.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#3D52A0] opacity-0 group-hover:opacity-100 transition-opacity">
                    <CalIcon/>
                    <span className="text-xs font-medium">Ver asistencia</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </Modal>

      <AsistenciaEstudianteModal
        isOpen={!!selected}
        onClose={onClose}
        onBack={() => setSelected(null)}
        estudiante={selected}
        grupoId={grupo?.id}
      />
    </>
  );
};