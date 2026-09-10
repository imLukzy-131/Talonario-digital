/**
 * Stock Service - ÚNICA capa de acceso a datos de stock
 * 
 * Este archivo contiene toda la lógica de negocio del módulo de stock.
 * Los componentes SOLO deben importar funciones de este archivo.
 * 
 * Arquitectura: Componentes → Hooks → StockService → Storage
 * 
 * Para migrar a Google Sheets: solo se modifica stock.ts, este archivo NO cambia.
 */

import { 
  Product, 
  StockMovement, 
  StockAlert, 
  StockStats,
  TipoMovimiento,
  RazonAjuste 
} from '@/types/index';
import {
  loadProductsFromStorage,
  saveProductsToStorage,
  loadMovementsFromStorage,
  saveMovementsToStorage,
  loadAlertsFromStorage,
  saveAlertsToStorage,
  generateId,
  sortByDateDesc,
  sortByCreationDateDesc,
} from '@/utils/stock';

// =====================================================
// PRODUCTOS
// =====================================================

export function getProducts(): Product[] {
  return sortByCreationDateDesc(loadProductsFromStorage());
}

export function getProductByCode(codigoBarras: string): Product | undefined {
  const products = loadProductsFromStorage();
  return products.find(p => p.codigoBarras === codigoBarras);
}

export function getProductById(id: string): Product | undefined {
  const products = loadProductsFromStorage();
  return products.find(p => p.id === id);
}

export function createProduct(
  data: Omit<Product, 'id' | 'stockActual' | 'fechaCreacion' | 'fechaActualizacion'>,
  usuarioNombre: string
): Product {
  const products = loadProductsFromStorage();
  
  // Verificar si ya existe un producto con el mismo código
  if (products.some(p => p.codigoBarras === data.codigoBarras)) {
    throw new Error(`Ya existe un producto con el código ${data.codigoBarras}`);
  }
  
  const now = new Date().toISOString();
  const newProduct: Product = {
    ...data,
    id: generateId(),
    stockActual: data.stockInicial,
    fechaCreacion: now,
    fechaActualizacion: now,
    usuarioResponsable: usuarioNombre,
  };
  
  products.push(newProduct);
  saveProductsToStorage(products);
  return newProduct;
}

export function updateProduct(
  id: string, 
  data: Partial<Omit<Product, 'id' | 'fechaCreacion'>>,
  usuarioNombre: string
): Product {
  const products = loadProductsFromStorage();
  const index = products.findIndex(p => p.id === id);
  
  if (index === -1) {
    throw new Error('Producto no encontrado');
  }
  
  const updatedProduct: Product = {
    ...products[index],
    ...data,
    fechaActualizacion: new Date().toISOString(),
    usuarioResponsable: usuarioNombre,
  };
  
  products[index] = updatedProduct;
  saveProductsToStorage(products);
  return updatedProduct;
}

export function deleteProduct(id: string): void {
  const products = loadProductsFromStorage();
  const filtered = products.filter(p => p.id !== id);
  saveProductsToStorage(filtered);
}

// Resultado de una importación masiva
export interface BulkImportResult {
  creados: number;
  omitidos: number;
  errores: Array<{ fila: number; codigoBarras: string; motivo: string }>;
}

// Datos de un producto a importar (sin campos generados por el sistema)
export interface BulkImportRow {
  codigoBarras: string;
  categoria: string;
  subCategoria: string;
  marca: string;
  modelo: string;
  descripcion: string;
  stockInicial: number;
}

/**
 * Importa una lista grande de productos de una sola vez.
 * - Omite (no lanza error) los productos cuyo código ya existe o cuyo código duplica dentro del mismo lote.
 * - Valida que el código de barras y la descripción no estén vacíos.
 * - Registra cada fila fallida con su motivo para dar feedback al usuario.
 */
