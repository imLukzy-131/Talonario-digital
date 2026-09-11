'use client';

import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useOrders } from '@/hooks/useOrders';
import { usePagination } from '@/hooks/usePagination';
import FiltersBar from '@/components/orders/FiltersBar';
import OrdersTable from '@/components/orders/OrdersTable';
import Pagination from '@/components/orders/Pagination';
import DeleteOrderModal from '@/components/orders/DeleteOrderModal';
import OrderDetailsModal from '@/components/orders/OrderDetailsModal';
import EditOrderModal from '@/components/orders/EditOrderModal';
import { Order } from '@/types/index';

interface ListOrdersPageProps {
  onBack: () => void;
}

export default function ListOrdersPage({ onBack }: ListOrdersPageProps) {
  const { orders, filteredOrders, selectedFilter, isLoading, applyFilter, deleteOrder, updateOrder } = useOrders();
  const { paginatedItems, currentPage, totalPages, startIndex, goToPage } = usePagination(filteredOrders, 10);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  const handleDeleteConfirm = (numeroOrden: string) => {
    deleteOrder(numeroOrden);
    setShowDeleteConfirm(null);
  };

  const handleEditSave = (updatedOrder: Order) => {
    updateOrder(updatedOrder);
    setEditingOrder(null);
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen p-8 flex items-center justify-center">
        <p className="text-slate-400">Cargando órdenes...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen p-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        Volver
      </button>

      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Listar Órdenes
          </span>
        </h1>
        <p className="text-slate-400 mb-8">Visualiza todas las órdenes de trabajo registradas</p>

        {/* Filters */}
        <FiltersBar selectedFilter={selectedFilter} onFilterChange={applyFilter} />

        {/* Empty State */}
        {orders.length === 0 ? (
          <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-16 text-center neon-border">
            <p className="text-slate-400 text-lg mb-4">No hay órdenes registradas</p>
            <p className="text-slate-500 text-sm">Crea una nueva orden en la sección "Nueva Orden"</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-16 text-center neon-border">
            <p className="text-slate-400 text-lg mb-4">No hay órdenes con el filtro seleccionado</p>
            <p className="text-slate-500 text-sm">Intenta cambiar los filtros</p>
          </div>
        ) : (
          <>
            {/* Orders Table */}
            <OrdersTable
              orders={paginatedItems}
              onView={setSelectedOrder}
              onEdit={setEditingOrder}
              onDelete={(numeroOrden) => setShowDeleteConfirm(numeroOrden)}
            />

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              startIndex={startIndex}
              filteredOrdersLength={filteredOrders.length}
              onPageChange={goToPage}
            />
          </>
        )}
      </div>

      {/* Modals */}
      <DeleteOrderModal
        numeroOrden={showDeleteConfirm}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(null)}
      />
      <OrderDetailsModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onOrderUpdated={(updatedOrder) => {
          updateOrder(updatedOrder);
          setSelectedOrder(updatedOrder);
        }}
      />
      <EditOrderModal
        order={editingOrder}
        onSave={handleEditSave}
        onCancel={() => setEditingOrder(null)}
      />
    </div>
  );
}
