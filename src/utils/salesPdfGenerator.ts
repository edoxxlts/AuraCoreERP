import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Sale, CompanySettings } from '../types/erp';

interface SalesPdfOptions {
  sales: Sale[];
  settings: CompanySettings;
  filters: {
    searchQuery: string;
    dateFilter: string;
    paymentTypeFilter: string;
    statusFilter: string;
  };
  metrics: {
    totalFacturado: number;
    totalContado: number;
    totalCredito: number;
    averageTicket: number;
    validSalesCount: number;
    totalCount: number;
  };
  userName?: string;
}

export const generateSalesPdf = (options: SalesPdfOptions): jsPDF => {
  const { sales, settings, filters, metrics, userName } = options;

  // Create A4 Landscape PDF for structured, readable table columns
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // 1. TOP HEADER - Company Info
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(0, 0, pageWidth, 5, 'F'); // Top accent bar

  // Company Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(settings.companyName || 'AURACORE ERP', margin, 15);

  // Subtitle / Trade Name & Tax ID
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105); // slate-600
  const subHeader = `${settings.tradeName ? settings.tradeName + ' • ' : ''}Doc / RIF: ${settings.taxId || 'N/A'}`;
  doc.text(subHeader, margin, 20);

  const contactInfo = `Tel: ${settings.phone || 'S/N'} • Email: ${settings.email || 'S/N'} • ${settings.address || ''}`;
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(contactInfo, margin, 24);

  // Title Box on the right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(67, 56, 202); // indigo-700
  doc.text('REPORTE AUDITADO DE VENTAS', pageWidth - margin, 15, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  const now = new Date();
  const dateFormatted = `${now.toLocaleDateString('es-ES')} ${now.toLocaleTimeString('es-ES')}`;
  doc.text(`Emisión: ${dateFormatted}`, pageWidth - margin, 20, { align: 'right' });
  doc.text(`Generado por: ${userName || settings.cashierName || 'ADMIN'}`, pageWidth - margin, 24, { align: 'right' });

  // Divider
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.5);
  doc.line(margin, 27, pageWidth - margin, 27);

  // 2. FILTERS APPLIED BAR
  doc.setFillColor(248, 250, 252); // slate-50
  doc.roundedRect(margin, 29, pageWidth - (margin * 2), 10, 1.5, 1.5, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, 29, pageWidth - (margin * 2), 10, 1.5, 1.5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text('Parámetros de Auditoría:', margin + 3, 35);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  const filterDesc = [
    `Período: ${
      filters.dateFilter === 'hoy'
        ? 'Ventas de Hoy'
        : filters.dateFilter === 'semana'
        ? 'Últimos 7 días'
        : filters.dateFilter === 'mes'
        ? 'Mes en curso'
        : 'Histórico completo'
    }`,
    `Condición: ${
      filters.paymentTypeFilter === 'contado'
        ? 'Solo Contado'
        : filters.paymentTypeFilter === 'credito'
        ? 'Solo Crédito'
        : 'Todos'
    }`,
    `Estado: ${
      filters.statusFilter === 'completada'
        ? 'Solo Completadas'
        : filters.statusFilter === 'anulada'
        ? 'Solo Anuladas'
        : 'Todos los Estados'
    }`,
    filters.searchQuery ? `Búsqueda: "${filters.searchQuery}"` : null
  ]
    .filter(Boolean)
    .join('  |  ');

  doc.text(filterDesc, margin + 40, 35);

  // 3. KPI / METRICS SUMMARY CARDS
  const cardY = 41;
  const cardHeight = 14;
  const cardWidth = (pageWidth - (margin * 2) - 9) / 4;

  const kpis = [
    {
      title: 'TOTAL FACTURADO',
      value: `${settings.currencySymbol} ${metrics.totalFacturado.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: `${metrics.validSalesCount} ventas completadas`,
      color: [67, 56, 202] // indigo-700
    },
    {
      title: 'VENTAS DE CONTADO',
      value: `${settings.currencySymbol} ${metrics.totalContado.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: 'Ingreso directo a caja',
      color: [16, 149, 106] // emerald-600
    },
    {
      title: 'VENTAS A CRÉDITO',
      value: `${settings.currencySymbol} ${metrics.totalCredito.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: 'Cuentas por cobrar',
      color: [217, 119, 6] // amber-600
    },
    {
      title: 'TICKET PROMEDIO',
      value: `${settings.currencySymbol} ${metrics.averageTicket.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: `De ${metrics.totalCount} registros auditados`,
      color: [51, 65, 85] // slate-700
    }
  ];

  kpis.forEach((kpi, idx) => {
    const x = margin + idx * (cardWidth + 3);
    // Background
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(x, cardY, cardWidth, cardHeight, 1.5, 1.5, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, cardY, cardWidth, cardHeight, 1.5, 1.5, 'S');

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.title, x + 3, cardY + 4);

    // Value
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    doc.text(kpi.value, x + 3, cardY + 9);

    // Subtitle
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(148, 163, 184);
    doc.text(kpi.subtitle, x + 3, cardY + 12.5);
  });

  // 4. STRUCTURED SALES TABLE
  const tableData = sales.map((sale, index) => {
    const isCancelled = sale.status === 'anulada';
    const totalItems = sale.items.reduce((acc, i) => acc + i.quantity, 0);

    return [
      (index + 1).toString(),
      sale.saleNumber,
      sale.receiptNumber,
      sale.date,
      sale.customerName,
      sale.customerDoc || '-',
      sale.paymentType.toUpperCase(),
      sale.paymentMethod.toUpperCase(),
      totalItems.toString(),
      `${settings.currencySymbol} ${sale.subtotal.toFixed(2)}`,
      `${settings.currencySymbol} ${sale.taxAmount.toFixed(2)}`,
      `${settings.currencySymbol} ${sale.total.toFixed(2)}`,
      isCancelled ? 'ANULADA' : 'COMPLETADA'
    ];
  });

  const totalSubtotal = sales.reduce((acc, s) => (s.status === 'completada' ? acc + s.subtotal : acc), 0);
  const totalTax = sales.reduce((acc, s) => (s.status === 'completada' ? acc + s.taxAmount : acc), 0);
  const totalGeneral = sales.reduce((acc, s) => (s.status === 'completada' ? acc + s.total : acc), 0);

  autoTable(doc, {
    startY: 58,
    margin: { left: margin, right: margin, bottom: 16 },
    head: [[
      '#',
      'N° Venta',
      'N° Recibo',
      'Fecha / Hora',
      'Cliente',
      'Documento',
      'Condición',
      'Método',
      'Cant.',
      'Subtotal',
      'IVA',
      'Total',
      'Estado'
    ]],
    body: tableData,
    foot: [[
      { content: 'TOTALES (Ventas Activas Completadas):', colSpan: 9, styles: { halign: 'right', fontStyle: 'bold' } },
      { content: `${settings.currencySymbol} ${totalSubtotal.toFixed(2)}`, styles: { halign: 'right', fontStyle: 'bold' } },
      { content: `${settings.currencySymbol} ${totalTax.toFixed(2)}`, styles: { halign: 'right', fontStyle: 'bold' } },
      { content: `${settings.currencySymbol} ${totalGeneral.toFixed(2)}`, styles: { halign: 'right', fontStyle: 'bold', textColor: [67, 56, 202] } },
      { content: `${metrics.validSalesCount} ops`, styles: { halign: 'center', fontStyle: 'bold' } }
    ]],
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 7.5,
      cellPadding: 1.8,
      overflow: 'linebreak',
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.15
    },
    headStyles: {
      fillColor: [30, 41, 59], // slate-800
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'center',
      cellPadding: 2
    },
    footStyles: {
      fillColor: [241, 245, 249], // slate-100
      textColor: [15, 23, 42],
      fontStyle: 'bold',
      fontSize: 7.5,
      lineColor: [203, 213, 225],
      lineWidth: 0.3
    },
    alternateRowStyles: {
      fillColor: [250, 252, 255]
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' }, // #
      1: { cellWidth: 24, fontStyle: 'bold', halign: 'left' }, // N° Venta
      2: { cellWidth: 24, halign: 'left' }, // N° Recibo
      3: { cellWidth: 27, halign: 'center' }, // Fecha
      4: { cellWidth: 'auto', fontStyle: 'bold' }, // Cliente
      5: { cellWidth: 22, halign: 'left' }, // Documento
      6: { cellWidth: 18, halign: 'center' }, // Condición
      7: { cellWidth: 20, halign: 'center' }, // Método
      8: { cellWidth: 12, halign: 'center' }, // Cant
      9: { cellWidth: 22, halign: 'right' }, // Subtotal
      10: { cellWidth: 18, halign: 'right' }, // IVA
      11: { cellWidth: 24, halign: 'right', fontStyle: 'bold' }, // Total
      12: { cellWidth: 22, halign: 'center' } // Estado
    },
    didParseCell: (data) => {
      // Style cancelled sales row
      if (data.section === 'body') {
        const rawRow = data.row.raw as string[];
        const status = rawRow[12];
        if (status === 'ANULADA') {
          data.cell.styles.textColor = [156, 163, 175]; // slate-400
          if (data.column.index === 12) {
            data.cell.styles.textColor = [225, 29, 72]; // rose-600
            data.cell.styles.fontStyle = 'bold';
          }
        } else if (data.column.index === 12) {
          data.cell.styles.textColor = [5, 150, 105]; // emerald-600
          data.cell.styles.fontStyle = 'bold';
        }

        if (data.column.index === 6) {
          // Condicion contado vs credito
          const condition = rawRow[6];
          if (condition === 'CREDITO') {
            data.cell.styles.textColor = [180, 83, 9]; // amber-700
          }
        }
      }
    },
    didDrawPage: (data) => {
      // Footer on every page
      const pageNumber = (doc.internal as any).getNumberOfPages
        ? (doc.internal as any).getNumberOfPages()
        : doc.getNumberOfPages();

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184); // slate-400

      // Bottom border line
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);

      // Left footnote
      const footnote = `${settings.tradeName || settings.companyName} • Sistema AuraCore ERP Comercial • Reporte para Control y Auditoría`;
      doc.text(footnote, margin, pageHeight - 6);

      // Right pagination
      const pageStr = `Página ${data.pageNumber} de ${pageNumber}`;
      doc.text(pageStr, pageWidth - margin, pageHeight - 6, { align: 'right' });
    }
  });

  return doc;
};

export const downloadSalesPdf = (options: SalesPdfOptions): void => {
  const doc = generateSalesPdf(options);
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const filename = `Reporte_Ventas_${dateStr}.pdf`;
  doc.save(filename);
};
