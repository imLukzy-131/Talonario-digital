'use client';

import { useState, useEffect } from 'react';
import { loadUsersFromStorage, saveUsersToStorage } from '@/utils/storage';
import { User } from '@/types/index';
import { ArrowLeft, Plus, Edit2, Trash2, Shield, X, Check, AlertCircle } from 'lucide-react';


interface UserManagementPageProps {
  onBack: () => void;
}

interface FormErrors {
  [key: string]: string;
}

interface UserFormData {
  nombre: string;
  apellido: string;
  usuario: string;
  contraseña: string;
  rol: 'Administrador' | 'Técnico' | 'Administrativo' ;
}

const ROLES = ['Administrador', 'Técnico', 'Administrativo'];

export default function UserManagementPage({ onBack }: UserManagementPageProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    nombre: '',
    apellido: '',
    usuario: '',
    contraseña: '',
    rol: 'Técnico',
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Cargar usuarios del localStorage
  useEffect(() => {
    const loadedUsers = loadUsersFromStorage();
    setUsers(loadedUsers);
  }, []);

  // Limpiar mensajes de éxito/error después de 3 segundos
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre es obligatorio';
    }
    if (!formData.apellido.trim()) {
      errors.apellido = 'El apellido es obligatorio';
    }
    if (!formData.usuario.trim()) {
      errors.usuario = 'El usuario es obligatorio';
    }
    if (!formData.contraseña.trim()) {
      errors.contraseña = 'La contraseña es obligatoria';
    }
    if (formData.contraseña.length < 6) {
      errors.contraseña = 'La contraseña debe tener al menos 6 caracteres';
    }

    // Validar usuario único (excepto si estamos editando el mismo usuario)
    const usuarioExistente = users.find(
      u => u.usuario.toLowerCase() === formData.usuario.toLowerCase() && u.id !== editingId
    );
    if (usuarioExistente) {
      errors.usuario = 'Este usuario ya existe';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleCreateUser = () => {
    setEditingId(null);
    setFormData({
      nombre: '',
      apellido: '',
      usuario: '',
      contraseña: '',
      rol: 'Técnico',
    });
    setFormErrors({});
    setShowForm(true);
  };

  const handleEditUser = (user: User) => {
    setEditingId(user.id);
    setFormData({
      nombre: user.nombre,
      apellido: user.apellido,
      usuario: user.usuario,
      contraseña: user.contraseña,
      rol: user.rol,
    });
    setFormErrors({});
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setErrorMessage('Por favor completa los campos requeridos');
      return;
    }

    if (editingId) {
      // Actualizar usuario existente
      const updatedUsers = users.map(u =>
        u.id === editingId
          ? {
              ...u,
              nombre: formData.nombre,
              apellido: formData.apellido,
              usuario: formData.usuario,
              contraseña: formData.contraseña,
              rol: formData.rol,
            }
          : u
      );
      setUsers(updatedUsers);
      saveUsersToStorage(updatedUsers);
      setSuccessMessage('Usuario actualizado exitosamente');
      console.log('[v0] Usuario actualizado:', editingId);
    } else {
      // Crear nuevo usuario
      const newUser: User = {
        id: Date.now().toString(),
        nombre: formData.nombre,
        apellido: formData.apellido,
        usuario: formData.usuario,
        contraseña: formData.contraseña,
        rol: formData.rol,
        activo: true,
        createdAt: new Date().toISOString(),
      };
      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      saveUsersToStorage(updatedUsers);
      setSuccessMessage('Usuario creado exitosamente');
      console.log('[v0] Usuario creado:', newUser);
    }

    setShowForm(false);
    setFormData({
      nombre: '',
      apellido: '',
      usuario: '',
      contraseña: '',
      rol: 'Técnico',
    });
    setFormErrors({});
  };

  const handleDeleteUser = (id: string) => {
    const updatedUsers = users.filter(u => u.id !== id);
    setUsers(updatedUsers);
    saveUsersToStorage(updatedUsers);
    setSuccessMessage('Usuario eliminado exitosamente');
    setShowDeleteConfirm(null);
    console.log('[v0] Usuario eliminado:', id);
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData({
      nombre: '',
      apellido: '',
      usuario: '',
      contraseña: '',
      rol: 'Técnico',
    });
    setFormErrors({});
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
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Gestión de Usuarios
              </span>
            </h1>
            <p className="text-slate-400">Administra los usuarios del sistema JR Computación</p>
          </div>
          <button
            onClick={handleCreateUser}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-lg font-semibold transition-all duration-200 neon-glow flex items-center gap-2"
          >
            <Plus size={20} />
            Nuevo Usuario
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-500/20 border border-green-500/50 rounded-lg p-4 flex items-center gap-3 animate-pulse">
            <Check size={20} className="text-green-400" />
            <p className="text-green-400 font-semibold">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-center gap-3 animate-pulse">
            <AlertCircle size={20} className="text-red-400" />
            <p className="text-red-400 font-semibold">{errorMessage}</p>
          </div>
        )}

        {/* Create/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-lg max-w-xl w-full neon-border">
              <div className="flex justify-between items-center p-6 border-b border-slate-700">
                <h2 className="text-2xl font-bold text-cyan-400">
                  {editingId ? 'Editar Usuario' : 'Nuevo Usuario'}
                </h2>
                <button
                  onClick={handleCancel}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-semibold text-cyan-400 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className={`w-full bg-slate-700/50 border rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none transition-colors ${
                      formErrors.nombre ? 'border-red-500' : 'border-slate-600'
                    }`}
                    placeholder="Juan"
                  />
                  {formErrors.nombre && (
                    <p className="text-red-400 text-xs mt-1">{formErrors.nombre}</p>
                  )}
                </div>

                {/* Apellido */}
                <div>
                  <label className="block text-sm font-semibold text-cyan-400 mb-2">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleInputChange}
                    className={`w-full bg-slate-700/50 border rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none transition-colors ${
                      formErrors.apellido ? 'border-red-500' : 'border-slate-600'
                    }`}
                    placeholder="García"
                  />
                  {formErrors.apellido && (
                    <p className="text-red-400 text-xs mt-1">{formErrors.apellido}</p>
                  )}
                </div>

                {/* Usuario */}
                <div>
                  <label className="block text-sm font-semibold text-cyan-400 mb-2">
                    Usuario *
                  </label>
                  <input
                    type="text"
                    name="usuario"
                    value={formData.usuario}
                    onChange={handleInputChange}
                    className={`w-full bg-slate-700/50 border rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none transition-colors ${
                      formErrors.usuario ? 'border-red-500' : 'border-slate-600'
                    }`}
                    placeholder="jgarcia"
                  />
                  {formErrors.usuario && (
                    <p className="text-red-400 text-xs mt-1">{formErrors.usuario}</p>
                  )}
                </div>

                {/* Contraseña */}
                <div>
                  <label className="block text-sm font-semibold text-cyan-400 mb-2">
                    Contraseña *
                  </label>
                  <input
                    type="password"
                    name="contraseña"
                    value={formData.contraseña}
                    onChange={handleInputChange}
                    className={`w-full bg-slate-700/50 border rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none transition-colors ${
                      formErrors.contraseña ? 'border-red-500' : 'border-slate-600'
                    }`}
                    placeholder="••••••"
                  />
                  {formErrors.contraseña && (
                    <p className="text-red-400 text-xs mt-1">{formErrors.contraseña}</p>
                  )}
                </div>

                {/* Rol */}
                <div>
                  <label className="block text-sm font-semibold text-cyan-400 mb-2">
                    Rol *
                  </label>
                  <select
                    name="rol"
                    value={formData.rol}
                    onChange={handleInputChange}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none transition-colors"
                  >
                    {ROLES.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Check size={18} />
                    {editingId ? 'Actualizar' : 'Crear'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Users Table */}
        {users.length > 0 ? (
          <div className="bg-slate-800/40 border border-slate-700 rounded-lg overflow-hidden neon-border mb-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-800/60 border-b border-slate-700">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Nombre</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Usuario</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Rol</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-white font-medium">
                        {user.nombre} {user.apellido}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300 font-mono">{user.usuario}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Shield size={16} className="text-cyan-400" />
                          <span className="text-white">{user.rol}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm flex gap-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="p-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/40 text-purple-400 transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(user.id)}
                          className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-12 neon-border text-center mb-8">
            <p className="text-slate-400 text-lg">No hay usuarios registrados</p>
            <p className="text-slate-500 text-sm mt-2">Crea un nuevo usuario para comenzar</p>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-sm mx-4">
              <h3 className="text-xl font-bold text-white mb-4">Confirmar eliminación</h3>
              <p className="text-slate-300 mb-6">
                ¿Deseas eliminar al usuario {users.find(u => u.id === showDeleteConfirm)?.usuario}?
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDeleteUser(showDeleteConfirm)}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors font-semibold"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Roles Section */}
        <div>
          <h2 className="text-2xl font-bold text-cyan-400 mb-4">Roles disponibles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Administrador',
                desc: 'Acceso total al sistema',
                permissions: 'CRUD completo',
              },
              {
                name: 'Técnico',
                desc: 'Gestión de órdenes y seguimiento',
                permissions: 'Lectura/Escritura limitada',
              },
              {
                name: 'Administrativo',
                desc: 'Gestión administrativa',
                permissions: 'Lectura/Escritura básica',
              },
            ].map((role) => (
              <div
                key={role.name}
                className="bg-slate-800/40 border border-slate-700 rounded-lg p-6 neon-border hover:border-cyan-500/50 transition-colors"
              >
                <h3 className="text-white font-semibold text-lg mb-2">{role.name}</h3>
                <p className="text-slate-400 text-sm mb-3">{role.desc}</p>
                <div className="text-xs">
                  <span className="text-cyan-400 font-semibold">Permisos: </span>
                  <span className="text-slate-300">{role.permissions}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
