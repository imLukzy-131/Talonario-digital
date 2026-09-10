'use client';

import { useState } from 'react';
import { LogIn, AlertCircle } from 'lucide-react';
import { getCurrentUser } from '@/utils/permissions';
import { loadUsersFromStorage, saveCurrentUserToStorage, saveUsersToStorage } from '@/utils/storage';

interface LoginPageProps {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [usuario, setUsuario] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!usuario.trim()) {
      setError('Por favor ingresa tu usuario');
      return;
    }
    if (!contraseña.trim()) {
      setError('Por favor ingresa tu contraseña');
      return;
    }
    console.log('Intentando ingresar con:', { usuario, contraseña });
    setIsLoading(true);

    setTimeout(() => {
      // 1. Obtener el usuario administrador por defecto
      const defaultAdmin = getCurrentUser();
      
      // 2. Cargar usuarios guardados
      let users = loadUsersFromStorage();
      
      // Si el almacenamiento está vacío, inicializarlo con el admin por defecto
      if (users.length === 0) {
        users = [defaultAdmin];
        saveUsersToStorage(users);
      }

      const inputUser = usuario.trim().toLowerCase();

      // 3. Buscar en la lista de usuarios O permitir acceso directo al administrador por defecto
      const foundUser = users.find(
        u => u.usuario.toLowerCase() === inputUser && u.contraseña === contraseña && u.activo
      ) || (inputUser === defaultAdmin.usuario.toLowerCase() && contraseña === defaultAdmin.contraseña ? defaultAdmin : null);

      if (foundUser) {
        saveCurrentUserToStorage(foundUser);
        setIsLoading(false);
        onLogin();
      } else {
        setError('Usuario o contraseña inválidos');
        setIsLoading(false);
      }
    }, 400);
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <img
              src="/logo.png"
              alt="JR Computación"
              className="w-80 h-auto object-contain drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]"
            />
          </div>
          <p className="text-slate-400 text-xl">Sistema de gestión</p>
        </div>

        <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-8 backdrop-blur-sm space-y-6">
          <h2 className="text-2xl font-semibold text-white text-center mb-8">Iniciar sesión</h2>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-cyan-400 mb-2">Usuario</label>
              <input
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="Ingresa tu usuario"
                disabled={isLoading}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-cyan-400 mb-2">Contraseña</label>
              <input
                type="password"
                value={contraseña}
                onChange={(e) => setContraseña(e.target.value)}
                placeholder="Ingresa tu contraseña"
                disabled={isLoading}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-cyan-500/50 disabled:to-blue-600/50 text-white rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 mt-8 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Ingresando...
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  Ingresar
                </>
              )}
            </button>
          </form>

          <div className="pt-6 border-t border-slate-700 text-center">
            <p className="text-slate-400 text-xs">Versión 0.140 - Sistema de gestión</p>
          </div>
        </div>

        <div className="mt-8 bg-slate-800/30 border border-slate-700/50 rounded-lg p-4 text-center">
          <p className="text-slate-400 text-xs mb-1">Acceso Administrativo por defecto:</p>
          <p className="text-slate-300 text-xs">Usuario: <span className="text-cyan-400 font-mono">hecker</span> | Contraseña: <span className="text-cyan-400 font-mono">hecker123</span></p>
        </div>
      </div>
    </div>
  );
}