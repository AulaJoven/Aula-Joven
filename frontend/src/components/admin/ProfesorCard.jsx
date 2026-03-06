import { Avatar } from '../ui/Avatar';
import { EditIcon, TrashIcon } from '../ui/Icons';

export const ProfesorCard = ({ user, onEdit, onDelete }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow">
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <Avatar nombre={user.nombre} apellidos={user.apellidos} size="lg"/>
        <div>
          <p className="text-sm font-semibold text-slate-800">{user.nombre} {user.apellidos}</p>
          <p className="text-xs text-[#3D52A0]">{user.email}</p>
        </div>
      </div>
      <div className="flex gap-1">
        <button onClick={() => onEdit(user)} className="p-2 text-[#3D52A0] hover:bg-blue-50 rounded-lg transition-colors"><EditIcon/></button>
        <button onClick={() => onDelete(user)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><TrashIcon/></button>
      </div>
    </div>
    <div className="mt-3 pt-3 border-t border-slate-100">
      <p className="text-xs text-slate-400 mb-2">Materias Asignadas</p>
      <div className="flex flex-wrap gap-1.5">
        {user.materias?.length > 0
          ? user.materias.map((m, i) => (
              <span key={i} className="text-xs bg-[#EEF2FF] text-[#3D52A0] px-2.5 py-1 rounded-full">{m}</span>
            ))
          : <span className="text-xs text-slate-300 italic">Sin materias asignadas</span>
        }
      </div>
    </div>
  </div>
);