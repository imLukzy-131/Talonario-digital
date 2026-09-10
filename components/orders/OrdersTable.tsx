import { Order } from '@/types/index';
import OrderRow from './OrderRow';

interface OrdersTableProps {
  orders: Order[];
  onView: (order: Order) => void;
  onEdit: (order: Order) => void;
  onDelete: (numeroOrden: string) => void;
}

export default function OrdersTable({ orders, onView, onEdit, onDelete }: OrdersTableProps) {
  return (
    <div className="bg-slate-800/40 border border-slate-700 rounded-lg overflow-hidden neon-border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-800/60 border-b border-slate-700">
              <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Orden ID</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Cliente</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Equipo</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Fecha</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Estado</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {orders.map((order) => (
              <OrderRow
                key={order.numeroOrden}
                order={order}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
