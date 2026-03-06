// src/components/profesor/GrupoCard.jsx

const MATERIA_COLORS = {
  'biologia':     { bg: 'bg-emerald-50', accent: 'bg-emerald-500', text: 'text-emerald-700', border: 'border-emerald-200' },
  'matematicas':  { bg: 'bg-blue-50',    accent: 'bg-blue-500',    text: 'text-blue-700',    border: 'border-blue-200'    },
  'matemáticas':  { bg: 'bg-blue-50',    accent: 'bg-blue-500',    text: 'text-blue-700',    border: 'border-blue-200'    },
  'español':      { bg: 'bg-orange-50',  accent: 'bg-orange-500',  text: 'text-orange-700',  border: 'border-orange-200'  },
  'historia':     { bg: 'bg-amber-50',   accent: 'bg-amber-500',   text: 'text-amber-700',   border: 'border-amber-200'   },
  'física':       { bg: 'bg-violet-50',  accent: 'bg-violet-500',  text: 'text-violet-700',  border: 'border-violet-200'  },
  'fisica':       { bg: 'bg-violet-50',  accent: 'bg-violet-500',  text: 'text-violet-700',  border: 'border-violet-200'  },
  'química':      { bg: 'bg-pink-50',    accent: 'bg-pink-500',    text: 'text-pink-700',    border: 'border-pink-200'    },
  'quimica':      { bg: 'bg-pink-50',    accent: 'bg-pink-500',    text: 'text-pink-700',    border: 'border-pink-200'    },
  'ingles':       { bg: 'bg-cyan-50',    accent: 'bg-cyan-500',    text: 'text-cyan-700',    border: 'border-cyan-200'    },
  'inglés':       { bg: 'bg-cyan-50',    accent: 'bg-cyan-500',    text: 'text-cyan-700',    border: 'border-cyan-200'    },
};

const getColor = (materia) =>
  MATERIA_COLORS[materia?.toLowerCase()] || { bg: 'bg-slate-50', accent: 'bg-[#3D52A0]', text: 'text-[#3D52A0]', border: 'border-slate-200' };

const UsersIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a4 4 0 00-5-3.5M9 20H4v-2a4 4 0 015-3.5M15 7a4 4 0 11-8 0 4 4 0 018 0zM21 20v-2a4 4 0 00-3-3.87M3 20v-2a4 4 0 013-3.87"/>
  </svg>
);

const CalIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
  </svg>
);

const ArrowIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
  </svg>
);

export const GrupoCard = ({ grupo, onClick }) => {
  const color = getColor(grupo.materia);

  return (
    <button
      onClick={() => onClick(grupo)}
      className={`group w-full text-left ${color.bg} border ${color.border} rounded-2xl p-5 
        hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className={`w-2 h-10 rounded-full ${color.accent} shrink-0`}/>
        <div className="flex-1 ml-3">
          <p className="text-base font-bold text-slate-800 leading-tight">{grupo.nombre}</p>
          <p className={`text-xs font-medium mt-0.5 ${color.text}`}>{grupo.materia}</p>
        </div>
        <span className="text-xs font-semibold bg-white/80 text-slate-500 px-2.5 py-1 rounded-full border border-white shadow-sm">
          {grupo.grado}°
        </span>
      </div>

      {/* Código */}
      <div className="mb-4">
        <span className={`text-xs font-mono font-bold ${color.text} bg-white/60 px-2 py-0.5 rounded`}>
          {grupo.codigo}
        </span>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 pt-3 border-t border-white/60">
        <div className="flex items-center gap-1.5 text-slate-500">
          <UsersIcon/>
          <span className="text-xs font-medium">{grupo.totalEstudiantes} estudiantes</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-500">
          <CalIcon/>
          <span className="text-xs font-medium">{grupo.totalActividades} actividades</span>
        </div>
        <div className={`ml-auto ${color.text} opacity-0 group-hover:opacity-100 transition-opacity`}>
          <ArrowIcon/>
        </div>
      </div>
    </button>
  );
};