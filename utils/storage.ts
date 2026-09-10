// Utilidades para gestionar almacenamiento de órdenes
import { Order, User } from '@/types/index';

// ===== ORDERS =====

export const loadOrdersFromStorage = (): Order[] => {
  const stored = localStorage.getItem('orders') || '[]';
  return JSON.parse(stored) as Order[];
};

export const saveOrdersToStorage = (orders: Order[]): void => {
  localStorage.setItem('orders', JSON.stringify(orders));
};

export const sortOrdersByDate = (orders: Order[]): Order[] => {
  return [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};
// ===== USERS =====

export const loadUsersFromStorage = () => {
  const stored = localStorage.getItem('users') || '[]';
  return JSON.parse(stored) as User[];
};

export const saveUsersToStorage = (users: any[]) => {
  localStorage.setItem('users', JSON.stringify(users));
};

// ===== CURRENT USER =====

export const loadCurrentUserFromStorage = () => {
  const stored = localStorage.getItem('currentUser') || 'null';
  return JSON.parse(stored);
};

export const saveCurrentUserToStorage = (user: any) => {
  localStorage.setItem('currentUser', JSON.stringify(user));
};

export const clearCurrentUserFromStorage = () => {
  localStorage.removeItem('currentUser');
};
