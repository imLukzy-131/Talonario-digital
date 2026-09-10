'use client';

import { useState } from 'react';
import { ArrowLeft, Settings, Search, AlertCircle, Check } from 'lucide-react';
import { useStockMovements, useProducts } from '@/hooks/useStock';
import { getCurrentUser, canRegisterStockAdjustment } from '@/utils/permissions';
import { getProductByCode } from '@/utils/stockService';
import { Product, RazonAjuste } from '@/types/index';

interface StockAdjustmentPageProps {
  onBack: () => void;
}

const RAZONES_AJUSTE: { value: RazonAjuste; label: string; description: string }[] = [
  { value: 'Corrección', label: 'Corrección de Stock', description: 'Ajuste manual por error de conteo' },
  { value: 'Dañado', label: 'Producto Dañado', description: 'Producto descartado por daño' },
  { value: 'Diferencia', label: 'Diferencia de Inventario', description: 'Diferencia encontrada en inventario físico' },
];

export default function StockAdjustmentPage({ onBack }: StockAdjustmentPageProps) {
  const currentUser = getCurrentUser();
  const hasPermission = canRegisterStockAdjustment(currentUser);
  const { registerAdjustment } = useStockMovements();
  const { products } = useProducts();
  
  const [codigoBarras, setCodigoBarras] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [tipoAjuste, setTipoAjuste] = useState<'sumar' | 'restar'>('sumar');
  const [razonAjuste, setRazonAjuste] = useState<RazonAjuste>('Corrección');
  const [observaciones, setObservaciones] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchProduct = () => {
    setError(null);
    const product = getProductByCode(codigoBarras);
    if (product) {
      setSelectedProduct(product);
    } else {
      setError(`Producto con código ${codigoBarras} no encontrado`);
      setSelectedProduct(null);
    }
  };

  const handleSelectFromList = (product: Product) => {
    setSelectedProduct(product);
    setCodigoBarras(product.codigoBarras);
    setShowProductSearch(false);
    setSearchTerm('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedProduct) {
      setError('Debe seleccionar un producto');
      return;
    }

    const cantidadNum = parseInt(cantidad);
    if (!cantidad || cantidadNum <= 0) {
      setError('La cantidad debe ser mayor a 0');
      return;
    }

    const ajuste = tipoAjuste === 'sumar' ? cantidadNum : -cantidadNum;
    const nuevoStock = selectedProduct.stockActual + ajuste;
    
    if (nuevoStock < 0) {
      setError(`El ajuste resultaría en stock negativo (${nuevoStock})`);
      return;
    }

    if (!observaciones.trim()) {
      setError('Debe ingresar una observación explicando el ajuste');
      return;
    }

    try {
      registerAdjustment(
        selectedProduct.codigoBarras,
        ajuste,
        razonAjuste,
        currentUser.id,
        currentUser.nombre,
        observaciones.trim()
      );
      
      const tipoTexto = tipoAjuste === 'sumar' ? 'agregadas' : 'descontadas';
      setSuccess(`Ajuste registrado: ${cantidadNum} unidades ${tipoTexto} de ${selectedProduct.descripcion}. Nuevo stock: ${nuevoStock}`);
      
      // Reset form
      setCodigoBarras('');
      setCantidad('');
      setObservaciones('');
      setSelectedProduct(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar ajuste');
    }
  };

  const filteredProducts = products.filter(p =>
    p.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.codigoBarras.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.marca.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!hasPermission) {
    return (
      <div className="min-h-screen bg-slate-900 p-8">
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-400 mb-2">Acceso Denegado</h2>
          <p className="text-slate-400">No tienes permiso para registrar ajustes de stock.</p>
          <button onClick={onBack} className="mt-4 text-cyan-400 hover:text-cyan-300">
            Volver
          </button>
        </div>
      </div>
    );
  }

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
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Settings className="w-6 h-6 text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Ajuste de Inventario</h1>
        </div>
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-6">
        {/* Product Search */}
        <div>
          <label className="block text-sm font-semibold text-cyan-400 mb-2">
            Código de Barras <span className="text-red-400">*</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={codigoBarras}
              onChange={(e) => setCodigoBarras(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearchProduct())}
              placeholder="Escanear o ingresar código"
              className="flex-1 bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleSearchProduct}
              className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-lg text-cyan-400 hover:bg-cyan-500/30 transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setShowProductSearch(true)}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-600 transition-colors"
            >
              Buscar
            </button>
          </div>
        </div>

        {/* Selected Product Info */}
        {selectedProduct && (
          <div className="bg-purple-500/10 border border-purple-500/50 rounded-lg p-4">
            <p className="text-purple-400 font-semibold">{selectedProduct.descripcion}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm">
              <p className="text-slate-400">Código: <span className="text-white">{selectedProduct.codigoBarras}</span></p>
              <p className="text-slate-400">Marca: <span className="text-white">{selectedProduct.marca}</span></p>
              <p className="text-slate-400">Modelo: <span className="text-white">{selectedProduct.modelo}</span></p>
              <p className="text-slate-400">Stock Actual: <span className="text-cyan-400 font-bold">{selectedProduct.stockActual}</span></p>
            </div>
          </div>
        )}

        {/* Adjustment Type */}
        <div>
          <label className="block text-sm font-semibold text-cyan-400 mb-2">
            Tipo de Ajuste <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setTipoAjuste('sumar')}
              className={`p-4 rounded-lg border transition-colors ${
                tipoAjuste === 'sumar'
                  ? 'bg-green-500/20 border-green-500/50 text-green-400'
                  : 'bg-slate-700/50 border-slate-600 text-slate-400 hover:border-slate-500'
              }`}
            >
              <p className="font-semibold">+ Sumar Stock</p>
              <p className="text-sm opacity-75">Agregar unidades al inventario</p>
            </button>
            <button
              type="button"
              onClick={() => setTipoAjuste('restar')}
              className={`p-4 rounded-lg border transition-colors ${
                tipoAjuste === 'restar'
                  ? 'bg-red-500/20 border-red-500/50 text-red-400'
                  : 'bg-slate-700/50 border-slate-600 text-slate-400 hover:border-slate-500'
              }`}
            >
              <p className="font-semibold">- Restar Stock</p>
              <p className="text-sm opacity-75">Descontar unidades del inventario</p>
            </button>
          </div>
        </div>

        {/* Quantity and Reason */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-cyan-400 mb-2">
              Cantidad <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              placeholder="0"
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none"
            />
            {selectedProduct && cantidad && (
              <p className="text-sm mt-2">
                <span className="text-slate-400">Nuevo stock: </span>
                <span className={`font-bold ${
                  selectedProduct.stockActual + (tipoAjuste === 'sumar' ? parseInt(cantidad) || 0 : -(parseInt(cantidad) || 0)) < 0
                    ? 'text-red-400'
                    : 'text-green-400'
                }`}>
                  {selectedProduct.stockActual + (tipoAjuste === 'sumar' ? parseInt(cantidad) || 0 : -(parseInt(cantidad) || 0))}
                </span>
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-cyan-400 mb-2">
              Razón del Ajuste <span className="text-red-400">*</span>
            </label>
            <select
              value={razonAjuste}
              onChange={(e) => setRazonAjuste(e.target.value as RazonAjuste)}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
            >
              {RAZONES_AJUSTE.map((razon) => (
                <option key={razon.value} value={razon.value}>
                  {razon.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">
              {RAZONES_AJUSTE.find(r => r.value === razonAjuste)?.description}
            </p>
          </div>
        </div>

        {/* Observations */}
        <div>
          <label className="block text-sm font-semibold text-cyan-400 mb-2">
            Observaciones <span className="text-red-400">*</span>
          </label>
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Detalle el motivo del ajuste..."
            rows={3}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none resize-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!selectedProduct}
          className="w-full py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Settings className="w-5 h-5" />
          Registrar Ajuste
        </button>
      </form>

      {/* Product Search Modal */}
      {showProductSearch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Buscar Producto</h3>
                <button
                  onClick={() => setShowProductSearch(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ×
                </button>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por descripción, código o marca..."
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none"
                autoFocus
              />
            </div>
            <div className="p-4 overflow-y-auto max-h-96">
              {filteredProducts.length === 0 ? (
                <p className="text-slate-400 text-center py-8">No se encontraron productos</p>
              ) : (
                <div className="space-y-2">
                  {filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleSelectFromList(product)}
                      className="w-full text-left p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <p className="text-white font-medium">{product.descripcion}</p>
                      <p className="text-slate-400 text-sm">
                        {product.codigoBarras} | {product.marca} {product.modelo} | Stock: {product.stockActual}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
