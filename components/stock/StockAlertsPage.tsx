'use client';

import { useState } from 'react';
import { ArrowLeft, Bell, AlertTriangle, Plus, Trash2, AlertCircle, Check } from 'lucide-react';
import { useStockAlerts, useStockCategories, useProducts } from '@/hooks/useStock';
import { getCurrentUser, canConfigureStockAlerts } from '@/utils/permissions';

interface StockAlertsPageProps {
  onBack: () => void;
}

export default function StockAlertsPage({ onBack }: StockAlertsPageProps) {
  const currentUser = getCurrentUser();
  const canConfigure = canConfigureStockAlerts(currentUser);
  const { alerts, lowStockProducts, configureAlert, deleteAlert, refresh, loading } = useStockAlerts();
  const { categories } = useStockCategories();
  const { products } = useProducts();
  
  const [showNewAlert, setShowNewAlert] = useState(false);
  const [alertType, setAlertType] = useState<'category' | 'product'>('category');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProductCode, setSelectedProductCode] = useState('');
  const [minQuantity, setMinQuantity] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleCreateAlert = () => {
    setError(null);
    setSuccess(null);

    if (!minQuantity || parseInt(minQuantity) < 0) {
      setError('La cantidad mínima debe ser un número válido');
      return;
    }

    if (alertType === 'category' && !selectedCategory) {
      setError('Debe seleccionar una categoría');
      return;
    }

    if (alertType === 'product' && !selectedProductCode) {
      setError('Debe seleccionar un producto');
      return;
    }

    try {
      configureAlert(
        parseInt(minQuantity),
        currentUser.nombre,
        alertType === 'product' ? selectedProductCode : undefined,
        alertType === 'category' ? selectedCategory : undefined
      );
      
      setSuccess('Alerta configurada correctamente');
      setShowNewAlert(false);
      setSelectedCategory('');
      setSelectedProductCode('');
      setMinQuantity('');
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al configurar alerta');
    }
  };

  const handleDeleteAlert = (id: string) => {
    deleteAlert(id);
    refresh();
  };

  const categoryAlerts = alerts.filter(a => a.category && !a.productCode);
  const productAlerts = alerts.filter(a => a.productCode);

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
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <Bell className="w-6 h-6 text-amber-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Alertas de Stock</h1>
          </div>
        </div>
        {canConfigure && (
          <button
            onClick={() => setShowNewAlert(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded-lg text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva Alerta
          </button>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 flex items-center gap-3">
          <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
          <p className="text-green-400">{success}</p>
        </div>
      )}

      {/* Low Stock Products */}
      {lowStockProducts.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-amber-400">
              Productos con Stock Bajo ({lowStockProducts.length})
            </h2>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {lowStockProducts.map((item) => (
              <div 
                key={item.product.id} 
                className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3"
              >
                <div>
                  <p className="text-white font-medium">{item.product.descripcion}</p>
                  <p className="text-slate-400 text-sm">
                    {item.product.codigoBarras} | {item.product.categoria}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-red-400 font-bold">{item.currentStock} unid.</p>
                  <p className="text-slate-500 text-xs">Mínimo: {item.minStock}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alert Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Alerts */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-cyan-400 mb-4">Alertas por Categoría</h3>
          {categoryAlerts.length === 0 ? (
            <p className="text-slate-400 text-center py-4">No hay alertas por categoría configuradas</p>
          ) : (
            <div className="space-y-2">
              {categoryAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between bg-slate-700/50 rounded-lg p-3">
                  <div>
                    <p className="text-white font-medium">{alert.category}</p>
                    <p className="text-slate-400 text-sm">Mínimo: {alert.minQuantity} unidades</p>
                  </div>
                  {canConfigure && (
                    <button
                      onClick={() => handleDeleteAlert(alert.id)}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Alerts */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-cyan-400 mb-4">
            Alertas por Producto
            <span className="text-xs text-slate-500 ml-2 font-normal">(Prioridad sobre categoría)</span>
          </h3>
          {productAlerts.length === 0 ? (
            <p className="text-slate-400 text-center py-4">No hay alertas por producto configuradas</p>
          ) : (
            <div className="space-y-2">
              {productAlerts.map((alert) => {
                const product = products.find(p => p.codigoBarras === alert.productCode);
                return (
                  <div key={alert.id} className="flex items-center justify-between bg-slate-700/50 rounded-lg p-3">
                    <div>
                      <p className="text-white font-medium">{product?.descripcion || alert.productCode}</p>
                      <p className="text-slate-400 text-sm">
                        Código: {alert.productCode} | Mínimo: {alert.minQuantity} unidades
                      </p>
                    </div>
                    {canConfigure && (
                      <button
                        onClick={() => handleDeleteAlert(alert.id)}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Info about priority */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-cyan-400 mb-2">Jerarquía de Alertas</h3>
        <p className="text-slate-400 text-sm">
          1. <span className="text-white">Alerta individual por producto</span> - Tiene máxima prioridad<br/>
          2. <span className="text-white">Alerta por categoría</span> - Se aplica si no existe alerta individual
        </p>
      </div>

      {/* New Alert Modal */}
      {showNewAlert && canConfigure && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg w-full max-w-md">
            <div className="p-4 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Nueva Alerta de Stock</h3>
                <button
                  onClick={() => setShowNewAlert(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-4 space-y-4">
              {/* Alert Type */}
              <div>
                <label className="block text-sm font-semibold text-cyan-400 mb-2">Tipo de Alerta</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAlertType('category')}
                    className={`p-3 rounded-lg border transition-colors ${
                      alertType === 'category'
                        ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                        : 'bg-slate-700/50 border-slate-600 text-slate-400'
                    }`}
                  >
                    Por Categoría
                  </button>
                  <button
                    type="button"
                    onClick={() => setAlertType('product')}
                    className={`p-3 rounded-lg border transition-colors ${
                      alertType === 'product'
                        ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                        : 'bg-slate-700/50 border-slate-600 text-slate-400'
                    }`}
                  >
                    Por Producto
                  </button>
                </div>
              </div>

              {/* Category Select */}
              {alertType === 'category' && (
                <div>
                  <label className="block text-sm font-semibold text-cyan-400 mb-2">Categoría</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Product Select */}
              {alertType === 'product' && (
                <div>
                  <label className="block text-sm font-semibold text-cyan-400 mb-2">Producto</label>
                  <select
                    value={selectedProductCode}
                    onChange={(e) => setSelectedProductCode(e.target.value)}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="">Seleccionar producto</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.codigoBarras}>
                        {p.descripcion} ({p.codigoBarras})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Min Quantity */}
              <div>
                <label className="block text-sm font-semibold text-cyan-400 mb-2">Cantidad Mínima</label>
                <input
                  type="number"
                  min="0"
                  value={minQuantity}
                  onChange={(e) => setMinQuantity(e.target.value)}
                  placeholder="Ej: 5"
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Se mostrará alerta cuando el stock sea menor a este valor
                </p>
              </div>
            </div>
            <div className="p-4 border-t border-slate-700 flex justify-end gap-2">
              <button
                onClick={() => setShowNewAlert(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateAlert}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded-lg text-white transition-colors"
              >
                Crear Alerta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
