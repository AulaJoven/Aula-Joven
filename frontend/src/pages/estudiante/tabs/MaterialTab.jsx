// src/pages/estudiante/tabs/MaterialTab.jsx

const CATEGORIA_COLOR = {
  'PDF':    'bg-red-50 text-red-600',
  'Imagen': 'bg-purple-50 text-purple-600',
  'Otro':   'bg-slate-50 text-slate-500',
};

const formatSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const DownloadIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
  </svg>
);

const Spinner = () => (
  <div className="flex justify-center py-12">
    <div className="w-7 h-7 border-4 border-[#3D52A0] border-t-transparent rounded-full animate-spin"/>
  </div>
);

export const MaterialTab = ({ materiales, loading, materiaActiva }) => {
  if (loading) return <Spinner/>;

  return (
    <div>
      <h2 className="text-lg font-bold text-slate-800 mb-1">Material</h2>
      <p className="text-sm text-slate-400 mb-4">{materiaActiva?.materia} — {materiaActiva?.nombre}</p>

      {materiales.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <p className="text-slate-300 text-sm">No hay materiales en este grupo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {materiales.map(mat => (
            <div key={mat.id} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full mb-1 inline-block
                    ${CATEGORIA_COLOR[mat.categoria] || CATEGORIA_COLOR['Otro']}`}>
                    {mat.categoria || 'Otro'}
                  </span>
                  <p className="text-sm font-semibold text-slate-800 truncate">{mat.titulo}</p>
                  {mat.descripcion && <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{mat.descripcion}</p>}
                </div>
                {mat.archivo_size && <p className="text-[10px] text-slate-400 shrink-0">{formatSize(mat.archivo_size)}</p>}
              </div>
              {mat.archivo_url && (
                <a href={mat.archivo_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2 text-xs font-semibold text-[#3D52A0] bg-[#EEF2FF] hover:bg-[#3D52A0] hover:text-white rounded-lg transition-colors">
                  <DownloadIcon/> Descargar {mat.archivo_nombre ? mat.archivo_nombre.split('.').pop().toUpperCase() : ''}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};