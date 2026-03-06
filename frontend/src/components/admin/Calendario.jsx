// src/components/admin/Calendario.jsx
import { useState } from "react";
import { ChevronL, ChevronR, PlusIcon } from "../ui/Icons";

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export const TIPO_COLOR = {
  actividad: "bg-[#EEF2FF] text-[#3D52A0]",
  examen: "bg-red-100 text-red-700",
  tarea: "bg-amber-100 text-amber-700",
  evento: "bg-emerald-100 text-emerald-700",
};

export const Calendario = ({
  eventos,
  onAdd,
  onEdit,
  addLabel = "Agregar Evento",
  titulo = "Calendario General",
  subtitulo = "Gestiona los eventos y actividades del sistema",
}) => {
  const hoy = new Date();
  const [year, setYear] = useState(hoy.getFullYear());
  const [month, setMonth] = useState(hoy.getMonth());

  const prev = () =>
    month === 0
      ? (setMonth(11), setYear((y) => y - 1))
      : setMonth((m) => m - 1);
  const next = () =>
    month === 11
      ? (setMonth(0), setYear((y) => y + 1))
      : setMonth((m) => m + 1);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const byDay = {};
  (eventos || []).forEach((ev) => {
    const [y, m, d] = ev.fecha.split("-").map(Number);
    if (y === year && m - 1 === month) {
      if (!byDay[d]) byDay[d] = [];
      byDay[d].push(ev);
    }
  });

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">{titulo}</h1>
          <p className="text-sm text-slate-400 mt-0.5">{subtitulo}</p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#3D52A0] hover:bg-[#2D3F8A] text-white text-sm font-medium rounded-lg transition-colors"
        >
          <PlusIcon /> {addLabel}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <button
            onClick={prev}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <ChevronL />
          </button>
          <p className="text-sm font-semibold text-slate-800">
            {MESES[month]} {year}
          </p>
          <button
            onClick={next}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <ChevronR />
          </button>
        </div>

        <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-100">
          {DIAS.map((d) => (
            <div
              key={d}
              className="py-2 text-center text-xs font-medium text-slate-400"
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            const isToday =
              day &&
              day === hoy.getDate() &&
              month === hoy.getMonth() &&
              year === hoy.getFullYear();
            const evs = day ? byDay[day] || [] : [];
            return (
              <div
                key={i}
                className={`min-h-[76px] p-1.5 border-b border-r border-slate-100 last:border-r-0 ${!day ? "bg-slate-50/60" : "hover:bg-slate-50"}`}
              >
                {day && (
                  <>
                    <span
                      className={`text-xs font-medium w-6 h-6 rounded-full flex items-center justify-center mb-1
                      ${isToday ? "bg-[#3D52A0] text-white" : "text-slate-500"}`}
                    >
                      {day}
                    </span>
                    <div className="space-y-0.5">
                      {evs.slice(0, 2).map((ev) => (
                        <div
                          key={ev.id}
                          onClick={() => onEdit(ev)}
                          className={`text-[10px] px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-75
                            ${ev.group_id === null ? "ring-1 ring-slate-300" : ""}
                            ${ev.importante ? "bg-red-600 text-white font-semibold" : TIPO_COLOR[ev.tipo] || TIPO_COLOR.evento}`}
                        >
                          {ev.group_id === null && ""}
                          {ev.titulo}
                        </div>
                      ))}
                      {evs.length > 2 && (
                        <p className="text-[10px] text-slate-400 pl-1">
                          +{evs.length - 2} más
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
