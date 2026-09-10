'use client';

import { useState, useRef } from 'react';
import { ArrowLeft, Package, Search, Filter, Printer, X, Plus, AlertTriangle } from 'lucide-react';
import { useProducts, useStockCategories, useStockAlerts } from '@/hooks/useStock';
import { getCurrentUser, canManageProducts } from '@/utils/permissions';
import { getMinStockForProduct } from '@/utils/stockService';
import ProductFormModal from '@/components/stock/ProductFormModal';

interface StockListPageProps {
  onBack: () => void;
}

export default function StockListPage({ onBack }: StockListPageProps) {
  const currentUser = getCurrentUser();
  const canManage = canManageProducts(currentUser);
  const { categories, marcas } = useStockCategories();
  const { lowStockProducts } = useStockAlerts();
  
  const [filters, setFilters] = useState({
    categoria: '',
    marca: '',
    busqueda: '',
    soloConStock: false,
    soloBajoMinimo: false,
  });
  
  const { products, loading, refresh } = useProducts(filters);
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const lowStockCodes = lowStockProducts.map(l => l.product.codigoBarras);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const appliedFilters = [];
    if (filters.categoria) appliedFilters.push(`Categoría: ${filters.categoria}`);
    if (filters.marca) appliedFilters.push(`Marca: ${filters.marca}`);
    if (filters.busqueda) appliedFilters.push(`Búsqueda: ${filters.busqueda}`);
    if (filters.soloConStock) appliedFilters.push('Solo con stock');
    if (filters.soloBajoMinimo) appliedFilters.push('Solo bajo mínimo');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Listado de Stock - ${new Date().toLocaleDateString()}</title>
          <style>
            @page { size: A4 landscape; margin: 1cm; }
            body { font-family: Arial, sans-serif; font-size: 11px; color: #333; }
            h1 { text-align: center; color: #0891b2; margin-bottom: 5px; }
            .header-info { text-align: center; color: #666; margin-bottom: 15px; font-size: 10px; }
            .filters { background: #f0f0f0; padding: 8px; margin-bottom: 15px; border-radius: 4px; font-size: 10px; }
            table { width: 100%; border-collapse: collapse; }
            th { background: #0891b2; color: white; padding: 8px 4px; text-align: left; font-size: 10px; }
            td { padding: 6px 4px; border-bottom: 1px solid #ddd; font-size: 10px; }
            tr:nth-child(even) { background: #f9f9f9; }
            .low-stock { color: #dc2626; font-weight: bold; }
            .footer { text-align: center; margin-top: 20px; font-size: 9px; color: #666; }
            .total { font-weight: bold; margin-top: 10px; }
          </style>
        </head>
        <body>
          <h1>Listado de Stock</h1>
          <div class="header-info">
            Fecha de impresión: ${new Date().toLocaleString()}<br>
            Usuario: ${currentUser.nombre} ${currentUser.apellido}
          </div>
          ${appliedFilters.length > 0 ? `<div class="filters"><strong>Filtros aplicados:</strong> ${appliedFilters.join(' | ')}</div>` : ''}
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Descripción</th>
                <th>Categoría</th>
                <th>Marca</th>
                <th>Modelo</th>
                <th style="text-align: right;">Stock</th>
              </tr>
            </thead>
            <tbody>
              ${products.map(p => `
                <tr>
                  <td>${p.codigoBarras}</td>
                  <td>${p.descripcion}</td>
                  <td>${p.categoria}</td>
                  <td>${p.marca}</td>
                  <td>${p.modelo}</td>
                  <td style="text-align: right;" class="${lowStockCodes.includes(p.codigoBarras) ? 'low-stock' : ''}">${p.stockActual}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total">Total de registros: ${products.length}</div>
          <div class="footer">Impreso desde Sistema de Gestión de Stock</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const clearFilters = () => {
    setFilters({
      categoria: '',
      marca: '',
      busqueda: '',
      soloConStock: false,
      soloBajoMinimo: false,
    });
  };

  const hasActiveFilters = filters.categoria || filters.marca || filters.busqueda || filters.soloConStock || filters.soloBajoMinimo;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <Package className="w-6 h-6 text-cyan-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Listado de Stock</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </button>
          {canManage && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg text-white transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nuevo Producto
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={filters.busqueda}
            onChange={(e) => setFilters({ ...filters, busqueda: e.target.value })}
            placeholder="Buscar por descripción, código o marca..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            hasActiveFilters
              ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400'
              : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filtros
          {hasActiveFilters && (
            <span className="bg-cyan-500 text-white text-xs px-2 py-0.5 rounded-full">
              {[filters.categoria, filters.marca, filters.soloConStock, filters.soloBajoMinimo].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-cyan-400">Filtros</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-slate-400 hover:text-white flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Limpiar filtros
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Categoría</label>
              <select
                value={filters.categoria}
                onChange={(e) => setFilters({ ...filters, categoria: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 focus:outline-none"
              >
                <option value="">Todas</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Marca</label>
              <select
                value={filters.marca}
                onChange={(e) => setFilters({ ...filters, marca: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 focus:outline-none"
              >
                <option value="">Todas</option>
                {marcas.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.soloConStock}
                  onChange={(e) => setFilters({ ...filters, soloConStock: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-cyan-500 focus:ring-cyan-500"
                />
                <span className="text-sm text-slate-300">Solo con stock</span>
              </label>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.soloBajoMinimo}
                  onChange={(e) => setFilters({ ...filters, soloBajoMinimo: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-amber-500 focus:ring-amber-500"
                />
                <span className="text-sm text-slate-300">Solo bajo mínimo</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Stock Available */}
      <section aria-labelledby="stock-disponible-title" className="flex items-center justify-between">
        <div>
          <h2 id="stock-disponible-title" className="text-lg font-semibold text-cyan-400">
            Stock disponible <span className="text-white">— {products.length} {products.length === 1 ? 'producto' : 'productos'}</span>
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            {hasActiveFilters ? 'Resultados que coinciden con los filtros aplicados' : 'Todos los productos registrados en el stock'}
          </p>
        </div>
      </section>

      {/* Products Table */}
      <div ref={printRef} className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Cargando...</div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            No se encontraron productos con los filtros aplicados
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-700/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Código</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Descripción</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Categoría</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Marca</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Modelo</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {products.map((product) => {
                  const isLowStock = lowStockCodes.includes(product.codigoBarras);
                  const minStock = getMinStockForProduct(product);
                  
                  return (
                    <tr key={product.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-4 py-3 text-sm font-mono text-slate-300">{product.codigoBarras}</td>
                      <td className="px-4 py-3 text-sm text-white">{product.descripcion}</td>
                      <td className="px-4 py-3 text-sm text-slate-400">{product.categoria}</td>
                      <td className="px-4 py-3 text-sm text-slate-400">{product.marca}</td>
                      <td className="px-4 py-3 text-sm text-slate-400">{product.modelo}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isLowStock && (
                            <AlertTriangle className="w-4 h-4 text-amber-400" aria-label={`Mínimo: ${minStock}`} />
                          )}
                          <span className={`text-sm font-bold ${
                            product.stockActual === 0 
                              ? 'text-red-400' 
                              : isLowStock 
                                ? 'text-amber-400' 
                                : 'text-green-400'
                          }`}>
                            {product.stockActual}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Product Modal */}
      {showCreateModal && (
        <ProductFormModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => refresh()}
        />
      )}
    </div>
  );
}
