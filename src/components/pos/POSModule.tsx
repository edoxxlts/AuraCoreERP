import React, { useState, useMemo } from 'react';
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  Banknote,
  Smartphone,
  ArrowRight,
  UserPlus,
  Receipt,
  AlertCircle,
  Package,
  CheckCircle2,
  Calendar,
  Layers,
  Percent
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { PaymentMethod } from '../../types/erp';

interface CartItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
}

export const POSModule: React.FC = () => {
  const { products, customers, createSale, openReceiptModal, formatMoney, settings, addCustomer } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [paymentType, setPaymentType] = useState<'contado' | 'credito'>('contado');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [paymentReference, setPaymentReference] = useState('');
  const [notes, setNotes] = useState('');

  // Credit parameters
  const defaultDueDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  }, []);
  const [dueDate, setDueDate] = useState<string>(defaultDueDate);
  const [initialPayment, setInitialPayment] = useState<number>(0);
  const [installmentsCount, setInstallmentsCount] = useState<number>(1);

  // Quick customer modal
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustDoc, setNewCustDoc] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustLimit, setNewCustLimit] = useState(1000);

  // Categories list
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return ['todos', ...Array.from(cats)];
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barcode.includes(searchQuery);

      const matchesCat = selectedCategory === 'todos' || p.category === selectedCategory;
      return matchesSearch && matchesCat && p.isActive;
    });
  }, [products, searchQuery, selectedCategory]);

  // Cart operations
  const addToCart = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product || product.stock <= 0) return;

    setCart(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map(item =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          productId,
          quantity: 1,
          unitPrice: product.salePrice,
          discountPercent: 0
        }
      ];
    });
  };

  const updateQuantity = (productId: string, qty: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }

    const clampedQty = Math.min(qty, product.stock);
    setCart(prev =>
      prev.map(item => (item.productId === productId ? { ...item, quantity: clampedQty } : item))
    );
  };

  const updateDiscount = (productId: string, discount: number) => {
    const clampedDiscount = Math.max(0, Math.min(100, discount));
    setCart(prev =>
      prev.map(item => (item.productId === productId ? { ...item, discountPercent: clampedDiscount } : item))
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setPaymentReference('');
    setNotes('');
    setInitialPayment(0);
  };

  // Cart financial summary
  const { subtotal, taxAmount, total } = useMemo(() => {
    let sub = 0;
    cart.forEach(item => {
      const line = item.quantity * item.unitPrice * (1 - item.discountPercent / 100);
      sub += line;
    });
    const tax = sub * (settings.taxRatePercent / 100);
    return {
      subtotal: sub,
      taxAmount: tax,
      total: sub + tax
    };
  }, [cart, settings.taxRatePercent]);

  // Handle checkout
  const handleCheckout = () => {
    if (cart.length === 0) return;
    if (!selectedCustomerId) {
      alert('Por favor seleccione un cliente para la venta.');
      return;
    }

    const { sale, debt, payment } = createSale({
      customerId: selectedCustomerId,
      items: cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountPercent: item.discountPercent
      })),
      paymentType,
      paymentMethod,
      paymentReference,
      notes,
      creditDetails:
        paymentType === 'credito'
          ? {
              dueDate,
              initialPayment: Number(initialPayment) || 0,
              installmentsCount: Number(installmentsCount) || 1
            }
          : undefined
    });

    // Clear cart and show receipt immediately
    clearCart();

    // Trigger print / view receipt
    openReceiptModal({
      type: 'sale',
      sale: sale,
      debt: debt,
      payment: payment
    });
  };

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim() || !newCustDoc.trim()) return;

    const created = addCustomer({
      name: newCustName.trim(),
      docType: 'RIF',
      docNumber: newCustDoc.trim(),
      phone: newCustPhone.trim(),
      email: `${newCustName.toLowerCase().replace(/\s+/g, '')}@ejemplo.com`,
      address: 'Ciudad Comercial',
      creditLimit: Number(newCustLimit) || 1000
    });

    setSelectedCustomerId(created.id);
    setShowNewCustomerModal(false);
    setNewCustName('');
    setNewCustDoc('');
    setNewCustPhone('');
  };

  const selectedCustomerObj = customers.find(c => c.id === selectedCustomerId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
      {/* LEFT COLUMN: Catalog & Fast Product Selector (7 cols) */}
      <div className="lg:col-span-7 flex flex-col space-y-4">
        {/* Search & Category Filter Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Escanear código de barra, SKU o buscar por nombre de producto..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors capitalize ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto max-h-[640px] pr-1">
          {filteredProducts.map(product => {
            const inCart = cart.find(c => c.productId === product.id);
            const isOutOfStock = product.stock <= 0;
            const isLowStock = product.stock > 0 && product.stock <= product.minStock;

            return (
              <div
                key={product.id}
                onClick={() => !isOutOfStock && addToCart(product.id)}
                className={`relative bg-white rounded-xl border p-3 flex flex-col justify-between transition-all select-none ${
                  isOutOfStock
                    ? 'opacity-50 border-slate-200 cursor-not-allowed bg-slate-50'
                    : 'border-slate-200 hover:border-indigo-400 hover:shadow-md cursor-pointer active:scale-[0.98]'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <span className="text-[10px] font-mono font-medium text-slate-400 uppercase truncate">
                      {product.sku}
                    </span>
                    {isOutOfStock ? (
                      <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                        Agotado
                      </span>
                    ) : (
                      <span
                        className={`text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded ${
                          isLowStock ? 'text-amber-700 bg-amber-50 font-bold' : 'text-slate-500 bg-slate-100'
                        }`}
                      >
                        Stock: {product.stock}
                      </span>
                    )}
                  </div>

                  <h4 className="font-semibold text-xs text-slate-800 line-clamp-2 leading-snug">
                    {product.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 capitalize">{product.category}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="font-mono font-bold text-sm text-slate-900 tabular-nums">
                    {formatMoney(product.salePrice)}
                  </span>

                  {inCart ? (
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white font-mono text-xs font-bold shadow-xs">
                      {inCart.quantity}
                    </span>
                  ) : (
                    <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                      <Plus className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {filteredProducts.length === 0 && (
            <div className="col-span-full py-12 text-center bg-white rounded-xl border border-slate-200 p-6">
              <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">No se encontraron productos</p>
              <p className="text-xs text-slate-400 mt-1">Pruebe ajustando los filtros de búsqueda o categoría.</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: POS Cart, Customer Selector & Fast Emission (5 cols) */}
      <div className="lg:col-span-5 flex flex-col bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden h-fit">
        {/* Cart Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-indigo-400" />
            <h3 className="font-semibold text-sm">Ticket Actual de Venta</h3>
            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
              {cart.reduce((a, b) => a + b.quantity, 0)} items
            </span>
          </div>

          {cart.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Vaciar</span>
            </button>
          )}
        </div>

        {/* Customer Select Row */}
        <div className="p-3 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide">
              Cliente Titular
            </label>
            <button
              type="button"
              onClick={() => setShowNewCustomerModal(true)}
              className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <UserPlus className="w-3 h-3" />
              <span>Nuevo Cliente</span>
            </button>
          </div>

          <select
            value={selectedCustomerId}
            onChange={e => setSelectedCustomerId(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            {customers.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.docType}: {c.docNumber}) - Deuda actual: {formatMoney(c.currentDebt)}
              </option>
            ))}
          </select>

          {selectedCustomerObj && selectedCustomerObj.currentDebt > 0 && (
            <div className="mt-1.5 flex items-center justify-between text-[11px] text-amber-800 bg-amber-50 px-2 py-1 rounded border border-amber-200">
              <span>⚠️ Saldo Deudor Pendiente:</span>
              <span className="font-mono font-bold tabular-nums">
                {formatMoney(selectedCustomerObj.currentDebt)}
              </span>
            </div>
          )}
        </div>

        {/* Cart Items List */}
        <div className="p-3 overflow-y-auto max-h-[260px] divide-y divide-slate-100 flex-1">
          {cart.map(item => {
            const product = products.find(p => p.id === item.productId);
            if (!product) return null;
            const lineTotal = item.quantity * item.unitPrice * (1 - item.discountPercent / 100);

            return (
              <div key={item.productId} className="py-2.5 flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h5 className="text-xs font-semibold text-slate-800 truncate">{product.name}</h5>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span className="font-mono tabular-nums">{formatMoney(item.unitPrice)}</span>
                    <span>·</span>
                    <label className="flex items-center gap-0.5 text-slate-400">
                      <span>Desc:</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={item.discountPercent || ''}
                        onChange={e => updateDiscount(item.productId, Number(e.target.value))}
                        placeholder="0"
                        className="w-10 px-1 py-0.5 text-[10px] bg-slate-100 border border-slate-200 rounded text-center font-mono"
                      />
                      <span>%</span>
                    </label>
                  </div>
                </div>

                {/* Qty increment / decrement */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-7 text-center font-mono text-xs font-semibold tabular-nums text-slate-900">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <div className="w-20 text-right">
                  <span className="font-mono font-bold text-xs text-slate-900 tabular-nums">
                    {formatMoney(lineTotal)}
                  </span>
                </div>
              </div>
            );
          })}

          {cart.length === 0 && (
            <div className="py-12 text-center text-slate-400">
              <ShoppingCart className="w-8 h-8 mx-auto mb-1 text-slate-300" />
              <p className="text-xs font-medium">El carrito de compra está vacío</p>
              <p className="text-[11px] text-slate-400">Haga clic en los productos del catálogo para agregar.</p>
            </div>
          )}
        </div>

        {/* Payment Condition & Cobranza Selector */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 space-y-3">
          {/* Mode Switch: Contado vs Crédito (Cobranza) */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-200 rounded-lg text-xs font-medium">
            <button
              type="button"
              onClick={() => setPaymentType('contado')}
              className={`py-1.5 rounded-md transition-all text-center ${
                paymentType === 'contado' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Venta de Contado
            </button>
            <button
              type="button"
              onClick={() => setPaymentType('credito')}
              className={`py-1.5 rounded-md transition-all text-center flex items-center justify-center gap-1 ${
                paymentType === 'credito'
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Venta a Crédito</span>
              <span className="text-[9px] bg-indigo-500 text-white px-1 py-0.2 rounded font-sans">Cobranza</span>
            </button>
          </div>

          {/* Payment Method Selector */}
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { id: 'efectivo', label: 'Efectivo', icon: Banknote },
              { id: 'tarjeta', label: 'Tarjeta', icon: CreditCard },
              { id: 'transferencia', label: 'Transfer.', icon: ArrowRight },
              { id: 'zelle_pagomovil', label: 'P. Móvil', icon: Smartphone }
            ].map(method => {
              const Icon = method.icon;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                  className={`py-1.5 px-1 rounded-md text-[11px] flex flex-col items-center justify-center gap-1 border transition-all ${
                    paymentMethod === method.id
                      ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900 font-semibold'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="truncate">{method.label}</span>
                </button>
              );
            })}
          </div>

          {/* If Credit Sale: Show Cobranza Terms (Due Date, Anticipo, Cuotas) */}
          {paymentType === 'credito' && (
            <div className="bg-indigo-50/70 border border-indigo-200 rounded-lg p-2.5 space-y-2 text-xs">
              <div className="flex items-center justify-between text-indigo-950 font-semibold text-[11px]">
                <span>Términos de Cobranza & Financiación:</span>
                <span className="text-[10px] text-indigo-700">Genera Cuenta x Cobrar</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-medium text-slate-600 block mb-0.5">
                    Anticipo Inicial ({settings.currencySymbol}):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={total}
                    value={initialPayment || ''}
                    onChange={e => setInitialPayment(Number(e.target.value))}
                    placeholder="0.00"
                    className="w-full bg-white border border-indigo-200 rounded px-2 py-1 text-xs font-mono tabular-nums text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-medium text-slate-600 block mb-0.5">
                    Fecha de Vencimiento:
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full bg-white border border-indigo-200 rounded px-2 py-1 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center text-[11px] pt-1 border-t border-indigo-200/60 text-indigo-900">
                <span>Saldo que quedará por cobrar:</span>
                <span className="font-mono font-bold tabular-nums">
                  {formatMoney(Math.max(0, total - (initialPayment || 0)))}
                </span>
              </div>
            </div>
          )}

          {/* Reference input */}
          <input
            type="text"
            value={paymentReference}
            onChange={e => setPaymentReference(e.target.value)}
            placeholder="N° de referencia o comprobante bancario (opcional)..."
            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-400"
          />

          {/* Calculations Block */}
          <div className="space-y-1 text-xs pt-1 border-t border-slate-200 font-mono">
            <div className="flex justify-between text-slate-600">
              <span className="font-sans">Subtotal Neto:</span>
              <span className="tabular-nums">{formatMoney(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span className="font-sans">IVA ({settings.taxRatePercent}%):</span>
              <span className="tabular-nums">{formatMoney(taxAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-900 font-bold text-base pt-1 border-t border-slate-300">
              <span className="font-sans">Total a Cobrar:</span>
              <span className="tabular-nums text-indigo-700">{formatMoney(total, true)}</span>
            </div>
          </div>

          {/* Emit Ticket Button */}
          <button
            type="button"
            disabled={cart.length === 0}
            onClick={handleCheckout}
            className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all ${
              cart.length === 0
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-[0.99] cursor-pointer'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Emitir Recibo & Procesar Venta</span>
          </button>
        </div>
      </div>

      {/* QUICK NEW CUSTOMER MODAL */}
      {showNewCustomerModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-slate-200 p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Registro Rápido de Cliente</h3>
              <button
                type="button"
                onClick={() => setShowNewCustomerModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3 mt-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Nombre o Razón Social *</label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={e => setNewCustName(e.target.value)}
                  placeholder="Ej: Inversiones Los Andes C.A."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Doc / RIF / NIT *</label>
                  <input
                    type="text"
                    required
                    value={newCustDoc}
                    onChange={e => setNewCustDoc(e.target.value)}
                    placeholder="Ej: J-40892110-1"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={newCustPhone}
                    onChange={e => setNewCustPhone(e.target.value)}
                    placeholder="Ej: +58 414 1234567"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Límite de Crédito ({settings.currencySymbol})</label>
                <input
                  type="number"
                  min="0"
                  value={newCustLimit}
                  onChange={e => setNewCustLimit(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewCustomerModal(false)}
                  className="px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
                >
                  Guardar y Seleccionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
