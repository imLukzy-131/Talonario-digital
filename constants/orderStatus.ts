// Estados técnicos del flujo de reparación
export const TECHNICAL_STATES = [
  'Pendiente',
  'En diagnóstico',
  'Esperando repuesto',
  'En reparación',
  'Completado',
] as const;

// Estados administrativos (incluye Entregado)
export const ORDER_STATUSES = [
  'Pendiente',
  'En diagnóstico',
  'Esperando repuesto',
  'En reparación',
  'Completado',
  'Entregado',
] as const;

// Estados de la orden en la vida completa
export const ALL_ORDER_STATES = ORDER_STATUSES;

export type TechnicalState = typeof TECHNICAL_STATES[number];
export type OrderStatus = typeof ORDER_STATUSES[number];
