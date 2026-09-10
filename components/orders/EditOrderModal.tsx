import { X } from 'lucide-react';
import { Order } from '@/types/index';
import { useEffect, useState } from 'react';

interface EditOrderModalProps {
  order: Order | null;
  onSave: (order: Order) => void;
  onCancel: () => void;
}

export default function EditOrderModal({ order, onSave, onCancel }: EditOrderModalProps) {
  const [formData, setFormData] = useState<Order | null>(order);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setFormData(order);
    setErrorMessage(null);
  }, [order]);

  if (!formData) return null;

  const handleChange = (field: keyof Order, value: any) => {
    setFormData({ ...formData, [field]: value });
    setErrorMessage(null);
  };

  const handleSave = () => {
    const requiredFields: Array<[keyof Order, string]> = [
      ['nombre', 'Nombre'], ['apellido', 'Apellido'], ['telefono', 'Teléfono'],
      ['tipoEquipo', 'Tipo de equipo'], ['marca', 'Marca'], ['problemaReportado', 'Descripción del problema'],
    ];
    const missing = requiredFields.filter(([field]) => !String(formData[field] ?? '').trim());
    if (missing.length) {
      setErrorMessage(`Campos obligatorios faltantes: ${missing.map(([, label]) => label).join(', ')}`);
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-purple-400">Editar Orden</h2>
          <button onClick={onCancel} className="text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            value={formData.nombre}
            onChange={(e) => handleChange('nombre', e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-400"
            placeholder="Nombre"
          />

          <input
            type="text"
            value={formData.apellido}
            onChange={(e) => handleChange('apellido', e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-400"
            placeholder="Apellido"
          />

          <input
            type="text"
            value={formData.telefono}
            onChange={(e) => handleChange('telefono', e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-400 col-span-2"
            placeholder="Teléfono"
          />

          <select
            value={formData.tipoEquipo}
            onChange={(e) => handleChange('tipoEquipo', e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
          >
            <option value="">Tipo de equipo</option>
            <option value="notebook">Notebook</option>
            <option value="netbook">Netbook</option>
            <option value="pc-oficina">PC Oficina</option>
            <option value="pc-gamer">PC Gamer</option>
            <option value="imp-tinta">Impresora de tinta</option>
            <option value="imp-laser">Impresora laser</option>
          </select>
          <input
            type="text"
            value={formData.marca}
            onChange={(e) => handleChange('marca', e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-400"
            placeholder="Marca"
          />
          <input
            type="text"
            value={formData.modelo}
            onChange={(e) => handleChange('modelo', e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-400 col-span-2"
            placeholder="Modelo"
          />

          <textarea
            value={formData.problemaReportado}
            onChange={(e) => handleChange('problemaReportado', e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-400 col-span-2 resize-none h-20"
            placeholder="Descripción del problema"
          />

          <textarea
            value={formData.accesoriosEntregados}
            onChange={(e) => handleChange('accesoriosEntregados', e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-400 col-span-2 resize-none h-20"
            placeholder="Accesorios entregados"
          />

          <textarea
            value={formData.observaciones}
            onChange={(e) => handleChange('observaciones', e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-400 col-span-2 resize-none h-20"
            placeholder="Observaciones"
          />

          {(formData.tipoEquipo.toLowerCase().includes('notebook') ||
            formData.tipoEquipo.toLowerCase().includes('netbook')) && (
            <label className="flex items-center gap-3 text-white col-span-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.incluyeCargador}
                onChange={(e) => handleChange('incluyeCargador', e.target.checked)}
                className="w-4 h-4 cursor-pointer"
              />
              Incluye cargador
            </label>
          )}
        </div>

        {errorMessage && (
          <p className="mt-4 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400" role="alert">
            {errorMessage}
          </p>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors"
          >
            Cancelar
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors font-semibold"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
}
