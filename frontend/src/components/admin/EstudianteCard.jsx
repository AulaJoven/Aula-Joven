import { Avatar } from '../ui/Avatar';
import { EditIcon, TrashIcon } from '../ui/Icons';

export const EstudianteCard = ({ user, onEdit, onDelete }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Avatar nombre={user.nombre} apellidos={user.apellidos}/>
        <div>
          <p className="text-sm font-semibold text-slate-800">{user.nombre} {user.apellidos}</p>
          <div className="flex items-center gap-2 mt-0.5">
            {user.grado && <p className="text-xs text-slate-400">{user.grado}° grado</p>}
            {user.grado && !user.email_sent && (
              <span className="text-slate-300">·</span>
            )}
            <span className={`flex items-center gap-1 text-xs font-medium ${user.email_sent ? 'text-emerald-500' : 'text-amber-500'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${user.email_sent ? 'bg-emerald-400' : 'bg-amber-400'}`}/>
              {user.email_sent ? 'Correo enviado' : 'Sin correo'}
            </span>
          </div>
        </div>
      </div>
      <div className="flex gap-1">
        <button onClick={() => onEdit(user)} className="p-2 text-[#3D52A0] hover:bg-blue-50 rounded-lg transition-colors"><EditIcon/></button>
        <button onClick={() => onDelete(user)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><TrashIcon/></button>
      </div>
    </div>
  </div>
);