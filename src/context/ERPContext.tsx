import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  CompanySettings,
  Customer,
  DebtPayment,
  DebtRecord,
  InventoryMovement,
  PaymentMethod,
  Product,
  Sale,
  SaleItem,
  ERPUser,
  UserPermissions
} from '../types/erp';
import {
  initialCompanySettings,
  initialCustomers,
  initialDebts,
  initialInventoryMovements,
  initialProducts,
  initialSales,
  initialUsers
} from '../data/initialData';

const STORAGE_KEY = 'NOVA_ERP_DATA_V1';

export interface ReceiptModalData {
  isOpen: boolean;
  type: 'sale' | 'payment';
  sale?: Sale;
  payment?: DebtPayment;
  debt?: DebtRecord;
}

interface CreateSaleParams {
  customerId: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    discountPercent?: number;
  }>;
  paymentType: 'contado' | 'credito';
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  notes?: string;
  creditDetails?: {
    dueDate: string;
    initialPayment: number;
    installmentsCount: number;
  };
}

interface ERPContextType {
  products: Product[];
  customers: Customer[];
  sales: Sale[];
  debts: DebtRecord[];
  inventoryMovements: InventoryMovement[];
  settings: CompanySettings;
  receiptModal: ReceiptModalData;
  openReceiptModal: (data: Omit<ReceiptModalData, 'isOpen'>) => void;
  closeReceiptModal: () => void;
  formatMoney: (amount: number, showSecondary?: boolean) => string;
  createSale: (params: CreateSaleParams) => { sale: Sale; debt?: DebtRecord; payment?: DebtPayment };
  cancelSale: (saleId: string, reason: string) => boolean;
  registerDebtPayment: (params: {
    debtId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    referenceNumber: string;
    bank?: string;
    notes?: string;
  }) => { payment: DebtPayment; debt: DebtRecord } | null;
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Product;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (productId: string, quantityDelta: number, reason: string, type: 'ajuste_positivo' | 'ajuste_negativo') => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'currentDebt'>) => Customer;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (id: string) => void;
  updateSettings: (settings: CompanySettings) => void;
  resetToDemoData: () => void;
  clearDatabaseToZero: (scope: 'all' | 'transactions_only') => void;
  exportBackup: () => string;
  exportDatabaseToJSON: (customFilename?: string) => string;
  importBackup: (jsonData: string) => boolean;
  users: ERPUser[];
  currentUser: ERPUser | null;
  login: (username: string, password: string) => { success: boolean; message?: string };
  logout: () => void;
  addUser: (user: Omit<ERPUser, 'id' | 'createdAt'>) => ERPUser;
  updateUser: (user: ERPUser) => void;
  deleteUser: (id: string) => boolean;
  hasPermission: (module: keyof UserPermissions) => boolean;
}

const ERPContext = createContext<ERPContextType | undefined>(undefined);

