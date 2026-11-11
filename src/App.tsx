import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Wallet,
  Package,
  Search,
  Users,
  Settings,
  Menu,
  X,
  Receipt,
  Building2,
  Bell,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  LogOut,
  User,
  Trash2,
  ShieldAlert,
  RotateCcw
} from 'lucide-react';
import { ERPProvider, useERP } from './context/ERPContext';
import { DashboardModule } from './components/dashboard/DashboardModule';
import { POSModule } from './components/pos/POSModule';
import { CobranzasModule } from './components/cobranzas/CobranzasModule';
import { InventarioModule } from './components/inventario/InventarioModule';
import { ConsultasVentasModule } from './components/consultas/ConsultasVentasModule';
import { ClientesModule } from './components/clientes/ClientesModule';
import { UsuariosModule } from './components/usuarios/UsuariosModule';
import { ConfiguracionModule } from './components/configuracion/ConfiguracionModule';
import { LoginScreen } from './components/auth/LoginScreen';
import { ReceiptModal } from './components/ReceiptModal';

type ActiveTab = 'dashboard' | 'pos' | 'cobranzas' | 'inventario' | 'consultas' | 'clientes' | 'usuarios' | 'configuracion';

const tabTitles: Record<ActiveTab, { title: string; subtitle: string }> = {
  dashboard: { title: 'Panel General', subtitle: 'Resumen ejecutivo de operaciones ERP' },
  pos: { title: 'Punto de Venta (POS)', subtitle: 'Emisión rápida de tickets y ventas a crédito' },
  cobranzas: { title: 'Gestor de Cobranzas', subtitle: 'Control de cuentas por cobrar y recibos de abono' },
  inventario: { title: 'Control de Inventario', subtitle: 'Catálogo de artículos, existencias y kardex' },
  consultas: { title: 'Consultas de Ventas', subtitle: 'Auditoría, filtros avanzados y comprobantes' },
  clientes: { title: 'Directorio de Clientes', subtitle: 'Límites de crédito y estados de cuenta' },
  usuarios: { title: 'Panel de Usuarios & Permisos', subtitle: 'Control de accesos por roles y módulos' },
  configuracion: { title: 'Configuración ERP', subtitle: 'Datos de empresa, monedas y puesta a 0' }
};

