// Hook personalizado para gestionar órdenes
import { useState, useEffect } from 'react';
import { Order } from '@/types/index';
import { loadOrdersFromStorage, saveOrdersToStorage, sortOrdersByDate } from '@/utils/storage';
import { filterOrdersByStatus } from '@/utils/orders';
import { getCurrentUser } from '@/utils/permissions';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('Todas');
  const [isLoading, setIsLoading] = useState(true);

  // Cargar órdenes al montar el componente
  useEffect(() => {
    const loadedOrders = loadOrdersFromStorage();
    const sortedOrders = sortOrdersByDate(loadedOrders);
    setOrders(sortedOrders);
    setFilteredOrders(sortedOrders);
    setSelectedFilter('Todas');
    setIsLoading(false);
  }, []);

  const applyFilter = (filter: string) => {
    const filtered = filterOrdersByStatus(orders, filter);
    setFilteredOrders(filtered);
    setSelectedFilter(filter);
  };

  const deleteOrder = (numeroOrden: string) => {
    const updatedOrders = orders.filter(order => order.numeroOrden !== numeroOrden);
    setOrders(updatedOrders);
    saveOrdersToStorage(updatedOrders);
    setFilteredOrders(filterOrdersByStatus(updatedOrders, selectedFilter));
  };

  const updateOrder = (updatedOrder: Order) => {
    const currentOrder = orders.find(order => order.numeroOrden === updatedOrder.numeroOrden);
    if (!currentOrder) return;

    const currentUser = getCurrentUser();
    const updatedOrderWithHistory: Order = {
      ...currentOrder,
      ...updatedOrder,
      numeroOrden: currentOrder.numeroOrden,
      fecha: currentOrder.fecha,
      createdAt: currentOrder.createdAt,
      status: currentOrder.status,
      historial: [
        ...(currentOrder.historial || []),
        {
          fecha: new Date().toISOString(),
          estado: currentOrder.status,
          detalle: 'Orden modificada',
          tecnico: currentUser.nombre,
        },
      ],
    };

    const updatedOrders = sortOrdersByDate(orders.map(order =>
      order.numeroOrden === updatedOrderWithHistory.numeroOrden ? updatedOrderWithHistory : order
    ));
    setOrders(updatedOrders);
    saveOrdersToStorage(updatedOrders);
    setFilteredOrders(filterOrdersByStatus(updatedOrders, selectedFilter));
  };

  return {
    orders,
    filteredOrders,
    selectedFilter,
    isLoading,
    applyFilter,
    deleteOrder,
    updateOrder,
  };
};
