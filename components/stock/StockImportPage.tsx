'use client';

import { useState, useRef } from 'react';
import { ArrowLeft, Upload, FileSpreadsheet, AlertCircle, Check, X, Table } from 'lucide-react';
import { useProducts } from '@/hooks/useStock';
import { getCurrentUser, canManageProducts } from '@/utils/permissions';
import type { BulkImportRow, BulkImportResult } from '@/utils/stockService';

interface StockImportPageProps {
  onBack: () => void;
}

// Columnas esperadas, en orden, coincidiendo con la hoja "Stock Total"
const COLUMNS = [
  'CodigoBarras',
  'Categoria',
  'SubCategoria',
  'Marca',
  'Modelo',
  'Descripcion',
  'StockInicial',
];

export default function StockImportPage({ onBack }: StockImportPageProps) {
  const currentUser = getCurrentUser();
  const canManage = canManageProducts(currentUser);
  const { bulkImportProducts } = useProducts();

  const [rawText, setRawText] = useState('');
  const [parsedRows, setParsedRows] = useState<BulkImportRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [result, setResult] = useState<BulkImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Detecta el separador (tab, ; o ,) según lo que más aparezca en la primera línea
  const detectDelimiter = (line: string): string => {
    const counts = {
      '\t': (line.match(/\t/g) || []).length,
      ';': (line.match(/;/g) || []).length,
      ',': (line.match(/,/g) || []).length,
    };
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  };

  const parseText = (text: string): BulkImportRow[] => {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return [];

    const delimiter = detectDelimiter(lines[0]);

    // Si la primera fila parece encabezado (contiene "codigo"), la saltamos
    const firstCells = lines[0].toLowerCase();
    const hasHeader = firstCells.includes('codigo') || firstCells.includes('descripcion');
    const dataLines = hasHeader ? lines.slice(1) : lines;

    return dataLines.map((line) => {
      const cells = line.split(delimiter).map(c => c.trim());
      return {
        codigoBarras: cells[0] || '',
        categoria: cells[1] || '',
        subCategoria: cells[2] || '',
        marca: cells[3] || '',
        modelo: cells[4] || '',
        descripcion: cells[5] || '',
        stockInicial: parseInt(cells[6]) || 0,
      };
    });
  };

  const handlePreview = () => {
    setParseError(null);
    setResult(null);
    try {
      const rows = parseText(rawText);
      if (rows.length === 0) {
        setParseError('No se detectaron filas válidas. Verifica el formato de los datos.');
        setParsedRows([]);
        return;
      }
      setParsedRows(rows);
    } catch {
      setParseError('Error al procesar los datos. Verifica el formato.');
      setParsedRows([]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setRawText(text);
      setParseError(null);
      setResult(null);
      const rows = parseText(text);
      setParsedRows(rows);
      if (rows.length === 0) {
        setParseError('El archivo no contiene filas válidas.');
      }
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (parsedRows.length === 0) return;
    const importResult = bulkImportProducts(parsedRows, currentUser.nombre);
    setResult(importResult);
    setParsedRows([]);
    setRawText('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleReset = () => {
    setRawText('');
    setParsedRows([]);
    setParseError(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!canManage) {
    return (
      <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-red-400 mb-2">Acceso Denegado</h2>
        <p className="text-slate-400">No tienes permiso para importar productos.</p>
        <button onClick={onBack} className="mt-4 text-cyan-400 hover:text-cyan-300">
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/20 rounded-lg">
            <FileSpreadsheet className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Importar Productos</h1>
            <p className="text-slate-400 text-sm">Carga masiva de listas de productos</p>
          </div>
        </div>
      </div>

      {/* Import Result */}
      {result && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Importación completada</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-green-400">{result.creados}</p>
              <p className="text-slate-400 text-sm">Productos creados</p>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-amber-400">{result.omitidos}</p>
              <p className="text-slate-400 text-sm">Omitidos (ya existían)</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-red-400">{result.errores.length}</p>
              <p className="text-slate-400 text-sm">Filas con avisos</p>
            </div>
          </div>
          {result.errores.length > 0 && (
            <div className="max-h-48 overflow-y-auto bg-slate-900/50 rounded-lg p-3 space-y-1">
              {result.errores.map((err, i) => (
                <p key={i} className="text-sm text-slate-400">
                  <span className="text-slate-500">Fila {err.fila}:</span>{' '}
                  <span className="font-mono text-slate-300">{err.codigoBarras || '(sin código)'}</span>{' '}
                  — {err.motivo}
                </p>
              ))}
            </div>
          )}
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors"
          >
            Importar otra lista
          </button>
        </div>
      )}

      {!result && (
        <>
          {/* Instructions */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Table className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-slate-400">
                <p className="text-slate-300 font-medium mb-1">Formato esperado (columnas en orden)</p>
                <p className="font-mono text-xs text-cyan-400 break-all">{COLUMNS.join('  |  ')}</p>
                <p className="mt-2">
                  Pega los datos desde una planilla (Excel / Google Sheets) o sube un archivo CSV.
                  Se aceptan separadores de tabulación, punto y coma o coma. Si la primera fila es un
                  encabezado, se detecta y se omite automáticamente.
                </p>
              </div>
            </div>
          </div>

          {/* Input methods */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Paste */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <label className="block text-sm font-semibold text-cyan-400 mb-2">
                Pegar datos
              </label>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder={`CodigoBarras${'\t'}Categoria${'\t'}SubCategoria${'\t'}Marca${'\t'}Modelo${'\t'}Descripcion${'\t'}StockInicial`}
                rows={8}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none resize-none font-mono text-xs"
              />
              <button
                onClick={handlePreview}
                disabled={!rawText.trim()}
                className="mt-2 w-full py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300 font-semibold rounded-lg transition-colors"
              >
                Previsualizar
              </button>
            </div>

            {/* Upload */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 flex flex-col">
              <label className="block text-sm font-semibold text-cyan-400 mb-2">
                Subir archivo CSV
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 border-2 border-dashed border-slate-600 rounded-lg flex flex-col items-center justify-center p-8 cursor-pointer hover:border-cyan-500/50 transition-colors min-h-[180px]"
              >
                <Upload className="w-10 h-10 text-slate-500 mb-2" />
                <p className="text-slate-400 text-sm text-center">
                  Haz clic para seleccionar un archivo CSV
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt,text/csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {parseError && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-400">{parseError}</p>
            </div>
          )}

          {/* Preview */}
          {parsedRows.length > 0 && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-slate-700">
                <h3 className="text-sm font-semibold text-cyan-400">
                  Vista previa — {parsedRows.length} productos
                </h3>
                <button
                  onClick={handleReset}
                  className="text-slate-400 hover:text-white flex items-center gap-1 text-sm"
                >
                  <X className="w-4 h-4" />
                  Limpiar
                </button>
              </div>
              <div className="overflow-x-auto max-h-96">
                <table className="w-full">
                  <thead className="sticky top-0 bg-slate-700/80">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400 uppercase">Código</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400 uppercase">Categoría</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400 uppercase">Subcat.</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400 uppercase">Marca</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400 uppercase">Modelo</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400 uppercase">Descripción</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-slate-400 uppercase">Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {parsedRows.map((row, i) => {
                      const invalid = !row.codigoBarras || !row.descripcion;
                      return (
                        <tr key={i} className={invalid ? 'bg-red-500/10' : 'hover:bg-slate-700/30'}>
                          <td className="px-3 py-2 text-sm font-mono text-slate-300">{row.codigoBarras || '—'}</td>
                          <td className="px-3 py-2 text-sm text-slate-400">{row.categoria || '—'}</td>
                          <td className="px-3 py-2 text-sm text-slate-400">{row.subCategoria || '—'}</td>
                          <td className="px-3 py-2 text-sm text-slate-400">{row.marca || '—'}</td>
                          <td className="px-3 py-2 text-sm text-slate-400">{row.modelo || '—'}</td>
                          <td className="px-3 py-2 text-sm text-white">{row.descripcion || '—'}</td>
                          <td className="px-3 py-2 text-sm text-right text-cyan-400 font-bold">{row.stockInicial}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t border-slate-700">
                <button
                  onClick={handleImport}
                  className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Importar {parsedRows.length} productos
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
