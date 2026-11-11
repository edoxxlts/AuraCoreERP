import React, { useState, useRef } from 'react';
import {
  Printer,
  X,
  Share2,
  CheckCircle,
  QrCode,
  Building2,
  Calendar,
  CreditCard,
  User,
  FileText,
  BadgeCheck,
  Copy,
  Receipt as ReceiptIcon
} from 'lucide-react';
import { useERP } from '../context/ERPContext';

export const ReceiptModal: React.FC = () => {
  const { receiptModal, closeReceiptModal, settings, formatMoney } = useERP();
  const [printFormat, setPrintFormat] = useState<'ticket' | 'formal'>('ticket');
  const [copied, setCopied] = useState(false);
  const printableRef = useRef<HTMLDivElement>(null);

  if (!receiptModal.isOpen) return null;

  const { type, sale, payment, debt } = receiptModal;

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    let summaryText = '';
    if (type === 'payment' && payment && debt) {
      summaryText = `*COMPROBANTE DE PAGO - ${settings.tradeName}*
Recibo N°: ${payment.receiptNumber}
Fecha: ${payment.date}
Cliente: ${debt.customerName} (${debt.customerDoc})
Venta Ref: ${debt.saleNumber}
---------------------------------
Saldo Anterior: ${formatMoney(payment.previousBalance)}
*MONTO ABONADO: ${formatMoney(payment.amount)}*
Saldo Restante: ${formatMoney(payment.remainingBalance)}
Método de Pago: ${payment.paymentMethod.toUpperCase()} (Ref: ${payment.referenceNumber || 'N/A'})
Registrado por: ${payment.recordedBy}
---------------------------------
_Comprobante electrónico emitido por ${settings.companyName}_`;
    } else if (sale) {
      const itemsList = sale.items
        .map(i => `• ${i.quantity}x ${i.name} - ${formatMoney(i.total)}`)
        .join('\n');

      summaryText = `*RECIBO DE VENTA - ${settings.tradeName}*
Factura/Recibo N°: ${sale.receiptNumber}
Fecha: ${sale.date}
Cliente: ${sale.customerName} (${sale.customerDoc})
---------------------------------
PRODUCTOS:
${itemsList}
---------------------------------
Subtotal: ${formatMoney(sale.subtotal)}
IVA (${sale.taxRate}%): ${formatMoney(sale.taxAmount)}
*TOTAL: ${formatMoney(sale.total)}*
Modalidad: ${sale.paymentType === 'credito' ? 'A CRÉDITO' : 'DE CONTADO'}
Método: ${sale.paymentMethod.toUpperCase()}
${sale.paymentReference ? `Ref: ${sale.paymentReference}` : ''}
${sale.creditDetails ? `Saldo Pendiente: ${formatMoney(sale.creditDetails.balanceDue)} | Vence: ${sale.creditDetails.dueDate}` : ''}
---------------------------------
${settings.receiptFooterNote}`;
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      {/* Container */}
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Controls Header (no-print) */}
        <div className="no-print p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ReceiptIcon className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="font-semibold text-sm sm:text-base leading-tight">
                {type === 'payment' ? 'Recibo Oficial de Pago / Cobranza' : 'Recibo de Venta & Ticket POS'}
              </h3>
              <p className="text-xs text-slate-400">
                {type === 'payment' ? payment?.receiptNumber : sale?.receiptNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Format toggle */}
            <div className="bg-slate-800 p-0.5 rounded-lg flex text-xs">
              <button
                type="button"
                onClick={() => setPrintFormat('ticket')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  printFormat === 'ticket' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                Ticket (80mm)
              </button>
              <button
                type="button"
                onClick={() => setPrintFormat('formal')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  printFormat === 'formal' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                Recibo Formal
              </button>
            </div>

            <button
              onClick={closeReceiptModal}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-1"
              title="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable View Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100 flex justify-center">
          {printFormat === 'ticket' ? (
            /* ================= 80mm THERMAL TICKET FORMAT ================= */
            <div
              ref={printableRef}
              className="print-ticket bg-white p-5 rounded-lg shadow-sm border border-slate-200 text-slate-800 font-mono text-xs w-full max-w-[340px]"
            >
              {/* Header */}
              <div className="text-center pb-3 border-b border-dashed border-slate-300">
                <h2 className="font-bold text-sm tracking-tight text-slate-900 uppercase">
                  {settings.tradeName}
                </h2>
                <p className="text-[10px] text-slate-600">{settings.companyName}</p>
                <p className="text-[10px] text-slate-600">RIF/NIT: {settings.taxId}</p>
                <p className="text-[10px] text-slate-600">{settings.address}</p>
                <p className="text-[10px] text-slate-600">Tel: {settings.phone}</p>
              </div>

              {/* Receipt Metadata */}
              <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{type === 'payment' ? 'RECIBO DE PAGO' : 'TICKET DE VENTA'}</span>
                  <span className="tabular-nums">
                    {type === 'payment' ? payment?.receiptNumber : sale?.receiptNumber}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>FECHA:</span>
                  <span className="tabular-nums">{type === 'payment' ? payment?.date : sale?.date}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>CLIENTE:</span>
                  <span className="truncate max-w-[170px]">
                    {type === 'payment' ? debt?.customerName : sale?.customerName}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>DOC/RIF:</span>
                  <span>{type === 'payment' ? debt?.customerDoc : sale?.customerDoc}</span>
                </div>
                {type === 'payment' && debt && (
                  <div className="flex justify-between text-slate-600">
                    <span>VENTA ORIGEN:</span>
                    <span className="font-semibold text-slate-800">{debt.saleNumber}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>ATENDIDO POR:</span>
                  <span>{type === 'payment' ? payment?.recordedBy : sale?.cashierName}</span>
                </div>
              </div>

              {/* Body: Items if Sale, or Account Breakdown if Payment */}
              {type === 'sale' && sale && (
                <div className="py-3 border-b border-dashed border-slate-300">
                  <div className="grid grid-cols-12 text-[10px] font-bold text-slate-500 uppercase pb-1 mb-1 border-b border-slate-200">
                    <span className="col-span-2">CANT</span>
                    <span className="col-span-6">DESCRIPCIÓN</span>
                    <span className="col-span-4 text-right">TOTAL</span>
                  </div>
                  <div className="space-y-1.5">
                    {sale.items.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-12 text-[11px] leading-tight">
                        <span className="col-span-2 font-semibold text-slate-900 tabular-nums">
                          {item.quantity}x
                        </span>
                        <div className="col-span-6 pr-1">
                          <span className="text-slate-800 block truncate">{item.name}</span>
                          <span className="text-[10px] text-slate-500 tabular-nums">
                            @ {formatMoney(item.unitPrice)}
                          </span>
                        </div>
                        <span className="col-span-4 text-right font-medium tabular-nums text-slate-900">
                          {formatMoney(item.total)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {type === 'payment' && payment && (
                <div className="py-3 border-b border-dashed border-slate-300 space-y-1.5 text-[11px]">
                  <p className="text-[10px] uppercase font-bold text-slate-500">ESTADO DE CUENTA COBRANZA</p>
                  <div className="flex justify-between text-slate-600">
                    <span>Saldo Anterior:</span>
                    <span className="tabular-nums">{formatMoney(payment.previousBalance)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 bg-emerald-50 px-1 py-0.5 rounded">
                    <span>ABONO RECIBIDO:</span>
                    <span className="tabular-nums text-emerald-700">{formatMoney(payment.amount)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>SALDO RESTANTE:</span>
                    <span className="tabular-nums text-indigo-700">{formatMoney(payment.remainingBalance)}</span>
                  </div>
                  <div className="pt-1 text-[10px] text-slate-500">
                    Forma de Pago: {payment.paymentMethod.toUpperCase()} | Ref: {payment.referenceNumber || 'N/A'}
                  </div>
                  {payment.bank && (
                    <div className="text-[10px] text-slate-500">
                      Banco: {payment.bank}
                    </div>
                  )}
                </div>
              )}

              {/* Financial Totals for Sale */}
              {type === 'sale' && sale && (
                <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
                  <div className="flex justify-between text-slate-600">
                    <span>SUBTOTAL:</span>
                    <span className="tabular-nums">{formatMoney(sale.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>IVA ({sale.taxRate}%):</span>
                    <span className="tabular-nums">{formatMoney(sale.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 text-sm pt-1 border-t border-slate-200">
                    <span>TOTAL A PAGAR:</span>
                    <span className="tabular-nums">{formatMoney(sale.total, true)}</span>
                  </div>

                  <div className="pt-2 text-[10px] space-y-0.5 text-slate-600">
                    <div className="flex justify-between">
                      <span>TIPO DE VENTA:</span>
                      <span className="font-semibold text-slate-800 uppercase">
                        {sale.paymentType === 'credito' ? 'A CRÉDITO' : 'DE CONTADO'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>MÉTODO:</span>
                      <span className="uppercase">{sale.paymentMethod}</span>
                    </div>
                    {sale.paymentReference && (
                      <div className="flex justify-between">
                        <span>REF/AUTORIZACIÓN:</span>
                        <span>{sale.paymentReference}</span>
                      </div>
                    )}
                    {sale.creditDetails && (
                      <div className="bg-amber-50 p-1.5 rounded mt-1 border border-amber-200 text-amber-900 font-sans">
                        <div className="flex justify-between text-[10px]">
                          <span>Anticipo Pagado:</span>
                          <span className="font-bold tabular-nums">{formatMoney(sale.creditDetails.initialPayment)}</span>
                        </div>
                        <div className="flex justify-between text-[10px]">
                          <span>Saldo por Cobrar:</span>
                          <span className="font-bold tabular-nums">{formatMoney(sale.creditDetails.balanceDue)}</span>
                        </div>
                        <div className="flex justify-between text-[10px]">
                          <span>Fecha Límite Pago:</span>
                          <span className="font-bold">{sale.creditDetails.dueDate}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Barcode & Footer */}
              <div className="pt-3 text-center space-y-2">
                {/* Simulated Barcode */}
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center gap-[2px] h-9 w-full max-w-[200px] overflow-hidden px-2">
                    {[1, 2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 2, 3, 1, 4, 1, 2, 3, 1, 2, 1].map((w, idx) => (
                      <div
                        key={idx}
                        className="h-full bg-slate-900"
                        style={{ width: `${w * 2}px` }}
                      />
                    ))}
                  </div>
                  <span className="text-[9px] text-slate-500 tracking-widest mt-0.5">
                    *{type === 'payment' ? payment?.receiptNumber : sale?.receiptNumber}*
                  </span>
                </div>

                <p className="text-[10px] text-slate-500 italic leading-snug px-2">
                  {settings.receiptFooterNote}
                </p>
                <p className="text-[9px] text-slate-400">
                  AuraCore ERP • Documento de Control Interno
                </p>
              </div>
            </div>
          ) : (
            /* ================= FORMAL A4 / CARTA VOUCHER FORMAT ================= */
            <div
              ref={printableRef}
              className="print-invoice bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-slate-200 text-slate-800 text-xs w-full max-w-xl font-sans"
            >
              {/* Corporate Header */}
              <div className="flex items-start justify-between pb-5 border-b-2 border-slate-900">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-base">
                      A
                    </div>
                    <div>
                      <h2 className="font-bold text-base text-slate-900 tracking-tight leading-none">
                        {settings.companyName}
                      </h2>
                      <span className="text-[11px] text-slate-500">{settings.tradeName}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600">RIF / Identificación Fiscal: {settings.taxId}</p>
                  <p className="text-[11px] text-slate-600 max-w-sm">{settings.address}</p>
                  <p className="text-[11px] text-slate-600">Tel: {settings.phone} • Email: {settings.email}</p>
                </div>

                <div className="text-right">
                  <div className="inline-block bg-slate-900 text-white px-3 py-1 text-xs font-semibold rounded">
                    {type === 'payment' ? 'RECIBO DE COBRO / PAGO' : 'COMPROBANTE DE VENTA'}
                  </div>
                  <p className="font-mono text-sm font-bold text-slate-900 mt-1 tabular-nums">
                    {type === 'payment' ? payment?.receiptNumber : sale?.receiptNumber}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Fecha: <span className="font-medium text-slate-800">{type === 'payment' ? payment?.date : sale?.date}</span>
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Estado: <span className="font-bold text-emerald-600">VÁLIDO / REGISTRADO</span>
                  </p>
                </div>
              </div>

              {/* Client & Transaction Data Box */}
              <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-200 bg-slate-50/70 p-3 rounded-lg my-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                    DATOS DEL CLIENTE / RECEPTOR
                  </p>
                  <p className="font-semibold text-slate-900 text-xs">
                    {type === 'payment' ? debt?.customerName : sale?.customerName}
                  </p>
                  <p className="text-slate-600">
                    Doc / RIF: <span className="font-mono font-medium">{type === 'payment' ? debt?.customerDoc : sale?.customerDoc}</span>
                  </p>
                  <p className="text-slate-600">
                    Teléfono: {type === 'payment' ? debt?.customerPhone : sale?.customerPhone || 'N/A'}
                  </p>
                  <p className="text-slate-600 truncate">
                    Dirección: {sale?.customerAddress || 'Ciudad'}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                    DATOS DE OPERACIÓN & CAJA
                  </p>
                  <p className="text-slate-700">
                    Cajero / Operador: <span className="font-medium">{type === 'payment' ? payment?.recordedBy : sale?.cashierName}</span>
                  </p>
                  <p className="text-slate-700">
                    Modalidad: <span className="font-semibold uppercase">{type === 'payment' ? 'Abono a Cuenta' : sale?.paymentType}</span>
                  </p>
                  <p className="text-slate-700">
                    Forma de Pago: <span className="font-medium uppercase">{type === 'payment' ? payment?.paymentMethod : sale?.paymentMethod}</span>
                  </p>
                  {(payment?.referenceNumber || sale?.paymentReference) && (
                    <p className="text-slate-700">
                      N° Referencia: <span className="font-mono font-medium">{payment?.referenceNumber || sale?.paymentReference}</span>
                    </p>
                  )}
                  {type === 'payment' && debt && (
                    <p className="text-slate-700">
                      Factura Venta Ref: <span className="font-mono font-bold text-indigo-700">{debt.saleNumber}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Transaction Content Table */}
              {type === 'sale' && sale && (
                <div className="mb-4">
                  <table className="w-full text-left text-xs border border-slate-200">
                    <thead className="bg-slate-100 text-slate-700 font-semibold text-[11px] uppercase border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">Código</th>
                        <th className="py-2 px-3">Descripción</th>
                        <th className="py-2 px-3 text-right">Cant.</th>
                        <th className="py-2 px-3 text-right">Precio Unit.</th>
                        <th className="py-2 px-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {sale.items.map((it, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-mono text-slate-500">{it.sku}</td>
                          <td className="py-2 px-3 font-medium text-slate-900">{it.name}</td>
                          <td className="py-2 px-3 text-right font-mono tabular-nums">{it.quantity}</td>
                          <td className="py-2 px-3 text-right font-mono tabular-nums">{formatMoney(it.unitPrice)}</td>
                          <td className="py-2 px-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                            {formatMoney(it.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="flex justify-end mt-3">
                    <div className="w-64 space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Subtotal Neto:</span>
                        <span className="font-mono tabular-nums">{formatMoney(sale.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Impuesto ({sale.taxRate}%):</span>
                        <span className="font-mono tabular-nums">{formatMoney(sale.taxAmount)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-slate-900 text-sm pt-1.5 border-t-2 border-slate-800">
                        <span>TOTAL RECIBO:</span>
                        <span className="font-mono tabular-nums text-slate-900">
                          {formatMoney(sale.total, true)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Receipt / Cobranza Details Table */}
              {type === 'payment' && payment && (
                <div className="mb-4">
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-slate-100 px-4 py-2 font-semibold text-slate-800 text-xs uppercase border-b border-slate-200">
                      Desglose de la Cobranza y Amortización
                    </div>
                    <div className="p-4 grid grid-cols-3 gap-4 text-center divide-x divide-slate-200">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block mb-1">Saldo Anterior</span>
                        <span className="font-mono text-base font-bold text-slate-700 tabular-nums">
                          {formatMoney(payment.previousBalance)}
                        </span>
                      </div>
                      <div className="bg-emerald-50/50 py-1 rounded">
                        <span className="text-[10px] text-emerald-700 uppercase font-semibold block mb-1">
                          Abono Percibido
                        </span>
                        <span className="font-mono text-lg font-extrabold text-emerald-600 tabular-nums">
                          {formatMoney(payment.amount)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block mb-1">Saldo Restante</span>
                        <span className="font-mono text-base font-bold text-indigo-700 tabular-nums">
                          {formatMoney(payment.remainingBalance)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 p-3 bg-slate-50 rounded border border-slate-200 text-xs text-slate-700">
                    <span className="font-semibold text-slate-900">Concepto: </span>
                    {payment.notes || `Cancelación/Abono a la cuenta de crédito generada por la venta ${debt?.saleNumber}.`}
                  </div>
                </div>
              )}

              {/* Signatures & QR Validation Stamp */}
              <div className="pt-6 border-t border-slate-200 mt-6 grid grid-cols-12 gap-4 items-center">
                <div className="col-span-8 grid grid-cols-2 gap-4">
                  <div className="text-center pt-8 border-t border-slate-400">
                    <p className="font-semibold text-slate-800 text-[11px]">Firma y Sello Autorizado</p>
                    <p className="text-[10px] text-slate-500">Por {settings.tradeName}</p>
                  </div>
                  <div className="text-center pt-8 border-t border-slate-400">
                    <p className="font-semibold text-slate-800 text-[11px]">Conforme Cliente</p>
                    <p className="text-[10px] text-slate-500">Recibí conforme</p>
                  </div>
                </div>

                <div className="col-span-4 flex flex-col items-center justify-center p-2 border border-slate-200 rounded-lg bg-slate-50">
                  <QrCode className="w-12 h-12 text-slate-800 mb-1" />
                  <span className="text-[9px] text-slate-500 font-mono text-center leading-tight">
                    VALIDACIÓN DIGITAL<br />
                    {type === 'payment' ? payment?.receiptNumber : sale?.receiptNumber}
                  </span>
                </div>
              </div>

              <div className="mt-4 text-center text-[10px] text-slate-400">
                {settings.receiptFooterNote}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons Footer (no-print) */}
        <div className="no-print p-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <BadgeCheck className="w-4 h-4 text-emerald-600" />
            <span>Documento listo para imprimir o enviar digitalmente</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copiado al portapapeles</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-600" />
                  <span>Copiar WhatsApp / Texto</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Recibo</span>
            </button>

            <button
              type="button"
              onClick={closeReceiptModal}
              className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
