'use client';

import { useState } from 'react';
import { ArrowLeft, History, Search, Filter, X, ArrowUpCircle, ArrowDownCircle, Settings } from 'lucide-react';
import { useStockMovements, useStockCategories } from '@/hooks/useStock';
import { TipoMovimiento } from '@/types/index';

interface StockHistoryPageProps {
  onBack: () => void;
}

export default function StockHistoryPage({ onBack }: StockHistoryPageProps) {
  const { categories } = useStockCategories();
  
  const [filters, setFilters] = useState<{
    tipo?: TipoMovimiento;
    categoria?: string;
    codigoBarras?: string;
    fechaDesde?: string;
    fechaHasta?: string;
  }>({});
  
  const { movements, loading } = useStockMovements(filters);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMovements = movements.filter(m =>
    !searchTerm || 
    m.codigoBarras.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.proveedor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.cliente?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  const hasActiveFilters = filters.tipo || filters.categoria || filters.fechaDesde || filters.fechaHasta;

  const getMovementIcon = (tipo: TipoMovimiento) => {
    switch (tipo) {
      case 'entrada':
        return <ArrowUpCircle className="w-5 h-5 text-green-400" />;
      case 'venta':
        return <ArrowDownCircle className="w-5 h-5 text-blue-400" />;
      case 'ajuste':
        return <Settings className="w-5 h-5 text-purple-400" />;
    }
  };

  const getMovementColor = (tipo: TipoMovimiento) => {
    switch (tipo) {
      case 'entrada':
        return 'bg-green-500/10 border-green-500/50';
      case 'venta':
        return 'bg-blue-500/10 border-blue-500/50';
      case 'ajuste':
        return 'bg-purple-500/10 border-purple-500/50';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/20 rounded-lg">
            <History className="w-6 h-6 text-cyan-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Historial de Movimientos</h1>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por código, descripción, proveedor o cliente..."
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
              <label className="block text-xs text-slate-400 mb-1">Tipo de Movimiento</label>
              <select
                value={filters.tipo || ''}
                onChange={(e) => setFilters({ ...filters, tipo: e.target.value as TipoMovimiento || undefined })}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 focus:outline-none"
              >
                <option value="">Todos</option>
                <option value="entrada">Entradas</option>
                <option value="venta">Ventas</option>
                <option value="ajuste">Ajustes</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Categoría</label>
              <select
                value={filters.categoria || ''}
                onChange={(e) => setFilters({ ...filters, categoria: e.target.value || undefined })}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 focus:outline-none"
              >
                <option value="">Todas</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Fecha Desde</label>
              <input
                type="date"
                value={filters.fechaDesde || ''}
                onChange={(e) => setFilters({ ...filters, fechaDesde: e.target.value || undefined })}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Fecha Hasta</label>
              <input
                type="date"
                value={filters.fechaHasta || ''}
                onChange={(e) => setFilters({ ...filters, fechaHasta: e.target.value || undefined })}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm">
        <p className="text-slate-400">
          Mostrando <span className="text-white font-semibold">{filteredMovements.length}</span> movimientos
        </p>
        <p className="text-slate-500 text-xs">Ordenados por fecha (más recientes primero)</p>
      </div>

      {/* Movements List */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 text-center text-slate-400">
            Cargando...
          </div>
        ) : filteredMovements.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 text-center text-slate-400">
            No se encontraron movimientos
          </div>
        ) : (
          filteredMovements.map((movement) => (
            <div
              key={movement.id}
              className={`border rounded-lg p-4 ${getMovementColor(movement.tipo)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {getMovementIcon(movement.tipo)}
                  <div>
                    <p className="text-white font-semibold">{movement.descripcion}</p>
                    <p className="text-slate-400 text-sm">{movement.codigoBarras}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs">
                      <span className="text-slate-500">
                        {movement.tipo === 'entrada' && `Proveedor: ${movement.proveedor}`}
                        {movement.tipo === 'venta' && `Cliente: ${movement.cliente}`}
                        {movement.tipo === 'ajuste' && `Razón: ${movement.razonAjuste}`}
                      </span>
                      <span className="text-slate-500">Usuario: {movement.usuarioNombre}</span>
                      {movement.observaciones && (
                        <span className="text-slate-500">Obs: {movement.observaciones}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${
                    movement.tipo === 'entrada' 
                      ? 'text-green-400' 
                      : movement.tipo === 'venta' 
                        ? 'text-blue-400' 
                        : movement.cantidad >= 0 
                          ? 'text-green-400' 
                          : 'text-red-400'
                  }`}>
                    {movement.tipo === 'entrada' ? '+' : movement.tipo === 'venta' ? '-' : movement.cantidad >= 0 ? '+' : ''}
                    {movement.tipo === 'venta' ? movement.cantidad : movement.cantidad}
                  </p>
                  <p className="text-slate-500 text-xs">{formatDate(movement.fecha)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
