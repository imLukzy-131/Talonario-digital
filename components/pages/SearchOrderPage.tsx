'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Search, AlertCircle } from 'lucide-react';
import { loadOrdersFromStorage } from '@/utils/storage';
import { Order } from '@/types/index';

interface SearchOrderPageProps {
  onBack: () => void;
}

export default function SearchOrderPage({ onBack }: SearchOrderPageProps) {
  const [searchBy, setSearchBy] = useState('numero'); // 'numero', 'cliente', 'telefono'
  const [searchInput, setSearchInput] = useState('');
  const [results, setResults] = useState<Order[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [allOrders, setAllOrders] = useState<Order[]>([]);

  // Cargar órdenes del localStorage al montar
  useEffect(() => {
    const loadedOrders = loadOrdersFromStorage();
    setAllOrders(loadedOrders);
  }, []);

  // Limpieza del mensaje de error después de 3 segundos
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchInput.trim()) {
      setErrorMessage('Por favor ingresa un criterio de búsqueda');
      setResults([]);
      setHasSearched(false);
      return;
    }

    let foundOrders: Order[] = [];

    if (searchBy === 'numero') {
      foundOrders = allOrders.filter(order =>
        order.numeroOrden.toLowerCase().includes(searchInput.toLowerCase())
      );
    } else if (searchBy === 'cliente') {
      foundOrders = allOrders.filter(order =>
        `${order.nombre} ${order.apellido}`.toLowerCase().includes(searchInput.toLowerCase())
      );
    } else if (searchBy === 'telefono') {
      foundOrders = allOrders.filter(order =>
        order.telefono.includes(searchInput)
      );
    }

    setHasSearched(true);

    if (foundOrders.length === 0) {
      setErrorMessage('Orden no encontrada o no existe');
      setResults([]);
    } else {
      setErrorMessage(null);
      setResults(foundOrders);
    }

    console.log('[v0] Búsqueda realizada:', { searchBy, searchInput, foundOrders });
  };

  const handleSearchTypeChange = (type: string) => {
    setSearchBy(type);
    setResults([]);
    setHasSearched(false);
    setErrorMessage(null);
    setSearchInput('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completado':
        return 'bg-green-500/20 text-green-400';
      case 'En proceso':
        return 'bg-blue-500/20 text-blue-400';
      case 'Pendiente':
        return 'bg-yellow-500/20 text-yellow-400';
      default:
        return 'bg-slate-500/20 text-slate-400';
    }
  };

  return (
    <div className="w-full min-h-screen p-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        Volver
      </button>

      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Buscar Orden
          </span>
        </h1>
        <p className="text-slate-400 mb-8">Encuentra órdenes existentes usando distintos criterios de búsqueda</p>

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-center gap-3 animate-pulse">
            <AlertCircle size={20} className="text-red-400" />
            <p className="text-red-400 font-semibold">{errorMessage}</p>
          </div>
        )}

        {/* Search Container */}
        <div className="space-y-6">
          {/* Search Type Selection */}
          <div className="flex gap-3 mb-6">
            {[
              { id: 'numero', label: 'Por número de orden' },
              { id: 'cliente', label: 'Por cliente' },
              { id: 'telefono', label: 'Por teléfono' },
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => handleSearchTypeChange(type.id)}
                className={`px-4 py-2 rounded-lg border transition-all duration-200 text-sm font-medium ${
                  searchBy === type.id
                    ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400'
                    : 'border-slate-600 hover:border-cyan-500 bg-slate-700/30 hover:bg-slate-700/60 text-white'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          {/* Search Options */}
          <form onSubmit={handleSearch} className="bg-slate-800/40 border border-slate-700 rounded-lg p-8 neon-border">
            <div className="space-y-4">
              {searchBy === 'numero' && (
                <div>
                  <label className="block text-sm font-semibold text-cyan-400 mb-2">Número de orden:</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ej: 00001"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      className="flex-1 bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none transition-colors"
                    />
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-lg font-semibold transition-all duration-200 neon-glow flex items-center gap-2"
                    >
                      <Search size={18} />
                      Buscar
                    </button>
                  </div>
                </div>
              )}

              {searchBy === 'cliente' && (
                <div>
                  <label className="block text-sm font-semibold text-cyan-400 mb-2">Nombre del cliente:</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ej: Juan García"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      className="flex-1 bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none transition-colors"
                    />
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-lg font-semibold transition-all duration-200 neon-glow flex items-center gap-2"
                    >
                      <Search size={18} />
                      Buscar
                    </button>
                  </div>
                </div>
              )}

              {searchBy === 'telefono' && (
                <div>
                  <label className="block text-sm font-semibold text-cyan-400 mb-2">Teléfono del cliente:</label>
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      placeholder="Ej: 1234567890"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      className="flex-1 bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none transition-colors"
                    />
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-lg font-semibold transition-all duration-200 neon-glow flex items-center gap-2"
                    >
                      <Search size={18} />
                      Buscar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </form>

          {/* Results Section */}
          {hasSearched && results.length > 0 && (
            <div className="bg-slate-800/40 border border-slate-700 rounded-lg overflow-hidden neon-border">
              <div className="p-6 border-b border-slate-700 bg-slate-800/60">
                <h2 className="text-lg font-semibold text-cyan-400">
                  Resultados de búsqueda: {results.length} orden{results.length !== 1 ? 'es' : ''} encontrada{results.length !== 1 ? 's' : ''}
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-800/60 border-b border-slate-700">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Orden ID</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Cliente</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Teléfono</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Equipo</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Problema</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Fecha</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {results.map((order) => (
                      <tr key={order.numeroOrden} className="hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 text-sm text-cyan-300 font-mono font-semibold">{order.numeroOrden}</td>
                        <td className="px-6 py-4 text-sm text-white">{order.nombre} {order.apellido}</td>
                        <td className="px-6 py-4 text-sm text-slate-300">{order.telefono}</td>
                        <td className="px-6 py-4 text-sm text-white">
                          <div className="text-sm">
                            <p className="font-medium">{order.marca} {order.modelo}</p>
                            <p className="text-slate-400 text-xs">{order.tipoEquipo}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-300 max-w-xs truncate" title={order.problemaReportado}>
                          {order.problemaReportado}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-300">{order.fecha}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty State */}
          {hasSearched && results.length === 0 && !errorMessage && (
            <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-12 neon-border text-center">
              <p className="text-slate-400 text-lg">No se encontraron resultados</p>
            </div>
          )}

          {/* Initial State */}
          {!hasSearched && (
            <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-12 neon-border text-center">
              <p className="text-slate-400 text-lg">Ingresa criterios de búsqueda para ver resultados aquí</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
