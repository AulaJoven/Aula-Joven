import { CloseIcon } from './Icons';

export const Modal = ({ isOpen, onClose, title, children, maxW = 'max-w-md' }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}/>
      <div className={`relative w-full ${maxW} bg-white rounded-2xl shadow-xl`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
            <CloseIcon/>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};