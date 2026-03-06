// src/pages/estudiante/tabs/MateriasTab.jsx
import { MateriaCard } from '../../../components/estudiante/MateriaCard';

export const MateriasTab = ({ materias, materiaActiva, onSelect, onVerHistorial }) => (
  <div>
    <h2 className="text-lg font-bold text-slate-800 mb-4">Mis Materias</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {materias.map(m => (
        <MateriaCard key={m.id} materia={m}
          selected={materiaActiva?.id === m.id}
          onSelect={onSelect}
          onVerHistorial={onVerHistorial}/>
      ))}
    </div>
  </div>
);