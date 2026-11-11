import React, { useState } from 'react';
import {
  Shield,
  UserPlus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Key,
  Lock,
  UserCheck,
  Eye,
  EyeOff,
  ShieldCheck,
  ShieldAlert,
  Download
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { ERPUser, UserPermissions } from '../../types/erp';

export const UsuariosModule: React.FC = () => {
  const { users, currentUser, addUser, updateUser, deleteUser, exportDatabaseToJSON } = useERP();


  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<ERPUser | null>(null);

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState<ERPUser['role']>('personalizado');
  const [isActive, setIsActive] = useState(true);

  // Granular Permissions
  const [permissions, setPermissions] = useState<UserPermissions>({
    dashboard: true,
    pos: true,
    cobranzas: false,
    inventario: false,
    consultas: true,
    clientes: false,
    usuarios: false,
    configuracion: false
  });

  const moduleDefinitions: Array<{ key: keyof UserPermissions; label: string; desc: string }> = [
    { key: 'dashboard', label: 'Panel General / Dashboard', desc: 'Métricas financieras, KPIs globales y actividad' },
    { key: 'pos', label: 'Punto de Venta (POS)', desc: 'Facturación rápida, cobro y emisión de recibos' },
    { key: 'cobranzas', label: 'Gestor de Cobranzas', desc: 'Cartera deudora, registro de abonos y recibos oficiales' },
    { key: 'inventario', label: 'Control de Inventario', desc: 'Catálogo de existencias, ajustes de almacén y kardex' },
    { key: 'consultas', label: 'Consultas de Ventas', desc: 'Historial de facturas, auditoría y reimpresiones' },
    { key: 'clientes', label: 'Clientes y Créditos', desc: 'Directorio, límites crediticios y estados de cuenta' },
    { key: 'usuarios', label: 'Panel de Usuarios & Permisos', desc: 'Creación de usuarios y asignación de roles' },
    { key: 'configuracion', label: 'Configuración ERP', desc: 'Datos fiscales, tasas de cambio y reseteo de BD' }
  ];

  // Preset role applier
  const applyRolePreset = (selectedRole: ERPUser['role']) => {
    setRole(selectedRole);
    if (selectedRole === 'admin') {
      setPermissions({
        dashboard: true,
        pos: true,
        cobranzas: true,
        inventario: true,
        consultas: true,
        clientes: true,
        usuarios: true,
        configuracion: true
      });
    } else if (selectedRole === 'cajero') {
      setPermissions({
        dashboard: false,
        pos: true,
        cobranzas: false,
        inventario: false,
        consultas: true,
        clientes: true,
        usuarios: false,
        configuracion: false
      });
    } else if (selectedRole === 'cobrador') {
      setPermissions({
        dashboard: true,
        pos: false,
        cobranzas: true,
        inventario: false,
        consultas: true,
        clientes: true,
        usuarios: false,
        configuracion: false
      });
    } else if (selectedRole === 'almacen') {
      setPermissions({
        dashboard: false,
        pos: false,
        cobranzas: false,
        inventario: true,
        consultas: true,
        clientes: false,
        usuarios: false,
        configuracion: false
      });
    }
  };

  const handleOpenNew = () => {
    setEditingUser(null);
    setUsername('');
    setPassword('');
    setName('');
    setRole('cajero');
    setIsActive(true);
    applyRolePreset('cajero');
    setShowModal(true);
  };

  const handleOpenEdit = (user: ERPUser) => {
    setEditingUser(user);
    setUsername(user.username);
    setPassword(user.password);
    setName(user.name);
    setRole(user.role);
    setIsActive(user.isActive);
    setPermissions({ ...user.permissions });
    setShowModal(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim() || !name.trim()) return;

    const isAdminUser = (editingUser && editingUser.username.toUpperCase() === 'ADMIN') || username.trim().toUpperCase() === 'ADMIN';

    // If it's ADMIN, ensure absolute permissions
    const finalPermissions: UserPermissions = isAdminUser
      ? {
          dashboard: true,
          pos: true,
          cobranzas: true,
          inventario: true,
          consultas: true,
          clientes: true,
          usuarios: true,
          configuracion: true
        }
      : permissions;

    if (editingUser) {
      updateUser({
        ...editingUser,
        username: editingUser.username.toUpperCase() === 'ADMIN' ? 'ADMIN' : username.trim().toUpperCase(),
        password: password.trim(),
        name: name.trim(),
        role: isAdminUser ? 'admin' : role,
        isActive: isAdminUser ? true : isActive, // Cannot deactivate ADMIN
        permissions: finalPermissions
      });
    } else {
      addUser({
        username: username.trim().toUpperCase(),
        password: password.trim(),
        name: name.trim(),
        role,
        isActive: true,
        permissions: finalPermissions
      });
    }

    setShowModal(false);
  };

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
            <span>Panel de Usuarios & Control de Accesos (RBAC)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestión de credenciales, roles y permisos granulares por cada módulo del sistema ERP.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => exportDatabaseToJSON()}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors cursor-pointer"
            title="Descargar respaldo completo del ERP con usuarios y permisos en JSON"
          >
            <Download className="w-4 h-4 text-indigo-600" />
            <span>Exportar Respaldo JSON</span>
          </button>

          <button
            type="button"
            onClick={handleOpenNew}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Crear Nuevo Usuario</span>
          </button>
        </div>
      </div>

      {/* USERS LIST TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Usuario</th>
                <th className="py-3 px-4">Nombre Completo</th>
                <th className="py-3 px-4">Rol Asignado</th>
                <th className="py-3 px-4">Módulos Habilitados</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map(user => {
                const isAdmin = user.username.toUpperCase() === 'ADMIN';

                // Count active modules
                const activePermsCount = Object.values(user.permissions).filter(Boolean).length;

                return (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                            isAdmin ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {user.username.substring(0, 2)}
                        </div>
                        <div>
                          <span className="font-mono font-bold text-slate-900 block">{user.username}</span>
                          <span className="text-[10px] text-slate-400 font-mono">ID: {user.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-medium text-slate-900">
                      {user.name}
                      {isAdmin && (
                        <span className="ml-2 inline-flex items-center text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded">
                          Acceso Absoluto
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-xs uppercase font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {user.role}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {isAdmin ? (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            Todos los módulos habilitados (8/8)
                          </span>
                        ) : (
                          <>
                            {Object.entries(user.permissions)
                              .filter(([_, active]) => active)
                              .map(([mod]) => (
                                <span
                                  key={mod}
                                  className="text-[10px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded uppercase"
                                >
                                  {mod}
                                </span>
                              ))}
                            {activePermsCount === 0 && (
                              <span className="text-[10px] text-slate-400 italic">Sin permisos activos</span>
                            )}
                          </>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      {user.isActive ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Activo</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          <XCircle className="w-3 h-3" />
                          <span>Inactivo</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(user)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                          title="Editar usuario y permisos"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {!isAdmin && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`¿Eliminar usuario "${user.username}"?`)) {
                                deleteUser(user.id);
                              }
                            }}
                            className="p-1.5 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                            title="Eliminar usuario"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT USER MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden text-xs max-h-[92vh] flex flex-col">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-sm">
                  {editingUser ? `Editar Usuario: ${editingUser.username}` : 'Registrar Nuevo Usuario'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-5 overflow-y-auto space-y-4 flex-1">
              {/* Basic credentials */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nombre de Usuario (Login) *</label>
                  <input
                    type="text"
                    required
                    disabled={editingUser?.username.toUpperCase() === 'ADMIN'}
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Ej: CAJERO2, SUPERVISOR"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 font-mono uppercase focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contraseña de Acceso *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Clave"
                      className="w-full border border-slate-200 rounded-lg pl-3 pr-8 py-2 font-mono focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre y Apellido de la Persona *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Role Presets */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rol / Perfil Preestablecido</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'admin', label: 'Admin (Total)' },
                    { id: 'cajero', label: 'Cajero POS' },
                    { id: 'cobrador', label: 'Cobranzas' },
                    { id: 'almacen', label: 'Almacén' }
                  ].map(r => (
                    <button
                      key={r.id}
                      type="button"
                      disabled={editingUser?.username.toUpperCase() === 'ADMIN' && r.id !== 'admin'}
                      onClick={() => applyRolePreset(r.id as any)}
                      className={`py-1.5 px-2 rounded-lg border text-[11px] font-semibold transition-all ${
                        role === r.id
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-2xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Granular module permissions check boxes */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Permisos de Acceso a Módulos:</span>
                  {editingUser?.username.toUpperCase() === 'ADMIN' && (
                    <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded">
                      ADMIN tiene acceso total obligatorio
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {moduleDefinitions.map(mod => {
                    const isChecked = editingUser?.username.toUpperCase() === 'ADMIN' ? true : permissions[mod.key];

                    return (
                      <label
                        key={mod.key}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                          isChecked
                            ? 'border-indigo-200 bg-indigo-50/40 text-slate-900'
                            : 'border-slate-200 text-slate-500 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          disabled={editingUser?.username.toUpperCase() === 'ADMIN'}
                          checked={isChecked}
                          onChange={e =>
                            setPermissions(prev => ({
                              ...prev,
                              [mod.key]: e.target.checked
                            }))
                          }
                          className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <div>
                          <span className="font-semibold block leading-tight">{mod.label}</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">{mod.desc}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Status active/inactive (except ADMIN) */}
              {editingUser?.username.toUpperCase() !== 'ADMIN' && (
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <input
                    type="checkbox"
                    id="isActiveToggle"
                    checked={isActive}
                    onChange={e => setIsActive(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="isActiveToggle" className="font-semibold text-slate-700">
                    Usuario Habilitado / Activo
                  </label>
                </div>
              )}

              {/* Action buttons */}
              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs"
                >
                  Guardar Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
