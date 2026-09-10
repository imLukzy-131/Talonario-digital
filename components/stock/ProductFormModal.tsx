'use client';

import { useState } from 'react';
import { X, Package, AlertCircle, Check } from 'lucide-react';
import { useProducts } from '@/hooks/useStock';
import { getCurrentUser } from '@/utils/permissions';
import { Product } from '@/types/index';

interface ProductFormModalProps {
  onClose: () => void;
  onCreated?: (product: Product) => void;
  initialCodigoBarras?: string;
}

export default function ProductFormModal({ onClose, onCreated, initialCodigoBarras = '' }: ProductFormModalProps) {
  const currentUser = getCurrentUser();
  const { createProduct } = useProducts();

  const [form, setForm] = useState({
    codigoBarras: initialCodigoBarras,
    categoria: '',
    subCategoria: '',
    marca: '',
    modelo: '',
    descripcion: '',
    stockInicial: '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.codigoBarras.trim()) {
      setError('El código de barras es obligatorio');
      return;
    }
    if (!form.descripcion.trim()) {
      setError('La descripción es obligatoria');
      return;
    }
    const stockInicial = parseInt(form.stockInicial) || 0;
    if (stockInicial < 0) {
      setError('El stock inicial no puede ser negativo');
      return;
    }

    try {
      const newProduct = createProduct(
        {
          codigoBarras: form.codigoBarras.trim(),
          categoria: form.categoria.trim() || 'Sin categoría',
          subCategoria: form.subCategoria.trim(),
          marca: form.marca.trim(),
          modelo: form.modelo.trim(),
          descripcion: form.descripcion.trim(),
          stockInicial,
          usuarioResponsable: currentUser.nombre,
        },
        currentUser.nombre
      );
      if (onCreated) onCreated(newProduct);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el producto');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <Package className="w-5 h-5 text-cyan-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Nuevo Producto</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-cyan-400 mb-1">
              Código de Barras <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.codigoBarras}
              onChange={(e) => handleChange('codigoBarras', e.target.value)}
              placeholder="Código único del producto"
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-cyan-400 mb-1">
              Descripción <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.descripcion}
              onChange={(e) => handleChange('descripcion', e.target.value)}
              placeholder="Descripción del producto"
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-cyan-400 mb-1">Categoría</label>
              <input
                type="text"
                value={form.categoria}
                onChange={(e) => handleChange('categoria', e.target.value)}
                placeholder="Categoría"
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-cyan-400 mb-1">Subcategoría</label>
              <input
                type="text"
                value={form.subCategoria}
                onChange={(e) => handleChange('subCategoria', e.target.value)}
                placeholder="Subcategoría"
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-cyan-400 mb-1">Marca</label>
              <input
                type="text"
                value={form.marca}
                onChange={(e) => handleChange('marca', e.target.value)}
                placeholder="Marca"
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-cyan-400 mb-1">Modelo</label>
              <input
                type="text"
                value={form.modelo}
                onChange={(e) => handleChange('modelo', e.target.value)}
                placeholder="Modelo"
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-cyan-400 mb-1">Stock Inicial</label>
            <input
              type="number"
              min="0"
              value={form.stockInicial}
              onChange={(e) => handleChange('stockInicial', e.target.value)}
              placeholder="0"
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Crear Producto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
