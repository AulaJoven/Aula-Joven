// src/components/admin/GrupoCard.jsx
import { EditIcon, TrashIcon } from '../ui/Icons';

export const GrupoCard = ({ grupo, onEdit, onDelete, onVerEstudiantes, onAsistencia }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-semibold text-slate-800">{grupo.nombre}</p>
          <span className="text-xs bg-[#EEF2FF] text-[#3D52A0] px-2 py-0.5 rounded-full font-medium">{grupo.codigo}</span>
        </div>
        <p className="text-xs text-slate-500">{grupo.materia} · {grupo.grado}° grado</p>
        <p className="text-xs text-slate-400 mt-1">Profesor: {grupo.profesor}</p>
      </div>
      <div className="flex gap-1">
        <button onClick={() => onEdit(grupo)} className="p-2 text-[#3D52A0] hover:bg-blue-50 rounded-lg transition-colors"><EditIcon/></button>
        <button onClick={() => onDelete(grupo)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><TrashIcon/></button>
      </div>
    </div>
    <div className="mt-3 pt-3 border-t border-slate-100 flex gap-2">
      <button onClick={() => onVerEstudiantes(grupo)}
        className="flex-1 py-1.5 text-xs font-medium text-[#3D52A0] bg-[#EEF2FF] hover:bg-[#dde6ff] rounded-lg transition-colors">
        👥 Ver Estudiantes
      </button>
      <button onClick={() => onAsistencia(grupo)}
        className="flex-1 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors">
        📋 Asistencia
      </button>
    </div>
  </div>
);