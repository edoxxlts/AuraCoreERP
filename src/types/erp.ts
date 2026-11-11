/**
 * ERP System Data Types
 */

export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  description: string;
  category: string;
  costPrice: number;
  salePrice: number;
  stock: number;
  minStock: number;
  unit: string; // 'Und', 'Caja', 'Kg', 'Paquete'
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Customer {
  id: string;
  docType: 'RIF' | 'NIT' | 'DNI' | 'RFC' | 'RUT' | 'Pasaporte';
  docNumber: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  creditLimit: number;
  currentDebt: number;
  notes?: string;
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  unitCost: number;
  unitPrice: number;
  discountPercent: number;
  subtotal: number;
  taxAmount: number;
  total: number;
}

export type PaymentMethod = 'efectivo' | 'tarjeta' | 'transferencia' | 'zelle_pagomovil' | 'mixto';

export interface Sale {
  id: string;
  saleNumber: string; // e.g., 'VTA-2026-0042'
  receiptNumber: string; // e.g., 'REC-2026-0042'
  date: string;
  customerId: string;
  customerName: string;
  customerDoc: string;
  customerPhone?: string;
  customerAddress?: string;
  items: SaleItem[];
  subtotal: number;
  taxRate: number; // e.g. 16 for 16%
  taxAmount: number;
  discountAmount: number;
  total: number;
  paymentType: 'contado' | 'credito';
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  cashierName: string;
  notes?: string;
  status: 'completada' | 'anulada';
  cancellationReason?: string;
  creditDetails?: {
    dueDate: string;
    initialPayment: number;
    balanceDue: number;
    installmentsCount: number;
    status: 'pendiente' | 'parcial' | 'saldado';
  };
}

export interface DebtPayment {
  id: string;
  debtId: string;
  receiptNumber: string; // Official Payment Receipt ID e.g. 'RCP-2026-0089'
  date: string;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber: string;
  bank?: string;
  recordedBy: string;
  notes?: string;
  previousBalance: number;
  remainingBalance: number;
}

export interface DebtRecord {
  id: string;
  saleId: string;
  saleNumber: string;
  customerId: string;
  customerName: string;
  customerDoc: string;
  customerPhone: string;
  customerEmail?: string;
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  status: 'pendiente' | 'parcial' | 'vencido' | 'saldado';
  payments: DebtPayment[];
  notes?: string;
}

export interface InventoryMovement {
  id: string;
  date: string;
  productId: string;
  productName: string;
  sku: string;
  type: 'entrada_compra' | 'salida_venta' | 'ajuste_positivo' | 'ajuste_negativo' | 'anulacion_venta';
  quantity: number;
  previousStock: number;
  newStock: number;
  referenceDoc: string;
  reason: string;
  user: string;
}

export interface CompanySettings {
  companyName: string;
  tradeName: string;
  taxId: string;
  phone: string;
  email: string;
  address: string;
  currencySymbol: string; // e.g. '$' or 'Bs.'
  currencyCode: string; // e.g. 'USD'
  secondaryCurrencySymbol: string; // e.g. 'Bs.'
  exchangeRate: number; // e.g. 36.5
  taxRatePercent: number; // e.g. 16
  receiptFooterNote: string;
  cashierName: string;
}

export interface UserPermissions {
  dashboard: boolean;
  pos: boolean;
  cobranzas: boolean;
  inventario: boolean;
  consultas: boolean;
  clientes: boolean;
  usuarios: boolean;
  configuracion: boolean;
}

export interface ERPUser {
  id: string;
  username: string; // e.g. 'ADMIN'
  password: string; // e.g. '1234'
  name: string;
  role: 'admin' | 'cajero' | 'cobrador' | 'almacen' | 'personalizado';
  isActive: boolean;
  permissions: UserPermissions;
  createdAt: string;
}

