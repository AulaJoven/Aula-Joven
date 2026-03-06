// src/pages/admin/CalendarioTab.jsx
import { useState } from 'react';
import api from '../../services/api';
import { Calendario } from '../../components/admin/Calendario';
import { EventoModal } from '../../components/admin/modals/EventoModal';
import { DeleteModal } from '../../components/admin/modals/DeleteModal';
import { Spinner } from '../../components/ui/Spinner';

const SparkleIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
  </svg>
);

export const CalendarioTab = ({
  eventos, onEventosChange,
  evModal, setEvModal,
  editingEv, setEditingEv,
  delEv, setDelEv,
  onSave, onConfirmDelete,
}) => {
  const [seeding,    setSeeding]    = useState(false);
  const [seedMsg,    setSeedMsg]    = useState('');
  const [seedError,  setSeedError]  = useState('');

  const openAdd  = ()  => { setEditingEv(null); setEvModal(true); };
  const openEdit = ev  => { setEditingEv(ev);   setEvModal(true); };
  const openDel  = ev  => {
    setEvModal(false);
    setDelEv({ open: true, ev, loading: false });
  };

  const handleSeed = async () => {
    setSeeding(true); setSeedMsg(''); setSeedError('');
    try {
      const res = await api.post('/admin/eventos/seed');
      setSeedMsg(res.data.message);
      if (onEventosChange) onEventosChange();
    } catch (err) {
      setSeedError(err.response?.data?.error || 'Error al generar feriados');
    } finally {
      setSeeding(false);
    }
  };

  const año = new Date().getFullYear();

  return (
    <>
      {/* Banner seed */}
      <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-700">Feriados y eventos nacionales {año}</p>
          <p className="text-xs text-slate-400">Genera automáticamente feriados de Costa Rica y eventos académicos del año.</p>
          {seedMsg   && <p className="text-xs text-emerald-600 mt-1">✓ {seedMsg}</p>}
          {seedError && <p className="text-xs text-red-500 mt-1">✗ {seedError}</p>}
        </div>
        <button onClick={handleSeed} disabled={seeding}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-60 shrink-0 transition-colors">
          {seeding ? <Spinner/> : <SparkleIcon/>}
          {seeding ? 'Generando...' : `Generar ${año}`}
        </button>
      </div>

      <Calendario eventos={eventos} onAdd={openAdd} onEdit={openEdit}/>

      <EventoModal
        isOpen={evModal} onClose={() => setEvModal(false)}
        onSave={onSave} onDelete={openDel} editingEvento={editingEv}
      />
      <DeleteModal
        isOpen={delEv.open}
        onClose={() => setDelEv({ open: false, ev: null, loading: false })}
        onConfirm={onConfirmDelete}
        nombre={delEv.ev?.titulo}
        loading={delEv.loading}
      />
    </>
  );
};