import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  FileSpreadsheet,
  FileText,
  Printer,
  Download,
  Receipt,
  Eye,
  RotateCcw,
  Calendar,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle2,
  XCircle,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  ArrowUpRight,
  Check,
  X
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { Sale } from '../../types/erp';
import { downloadSalesPdf } from '../../utils/salesPdfGenerator';


export const ConsultasVentasModule: React.FC = () => {
  const { sales, cancelSale, openReceiptModal, formatMoney, settings, currentUser } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'todos' | 'hoy' | 'semana' | 'mes'>('todos');
  const [paymentTypeFilter, setPaymentTypeFilter] = useState<'todos' | 'contado' | 'credito'>('todos');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('todos');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'completada' | 'anulada'>('todos');

  // Selected sale for detail modal
  const [selectedSaleDetail, setSelectedSaleDetail] = useState<Sale | null>(null);

  // Cancellation modal
  const [saleToCancel, setSaleToCancel] = useState<Sale | null>(null);
  const [cancelReason, setCancelReason] = useState('Devolución de cliente por garantía');

  // PDF Print & Export states
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);


  // Filtered sales
  const filteredSales = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const startOfWeek = new Date();
    startOfWeek.setDate(now.getDate() - 7);
    const startOfWeekStr = startOfWeek.toISOString().split('T')[0];

    const startOfMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

    return sales.filter(s => {
      // Date filter
      const saleDate = s.date.split(' ')[0];
      let matchesDate = true;
      if (dateFilter === 'hoy') matchesDate = saleDate === todayStr;
      else if (dateFilter === 'semana') matchesDate = saleDate >= startOfWeekStr;
      else if (dateFilter === 'mes') matchesDate = saleDate >= startOfMonthStr;

      // Payment type
      const matchesType = paymentTypeFilter === 'todos' || s.paymentType === paymentTypeFilter;

      // Payment method
      const matchesMethod = paymentMethodFilter === 'todos' || s.paymentMethod === paymentMethodFilter;

      // Status
      const matchesStatus = statusFilter === 'todos' || s.status === statusFilter;

      // Text search
      const matchesSearch =
        s.saleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.customerDoc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.items.some(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesDate && matchesType && matchesMethod && matchesStatus && matchesSearch;
    });
  }, [sales, dateFilter, paymentTypeFilter, paymentMethodFilter, statusFilter, searchQuery]);

  // Aggregate metrics for filtered sales
  const metrics = useMemo(() => {
    let totalFacturado = 0;
    let totalContado = 0;
    let totalCredito = 0;
    let validSalesCount = 0;

    filteredSales.forEach(s => {
      if (s.status === 'completada') {
        totalFacturado += s.total;
        if (s.paymentType === 'contado') totalContado += s.total;
        else totalCredito += s.total;
        validSalesCount++;
      }
    });

    const averageTicket = validSalesCount > 0 ? totalFacturado / validSalesCount : 0;

    return {
      totalFacturado,
      totalContado,
      totalCredito,
      averageTicket,
      validSalesCount,
      totalCount: filteredSales.length
    };
  }, [filteredSales]);

  const handleExportCSV = () => {
    const headers = 'Nro Venta,Nro Recibo,Fecha,Cliente,Documento,Tipo,Metodo,Subtotal,IVA,Total,Estado\n';
    const rows = filteredSales
      .map(
        s =>
          `"${s.saleNumber}","${s.receiptNumber}","${s.date}","${s.customerName.replace(/"/g, '""')}","${s.customerDoc}","${s.paymentType}","${s.paymentMethod}",${s.subtotal},${s.taxAmount},${s.total},"${s.status}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte_ventas_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    if (filteredSales.length === 0) return;
    try {
      setIsGeneratingPdf(true);
      downloadSalesPdf({
        sales: filteredSales,
        settings,
        filters: {
          searchQuery,
          dateFilter,
          paymentTypeFilter,
          statusFilter
        },
        metrics,
        userName: currentUser?.name || settings.cashierName
      });
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err) {
      console.error('Error generando reporte PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleConfirmCancel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saleToCancel) return;

    cancelSale(saleToCancel.id, cancelReason);
    setSaleToCancel(null);
  };

  return (
    <div className="space-y-6">
      {/* HEADER & ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            <span>Módulo de Consultas y Auditoría de Ventas</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Historial de facturación, comprobantes emitidos, auditoría de cajero, reporte impreso oficial y anulación con reversión de inventario.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Export PDF Button */}
          <button
            type="button"
            onClick={handleExportPDF}
            disabled={isGeneratingPdf || filteredSales.length === 0}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg shadow-2xs transition-all cursor-pointer ${
              exportSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title="Descargar archivo PDF estructurado con membrete, métricas y detalle de ventas"
          >
            {exportSuccess ? (
              <Check className="w-4 h-4" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            <span>
              {isGeneratingPdf
                ? 'Generando PDF...'
                : exportSuccess
                ? '¡Reporte PDF Descargado!'
                : 'Exportar Reporte PDF'}
            </span>
          </button>

          {/* Print / Preview Modal Button */}
          <button
            type="button"
            onClick={() => setShowPrintModal(true)}
            disabled={filteredSales.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 active:scale-95 rounded-lg shadow-2xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            title="Vista previa e impresión formal del reporte"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Vista Previa / Imprimir</span>
          </button>

          {/* Export CSV Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={filteredSales.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Exportar registros a hoja de cálculo CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>CSV</span>
          </button>
        </div>
      </div>


      {/* AGGREGATE SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Facturado</span>
            <DollarSign className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="font-mono text-xl font-bold text-slate-900 tabular-nums">
            {formatMoney(metrics.totalFacturado)}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">{metrics.validSalesCount} ventas completadas</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Ventas de Contado</span>
            <Banknote className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-mono text-xl font-bold text-emerald-700 tabular-nums">
            {formatMoney(metrics.totalContado)}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Ingreso inmediato a caja</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Ventas a Crédito</span>
            <CreditCard className="w-4 h-4 text-amber-600" />
          </div>
          <div className="font-mono text-xl font-bold text-amber-600 tabular-nums">
            {formatMoney(metrics.totalCredito)}
          </div>
          <span className="text-[11px] text-amber-600 mt-0.5 block">Pasadas a cobranza</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Ticket Promedio</span>
            <ShoppingBag className="w-4 h-4 text-slate-600" />
          </div>
          <div className="font-mono text-xl font-bold text-slate-800 tabular-nums">
            {formatMoney(metrics.averageTicket)}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Por transacción completada</span>
        </div>
      </div>

      {/* DEEP FILTERS BAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search box */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar por N° venta, recibo, cliente o producto..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          {/* Date range filter */}
          <div className="sm:col-span-3">
            <select
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500"
            >
              <option value="todos">Cualquier Fecha</option>
              <option value="hoy">Ventas de Hoy</option>
              <option value="semana">Últimos 7 días</option>
              <option value="mes">Ventas del Mes en Curso</option>
            </select>
          </div>

          {/* Payment Type */}
          <div className="sm:col-span-2">
            <select
              value={paymentTypeFilter}
              onChange={e => setPaymentTypeFilter(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500"
            >
              <option value="todos">Todos los Tipos</option>
              <option value="contado">Solo Contado</option>
              <option value="credito">Solo a Crédito</option>
            </select>
          </div>

          {/* Status */}
          <div className="sm:col-span-2">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500"
            >
              <option value="todos">Todos los Estados</option>
              <option value="completada">Completadas</option>
              <option value="anulada">Anuladas</option>
            </select>
          </div>
        </div>
      </div>

      {/* SALES AUDIT TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">N° Venta / Recibo</th>
                <th className="py-3 px-4">Fecha y Hora</th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Condición</th>
                <th className="py-3 px-4 text-center">Ítems</th>
                <th className="py-3 px-4 text-right">Subtotal</th>
                <th className="py-3 px-4 text-right">Total Cobrado</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.map(sale => {
                const isCancelled = sale.status === 'anulada';

                return (
                  <tr
                    key={sale.id}
                    className={`transition-colors ${
                      isCancelled ? 'bg-rose-50/30 text-slate-400' : 'hover:bg-slate-50/80 text-slate-800'
                    }`}
                  >
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-slate-900 block">{sale.saleNumber}</span>
                      <span className="font-mono text-[10px] text-slate-400">{sale.receiptNumber}</span>
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] tabular-nums text-slate-600">
                      {sale.date}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 block">{sale.customerName}</span>
                      <span className="font-mono text-[10px] text-slate-400">{sale.customerDoc}</span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            sale.paymentType === 'credito'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {sale.paymentType}
                        </span>
                        <span className="text-[10px] text-slate-500 uppercase">
                          {sale.paymentMethod}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center font-mono font-semibold tabular-nums">
                      {sale.items.reduce((acc, i) => acc + i.quantity, 0)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-500">
                      {formatMoney(sale.subtotal)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-slate-900">
                      {formatMoney(sale.total)}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {isCancelled ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          <XCircle className="w-3 h-3" />
                          <span>Anulada</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Completada</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {/* View sale detail */}
                        <button
                          type="button"
                          onClick={() => setSelectedSaleDetail(sale)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                          title="Ver detalle de productos y desglose"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* View / Print Receipt */}
                        <button
                          type="button"
                          onClick={() =>
                            openReceiptModal({
                              type: 'sale',
                              sale: sale
                            })
                          }
                          className="p-1.5 text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                          title="Reimprimir Recibo o Ticket"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                        </button>

                        {/* Cancel Sale Button */}
                        {!isCancelled && (
                          <button
                            type="button"
                            onClick={() => {
                              setSaleToCancel(sale);
                              setCancelReason('Devolución de mercancía');
                            }}
                            className="p-1.5 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                            title="Anular venta y revertir inventario"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Receipt className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-medium text-slate-700 text-sm">No se encontraron ventas para los filtros seleccionados</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SALE DETAIL MODAL */}
      {selectedSaleDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Detalle de Operación de Venta</h3>
                <p className="text-xs text-slate-400 font-mono">
                  {selectedSaleDetail.saleNumber} • {selectedSaleDetail.receiptNumber}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSaleDetail(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Cliente</span>
                  <p className="font-bold text-slate-900">{selectedSaleDetail.customerName}</p>
                  <p className="text-slate-600 font-mono">{selectedSaleDetail.customerDoc}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Fecha y Cajero</span>
                  <p className="font-medium text-slate-800">{selectedSaleDetail.date}</p>
                  <p className="text-slate-600">{selectedSaleDetail.cashierName}</p>
                </div>
              </div>

              {/* Items List */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-[10px] uppercase font-bold text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Producto</th>
                      <th className="py-2 px-3 text-right">Cant.</th>
                      <th className="py-2 px-3 text-right">P. Unit</th>
                      <th className="py-2 px-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {selectedSaleDetail.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3 font-sans">
                          <p className="font-semibold text-slate-800">{item.name}</p>
                          <span className="text-[10px] text-slate-400 font-mono">{item.sku}</span>
                        </td>
                        <td className="py-2 px-3 text-right tabular-nums font-bold">{item.quantity}</td>
                        <td className="py-2 px-3 text-right tabular-nums">{formatMoney(item.unitPrice)}</td>
                        <td className="py-2 px-3 text-right tabular-nums font-bold text-slate-900">
                          {formatMoney(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-between items-center pt-2 border-t border-slate-200 font-mono">
                <span className="font-sans text-xs text-slate-600">Total Transacción:</span>
                <span className="text-base font-bold text-slate-900">{formatMoney(selectedSaleDetail.total, true)}</span>
              </div>

              {/* Action buttons */}
              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    const s = selectedSaleDetail;
                    setSelectedSaleDetail(null);
                    openReceiptModal({
                      type: 'sale',
                      sale: s
                    });
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold flex items-center gap-1.5"
                >
                  <Receipt className="w-4 h-4" />
                  <span>Imprimir Recibo de Venta</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CANCELLATION MODAL */}
      {saleToCancel && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 p-5 text-xs">
            <h3 className="font-bold text-sm text-rose-600 mb-1 flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4" />
              <span>Anulación de Venta & Reversión de Stock</span>
            </h3>
            <p className="text-slate-600 mb-3">
              ¿Está seguro de anular la venta <span className="font-mono font-bold">{saleToCancel.saleNumber}</span> por{' '}
              <span className="font-bold">{formatMoney(saleToCancel.total)}</span>?
            </p>
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-2.5 rounded-lg mb-3">
              ⚠️ Esta acción devolverá automáticamente las cantidades vendidas al inventario disponible (Kardex) y cancelará la deuda asociada.
            </div>

            <form onSubmit={handleConfirmCancel} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Motivo de Anulación *</label>
                <input
                  type="text"
                  required
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-2.5 py-2 focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSaleToCancel(null)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold"
                >
                  Confirmar Anulación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STRUCTURED PDF REPORT PRINT & PREVIEW MODAL */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Top Control Bar (Hidden when printed) */}
            <div className="no-print p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-snug">
                    Vista Previa de Impresión - Reporte de Ventas
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Documento formal formateado para exportación a PDF y hojas A4 (horizontal)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportPDF}
                  disabled={isGeneratingPdf}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  title="Descargar archivo .pdf directamente"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isGeneratingPdf ? 'Generando PDF...' : 'Descargar Archivo PDF'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  title="Abrir diálogo de impresión del navegador"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir / Guardar PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors ml-1"
                  title="Cerrar vista previa"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Printable Document Sheet */}
            <div className="overflow-y-auto p-6 sm:p-8 space-y-6 text-slate-900 bg-white font-sans print-report">
              {/* Top Accent Strip */}
              <div className="h-1.5 bg-slate-900 rounded-full w-full" />

              {/* Corporate Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b-2 border-slate-200">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-900">
                    {settings.companyName || 'AURACORE ERP'}
                  </h1>
                  <p className="text-xs font-semibold text-slate-700 mt-0.5">
                    {settings.tradeName} • RIF / Documento Fiscal: {settings.taxId}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {settings.address} • Tel: {settings.phone} • Email: {settings.email}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="inline-block px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold uppercase rounded-md tracking-wider">
                    Reporte Auditado
                  </span>
                  <h2 className="text-base font-bold text-indigo-900 mt-1">
                    INFORME DETALLADO DE FACTURACIÓN
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                    Emisión: {new Date().toLocaleDateString('es-ES')} {new Date().toLocaleTimeString('es-ES')}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Auditor / Cajero: <span className="font-semibold">{currentUser?.name || settings.cashierName || 'ADMIN'}</span>
                  </p>
                </div>
              </div>

              {/* Filter Parameters Banner */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-3 text-slate-600">
                  <span className="font-bold text-slate-800">Parámetros aplicados:</span>
                  <span>
                    Período:{' '}
                    <strong className="text-slate-800">
                      {dateFilter === 'hoy'
                        ? 'Ventas de Hoy'
                        : dateFilter === 'semana'
                        ? 'Últimos 7 días'
                        : dateFilter === 'mes'
                        ? 'Mes en curso'
                        : 'Histórico completo'}
                    </strong>
                  </span>
                  <span>•</span>
                  <span>
                    Condición:{' '}
                    <strong className="text-slate-800">
                      {paymentTypeFilter === 'contado'
                        ? 'Solo Contado'
                        : paymentTypeFilter === 'credito'
                        ? 'Solo a Crédito'
                        : 'Todos'}
                    </strong>
                  </span>
                  <span>•</span>
                  <span>
                    Estado:{' '}
                    <strong className="text-slate-800">
                      {statusFilter === 'completada'
                        ? 'Solo Completadas'
                        : statusFilter === 'anulada'
                        ? 'Solo Anuladas'
                        : 'Todos los Estados'}
                    </strong>
                  </span>
                  {searchQuery && (
                    <>
                      <span>•</span>
                      <span>
                        Búsqueda: <strong className="text-slate-800 font-mono">"{searchQuery}"</strong>
                      </span>
                    </>
                  )}
                </div>

                <span className="text-[11px] font-mono text-slate-500">
                  Registros: <strong className="text-slate-800">{filteredSales.length}</strong>
                </span>
              </div>

              {/* KPI Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="border border-slate-200 rounded-lg p-3 bg-white">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Facturado</span>
                  <div className="text-lg font-bold font-mono text-indigo-700 mt-0.5 tabular-nums">
                    {formatMoney(metrics.totalFacturado)}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">{metrics.validSalesCount} completadas</span>
                </div>

                <div className="border border-slate-200 rounded-lg p-3 bg-white">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">De Contado</span>
                  <div className="text-lg font-bold font-mono text-emerald-700 mt-0.5 tabular-nums">
                    {formatMoney(metrics.totalContado)}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Ingreso de caja</span>
                </div>

                <div className="border border-slate-200 rounded-lg p-3 bg-white">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">A Crédito</span>
                  <div className="text-lg font-bold font-mono text-amber-700 mt-0.5 tabular-nums">
                    {formatMoney(metrics.totalCredito)}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Cartera pendiente</span>
                </div>

                <div className="border border-slate-200 rounded-lg p-3 bg-white">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ticket Promedio</span>
                  <div className="text-lg font-bold font-mono text-slate-800 mt-0.5 tabular-nums">
                    {formatMoney(metrics.averageTicket)}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Por venta activa</span>
                </div>
              </div>

              {/* Detailed Structured Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-white font-bold text-[10px] uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3 text-center w-8">#</th>
                      <th className="py-2.5 px-3">N° Venta</th>
                      <th className="py-2.5 px-3">Recibo</th>
                      <th className="py-2.5 px-3 text-center">Fecha</th>
                      <th className="py-2.5 px-3">Cliente</th>
                      <th className="py-2.5 px-3">Doc / RIF</th>
                      <th className="py-2.5 px-3 text-center">Tipo</th>
                      <th className="py-2.5 px-3 text-center">Método</th>
                      <th className="py-2.5 px-3 text-center">Cant</th>
                      <th className="py-2.5 px-3 text-right">Subtotal</th>
                      <th className="py-2.5 px-3 text-right">IVA</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                      <th className="py-2.5 px-3 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredSales.map((sale, idx) => {
                      const isCancelled = sale.status === 'anulada';
                      const itemsCount = sale.items.reduce((acc, i) => acc + i.quantity, 0);

                      return (
                        <tr
                          key={sale.id}
                          className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}
                        >
                          <td className="py-2 px-3 text-center font-mono text-slate-400">{idx + 1}</td>
                          <td className="py-2 px-3 font-mono font-bold text-slate-900">{sale.saleNumber}</td>
                          <td className="py-2 px-3 font-mono text-[11px] text-slate-500">{sale.receiptNumber}</td>
                          <td className="py-2 px-3 text-center font-mono text-[11px] text-slate-600">{sale.date}</td>
                          <td className="py-2 px-3 font-semibold text-slate-900">{sale.customerName}</td>
                          <td className="py-2 px-3 font-mono text-[11px] text-slate-500">{sale.customerDoc || '-'}</td>
                          <td className="py-2 px-3 text-center">
                            <span
                              className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                sale.paymentType === 'credito'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {sale.paymentType}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center uppercase text-[10px] text-slate-500 font-mono">
                            {sale.paymentMethod}
                          </td>
                          <td className="py-2 px-3 text-center font-mono tabular-nums">{itemsCount}</td>
                          <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-600">
                            {formatMoney(sale.subtotal)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-500">
                            {formatMoney(sale.taxAmount)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold tabular-nums text-slate-900">
                            {formatMoney(sale.total)}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span
                              className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                isCancelled
                                  ? 'bg-rose-100 text-rose-700'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {sale.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredSales.length === 0 && (
                      <tr>
                        <td colSpan={13} className="py-8 text-center text-slate-400">
                          No existen ventas registradas con los filtros actuales.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {filteredSales.length > 0 && (
                    <tfoot className="bg-slate-100 font-mono border-t-2 border-slate-300 font-bold text-slate-900">
                      <tr>
                        <td colSpan={9} className="py-2.5 px-3 text-right font-sans text-xs">
                          TOTALES DE VENTAS ACTIVAS:
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums">
                          {formatMoney(
                            filteredSales.reduce((acc, s) => (s.status === 'completada' ? acc + s.subtotal : acc), 0)
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums">
                          {formatMoney(
                            filteredSales.reduce((acc, s) => (s.status === 'completada' ? acc + s.taxAmount : acc), 0)
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right text-indigo-700 text-sm tabular-nums">
                          {formatMoney(metrics.totalFacturado)}
                        </td>
                        <td className="py-2.5 px-3 text-center font-sans text-[10px] text-slate-500">
                          {metrics.validSalesCount} ops
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>

              {/* Official Signature & Certification Block */}
              <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs text-center">
                <div className="space-y-1">
                  <div className="h-10 border-b border-slate-400 w-48 mx-auto" />
                  <p className="font-bold text-slate-800">Elaborado por: {currentUser?.name || settings.cashierName || 'ADMIN'}</p>
                  <p className="text-[10px] text-slate-400">Control de Caja y Facturación</p>
                </div>

                <div className="space-y-1">
                  <div className="h-10 border-b border-slate-400 w-48 mx-auto" />
                  <p className="font-bold text-slate-800">Revisado y Aprobado</p>
                  <p className="text-[10px] text-slate-400">Gerencia Administrativa / Auditoría</p>
                </div>
              </div>

              {/* Footer Note */}
              <div className="text-[10px] text-slate-400 text-center pt-2 border-t border-slate-100">
                {settings.tradeName || settings.companyName} • AuraCore ERP - Sistema de Gestión Comercial y Cobranzas • Documento oficial emitido para auditoría administrativa.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

