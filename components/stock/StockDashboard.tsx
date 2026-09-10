'use client';

import { Package, TrendingUp, TrendingDown, AlertTriangle, ArrowUpCircle, ArrowDownCircle, Settings, FileSpreadsheet } from 'lucide-react';
import { useStockStats, useStockAlerts } from '@/hooks/useStock';

interface StockDashboardProps {
  onNavigate: (view: string) => void;
}

export default function StockDashboard({ onNavigate }: StockDashboardProps) {
  const { stats, loading: statsLoading } = useStockStats();
  const { lowStockProducts, loading: alertsLoading } = useStockAlerts();

  const loading = statsLoading || alertsLoading;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Productos */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-cyan-500/50 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Productos</p>
              <p className="text-3xl font-bold text-white mt-1">
                {loading ? '...' : stats?.totalProductos || 0}
              </p>
            </div>
            <div className="p-3 bg-cyan-500/20 rounded-lg">
              <Package className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
        </div>

        {/* Con Stock */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-green-500/50 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Con Stock</p>
              <p className="text-3xl font-bold text-green-400 mt-1">
                {loading ? '...' : stats?.productosConStock || 0}
              </p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        {/* Sin Stock */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-red-500/50 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Sin Stock</p>
              <p className="text-3xl font-bold text-red-400 mt-1">
                {loading ? '...' : stats?.productosSinStock || 0}
              </p>
            </div>
            <div className="p-3 bg-red-500/20 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </div>

        {/* Bajo Mínimo */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-amber-500/50 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Bajo Mínimo</p>
              <p className="text-3xl font-bold text-amber-400 mt-1">
                {loading ? '...' : stats?.productosBajoMinimo || 0}
              </p>
            </div>
            <div className="p-3 bg-amber-500/20 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Movement Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <ArrowUpCircle className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-slate-400 text-sm">Total Entradas</p>
              <p className="text-xl font-bold text-white">{loading ? '...' : stats?.totalEntradas || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <ArrowDownCircle className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-slate-400 text-sm">Total Ventas</p>
              <p className="text-xl font-bold text-white">{loading ? '...' : stats?.totalVentas || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-purple-400" />
            <div>
              <p className="text-slate-400 text-sm">Total Ajustes</p>
              <p className="text-xl font-bold text-white">{loading ? '...' : stats?.totalAjustes || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <button
          onClick={() => onNavigate('entry')}
          className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 hover:bg-green-500/30 transition-colors text-center"
        >
          <ArrowUpCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <p className="text-green-400 font-semibold">Nueva Entrada</p>
        </button>
        <button
          onClick={() => onNavigate('import')}
          className="bg-cyan-500/20 border border-cyan-500/50 rounded-lg p-4 hover:bg-cyan-500/30 transition-colors text-center"
        >
          <FileSpreadsheet className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
          <p className="text-cyan-400 font-semibold">Importar Lista</p>
        </button>
        <button
          onClick={() => onNavigate('sale')}
          className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 hover:bg-blue-500/30 transition-colors text-center"
        >
          <ArrowDownCircle className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <p className="text-blue-400 font-semibold">Nueva Venta</p>
        </button>
        <button
          onClick={() => onNavigate('adjustment')}
          className="bg-purple-500/20 border border-purple-500/50 rounded-lg p-4 hover:bg-purple-500/30 transition-colors text-center"
        >
          <Settings className="w-8 h-8 text-purple-400 mx-auto mb-2" />
          <p className="text-purple-400 font-semibold">Ajuste</p>
        </button>
        <button
          onClick={() => onNavigate('list')}
          className="bg-cyan-500/20 border border-cyan-500/50 rounded-lg p-4 hover:bg-cyan-500/30 transition-colors text-center"
        >
          <Package className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
          <p className="text-cyan-400 font-semibold">Ver Stock</p>
        </button>
      </div>

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-semibold text-amber-400">Productos con Stock Bajo</h3>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {lowStockProducts.slice(0, 5).map((item) => (
              <div 
                key={item.product.id} 
                className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3"
              >
                <div>
                  <p className="text-white font-medium">{item.product.descripcion}</p>
                  <p className="text-slate-400 text-sm">{item.product.codigoBarras}</p>
                </div>
                <div className="text-right">
                  <p className="text-red-400 font-bold">{item.currentStock} unid.</p>
                  <p className="text-slate-500 text-xs">Mín: {item.minStock}</p>
                </div>
              </div>
            ))}
          </div>
          {lowStockProducts.length > 5 && (
            <button 
              onClick={() => onNavigate('alerts')}
              className="mt-3 text-amber-400 hover:text-amber-300 text-sm"
            >
              Ver todos ({lowStockProducts.length} productos)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
