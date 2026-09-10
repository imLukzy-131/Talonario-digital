// Sistema de permisos basado en roles
import { User } from '@/types/index';
import { loadUsersFromStorage, saveCurrentUserToStorage, saveUsersToStorage } from './storage';

// Simular usuario actual (se reemplazará con sistema real de login)
export const getCurrentUser = (): User => {
  const stored = localStorage.getItem('currentUser');
  if (stored) {
    return JSON.parse(stored);
  }
  // Crear administrador por defecto automáticamente
  const defaultAdmin: User = {
    id: '1',
    nombre: 'hecker',
    apellido: 'Admin',
    usuario: 'hecker',
    contraseña: 'hecker123',
    rol: 'Administrador',
    activo: true,
    createdAt: new Date().toISOString(),
  };

  // Guardar sesión
  saveCurrentUserToStorage(defaultAdmin);

  // Guardar usuario en la lista si no existe
  const users = loadUsersFromStorage();

  if (users.length === 0) {
    saveUsersToStorage([defaultAdmin]);
  }

  return defaultAdmin;
};

// Permisos por rol
const PERMISSIONS = {
  Administrador: {
    canEditTracking: true,
    canDeliverEquipment: true,
    canManageUsers: true,
    canViewReports: true,
    canManageServices: true,
    canManageInventory: true,
    // Permisos de Stock
    canViewStock: true,
    canRegisterStockEntry: true,
    canRegisterStockSale: true,
    canRegisterStockAdjustment: true,
    canConfigureStockAlerts: true,
    canManageProducts: true,
  },
  Técnico: {
    canEditTracking: true,
    canDeliverEquipment: false,
    canManageUsers: false,
    canViewReports: false,
    canManageServices: false,
    canManageInventory: false,
    // Permisos de Stock (solo lectura)
    canViewStock: true,
    canRegisterStockEntry: false,
    canRegisterStockSale: false,
    canRegisterStockAdjustment: false,
    canConfigureStockAlerts: false,
    canManageProducts: false,
  },
  Administrativo: {
    canEditTracking: false,
    canDeliverEquipment: true,
    canManageUsers: false,
    canViewReports: true,
    canManageServices: false,
    canManageInventory: true,
    // Permisos de Stock
    canViewStock: true,
    canRegisterStockEntry: true,
    canRegisterStockSale: true,
    canRegisterStockAdjustment: true,
    canConfigureStockAlerts: false,
    canManageProducts: false,
  },
};

/**
 * Verifica si el usuario actual puede editar seguimiento técnico
 */
export const canEditTracking = (user?: User): boolean => {
  const currentUser = user || getCurrentUser();
  return PERMISSIONS[currentUser.rol]?.canEditTracking || false;
};

/**
 * Verifica si el usuario actual puede marcar equipos como entregados
 */
export const canDeliverEquipment = (user?: User): boolean => {
  const currentUser = user || getCurrentUser();
  return PERMISSIONS[currentUser.rol]?.canDeliverEquipment || false;
};

/**
 * Verifica si el usuario actual puede gestionar usuarios
 */
export const canManageUsers = (user?: User): boolean => {
  const currentUser = user || getCurrentUser();
  return PERMISSIONS[currentUser.rol]?.canManageUsers || false;
};

/**
 * Verifica si el usuario actual puede ver reportes
 */
export const canViewReports = (user?: User): boolean => {
  const currentUser = user || getCurrentUser();
  return PERMISSIONS[currentUser.rol]?.canViewReports || false;
};

/**
 * Verifica si el usuario actual puede gestionar servicios
 */
export const canManageServices = (user?: User): boolean => {
  const currentUser = user || getCurrentUser();
  return PERMISSIONS[currentUser.rol]?.canManageServices || false;
};

/**
 * Verifica si el usuario actual puede gestionar inventario
 */
export const canManageInventory = (user?: User): boolean => {
  const currentUser = user || getCurrentUser();
  return PERMISSIONS[currentUser.rol]?.canManageInventory || false;
};

// =====================================================
// PERMISOS DE STOCK
// =====================================================

/**
 * Verifica si el usuario puede ver el módulo de stock
 */
export const canViewStock = (user?: User): boolean => {
  const currentUser = user || getCurrentUser();
  return PERMISSIONS[currentUser.rol]?.canViewStock || false;
};

/**
 * Verifica si el usuario puede registrar entradas de stock
 */
export const canRegisterStockEntry = (user?: User): boolean => {
  const currentUser = user || getCurrentUser();
  return PERMISSIONS[currentUser.rol]?.canRegisterStockEntry || false;
};

/**
 * Verifica si el usuario puede registrar ventas de stock
 */
export const canRegisterStockSale = (user?: User): boolean => {
  const currentUser = user || getCurrentUser();
  return PERMISSIONS[currentUser.rol]?.canRegisterStockSale || false;
};

/**
 * Verifica si el usuario puede registrar ajustes de stock
 */
export const canRegisterStockAdjustment = (user?: User): boolean => {
  const currentUser = user || getCurrentUser();
  return PERMISSIONS[currentUser.rol]?.canRegisterStockAdjustment || false;
};

/**
 * Verifica si el usuario puede configurar alertas de stock
 */
export const canConfigureStockAlerts = (user?: User): boolean => {
  const currentUser = user || getCurrentUser();
  return PERMISSIONS[currentUser.rol]?.canConfigureStockAlerts || false;
};

/**
 * Verifica si el usuario puede gestionar productos (CRUD)
 */
export const canManageProducts = (user?: User): boolean => {
  const currentUser = user || getCurrentUser();
  return PERMISSIONS[currentUser.rol]?.canManageProducts || false;
};
