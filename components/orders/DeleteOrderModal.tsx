import { X } from 'lucide-react';
import { Order } from '@/types/index';

interface DeleteOrderModalProps {
  numeroOrden: string | null;
  onConfirm: (numeroOrden: string) => void;
  onCancel: () => void;
}

export default function DeleteOrderModal({ numeroOrden, onConfirm, onCancel }: DeleteOrderModalProps) {
  if (!numeroOrden) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-sm mx-4">
        <h3 className="text-xl font-bold text-white mb-4">Confirmar eliminación</h3>
        <p className="text-slate-300 mb-6">¿Deseas eliminar la orden {numeroOrden}?</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(numeroOrden)}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors font-semibold"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
