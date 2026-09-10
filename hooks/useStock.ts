/**
 * Hooks de Stock - Gestión de estado para componentes
 * 
 * Estos hooks conectan los componentes con stockService.
 * Manejan loading, errores y refetch de datos.
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  Product, 
  StockMovement, 
  StockAlert, 
  StockStats,
  TipoMovimiento,
  RazonAjuste 
} from '@/types/index';
import * as stockService from '@/utils/stockService';

// =====================================================
// useProducts - Gestión de productos
// =====================================================

interface ProductFilters {
  categoria?: string;
  subCategoria?: string;
  marca?: string;
  busqueda?: string;
  soloConStock?: boolean;
  soloBajoMinimo?: boolean;
}

export function useProducts(initialFilters?: ProductFilters) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProductFilters>(initialFilters || {});

  const loadProducts = useCallback(() => {
    setLoading(true);
    setError(null);
    try {
      const data = stockService.searchProducts(filters);
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando productos');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const createProduct = useCallback((
    data: Omit<Product, 'id' | 'stockActual' | 'fechaCreacion' | 'fechaActualizacion'>,
    usuarioNombre: string
  ) => {
    try {
      const newProduct = stockService.createProduct(data, usuarioNombre);
      loadProducts();
      return newProduct;
    } catch (err) {
      throw err;
    }
  }, [loadProducts]);

  const updateProduct = useCallback((
    id: string,
    data: Partial<Omit<Product, 'id' | 'fechaCreacion'>>,
    usuarioNombre: string
  ) => {
    try {
      const updated = stockService.updateProduct(id, data, usuarioNombre);
      loadProducts();
      return updated;
    } catch (err) {
      throw err;
    }
  }, [loadProducts]);

  const deleteProduct = useCallback((id: string) => {
    stockService.deleteProduct(id);
    loadProducts();
  }, [loadProducts]);

  const bulkImportProducts = useCallback((
    rows: stockService.BulkImportRow[],
    usuarioNombre: string
  ) => {
    const result = stockService.bulkImportProducts(rows, usuarioNombre);
    loadProducts();
    return result;
  }, [loadProducts]);

  return {
    products,
    loading,
    error,
    filters,
    setFilters,
    refresh: loadProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    bulkImportProducts,
  };
}

// =====================================================
// useStockMovements - Gestión de movimientos
// =====================================================

interface MovementFilters {
  tipo?: TipoMovimiento;
  codigoBarras?: string;
  categoria?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  usuarioId?: string;
}

export function useStockMovements(initialFilters?: MovementFilters) {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<MovementFilters>(initialFilters || {});

  const loadMovements = useCallback(() => {
    setLoading(true);
    setError(null);
    try {
      const data = stockService.getMovements(filters);
      setMovements(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando movimientos');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadMovements();
  }, [loadMovements]);

  const registerEntry = useCallback((
    codigoBarras: string,
    cantidad: number,
    proveedor: string,
    usuarioId: string,
    usuarioNombre: string,
    observaciones?: string,
    fechaRemito?: string
  ) => {
    const result = stockService.registerEntry(
      codigoBarras, 
      cantidad, 
      proveedor, 
      usuarioId, 
      usuarioNombre, 
      observaciones,
      fechaRemito
    );
    loadMovements();
    return result;
  }, [loadMovements]);

  const registerSale = useCallback((
    codigoBarras: string,
    cantidad: number,
    cliente: string,
    usuarioId: string,
    usuarioNombre: string,
    observaciones?: string
  ) => {
    const result = stockService.registerSale(
      codigoBarras, 
      cantidad, 
      cliente, 
      usuarioId, 
      usuarioNombre, 
      observaciones
    );
    loadMovements();
    return result;
  }, [loadMovements]);

  const registerAdjustment = useCallback((
    codigoBarras: string,
    cantidad: number,
    razonAjuste: RazonAjuste,
    usuarioId: string,
    usuarioNombre: string,
    observaciones?: string
  ) => {
    const result = stockService.registerAdjustment(
      codigoBarras, 
      cantidad, 
      razonAjuste, 
      usuarioId, 
      usuarioNombre, 
      observaciones
    );
    loadMovements();
    return result;
  }, [loadMovements]);

  return {
    movements,
    loading,
    error,
    filters,
    setFilters,
    refresh: loadMovements,
    registerEntry,
    registerSale,
    registerAdjustment,
  };
}

// =====================================================
// useStockAlerts - Gestión de alertas
// =====================================================

export function useStockAlerts() {
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Array<{
    product: Product;
    minStock: number;
    currentStock: number;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAlerts = useCallback(() => {
    setLoading(true);
    setError(null);
    try {
      const alertsData = stockService.getAlerts();
      const lowStock = stockService.checkStockAlerts();
      setAlerts(alertsData);
      setLowStockProducts(lowStock);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando alertas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const configureAlert = useCallback((
    minQuantity: number,
    usuarioNombre: string,
    productCode?: string,
    category?: string
  ) => {
    const alert = stockService.configureAlert(minQuantity, usuarioNombre, productCode, category);
    loadAlerts();
    return alert;
  }, [loadAlerts]);

  const deleteAlert = useCallback((id: string) => {
    stockService.deleteAlert(id);
    loadAlerts();
  }, [loadAlerts]);

  return {
    alerts,
    lowStockProducts,
    loading,
    error,
    refresh: loadAlerts,
    configureAlert,
    deleteAlert,
  };
}

// =====================================================
// useStockStats - Estadísticas del dashboard
// =====================================================

export function useStockStats() {
  const [stats, setStats] = useState<StockStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(() => {
    setLoading(true);
    setError(null);
    try {
      const data = stockService.getStockStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando estadísticas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    error,
    refresh: loadStats,
  };
}

// =====================================================
// useStockCategories - Categorías y filtros dinámicos
// =====================================================

export function useStockCategories() {
  const [categories, setCategories] = useState<string[]>([]);
  const [subCategories, setSubCategories] = useState<string[]>([]);
  const [marcas, setMarcas] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCategories = useCallback((selectedCategory?: string) => {
    setLoading(true);
    try {
      setCategories(stockService.getCategories());
      setSubCategories(stockService.getSubCategories(selectedCategory));
      setMarcas(stockService.getMarcas());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return {
    categories,
    subCategories,
    marcas,
    loading,
    refresh: loadCategories,
  };
}
