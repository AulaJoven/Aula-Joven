// src/components/estudiante/CalendarioView.jsx
import { useState } from 'react';

const MESES       = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const DIAS_HEADER = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
const TIPO_COLOR  = {
  actividad: 'bg-[#EEF2FF] text-[#3D52A0]',
  examen:    'bg-red-100 text-red-700',
  tarea:     'bg-amber-100 text-amber-700',
  evento:    'bg-emerald-100 text-emerald-700',
};

export const CalendarioView = ({ eventos }) => {
  const hoy = new Date();
  const [year,  setYear]  = useState(hoy.getFullYear());
  const [month, setMonth] = useState(hoy.getMonth());

  const prev = () => month === 0  ? (setMonth(11), setYear(y => y - 1)) : setMonth(m => m - 1);
  const next = () => month === 11 ? (setMonth(0),  setYear(y => y + 1)) : setMonth(m => m + 1);

  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const byDay = {};
  (eventos || []).forEach(ev => {
    const [y, m, d] = ev.fecha.split('-').map(Number);
    if (y === year && m - 1 === month) {
      if (!byDay[d]) byDay[d] = [];
      byDay[d].push(ev);
    }
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <button onClick={prev} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
        </button>
        <p className="text-sm font-semibold text-slate-800">{MESES[month]} {year}</p>
        <button onClick={next} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
        </button>
      </div>
      <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-100">
        {DIAS_HEADER.map(d => <div key={d} className="py-2 text-center text-xs font-medium text-slate-400">{d}</div>)}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          const isToday = day && day === hoy.getDate() && month === hoy.getMonth() && year === hoy.getFullYear();
          const evs = day ? (byDay[day] || []) : [];
          return (
            <div key={i} className={`min-h-[72px] p-1.5 border-b border-r border-slate-100 ${!day ? 'bg-slate-50/60' : ''}`}>
              {day && (
                <>
                  <span className={`text-xs font-medium w-6 h-6 rounded-full flex items-center justify-center mb-1
                    ${isToday ? 'bg-[#3D52A0] text-white' : 'text-slate-500'}`}>{day}</span>
                  <div className="space-y-0.5">
                    {evs.slice(0, 2).map(ev => (
                      <div key={ev.id} className={`text-[10px] px-1.5 py-0.5 rounded truncate
                        ${ev.importante ? 'bg-red-600 text-white font-semibold' : (TIPO_COLOR[ev.tipo] || TIPO_COLOR.evento)}`}>
                        {ev.titulo}
                      </div>
                    ))}
                    {evs.length > 2 && <p className="text-[10px] text-slate-400 pl-1">+{evs.length - 2} más</p>}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};