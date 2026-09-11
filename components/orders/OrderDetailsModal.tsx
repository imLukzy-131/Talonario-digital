import { X, Clock3, PackageCheck, Wrench } from 'lucide-react';
import { Order } from '@/types/index';
import { getStatusColor } from '@/utils/orders';

interface OrderDetailsModalProps {
  order: Order | null;
  onClose: () => void;
}

export default function OrderDetailsModal({ order, onClose }: OrderDetailsModalProps) {
  if (!order) return null;

  const history = [...(order.historial || [])].sort(
    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );
  const hasTechnicalResult = Boolean(
    order.tecnicoAsignado || (order.serviciosRealizados && order.serviciosRealizados.length > 0) || order.precioFinal !== undefined
  );
  const formatDateTime = (value: string) => new Date(value).toLocaleString();
  const normalizedEquipmentType = order.tipoEquipo.trim().toLowerCase();
  const showsCharger = normalizedEquipmentType === 'notebook' || normalizedEquipmentType === 'netbook';

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="order-details-title">
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 id="order-details-title" className="text-2xl font-bold text-cyan-400">Detalles de la Orden</h2>
          <button onClick={onClose} aria-label="Cerrar detalles de la orden" className="text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <section aria-labelledby="order-data-title">
          <h3 id="order-data-title" className="mb-4 text-lg font-semibold text-cyan-400">Datos de la orden</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div><p className="text-slate-400">Número de orden</p><p className="text-white font-mono">{order.numeroOrden}</p></div>
            <div><p className="text-slate-400">Fecha</p><p className="text-white">{order.fecha}</p></div>
            <div><p className="text-slate-400">Cliente</p><p className="text-white">{order.nombre} {order.apellido}</p></div>
            <div><p className="text-slate-400">Teléfono</p><p className="text-white">{order.telefono}</p></div>
            <div><p className="text-slate-400">Tipo de equipo</p><p className="text-white">{order.tipoEquipo}</p></div>
            <div><p className="text-slate-400">Marca / Modelo</p><p className="text-white">{order.marca} {order.modelo}</p></div>
            <div className="sm:col-span-2"><p className="text-slate-400">Problema reportado</p><p className="text-white">{order.problemaReportado}</p></div>
            <div className="sm:col-span-2"><p className="text-slate-400">Observaciones</p><p className="text-white">{order.observaciones || 'Sin observaciones'}</p></div>
            <div className="sm:col-span-2"><p className="text-slate-400">Accesorios entregados</p><p className="text-white">{order.accesoriosEntregados || 'Sin accesorios'}</p></div>
            {showsCharger && <div><p className="text-slate-400">Incluye cargador</p><p className="text-white">{order.incluyeCargador ? 'Sí' : 'No'}</p></div>}
            <div><p className="text-slate-400">Estado actual</p><span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(order.status)}`}>{order.status}</span></div>
          </div>
        </section>

        {hasTechnicalResult && (
          <section className="mt-6 border-t border-slate-700 pt-5" aria-labelledby="technical-result-title">
            <h3 id="technical-result-title" className="flex items-center gap-2 mb-4 text-lg font-semibold text-cyan-400"><Wrench size={18} /> Resultado técnico</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {order.tecnicoAsignado && <div><p className="text-slate-400">Técnico asignado</p><p className="text-white">{order.tecnicoAsignado}</p></div>}
              {order.precioFinal !== undefined && <div><p className="text-slate-400">Precio final</p><p className="text-white">${order.precioFinal.toLocaleString()}</p></div>}
              {order.serviciosRealizados && order.serviciosRealizados.length > 0 && (
                <div className="sm:col-span-2"><p className="text-slate-400 mb-2">Servicios realizados</p><div className="flex flex-wrap gap-2">{order.serviciosRealizados.map((service) => <span key={service} className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">{service}</span>)}</div></div>
              )}
            </div>
          </section>
        )}

        <section className="mt-6 border-t border-slate-700 pt-5" aria-labelledby="history-title">
          <h3 id="history-title" className="flex items-center gap-2 mb-4 text-lg font-semibold text-cyan-400"><Clock3 size={18} /> Historial de Seguimiento</h3>
          {history.length > 0 ? (
            <div className="max-h-64 overflow-y-auto space-y-3 pr-2">
              {history.map((entry, index) => (
                <div key={`${entry.fecha}-${index}`} className="relative border-l-2 border-cyan-500/50 pl-4">
                  <span className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-cyan-400" />
                  <p className="font-semibold text-white">{entry.estado}</p>
                  <p className="text-xs text-cyan-300">{formatDateTime(entry.fecha)}</p>
                  <p className="mt-1 text-sm text-slate-300">{entry.detalle}</p>
                  <p className="mt-1 text-xs text-slate-500">Técnico/usuario: {entry.tecnico}</p>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-slate-500">Sin historial registrado</p>}
        </section>

        {(order.entregadoPor || order.fechaEntrega) && (
          <section className="mt-6 border-t border-slate-700 pt-5" aria-labelledby="delivery-title">
            <h3 id="delivery-title" className="flex items-center gap-2 mb-4 text-lg font-semibold text-cyan-400"><PackageCheck size={18} /> Información de Entrega</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {order.entregadoPor && <div><p className="text-slate-400">Entregado por</p><p className="text-white">{order.entregadoPor}</p></div>}
              {order.fechaEntrega && <div><p className="text-slate-400">Fecha de entrega</p><p className="text-white">{formatDateTime(order.fechaEntrega)}</p></div>}
            </div>
          </section>
        )}

        <div className="flex justify-end mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white">Cerrar</button>
        </div>
      </div>
    </div>
  );
}
