import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Edit2,
  Trash2,
  Receipt,
  Eye,
  Send,
  Building2
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { Customer } from '../../types/erp';

export const ClientesModule: React.FC = () => {
  const { customers, sales, debts, addCustomer, updateCustomer, deleteCustomer, formatMoney, openReceiptModal, settings } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterDebt, setFilterDebt] = useState<'todos' | 'con_deuda' | 'solventes'>('todos');

  // Modal create/edit customer
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [docType, setDocType] = useState<Customer['docType']>('RIF');
  const [docNumber, setDocNumber] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [creditLimit, setCreditLimit] = useState<number>(2000);
  const [notes, setNotes] = useState('');

  // Selected customer for account statement view
  const [selectedStatementCustomer, setSelectedStatementCustomer] = useState<Customer | null>(null);

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.docNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDebt =
        filterDebt === 'todos' ||
        (filterDebt === 'con_deuda' && c.currentDebt > 0) ||
        (filterDebt === 'solventes' && c.currentDebt === 0);

      return matchesSearch && matchesDebt;
    });
  }, [customers, searchQuery, filterDebt]);

  const handleOpenNew = () => {
    setEditingCustomer(null);
    setDocType('RIF');
    setDocNumber('');
    setName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setCreditLimit(1500);
    setNotes('');
    setShowModal(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setEditingCustomer(c);
    setDocType(c.docType);
    setDocNumber(c.docNumber);
    setName(c.name);
    setEmail(c.email);
    setPhone(c.phone);
    setAddress(c.address);
    setCreditLimit(c.creditLimit);
    setNotes(c.notes || '');
    setShowModal(true);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !docNumber.trim()) return;

    if (editingCustomer) {
      updateCustomer({
        ...editingCustomer,
        docType,
        docNumber: docNumber.trim(),
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        creditLimit: Number(creditLimit) || 0,
        notes: notes.trim()
      });
    } else {
      addCustomer({
        docType,
        docNumber: docNumber.trim(),
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        creditLimit: Number(creditLimit) || 0,
        notes: notes.trim()
      });
    }

    setShowModal(false);
  };

  const handleSendStatementWA = (c: Customer) => {
    const message = encodeURIComponent(
      `Hola *${c.name}*,\n\nLe enviamos su estado de cuenta desde *${settings.tradeName}*:\n• Límite de Crédito: ${formatMoney(c.creditLimit)}\n• *Saldo Deudor Actual: ${formatMoney(c.currentDebt)}*\n\nSi requiere el detalle de sus comprobantes o recibos de abono, con gusto le atenderemos.\n\nAtentamente,\n${settings.companyName}`
    );
    const cleanPhone = c.phone.replace(/[^0-9]/g, '');
    const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${message}` : `https://wa.me/?text=${message}`;
    window.open(waUrl, '_blank');
  };

  // Debts and sales for selected customer
  const customerDebts = useMemo(() => {
    if (!selectedStatementCustomer) return [];
    return debts.filter(d => d.customerId === selectedStatementCustomer.id);
  }, [debts, selectedStatementCustomer]);

  const customerSales = useMemo(() => {
    if (!selectedStatementCustomer) return [];
    return sales.filter(s => s.customerId === selectedStatementCustomer.id);
  }, [sales, selectedStatementCustomer]);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            <span>Directorio de Clientes & Límites de Crédito</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Administración de clientes, solvencia, cartera deudora individual y estados de cuenta.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenNew}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Nuevo Cliente</span>
        </button>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar por cliente, RIF/NIT, teléfono o correo..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg w-full sm:w-auto">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'con_deuda', label: 'Con Saldo Deudor' },
            { id: 'solventes', label: 'Solventes' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterDebt(tab.id as any)}
              className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                filterDebt === tab.id
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* CUSTOMERS TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Cliente / Razón Social</th>
                <th className="py-3 px-4">Documento Fiscal</th>
                <th className="py-3 px-4">Contacto</th>
                <th className="py-3 px-4 text-right">Límite Crédito</th>
                <th className="py-3 px-4 text-right">Deuda Actual</th>
                <th className="py-3 px-4 text-center">Solvencia</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map(c => {
                const hasDebt = c.currentDebt > 0;

                return (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 block">{c.name}</span>
                      <span className="text-[11px] text-slate-500 truncate block max-w-xs">{c.address}</span>
                    </td>

                    <td className="py-3 px-4 font-mono font-medium text-slate-700">
                      {c.docType}: {c.docNumber}
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      <div>{c.phone || 'Sin teléfono'}</div>
                      <div className="text-[10px] text-slate-400">{c.email}</div>
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600">
                      {formatMoney(c.creditLimit)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-sm">
                      <span className={hasDebt ? 'text-rose-600' : 'text-emerald-600'}>
                        {formatMoney(c.currentDebt)}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      {hasDebt ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <AlertCircle className="w-3 h-3" />
                          <span>Pendiente</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Solvente</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* View statement button */}
                        <button
                          type="button"
                          onClick={() => setSelectedStatementCustomer(c)}
                          className="p-1.5 text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                          title="Ver estado de cuenta detallado"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* WhatsApp statement */}
                        <button
                          type="button"
                          onClick={() => handleSendStatementWA(c)}
                          className="p-1.5 text-emerald-600 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                          title="Enviar estado de cuenta por WhatsApp"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(c)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                          title="Editar cliente"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`¿Eliminar cliente "${c.name}"?`)) {
                              deleteCustomer(c.id);
                            }
                          }}
                          className="p-1.5 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                          title="Eliminar cliente"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-medium text-slate-700 text-sm">No se encontraron clientes registrados</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CUSTOMER DETAIL / STATEMENT MODAL */}
      {selectedStatementCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Estado de Cuenta del Cliente</h3>
                <p className="text-xs text-slate-400">
                  {selectedStatementCustomer.name} • {selectedStatementCustomer.docType}: {selectedStatementCustomer.docNumber}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStatementCustomer(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Financial Box */}
              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block mb-1">Límite Autorizado</span>
                  <span className="font-mono text-base font-bold text-slate-800 tabular-nums">
                    {formatMoney(selectedStatementCustomer.creditLimit)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block mb-1">Saldo Deudor Actual</span>
                  <span className="font-mono text-base font-bold text-rose-600 tabular-nums">
                    {formatMoney(selectedStatementCustomer.currentDebt)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block mb-1">Crédito Disponible</span>
                  <span className="font-mono text-base font-bold text-emerald-600 tabular-nums">
                    {formatMoney(Math.max(0, selectedStatementCustomer.creditLimit - selectedStatementCustomer.currentDebt))}
                  </span>
                </div>
              </div>

              {/* Active Debts Section */}
              <div>
                <h4 className="font-bold text-slate-900 mb-2">Cuentas por Cobrar Pendientes ({customerDebts.length})</h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-[10px] uppercase font-bold text-slate-600">
                      <tr>
                        <th className="py-2 px-3">Venta Ref.</th>
                        <th className="py-2 px-3">Vence</th>
                        <th className="py-2 px-3 text-right">Monto Original</th>
                        <th className="py-2 px-3 text-right">Saldo Pendiente</th>
                        <th className="py-2 px-3 text-center">Recibos</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {customerDebts.map(d => (
                        <tr key={d.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-semibold text-slate-800">{d.saleNumber}</td>
                          <td className="py-2 px-3 text-slate-600">{d.dueDate}</td>
                          <td className="py-2 px-3 text-right tabular-nums">{formatMoney(d.totalAmount)}</td>
                          <td className="py-2 px-3 text-right tabular-nums font-bold text-rose-600">
                            {formatMoney(d.balanceDue)}
                          </td>
                          <td className="py-2 px-3 text-center">
                            {d.payments.length > 0 ? (
                              <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] font-sans font-semibold">
                                {d.payments.length} abonos
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[10px] font-sans">Sin abonos</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {customerDebts.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-4 text-center text-slate-400 font-sans italic">
                            No tiene cuentas de crédito activas.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Purchase History */}
              <div>
                <h4 className="font-bold text-slate-900 mb-2">Historial de Compras ({customerSales.length})</h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-[10px] uppercase font-bold text-slate-600">
                      <tr>
                        <th className="py-2 px-3">N° Venta</th>
                        <th className="py-2 px-3">Fecha</th>
                        <th className="py-2 px-3">Modalidad</th>
                        <th className="py-2 px-3 text-right">Total</th>
                        <th className="py-2 px-3 text-center">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {customerSales.map(s => (
                        <tr key={s.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-semibold text-slate-800">{s.saleNumber}</td>
                          <td className="py-2 px-3 text-slate-600">{s.date}</td>
                          <td className="py-2 px-3 font-sans uppercase text-[10px]">{s.paymentType}</td>
                          <td className="py-2 px-3 text-right tabular-nums font-bold">{formatMoney(s.total)}</td>
                          <td className="py-2 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedStatementCustomer(null);
                                openReceiptModal({
                                  type: 'sale',
                                  sale: s
                                });
                              }}
                              className="px-2 py-1 bg-slate-100 hover:bg-indigo-50 text-indigo-600 rounded text-[10px] font-sans font-semibold inline-flex items-center gap-1"
                            >
                              <Receipt className="w-3 h-3" />
                              <span>Recibo</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedStatementCustomer(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 rounded-lg text-xs font-semibold text-slate-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT CUSTOMER MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingCustomer ? 'Editar Datos del Cliente' : 'Registrar Nuevo Cliente'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipo Doc.</label>
                  <select
                    value={docType}
                    onChange={e => setDocType(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-2 font-medium focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="RIF">RIF</option>
                    <option value="NIT">NIT</option>
                    <option value="DNI">DNI / Cédula</option>
                    <option value="RFC">RFC</option>
                    <option value="RUT">RUT</option>
                    <option value="Pasaporte">Pasaporte</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Número de Documento *</label>
                  <input
                    type="text"
                    required
                    value={docNumber}
                    onChange={e => setDocNumber(e.target.value)}
                    placeholder="Ej: J-31456789-2"
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-2 font-mono uppercase focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre o Razón Social *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ej: Inversiones Globales C.A."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 font-medium focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+58 414 1234567"
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-2 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="contacto@empresa.com"
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-2 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Dirección Fiscal / Despacho</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Av. Principal, Edificio Empresarial..."
                  className="w-full border border-slate-200 rounded-lg px-2.5 py-2 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Límite de Crédito ({settings.currencySymbol})</label>
                <input
                  type="number"
                  min="0"
                  value={creditLimit}
                  onChange={e => setCreditLimit(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-lg px-2.5 py-2 font-mono tabular-nums focus:ring-2 focus:ring-indigo-500"
                />
              </div>

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
                  Guardar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
