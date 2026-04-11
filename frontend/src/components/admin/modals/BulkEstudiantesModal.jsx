// src/components/admin/modals/BulkEstudiantesModal.jsx
import { useState, useRef } from 'react';
import { Modal } from '../../ui/Modal';
import { Spinner } from '../../ui/Spinner';
import api from '../../../services/api';

// ── Iconos ─────────────────────────────────────────────────────────────────
const UploadIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
  </svg>
);
const FileIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
  </svg>
);
const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
  </svg>
);
const DownloadIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
  </svg>
);

// ── Mapeo de columnas aceptadas ────────────────────────────────────────────
const COLUMN_MAP = {
  nombre:    ['nombre', 'name', 'primer nombre', 'primernombre'],
  apellidos: ['apellidos', 'apellido', 'last name', 'lastname', 'segundo nombre'],
  cedula:    ['cedula', 'cédula', 'id', 'identificacion', 'identificación', 'numero', 'número'],
  grado:     ['grado', 'grade', 'nivel', 'año'],
  email:     ['email', 'correo', 'correo electronico', 'correo electrónico', 'e-mail'],
};

const encontrarColumna = (headers, aliases) => {
  return headers.findIndex(h => aliases.some(a => h.toLowerCase().trim().includes(a)));
};

// ── Descargar plantilla — xlsx se carga solo cuando se necesita ────────────
const descargarPlantilla = async () => {
  const XLSX = await import('xlsx');
  const ws = XLSX.utils.aoa_to_sheet([
    ['nombre', 'apellidos', 'cedula', 'grado', 'email'],
    ['María',  'González',  '112345678', '7', 'maria@example.com'],
    ['Carlos', 'Rodríguez', '212345678', '8', 'carlos@example.com'],
  ]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Estudiantes');
  XLSX.writeFile(wb, 'plantilla_estudiantes.xlsx');
};

// ── Componente ─────────────────────────────────────────────────────────────
export const BulkEstudiantesModal = ({ isOpen, onClose, onSuccess }) => {
  const [file,       setFile]       = useState(null);
  const [preview,    setPreview]    = useState([]);
  const [parseError, setParseError] = useState('');
  const [loading,    setLoading]    = useState(false);
  const [resultado,  setResultado]  = useState(null);
  const fileRef = useRef();

  const reset = () => {
    setFile(null); setPreview([]); setParseError(''); setResultado(null);
  };

  const handleClose = () => { reset(); onClose(); };

  // ── Parsear Excel — xlsx se carga solo cuando el usuario sube un archivo ─
  const handleFile = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    reset();

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const XLSX = await import('xlsx');
        const wb   = XLSX.read(ev.target.result, { type: 'binary' });
        const ws   = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

        if (rows.length < 2) {
          setParseError('El archivo está vacío o solo tiene encabezados.'); return;
        }

        const headers = rows[0].map(h => String(h));

        const idx = {};
        for (const [key, aliases] of Object.entries(COLUMN_MAP)) {
          idx[key] = encontrarColumna(headers, aliases);
        }

        const faltantes = Object.entries(idx).filter(([, v]) => v === -1).map(([k]) => k);
        if (faltantes.length > 0) {
          setParseError(`No se encontraron las columnas: ${faltantes.join(', ')}. Revisa el encabezado del archivo.`);
          return;
        }

        const estudiantes = rows.slice(1)
          .filter(row => row.some(cell => String(cell).trim()))
          .map(row => ({
            nombre:    String(row[idx.nombre]).trim(),
            apellidos: String(row[idx.apellidos]).trim(),
            cedula:    String(row[idx.cedula]).trim(),
            grado:     String(row[idx.grado]).trim(),
            email:     String(row[idx.email]).trim().toLowerCase(),
          }))
          .filter(e => e.nombre && e.cedula);

        if (estudiantes.length === 0) {
          setParseError('No se encontraron filas válidas en el archivo.'); return;
        }

        setFile(f);
        setPreview(estudiantes);
      } catch {
        setParseError('Error al leer el archivo. Asegúrate de que sea un Excel válido (.xlsx o .xls).');
      }
    };
    reader.readAsBinaryString(f);
  };

  // ── Enviar al backend ──────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!preview.length) return;
    setLoading(true);
    try {
      const res = await api.post('/admin/users/bulk', { estudiantes: preview });
      setResultado(res.data.data);
      onSuccess?.();
    } catch (e) {
      setParseError(e.response?.data?.error || 'Error al procesar la carga');
    } finally {
      setLoading(false);
    }
  };

  const GRADOS = { 7: '7°', 8: '8°', 9: '9°', 10: '10°', 11: '11°', 12: '12°' };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Carga Masiva de Estudiantes" maxW="max-w-2xl">
      <div className="px-6 py-5 space-y-4 max-h-[80vh] overflow-y-auto">

        {!resultado ? (
          <>
            {/* Instrucciones + plantilla */}
            <div className="bg-[#EEF2FF] border border-[#3D52A0]/20 rounded-xl p-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-[#3D52A0] mb-1.5">Columnas requeridas en el Excel</p>
                <div className="flex flex-wrap gap-1.5">
                  {['nombre', 'apellidos', 'cedula', 'grado', 'email'].map(c => (
                    <span key={c} className="text-xs font-mono bg-white border border-[#3D52A0]/20 text-[#3D52A0] px-2 py-0.5 rounded">
                      {c}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-1.5">
                  Se envía correo de bienvenida con contraseña temporal a cada estudiante creado.
                </p>
              </div>
              <button onClick={descargarPlantilla}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#3D52A0] bg-white border border-[#3D52A0]/20 hover:bg-[#3D52A0] hover:text-white rounded-lg transition-colors whitespace-nowrap shrink-0">
                <DownloadIcon/> Plantilla
              </button>
            </div>

            {/* Drop zone */}
            <div
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
                ${file ? 'border-[#3D52A0] bg-[#EEF2FF]' : 'border-slate-200 hover:border-[#3D52A0] hover:bg-slate-50'}`}>
              <input ref={fileRef} type="file" className="hidden" accept=".xlsx,.xls" onChange={handleFile}/>
              {file ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-[#3D52A0] flex items-center justify-center text-white">
                    <FileIcon/>
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{file.name}</p>
                  <p className="text-xs text-[#3D52A0] font-medium">{preview.length} estudiantes encontrados</p>
                  <button onClick={e => { e.stopPropagation(); reset(); }}
                    className="text-xs text-slate-400 hover:text-red-500 mt-1">
                    Cambiar archivo
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-400">
                  <UploadIcon/>
                  <p className="text-sm font-medium">Haz click para seleccionar el archivo Excel</p>
                  <p className="text-xs">.xlsx o .xls</p>
                </div>
              )}
            </div>

            {parseError && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{parseError}</p>
            )}

            {/* Tabla preview */}
            {preview.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-600 mb-2">
                  Vista previa — {preview.length} estudiantes
                </p>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto max-h-48 overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50 sticky top-0">
                        <tr>
                          {['Nombre', 'Apellidos', 'Cédula', 'Grado', 'Email'].map(h => (
                            <th key={h} className="px-3 py-2 text-left font-semibold text-slate-600 whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {preview.slice(0, 50).map((e, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="px-3 py-2 text-slate-800">{e.nombre}</td>
                            <td className="px-3 py-2 text-slate-800">{e.apellidos}</td>
                            <td className="px-3 py-2 font-mono text-slate-600">{e.cedula}</td>
                            <td className="px-3 py-2 text-slate-600">{GRADOS[e.grado] || `${e.grado}°`}</td>
                            <td className="px-3 py-2 text-slate-500 max-w-[160px] truncate">{e.email}</td>
                          </tr>
                        ))}
                        {preview.length > 50 && (
                          <tr>
                            <td colSpan={5} className="px-3 py-2 text-center text-slate-400">
                              +{preview.length - 50} más...
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-1">
              <button onClick={handleClose}
                className="px-4 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg">
                Cancelar
              </button>
              <button onClick={handleSubmit} disabled={!preview.length || loading}
                className="px-4 py-2 text-sm text-white bg-[#3D52A0] hover:bg-[#2D3F8A] rounded-lg disabled:opacity-50 flex items-center gap-2">
                {loading
                  ? <><Spinner/> Creando estudiantes...</>
                  : `Crear ${preview.length} estudiantes`}
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-emerald-600">{resultado.creados}</p>
                <p className="text-xs text-emerald-600 mt-0.5">Creados</p>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-amber-600">{resultado.saltados}</p>
                <p className="text-xs text-amber-600 mt-0.5">Ya existían</p>
              </div>
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-red-500">{resultado.invalidos?.length || 0}</p>
                <p className="text-xs text-red-500 mt-0.5">Con error</p>
              </div>
            </div>

            {resultado.creadosDetalle?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-emerald-600 mb-2 flex items-center gap-1.5">
                  <CheckIcon/> Estudiantes creados — correo de bienvenida enviado
                </p>
                <div className="space-y-1 max-h-36 overflow-y-auto">
                  {resultado.creadosDetalle.map((e, i) => (
                    <div key={i} className="flex items-center justify-between bg-emerald-50 rounded-lg px-3 py-1.5">
                      <p className="text-xs text-slate-700 font-medium">{e.nombre}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-slate-400">{e.cedula}</span>
                        <span className="text-xs text-slate-400 truncate max-w-[140px]">{e.email}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {resultado.saltadosDetalle?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-amber-600 mb-2">Ya existían en el sistema (saltados)</p>
                <div className="space-y-1 max-h-28 overflow-y-auto">
                  {resultado.saltadosDetalle.map((e, i) => (
                    <div key={i} className="flex items-center justify-between bg-amber-50 rounded-lg px-3 py-1.5">
                      <p className="text-xs text-slate-700">{e.nombre}</p>
                      <span className="text-xs font-mono text-slate-400">{e.cedula}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {resultado.invalidos?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-red-500 mb-2">Registros con error</p>
                <div className="space-y-1 max-h-28 overflow-y-auto">
                  {resultado.invalidos.map((e, i) => (
                    <div key={i} className="flex items-center justify-between bg-red-50 rounded-lg px-3 py-1.5">
                      <span className="text-xs font-mono text-slate-600">{e.cedula}</span>
                      <span className="text-xs text-red-500">{e.razon}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-1">
              <button onClick={handleClose}
                className="px-4 py-2 text-sm text-white bg-[#3D52A0] hover:bg-[#2D3F8A] rounded-lg">
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};