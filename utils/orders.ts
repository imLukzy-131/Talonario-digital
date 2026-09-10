// Utilidades para gestión de órdenes
import { Order } from '@/types/index';

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'Completado':
    case 'Entregado':
      return 'bg-green-500/20 text-green-400';
    case 'En diagnóstico':
    case 'Esperando repuesto':
      return 'bg-yellow-500/20 text-yellow-400';
    case 'En reparación':
      return 'bg-blue-500/20 text-blue-400';
    case 'Pendiente':
    default:
      return 'bg-slate-500/20 text-slate-400';
  }
};

export const filterOrdersByStatus = (orders: Order[], status: string): Order[] => {
  if (status === 'Todas') {
    return orders;
  }
  return orders.filter(order => order.status === status);
};
