'use client';

import { Database, Printer, Zap, Users, Package, LogOut } from 'lucide-react';
import { getCurrentUser, canManageUsers, canViewStock } from '@/utils/permissions';

interface PanelPrincipalPageProps {
  onSelectModule: (module: string) => void;
  onLogout: () => void;
}

export default function PanelPrincipal({ onSelectModule, onLogout }: PanelPrincipalPageProps) {
  const currentUser = getCurrentUser();
  const hasUserManagementAccess = canManageUsers(currentUser);
  const hasStockAccess = canViewStock(currentUser);
  return (
    <div className="w-full min-h-screen p-8 flex items-center justify-center">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Bienvenido a JR Computación
            </span>
          </h1>
          <p className="text-slate-400 text-xl">Selecciona un módulo para continuar</p>
        </div>

        {/* Modules Grid */}
        <div className={`grid grid-cols-1 md:grid-cols-2 ${hasUserManagementAccess ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-8`}>
          {/* Talonario Digital */}
          <button
            onClick={() => onSelectModule('talonario')}
            className="group relative bg-slate-800/40 border border-slate-700 rounded-lg p-8 hover:border-cyan-500/50 transition-all duration-300 overflow-hidden neon-border"
          >
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/10 group-hover:to-blue-500/10 transition-all duration-300" />

            {/* Content */}
            <div className="relative z-10 space-y-4">
              {/* Icon */}
              <div className="inline-flex p-4 bg-cyan-500/20 rounded-lg group-hover:bg-cyan-500/30 transition-all duration-300">
                <Zap size={32} className="text-cyan-400 group-hover:text-cyan-300 transition-colors" />
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                Talonario Digital
              </h2>

              {/* Description */}
              <p className="text-slate-400 group-hover:text-slate-300 transition-colors">
                Gestión completa de órdenes de trabajo técnico. Crea, busca, lista y da seguimiento a las reparaciones.
              </p>

              {/* Status Badge */}
              <div className="pt-4">
                <span className="inline-block px-3 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full">
                  Disponible
                </span>
              </div>
            </div>

            {/* Hover Effect Border */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/20 group-hover:via-transparent group-hover:to-blue-500/20 transition-all duration-300 pointer-events-none" />
          </button>

          {/* Stock */}
          {hasStockAccess && (
            <button
              onClick={() => onSelectModule('stock')}
              className="group relative bg-slate-800/40 border border-slate-700 rounded-lg p-8 hover:border-purple-500/50 transition-all duration-300 overflow-hidden neon-border"
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/10 group-hover:to-pink-500/10 transition-all duration-300" />

              {/* Content */}
              <div className="relative z-10 space-y-4">
                {/* Icon */}
                <div className="inline-flex p-4 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-all duration-300">
                  <Database size={32} className="text-purple-400 group-hover:text-purple-300 transition-colors" />
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-white group-hover:text-purple-300 transition-colors">
                  Stock
                </h2>

                {/* Description */}
                <p className="text-slate-400 group-hover:text-slate-300 transition-colors">
                  Gestión de inventario de repuestos y componentes. Monitorea stock y realiza pedidos.
                </p>

                {/* Status Badge */}
                <div className="pt-4">
                  <span className="inline-block px-3 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full">
                    Disponible
                  </span>
                </div>
              </div>

              {/* Hover Effect Border */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-purple-500/20 group-hover:via-transparent group-hover:to-pink-500/20 transition-all duration-300 pointer-events-none" />
            </button>
          )}

          {/* Impresoras en Alquiler */}
          <div className="relative bg-slate-800/40 border border-slate-700 rounded-lg p-8 hover:border-pink-500/50 transition-all duration-300 overflow-hidden neon-border group">
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 to-red-500/0 group-hover:from-pink-500/10 group-hover:to-red-500/10 transition-all duration-300" />

            {/* Content */}
            <div className="relative z-10 space-y-4">
              {/* Icon */}
              <div className="inline-flex p-4 bg-pink-500/20 rounded-lg group-hover:bg-pink-500/30 transition-all duration-300">
                <Printer size={32} className="text-pink-400 group-hover:text-pink-300 transition-colors" />
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-white group-hover:text-pink-300 transition-colors">
                Impresoras en Alquiler
              </h2>

              {/* Description */}
              <p className="text-slate-400 group-hover:text-slate-300 transition-colors">
                Administra contratos de alquiler y mantenimiento de impresoras. Controla pagos y servicios.
              </p>

              {/* Status Badge */}
              <div className="pt-4">
                <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-400 text-xs font-semibold rounded-full">
                  Próximamente
                </span>
              </div>
            </div>

            {/* Hover Effect Border */}
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/0 via-pink-500/0 to-red-500/0 group-hover:from-pink-500/20 group-hover:via-transparent group-hover:to-red-500/20 transition-all duration-300 pointer-events-none" />
          </div>

          {/* Gestión de Usuarios - Solo para Administrador */}
          {hasUserManagementAccess && (
            <button
              onClick={() => onSelectModule('usuarios')}
              className="group relative bg-slate-800/40 border border-slate-700 rounded-lg p-8 hover:border-amber-500/50 transition-all duration-300 overflow-hidden neon-border"
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-orange-500/0 group-hover:from-amber-500/10 group-hover:to-orange-500/10 transition-all duration-300" />

              {/* Content */}
              <div className="relative z-10 space-y-4">
                {/* Icon */}
                <div className="inline-flex p-4 bg-amber-500/20 rounded-lg group-hover:bg-amber-500/30 transition-all duration-300">
                  <Users size={32} className="text-amber-400 group-hover:text-amber-300 transition-colors" />
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-white group-hover:text-amber-300 transition-colors">
                  Gestión de Usuarios
                </h2>

                {/* Description */}
                <p className="text-slate-400 group-hover:text-slate-300 transition-colors">
                  Administra usuarios, roles y permisos del sistema. Controla acceso y seguridad.
                </p>

                {/* Status Badge */}
                <div className="pt-4">
                  <span className="inline-block px-3 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full">
                    Disponible
                  </span>
                </div>
              </div>

              {/* Hover Effect Border */}
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/0 to-orange-500/0 group-hover:from-amber-500/20 group-hover:via-transparent group-hover:to-orange-500/20 transition-all duration-300 pointer-events-none" />
            </button>
          )}

          {/* Entrega de Equipos */}
          <button
            onClick={() => onSelectModule('delivery')}
            className="group relative bg-slate-800/40 border border-slate-700 rounded-lg p-8 hover:border-cyan-500/50 transition-all duration-300 overflow-hidden neon-border"
          >
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-emerald-500/0 group-hover:from-green-500/10 group-hover:to-emerald-500/10 transition-all duration-300" />

            {/* Content */}
            <div className="relative z-10 space-y-4">
              {/* Icon */}
              <div className="inline-flex p-4 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-all duration-300">
                <Package size={32} className="text-green-400 group-hover:text-green-300 transition-colors" />
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-white group-hover:text-green-300 transition-colors">
                Entrega de Equipos
              </h2>

              {/* Description */}
              <p className="text-slate-400 group-hover:text-slate-300 transition-colors">
                Gestiona la entrega de equipos completados a los clientes. Registra entregas y confirma recibos.
              </p>

              {/* Status Badge */}
              <div>
                <span className="inline-block px-3 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full">
                  Disponible
                </span>
              </div>
            </div>

            {/* Hover Effect Border */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/0 to-emerald-500/0 group-hover:from-green-500/20 group-hover:via-transparent group-hover:to-emerald-500/20 transition-all duration-300 pointer-events-none" />
          </button>
        </div>

        {/* Botón cerrar sesión */}
        <div className="flex justify-center mt-10">
          <button
            onClick={() => onLogout()}
            className="px-6 py-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-white transition-all duration-300 hover:scale-105 flex items-center gap-2"
          >
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}