export const ERPProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_products`);
      return saved !== null ? JSON.parse(saved) : initialProducts;
    } catch {
      return initialProducts;
    }
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_customers`);
      return saved !== null ? JSON.parse(saved) : initialCustomers;
    } catch {
      return initialCustomers;
    }
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_sales`);
      return saved !== null ? JSON.parse(saved) : initialSales;
    } catch {
      return initialSales;
    }
  });

  const [debts, setDebts] = useState<DebtRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_debts`);
      return saved !== null ? JSON.parse(saved) : initialDebts;
    } catch {
      return initialDebts;
    }
  });

  const [inventoryMovements, setInventoryMovements] = useState<InventoryMovement[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_movements`);
      return saved !== null ? JSON.parse(saved) : initialInventoryMovements;
    } catch {
      return initialInventoryMovements;
    }
  });

  const [settings, setSettings] = useState<CompanySettings>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_settings`);
      if (saved) {
        const parsed: CompanySettings = JSON.parse(saved);
        if (
          parsed.tradeName === 'NovaERP Soluciones' ||
          parsed.tradeName === 'CobranzaERP' ||
          parsed.companyName === 'DISTRIBUIDORA & COMERCIALIZADORA NOVA C.A.'
        ) {
          parsed.tradeName = 'AuraCore ERP';
          parsed.companyName = 'AURACORE SISTEMAS Y TECNOLOGÍA C.A.';
          localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(parsed));
        }
        return parsed;
      }
      return initialCompanySettings;
    } catch {
      return initialCompanySettings;
    }
  });

  const [users, setUsers] = useState<ERPUser[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_users`);
      return saved !== null ? JSON.parse(saved) : initialUsers;
    } catch {
      return initialUsers;
    }
  });

  const [currentUser, setCurrentUser] = useState<ERPUser | null>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_current_user`);
      if (saved) {
        return JSON.parse(saved);
      }
      return initialUsers[0]; // Default logged-in user is ADMIN (Clave: 1234)
    } catch {
      return initialUsers[0];
    }
  });

  const [receiptModal, setReceiptModal] = useState<ReceiptModalData>({
    isOpen: false,
    type: 'sale'
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_products`, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_customers`, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_sales`, JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_debts`, JSON.stringify(debts));
  }, [debts]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_movements`, JSON.stringify(inventoryMovements));
  }, [inventoryMovements]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${STORAGE_KEY}_current_user`, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(`${STORAGE_KEY}_current_user`);
    }
  }, [currentUser]);

  // Global console shortcut for resetting database from browser console
  useEffect(() => {
    (window as any).resetERPDatabase = () => {
      clearDatabaseToZero('all');
      console.log('✅ Base de datos reseteada a 0. Recargando...');
      window.location.reload();
    };
  }, []);

  const openReceiptModal = (data: Omit<ReceiptModalData, 'isOpen'>) => {
    setReceiptModal({
      isOpen: true,
      ...data
    });
  };

  const closeReceiptModal = () => {
    setReceiptModal(prev => ({ ...prev, isOpen: false }));
  };

  const formatMoney = (amount: number, showSecondary = false): string => {
    const primary = `${settings.currencySymbol} ${amount.toLocaleString('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;

    if (showSecondary && settings.secondaryCurrencySymbol && settings.exchangeRate > 0) {
      const converted = amount * settings.exchangeRate;
      const secondary = `${settings.secondaryCurrencySymbol} ${converted.toLocaleString('es-ES', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;
      return `${primary} (${secondary})`;
    }

    return primary;
  };

  const createSale = (params: CreateSaleParams) => {
    const customer = customers.find(c => c.id === params.customerId);
    const saleId = `sale-${Date.now()}`;
    const nextSeq = sales.length + 106;
    const saleNum = `VTA-2026-${String(nextSeq).padStart(4, '0')}`;
    const receiptNum = `REC-2026-${String(nextSeq).padStart(4, '0')}`;
    const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 19);

    let subtotal = 0;
    const items: SaleItem[] = [];
    const newMovements: InventoryMovement[] = [];

    // Process items and stock updates
    const updatedProducts = products.map(prod => {
      const itemReq = params.items.find(i => i.productId === prod.id);
      if (itemReq) {
        const qty = itemReq.quantity;
        const unitPrice = itemReq.unitPrice || prod.salePrice;
        const discountPct = itemReq.discountPercent || 0;
        const itemSubtotal = qty * unitPrice * (1 - discountPct / 100);
        const itemTax = itemSubtotal * (settings.taxRatePercent / 100);
        const itemTotal = itemSubtotal + itemTax;

        subtotal += itemSubtotal;

        items.push({
          productId: prod.id,
          sku: prod.sku,
          name: prod.name,
          quantity: qty,
          unitCost: prod.costPrice,
          unitPrice: unitPrice,
          discountPercent: discountPct,
          subtotal: Number(itemSubtotal.toFixed(2)),
          taxAmount: Number(itemTax.toFixed(2)),
          total: Number(itemTotal.toFixed(2))
        });

        // Add inventory movement
        newMovements.push({
          id: `mov-${Date.now()}-${prod.id}`,
          date: nowIso,
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          type: 'salida_venta',
          quantity: -qty,
          previousStock: prod.stock,
          newStock: Math.max(0, prod.stock - qty),
          referenceDoc: saleNum,
          reason: `Venta POS ${saleNum}`,
          user: settings.cashierName
        });

        return {
          ...prod,
          stock: Math.max(0, prod.stock - qty)
        };
      }
      return prod;
    });

    const taxAmount = Number((subtotal * (settings.taxRatePercent / 100)).toFixed(2));
    const total = Number((subtotal + taxAmount).toFixed(2));

    let createdDebt: DebtRecord | undefined = undefined;
    let initialPaymentReceipt: DebtPayment | undefined = undefined;

    if (params.paymentType === 'credito' && params.creditDetails) {
      const initialPay = Number(params.creditDetails.initialPayment || 0);
      const balanceDue = Number(Math.max(0, total - initialPay).toFixed(2));
      const debtId = `debt-${Date.now()}`;

      const paymentsList: DebtPayment[] = [];

      if (initialPay > 0) {
        initialPaymentReceipt = {
          id: `pay-${Date.now()}`,
          debtId: debtId,
          receiptNumber: `RCP-2026-${String(debts.length + 33).padStart(4, '0')}`,
          date: nowIso,
          amount: initialPay,
          paymentMethod: params.paymentMethod,
          referenceNumber: params.paymentReference || 'ANTICIPO-INICIAL',
          recordedBy: settings.cashierName,
          notes: 'Anticipo/Abono inicial en punto de venta',
          previousBalance: total,
          remainingBalance: balanceDue
        };
        paymentsList.push(initialPaymentReceipt);
      }

      createdDebt = {
        id: debtId,
        saleId: saleId,
        saleNumber: saleNum,
        customerId: params.customerId,
        customerName: customer ? customer.name : 'Cliente General',
        customerDoc: customer ? `${customer.docType}-${customer.docNumber}` : 'S/D',
        customerPhone: customer?.phone || '',
        customerEmail: customer?.email,
        issueDate: nowIso.split(' ')[0],
        dueDate: params.creditDetails.dueDate,
        totalAmount: total,
        paidAmount: initialPay,
        balanceDue: balanceDue,
        status: balanceDue === 0 ? 'saldado' : initialPay > 0 ? 'parcial' : 'pendiente',
        payments: paymentsList,
        notes: `Crédito a ${params.creditDetails.installmentsCount || 1} cuota(s).`
      };

      // Update debt in list
      setDebts(prev => [createdDebt!, ...prev]);

      // Update customer currentDebt
      if (customer) {
        setCustomers(prev =>
          prev.map(c =>
            c.id === customer.id ? { ...c, currentDebt: Number((c.currentDebt + balanceDue).toFixed(2)) } : c
          )
        );
      }
    }

    const newSale: Sale = {
      id: saleId,
      saleNumber: saleNum,
      receiptNumber: receiptNum,
      date: nowIso,
      customerId: params.customerId,
      customerName: customer ? customer.name : 'Cliente Mostrador',
      customerDoc: customer ? `${customer.docType}-${customer.docNumber}` : 'Sin Documento',
      customerPhone: customer?.phone,
      customerAddress: customer?.address,
      items: items,
      subtotal: Number(subtotal.toFixed(2)),
      taxRate: settings.taxRatePercent,
      taxAmount: taxAmount,
      discountAmount: 0,
      total: total,
      paymentType: params.paymentType,
      paymentMethod: params.paymentMethod,
      paymentReference: params.paymentReference,
      cashierName: settings.cashierName,
      notes: params.notes,
      status: 'completada',
      creditDetails:
        params.paymentType === 'credito' && params.creditDetails
          ? {
              dueDate: params.creditDetails.dueDate,
              initialPayment: params.creditDetails.initialPayment,
              balanceDue: Number(Math.max(0, total - (params.creditDetails.initialPayment || 0)).toFixed(2)),
              installmentsCount: params.creditDetails.installmentsCount,
              status: Math.max(0, total - (params.creditDetails.initialPayment || 0)) === 0 ? 'saldado' : 'parcial'
            }
          : undefined
    };

    // Apply state updates
    setProducts(updatedProducts);
    setInventoryMovements(prev => [...newMovements, ...prev]);
    setSales(prev => [newSale, ...prev]);

    return { sale: newSale, debt: createdDebt, payment: initialPaymentReceipt };
  };

  const cancelSale = (saleId: string, reason: string): boolean => {
    const saleToCancel = sales.find(s => s.id === saleId);
    if (!saleToCancel || saleToCancel.status === 'anulada') return false;

    const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const returnMovements: InventoryMovement[] = [];

    // Reverse stock
    setProducts(prevProds =>
      prevProds.map(prod => {
        const itemInSale = saleToCancel.items.find(i => i.productId === prod.id);
        if (itemInSale) {
          const restoredStock = prod.stock + itemInSale.quantity;
          returnMovements.push({
            id: `mov-cancel-${Date.now()}-${prod.id}`,
            date: nowIso,
            productId: prod.id,
            productName: prod.name,
            sku: prod.sku,
            type: 'anulacion_venta',
            quantity: itemInSale.quantity,
            previousStock: prod.stock,
            newStock: restoredStock,
            referenceDoc: saleToCancel.saleNumber,
            reason: `Anulación de venta: ${reason}`,
            user: settings.cashierName
          });
          return { ...prod, stock: restoredStock };
        }
        return prod;
      })
    );

    setInventoryMovements(prev => [...returnMovements, ...prev]);

    // Update sale status
    setSales(prev =>
      prev.map(s =>
        s.id === saleId
          ? {
              ...s,
              status: 'anulada',
              cancellationReason: reason
            }
          : s
      )
    );

    // If sale had active debt, cancel or adjust it
    const linkedDebt = debts.find(d => d.saleId === saleId);
    if (linkedDebt) {
      setDebts(prev =>
        prev.map(d =>
          d.id === linkedDebt.id
            ? {
                ...d,
                status: 'saldado',
                balanceDue: 0,
                notes: `Venta anulada: ${reason}. Saldo revertido.`
              }
            : d
        )
      );

      // Decrement customer's currentDebt
      setCustomers(prev =>
        prev.map(c =>
          c.id === linkedDebt.customerId
            ? {
                ...c,
                currentDebt: Math.max(0, Number((c.currentDebt - linkedDebt.balanceDue).toFixed(2)))
              }
            : c
        )
      );
    }

    return true;
  };

  const registerDebtPayment = (params: {
    debtId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    referenceNumber: string;
    bank?: string;
    notes?: string;
  }) => {
    const debt = debts.find(d => d.id === params.debtId);
    if (!debt || debt.balanceDue <= 0) return null;

    const payAmount = Math.min(params.amount, debt.balanceDue);
    const newPaid = Number((debt.paidAmount + payAmount).toFixed(2));
    const newBalance = Number((debt.balanceDue - payAmount).toFixed(2));
    const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const receiptSeq = debts.reduce((acc, d) => acc + d.payments.length, 0) + 40;
    const receiptNum = `RCP-2026-${String(receiptSeq).padStart(4, '0')}`;

    const newPayment: DebtPayment = {
      id: `pay-${Date.now()}`,
      debtId: debt.id,
      receiptNumber: receiptNum,
      date: nowIso,
      amount: payAmount,
      paymentMethod: params.paymentMethod,
      referenceNumber: params.referenceNumber,
      bank: params.bank,
      recordedBy: settings.cashierName,
      notes: params.notes || 'Abono a cuenta por cobrar',
      previousBalance: debt.balanceDue,
      remainingBalance: newBalance
    };

    const updatedDebt: DebtRecord = {
      ...debt,
      paidAmount: newPaid,
      balanceDue: newBalance,
      status: newBalance === 0 ? 'saldado' : 'parcial',
      payments: [...debt.payments, newPayment]
    };

    setDebts(prev => prev.map(d => (d.id === debt.id ? updatedDebt : d)));

    // Update customer debt balance
    setCustomers(prev =>
      prev.map(c =>
        c.id === debt.customerId
          ? {
              ...c,
              currentDebt: Math.max(0, Number((c.currentDebt - payAmount).toFixed(2)))
            }
          : c
      )
    );

    return { payment: newPayment, debt: updatedDebt };
  };

  const addProduct = (productData: Omit<Product, 'id' | 'createdAt'>): Product => {
    const newId = `prod-${Date.now()}`;
    const newProduct: Product = {
      ...productData,
      id: newId,
      createdAt: new Date().toISOString().split('T')[0]
    };

    // Log initial stock movement
    if (newProduct.stock > 0) {
      const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const mov: InventoryMovement = {
        id: `mov-init-${newId}`,
        date: nowIso,
        productId: newId,
        productName: newProduct.name,
        sku: newProduct.sku,
        type: 'entrada_compra',
        quantity: newProduct.stock,
        previousStock: 0,
        newStock: newProduct.stock,
        referenceDoc: 'INVENTARIO-INICIAL',
        reason: 'Registro y alta de nuevo producto en catálogo',
        user: settings.cashierName
      };
      setInventoryMovements(prev => [mov, ...prev]);
    }

    setProducts(prev => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = (updated: Product) => {
    setProducts(prev => prev.map(p => (p.id === updated.id ? updated : p)));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const adjustStock = (
    productId: string,
    quantityDelta: number,
    reason: string,
    type: 'ajuste_positivo' | 'ajuste_negativo'
  ) => {
    const targetProduct = products.find(p => p.id === productId);
    if (!targetProduct) return;

    const qty = Math.abs(quantityDelta);
    const newStock = type === 'ajuste_positivo'
      ? targetProduct.stock + qty
      : Math.max(0, targetProduct.stock - qty);

    const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const mov: InventoryMovement = {
      id: `mov-adj-${Date.now()}`,
      date: nowIso,
      productId: targetProduct.id,
      productName: targetProduct.name,
      sku: targetProduct.sku,
      type: type,
      quantity: type === 'ajuste_positivo' ? qty : -qty,
      previousStock: targetProduct.stock,
      newStock: newStock,
      referenceDoc: `AJUSTE-${Date.now().toString().slice(-4)}`,
      reason: reason || 'Ajuste manual de inventario',
      user: settings.cashierName
    };

    setProducts(prev => prev.map(p => (p.id === productId ? { ...p, stock: newStock } : p)));
    setInventoryMovements(prev => [mov, ...prev]);
  };

  const addCustomer = (customerData: Omit<Customer, 'id' | 'createdAt' | 'currentDebt'>): Customer => {
    const newCustomer: Customer = {
      ...customerData,
      id: `cust-${Date.now()}`,
      currentDebt: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setCustomers(prev => [newCustomer, ...prev]);
    return newCustomer;
  };

  const updateCustomer = (updated: Customer) => {
    setCustomers(prev => prev.map(c => (c.id === updated.id ? updated : c)));
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
  };

  const updateSettings = (newSettings: CompanySettings) => {
    setSettings(newSettings);
  };

  const resetToDemoData = () => {
    setProducts(initialProducts);
    setCustomers(initialCustomers);
    setSales(initialSales);
    setDebts(initialDebts);
    setInventoryMovements(initialInventoryMovements);
    setSettings(initialCompanySettings);
  };

  const clearDatabaseToZero = (scope: 'all' | 'transactions_only') => {
    setSales([]);
    setDebts([]);
    setInventoryMovements([]);
    localStorage.setItem(`${STORAGE_KEY}_sales`, JSON.stringify([]));
    localStorage.setItem(`${STORAGE_KEY}_debts`, JSON.stringify([]));
    localStorage.setItem(`${STORAGE_KEY}_movements`, JSON.stringify([]));

    if (scope === 'transactions_only') {
      setCustomers(prev => prev.map(c => ({ ...c, currentDebt: 0 })));
      localStorage.setItem(`${STORAGE_KEY}_customers`, JSON.stringify(customers.map(c => ({ ...c, currentDebt: 0 }))));
    } else {
      setProducts([]);
      setCustomers([]);
      localStorage.setItem(`${STORAGE_KEY}_products`, JSON.stringify([]));
      localStorage.setItem(`${STORAGE_KEY}_customers`, JSON.stringify([]));
    }
  };

  const exportBackup = (): string => {
    const backup = {
      system: 'AuraCore ERP',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      summary: {
        totalProducts: products.length,
        totalCustomers: customers.length,
        totalSales: sales.length,
        totalDebts: debts.length,
        totalMovements: inventoryMovements.length,
        totalUsers: users.length
      },
      products,
      customers,
      sales,
      debts,
      inventoryMovements,
      users,
      settings
    };
    return JSON.stringify(backup, null, 2);
  };

  const exportDatabaseToJSON = (customFilename?: string): string => {
    const jsonStr = exportBackup();
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}`;
    const filename = customFilename || `AuraCore_ERP_Respaldo_Completo_${dateStr}.json`;

    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return filename;
  };

  const importBackup = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.products && parsed.sales && parsed.debts && parsed.settings) {
        setProducts(parsed.products);
        setCustomers(parsed.customers || []);
        setSales(parsed.sales);
        setDebts(parsed.debts);
        setInventoryMovements(parsed.inventoryMovements || []);
        setSettings(parsed.settings);
        if (parsed.users && Array.isArray(parsed.users) && parsed.users.length > 0) {
          setUsers(parsed.users);
          localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(parsed.users));
        }

        localStorage.setItem(`${STORAGE_KEY}_products`, JSON.stringify(parsed.products));
        localStorage.setItem(`${STORAGE_KEY}_customers`, JSON.stringify(parsed.customers || []));
        localStorage.setItem(`${STORAGE_KEY}_sales`, JSON.stringify(parsed.sales));
        localStorage.setItem(`${STORAGE_KEY}_debts`, JSON.stringify(parsed.debts));
        localStorage.setItem(`${STORAGE_KEY}_movements`, JSON.stringify(parsed.inventoryMovements || []));
        localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(parsed.settings));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };


  const login = (username: string, password: string): { success: boolean; message?: string } => {
    const user = users.find(u => u.username.toUpperCase() === username.trim().toUpperCase());
    if (!user) {
      return { success: false, message: 'Usuario no encontrado.' };
    }
    if (!user.isActive) {
      return { success: false, message: 'El usuario está inactivo. Contacte al administrador.' };
    }
    if (user.password !== password) {
      return { success: false, message: 'Contraseña incorrecta.' };
    }
    setCurrentUser(user);
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const hasPermission = (module: keyof UserPermissions): boolean => {
    if (!currentUser) return false;
    // ADMIN has absolute access to every module
    if (currentUser.role === 'admin' || currentUser.username.toUpperCase() === 'ADMIN') {
      return true;
    }
    return !!currentUser.permissions[module];
  };

  const addUser = (userData: Omit<ERPUser, 'id' | 'createdAt'>): ERPUser => {
    const newUser: ERPUser = {
      ...userData,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setUsers(prev => [...prev, newUser]);
    return newUser;
  };

  const updateUser = (updated: ERPUser) => {
    setUsers(prev => prev.map(u => (u.id === updated.id ? updated : u)));
    if (currentUser && currentUser.id === updated.id) {
      setCurrentUser(updated);
    }
  };

  const deleteUser = (id: string): boolean => {
    const target = users.find(u => u.id === id);
    if (!target) return false;
    if (target.username.toUpperCase() === 'ADMIN') return false; // ADMIN cannot be deleted
    setUsers(prev => prev.filter(u => u.id !== id));
    return true;
  };

  return (
    <ERPContext.Provider
      value={{
        products,
        customers,
        sales,
        debts,
        inventoryMovements,
        settings,
        receiptModal,
        openReceiptModal,
        closeReceiptModal,
        formatMoney,
        createSale,
        cancelSale,
        registerDebtPayment,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        updateSettings,
        resetToDemoData,
        clearDatabaseToZero,
        exportBackup,
        exportDatabaseToJSON,
        importBackup,
        users,
        currentUser,
        login,
        logout,
        addUser,
        updateUser,
        deleteUser,
        hasPermission
      }}
    >
      {children}
    </ERPContext.Provider>
  );
};

export const useERP = (): ERPContextType => {
  const context = useContext(ERPContext);
  if (!context) {
    throw new Error('useERP must be used within an ERPProvider');
  }
  return context;
};
