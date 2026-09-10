'use client';

import { useState } from 'react';
import { ArrowLeft, Package, ArrowUpCircle, ArrowDownCircle, Settings, List, History, Bell, FileSpreadsheet } from 'lucide-react';
import { getCurrentUser, canViewStock } from '@/utils/permissions';
import StockDashboard from '@/components/stock/StockDashboard';
import StockEntryPage from '@/components/stock/StockEntryPage';
import StockSalesPage from '@/components/stock/StockSalesPage';
import StockAdjustmentPage from '@/components/stock/StockAdjustmentPage';
import StockListPage from '@/components/stock/StockListPage';
import StockHistoryPage from '@/components/stock/StockHistoryPage';
import StockAlertsPage from '@/components/stock/StockAlertsPage';
import StockImportPage from '@/components/stock/StockImportPage';

type StockView = 'dashboard' | 'entry' | 'sale' | 'adjustment' | 'import' | 'list' | 'history' | 'alerts';

interface StockManagementPageProps {
  onBack: () => void;
}

const NAV_ITEMS: { id: StockView; label: string; icon: React.ReactNode; color: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <Package className="w-4 h-4" />, color: 'cyan' },
  { id: 'entry', label: 'Entradas', icon: <ArrowUpCircle className="w-4 h-4" />, color: 'green' },
  { id: 'sale', label: 'Ventas', icon: <ArrowDownCircle className="w-4 h-4" />, color: 'blue' },
  { id: 'adjustment', label: 'Ajustes', icon: <Settings className="w-4 h-4" />, color: 'purple' },
  { id: 'import', label: 'Importar', icon: <FileSpreadsheet className="w-4 h-4" />, color: 'cyan' },
  { id: 'list', label: 'Listar Stock', icon: <List className="w-4 h-4" />, color: 'cyan' },
  { id: 'history', label: 'Historial', icon: <History className="w-4 h-4" />, color: 'slate' },
  { id: 'alerts', label: 'Alertas', icon: <Bell className="w-4 h-4" />, color: 'amber' },
];

export default function StockManagementPage({ onBack }: StockManagementPageProps) {
  const currentUser = getCurrentUser();
  const hasAccess = canViewStock(currentUser);
  const [currentView, setCurrentView] = useState<StockView>('dashboard');

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-slate-900 p-8">
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6 text-center">
          <Package className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-400 mb-2">Acceso Denegado</h2>
          <p className="text-slate-400">No tienes permiso para acceder al módulo de stock.</p>
          <button onClick={onBack} className="mt-4 text-cyan-400 hover:text-cyan-300">
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  const handleNavigate = (view: string) => {
    setCurrentView(view as StockView);
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  const getColorClasses = (color: string, isActive: boolean) => {
    if (!isActive) {
      return 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-700/50 hover:border-slate-600';
    }
    switch (color) {
      case 'green':
        return 'bg-green-500/20 border-green-500/50 text-green-400';
      case 'blue':
        return 'bg-blue-500/20 border-blue-500/50 text-blue-400';
      case 'purple':
        return 'bg-purple-500/20 border-purple-500/50 text-purple-400';
      case 'amber':
        return 'bg-amber-500/20 border-amber-500/50 text-amber-400';
      case 'cyan':
      default:
        return 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <Package className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Gestión de Stock</h1>
                <p className="text-slate-400 text-sm">Control de inventario y movimientos</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">Usuario</p>
            <p className="text-white font-medium">{currentUser.nombre} {currentUser.apellido}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-slate-800/30 border-b border-slate-700 px-6 py-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors whitespace-nowrap ${
                getColorClasses(item.color, currentView === item.id)
              }`}
            >
              {item.icon}
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {currentView === 'dashboard' && (
          <StockDashboard onNavigate={handleNavigate} />
        )}
        {currentView === 'entry' && (
          <StockEntryPage onBack={handleBackToDashboard} />
        )}
        {currentView === 'sale' && (
          <StockSalesPage onBack={handleBackToDashboard} />
        )}
        {currentView === 'adjustment' && (
          <StockAdjustmentPage onBack={handleBackToDashboard} />
        )}
        {currentView === 'import' && (
          <StockImportPage onBack={handleBackToDashboard} />
        )}
        {currentView === 'list' && (
          <StockListPage onBack={handleBackToDashboard} />
        )}
        {currentView === 'history' && (
          <StockHistoryPage onBack={handleBackToDashboard} />
        )}
        {currentView === 'alerts' && (
          <StockAlertsPage onBack={handleBackToDashboard} />
        )}
      </div>
    </div>
  );
}
