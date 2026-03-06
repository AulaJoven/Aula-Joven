// src/pages/profesor/grupo/CalendarioTab.jsx
import { useState, useEffect } from 'react';
import api from '../../../services/api';
import { Calendario } from '../../../components/admin/Calendario';
import { Spinner } from '../../../components/ui/Spinner';
import { EventoModal } from '../../../components/profesor/modals/EventoModal';
import { ConfirmDeleteModal } from '../../../components/profesor/modals/ConfirmDeleteModal';

export const CalendarioTab = ({ grupo }) => {
  const [eventos,    setEventos]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [evModal,    setEvModal]    = useState(false);
  const [delModal,   setDelModal]   = useState(false);
  const [selectedEv, setSelectedEv] = useState(null);
  const [delLoading, setDelLoading] = useState(false);

  useEffect(() => { fetchEventos(); }, [grupo.id]);

  const fetchEventos = async () => {
    setLoading(true); setError('');
    try {
      const res = await api.get(`/profesor/grupos/${grupo.id}/eventos`);
      setEventos(res.data.data || []);
    } catch { setError('No se pudieron cargar los eventos.'); }
    finally  { setLoading(false); }
  };

  const handleSave = async (data) => {
    await api.post(`/profesor/grupos/${grupo.id}/eventos`, data);
    fetchEventos();
  };

  const handleClickEvento = (ev) => { setSelectedEv(ev); setDelModal(true); };

  const handleDelete = async () => {
    if (!selectedEv || selectedEv.group_id === null) return;
    setDelLoading(true);
    try {
      await api.delete(`/profesor/grupos/${grupo.id}/eventos/${selectedEv.id}`);
      setDelModal(false); setSelectedEv(null); fetchEventos();
    } catch { /* silently fail */ }
    finally { setDelLoading(false); }
  };

  if (loading) return <div className="flex justify-center py-16"><Spinner cls="w-8 h-8 text-[#3D52A0]"/></div>;
  if (error)   return (
    <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center">
      <p className="text-sm text-red-500 mb-2">{error}</p>
      <button onClick={fetchEventos} className="text-xs text-red-400 hover:text-red-600 underline">Reintentar</button>
    </div>
  );

  return (
    <>
      <Calendario
        eventos={eventos}
        onAdd={() => setEvModal(true)}
        onEdit={handleClickEvento}
        addLabel="Agregar Evento"
        titulo={`Calendario — ${grupo.nombre}`}
        subtitulo="Eventos del grupo e institucionales"
      />
      <EventoModal isOpen={evModal} onClose={() => setEvModal(false)} onSave={handleSave}/>
      <ConfirmDeleteModal
        isOpen={delModal} onClose={() => { setDelModal(false); setSelectedEv(null); }}
        onConfirm={handleDelete} evento={selectedEv} loading={delLoading}
      />
    </>
  );
};