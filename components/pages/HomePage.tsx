'use client';

import { Plus, Search, List, Tag, Wrench, MessageCircleMore, Instagram, Facebook, Mail } from 'lucide-react';
import { getCurrentUser, canEditTracking, canManageInventory, canManageServices } from '@/utils/permissions';

type Page = 'home' |'panel' | 'new-order' | 'search-order' | 'list-orders' | 'technical-tracking' | 'user-management' | 'services-prices';

interface HomePageProps {
  onNavigate: (page: Page) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const quickActions = [
    {
      id: 'new-order',
      title: 'Nueva Orden',
      icon: Plus,
      color: 'from-blue-500 to-blue-600',
      description: 'Crear una nueva orden de trabajo',
    },
    {
      id: 'search-order',
      title: 'Buscar Orden',
      icon: Search,
      color: 'from-cyan-500 to-cyan-600',
      description: 'Buscar órdenes existentes',
    },
    {
      id: 'list-orders',
      title: 'Listar Órdenes',
      icon: List,
      color: 'from-purple-500 to-purple-600',
      description: 'Ver todas las órdenes',
    },
    {
      id: 'services-prices',
      title: 'Actualizar Precios',
      icon: Tag,
      color: 'from-amber-500 to-amber-600',
      description: 'Gestionar servicios y precios',
    },
    {
      id: 'technical-tracking',
      title: 'Seguimiento equipos',
      icon: Wrench,
      color: 'from-green-500 to-green-600',
      description: 'Monitorear estado de trabajos',
    },
  ];

  const filteredActions = quickActions.filter((action) => {
    //Solo Administradores y Técnicos
    if (action.id === 'technical-tracking'){
      return canEditTracking(getCurrentUser());
    }
    //Solo Admins
    if (action.id === 'services-prices') {
      return canManageServices(getCurrentUser());
    }
    return true;
  });

  return (
    <div className="w-full min-h-screen p-4 md:p-8 pt-12">
      <div className="flex justify-end mb-6">
        <img
          src="/logo.png"
          alt="JR Computación"
          className="w-48 md:w-64 object-contain opacity-90"
        />
      </div>
  
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-bold mb-2">
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent neon-text">
            Talonario Digital
          </span>
        </h1>
        <p className="text-slate-300 text-lg">
          ELIGE UNA CATEGORÍA
        </p>
      </div>

      {/* Quick Actions Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {filteredActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => onNavigate(action.id as Page)}
              className="group relative p-6 rounded-lg border border-slate-700 hover:border-cyan-500/50 bg-slate-800/30 hover:bg-slate-800/60 transition-all duration-300 neon-border hover:neon-glow text-left overflow-hidden"
            >
              {/* Background gradient on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 -z-10`}></div>
              
              {/* Icon and Title */}
              <div className="flex flex-col items-center text-center gap-4">
                <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={32} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {action.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      {/**Boton para volver al panel principal */} 
      <div className="fixed bottom-20 right-20 z-50">
        <button
          onClick={() => onNavigate('panel')}
          className="px-4 py-2 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-white border border-slate-600 transition"
        >
         ← Volver al Panel
        </button>
      </div> 

      {/* Footer with social icons */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex gap-6">
        {[
          { name: 'WhatsApp', icon: MessageCircleMore },
          { name: 'Instagram', icon: Instagram },
          { name: 'Facebook', icon: Facebook },
          { name: 'Email', icon: Mail },
        ].map((social) => (
          <button
            key={social.name}
            className="w-10 h-10 rounded-full border border-slate-700 hover:border-cyan-500 bg-slate-800/50 hover:bg-slate-800 flex items-center justify-center transition-all duration-200 hover:neon-glow"
            title={social.name}
          >
            <social.icon size={20} className='text-cyan-400'/>
          </button>
        ))}
      </div>
    </div>
  );
}
