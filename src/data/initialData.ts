import { CompanySettings, Customer, DebtRecord, ERPUser, InventoryMovement, Product, Sale } from '../types/erp';

export const initialCompanySettings: CompanySettings = {
  companyName: 'AURACORE SISTEMAS Y TECNOLOGÍA C.A.',
  tradeName: 'AuraCore ERP',
  taxId: 'J-40918234-0',
  phone: '+1 (555) 839-2041 / +58 412-5551234',
  email: 'contacto@auracore-erp.com',
  address: 'Av. Libertador, Centro Empresarial Torre Europa, Piso 4, Ofic. 402',
  currencySymbol: '$',
  currencyCode: 'USD',
  secondaryCurrencySymbol: 'Bs.',
  exchangeRate: 36.50,
  taxRatePercent: 16,
  receiptFooterNote: '¡Gracias por su preferencia! Garantía oficial con este recibo de AuraCore ERP.',
  cashierName: 'Carlos Mendoza (Caja Principal)'
};

export const initialProducts: Product[] = [
  {
    id: 'prod-1',
    sku: 'LAP-HP-01',
    barcode: '7891001001',
    name: 'Laptop HP Pavilion 15.6" Core i5 16GB 512GB SSD',
    description: 'Portátil de alto rendimiento con pantalla Full HD IPS y carga rápida.',
    category: 'Tecnología',
    costPrice: 420.00,
    salePrice: 620.00,
    stock: 14,
    minStock: 5,
    unit: 'Und',
    isActive: true,
    createdAt: '2026-01-15'
  },
  {
    id: 'prod-2',
    sku: 'MON-LG-27',
    barcode: '7891001002',
    name: 'Monitor LG UltraGear 27" IPS 144Hz 1ms',
    description: 'Monitor gaming y diseño con soporte HDR10 y bordes ultradelgados.',
    category: 'Tecnología',
    costPrice: 160.00,
    salePrice: 245.00,
    stock: 8,
    minStock: 4,
    unit: 'Und',
    isActive: true,
    createdAt: '2026-01-18'
  },
  {
    id: 'prod-3',
    sku: 'TEC-MEC-RGB',
    barcode: '7891001003',
    name: 'Teclado Mecánico Inalámbrico Redragon Switch Blue',
    description: 'Teclado retroiluminado RGB dual mode Bluetooth + 2.4Ghz.',
    category: 'Accesorios',
    costPrice: 28.00,
    salePrice: 49.99,
    stock: 26,
    minStock: 10,
    unit: 'Und',
    isActive: true,
    createdAt: '2026-01-20'
  },
  {
    id: 'prod-4',
    sku: 'MOU-LOG-G502',
    barcode: '7891001004',
    name: 'Mouse Gamer Logitech G502 HERO Sensor 25K',
    description: '11 botones programables y pesas ajustables de precisión.',
    category: 'Accesorios',
    costPrice: 32.00,
    salePrice: 58.00,
    stock: 19,
    minStock: 8,
    unit: 'Und',
    isActive: true,
    createdAt: '2026-01-22'
  },
  {
    id: 'prod-5',
    sku: 'SSD-KIN-1TB',
    barcode: '7891001005',
    name: 'Unidad Estado Sólido Kingston NV2 1TB NVMe M.2',
    description: 'Velocidades de lectura de hasta 3500MB/s Gen 4x4.',
    category: 'Componentes',
    costPrice: 45.00,
    salePrice: 72.50,
    stock: 3, // LOW STOCK TRIGGER
    minStock: 6,
    unit: 'Und',
    isActive: true,
    createdAt: '2026-02-01'
  },
  {
    id: 'prod-6',
    sku: 'IMP-EPS-L3250',
    barcode: '7891001006',
    name: 'Impresora Multifuncional Epson EcoTank L3250 WiFi',
    description: 'Sistema continuo de tanques de tinta original, escáner y copiado.',
    category: 'Oficina',
    costPrice: 175.00,
    salePrice: 260.00,
    stock: 5,
    minStock: 3,
    unit: 'Und',
    isActive: true,
    createdAt: '2026-02-05'
  },
  {
    id: 'prod-7',
    sku: 'RES-PAP-A4',
    barcode: '7891001007',
    name: 'Resma de Papel Carta / A4 75g (500 Hojas)',
    description: 'Papel bond ultra blanco multipropósito para impresión láser/inkjet.',
    category: 'Oficina',
    costPrice: 3.20,
    salePrice: 5.50,
    stock: 45,
    minStock: 15,
    unit: 'Paquete',
    isActive: true,
    createdAt: '2026-02-10'
  },
  {
    id: 'prod-8',
    sku: 'AUR-JBL-T510',
    barcode: '7891001008',
    name: 'Audífonos Bluetooth JBL Tune 510BT Pure Bass',
    description: 'Hasta 40 horas de batería con carga rápida por USB-C.',
    category: 'Audio',
    costPrice: 24.00,
    salePrice: 42.00,
    stock: 2, // LOW STOCK
    minStock: 5,
    unit: 'Und',
    isActive: true,
    createdAt: '2026-02-12'
  }
];

