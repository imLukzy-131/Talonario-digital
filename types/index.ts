// Interfaz de entrada en historial técnico
export interface HistorialEntry {
  fecha: string;
  estado: string;
  detalle: string;
  tecnico: string;
}

// Interfaz de usuario del sistema
export interface User {
  id: string;
  nombre: string;
  apellido: string;
  usuario: string;
  contraseña: string;
  rol: 'Administrador' | 'Técnico' | 'Administrativo';
  activo: boolean;
  createdAt: string;
}

// Interfaz de servicio técnico
export interface Service {
  id: string;
  nombre: string;
  descripcion: string;
  precioBase: number;
  categoria: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

// Interfaz de orden de reparación
export interface Order {
  numeroOrden: string;
  fecha: string;
  nombre: string;
  apellido: string;
  telefono: string;
  tipoEquipo: string;
  marca: string;
  modelo: string;
  servicioSolicitado: string;
  observaciones: string;
  problemaReportado: string;
  accesoriosEntregados: string;
  incluyeCargador: boolean;
  status: string;
  createdAt: string;
  historial?: HistorialEntry[];
  // Nuevos campos para arquitectura extendida
  recibidoPor?: string;
  tecnicoAsignado?: string;
  entregadoPor?: string;
  fechaEntrega?: string;
  precioFinal?: number;
  serviciosRealizados?: string[];
}

// =====================================================
// MÓDULO DE STOCK - Tipos preparados para Google Sheets
// =====================================================

// Producto de inventario - Mapea a hoja "Stock Total"
export interface Product {
  id: string;
  codigoBarras: string;
  categoria: string;
  subCategoria: string;
  marca: string;
  modelo: string;
  descripcion: string;
  stockInicial: number;
  stockActual: number;
  // Trazabilidad
  fechaCreacion: string;
  fechaActualizacion: string;
  usuarioResponsable: string;
}

// Tipo de movimiento de stock
export type TipoMovimiento = 'entrada' | 'venta' | 'ajuste';

// Razones para ajustes de inventario
export type RazonAjuste = 'Corrección' | 'Dañado' | 'Diferencia';

// Movimiento de stock - Mapea a hojas "Entradas" y "Ventas"
export interface StockMovement {
  id: string;
  fecha: string;
  tipo: TipoMovimiento;
  // Datos del producto
  codigoBarras: string;
  categoria: string;
  subCategoria: string;
  marca: string;
  modelo: string;
  descripcion: string;
  cantidad: number;
  // Contexto del movimiento
  proveedor?: string;      // Solo para entrada
  fechaRemito?: string;    // Solo para entrada (fecha del remito del proveedor)
  cliente?: string;        // Solo para venta
  razonAjuste?: RazonAjuste; // Solo para ajuste
  observaciones: string;
  // Trazabilidad
  usuarioId: string;
  usuarioNombre: string;
  fechaCreacion: string;
  fechaActualizacion: string;
}

// Alerta de stock mínimo
export interface StockAlert {
  id: string;
  productCode?: string;    // null = alerta de categoría
  category?: string;
  minQuantity: number;
  notificado: boolean;
  ultimaNotificacion?: string;
  // Trazabilidad
  fechaCreacion: string;
  fechaActualizacion: string;
  usuarioResponsable: string;
}

// Estadísticas de stock para dashboard
export interface StockStats {
  totalProductos: number;
  productosConStock: number;
  productosSinStock: number;
  productosBajoMinimo: number;
  totalEntradas: number;
  totalVentas: number;
  totalAjustes: number;
}
