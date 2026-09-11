'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, CheckCircle, AlertCircle, X, Plus, Minus } from 'lucide-react';
import { TECHNICAL_STATES } from '@/constants/orderStatus';
import { Order, HistorialEntry, Service } from '@/types/index';
import { canEditTracking, getCurrentUser } from '@/utils/permissions';
import { getActiveServices } from '@/utils/services';
import { loadOrdersFromStorage, saveOrdersToStorage, sortOrdersByDate } from '@/utils/storage';

interface TechnicalTrackingPageProps {
  onBack: () => void;
}

const TECHNICAL_STATES_ARRAY = TECHNICAL_STATES;

export default function TechnicalTrackingPage({ onBack }: TechnicalTrackingPageProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newState, setNewState] = useState('');
  const [newObservation, setNewObservation] = useState('');
  const [newPrecioFinal, setNewPrecioFinal] = useState('');
  const [newServiciosRealizados, setNewServiciosRealizados] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const currentUser = getCurrentUser();
  const hasTrackingPermission = canEditTracking(currentUser);

  // Cargar órdenes del localStorage
  useEffect(() => {
    const loadedOrders = loadOrdersFromStorage();
    // Ordenar por fecha descendente (más nuevas primero)
    const sorted = sortOrdersByDate(loadedOrders);
    setOrders(sorted);
    
    // Cargar servicios disponibles
    const services = getActiveServices();
    setAvailableServices(services);
  }, []);

  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order);
    setNewState(order.status || 'Pendiente');
    setNewObservation('');
    setNewPrecioFinal(order.precioFinal?.toString() || '');
    setNewServiciosRealizados(order.serviciosRealizados || []);
    setErrorMessage(null);
    setShowModal(true);
  };

  const handleAddService = (serviceName: string) => {
    if (!newServiciosRealizados.includes(serviceName)) {
      setNewServiciosRealizados([...newServiciosRealizados, serviceName]);
      // Calcular precio automáticamente
      const service = availableServices.find(s => s.nombre === serviceName);
      if (service) {
        const currentPrice = parseFloat(newPrecioFinal) || 0;
        const newPrice = currentPrice + service.precioBase;
        setNewPrecioFinal(newPrice.toFixed(2));
      }
    }
  };

  const handleRemoveService = (serviceName: string) => {
    const updatedServices = newServiciosRealizados.filter(s => s !== serviceName);
    setNewServiciosRealizados(updatedServices);
    // Recalcular precio
    const totalPrice = updatedServices.reduce((sum, sName) => {
      const service = availableServices.find(s => s.nombre === sName);
      return sum + (service?.precioBase || 0);
    }, 0);
    setNewPrecioFinal(totalPrice.toFixed(2));
  };

  const handleUpdateTracking = () => {
    if (!selectedOrder) return;

    // Validación: si se marca como Completado, requiere observación, precio y servicios
    if (newState === 'Completado') {
      if (!newObservation.trim()) {
        setErrorMessage('Debe agregar observación técnica para completar');
        return;
      }
      if (!newPrecioFinal || parseFloat(newPrecioFinal) <= 0) {
        setErrorMessage('Debe ingresar precio final válido para completar');
        return;
      }
      if (newServiciosRealizados.length === 0) {
        setErrorMessage('Debe indicar al menos un servicio realizado para completar');
        return;
      }
    }

    const updatedOrders = orders.map(order => {
      if (order.numeroOrden === selectedOrder.numeroOrden) {
        const historial = order.historial || [];
        const newEntry: HistorialEntry = {
          fecha: new Date().toISOString(),
          estado: newState,
          detalle: newObservation || 'Sin observaciones',
          tecnico: currentUser.nombre,
        };
        
        return {
          ...order,
          status: newState,
          tecnicoAsignado: currentUser.nombre,
          precioFinal: newPrecioFinal ? parseFloat(newPrecioFinal) : order.precioFinal,
          serviciosRealizados: newServiciosRealizados,
          historial: [...historial, newEntry],
        };
      }
      return order;
    });

    setOrders(updatedOrders);
    saveOrdersToStorage(updatedOrders);
    
    setShowModal(false);
    setNewObservation('');
    setNewPrecioFinal('');
    setNewServiciosRealizados([]);
    setErrorMessage(null);
    setSelectedOrder(null);
    console.log('[v0] Seguimiento técnico actualizado');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completado':
      case 'Entregado':
        return 'green';
      case 'Esperando repuesto':
      case 'En diagnóstico':
        return 'yellow';
      case 'Esperando confirmación':
        return 'amber';
      case 'En reparación':
        return 'blue';
      case 'Pendiente':
      default:
        return 'slate';
    }
  };

  const getStatusIcon = (status: string) => {
    const color = getStatusColor(status);
    if (status === 'Completado' || status === 'Entregado') return CheckCircle;
    if (status === 'Esperando repuesto') return AlertCircle;
    return Clock;
  };

  const getProgressPercentage = (status: string) => {
    const states = TECHNICAL_STATES_ARRAY;
    const index = states.indexOf(status as any);
    return index >= 0 ? ((index + 1) / states.length) * 100 : 0;
  };

  const filteredOrders = orders.filter(
    order => order.status !== 'Entregado' && order.status !== 'Completado'
  );

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
            Seguimiento Técnico
          </span>
        </h1>
        <p className="text-slate-400 mb-8">Monitorea el estado de los equipos en reparación</p>

        {/* Tracking Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => {
              const IconComponent = getStatusIcon(order.status);
              const statusColor = getStatusColor(order.status);
              const progress = getProgressPercentage(order.status);

              return (
                <div
                  key={order.numeroOrden}
                  className="bg-slate-800/40 border border-slate-700 rounded-lg p-6 neon-border hover:border-cyan-500/50 transition-all cursor-pointer"
                  onClick={() => {
                    if (hasTrackingPermission){
                      console.log('[V0] No tienes permisos para entrar.')
                      handleSelectOrder(order);
                    }
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    
                    <div>
                      <p className="text-cyan-400 font-mono text-sm">{order.numeroOrden}</p>
                      <h3 className="text-white font-semibold text-lg">{order.nombre} {order.apellido}</h3>
                      <p className="text-slate-400 text-xs">{order.marca} {order.modelo}</p>
                    </div>
                    <IconComponent
                      size={24}
                      className={`${
                        statusColor === 'green'
                          ? 'text-green-400'
                          : statusColor === 'yellow'
                          ? 'text-yellow-400'
                          : statusColor === 'blue'
                          ? 'text-blue-400'
                          : statusColor === 'amber'
                          ? 'text-amber-400'
                          : 'text-slate-400'
                      }`}
                    />
                  </div>

                  <div className="space-y-4">
                    {/* Status Badge */}
                    <div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          statusColor === 'green'
                            ? 'bg-green-500/20 text-green-400'
                            : statusColor === 'yellow'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : statusColor === 'blue'
                            ? 'bg-blue-500/20 text-blue-400'
                            : statusColor === 'amber'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-slate-500/20 text-slate-400'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-xs text-slate-400">Progreso:</span>
                        <span className="text-xs text-cyan-400 font-semibold">{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${
                            statusColor === 'green'
                              ? 'from-green-500 to-green-600'
                              : statusColor === 'yellow'
                              ? 'from-yellow-500 to-yellow-600'
                              : statusColor === 'blue'
                              ? 'from-blue-500 to-cyan-500'
                              : statusColor === 'amber'
                              ? 'from-amber-500 to-orange-500'
                              : 'from-slate-500 to-slate-600'
                          }`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Current Step */}
                    <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-600">
                      <p className="text-xs text-slate-400 mb-1">Paso actual:</p>
                      <p className="text-sm text-white">{order.status}</p>
                    </div>

                    {/* Action Button */}
                    <button className="w-full px-4 py-2 rounded-lg border border-slate-600 hover:border-cyan-500 bg-slate-700/30 hover:bg-slate-700/60 text-cyan-300 hover:text-cyan-200 transition-all text-sm font-medium">
                      Actualizar seguimiento
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-slate-400">No hay órdenes en proceso</p>
            </div>
          )}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Órdenes en proceso', value: filteredOrders.length.toString(), color: 'blue' },
            { label: 'Completadas', value: orders.filter(o => o.status === 'Completado').length.toString(), color: 'green' },
            { label: 'En diagnóstico', value: orders.filter(o => o.status === 'En diagnóstico').length.toString(), color: 'yellow' },
          ].map((stat) => (
            <div key={stat.label} className="bg-slate-800/40 border border-slate-700 rounded-lg p-6 text-center neon-border">
              <p className="text-slate-400 text-sm mb-2">{stat.label}</p>
              <p
                className={`text-3xl font-bold ${
                  stat.color === 'blue'
                    ? 'text-blue-400'
                    : stat.color === 'green'
                    ? 'text-green-400'
                    : 'text-yellow-400'
                }`}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Seguimiento */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg max-w-2xl w-full neon-border">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-700 bg-slate-800/60 sticky top-0">
              <h2 className="text-2xl font-bold text-cyan-400">
                Seguimiento: {selectedOrder.numeroOrden}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Error Message */}
              {errorMessage && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-center gap-3">
                  <AlertCircle size={20} className="text-red-400" />
                  <p className="text-red-400 font-semibold text-sm">{errorMessage}</p>
                </div>
              )}

              {/* Información de la orden */}
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-600">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400 font-semibold">Cliente</p>
                    <p className="text-white font-medium">
                      {selectedOrder.nombre} {selectedOrder.apellido}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold">Equipo</p>
                    <p className="text-white font-medium">
                      {selectedOrder.marca} {selectedOrder.modelo}
                    </p>
                  </div>
                </div>
              </div>

              {/* Nuevo Estado */}
              <div>
                <label className="block text-sm font-semibold text-cyan-400 mb-2">
                  Nuevo Estado Técnico
                </label>
                <select
                  value={newState}
                  onChange={(e) => setNewState(e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none transition-colors"
                >
                  {TECHNICAL_STATES_ARRAY.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              {/* Observación Técnica */}
              <div>
                <label className="block text-sm font-semibold text-cyan-400 mb-2">
                  Observación Técnica *
                </label>
                <textarea
                  value={newObservation}
                  onChange={(e) => setNewObservation(e.target.value)}
                  placeholder="Describa los trabajos realizados, hallazgos o notas técnicas..."
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none transition-colors resize-none h-24"
                />
                {newState === 'Completado' && (
                  <p className="text-xs text-yellow-400 mt-1">Requerido para completar la orden</p>
                )}
              </div>

              {/* Precio Final */}
              <div>
                <label className="block text-sm font-semibold text-cyan-400 mb-2">
                  Precio Final ($) {newState === 'Completado' ? '*' : ''}
                </label>
                <input
                  type="number"
                  value={newPrecioFinal}
                  onChange={(e) => setNewPrecioFinal(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none transition-colors"
                />
                {newState === 'Completado' && (
                  <p className="text-xs text-yellow-400 mt-1">Requerido para completar la orden</p>
                )}
              </div>

              {/* Servicios Realizados */}
              <div>
                <label className="block text-sm font-semibold text-cyan-400 mb-2">
                  Servicios Realizados {newState === 'Completado' ? '*' : ''}
                </label>
                
                {/* Agregar servicios desde lista */}
                <div className="mb-3 flex gap-2">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddService(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="flex-1 bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 focus:outline-none transition-colors"
                  >
                    <option value="">+ Agregar servicio</option>
                    {availableServices.map((service) => (
                      <option key={service.id} value={service.nombre}>
                        {service.nombre} (${service.precioBase.toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Servicios seleccionados */}
                {newServiciosRealizados.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {newServiciosRealizados.map((serviceName) => (
                      <div
                        key={serviceName}
                        className="flex items-center gap-2 px-3 py-1 bg-cyan-500/20 text-cyan-300 text-xs rounded-full border border-cyan-500/30"
                      >
                        {serviceName}
                        <button
                          type="button"
                          onClick={() => handleRemoveService(serviceName)}
                          className="hover:text-red-400 transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {newState === 'Completado' && (
                  <p className="text-xs text-yellow-400">Requerido para completar la orden</p>
                )}
              </div>

              {/* Información automática */}
              <div className="bg-slate-900/30 rounded-lg p-3 border border-slate-600">
                <p className="text-xs text-slate-400">
                  <span className="font-semibold">Registrado automáticamente:</span>
                </p>
                <p className="text-xs text-slate-300 mt-1">
                  Técnico: <span className="font-mono">{currentUser.nombre}</span>
                </p>
                <p className="text-xs text-slate-300">
                  Fecha/Hora: <span className="font-mono">{new Date().toLocaleString()}</span>
                </p>
              </div>

              {/* Historial */}
              {selectedOrder.historial && selectedOrder.historial.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-cyan-400 mb-3">Historial de Seguimiento</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {[...selectedOrder.historial].reverse().map((entry, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-900/50 rounded-lg p-3 border border-slate-600 text-xs"
                      >
                        <div className="flex justify-between mb-1">
                          <span className="text-cyan-400 font-semibold">{entry.estado}</span>
                          <span className="text-slate-400">
                            {new Date(entry.fecha).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-slate-300">{entry.detalle}</p>
                        <p className="text-slate-500 text-xs mt-1">Por: {entry.tecnico}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-slate-700 bg-slate-800/60 sticky bottom-0">
              <button
                onClick={handleUpdateTracking}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-lg font-semibold transition-colors"
              >
                Guardar Cambios
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg font-semibold transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
