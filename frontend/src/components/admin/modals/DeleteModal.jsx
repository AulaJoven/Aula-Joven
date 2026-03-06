import { Modal } from '../../ui/Modal';
import { Spinner } from '../../ui/Spinner';

export const DeleteModal = ({ isOpen, onClose, onConfirm, nombre, loading }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Confirmar eliminación">
    <div className="px-6 py-5">
      <p className="text-sm text-slate-500 mb-6">
        ¿Eliminar <strong className="text-slate-800">{nombre}</strong>? Esta acción no se puede deshacer.
      </p>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg">
          Cancelar
        </button>
        <button onClick={onConfirm} disabled={loading}
          className="px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-600 rounded-lg disabled:opacity-60 flex items-center gap-2">
          {loading && <Spinner/>}Eliminar
        </button>
      </div>
    </div>
  </Modal>
);