// src/components/estudiante/MateriaCard.jsx

const promedioColor = (p) => {
  if (p === null || p === undefined) return { bar: 'bg-white/30', text: 'text-slate-400' };
  if (p >= 80) return { bar: 'bg-emerald-400', text: 'text-emerald-600' };
  if (p >= 65) return { bar: 'bg-amber-400',   text: 'text-amber-600'  };
  return           { bar: 'bg-red-400',         text: 'text-red-500'   };
};

export const MateriaCard = ({ materia, onSelect, selected, onVerHistorial }) => {
  const { bar, text } = promedioColor(materia.promedio);
  return (
    <div className={`bg-white rounded-xl border-2 p-5 transition-all hover:shadow-md
      ${selected ? 'border-[#3D52A0] shadow-md' : 'border-slate-200 hover:border-slate-300'}`}>

      <div className="cursor-pointer" onClick={() => onSelect(materia)}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs font-semibold text-[#3D52A0] uppercase tracking-wide mb-0.5">{materia.materia}</p>
            <h3 className="text-sm font-bold text-slate-800">{materia.nombre}</h3>
            <p className="text-xs text-slate-400 mt-0.5">Prof. {materia.profesor}</p>
          </div>
          {materia.promedio !== null && (
            <span className={`text-lg font-bold ${text}`}>{materia.promedio}</span>
          )}
        </div>

        <div className="mb-3">
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${bar}`}
              style={{ width: materia.promedio !== null ? `${Math.min(materia.promedio, 100)}%` : '0%' }}/>
          </div>
          <p className={`text-xs mt-1 ${text}`}>
            {materia.promedio !== null ? `Promedio: ${materia.promedio}` : 'Sin notas aún'}
          </p>
        </div>

        {materia.notas?.length > 0 ? (
          <div className="space-y-1.5">
            {materia.notas.slice(0, 3).map(n => (
              <div key={n.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-1.5">
                <p className="text-xs text-slate-600 truncate flex-1">{n.titulo}</p>
                <span className={`text-xs font-bold ml-2 ${promedioColor(n.nota).text}`}>{n.nota}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-300 italic">Sin notas aún</p>
        )}
      </div>

      {materia.notas?.length > 0 && (
        <button onClick={() => onVerHistorial(materia)}
          className="mt-3 w-full py-1.5 text-xs font-semibold text-[#3D52A0] bg-[#EEF2FF] hover:bg-[#3D52A0] hover:text-white rounded-lg transition-colors">
          Ver historial completo ({materia.notas.length})
        </button>
      )}
    </div>
  );
};