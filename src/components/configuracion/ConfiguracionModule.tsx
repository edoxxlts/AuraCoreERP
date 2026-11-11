import React, { useState } from 'react';
import {
  Settings,
  Building2,
  DollarSign,
  Receipt,
  Download,
  Upload,
  RotateCcw,
  CheckCircle,
  Save,
  AlertTriangle,
  Layers,
  Trash2,
  ShieldAlert
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { CompanySettings } from '../../types/erp';

export const ConfiguracionModule: React.FC = () => {
  const {
    settings,
    updateSettings,
    resetToDemoData,
    clearDatabaseToZero,
    exportBackup,
    exportDatabaseToJSON,
    importBackup,
    formatMoney,
    products,
    customers,
    sales,
    users
  } = useERP();

  const [form, setForm] = useState<CompanySettings>({ ...settings });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);
  const [confirmZeroModal, setConfirmZeroModal] = useState<'all' | 'transactions_only' | null>(null);
  const [securityInput, setSecurityInput] = useState('');

  const handleChange = (field: keyof CompanySettings, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleExportData = () => {
    try {
      const filename = exportDatabaseToJSON();
      setExportSuccessMessage(`Respaldo descargado con éxito: ${filename}`);
      setTimeout(() => setExportSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Error exportando base de datos:', err);
    }
  };


  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      const content = evt.target?.result as string;
      if (content) {
        const ok = importBackup(content);
        if (ok) {
          setImportStatus('Copia de seguridad restaurada con éxito.');
          setTimeout(() => setImportStatus(null), 3000);
        } else {
          setImportStatus('Error: El archivo no tiene un formato válido de respaldo ERP.');
          setTimeout(() => setImportStatus(null), 4000);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* HEADER */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-600" />
          <span>Configuración General del ERP</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Parámetros fiscales de la empresa, divisas y tasa de cambio, formato de recibos y respaldo de datos.
        </p>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl flex items-center gap-2 text-xs font-semibold">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>Configuración guardada exitosamente.</span>
        </div>
      )}

      {importStatus && (
        <div className="bg-indigo-50 border border-indigo-200 text-indigo-900 p-3 rounded-xl flex items-center gap-2 text-xs font-semibold">
          <CheckCircle className="w-4 h-4 text-indigo-600" />
          <span>{importStatus}</span>
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* COMPANY PROFILE */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-sm text-slate-900">Datos Fiscales de la Empresa</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Razón Social Legal *</label>
              <input
                type="text"
                required
                value={form.companyName}
                onChange={e => handleChange('companyName', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nombre Comercial / Marca *</label>
              <input
                type="text"
                required
                value={form.tradeName}
                onChange={e => handleChange('tradeName', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Identificación Fiscal (RIF / NIT / RFC) *</label>
              <input
                type="text"
                required
                value={form.taxId}
                onChange={e => handleChange('taxId', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono uppercase focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Teléfonos de Contacto</label>
              <input
                type="text"
                value={form.phone}
                onChange={e => handleChange('phone', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Dirección Fiscal y de Despacho</label>
              <input
                type="text"
                value={form.address}
                onChange={e => handleChange('address', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Correo Electrónico de Facturación</label>
              <input
                type="email"
                value={form.email}
                onChange={e => handleChange('email', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* CURRENCY & TAX */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">Moneda, Tasa de Cambio e Impuestos</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Símbolo Moneda Base *</label>
              <input
                type="text"
                required
                value={form.currencySymbol}
                onChange={e => handleChange('currencySymbol', e.target.value)}
                placeholder="$"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 font-mono font-bold focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Moneda Secundaria (ej. Bs. / COP)</label>
              <input
                type="text"
                value={form.secondaryCurrencySymbol}
                onChange={e => handleChange('secondaryCurrencySymbol', e.target.value)}
                placeholder="Bs."
                className="w-full border border-slate-200 rounded-lg px-3 py-2 font-mono font-bold focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tasa de Cambio Oficial</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.exchangeRate}
                onChange={e => handleChange('exchangeRate', Number(e.target.value))}
                placeholder="36.50"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 font-mono tabular-nums focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Porcentaje de IVA / Tax (%) *</label>
              <input
                type="number"
                min="0"
                max="100"
                required
                value={form.taxRatePercent}
                onChange={e => handleChange('taxRatePercent', Number(e.target.value))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 font-mono tabular-nums focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Nombre del Cajero / Operador Activo</label>
              <input
                type="text"
                value={form.cashierName}
                onChange={e => handleChange('cashierName', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* RECEIPT FOOTER */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Receipt className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-sm text-slate-900">Pie de Página del Recibo y Ticket</h3>
          </div>

          <div className="text-xs">
            <label className="block font-semibold text-slate-700 mb-1">Leyenda / Términos de Garantía</label>
            <textarea
              rows={2}
              value={form.receiptFooterNote}
              onChange={e => handleChange('receiptFooterNote', e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* SAVE BUTTON */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Parámetros ERP</span>
          </button>
        </div>
      </form>

      {/* DATA MANAGEMENT & BACKUPS */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-sm text-slate-900">Respaldo Local y Exportación de Base de Datos (JSON)</h3>
          </div>
          <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200 font-bold">
            Formato Estructurado .JSON
          </span>
        </div>

        <p className="text-xs text-slate-500">
          Genera y descarga un archivo JSON completo que respalda localmente el estado integral del sistema ERP: catálogo de inventario, directorio de clientes con créditos, historial de ventas y comprobantes, y cuentas de usuarios con sus perfiles de permisos.
        </p>

        {/* Real-time stats of included entities */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Productos</span>
            <span className="font-mono font-bold text-sm text-slate-900 tabular-nums">{products.length}</span>
            <span className="text-[9px] text-slate-400 block">en inventario</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Clientes</span>
            <span className="font-mono font-bold text-sm text-slate-900 tabular-nums">{customers.length}</span>
            <span className="text-[9px] text-slate-400 block">registrados</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Ventas</span>
            <span className="font-mono font-bold text-sm text-slate-900 tabular-nums">{sales.length}</span>
            <span className="text-[9px] text-slate-400 block">facturadas</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Usuarios</span>
            <span className="font-mono font-bold text-sm text-indigo-600 tabular-nums">{users.length}</span>
            <span className="text-[9px] text-slate-400 block">con permisos</span>
          </div>
        </div>

        {exportSuccessMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl flex items-center gap-2 text-xs font-semibold">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{exportSuccessMessage}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {/* Export JSON Button */}
          <button
            type="button"
            onClick={handleExportData}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Descargar archivo JSON con toda la base de datos (productos, clientes, ventas, usuarios)"
          >
            <Download className="w-4 h-4 text-white" />
            <span>Exportar Base de Datos Completa (JSON)</span>
          </button>

          {/* Import JSON */}
          <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold cursor-pointer transition-colors border border-slate-300">
            <Upload className="w-4 h-4 text-slate-600" />
            <span>Restaurar Base de Datos desde JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* DANGER ZONE / INITIALIZE DATABASE TO ZERO */}
      <div className="bg-white rounded-xl border border-rose-200 shadow-xs p-5 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-rose-100">
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          <h3 className="font-bold text-sm text-rose-900">Inicialización y Puesta a Cero de la Base de Datos</h3>
        </div>

        <p className="text-xs text-slate-600">
          Utiliza estas opciones para borrar los registros de prueba e inicializar tu sistema en limpio para empezar a trabajar con tus datos reales.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Card: Inicializar TODO a 0 */}
          <div className="border border-rose-200 bg-rose-50/50 rounded-xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-rose-800 font-bold text-xs mb-1">
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Inicializar TODO a Cero (Base de Datos Vacía)</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Elimina <strong>todos los productos, clientes, ventas, cuentas por cobrar e historial de kardex</strong>. Deja el sistema completamente en blanco para comenzar desde cero.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSecurityInput('');
                setConfirmZeroModal('all');
              }}
              className="w-full py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs text-center"
            >
              Borrar Todo e Inicializar a 0
            </button>
          </div>

          {/* Card: Poner a 0 solo Ventas y Cobranzas */}
          <div className="border border-amber-200 bg-amber-50/50 rounded-xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs mb-1">
                <RotateCcw className="w-4 h-4 text-amber-700" />
                <span>Poner a Cero solo Ventas y Cobranzas</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Elimina <strong>todas las ventas emitidas, abonos y deudas</strong> (resetea saldos de clientes a $0.00), pero <strong>conserva tus productos de inventario y clientes</strong>.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSecurityInput('');
                setConfirmZeroModal('transactions_only');
              }}
              className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs text-center"
            >
              Limpiar Ventas y Cobranzas
            </button>
          </div>
        </div>

        {/* Restore demo data option */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>¿Deseas volver a los datos de demostración iniciales con productos y ventas de ejemplo?</span>
          <button
            type="button"
            onClick={() => {
              if (
                confirm(
                  '¿Desea restaurar los datos de demostración originales? Esto reemplazará las ventas e inventario actuales por el catálogo de prueba.'
                )
              ) {
                resetToDemoData();
                setForm({ ...settings });
                alert('Datos de prueba demostrativos restaurados.');
              }
            }}
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 underline ml-2"
          >
            Restaurar Datos de Demostración
          </button>
        </div>
      </div>

      {/* CONFIRMATION SAFETY MODAL */}
      {confirmZeroModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden text-xs">
            <div className="p-4 bg-rose-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-white" />
                <h3 className="font-bold text-sm">Confirmación de Seguridad</h3>
              </div>
              <button
                type="button"
                onClick={() => setConfirmZeroModal(null)}
                className="text-rose-100 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-rose-50 border border-rose-200 text-rose-900 p-3 rounded-xl space-y-1">
                <p className="font-bold text-xs">
                  {confirmZeroModal === 'all'
                    ? '¿Estás completamente seguro de inicializar TODO a cero?'
                    : '¿Estás seguro de poner a cero todas las ventas y cobranzas?'}
                </p>
                <p className="text-[11px] text-rose-700">
                  {confirmZeroModal === 'all'
                    ? 'Esta acción eliminará todos los productos del inventario, clientes registrados, ventas, cuentas por cobrar y movimientos de kardex. Los contadores volverán a 0.'
                    : 'Esta acción borrará todas las ventas y recibos emitidos, y pondrá las deudas de los clientes en 0. Tus productos y clientes permanecerán intactos.'}
                </p>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Para confirmar, escribe la palabra <strong className="text-rose-600 font-mono">RESETEAR</strong> en el siguiente campo:
                </label>
                <input
                  type="text"
                  value={securityInput}
                  onChange={e => setSecurityInput(e.target.value)}
                  placeholder="RESETEAR"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono text-center text-sm font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setConfirmZeroModal(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={securityInput.trim().toUpperCase() !== 'RESETEAR'}
                  onClick={() => {
                    if (confirmZeroModal) {
                      clearDatabaseToZero(confirmZeroModal);
                      setConfirmZeroModal(null);
                      alert(
                        confirmZeroModal === 'all'
                          ? '✅ El sistema se ha inicializado a 0 completamente. La base de datos está limpia y vacía.'
                          : '✅ Las ventas y cuentas por cobrar han sido puestas a 0 exitosamente.'
                      );
                    }
                  }}
                  className={`px-4 py-2 rounded-lg font-bold text-white transition-colors ${
                    securityInput.trim().toUpperCase() === 'RESETEAR'
                      ? 'bg-rose-600 hover:bg-rose-700 cursor-pointer shadow-sm'
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Confirmar Inicialización a 0
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
