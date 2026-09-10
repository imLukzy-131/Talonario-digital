'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowUpCircle, Search, AlertCircle, Check, PackagePlus } from 'lucide-react';
import { useStockMovements, useProducts } from '@/hooks/useStock';
import { getCurrentUser, canRegisterStockEntry, canManageProducts } from '@/utils/permissions';
import { getProductByCode } from '@/utils/stockService';
import { Product } from '@/types/index';
import ProductFormModal from '@/components/stock/ProductFormModal';

interface StockEntryPageProps {
  onBack: () => void;
}

export default function StockEntryPage({ onBack }: StockEntryPageProps) {
  const currentUser = getCurrentUser();
  const hasPermission = canRegisterStockEntry(currentUser);
  const canCreateProducts = canManageProducts(currentUser);
  const { registerEntry } = useStockMovements();
  const { products } = useProducts();
  
  const [codigoBarras, setCodigoBarras] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [proveedor, setProveedor] = useState('');
  const [fechaRemito, setFechaRemito] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  // Producto no encontrado: pregunta de alta
  const [notFoundCode, setNotFoundCode] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleSearchProduct = () => {
    setError(null);
    setNotFoundCode(null);
    const code = codigoBarras.trim();
    if (!code) {
      setError('Ingrese un código de barras para buscar');
      return;
    }
    const product = getProductByCode(code);
    if (product) {
      setSelectedProduct(product);
    } else {
      setSelectedProduct(null);
      setNotFoundCode(code);
    }
  };

  const handleProductCreated = (product: Product) => {
    setSelectedProduct(product);
    setCodigoBarras(product.codigoBarras);
    setNotFoundCode(null);
    setShowCreateModal(false);
  };

  const handleSelectFromList = (product: Product) => {
    setSelectedProduct(product);
    setCodigoBarras(product.codigoBarras);
    setShowProductSearch(false);
    setSearchTerm('');
    setNotFoundCode(null);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedProduct) {
      setError('Debe seleccionar un producto');
      return;
    }

    if (!cantidad || parseInt(cantidad) <= 0) {
      setError('La cantidad debe ser mayor a 0');
      return;
    }

    if (!proveedor.trim()) {
      setError('Debe ingresar el proveedor');
      return;
    }

    try {
      registerEntry(
        selectedProduct.codigoBarras,
        parseInt(cantidad),
        proveedor.trim(),
        currentUser.id,
        currentUser.nombre,
        observaciones.trim(),
        fechaRemito
      );
      
      setSuccess(`Entrada registrada: ${cantidad} unidades de ${selectedProduct.descripcion}`);
      
      // Reset form
      setCodigoBarras('');
      setCantidad('');
      setProveedor('');
      setFechaRemito('');
      setObservaciones('');
      setSelectedProduct(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar entrada');
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
          <p className="text-slate-400">No tienes permiso para registrar entradas de stock.</p>
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
          <div className="p-2 bg-green-500/20 rounded-lg">
            <ArrowUpCircle className="w-6 h-6 text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Registrar Entrada</h1>
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
          <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4">
            <p className="text-green-400 font-semibold">{selectedProduct.descripcion}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm">
              <p className="text-slate-400">Código: <span className="text-white">{selectedProduct.codigoBarras}</span></p>
              <p className="text-slate-400">Marca: <span className="text-white">{selectedProduct.marca}</span></p>
              <p className="text-slate-400">Modelo: <span className="text-white">{selectedProduct.modelo}</span></p>
              <p className="text-slate-400">Stock Actual: <span className="text-cyan-400 font-bold">{selectedProduct.stockActual}</span></p>
            </div>
          </div>
        )}

        {/* Producto no encontrado: preguntar si desea cargarlo */}
        {notFoundCode && !selectedProduct && (
          <div className="bg-amber-500/10 border border-amber-500/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-amber-400 font-semibold">
                  El producto con código <span className="font-mono">{notFoundCode}</span> no existe en el stock
                </p>
                <p className="text-slate-400 text-sm mt-1">
                  {canCreateProducts
                    ? '¿Deseas cargarlo como nuevo producto para poder registrar la entrada?'
                    : 'No tienes permiso para crear productos. Contacta a un administrador.'}
                </p>
                {canCreateProducts && (
                  <div className="flex gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition-colors"
                    >
                      <PackagePlus className="w-4 h-4" />
                      Cargar producto
                    </button>
                    <button
                      type="button"
                      onClick={() => setNotFoundCode(null)}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-semibold rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quantity, Provider and Remito Date */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </div>
          <div>
            <label className="block text-sm font-semibold text-cyan-400 mb-2">
              Proveedor <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={proveedor}
              onChange={(e) => setProveedor(e.target.value)}
              placeholder="Nombre del proveedor"
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-cyan-400 mb-2">
              Fecha del Remito <span className="text-slate-500">(opcional)</span>
            </label>
            <input
              type="date"
              value={fechaRemito}
              onChange={(e) => setFechaRemito(e.target.value)}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Observations */}
        <div>
          <label className="block text-sm font-semibold text-cyan-400 mb-2">
            Observaciones <span className="text-slate-500">(opcional)</span>
          </label>
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Notas adicionales..."
            rows={3}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none resize-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!selectedProduct}
          className="w-full py-3 bg-green-500 hover:bg-green-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <ArrowUpCircle className="w-5 h-5" />
          Registrar Entrada
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

      {/* Create Product Modal */}
      {showCreateModal && (
        <ProductFormModal
          initialCodigoBarras={notFoundCode || codigoBarras}
          onClose={() => setShowCreateModal(false)}
          onCreated={handleProductCreated}
        />
      )}
    </div>
  );
}
