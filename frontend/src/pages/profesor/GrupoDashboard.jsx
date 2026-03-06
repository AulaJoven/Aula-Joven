// src/pages/profesor/GrupoDashboard.jsx
import { useState } from 'react';
import { EstudiantesTab } from './grupo/EstudiantesTab';
import { ActividadesTab } from './grupo/ActividadesTab';
import { MaterialTab }    from './grupo/MaterialTab';
import { CalendarioTab } from './grupo/CalendarioTab';

const UsersIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a4 4 0 00-5-3.5M9 20H4v-2a4 4 0 015-3.5M15 7a4 4 0 11-8 0 4 4 0 018 0z"/>
  </svg>
);
const CalIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
  </svg>
);
const BookIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
  </svg>
);
const ActivityIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
  </svg>
);

const TABS = [
  { id: 'estudiantes', label: 'Estudiantes', Icon: UsersIcon    },
  { id: 'actividades', label: 'Actividades', Icon: ActivityIcon },
  { id: 'material',    label: 'Material',    Icon: BookIcon     },
  { id: 'calendario',  label: 'Calendario',  Icon: CalIcon      },
];

const MATERIA_COLORS = {
  'biologia':    'from-emerald-600 to-emerald-500',
  'biología':    'from-emerald-600 to-emerald-500',
  'matematicas': 'from-blue-600 to-blue-500',
  'matemáticas': 'from-blue-600 to-blue-500',
  'español':     'from-orange-600 to-orange-500',
  'historia':    'from-amber-600 to-amber-500',
  'fisica':      'from-violet-600 to-violet-500',
  'física':      'from-violet-600 to-violet-500',
  'quimica':     'from-pink-600 to-pink-500',
  'química':     'from-pink-600 to-pink-500',
  'ingles':      'from-cyan-600 to-cyan-500',
  'inglés':      'from-cyan-600 to-cyan-500',
  'ciencias':    'from-teal-600 to-teal-500',
};

const getBannerColor = (materia) =>
  MATERIA_COLORS[materia?.toLowerCase()] || 'from-[#3D52A0] to-[#5B73C9]';

export const GrupoDashboard = ({ grupo }) => {
  const [activeTab, setActiveTab] = useState('estudiantes');
  const bannerGradient = getBannerColor(grupo.materia);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className={`bg-gradient-to-r ${bannerGradient} rounded-2xl p-6 text-white`}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/70 text-xs font-medium uppercase tracking-wider mb-1">{grupo.materia}</p>
            <h2 className="text-2xl font-bold">{grupo.nombre}</h2>
            <p className="text-white/80 text-sm mt-1">{grupo.grado}° grado</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono font-bold bg-white/20 px-3 py-1.5 rounded-full">{grupo.codigo}</span>
            <div className="flex gap-4 mt-4">
              <div className="text-center">
                <p className="text-xl font-bold">{grupo.totalEstudiantes}</p>
                <p className="text-white/70 text-xs">Estudiantes</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold">{grupo.totalActividades}</p>
                <p className="text-white/70 text-xs">Actividades</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1">
        {TABS.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all
              ${activeTab === id ? 'bg-[#3D52A0] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
            <Icon/><span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Contenido */}
      {activeTab === 'estudiantes' && <EstudiantesTab grupo={grupo}/>}
      {activeTab === 'actividades' && <ActividadesTab grupo={grupo}/>}
      {activeTab === 'material'    && <MaterialTab    grupo={grupo}/>}
      {activeTab === 'calendario' && <CalendarioTab grupo={grupo}/>}
    </div>
  );
};