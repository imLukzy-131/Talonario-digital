import { Service } from '@/types/index';

// Servicios iniciales de ejemplo
const INITIAL_SERVICES: Service[] = [
  {
    id: '1',
    nombre: 'Diagnóstico',
    descripcion: 'Diagnóstico completo del equipo',
    precioBase: 50,
    categoria: 'Software',
    activo: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    nombre: 'Limpieza de polvo',
    descripcion: 'Limpieza profunda del hardware',
    precioBase: 35,
    categoria: 'Hardware',
    activo: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    nombre: 'Instalación de SO',
    descripcion: 'Instalación del sistema operativo',
    precioBase: 80,
    categoria: 'Software',
    activo: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    nombre: 'Cambio de disco duro',
    descripcion: 'Reemplazo de unidad de almacenamiento',
    precioBase: 120,
    categoria: 'Hardware',
    activo: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Obtener todos los servicios desde localStorage
export function getAllServices(): Service[] {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem('services');
  if (!stored) {
    // Crear servicios iniciales si no existen
    localStorage.setItem('services', JSON.stringify(INITIAL_SERVICES));
    return INITIAL_SERVICES;
  }

  return JSON.parse(stored) as Service[];
}

// Obtener solo servicios activos
export function getActiveServices(): Service[] {
  return getAllServices().filter(s => s.activo).sort((a, b) => a.nombre.localeCompare(b.nombre));
}

// Obtener categorías únicas
export function getCategories(): string[] {
  const services = getAllServices();
  const categories = new Set(services.map(s => s.categoria));
  return Array.from(categories).sort();
}

// Crear nuevo servicio
export function createService(data: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Service {
  const services = getAllServices();
  
  // Validaciones
  if (!data.nombre.trim()) {
    throw new Error('El nombre del servicio es obligatorio');
  }
  
  if (data.precioBase <= 0) {
    throw new Error('El precio debe ser mayor a 0');
  }

  // Verificar duplicados
  if (services.some(s => s.nombre.toLowerCase() === data.nombre.toLowerCase())) {
    throw new Error('Ya existe un servicio con ese nombre');
  }

  const newService: Service = {
    id: Date.now().toString(),
    nombre: data.nombre.trim(),
    descripcion: data.descripcion.trim(),
    precioBase: data.precioBase,
    categoria: data.categoria.trim(),
    activo: data.activo,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  services.push(newService);
  localStorage.setItem('services', JSON.stringify(services));
  
  console.log('[v0] Servicio creado:', newService.nombre);
  return newService;
}

// Actualizar servicio
export function updateService(id: string, data: Partial<Omit<Service, 'id' | 'createdAt'>>): Service {
  const services = getAllServices();
  const index = services.findIndex(s => s.id === id);
  
  if (index === -1) {
    throw new Error('Servicio no encontrado');
  }

  // Validaciones
  if (data.nombre && !data.nombre.trim()) {
    throw new Error('El nombre del servicio es obligatorio');
  }

  if (data.precioBase !== undefined && data.precioBase <= 0) {
    throw new Error('El precio debe ser mayor a 0');
  }

  // Verificar duplicados (excluyendo el servicio actual)
  if (data.nombre) {
    const nombre = data.nombre.toLowerCase();
    const isDuplicate = services.some(
      s => s.id !== id && s.nombre.toLowerCase() === nombre
    );
    if (isDuplicate) {
      throw new Error('Ya existe un servicio con ese nombre');
    }
  }

  const updatedService: Service = {
    ...services[index],
    ...data,
    nombre: data.nombre ? data.nombre.trim() : services[index].nombre,
    descripcion: data.descripcion ? data.descripcion.trim() : services[index].descripcion,
    categoria: data.categoria ? data.categoria.trim() : services[index].categoria,
    updatedAt: new Date().toISOString(),
  };

  services[index] = updatedService;
  localStorage.setItem('services', JSON.stringify(services));
  
  console.log('[v0] Servicio actualizado:', updatedService.nombre);
  return updatedService;
}

// Eliminar servicio
export function deleteService(id: string): void {
  const services = getAllServices();
  const filtered = services.filter(s => s.id !== id);
  
  if (filtered.length === services.length) {
    throw new Error('Servicio no encontrado');
  }

  localStorage.setItem('services', JSON.stringify(filtered));
  console.log('[v0] Servicio eliminado');
}

// Alternar estado de servicio
export function toggleService(id: string): Service {
  const services = getAllServices();
  const service = services.find(s => s.id === id);
  
  if (!service) {
    throw new Error('Servicio no encontrado');
  }

  return updateService(id, { activo: !service.activo });
}

// Obtener estadísticas
export function getServiceStatistics() {
  const all = getAllServices();
  const active = all.filter(s => s.activo);
  const categories = getCategories();
  
  return {
    totalServicios: all.length,
    serviciosActivos: active.length,
    precioPromedio: active.length > 0 ? active.reduce((sum, s) => sum + s.precioBase, 0) / active.length : 0,
    totalCategorias: categories.length,
    precioMinimo: active.length > 0 ? Math.min(...active.map(s => s.precioBase)) : 0,
    precioMaximo: active.length > 0 ? Math.max(...active.map(s => s.precioBase)) : 0,
  };
}