export const initialCustomers: Customer[] = [
  {
    id: 'cust-1',
    docType: 'RIF',
    docNumber: 'J-31456789-2',
    name: 'Inversiones y Servicios Horizonte C.A.',
    email: 'compras@inversioneshorizonte.com',
    phone: '+58 414-3219988',
    address: 'Av. Francisco de Miranda, Edif. Centro Seguros, Chacao',
    creditLimit: 3000.00,
    currentDebt: 865.00,
    notes: 'Cliente corporativo recurrente. Plazo usual: 30 días.',
    createdAt: '2026-01-10'
  },
  {
    id: 'cust-2',
    docType: 'RIF',
    docNumber: 'J-50123987-1',
    name: 'Corporación Médica San Rafael S.A.',
    email: 'administracion@medicasanrafael.com',
    phone: '+58 424-9081122',
    address: 'Urb. Santa Mónica, Calle Teresa de la Parra, Quinta Médica',
    creditLimit: 5000.00,
    currentDebt: 1240.00,
    notes: 'Facturación a crédito autorizada hasta $5,000.',
    createdAt: '2026-01-15'
  },
  {
    id: 'cust-3',
    docType: 'DNI',
    docNumber: 'V-18456123',
    name: 'Dr. Alejandro Peña Vargas',
    email: 'alejandro.pena@clinicaweb.com',
    phone: '+58 412-7773344',
    address: 'Residencias Las Trinitarias, Apto 5-B, El Cafetal',
    creditLimit: 1000.00,
    currentDebt: 0.00,
    notes: 'Cliente solvente, siempre paga de contado o puntual.',
    createdAt: '2026-02-01'
  },
  {
    id: 'cust-4',
    docType: 'NIT',
    docNumber: '900876543-1',
    name: 'TecnoGlobal Soluciones IT',
    email: 'finanzas@tecnoglobal.com',
    phone: '+1 (555) 782-1190',
    address: 'Zona Industrial Los Prados, Galpón 12-B',
    creditLimit: 4000.00,
    currentDebt: 450.00,
    notes: 'Tiene saldo pendiente con vencimiento próximo.',
    createdAt: '2026-02-10'
  },
  {
    id: 'cust-5',
    docType: 'DNI',
    docNumber: 'V-24589012',
    name: 'María Valentina Rosas',
    email: 'valen.rosas@gmail.com',
    phone: '+58 416-8899001',
    address: 'Calle Los Jardines, Casa 44, El Paraíso',
    creditLimit: 500.00,
    currentDebt: 0.00,
    notes: 'Compradora al detal.',
    createdAt: '2026-02-15'
  }
];

