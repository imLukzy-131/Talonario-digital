/**
 * Stock Storage - Capa de persistencia para módulo de stock
 * 
 * Este archivo maneja ÚNICAMENTE la lectura/escritura a localStorage.
 * Está diseñado para ser reemplazado por Google Sheets API sin cambiar stockService.ts
 * 
 * IMPORTANTE: Los componentes NUNCA deben importar este archivo directamente.
 * Todo acceso a datos debe pasar por stockService.ts
 */

import { Product, StockMovement, StockAlert } from '@/types/index';

// Claves de localStorage
const STORAGE_KEYS = {
  PRODUCTS: 'stock_products',
  MOVEMENTS: 'stock_movements',
  ALERTS: 'stock_alerts',
} as const;

// =====================================================
// PRODUCTOS
// =====================================================

export function loadProductsFromStorage(): Product[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  return data ? JSON.parse(data) : [];
}

export function saveProductsToStorage(products: Product[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
}

// =====================================================
// MOVIMIENTOS DE STOCK
// =====================================================

export function loadMovementsFromStorage(): StockMovement[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.MOVEMENTS);
  return data ? JSON.parse(data) : [];
}

export function saveMovementsToStorage(movements: StockMovement[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(movements));
}

// =====================================================
// ALERTAS DE STOCK
// =====================================================

export function loadAlertsFromStorage(): StockAlert[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.ALERTS);
  return data ? JSON.parse(data) : [];
}

export function saveAlertsToStorage(alerts: StockAlert[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
}

// =====================================================
// UTILIDADES
// =====================================================

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function sortByDateDesc<T extends { fecha: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => 
    new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );
}

export function sortByCreationDateDesc<T extends { fechaCreacion: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => 
    new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
  );
}