const ERPAppContent: React.FC = () => {
  const { debts, products, settings, currentUser, logout, hasPermission, clearDatabaseToZero } = useERP();

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showGlobalResetModal, setShowGlobalResetModal] = useState(false);
  const [securityWord, setSecurityWord] = useState('');

  // Badges for navigation
  const pendingDebtsCount = debts.filter(d => d.balanceDue > 0).length;
  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;

  const allNavItems = [
    { id: 'dashboard' as ActiveTab, label: 'Panel General', icon: LayoutDashboard },
    { id: 'pos' as ActiveTab, label: 'Punto de Venta (POS)', icon: ShoppingCart },
    {
      id: 'cobranzas' as ActiveTab,
      label: 'Gestor de Cobranzas',
      icon: Wallet,
      badge: pendingDebtsCount > 0 ? pendingDebtsCount : undefined,
      badgeColor: 'bg-indigo-600'
    },
    {
      id: 'inventario' as ActiveTab,
      label: 'Control de Inventario',
      icon: Package,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      badgeColor: 'bg-amber-600'
    },
    { id: 'consultas' as ActiveTab, label: 'Consultas de Ventas', icon: Search },
    { id: 'clientes' as ActiveTab, label: 'Clientes y Créditos', icon: Users },
    { id: 'usuarios' as ActiveTab, label: 'Usuarios & Permisos', icon: ShieldCheck },
    { id: 'configuracion' as ActiveTab, label: 'Configuración', icon: Settings }
  ];

  // Filter items by active user permissions
  const navItems = allNavItems.filter(item => hasPermission(item.id));

  // If user loses permission to active tab, redirect to first permitted tab
  useEffect(() => {
    if (navItems.length > 0 && !hasPermission(activeTab)) {
      setActiveTab(navItems[0].id);
    }
  }, [currentUser, activeTab, navItems]);

  // If no user is logged in, show enterprise Login Screen
  if (!currentUser) {
    return <LoginScreen />;
  }

  const isAdmin = currentUser.role === 'admin' || currentUser.username.toUpperCase() === 'ADMIN';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-800">
      {/* SIDEBAR NAVIGATION (Desktop: fixed width, Mobile: collapsible drawer) */}
      <aside
        className={`no-print fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col justify-between transition-transform duration-200 md:static md:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-base shadow-sm">
                A
              </div>
              <div>
                <h1 className="font-bold text-sm text-white tracking-tight leading-none">
                  AuraCore ERP
                </h1>
                <span className="text-[10px] text-indigo-400 font-mono">Cobranzas, POS & Stock</span>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Active User Chip */}
          <div className="p-3 mx-3 mt-3 bg-slate-800/80 rounded-xl border border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-indigo-500 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                {currentUser.username.substring(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <span className="font-bold text-xs text-white block truncate">{currentUser.name}</span>
                <span className="text-[10px] text-indigo-300 font-mono uppercase block">
                  {isAdmin ? 'ADMIN (Acceso Total)' : currentUser.role}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700 rounded-lg transition-colors"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Nav List */}
          <nav className="p-3 space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold text-white ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info in sidebar */}
        <div className="p-4 border-t border-slate-800 text-xs space-y-2">
          {/* Quick Zero-Out Button for Admin */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => {
                setSecurityWord('');
                setShowGlobalResetModal(true);
              }}
              className="w-full py-1.5 px-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Poner a 0 el Sistema</span>
            </button>
          )}

          <div className="pt-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[11px] text-slate-400 font-medium">Terminal Conectada</span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono truncate">{settings.companyName}</p>
          </div>
        </div>
      </aside>

      {/* MOBILE OVERLAY */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-30 bg-slate-900/60 md:hidden backdrop-blur-2xs"
        />
      )}

      {/* MAIN CONTENT VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP BAR CONTRACT */}
        <header className="no-print h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Zone */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-slate-900 hidden sm:inline">
                {settings.tradeName}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
              <span className="font-bold text-slate-900">
                {tabTitles[activeTab]?.title || 'Módulo'}
              </span>
              <span className="text-slate-400 hidden lg:inline">
                · {tabTitles[activeTab]?.subtitle}
              </span>
            </div>
          </div>

          {/* Primary Action Zone */}
          <div className="flex items-center gap-2.5">
            {/* Quick POS Trigger if user has POS permission */}
            {activeTab !== 'pos' && hasPermission('pos') && (
              <button
                type="button"
                onClick={() => setActiveTab('pos')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Cobro POS</span>
              </button>
            )}

            {/* Admin Poner a 0 Quick Action */}
            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  setSecurityWord('');
                  setShowGlobalResetModal(true);
                }}
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                title="Comando para poner a 0 la base de datos"
              >
                <Trash2 className="w-3 h-3 text-rose-600" />
                <span>Poner a 0</span>
              </button>
            )}

            {/* Active User Indicator & Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <span className="font-bold text-xs text-slate-900 block leading-tight">
                  {currentUser.username}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {isAdmin ? 'Acceso Total' : currentUser.role}
                </span>
              </div>

              <button
                type="button"
                onClick={logout}
                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                title="Cerrar Sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* WORKSPACE BODY */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && hasPermission('dashboard') && <DashboardModule onNavigate={setActiveTab} />}
          {activeTab === 'pos' && hasPermission('pos') && <POSModule />}
          {activeTab === 'cobranzas' && hasPermission('cobranzas') && <CobranzasModule />}
          {activeTab === 'inventario' && hasPermission('inventario') && <InventarioModule />}
          {activeTab === 'consultas' && hasPermission('consultas') && <ConsultasVentasModule />}
          {activeTab === 'clientes' && hasPermission('clientes') && <ClientesModule />}
          {activeTab === 'usuarios' && hasPermission('usuarios') && <UsuariosModule />}
          {activeTab === 'configuracion' && hasPermission('configuracion') && <ConfiguracionModule />}

          {/* Fallback if user somehow visits a restricted tab */}
          {!hasPermission(activeTab) && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-lg mx-auto my-12">
              <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto mb-3" />
              <h3 className="font-bold text-base text-slate-900">Acceso Restringido</h3>
              <p className="text-xs text-slate-500 mt-1">
                Tu usuario actual ({currentUser.username}) no cuenta con permisos asignados para acceder al módulo de{' '}
                <strong>{tabTitles[activeTab]?.title}</strong>.
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Contacta al usuario <strong>ADMIN</strong> para habilitar este permiso en el Panel de Usuarios.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* GLOBAL RECEIPT MODAL */}
      <ReceiptModal />

      {/* GLOBAL ZERO-OUT DATABASE MODAL */}
      {showGlobalResetModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden text-xs">
            <div className="p-4 bg-rose-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-white" />
                <h3 className="font-bold text-sm">Comando: Poner a 0 todo el ERP</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGlobalResetModal(false)}
                className="text-rose-100 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-rose-50 border border-rose-200 text-rose-900 p-3.5 rounded-xl space-y-1.5">
                <p className="font-bold text-xs">
                  ¿Deseas inicializar completamente la base de datos a 0?
                </p>
                <p className="text-[11px] text-rose-700 leading-relaxed">
                  Este comando borrará <strong>todos los productos del inventario, clientes, ventas registradas, cuentas por cobrar e historial de kardex</strong>. El sistema quedará en blanco con 0 registros listo para tu negocio. El usuario <strong>ADMIN (clave: 1234)</strong> se conservará para tu acceso.
                </p>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Para ejecutar el reseteo a 0, escribe <strong className="text-rose-600 font-mono">RESETEAR</strong>:
                </label>
                <input
                  type="text"
                  value={securityWord}
                  onChange={e => setSecurityWord(e.target.value)}
                  placeholder="RESETEAR"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono text-center text-sm font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowGlobalResetModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={securityWord.trim().toUpperCase() !== 'RESETEAR'}
                  onClick={() => {
                    clearDatabaseToZero('all');
                    setShowGlobalResetModal(false);
                    alert('✅ Sistema puesto a 0 completamente. Catálogo, ventas y cobranzas ahora están en 0.');
                  }}
                  className={`px-4 py-2 rounded-lg font-bold text-white transition-colors ${
                    securityWord.trim().toUpperCase() === 'RESETEAR'
                      ? 'bg-rose-600 hover:bg-rose-700 cursor-pointer shadow-sm'
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Ejecutar Reseteo a 0
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <ERPProvider>
      <ERPAppContent />
    </ERPProvider>
  );
}
