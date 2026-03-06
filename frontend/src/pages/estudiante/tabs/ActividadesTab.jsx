// src/pages/estudiante/tabs/ActividadesTab.jsx

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

const formatFecha = (fecha) => {
  if (!fecha) return '';
  const [, m, d] = fecha.split('-').map(Number);
  return `${d} ${MESES[m - 1]}`;
};

const Spinner = () => (
  <div className="flex justify-center py-12">
    <div className="w-7 h-7 border-4 border-[#3D52A0] border-t-transparent rounded-full animate-spin"/>
  </div>
);

export const ActividadesTab = ({ actividades, loading, materiaActiva }) => {
  if (loading) return <Spinner/>;

  return (
    <div>
      <h2 className="text-lg font-bold text-slate-800 mb-1">Actividades</h2>
      <p className="text-sm text-slate-400 mb-4">{materiaActiva?.materia} — {materiaActiva?.nombre}</p>

      {actividades.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <p className="text-slate-300 text-sm">No hay actividades en este grupo.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {actividades.map(act => {
            const vencida = act.fecha && new Date(act.fecha + 'T23:59:59') < new Date();
            return (
              <div key={act.id} className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide
                        ${act.tipo === 'examen' ? 'bg-red-100 text-red-600'
                        : act.tipo === 'tarea'  ? 'bg-amber-100 text-amber-600'
                        : 'bg-[#EEF2FF] text-[#3D52A0]'}`}>
                        {act.tipo}
                      </span>
                      {vencida && <span className="text-[10px] text-red-400 font-medium">Vencida</span>}
                    </div>
                    <p className="text-sm font-semibold text-slate-800">{act.titulo}</p>
                    {act.descripcion && <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{act.descripcion}</p>}
                  </div>
                  {act.fecha && (
                    <div className="text-right shrink-0">
                      <p className="text-[10px] text-slate-400">Fecha</p>
                      <p className={`text-xs font-semibold ${vencida ? 'text-red-500' : 'text-slate-600'}`}>
                        {formatFecha(act.fecha)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};