export function bulkImportProducts(
  rows: BulkImportRow[],
  usuarioNombre: string
): BulkImportResult {
  const products = loadProductsFromStorage();
  const existingCodes = new Set(products.map(p => p.codigoBarras));
  const result: BulkImportResult = { creados: 0, omitidos: 0, errores: [] };
  const now = new Date().toISOString();

  rows.forEach((row, index) => {
    const fila = index + 1;
    const codigo = row.codigoBarras?.trim();

    if (!codigo) {
      result.errores.push({ fila, codigoBarras: '', motivo: 'Código de barras vacío' });
      return;
    }

    if (!row.descripcion?.trim()) {
      result.errores.push({ fila, codigoBarras: codigo, motivo: 'Descripción vacía' });
      return;
    }

    if (existingCodes.has(codigo)) {
      result.omitidos++;
      result.errores.push({ fila, codigoBarras: codigo, motivo: 'Código ya existente, omitido' });
      return;
    }

    const stockInicial = Number(row.stockInicial) || 0;
    if (stockInicial < 0) {
      result.errores.push({ fila, codigoBarras: codigo, motivo: 'Stock inicial negativo' });
      return;
    }

    const newProduct: Product = {
      id: generateId(),
      codigoBarras: codigo,
      categoria: row.categoria?.trim() || 'Sin categoría',
      subCategoria: row.subCategoria?.trim() || '',
      marca: row.marca?.trim() || '',
      modelo: row.modelo?.trim() || '',
      descripcion: row.descripcion.trim(),
      stockInicial,
      stockActual: stockInicial,
      fechaCreacion: now,
      fechaActualizacion: now,
      usuarioResponsable: usuarioNombre,
    };

    products.push(newProduct);
    existingCodes.add(codigo);
    result.creados++;
  });

  saveProductsToStorage(products);
  return result;
}

// =====================================================
// MOVIMIENTOS DE STOCK
// =====================================================

interface MovementFilters {
  tipo?: TipoMovimiento;
  codigoBarras?: string;
  categoria?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  usuarioId?: string;
}

export function getMovements(filters?: MovementFilters): StockMovement[] {
  let movements = loadMovementsFromStorage();
  
  if (filters) {
    if (filters.tipo) {
      movements = movements.filter(m => m.tipo === filters.tipo);
    }
    if (filters.codigoBarras) {
      movements = movements.filter(m => m.codigoBarras === filters.codigoBarras);
    }
    if (filters.categoria) {
      movements = movements.filter(m => m.categoria === filters.categoria);
    }
    if (filters.fechaDesde) {
      movements = movements.filter(m => m.fecha >= filters.fechaDesde!);
    }
    if (filters.fechaHasta) {
      movements = movements.filter(m => m.fecha <= filters.fechaHasta!);
    }
    if (filters.usuarioId) {
      movements = movements.filter(m => m.usuarioId === filters.usuarioId);
    }
  }
  
  // SIEMPRE ordenar por fecha descendente (recientes primero)
  return sortByDateDesc(movements);
}

function createMovement(
  tipo: TipoMovimiento,
  product: Product,
  cantidad: number,
  usuarioId: string,
  usuarioNombre: string,
  observaciones: string,
  extra?: {
    proveedor?: string;
    fechaRemito?: string;
    cliente?: string;
    razonAjuste?: RazonAjuste;
  }
): StockMovement {
  const now = new Date().toISOString();
  
  const movement: StockMovement = {
    id: generateId(),
    fecha: now,
    tipo,
    codigoBarras: product.codigoBarras,
    categoria: product.categoria,
    subCategoria: product.subCategoria,
    marca: product.marca,
    modelo: product.modelo,
    descripcion: product.descripcion,
    cantidad,
    observaciones,
    usuarioId,
    usuarioNombre,
    fechaCreacion: now,
    fechaActualizacion: now,
    ...extra,
  };
  
  const movements = loadMovementsFromStorage();
  movements.push(movement);
  saveMovementsToStorage(movements);
  
  return movement;
}

