import { Avatar } from '../ui/Avatar';
import { EditIcon, TrashIcon } from '../ui/Icons';

export const EstudianteCard = ({ user, onEdit, onDelete }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Avatar nombre={user.nombre} apellidos={user.apellidos}/>
        <div>
          <p className="text-sm font-semibold text-slate-800">{user.nombre} {user.apellidos}</p>
          {user.grado && <p className="text-xs text-slate-400">{user.grado}° grado</p>}
        </div>
      </div>
      <div className="flex gap-1">
        <button onClick={() => onEdit(user)} className="p-2 text-[#3D52A0] hover:bg-blue-50 rounded-lg transition-colors"><EditIcon/></button>
        <button onClick={() => onDelete(user)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><TrashIcon/></button>
      </div>
    </div>
  </div>
);