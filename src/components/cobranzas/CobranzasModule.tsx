import React, { useState, useMemo } from 'react';
import {
  Wallet,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  PlusCircle,
  FileText,
  MessageCircle,
  Receipt,
  User,
  ArrowUpRight,
  Filter,
  CreditCard,
  Building2,
  Send
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { DebtPayment, DebtRecord, PaymentMethod } from '../../types/erp';

export const CobranzasModule: React.FC = () => {
  const { debts, registerDebtPayment, openReceiptModal, formatMoney, settings } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'pendiente' | 'parcial' | 'vencido' | 'saldado'>('todos');
  
  // Payment modal state
  const [selectedDebtForPayment, setSelectedDebtForPayment] = useState<DebtRecord | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('transferencia');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [bank, setBank] = useState('Banco Mercantil');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Payment history drawer/modal state
  const [viewHistoryDebt, setViewHistoryDebt] = useState<DebtRecord | null>(null);

  // Today for overdue calculations
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Compute status including 'vencido' if dueDate < today and balance > 0
  const processedDebts = useMemo(() => {
    return debts.map(d => {
      let currentStatus = d.status;
      if (d.balanceDue > 0 && d.dueDate < today) {
        currentStatus = 'vencido';
      }
      return {
        ...d,
        computedStatus: currentStatus
      };
    });
  }, [debts, today]);

  // Financial KPIs
  const kpis = useMemo(() => {
    let totalPorCobrar = 0;
    let totalVencido = 0;
    let totalCorriente = 0;
    let totalCobradoHistorial = 0;

    processedDebts.forEach(d => {
      totalPorCobrar += d.balanceDue;
      if (d.computedStatus === 'vencido') {
        totalVencido += d.balanceDue;
      } else if (d.balanceDue > 0) {
        totalCorriente += d.balanceDue;
      }
      totalCobradoHistorial += d.paidAmount;
    });

    return {
      totalPorCobrar,
      totalVencido,
      totalCorriente,
      totalCobradoHistorial
    };
  }, [processedDebts]);

  // Filtered debts list
  const filteredDebts = useMemo(() => {
    return processedDebts.filter(d => {
      const matchesSearch =
        d.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.customerDoc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.saleNumber.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'todos' || d.computedStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [processedDebts, searchQuery, statusFilter]);

  // Open payment dialog
  const handleOpenPayment = (debt: DebtRecord) => {
    setSelectedDebtForPayment(debt);
    setPaymentAmount(debt.balanceDue);
    setReferenceNumber('');
    setPaymentNotes(`Abono a factura ${debt.saleNumber}`);
  };

  // Submit payment and emit receipt
  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDebtForPayment || paymentAmount <= 0) return;

    const result = registerDebtPayment({
      debtId: selectedDebtForPayment.id,
      amount: Number(paymentAmount),
      paymentMethod,
      referenceNumber: referenceNumber.trim() || 'TRF-S/N',
      bank,
      notes: paymentNotes
    });

    if (result) {
      setSelectedDebtForPayment(null);
      // Automatically open the official payment receipt for printing/saving!
      openReceiptModal({
        type: 'payment',
        debt: result.debt,
        payment: result.payment
      });
    }
  };

  // WhatsApp Reminder Generator
  const handleSendReminder = (debt: DebtRecord) => {
    const message = encodeURIComponent(
      `Estimado(a) *${debt.customerName}*,\n\nLe saludamos de parte de *${settings.tradeName}* para recordarle que su cuenta correspondiente a la venta *${debt.saleNumber}* presenta un saldo pendiente de *${formatMoney(debt.balanceDue)}* con fecha de vencimiento *${debt.dueDate}*.\n\nPuede realizar su transferencia a los siguientes datos:\n• Banco: Banesco / Mercantil\n• Titular: ${settings.companyName}\n• RIF: ${settings.taxId}\n• Teléfono: ${settings.phone}\n\nFavor enviar comprobante para emitir su Recibo de Pago Oficial. ¡Muchas gracias!`
    );

    const cleanPhone = debt.customerPhone.replace(/[^0-9]/g, '');
    const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${message}` : `https://wa.me/?text=${message}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* MODULE HEADER & SUMMARY KPIS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Wallet className="w-6 h-6 text-indigo-600" />
            <span>Gestor de Cobranzas y Cuentas por Cobrar</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Seguimiento de saldos pendientes, amortización de créditos y emisión de recibos de pago oficiales.
          </p>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Total por Cobrar</span>
            <Wallet className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="font-mono text-xl font-bold text-slate-900 tabular-nums">
            {formatMoney(kpis.totalPorCobrar)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Saldo total en cartera activa</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Cartera Vencida</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="font-mono text-xl font-bold text-rose-600 tabular-nums">
            {formatMoney(kpis.totalVencido)}
          </div>
          <span className="text-[11px] text-rose-500 mt-1 block">Plazo límite de pago superado</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Cartera Corriente</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-mono text-xl font-bold text-slate-800 tabular-nums">
            {formatMoney(kpis.totalCorriente)}
          </div>
          <span className="text-[11px] text-emerald-600 mt-1 block">Dentro de la fecha convenida</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Cobrado / Recuperado</span>
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="font-mono text-xl font-bold text-indigo-700 tabular-nums">
            {formatMoney(kpis.totalCobradoHistorial)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Abonos percibidos y liquidados</span>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar por cliente, documento o N° de venta..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
        </div>

        {/* Status segmented controls */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'pendiente', label: 'Pendientes' },
            { id: 'vencido', label: 'Vencidos' },
            { id: 'parcial', label: 'Parciales' },
            { id: 'saldado', label: 'Saldados' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                statusFilter === tab.id
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* DEBTORS / RECEIVABLES TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4">Venta Ref.</th>
                <th className="py-3 px-4">Cliente / Razón Social</th>
                <th className="py-3 px-4">Vencimiento</th>
                <th className="py-3 px-4 text-right">Total Venta</th>
                <th className="py-3 px-4 text-right">Abonado</th>
                <th className="py-3 px-4 text-right">Saldo Deudor</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDebts.map(debt => {
                const isOverdue = debt.computedStatus === 'vencido';
                const isPaid = debt.computedStatus === 'saldado';

                return (
                  <tr key={debt.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Status Badge */}
                    <td className="py-3 px-4">
                      {isPaid ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Saldado</span>
                        </span>
                      ) : isOverdue ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Vencido</span>
                        </span>
                      ) : debt.computedStatus === 'parcial' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <Clock className="w-3 h-3" />
                          <span>Parcial</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                          <span>Pendiente</span>
                        </span>
                      )}
                    </td>

                    {/* Sale ref */}
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                      {debt.saleNumber}
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{debt.customerName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {debt.customerDoc} {debt.customerPhone ? `• ${debt.customerPhone}` : ''}
                      </div>
                    </td>

                    {/* Due Date */}
                    <td className="py-3 px-4">
                      <div className={`font-mono text-xs ${isOverdue ? 'font-bold text-rose-600' : 'text-slate-700'}`}>
                        {debt.dueDate}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        Emitido: {debt.issueDate}
                      </span>
                    </td>

                    {/* Financial amounts */}
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600">
                      {formatMoney(debt.totalAmount)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums font-medium text-emerald-600">
                      {formatMoney(debt.paidAmount)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-sm">
                      <span className={debt.balanceDue > 0 ? (isOverdue ? 'text-rose-600' : 'text-indigo-700') : 'text-slate-400'}>
                        {formatMoney(debt.balanceDue)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Register Payment Button */}
                        {debt.balanceDue > 0 ? (
                          <button
                            type="button"
                            onClick={() => handleOpenPayment(debt)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs transition-colors shadow-2xs"
                            title="Registrar abono de dinero"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>Abonar</span>
                          </button>
                        ) : (
                          <span className="text-[11px] font-medium text-slate-400 italic">Solvente</span>
                        )}

                        {/* View payments history / receipts */}
                        {debt.payments.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setViewHistoryDebt(debt)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                            title="Ver recibos y abonos realizados"
                          >
                            <Receipt className="w-4 h-4" />
                          </button>
                        )}

                        {/* Send reminder */}
                        {debt.balanceDue > 0 && (
                          <button
                            type="button"
                            onClick={() => handleSendReminder(debt)}
                            className="p-1.5 text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                            title="Enviar recordatorio formal por WhatsApp"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredDebts.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-medium text-slate-700 text-sm">No hay registros de cobranza en este criterio</p>
                    <p className="text-xs text-slate-400 mt-1">Todas las cuentas están al día o no coinciden con la búsqueda.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REGISTER PAYMENT MODAL (ABONO Y EMISIÓN DE RECIBO) */}
      {selectedDebtForPayment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="font-bold text-sm">Registrar Pago / Abono & Emitir Recibo</h3>
                  <p className="text-xs text-slate-400">Ref: {selectedDebtForPayment.saleNumber}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDebtForPayment(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitPayment} className="p-5 space-y-4 text-xs">
              {/* Account summary banner */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Cliente:</span>
                  <span className="font-semibold text-slate-900">{selectedDebtForPayment.customerName}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Documento / RIF:</span>
                  <span className="font-mono">{selectedDebtForPayment.customerDoc}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Fecha Vencimiento:</span>
                  <span className="font-mono text-slate-800">{selectedDebtForPayment.dueDate}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold pt-1 border-t border-slate-200">
                  <span>Saldo Deudor Actual:</span>
                  <span className="font-mono tabular-nums text-rose-600 text-sm">
                    {formatMoney(selectedDebtForPayment.balanceDue)}
                  </span>
                </div>
              </div>

              {/* Amount input */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Monto a Abonar ({settings.currencySymbol}) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={selectedDebtForPayment.balanceDue}
                    required
                    value={paymentAmount || ''}
                    onChange={e => setPaymentAmount(Number(e.target.value))}
                    className="w-full pl-3 pr-20 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setPaymentAmount(selectedDebtForPayment.balanceDue)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-semibold"
                  >
                    Total
                  </button>
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Nuevo saldo tras este abono:{' '}
                  <span className="font-mono font-bold text-slate-800">
                    {formatMoney(Math.max(0, selectedDebtForPayment.balanceDue - (paymentAmount || 0)))}
                  </span>
                </span>
              </div>

              {/* Payment Method */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Método de Pago *</label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="transferencia">Transferencia Bancaria</option>
                    <option value="zelle_pagomovil">Pago Móvil / Zelle</option>
                    <option value="efectivo">Efectivo en Caja</option>
                    <option value="tarjeta">Punto de Venta / Tarjeta</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Banco Destino / Caja</label>
                  <input
                    type="text"
                    value={bank}
                    onChange={e => setBank(e.target.value)}
                    placeholder="Ej: Banesco, Mercantil..."
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Reference */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  N° de Referencia / Comprobante Bancario *
                </label>
                <input
                  type="text"
                  required
                  value={referenceNumber}
                  onChange={e => setReferenceNumber(e.target.value)}
                  placeholder="Ej: 009823412"
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">Observaciones / Concepto</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={e => setPaymentNotes(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Form buttons */}
              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedDebtForPayment(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Receipt className="w-4 h-4" />
                  <span>Registrar Pago & Emitir Recibo</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW PAYMENTS HISTORY DRAWER / MODAL */}
      {viewHistoryDebt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Historial de Recibos de Pago Emitidos</h3>
                <p className="text-xs text-slate-400">
                  {viewHistoryDebt.customerName} • {viewHistoryDebt.saleNumber}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewHistoryDebt(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-5 max-h-[400px] overflow-y-auto divide-y divide-slate-100 text-xs">
              {viewHistoryDebt.payments.map((p, idx) => (
                <div key={p.id || idx} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{p.receiptNumber}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{p.date}</span>
                    </div>
                    <p className="text-slate-600 mt-0.5">
                      Método: <span className="uppercase font-medium">{p.paymentMethod}</span> | Ref: {p.referenceNumber}
                      {p.bank ? ` (${p.bank})` : ''}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Saldo restante registrado: {formatMoney(p.remainingBalance)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-sm text-emerald-600 tabular-nums">
                      {formatMoney(p.amount)}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setViewHistoryDebt(null);
                        openReceiptModal({
                          type: 'payment',
                          debt: viewHistoryDebt,
                          payment: p
                        });
                      }}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Ver Recibo</span>
                    </button>
                  </div>
                </div>
              ))}

              {viewHistoryDebt.payments.length === 0 && (
                <p className="py-6 text-center text-slate-400 italic">No existen abonos registrados aún.</p>
              )}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setViewHistoryDebt(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 rounded-lg text-xs font-medium text-slate-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
