'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Check, AlertCircle } from 'lucide-react';
import PrintLabel from '@/components/PrintLabel';
import { getCurrentUser } from '@/utils/permissions';
import { loadOrdersFromStorage, saveOrdersToStorage } from '@/utils/storage';

interface NewOrderPageProps {
  onBack: () => void;
}

interface FormData {
  numeroOrden: string;
  fecha: string;
  nombre: string;
  apellido: string;
  telefono: string;
  tipoEquipo: string;
  marca: string;
  modelo: string;
  observaciones: string;
  problemaReportado: string;
  accesoriosEntregados: string;
  incluyeCargador: boolean;
}

interface HistorialEntry {
  fecha: string;
  estado: string;
  detalle: string;
  tecnico: string;
}

export default function NewOrderPage({ onBack }: NewOrderPageProps) {
  const [formData, setFormData] = useState<FormData>({
    numeroOrden: '',
    fecha: '',
    nombre: '',
    apellido: '',
    telefono: '',
    tipoEquipo: '',
    marca: '',
    modelo: '',
    observaciones: '',
    problemaReportado: '',
    accesoriosEntregados: '',
    incluyeCargador: false,
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [showPrintLabel, setShowPrintLabel] = useState(false);
  const [lastCreatedOrder, setLastCreatedOrder] = useState<FormData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Generar número de orden secuencial y fecha automáticamente
  useEffect(() => {
    // Obtener el último número de orden del localStorage
    const lastOrderNum = localStorage.getItem('lastOrderNumber') || '0';
    const nextOrderNum = (parseInt(lastOrderNum) + 1).toString().padStart(5, '0');
    
    const today = new Date().toISOString().split('T')[0];

    setFormData(prev => ({
      ...prev,
      numeroOrden: nextOrderNum,
      fecha: today,
    }));
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };


  // Mostrar campo "Incluye cargador" si es Notebook o Netbook
  const showCargadorField = formData.tipoEquipo === 'notebook' || formData.tipoEquipo === 'netbook';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    
    // Validar campos obligatorios
    const camposObligatorios = [
      { campo: 'nombre', label: 'Nombre' },
      { campo: 'apellido', label: 'Apellido' },
      { campo: 'telefono', label: 'Teléfono' },
      { campo: 'tipoEquipo', label: 'Tipo de equipo' },
      { campo: 'marca', label: 'Marca' },
      { campo: 'problemaReportado', label: 'Descripción del problema' },
    ];
    
    const camposFaltantes = camposObligatorios.filter(
      ({ campo }) => !formData[campo as keyof FormData]?.toString().trim()
    );
    
    if (camposFaltantes.length > 0) {
      const nombres = camposFaltantes.map(c => c.label).join(', ');

      setErrorMessage(`Campos obligatorios faltantes: ${nombres}`);
      setShowErrorPopup(true);

      setTimeout(() => {
        setShowErrorPopup(false);
      }, 3000);

      return;
    }
    
    // Guardar la orden completa en localStorage
    const currentUser = getCurrentUser();
    const orders = loadOrdersFromStorage();
    const orderWithStatus = {
      ...formData,
      status: 'Pendiente',
      createdAt: new Date().toISOString(),
      recibidoPor: currentUser.nombre,
      historial: [
        {
          fecha: new Date().toISOString(),
          estado: 'Pendiente',
          detalle: 'Orden creada',
          tecnico: 'Sistema',
        },
      ],
    };
    orders.push(orderWithStatus);
    saveOrdersToStorage(orders);
    
    // Guardar el número de orden en localStorage para la próxima orden
    localStorage.setItem('lastOrderNumber', formData.numeroOrden);
    
    // Guardar la orden creada para mostrar opción de imprimir
    setLastCreatedOrder(formData);
    
    console.log('[v0] Orden guardada:', formData);
    setShowSuccess(true);

    // Limpiar formulario después de 2 segundos
    setTimeout(() => {
      // Generar el siguiente número de orden
      const nextOrderNum = (parseInt(formData.numeroOrden) + 1).toString().padStart(5, '0');
      const today = new Date().toISOString().split('T')[0];

      setFormData(prev => ({
        ...prev,
        numeroOrden: nextOrderNum,
        fecha: today,
        nombre: '',
        apellido: '',
        telefono: '',
        tipoEquipo: '',
        marca: '',
        modelo: '',
        observaciones: '',
        problemaReportado: '',
        accesoriosEntregados: '',
        incluyeCargador: false,
      }));
      setShowSuccess(false);
    }, 2000);
  };

  return (
    <div className="w-full min-h-screen p-8 relative">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        Volver
      </button>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Nueva Orden de Trabajo
          </span>
        </h1>
        <p className="text-slate-400 mb-8">Complete los datos del cliente y el equipo a reparar</p>

        {/* Mensaje de éxito */}
        {showSuccess && (
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-green-500/90 text-white px-8 py-4 rounded-lg flex items-center gap-3 neon-glow animate-pulse">
              <Check size={24} />
              <span className="font-semibold text-lg">¡Orden creada exitosamente!</span>
            </div>
          </div>
        )}

        {/* Mensaje de error */}
        {showErrorPopup && (
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
            <div className="bg-red-500/90 text-white px-8 py-4 rounded-lg flex items-center gap-3 neon-glow animate-pulse">
              <AlertCircle size={24} />
              <span className="font-semibold text-lg">
                {errorMessage}
              </span>
            </div>
          </div>
        )}

        {/* Print Label Modal */}
        {showPrintLabel && lastCreatedOrder && (
          <PrintLabel
            numeroOrden={lastCreatedOrder.numeroOrden}
            nombre={lastCreatedOrder.nombre}
            apellido={lastCreatedOrder.apellido}
            tipoEquipo={lastCreatedOrder.tipoEquipo}
            marca={lastCreatedOrder.marca}
            modelo={lastCreatedOrder.modelo}
            onClose={() => setShowPrintLabel(false)}
          />
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="bg-slate-800/40 border border-slate-700 rounded-lg p-8 neon-border space-y-6">
          
          {/* Orden Info */}
          <div>
            <h2 className="text-lg font-semibold text-cyan-400 mb-4">Información de la Orden</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">Número de Orden</label>
                <input
                  type="text"
                  name="numeroOrden"
                  value={formData.numeroOrden}
                  disabled
                  className="w-full bg-slate-700/30 border border-slate-600 rounded-lg px-4 py-2 text-cyan-400 placeholder-slate-400 focus:border-cyan-500 focus:outline-none transition-colors cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-2">Fecha</label>
                <input
                  type="date"
                  name="fecha"
                  value={formData.fecha}
                  disabled
                  className="w-full bg-slate-700/30 border border-slate-600 rounded-lg px-4 py-2 text-cyan-400 placeholder-slate-400 focus:border-cyan-500 focus:outline-none transition-colors cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Customer Section */}
          <div>
            <h2 className="text-lg font-semibold text-cyan-400 mb-4">Datos del Cliente</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">Nombre <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  name="nombre"
                  placeholder="Nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-2">Apellido <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  name="apellido"
                  placeholder="Apellido"
                  value={formData.apellido}
                  onChange={handleInputChange}
                  
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none transition-colors"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-slate-300 mb-2">Teléfono <span className="text-red-400">*</span></label>
                <input
                  type="tel"
                  name="telefono"
                  placeholder="Teléfono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Equipment Section */}
          <div>
            <h2 className="text-lg font-semibold text-cyan-400 mb-4">Datos del Equipo</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">Tipo de equipo <span className="text-red-400">*</span></label>
                <select
                  name="tipoEquipo"
                  value={formData.tipoEquipo}
                  onChange={handleInputChange}
                  
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none transition-colors"
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="notebook">Notebook</option>
                  <option value="netbook">Netbook</option>
                  <option value="pc-oficina">PC Oficina</option>
                  <option value="pc-gamer">PC Gamer</option>
                  <option value="imp-tinta">Impresora de tinta</option>
                  <option value="imp-laser">Impresora laser</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-2">Marca <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  name="marca"
                  placeholder="Marca"
                  value={formData.marca}
                  onChange={handleInputChange}
                  
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-2">Modelo</label>
                <input
                  type="text"
                  name="modelo"
                  placeholder="Modelo (opcional)"
                  value={formData.modelo}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Cargador Field - Mostrado dinámicamente */}
          {showCargadorField && (
            <div className="bg-slate-700/20 border border-cyan-500/30 rounded-lg p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="incluyeCargador"
                  checked={formData.incluyeCargador}
                  onChange={(e) =>
                    setFormData(prev => ({
                      ...prev,
                      incluyeCargador: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 accent-cyan-400"
                />
                <span className="text-white font-medium">Incluye cargador</span>
              </label>
            </div>
          )}

          {/* Problem Description */}
          <div>
            <h2 className="text-lg font-semibold text-cyan-400 mb-4">Descripción del Problema <span className="text-red-400">*</span></h2>
            <textarea
              name="problemaReportado"
              placeholder="Describa el problema del equipo..."
              value={formData.problemaReportado}
              onChange={handleInputChange}
              
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none transition-colors resize-none h-32"
            />
          </div>

          {/* Observations */}
          <div>
            <h2 className="text-lg font-semibold text-cyan-400 mb-4">Observaciones del Equipo <span className="text-slate-500 text-sm font-normal">(opcional)</span></h2>
            <textarea
              name="observaciones"
              placeholder="Golpes, rayones, componentes dañados, etc..."
              value={formData.observaciones}
              onChange={handleInputChange}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none transition-colors resize-none h-20"
            />
          </div>

          {/* Accesories */}
          <div>
            <h2 className="text-lg font-semibold text-cyan-400 mb-4">Accesorios Entregados <span className="text-slate-500 text-sm font-normal">(opcional)</span></h2>
            <textarea
              name="accesoriosEntregados"
              placeholder="Funda, periféricos, cables, adaptadores..."
              value={formData.accesoriosEntregados}
              onChange={handleInputChange}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none transition-colors resize-none h-16"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-lg font-semibold transition-all duration-200 neon-glow"
            >
              <Plus size={20} />
              Crear Orden
            </button>
            {lastCreatedOrder && (
              <button
                type="button"
                onClick={() => setShowPrintLabel(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-lg font-semibold transition-all duration-200"
              >
                Imprimir Etiqueta
              </button>
            )}
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg font-semibold transition-all duration-200"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
