// src/components/profesor/modals/ConfirmDeleteModal.jsx
import { Modal } from '../../ui/Modal';
import { Spinner } from '../../ui/Spinner';

export const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, evento, loading }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Eliminar Evento">
    <div className="px-6 py-5">
      <p className="text-sm text-slate-600 mb-1">¿Estás seguro de que deseas eliminar este evento?</p>
      <p className="text-sm font-semibold text-slate-800 mb-6">"{evento?.titulo}"</p>
      {evento?.group_id === null && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-4">
          Este es un evento global del administrador y no puede ser eliminado.
        </p>
      )}
      <div className="flex justify-end gap-3">
        <button onClick={onClose}
          className="px-4 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg">
          Cancelar
        </button>
        {evento?.group_id !== null && (
          <button onClick={onConfirm} disabled={loading}
            className="px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-600 rounded-lg disabled:opacity-60 flex items-center gap-2">
            {loading && <Spinner/>} Eliminar
          </button>
        )}
      </div>
    </div>
  </Modal>
);