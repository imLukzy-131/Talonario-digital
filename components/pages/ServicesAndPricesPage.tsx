'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, DollarSign, X, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Service } from '@/types/index';
import { 
  getAllServices, 
  getCategories, 
  createService, 
  updateService, 
  deleteService, 
  toggleService,
  getServiceStatistics,
} from '@/utils/services';

interface ServicesAndPricesPageProps {
  onBack: () => void;
}

type FormMode = 'create' | 'edit' | null;

export default function ServicesAndPricesPage({ onBack }: ServicesAndPricesPageProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    categoria: '',
    precioBase: '',
    activo: true,
  });

  // Cargar servicios al montar
  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = () => {
    try {
      const loaded = getAllServices();
      setServices(loaded.sort((a, b) => a.nombre.localeCompare(b.nombre)));
      setCategories(getCategories());
      setStats(getServiceStatistics());
      clearMessages();
    } catch (error) {
      console.error('[v0] Error loading services:', error);
    }
  };

  const clearMessages = () => {
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 5000);
  };

  const handleOpenCreate = () => {
    setFormMode('create');
    setSelectedService(null);
    setFormData({
      nombre: '',
      descripcion: '',
      categoria: '',
      precioBase: '',
      activo: true,
    });
    clearMessages();
  };

  const handleOpenEdit = (service: Service) => {
    setFormMode('edit');
    setSelectedService(service);
    setFormData({
      nombre: service.nombre,
      descripcion: service.descripcion,
      categoria: service.categoria,
      precioBase: service.precioBase.toString(),
      activo: service.activo,
    });
    clearMessages();
  };

  const handleCloseModal = () => {
    setFormMode(null);
    setSelectedService(null);
    clearMessages();
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    try {
      const price = parseFloat(formData.precioBase);
      if (isNaN(price) || price <= 0) {
        throw new Error('El precio debe ser un número mayor a 0');
      }

      if (!formData.nombre.trim()) {
        throw new Error('El nombre es obligatorio');
      }

      if (!formData.categoria.trim()) {
        throw new Error('La categoría es obligatoria');
      }

      if (formMode === 'create') {
        createService({
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          categoria: formData.categoria,
          precioBase: price,
          activo: formData.activo,
        });
        showSuccess('Servicio creado exitosamente');
      } else if (formMode === 'edit' && selectedService) {
        updateService(selectedService.id, {
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          categoria: formData.categoria,
          precioBase: price,
          activo: formData.activo,
        });
        showSuccess('Servicio actualizado exitosamente');
      }

      handleCloseModal();
      loadServices();
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error al guardar el servicio');
    }
  };

  const handleDelete = (id: string) => {
    try {
      deleteService(id);
      showSuccess('Servicio eliminado exitosamente');
      setDeleteConfirm(null);
      loadServices();
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error al eliminar el servicio');
    }
  };

  const handleToggle = (id: string) => {
    try {
      toggleService(id);
      loadServices();
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error al cambiar estado');
    }
  };

  // Filtrar servicios
  const filteredServices = services.filter(service => {
    const matchesSearch = service.nombre.toLowerCase().includes(searchFilter.toLowerCase()) ||
                         service.descripcion.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesCategory = !categoryFilter || service.categoria === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full min-h-screen p-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        Volver
      </button>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Servicios y Precios
              </span>
            </h1>
            <p className="text-slate-400">Gestiona los servicios ofrecidos y sus precios</p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-lg font-semibold transition-all duration-200 neon-glow flex items-center gap-2"
          >
            <Plus size={20} />
            Nuevo Servicio
          </button>
        </div>

        {/* Messages */}
        {successMessage && (
          <div className="mb-6 bg-green-500/20 border border-green-500/50 rounded-lg p-4 flex items-center gap-3">
            <Check size={20} className="text-green-400" />
            <p className="text-green-400 font-semibold text-sm">{successMessage}</p>
          </div>
        )}
        {errorMessage && (
          <div className="mb-6 bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle size={20} className="text-red-400" />
            <p className="text-red-400 font-semibold text-sm">{errorMessage}</p>
          </div>
        )}

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Servicios activos', value: stats.serviciosActivos, color: 'blue' },
              { label: 'Precio promedio', value: `$${stats.precioPromedio.toFixed(2)}`, color: 'green' },
              { label: 'Categorías', value: stats.totalCategorias, color: 'purple' },
              { label: 'Total servicios', value: stats.totalServicios, color: 'cyan' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-slate-800/40 border border-slate-700 rounded-lg p-4 neon-border"
              >
                <p className="text-slate-400 text-xs mb-1">{stat.label}</p>
                <p
                  className={`text-2xl font-bold ${
                    stat.color === 'blue'
                      ? 'text-blue-400'
                      : stat.color === 'green'
                      ? 'text-green-400'
                      : stat.color === 'purple'
                      ? 'text-purple-400'
                      : 'text-cyan-400'
                  }`}
                >
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="Buscar servicio..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="flex-1 bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none transition-colors"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none transition-colors"
          >
            <option value="">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Services Table */}
        <div className="bg-slate-800/40 border border-slate-700 rounded-lg overflow-hidden neon-border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-800/60 border-b border-slate-700">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Servicio</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Descripción</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Categoría</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Precio</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-cyan-400">Estado</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredServices.length > 0 ? (
                  filteredServices.map((service) => (
                    <tr
                      key={service.id}
                      className="hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-white font-medium">{service.nombre}</td>
                      <td className="px-6 py-4 text-sm text-slate-300">{service.descripcion}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400">
                          {service.categoria}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                          <DollarSign size={16} />
                          {service.precioBase.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-center">
                        <button
                          onClick={() => handleToggle(service.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            service.activo
                              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/40'
                              : 'bg-slate-500/20 text-slate-400 hover:bg-slate-500/40'
                          }`}
                          title={service.activo ? 'Desactivar' : 'Activar'}
                        >
                          {service.activo ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm flex gap-2">
                        <button
                          onClick={() => handleOpenEdit(service)}
                          className="p-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/40 text-purple-400 transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(service.id)}
                          className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                      No hay servicios que coincidan con los filtros
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Service Form Modal */}
      {formMode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg max-w-md w-full neon-border">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-700 bg-slate-800/60">
              <h2 className="text-xl font-bold text-cyan-400">
                {formMode === 'create' ? 'Nuevo Servicio' : 'Editar Servicio'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-semibold text-cyan-400 mb-2">
                  Nombre del Servicio *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none transition-colors"
                  placeholder="Ej: Diagnóstico"
                  required
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-semibold text-cyan-400 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none transition-colors resize-none h-20"
                  placeholder="Describe el servicio..."
                />
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-sm font-semibold text-cyan-400 mb-2">
                  Categoría *
                </label>
                <input
                  type="text"
                  list="categories-list"
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none transition-colors"
                  placeholder="Ej: Hardware, Software"
                  required
                />
                <datalist id="categories-list">
                  {categories.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>

              {/* Precio */}
              <div>
                <label className="block text-sm font-semibold text-cyan-400 mb-2">
                  Precio Base ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.precioBase}
                  onChange={(e) => setFormData({ ...formData, precioBase: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none transition-colors"
                  placeholder="0.00"
                  required
                />
              </div>

              {/* Activo */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.activo}
                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm text-slate-300">Servicio activo</span>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-red-500/30 rounded-lg max-w-sm w-full neon-border">
            <div className="p-6 space-y-4">
              <h2 className="text-xl font-bold text-red-400">Confirmar eliminación</h2>
              <p className="text-slate-300">
                ¿Estás seguro de que deseas eliminar este servicio? Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 text-red-400 rounded-lg font-semibold transition-colors"
                >
                  Eliminar
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
