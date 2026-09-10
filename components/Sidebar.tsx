'use client';

import { Home, Plus, Search, List, Wrench, Tag, LogOut, Cloud, Currency } from 'lucide-react';
import { useState } from 'react';

type Page = 'home' | 'new-order' | 'search-order' | 'list-orders' | 'technical-tracking' | 'user-management' | 'services-prices';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLogout?: () => void;
  currentUser?: {
    nombre: string;
    rol: string;
  };
}

export default function Sidebar({ currentPage, onNavigate, onLogout, currentUser }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'home', label: 'Inicio', icon: Home },
    { id: 'new-order', label: 'Nueva Orden', icon: Plus },
    { id: 'search-order', label: 'Buscar Orden', icon: Search },
    { id: 'list-orders', label: 'Listar Órdenes', icon: List },
    { id: 'technical-tracking', label: 'Seguimiento', icon: Wrench },
    { id: 'services-prices', label: 'Servicios y Precios', icon: Tag },
  ];

  return (
    <div className={`${isCollapsed ? 'w-20' : 'w-64'} bg-gradient-to-b from-slate-900 to-slate-950 border-r border-slate-800 flex flex-col transition-all duration-300 neon-border`}>
      {/* Header with logo area */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-2 ${isCollapsed ? 'hidden' : ''}`}>
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">JR</span>
            </div>
            <span className="text-white font-bold text-sm">JR Computación</span>
          </div>
          {!isCollapsed && (
            <button onClick={() => setIsCollapsed(true)} className="text-slate-400 hover:text-cyan-400 transition-colors">
              <ChevronLeft size={18} />
            </button>
          )}
        </div>
        {isCollapsed && (
          <button onClick={() => setIsCollapsed(false)} className="text-slate-400 hover:text-cyan-400 transition-colors mx-auto mt-2">
            <ChevronRight size={18} />
          </button>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as Page)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 neon-glow'
                  : 'text-slate-300 hover:text-cyan-300 hover:bg-slate-800/50'
              } ${isCollapsed ? 'justify-center' : ''}`}
              title={isCollapsed ? item.label : ''}
            >
              <Icon size={20} />
              {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* User section */}
      <div className={`p-4 border-t border-slate-800 space-y-3 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
        <div className={`flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800/50 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {currentUser?.nombre
              ? currentUser.nombre
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                : '??'
            }
          </div>
          {!isCollapsed && (
            <div className="text-sm">
              <p className="font-medium text-white">
                {currentUser?.nombre || 'Invitado'}
              </p>
              <p className="text-xs text-slate-400">
                {currentUser?.rol || 'Sin rol'}
              </p>
            </div>
          )}
        </div>
        <button 
          onClick={onLogout}
          className={`w-full flex items-center gap-3 px-4 py-2 text-slate-300 hover:text-red-400 transition-colors rounded-lg ${isCollapsed ? 'justify-center' : ''}`} 
          title={isCollapsed ? 'Cerrar Sesión' : ''}
        >
          <LogOut size={18} />
          {!isCollapsed && <span className="text-sm font-medium">Cerrar Sesión</span>}
        </button>
      </div>
    </div>
  );
}

function ChevronLeft(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
  );
}

function ChevronRight(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  );
}
