'use client';

import { useState } from 'react';
import { User } from '@/types/index';
import Sidebar from '@/components/Sidebar';
import LoginPage from '@/components/pages/LoginPage';
import PanelPrincipalPage from '@/components/pages/PanelPrincipalPage';
import HomePage from '@/components/pages/HomePage';
import NewOrderPage from '@/components/pages/NewOrderPage';
import SearchOrderPage from '@/components/pages/SearchOrderPage';
import ListOrdersPage from '@/components/pages/ListOrdersPage';
import TechnicalTrackingPage from '@/components/pages/TechnicalTrackingPage';
import UserManagementPage from '@/components/pages/UserManagementPage';
import DeliveryManagementPage from '@/components/pages/DeliveryManagementPage';
import ServicesAndPricesPage from '@/components/pages/ServicesAndPricesPage';
import StockManagementPage from '@/components/pages/StockManagementPage';

type Page = 'panel' | 'home' | 'new-order' | 'search-order' | 'list-orders' | 'technical-tracking' | 'user-management' | 'delivery-management' | 'services-prices' | 'stock';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('panel');

  const handleLogin = () => {
    const savedUser = localStorage.getItem('currentUser');

    if (savedUser){
      setCurrentUser(JSON.parse(savedUser));
    }

    setIsAuthenticated(true);
    console.log('[v0] Usuario autenticado');
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setIsAuthenticated(false);
    setCurrentPage('panel');
    console.log('[v0] Usuario desautenticado');
  };

  const handleModuleSelect = (module: string) => {
    if (module === 'talonario') {
      setCurrentPage('home');
    } else if (module === 'usuarios') {
      setCurrentPage('user-management');
    } else if (module === 'delivery') {
      setCurrentPage('delivery-management');
    } else if (module === 'stock') {
      setCurrentPage('stock');
    }
  };

  // Si no está autenticado, mostrar login
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'panel':
        return (<PanelPrincipalPage onSelectModule={handleModuleSelect} onLogout={handleLogout} /> );
      case 'home':
        return <HomePage onNavigate={setCurrentPage} />;
      case 'new-order':
        return <NewOrderPage onBack={() => setCurrentPage('home')} />;
      case 'search-order':
        return <SearchOrderPage onBack={() => setCurrentPage('home')} />;
      case 'list-orders':
        return <ListOrdersPage onBack={() => setCurrentPage('home')} />;
      case 'technical-tracking':
        return <TechnicalTrackingPage onBack={() => setCurrentPage('home')} />;
      case 'user-management':
        return <UserManagementPage onBack={() => setCurrentPage('panel')} />;
      case 'delivery-management':
        return <DeliveryManagementPage onBack={() => setCurrentPage('panel')} />;
      case 'services-prices':
        return <ServicesAndPricesPage onBack={() => setCurrentPage('home')} />;
      case 'stock':
        return <StockManagementPage onBack={() => setCurrentPage('panel')} />;
      default:
        return <PanelPrincipalPage onSelectModule={handleModuleSelect} onLogout={handleLogout} />;
    }
  };

  const showSidebar = currentPage !== 'panel' && currentPage !== 'user-management' && currentPage !== 'delivery-management' && currentPage !== 'stock';

  return (
    <div className="relative flex h-screen text-foreground overflow-hidden">
      {/* Fondo */}
      <div
        className="absolute inset-0 bg-cover bg-center blur-sm scale-105"
        style={{
          backgroundImage: "url('/fondo.png')",
        }}
      />

      {/* Overlay oscuro opcional */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Contenido */}
      <div className="relative flex h-screen w-full">
        {showSidebar && <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} onLogout={handleLogout} currentUser={currentUser || undefined} />}

        <main className="flex-1 overflow-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
