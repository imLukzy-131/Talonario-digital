'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Package, CheckCircle, Calendar, User, DollarSign, X, Check } from 'lucide-react';
import { Order } from '@/types/index';
import { loadOrdersFromStorage, saveOrdersToStorage } from '@/utils/storage';
import { canDeliverEquipment, getCurrentUser } from '@/utils/permissions';

interface DeliveryManagementPageProps {
  onBack: () => void;
}

export default function DeliveryManagementPage({ onBack }: DeliveryManagementPageProps) {
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const currentUser = getCurrentUser();
  const hasPermission = canDeliverEquipment(currentUser);

  // Cargar órdenes completadas del Storage
  useEffect(() => {
    const loadedOrders = loadOrdersFromStorage();
    const completed = loadedOrders.filter(order => order.status === 'Completado');
    // Ordenar por fecha descendente (más nuevas primero)
    const sorted = completed.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setCompletedOrders(sorted);
  }, []);

  // Limpiar mensaje de éxito después de 3 segundos
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleSelectOrder = (order: Order) => {
    if (!hasPermission) {
      return;
    }
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleMarkAsDelivered = () => {
    if (!selectedOrder) return;

    const allOrders = loadOrdersFromStorage();
    const updatedOrders = allOrders.map(order => {
      if (order.numeroOrden === selectedOrder.numeroOrden) {
        return {
          ...order,
          status: 'Entregado',
          entregadoPor: currentUser.nombre,
          fechaEntrega: new Date().toISOString(),
        };
      }
      return order;
    });

    saveOrdersToStorage(updatedOrders);
    
    // Actualizar lista local
    const updatedCompleted = completedOrders.filter(o => o.numeroOrden !== selectedOrder.numeroOrden);
    setCompletedOrders(updatedCompleted);
    
    setShowModal(false);
    setSelectedOrder(null);
    setSuccessMessage(`Equipo entregado a ${selectedOrder.nombre} ${selectedOrder.apellido}`);
    console.log('[v0] Orden marcada como entregada:', selectedOrder.numeroOrden);
  };

  return (
    <div className="w-full min-h-screen p-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        Volver
      </button>

      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Entrega de Equipos
          </span>
        </h1>
        <p className="text-slate-400 mb-8">Gestiona la entrega de equipos completados</p>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-500/20 border border-green-500/50 rounded-lg p-4 flex items-center gap-3 animate-pulse">
            <Check size={20} className="text-green-400" />
            <p className="text-green-400 font-semibold">{successMessage}</p>
          </div>
        )}

        {/* Permission Check */}
        {!canDeliverEquipment(currentUser) && (
          <div className="mb-6 bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
            <p className="text-yellow-400 font-semibold">No tienes permisos para entregar equipos</p>
          </div>
        )}

        {/* Delivery Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {completedOrders.length > 0 ? (
            completedOrders.map((order) => (
              <div
                key={order.numeroOrden}
                className={`bg-slate-800/40 border border-slate-700 rounded-lg p-6 neon-border transition-all ${
                  canDeliverEquipment(currentUser) ? 'hover:border-cyan-500/50 cursor-pointer' : 'opacity-60'
                }`}
                onClick={() => handleSelectOrder(order)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-cyan-400 font-mono text-sm">{order.numeroOrden}</p>
                    <h3 className="text-white font-semibold text-lg">{order.nombre} {order.apellido}</h3>
                    <p className="text-slate-400 text-xs">Tel: {order.telefono}</p>
                  </div>
                  <Package size={24} className="text-green-400" />
                </div>

                <div className="space-y-3">
                  {/* Equipo */}
                  <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-600">
                    <p className="text-xs text-slate-400 mb-1">Equipo</p>
                    <p className="text-white font-semibold">
                      {order.marca} {order.modelo}
                    </p>
                    <p className="text-xs text-slate-300">{order.tipoEquipo}</p>
                  </div>

                  {/* Información técnica */}
                  {order.tecnicoAsignado && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-900/30 rounded-lg p-2 border border-slate-600">
                        <p className="text-xs text-slate-400">Técnico</p>
                        <p className="text-xs text-white font-semibold">{order.tecnicoAsignado}</p>
                      </div>
                      <div className="bg-slate-900/30 rounded-lg p-2 border border-slate-600">
                        <p className="text-xs text-slate-400">Precio</p>
                        <p className="text-xs text-cyan-400 font-semibold">${order.precioFinal?.toFixed(2) || 'N/A'}</p>
                      </div>
                    </div>
                  )}

                  {/* Servicios realizados */}
                  {order.serviciosRealizados && order.serviciosRealizados.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-400 mb-2">Servicios realizados</p>
                      <div className="flex flex-wrap gap-2">
                        {order.serviciosRealizados.map((servicio) => (
                          <span key={servicio} className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">
                            {servicio}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <button
                    disabled={!canDeliverEquipment(currentUser)}
                    className={`w-full px-4 py-2 rounded-lg border font-semibold transition-all text-sm ${
                      canDeliverEquipment(currentUser)
                        ? 'border-green-500 hover:border-green-400 bg-green-500/10 hover:bg-green-500/20 text-green-300 hover:text-green-200'
                        : 'border-slate-600 bg-slate-700/30 text-slate-400 cursor-not-allowed'
                    }`}
                    onClick={() => handleSelectOrder(order)}
                  >
                    Marcar como Entregado
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Package size={48} className="mx-auto text-slate-500 mb-4" />
              <p className="text-slate-400 text-lg">No hay equipos completados para entregar</p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-6 text-center neon-border">
            <p className="text-slate-400 text-sm mb-2">Equipos listos para entregar</p>
            <p className="text-4xl font-bold text-green-400">{completedOrders.length}</p>
          </div>
          <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-6 text-center neon-border">
            <p className="text-slate-400 text-sm mb-2">Encargado de entregas</p>
            <p className="text-xl font-bold text-cyan-400">{currentUser.nombre}</p>
            <p className="text-xs text-slate-400 mt-1">{currentUser.rol}</p>
          </div>
        </div>
      </div>

      {/* Delivery Modal */}
      {showModal && selectedOrder && canDeliverEquipment(currentUser) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg max-w-md w-full neon-border">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-700 bg-slate-800/60">
              <h2 className="text-2xl font-bold text-cyan-400">Confirmar Entrega</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-600 space-y-3">
                <div>
                  <p className="text-xs text-slate-400 font-semibold mb-1">Cliente</p>
                  <p className="text-white font-semibold">
                    {selectedOrder.nombre} {selectedOrder.apellido}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400 font-semibold mb-1">Equipo</p>
                  <p className="text-white font-semibold">
                    {selectedOrder.marca} {selectedOrder.modelo}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-600">
                  <div>
                    <p className="text-xs text-slate-400">Precio final</p>
                    <p className="text-cyan-400 font-bold">${selectedOrder.precioFinal?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Entregado por</p>
                    <p className="text-white font-semibold text-sm">{currentUser.nombre}</p>
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-600 text-xs text-slate-300">
                  <p>
                    <span className="font-semibold">Fecha/Hora:</span> {new Date().toLocaleString()}
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-400 text-center">
                ¿Confirmas la entrega del equipo al cliente?
              </p>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-slate-700 bg-slate-800/60">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleMarkAsDelivered}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Check size={18} />
                Entregar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