export const getRecentDate = (daysAgo: number, timeStr = '11:20:00'): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day} ${timeStr}`;
};

export const getRecentDayOnly = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const initialSales: Sale[] = [
  {
    id: 'sale-1',
    saleNumber: 'VTA-2026-0101',
    receiptNumber: 'REC-2026-0101',
    date: getRecentDate(5, '10:14:22'),
    customerId: 'cust-3',
    customerName: 'Dr. Alejandro Peña Vargas',
    customerDoc: 'V-18456123',
    customerPhone: '+58 412-7773344',
    customerAddress: 'Residencias Las Trinitarias, Apto 5-B',
    items: [
      {
        productId: 'prod-1',
        sku: 'LAP-HP-01',
        name: 'Laptop HP Pavilion 15.6" Core i5 16GB 512GB SSD',
        quantity: 1,
        unitCost: 420.00,
        unitPrice: 620.00,
        discountPercent: 0,
        subtotal: 620.00,
        taxAmount: 99.20,
        total: 719.20
      },
      {
        productId: 'prod-4',
        sku: 'MOU-LOG-G502',
        name: 'Mouse Gamer Logitech G502 HERO Sensor 25K',
        quantity: 1,
        unitCost: 32.00,
        unitPrice: 58.00,
        discountPercent: 0,
        subtotal: 58.00,
        taxAmount: 9.28,
        total: 67.28
      }
    ],
    subtotal: 678.00,
    taxRate: 16,
    taxAmount: 108.48,
    discountAmount: 0,
    total: 786.48,
    paymentType: 'contado',
    paymentMethod: 'tarjeta',
    paymentReference: 'POS-AUTH-982134',
    cashierName: 'Carlos Mendoza',
    notes: 'Venta presencial en tienda. Factura cancelada.',
    status: 'completada'
  },
  {
    id: 'sale-2',
    saleNumber: 'VTA-2026-0102',
    receiptNumber: 'REC-2026-0102',
    date: getRecentDate(4, '14:30:10'),
    customerId: 'cust-1',
    customerName: 'Inversiones y Servicios Horizonte C.A.',
    customerDoc: 'J-31456789-2',
    customerPhone: '+58 414-3219988',
    customerAddress: 'Av. Francisco de Miranda, Edif. Centro Seguros',
    items: [
      {
        productId: 'prod-2',
        sku: 'MON-LG-27',
        name: 'Monitor LG UltraGear 27" IPS 144Hz 1ms',
        quantity: 2,
        unitCost: 160.00,
        unitPrice: 245.00,
        discountPercent: 5,
        subtotal: 465.50,
        taxAmount: 74.48,
        total: 539.98
      },
      {
        productId: 'prod-3',
        sku: 'TEC-MEC-RGB',
        name: 'Teclado Mecánico Inalámbrico Redragon Switch Blue',
        quantity: 2,
        unitCost: 28.00,
        unitPrice: 49.99,
        discountPercent: 0,
        subtotal: 99.98,
        taxAmount: 16.00,
        total: 115.98
      },
      {
        productId: 'prod-6',
        sku: 'IMP-EPS-L3250',
        name: 'Impresora Multifuncional Epson EcoTank L3250 WiFi',
        quantity: 1,
        unitCost: 175.00,
        unitPrice: 260.00,
        discountPercent: 0,
        subtotal: 260.00,
        taxAmount: 41.60,
        total: 301.60
      }
    ],
    subtotal: 825.48,
    taxRate: 16,
    taxAmount: 132.08,
    discountAmount: 24.50,
    total: 957.56,
    paymentType: 'credito',
    paymentMethod: 'transferencia',
    cashierName: 'Carlos Mendoza',
    notes: 'Crédito empresarial a 30 días según Orden de Compra OC-492.',
    status: 'completada',
    creditDetails: {
      dueDate: getRecentDayOnly(-20),
      initialPayment: 92.56,
      balanceDue: 865.00,
      installmentsCount: 2,
      status: 'parcial'
    }
  },
  {
    id: 'sale-3',
    saleNumber: 'VTA-2026-0103',
    receiptNumber: 'REC-2026-0103',
    date: getRecentDate(3, '11:20:45'),
    customerId: 'cust-2',
    customerName: 'Corporación Médica San Rafael S.A.',
    customerDoc: 'J-50123987-1',
    customerPhone: '+58 424-9081122',
    customerAddress: 'Urb. Santa Mónica, Calle Teresa de la Parra',
    items: [
      {
        productId: 'prod-1',
        sku: 'LAP-HP-01',
        name: 'Laptop HP Pavilion 15.6" Core i5 16GB 512GB SSD',
        quantity: 2,
        unitCost: 420.00,
        unitPrice: 620.00,
        discountPercent: 0,
        subtotal: 1240.00,
        taxAmount: 198.40,
        total: 1438.40
      }
    ],
    subtotal: 1240.00,
    taxRate: 16,
    taxAmount: 198.40,
    discountAmount: 0,
    total: 1438.40,
    paymentType: 'credito',
    paymentMethod: 'transferencia',
    cashierName: 'Carlos Mendoza',
    notes: 'Entrega para departamento de administración hospitalaria.',
    status: 'completada',
    creditDetails: {
      dueDate: getRecentDayOnly(-15),
      initialPayment: 198.40,
      balanceDue: 1240.00,
      installmentsCount: 2,
      status: 'pendiente'
    }
  },
  {
    id: 'sale-4',
    saleNumber: 'VTA-2026-0104',
    receiptNumber: 'REC-2026-0104',
    date: getRecentDate(1, '16:45:00'),
    customerId: 'cust-4',
    customerName: 'TecnoGlobal Soluciones IT',
    customerDoc: '900876543-1',
    customerPhone: '+1 (555) 782-1190',
    customerAddress: 'Zona Industrial Los Prados, Galpón 12-B',
    items: [
      {
        productId: 'prod-5',
        sku: 'SSD-KIN-1TB',
        name: 'Unidad Estado Sólido Kingston NV2 1TB NVMe M.2',
        quantity: 5,
        unitCost: 45.00,
        unitPrice: 72.50,
        discountPercent: 0,
        subtotal: 362.50,
        taxAmount: 58.00,
        total: 420.50
      },
      {
        productId: 'prod-7',
        sku: 'RES-PAP-A4',
        name: 'Resma de Papel Carta / A4 75g (500 Hojas)',
        quantity: 5,
        unitCost: 3.20,
        unitPrice: 5.50,
        discountPercent: 0,
        subtotal: 27.50,
        taxAmount: 4.40,
        total: 31.90
      }
    ],
    subtotal: 390.00,
    taxRate: 16,
    taxAmount: 62.40,
    discountAmount: 0,
    total: 452.40,
    paymentType: 'credito',
    paymentMethod: 'transferencia',
    cashierName: 'Carlos Mendoza',
    notes: 'Crédito a 15 días.',
    status: 'completada',
    creditDetails: {
      dueDate: getRecentDayOnly(-10),
      initialPayment: 2.40,
      balanceDue: 450.00,
      installmentsCount: 1,
      status: 'pendiente'
    }
  },
  {
    id: 'sale-5',
    saleNumber: 'VTA-2026-0105',
    receiptNumber: 'REC-2026-0105',
    date: getRecentDate(0, '09:30:15'),
    customerId: 'cust-5',
    customerName: 'María Valentina Rosas',
    customerDoc: 'V-24589012',
    customerPhone: '+58 416-8899001',
    customerAddress: 'Calle Los Jardines, Casa 44',
    items: [
      {
        productId: 'prod-8',
        sku: 'AUR-JBL-T510',
        name: 'Audífonos Bluetooth JBL Tune 510BT Pure Bass',
        quantity: 1,
        unitCost: 24.00,
        unitPrice: 42.00,
        discountPercent: 0,
        subtotal: 42.00,
        taxAmount: 6.72,
        total: 48.72
      }
    ],
    subtotal: 42.00,
    taxRate: 16,
    taxAmount: 6.72,
    discountAmount: 0,
    total: 48.72,
    paymentType: 'contado',
    paymentMethod: 'zelle_pagomovil',
    paymentReference: 'PM-9988231',
    cashierName: 'Carlos Mendoza',
    notes: 'Pago Móvil verificado en cuenta.',
    status: 'completada'
  }
];

export const initialDebts: DebtRecord[] = [
  {
    id: 'debt-1',
    saleId: 'sale-2',
    saleNumber: 'VTA-2026-0102',
    customerId: 'cust-1',
    customerName: 'Inversiones y Servicios Horizonte C.A.',
    customerDoc: 'J-31456789-2',
    customerPhone: '+58 414-3219988',
    customerEmail: 'compras@inversioneshorizonte.com',
    issueDate: getRecentDayOnly(4),
    dueDate: getRecentDayOnly(-20),
    totalAmount: 957.56,
    paidAmount: 92.56,
    balanceDue: 865.00,
    status: 'parcial',
    notes: 'Abono inicial de $92.56 entregado al momento de la venta.',
    payments: [
      {
        id: 'pay-1',
        debtId: 'debt-1',
        receiptNumber: 'RCP-2026-0031',
        date: '2026-03-01 14:35:00',
        amount: 92.56,
        paymentMethod: 'transferencia',
        referenceNumber: 'TR-8812904',
        bank: 'Banesco Panamá',
        recordedBy: 'Carlos Mendoza',
        notes: 'Anticipo inicial convenido al retirar equipos.',
        previousBalance: 957.56,
        remainingBalance: 865.00
      }
    ]
  },
  {
    id: 'debt-2',
    saleId: 'sale-3',
    saleNumber: 'VTA-2026-0103',
    customerId: 'cust-2',
    customerName: 'Corporación Médica San Rafael S.A.',
    customerDoc: 'J-50123987-1',
    customerPhone: '+58 424-9081122',
    customerEmail: 'administracion@medicasanrafael.com',
    issueDate: '2026-03-02',
    dueDate: '2026-03-25',
    totalAmount: 1438.40,
    paidAmount: 198.40,
    balanceDue: 1240.00,
    status: 'pendiente',
    notes: 'Pago de saldo acordado para el 25 de marzo tras firma de gerencia médica.',
    payments: [
      {
        id: 'pay-2',
        debtId: 'debt-2',
        receiptNumber: 'RCP-2026-0032',
        date: '2026-03-02 11:25:00',
        amount: 198.40,
        paymentMethod: 'transferencia',
        referenceNumber: 'REF-BCV-77123',
        bank: 'Banco Mercantil',
        recordedBy: 'Carlos Mendoza',
        notes: 'Pago del IVA correspondiente al retiro.',
        previousBalance: 1438.40,
        remainingBalance: 1240.00
      }
    ]
  },
  {
    id: 'debt-3',
    saleId: 'sale-4',
    saleNumber: 'VTA-2026-0104',
    customerId: 'cust-4',
    customerName: 'TecnoGlobal Soluciones IT',
    customerDoc: '900876543-1',
    customerPhone: '+1 (555) 782-1190',
    customerEmail: 'finanzas@tecnoglobal.com',
    issueDate: '2026-03-04',
    dueDate: '2026-03-19',
    totalAmount: 452.40,
    paidAmount: 2.40,
    balanceDue: 450.00,
    status: 'pendiente',
    notes: 'Crédito de 15 días continuos.',
    payments: []
  }
];

export const initialInventoryMovements: InventoryMovement[] = [
  {
    id: 'mov-1',
    date: '2026-02-28 10:14:22',
    productId: 'prod-1',
    productName: 'Laptop HP Pavilion 15.6" Core i5 16GB 512GB SSD',
    sku: 'LAP-HP-01',
    type: 'salida_venta',
    quantity: -1,
    previousStock: 15,
    newStock: 14,
    referenceDoc: 'VTA-2026-0101',
    reason: 'Venta por mostrador POS',
    user: 'Carlos Mendoza'
  },
  {
    id: 'mov-2',
    date: '2026-02-28 10:14:22',
    productId: 'prod-4',
    productName: 'Mouse Gamer Logitech G502 HERO Sensor 25K',
    sku: 'MOU-LOG-G502',
    type: 'salida_venta',
    quantity: -1,
    previousStock: 20,
    newStock: 19,
    referenceDoc: 'VTA-2026-0101',
    reason: 'Venta por mostrador POS',
    user: 'Carlos Mendoza'
  },
  {
    id: 'mov-3',
    date: '2026-03-01 14:30:10',
    productId: 'prod-2',
    productName: 'Monitor LG UltraGear 27" IPS 144Hz 1ms',
    sku: 'MON-LG-27',
    type: 'salida_venta',
    quantity: -2,
    previousStock: 10,
    newStock: 8,
    referenceDoc: 'VTA-2026-0102',
    reason: 'Venta a crédito empresarial',
    user: 'Carlos Mendoza'
  },
  {
    id: 'mov-4',
    date: '2026-03-02 11:20:45',
    productId: 'prod-1',
    productName: 'Laptop HP Pavilion 15.6" Core i5 16GB 512GB SSD',
    sku: 'LAP-HP-01',
    type: 'salida_venta',
    quantity: -2,
    previousStock: 16,
    newStock: 14,
    referenceDoc: 'VTA-2026-0103',
    reason: 'Venta corporativa a crédito',
    user: 'Carlos Mendoza'
  },
  {
    id: 'mov-5',
    date: '2026-03-04 16:45:00',
    productId: 'prod-5',
    productName: 'Unidad Estado Sólido Kingston NV2 1TB NVMe M.2',
    sku: 'SSD-KIN-1TB',
    type: 'salida_venta',
    quantity: -5,
    previousStock: 8,
    newStock: 3,
    referenceDoc: 'VTA-2026-0104',
    reason: 'Venta mayorista a crédito',
    user: 'Carlos Mendoza'
  }
];

export const initialUsers: ERPUser[] = [
  {
    id: 'user-admin',
    username: 'ADMIN',
    password: '1234',
    name: 'Administrador General',
    role: 'admin',
    isActive: true,
    permissions: {
      dashboard: true,
      pos: true,
      cobranzas: true,
      inventario: true,
      consultas: true,
      clientes: true,
      usuarios: true,
      configuracion: true
    },
    createdAt: '2026-01-01'
  },
  {
    id: 'user-cajero',
    username: 'CAJERO',
    password: '123',
    name: 'Operador de Punto de Venta',
    role: 'cajero',
    isActive: true,
    permissions: {
      dashboard: false,
      pos: true,
      cobranzas: false,
      inventario: false,
      consultas: true,
      clientes: true,
      usuarios: false,
      configuracion: false
    },
    createdAt: '2026-01-05'
  },
  {
    id: 'user-cobranzas',
    username: 'COBRADOR',
    password: '123',
    name: 'Gestor de Cobranzas y Créditos',
    role: 'cobrador',
    isActive: true,
    permissions: {
      dashboard: true,
      pos: false,
      cobranzas: true,
      inventario: false,
      consultas: true,
      clientes: true,
      usuarios: false,
      configuracion: false
    },
    createdAt: '2026-01-10'
  }
];