export function registerEntry(
  codigoBarras: string,
  cantidad: number,
  proveedor: string,
  usuarioId: string,
  usuarioNombre: string,
  observaciones: string = '',
  fechaRemito: string = ''
): { movement: StockMovement; product: Product } {
  const product = getProductByCode(codigoBarras);
  if (!product) {
    throw new Error(`Producto con código ${codigoBarras} no encontrado`);
  }
  
  if (cantidad <= 0) {
    throw new Error('La cantidad debe ser mayor a 0');
  }
  
  // Crear movimiento
  const movement = createMovement(
    'entrada',
    product,
    cantidad,
    usuarioId,
    usuarioNombre,
    observaciones,
    { proveedor, fechaRemito: fechaRemito || undefined }
  );
  
  // Actualizar stock del producto
  const updatedProduct = updateProduct(
    product.id,
    { stockActual: product.stockActual + cantidad },
    usuarioNombre
  );
  
  return { movement, product: updatedProduct };
}

export function registerSale(
  codigoBarras: string,
  cantidad: number,
  cliente: string,
  usuarioId: string,
  usuarioNombre: string,
  observaciones: string = ''
): { movement: StockMovement; product: Product } {
  const product = getProductByCode(codigoBarras);
  if (!product) {
    throw new Error(`Producto con código ${codigoBarras} no encontrado`);
  }
  
  if (cantidad <= 0) {
    throw new Error('La cantidad debe ser mayor a 0');
  }
  
  if (product.stockActual < cantidad) {
    throw new Error(`Stock insuficiente. Disponible: ${product.stockActual}`);
  }
  
  // Crear movimiento
  const movement = createMovement(
    'venta',
    product,
    cantidad,
    usuarioId,
    usuarioNombre,
    observaciones,
    { cliente }
  );
  
  // Actualizar stock del producto
  const updatedProduct = updateProduct(
    product.id,
    { stockActual: product.stockActual - cantidad },
    usuarioNombre
  );
  
  return { movement, product: updatedProduct };
}

export function registerAdjustment(
  codigoBarras: string,
  cantidad: number,
  razonAjuste: RazonAjuste,
  usuarioId: string,
  usuarioNombre: string,
  observaciones: string = ''
): { movement: StockMovement; product: Product } {
  const product = getProductByCode(codigoBarras);
  if (!product) {
    throw new Error(`Producto con código ${codigoBarras} no encontrado`);
  }
  
  // cantidad puede ser positiva (agregar) o negativa (restar)
  const newStock = product.stockActual + cantidad;
  if (newStock < 0) {
    throw new Error(`El ajuste resultaría en stock negativo (${newStock})`);
  }
  
  // Crear movimiento
  const movement = createMovement(
    'ajuste',
    product,
    cantidad,
    usuarioId,
    usuarioNombre,
    observaciones,
    { razonAjuste }
  );
  
  // Actualizar stock del producto
  const updatedProduct = updateProduct(
    product.id,
    { stockActual: newStock },
    usuarioNombre
  );
  
  return { movement, product: updatedProduct };
}

// =====================================================
// ALERTAS DE STOCK
// =====================================================

export function getAlerts(): StockAlert[] {
  return sortByCreationDateDesc(loadAlertsFromStorage());
}

export function configureAlert(
  minQuantity: number,
  usuarioNombre: string,
  productCode?: string,
  category?: string
): StockAlert {
  if (!productCode && !category) {
    throw new Error('Debe especificar un producto o una categoría');
  }
  
  const alerts = loadAlertsFromStorage();
  const now = new Date().toISOString();
  
  // Buscar alerta existente
  const existingIndex = alerts.findIndex(a => 
    (productCode && a.productCode === productCode) ||
    (!productCode && a.category === category && !a.productCode)
  );
  
  if (existingIndex !== -1) {
    // Actualizar existente
    alerts[existingIndex] = {
      ...alerts[existingIndex],
      minQuantity,
      fechaActualizacion: now,
      usuarioResponsable: usuarioNombre,
    };
    saveAlertsToStorage(alerts);
    return alerts[existingIndex];
  }
  
  // Crear nueva
  const newAlert: StockAlert = {
    id: generateId(),
    productCode,
    category,
    minQuantity,
    notificado: false,
    fechaCreacion: now,
    fechaActualizacion: now,
    usuarioResponsable: usuarioNombre,
  };
  
  alerts.push(newAlert);
  saveAlertsToStorage(alerts);
  return newAlert;
}

