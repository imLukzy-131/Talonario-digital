import { Eye, Edit2, Trash2 } from 'lucide-react';
import { Order } from '@/types/index';
import { getStatusColor } from '@/utils/orders';

interface OrderRowProps {
  order: Order;
  onView: (order: Order) => void;
  onEdit: (order: Order) => void;
  onDelete: (numeroOrden: string) => void;
}

export default function OrderRow({ order, onView, onEdit, onDelete }: OrderRowProps) {
  return (
    <tr className="hover:bg-slate-800/50 transition-colors">
      <td className="px-6 py-4 text-sm text-cyan-300 font-mono font-semibold">{order.numeroOrden}</td>
      <td className="px-6 py-4 text-sm text-white">{order.nombre} {order.apellido}</td>
      <td className="px-6 py-4 text-sm text-white">
        <div className="text-sm">
          <p className="font-medium">{order.marca} {order.modelo}</p>
          <p className="text-slate-400 text-xs">{order.tipoEquipo}</p>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-slate-300">{order.fecha}</td>
      <td className="px-6 py-4 text-sm">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
          {order.status}
        </span>
      </td>
      <td className="px-6 py-4 text-sm flex gap-2">
        <button 
          className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 transition-colors" 
          title="Ver detalles"
          onClick={() => onView(order)}
        >
          <Eye size={16} />
        </button>
        <button 
          className="p-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/40 text-purple-400 transition-colors" 
          title="Editar"
          onClick={() => onEdit(order)}
        >
          <Edit2 size={16} />
        </button>
        <button 
          className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400 transition-colors" 
          title="Eliminar"
          onClick={() => onDelete(order.numeroOrden)}
        >
          <Trash2 size={16} />
        </button>
      </td>
    </tr>
  );
}
