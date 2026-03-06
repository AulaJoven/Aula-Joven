// src/components/profesor/modals/MaterialModal.jsx
import { useState, useEffect, useRef } from 'react';
import { Modal } from '../../ui/Modal';
import { Spinner } from '../../ui/Spinner';
import supabase from '../../../config/supabase';

const FileIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
  </svg>
);
const UploadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
  </svg>
);

const formatSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const detectarCategoria = (file) => {
  if (!file) return 'Otro';
  if (file.type === 'application/pdf') return 'PDF';
  if (file.type.startsWith('image/')) return 'Imagen';
  return 'Otro';
};

export const MaterialModal = ({ isOpen, onClose, onSave }) => {
  const [titulo,      setTitulo]      = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [file,        setFile]        = useState(null);
  const [uploading,   setUploading]   = useState(false);
  const [progress,    setProgress]    = useState(0);
  const [error,       setError]       = useState('');
  const fileInputRef = useRef();

  useEffect(() => {
    setTitulo(''); setDescripcion(''); setFile(null);
    setUploading(false); setProgress(0); setError('');
  }, [isOpen]);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 20 * 1024 * 1024) { setError('El archivo no puede superar 20MB'); return; }
    setFile(f);
    if (!titulo) setTitulo(f.name.replace(/\.[^/.]+$/, ''));
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!file) { setError('Selecciona un archivo'); return; }
    setError(''); setUploading(true); setProgress(10);
    try {
      const ext      = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const path     = `grupo-${fileName}`;

      setProgress(30);
      const { error: uploadError } = await supabase.storage
        .from('materiales').upload(path, file, { cacheControl: '3600', upsert: false });
      if (uploadError) throw new Error(uploadError.message);

      setProgress(70);
      const { data: urlData } = supabase.storage.from('materiales').getPublicUrl(path);
      setProgress(90);

      await onSave({
        titulo:         titulo.trim(),
        descripcion:    descripcion.trim() || null,
        archivo_url:    urlData.publicUrl,
        archivo_nombre: file.name,
        archivo_size:   file.size,
        categoria:      detectarCategoria(file),
      });

      setProgress(100);
      onClose();
    } catch (err) {
      setError(err.message || 'Error al subir el archivo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Subir Archivo">
      <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
        <div onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors
            ${file ? 'border-[#3D52A0] bg-[#EEF2FF]' : 'border-slate-200 hover:border-[#3D52A0] hover:bg-slate-50'}`}>
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFile}
            accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.doc,.docx,.ppt,.pptx,.xls,.xlsx"/>
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#3D52A0] flex items-center justify-center text-white">
                <FileIcon/>
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-800 truncate max-w-[200px]">{file.name}</p>
                <p className="text-xs text-slate-400">{formatSize(file.size)}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-400">
              <UploadIcon/>
              <p className="text-sm">Haz click para seleccionar un archivo</p>
              <p className="text-xs">PDF, imágenes, documentos — máx. 20MB</p>
            </div>
          )}
        </div>

        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">Título *</label>
          <input value={titulo} onChange={e => setTitulo(e.target.value)} required
            placeholder="Nombre del archivo..."
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D52A0]/20 focus:border-[#3D52A0]"/>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">Descripción</label>
          <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)}
            rows={2} placeholder="Descripción opcional..."
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D52A0]/20 focus:border-[#3D52A0] resize-none"/>
        </div>

        {uploading && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Subiendo archivo...</span><span>{progress}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5">
              <div className="bg-[#3D52A0] h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}/>
            </div>
          </div>
        )}

        {error && <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

        <div className="flex justify-end gap-3 pt-1">
          <button type="button" onClick={onClose} disabled={uploading}
            className="px-4 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg disabled:opacity-50">
            Cancelar
          </button>
          <button type="submit" disabled={uploading || !file}
            className="px-4 py-2 text-sm text-white bg-[#3D52A0] hover:bg-[#2D3F8A] rounded-lg disabled:opacity-60 flex items-center gap-2">
            {uploading ? <><Spinner/> Subiendo...</> : <><UploadIcon/> Subir</>}
          </button>
        </div>
      </form>
    </Modal>
  );
};