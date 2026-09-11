'use client';

import { useEffect, useMemo, useState } from 'react';
import { X, Clock3, PackageCheck, Wrench, Search, PackagePlus, Trash2 } from 'lucide-react';
import { Order, Product, UsedPart } from '@/types/index';
import { getStatusColor } from '@/utils/orders';
import { useProducts, useStockCategories, useStockMovements } from '@/hooks/useStock';
import { getCurrentUser } from '@/utils/permissions';

interface OrderDetailsModalProps {
  order: Order | null;
  onClose: () => void;
  onOrderUpdated?: (order: Order) => void;
}

export default function OrderDetailsModal({ order, onClose, onOrderUpdated }: OrderDetailsModalProps) {
  const { products } = useProducts();
  const { categories, subCategories } = useStockCategories();
  const { registerSale } = useStockMovements();
  const [showCatalog, setShowCatalog] = useState(false);
  const [search, setSearch] = useState('');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [assignedParts, setAssignedParts] = useState<UsedPart[]>(order?.repuestosUsados || []);

  useEffect(() => {
    setAssignedParts(order?.repuestosUsados || []);
  }, [order?.numeroOrden, order?.repuestosUsados]);

  const matchingProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return [];
    return products.filter((product) => [product.codigoBarras, product.descripcion, product.marca, product.modelo]
      .some((value) => value.toLowerCase().includes(term))).slice(0, 6);
  }, [products, search]);

  const catalogProducts = useMemo(() => {
    const term = catalogSearch.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory = !category || product.categoria === category;
      const matchesSubCategory = !subCategory || product.subCategoria === subCategory;
      const matchesSearch = !term || [product.codigoBarras, product.descripcion, product.marca, product.modelo]
        .some((value) => value.toLowerCase().includes(term));
      return matchesCategory && matchesSubCategory && matchesSearch;
    });
  }, [catalogSearch, category, products, subCategory]);

  if (!order) return null;

  const history = [...(order.historial || [])].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  const hasTechnicalResult = Boolean(order.tecnicoAsignado || order.serviciosRealizados?.length || order.precioFinal !== undefined);
  const formatDateTime = (value: string) => new Date(value).toLocaleString();
  const normalizedEquipmentType = order.tipoEquipo.trim().toLowerCase();
  const showsCharger = normalizedEquipmentType === 'notebook' || normalizedEquipmentType === 'netbook';
  const totalParts = assignedParts.reduce((total, part) => total + part.costoTotal, 0);

  const assignProduct = (product: Product) => {
    const quantity = Number.parseInt(quantities[product.id] || '1', 10);
    if (!Number.isInteger(quantity) || quantity <= 0) return setError('La cantidad debe ser un entero mayor a 0.');
    if (quantity > product.stockActual) return setError(`Stock insuficiente. Disponible: ${product.stockActual}.`);
    const currentUser = getCurrentUser();
    try {
      registerSale(product.codigoBarras, quantity, `Orden ${order.numeroOrden}`, currentUser.id, `${currentUser.nombre} ${currentUser.apellido}`, `Asignado a Reparación - Orden #${order.numeroOrden}`);
      const existing = assignedParts.find((part) => part.productId === product.id);
      const nextParts = existing
        ? assignedParts.map((part) => part.productId === product.id ? { ...part, cantidad: part.cantidad + quantity, costoTotal: (part.cantidad + quantity) * part.costoUnitario } : part)
        : [...assignedParts, { productId: product.id, codigoBarras: product.codigoBarras, descripcion: product.descripcion, cantidad: quantity, costoUnitario: product.stockActual >= 0 ? (product as Product & { precioVenta?: number }).precioVenta || 0 : 0, costoTotal: 0 }];
      const updatedOrder: Order = { ...order, repuestosUsados: nextParts, historial: [...(order.historial || []), { fecha: new Date().toISOString(), estado: order.status, detalle: `${quantity} x ${product.descripcion} asignado desde catálogo`, tecnico: `${currentUser.nombre} ${currentUser.apellido}` }] };
      setAssignedParts(nextParts);
      onOrderUpdated?.(updatedOrder);
      setSearch('');
      setError(null);
    } catch (assignmentError) {
      setError(assignmentError instanceof Error ? assignmentError.message : 'No se pudo asignar el repuesto.');
    }
  };

  const removePart = (part: UsedPart) => {
    setAssignedParts((parts) => parts.filter((item) => item.productId !== part.productId));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="order-details-title">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-lg border border-slate-700 bg-slate-900 p-6">
        <div className="mb-6 flex items-center justify-between"><h2 id="order-details-title" className="text-2xl font-bold text-cyan-400">Detalles de la Orden</h2><button onClick={onClose} aria-label="Cerrar detalles de la orden" className="text-slate-400 hover:text-white"><X /></button></div>
        <section aria-labelledby="order-data-title"><h3 id="order-data-title" className="mb-4 text-lg font-semibold text-cyan-400">Datos de la orden</h3><div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2"><div><p className="text-slate-400">Número de orden</p><p className="font-mono text-white">{order.numeroOrden}</p></div><div><p className="text-slate-400">Fecha</p><p className="text-white">{order.fecha}</p></div><div><p className="text-slate-400">Cliente</p><p className="text-white">{order.nombre} {order.apellido}</p></div><div><p className="text-slate-400">Teléfono</p><p className="text-white">{order.telefono}</p></div><div><p className="text-slate-400">Tipo de equipo</p><p className="text-white">{order.tipoEquipo}</p></div><div><p className="text-slate-400">Marca / Modelo</p><p className="text-white">{order.marca} {order.modelo}</p></div><div className="sm:col-span-2"><p className="text-slate-400">Problema reportado</p><p className="text-white">{order.problemaReportado}</p></div><div className="sm:col-span-2"><p className="text-slate-400">Observaciones</p><p className="text-white">{order.observaciones || 'Sin observaciones'}</p></div><div className="sm:col-span-2"><p className="text-slate-400">Accesorios entregados</p><p className="text-white">{order.accesoriosEntregados || 'Sin accesorios'}</p></div>{showsCharger && <div><p className="text-slate-400">Incluye cargador</p><p className="text-white">{order.incluyeCargador ? 'Sí' : 'No'}</p></div>}<div><p className="text-slate-400">Estado actual</p><span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(order.status)}`}>{order.status}</span></div></div></section>

        <section className="mt-6 rounded-lg border border-slate-700 bg-slate-800/80 p-4" aria-labelledby="parts-title"><div className="mb-4 flex items-center justify-between"><h3 id="parts-title" className="flex items-center gap-2 text-lg font-semibold text-cyan-400"><PackagePlus /> Repuestos asignados</h3><span className="font-semibold text-purple-400">Total: ${totalParts.toLocaleString()}</span></div><div className="flex flex-col gap-2 sm:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-3 text-slate-500" size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por código, descripción, marca o modelo" className="w-full rounded border border-slate-700 bg-slate-800 py-2 pl-10 pr-3 text-white outline-none focus:border-cyan-400" />{matchingProducts.length > 0 && <div className="absolute z-10 mt-1 w-full rounded border border-slate-700 bg-slate-800 shadow-xl">{matchingProducts.map((product) => <button key={product.id} onClick={() => assignProduct(product)} disabled={product.stockActual === 0} className="flex w-full items-center justify-between gap-3 border-b border-slate-700 px-3 py-2 text-left text-sm last:border-0 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"><span className="text-white">{product.descripcion}<small className="block text-slate-400">{product.codigoBarras} · {product.marca} {product.modelo}</small></span><span className="text-cyan-300">Stock: {product.stockActual}</span></button>)}</div>}</div><button onClick={() => setShowCatalog(true)} className="inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-400/50 bg-gradient-to-r from-purple-500/30 to-cyan-500/20 px-4 py-2 font-semibold text-cyan-200 shadow-[0_0_18px_rgba(34,211,238,0.18)] transition hover:border-cyan-300 hover:from-purple-500/40 hover:to-cyan-500/30"><Search size={17} /> Buscar en Catálogo</button></div>{error && <p role="alert" className="mt-2 text-sm text-amber-300">{error}</p>}<div className="mt-4 flex flex-col gap-2">{assignedParts.length === 0 ? <p className="text-sm text-slate-500">No hay repuestos asignados.</p> : assignedParts.map((part) => <div key={part.productId} className="flex items-center justify-between rounded border border-slate-700 bg-slate-800/60 p-3"><div><p className="text-white">{part.descripcion}</p><p className="text-xs text-slate-400">{part.codigoBarras} · {part.cantidad} unidad(es)</p></div><div className="flex items-center gap-3"><span className="text-cyan-300">${part.costoTotal.toLocaleString()}</span><button onClick={() => removePart(part)} aria-label={`Quitar ${part.descripcion}`} className="text-slate-400 hover:text-red-400"><Trash2 size={17} /></button></div></div>)}</div></section>

        {hasTechnicalResult && <section className="mt-6 border-t border-slate-700 pt-5"><h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-cyan-400"><Wrench size={18} /> Resultado técnico</h3><div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">{order.tecnicoAsignado && <div><p className="text-slate-400">Técnico asignado</p><p className="text-white">{order.tecnicoAsignado}</p></div>}{order.precioFinal !== undefined && <div><p className="text-slate-400">Precio final</p><p className="text-white">${order.precioFinal.toLocaleString()}</p></div>}{order.serviciosRealizados?.length ? <div className="sm:col-span-2"><p className="mb-2 text-slate-400">Servicios realizados</p><div className="flex flex-wrap gap-2">{order.serviciosRealizados.map((service) => <span key={service} className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">{service}</span>)}</div></div> : null}</div></section>}
        <section className="mt-6 border-t border-slate-700 pt-5"><h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-cyan-400"><Clock3 size={18} /> Historial de Seguimiento</h3>{history.length ? <div className="max-h-64 space-y-3 overflow-y-auto pr-2">{history.map((entry, index) => <div key={`${entry.fecha}-${index}`} className="relative border-l-2 border-cyan-500/50 pl-4"><span className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-cyan-400" /><p className="font-semibold text-white">{entry.estado}</p><p className="text-xs text-cyan-300">{formatDateTime(entry.fecha)}</p><p className="mt-1 text-sm text-slate-300">{entry.detalle}</p><p className="mt-1 text-xs text-slate-500">Técnico/usuario: {entry.tecnico}</p></div>)}</div> : <p className="text-sm text-slate-500">Sin historial registrado</p>}</section>
        {(order.entregadoPor || order.fechaEntrega) && <section className="mt-6 border-t border-slate-700 pt-5"><h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-cyan-400"><PackageCheck size={18} /> Información de Entrega</h3><div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">{order.entregadoPor && <div><p className="text-slate-400">Entregado por</p><p className="text-white">{order.entregadoPor}</p></div>}{order.fechaEntrega && <div><p className="text-slate-400">Fecha de entrega</p><p className="text-white">{formatDateTime(order.fechaEntrega)}</p></div>}</div></section>}
        <div className="mt-6 flex justify-end"><button onClick={onClose} className="rounded-lg bg-cyan-600 px-4 py-2 text-white hover:bg-cyan-700">Cerrar</button></div>
      </div>

      {showCatalog && <div className="fixed inset-0 z-[100] flex min-h-screen items-center justify-center bg-black/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="catalog-title"><div className="max-h-[85vh] w-full max-w-6xl overflow-auto rounded-lg border border-slate-700 bg-slate-900 p-5"><div className="mb-4 flex items-center justify-between"><h3 id="catalog-title" className="text-xl font-semibold text-purple-400">Catálogo de repuestos</h3><button onClick={() => setShowCatalog(false)} aria-label="Cerrar catálogo" className="text-slate-400 hover:text-white"><X /></button></div><div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-3"><select value={category} onChange={(event) => { setCategory(event.target.value); setSubCategory(''); }} className="rounded border border-slate-700 bg-slate-800 p-2 text-white"><option value="">Todas las categorías</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select><select value={subCategory} onChange={(event) => setSubCategory(event.target.value)} className="rounded border border-slate-700 bg-slate-800 p-2 text-white"><option value="">Todas las subcategorías</option>{subCategories.filter((item) => !category || products.some((product) => product.categoria === category && product.subCategoria === item)).map((item) => <option key={item} value={item}>{item}</option>)}</select><input value={catalogSearch} onChange={(event) => setCatalogSearch(event.target.value)} placeholder="Buscar en todo el catálogo" className="rounded border border-slate-700 bg-slate-800 p-2 text-white outline-none focus:border-cyan-400" /></div><div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="border-b border-slate-700 text-slate-400"><tr><th className="p-2">Código de Barras</th><th className="p-2">Descripción</th><th className="p-2">Categoría / Subcategoría</th><th className="p-2">Marca / Modelo</th><th className="p-2">Stock Actual</th><th className="p-2">Asignar</th></tr></thead><tbody>{catalogProducts.map((product) => <tr key={product.id} className="border-b border-slate-800"><td className="p-2 font-mono text-cyan-300">{product.codigoBarras}</td><td className="p-2 text-white">{product.descripcion}</td><td className="p-2 text-slate-300">{product.categoria} / {product.subCategoria}</td><td className="p-2 text-slate-300">{product.marca} / {product.modelo}</td><td className={`p-2 ${product.stockActual === 0 ? 'text-red-400' : 'text-cyan-300'}`}>{product.stockActual === 0 ? 'Sin stock' : product.stockActual}</td><td className="p-2"><div className="flex items-center gap-2"><input type="number" min="1" max={product.stockActual} value={quantities[product.id] || '1'} onChange={(event) => setQuantities((current) => ({ ...current, [product.id]: event.target.value }))} className="w-16 rounded border border-slate-700 bg-slate-800 p-1 text-white" aria-label={`Cantidad de ${product.descripcion}`} /><button onClick={() => assignProduct(product)} disabled={product.stockActual === 0} className="rounded bg-cyan-600 px-2 py-1 text-white hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-40">+ Asignar</button></div></td></tr>)}</tbody></table>{catalogProducts.length === 0 && <p className="p-6 text-center text-slate-500">No se encontraron productos.</p>}</div></div></div>}
    </div>
  );
}