export function deleteAlert(id: string): void {
  const alerts = loadAlertsFromStorage();
  const filtered = alerts.filter(a => a.id !== id);
  saveAlertsToStorage(filtered);
}

export function getMinStockForProduct(product: Product): number | null {
  const alerts = loadAlertsFromStorage();
  
  // Prioridad 1: Alerta individual del producto
  const productAlert = alerts.find(a => a.productCode === product.codigoBarras);
  if (productAlert) {
    return productAlert.minQuantity;
  }
  
  // Prioridad 2: Alerta por categoría
  const categoryAlert = alerts.find(a => a.category === product.categoria && !a.productCode);
  if (categoryAlert) {
    return categoryAlert.minQuantity;
  }
  
  return null;
}

export function checkStockAlerts(): Array<{ product: Product; minStock: number; currentStock: number }> {
  const products = loadProductsFromStorage();
  const lowStockProducts: Array<{ product: Product; minStock: number; currentStock: number }> = [];
  
  for (const product of products) {
    const minStock = getMinStockForProduct(product);
    if (minStock !== null && product.stockActual < minStock) {
      lowStockProducts.push({
        product,
        minStock,
        currentStock: product.stockActual,
      });
    }
  }
  
  return lowStockProducts;
}

// =====================================================
// ESTADÍSTICAS
// =====================================================

export function getStockStats(): StockStats {
  const products = loadProductsFromStorage();
  const movements = loadMovementsFromStorage();
  
  return {
    totalProductos: products.length,
    productosConStock: products.filter(p => p.stockActual > 0).length,
    productosSinStock: products.filter(p => p.stockActual === 0).length,
    productosBajoMinimo: checkStockAlerts().length,
    totalEntradas: movements.filter(m => m.tipo === 'entrada').length,
    totalVentas: movements.filter(m => m.tipo === 'venta').length,
    totalAjustes: movements.filter(m => m.tipo === 'ajuste').length,
  };
}

// =====================================================
// BÚSQUEDA Y FILTROS
// =====================================================

interface ProductFilters {
  categoria?: string;
  subCategoria?: string;
  marca?: string;
  busqueda?: string;
  soloConStock?: boolean;
  soloBajoMinimo?: boolean;
}

export function searchProducts(filters?: ProductFilters): Product[] {
  let products = loadProductsFromStorage();
  
  if (filters) {
    if (filters.categoria) {
      products = products.filter(p => p.categoria === filters.categoria);
    }
    if (filters.subCategoria) {
      products = products.filter(p => p.subCategoria === filters.subCategoria);
    }
    if (filters.marca) {
      products = products.filter(p => p.marca === filters.marca);
    }
    if (filters.busqueda) {
      const search = filters.busqueda.toLowerCase();
      products = products.filter(p =>
        p.descripcion.toLowerCase().includes(search) ||
        p.codigoBarras.toLowerCase().includes(search) ||
        p.modelo.toLowerCase().includes(search) ||
        p.marca.toLowerCase().includes(search)
      );
    }
    if (filters.soloConStock) {
      products = products.filter(p => p.stockActual > 0);
    }
    if (filters.soloBajoMinimo) {
      const lowStock = checkStockAlerts();
      const lowStockCodes = lowStock.map(l => l.product.codigoBarras);
      products = products.filter(p => lowStockCodes.includes(p.codigoBarras));
    }
  }
  
  return sortByCreationDateDesc(products);
}

export function getCategories(): string[] {
  const products = loadProductsFromStorage();
  const categories = [...new Set(products.map(p => p.categoria))];
  return categories.sort();
}

export function getSubCategories(categoria?: string): string[] {
  let products = loadProductsFromStorage();
  if (categoria) {
    products = products.filter(p => p.categoria === categoria);
  }
  const subCategories = [...new Set(products.map(p => p.subCategoria))];
  return subCategories.sort();
}

export function getMarcas(): string[] {
  const products = loadProductsFromStorage();
  const marcas = [...new Set(products.map(p => p.marca))];
  return marcas.sort();
}
