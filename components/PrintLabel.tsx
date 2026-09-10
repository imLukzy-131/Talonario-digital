'use client';

import { createPortal } from 'react-dom';
import { useState } from 'react';
import { Mail, MessageCircle, Printer, X } from 'lucide-react';

interface PrintLabelProps {
  numeroOrden: string;
  nombre: string;
  apellido: string;
  tipoEquipo: string;
  marca: string;
  modelo: string;
  onClose: () => void;
}

type PrintMode = 'label' | 'thermal';

export default function PrintLabel({
  numeroOrden,
  nombre,
  apellido,
  tipoEquipo,
  marca,
  modelo,
  onClose,
}: PrintLabelProps) {
  const [printMode, setPrintMode] = useState<PrintMode>('label');

  const handlePrint = (mode: PrintMode) => {
    setPrintMode(mode);

    // Esperar a que la clase del modo se aplique antes de abrir el diálogo.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => window.print());
    });
  };

  return (
    <div className={`print-modal print-mode-${printMode} fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4`}>
      <div className="print-modal-window max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-2xl">
        {/* Header de la vista previa */}
        <div className="print-ui sticky top-0 flex items-center justify-between border-b border-gray-200 bg-gray-50 p-6">
          <h2 className="text-2xl font-bold text-gray-900">Vista previa de etiqueta</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 transition-colors hover:bg-gray-200"
            aria-label="Cerrar vista previa"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Vista previa: ambos bloques siguen visibles en pantalla */}
        <div className="print-preview space-y-6 p-8">
          <div className="printable-label mx-auto w-[80mm] max-w-full rounded-lg border-2 border-dashed border-gray-300 bg-white p-6">
            <div className="mb-4 border-b-2 border-gray-900 pb-4 text-center">
              <h1 className="text-xl font-bold text-gray-900">JR COMPUTACIÓN</h1>
              <p className="text-xs text-gray-600">Servicio técnico - Don Bosco 364</p>
              <div className="mt-2 space-y-1 text-[10px] text-gray-600">
                <p className="flex items-center justify-center gap-1"><MessageCircle size={11} /> 2966-583578</p>
                <p className="flex items-center justify-center gap-1"><Mail size={11} /> jr.serviciotecnico.ventas@gmail.com</p>
              </div>
            </div>

            <div className="mb-4 rounded bg-gray-100 py-4 text-center">
              <p className="mb-2 text-xs font-semibold uppercase text-gray-600">Número de Orden</p>
              <h2 className="font-mono text-3xl font-bold text-gray-900">{numeroOrden}</h2>
            </div>

            <div className="mb-4 space-y-3 border-b-2 border-gray-300 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase text-gray-600">Cliente</p>
                <p className="text-sm font-semibold text-gray-900">{nombre} {apellido}</p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-gray-600">Equipo</p>
                <p className="text-sm text-gray-900">
                  <span className="font-semibold">{marca} {modelo}</span>
                  <span className="block text-xs text-gray-600">({tipoEquipo})</span>
                </p>
              </div>
            </div>

            <div className="rounded border border-yellow-200 bg-yellow-50 p-3">
              <p className="text-center text-xs font-semibold leading-tight text-gray-900">
                Los equipos deben ser retirados dentro de los 30 días. Los chequeos deben ser abonados sin excepción.
              </p>
            </div>
          </div>

          <div className="thermal-reference mx-auto w-[80mm] max-w-full rounded-lg border-2 border-dashed border-gray-300 bg-white p-4">
            <div className="space-y-3 text-center">
              <p className="text-xs font-semibold text-gray-600">REFERENCIA RÁPIDA</p>
              <div className="py-6">
                <h1 className="mb-2 font-mono text-4xl font-bold text-gray-900">{numeroOrden}</h1>
                <p className="text-xs text-gray-600">{nombre} {apellido}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controles de la interfaz: nunca se imprimen */}
        <div className="print-ui sticky bottom-0 flex flex-col gap-3 border-t border-gray-200 bg-gray-50 p-6 sm:flex-row">
          <button
            type="button"
            onClick={() => handlePrint('label')}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
          >
            <Printer size={20} />
            Imprimir etiqueta
          </button>
          <button
            type="button"
            onClick={() => handlePrint('thermal')}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gray-900 px-6 py-3 font-semibold text-white transition-colors hover:bg-gray-800"
          >
            <Printer size={20} />
            Imprimir térmica 80mm
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg bg-gray-300 px-6 py-3 font-semibold text-gray-900 transition-colors hover:bg-gray-400"
          >
            Cerrar
          </button>
        </div>
      </div>

      {typeof document !== 'undefined' && createPortal(
        <div className={`print-isolation print-mode-${printMode}`} aria-hidden="true">
          <div className="print-isolation-page printable-label">
            <div className="print-label-header">
              <h1>JR COMPUTACIÓN</h1>
              <p>Servicio técnico - Don Bosco 364</p>
              <div className="print-label-contact">
                <p><MessageCircle size={11} /> 2966-583578</p>
                <p><Mail size={11} /> jr.serviciotecnico.ventas@gmail.com</p>
              </div>
            </div>
            <div className="print-label-order">
              <p>Número de Orden</p>
              <strong>{numeroOrden}</strong>
            </div>
            <div className="print-label-details">
              <div><p>Cliente</p><strong>{nombre} {apellido}</strong></div>
              <div><p>Equipo</p><strong>{marca} {modelo}</strong><span>({tipoEquipo})</span></div>
            </div>
            <div className="print-label-warning">Los equipos deben ser retirados dentro de los 30 días. Los chequeos deben ser abonados sin excepción.</div>
          </div>
          <div className="print-isolation-page thermal-reference">
            <p>REFERENCIA RÁPIDA</p>
            <strong>{numeroOrden}</strong>
            <span>{nombre} {apellido}</span>
          </div>
        </div>,
        document.body
      )}

      <style jsx global>{`
        @media print { 
          body > * { display: none !important; }
          body > .print-isolation { display: block !important; }
          .print-isolation { position: static !important; width: 80mm !important; margin: 0 auto !important; padding: 0 !important; color: #111 !important; background: #fff !important; }
          .print-isolation-page { box-sizing: border-box; width: 80mm; min-height: 0; margin: 0; padding: 6mm; overflow: hidden; background: #fff; break-inside: avoid; page-break-inside: avoid; }
          .print-isolation .printable-label { min-height: 80mm; }
          .print-isolation .thermal-reference { min-height: 80mm; text-align: center; }
          .print-isolation.print-mode-label .thermal-reference { display: none !important; }
          .print-isolation.print-mode-thermal .thermal-reference { break-before: page; page-break-before: always; }
          .print-label-header { border-bottom: 2px solid #111; padding-bottom: 4mm; text-align: center; }
          .print-label-header h1 { margin: 0; font-size: 18px; font-weight: 700; }
          .print-label-header p, .print-label-details p, .thermal-reference p { margin: 0; font-size: 10px; color: #555; }
          .print-label-contact { display: grid; gap: 1mm; margin-top: 2mm; }
          .print-label-contact p { display: flex; align-items: center; justify-content: center; gap: 1mm; }
          .print-label-order { margin: 5mm 0; padding: 4mm 0; text-align: center; background: #f3f4f6; }
          .print-label-order p { margin: 0 0 2mm; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #555; }
          .print-label-order strong { font-family: monospace; font-size: 28px; }
          .print-label-details { display: grid; gap: 4mm; border-bottom: 2px solid #d1d5db; padding-bottom: 4mm; }
          .print-label-details p { margin-bottom: 1mm; font-weight: 700; text-transform: uppercase; }
          .print-label-details strong { display: block; font-size: 13px; }
          .print-label-details span { display: block; font-size: 10px; color: #555; }
          .print-label-warning { margin-top: 4mm; padding: 3mm; text-align: center; font-size: 10px; font-weight: 700; background: #fefce8; }
          .thermal-reference strong { display: block; margin-top: 18mm; font-family: monospace; font-size: 36px; }
          .thermal-reference span { display: block; margin-top: 3mm; font-size: 10px; }

        @page {
          size: 80mm auto;
          margin: 0;
        }

        html,
          body {
            width: 100%;
            margin: 0;
            padding: 0;
            background: white;
          }

          .print-modal {
            position: static;
            display: block;
            width: 80mm;
            min-height: 0;
            padding: 0;
            background: white;
          }

          .print-modal-window,
          .print-preview {
            width: 80mm;
            max-width: none;
            max-height: none;
            overflow: visible;
            margin: 0;
            padding: 0;
            border: 0;
            border-radius: 0;
            box-shadow: none;
          }

          .print-ui {
            display: none !important;
          }

          .printable-label,
          .thermal-reference {
            box-sizing: border-box;
            width: 80mm;
            max-width: none;
            margin: 0;
            border: 0;
            border-radius: 0;
            background: white;
            box-shadow: none;
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .print-mode-label .thermal-reference {
            display: none !important;
          }

          .print-mode-label .printable-label {
            break-after: auto;
            page-break-after: auto;
          }

          .print-mode-thermal .thermal-reference {
            break-before: page;
            page-break-before: always;
          }
        }
      `}</style>
    </div>
  );
}
