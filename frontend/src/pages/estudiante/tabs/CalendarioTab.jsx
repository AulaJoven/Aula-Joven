// src/pages/estudiante/tabs/CalendarioTab.jsx
import { CalendarioView } from '../../../components/estudiante/CalendarioView';

const Spinner = () => (
  <div className="flex justify-center py-12">
    <div className="w-7 h-7 border-4 border-[#3D52A0] border-t-transparent rounded-full animate-spin"/>
  </div>
);

export const CalendarioTab = ({ eventos, loading, materiaActiva }) => (
  <div>
    <h2 className="text-lg font-bold text-slate-800 mb-1">Calendario</h2>
    <p className="text-sm text-slate-400 mb-4">{materiaActiva?.materia} — {materiaActiva?.nombre}</p>
    {loading ? <Spinner/> : <CalendarioView eventos={eventos}/>}
  </div>
);