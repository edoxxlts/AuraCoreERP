import React, { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  ArrowUpDown,
  History,
  TrendingUp,
  Boxes,
  FileSpreadsheet,
  Edit2,
  Trash2,
  PlusCircle,
  MinusCircle,
  CheckCircle,
  FolderOpen
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { Product } from '../../types/erp';

export const InventarioModule: React.FC = () => {
  const {
    products,
    inventoryMovements,
    addProduct,
    updateProduct,
    deleteProduct,
    adjustStock,
    formatMoney,
    settings
  } = useERP();

  const [activeTab, setActiveTab] = useState<'catalogo' | 'kardex'>('catalogo');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  // New / Edit Product Modal
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodSku, setProdSku] = useState('');
  const [prodBarcode, setProdBarcode] = useState('');
  const [prodName, setProdName] = useState('');
  const [prodDescription, setProdDescription] = useState('');
  const [prodCategory, setProdCategory] = useState('Tecnología');
  const [prodCostPrice, setProdCostPrice] = useState<number>(0);
  const [prodSalePrice, setProdSalePrice] = useState<number>(0);
  const [prodStock, setProdStock] = useState<number>(0);
  const [prodMinStock, setProdMinStock] = useState<number>(5);
  const [prodUnit, setProdUnit] = useState('Und');

  // Quick Adjustment Modal
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustTargetProduct, setAdjustTargetProduct] = useState<Product | null>(null);
  const [adjustQty, setAdjustQty] = useState<number>(1);
  const [adjustType, setAdjustType] = useState<'ajuste_positivo' | 'ajuste_negativo'>('ajuste_positivo');
  const [adjustReason, setAdjustReason] = useState('Entrada por reposición de mercancía');

  // Category list
  const categories = useMemo(() => {
    const setCats = new Set(products.map(p => p.category));
    return ['todos', ...Array.from(setCats)];
  }, [products]);

  // Inventory stats
  const stats = useMemo(() => {
    const totalItems = products.reduce((acc, p) => acc + p.stock, 0);
    const totalCostValue = products.reduce((acc, p) => acc + p.stock * p.costPrice, 0);
    const totalSaleValue = products.reduce((acc, p) => acc + p.stock * p.salePrice, 0);
    const lowStockCount = products.filter(p => p.stock <= p.minStock).length;

    return {
      totalProducts: products.length,
      totalItems,
      totalCostValue,
      totalSaleValue,
      lowStockCount
    };
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barcode.includes(searchQuery);

      const matchesCat = selectedCategory === 'todos' || p.category === selectedCategory;
      const matchesLowStock = !onlyLowStock || p.stock <= p.minStock;

      return matchesSearch && matchesCat && matchesLowStock;
    });
  }, [products, searchQuery, selectedCategory, onlyLowStock]);

  const handleOpenNewProduct = () => {
    setEditingProduct(null);
    setProdSku(`SKU-${Date.now().toString().slice(-5)}`);
    setProdBarcode(`789${Date.now().toString().slice(-7)}`);
    setProdName('');
    setProdDescription('');
    setProdCategory('Tecnología');
    setProdCostPrice(10);
    setProdSalePrice(15);
    setProdStock(10);
    setProdMinStock(5);
    setProdUnit('Und');
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProdSku(prod.sku);
    setProdBarcode(prod.barcode);
    setProdName(prod.name);
    setProdDescription(prod.description);
    setProdCategory(prod.category);
    setProdCostPrice(prod.costPrice);
    setProdSalePrice(prod.salePrice);
    setProdStock(prod.stock);
    setProdMinStock(prod.minStock);
    setProdUnit(prod.unit);
    setShowProductModal(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim() || !prodSku.trim()) return;

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        sku: prodSku.trim(),
        barcode: prodBarcode.trim(),
        name: prodName.trim(),
        description: prodDescription.trim(),
        category: prodCategory.trim(),
        costPrice: Number(prodCostPrice) || 0,
        salePrice: Number(prodSalePrice) || 0,
        stock: Number(prodStock) || 0,
        minStock: Number(prodMinStock) || 1,
        unit: prodUnit
      });
    } else {
      addProduct({
        sku: prodSku.trim(),
        barcode: prodBarcode.trim(),
        name: prodName.trim(),
        description: prodDescription.trim(),
        category: prodCategory.trim(),
        costPrice: Number(prodCostPrice) || 0,
        salePrice: Number(prodSalePrice) || 0,
        stock: Number(prodStock) || 0,
        minStock: Number(prodMinStock) || 1,
        unit: prodUnit,
        isActive: true
      });
    }

    setShowProductModal(false);
  };

  const handleOpenAdjust = (prod: Product) => {
    setAdjustTargetProduct(prod);
    setAdjustQty(1);
    setAdjustType('ajuste_positivo');
    setAdjustReason('Entrada por reposición de stock');
    setShowAdjustModal(true);
  };

  const handleConfirmAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustTargetProduct || adjustQty <= 0) return;

    adjustStock(adjustTargetProduct.id, adjustQty, adjustReason, adjustType);
    setShowAdjustModal(false);
  };

  const handleExportCSV = () => {
    const headers = 'SKU,Código Barra,Nombre,Categoría,Costo,Precio Venta,Stock,Mínimo,Unidad\n';
    const rows = products
      .map(
        p =>
          `"${p.sku}","${p.barcode}","${p.name.replace(/"/g, '""')}","${p.category}",${p.costPrice},${p.salePrice},${p.stock},${p.minStock},"${p.unit}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventario_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* HEADER & TOP TABS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-indigo-600" />
            <span>Control de Inventario & Almacén</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestión de existencias, umbrales de stock mínimo, valorización de activos y kardex.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Exportar CSV</span>
          </button>

          <button
            type="button"
            onClick={handleOpenNewProduct}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Productos en Catálogo</span>
            <Boxes className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="font-mono text-xl font-bold text-slate-900 tabular-nums">
            {stats.totalProducts} ítems
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">{stats.totalItems} unidades totales</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Alertas de Bajo Stock</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="font-mono text-xl font-bold text-amber-600 tabular-nums">
            {stats.lowStockCount} alertas
          </div>
          <span className="text-[11px] text-amber-600 mt-0.5 block">Por debajo del stock mínimo</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Valorización Costo</span>
            <TrendingUp className="w-4 h-4 text-slate-600" />
          </div>
          <div className="font-mono text-xl font-bold text-slate-800 tabular-nums">
            {formatMoney(stats.totalCostValue)}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Costo de adquisición activo</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Valor de Venta Estimado</span>
            <Package className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-mono text-xl font-bold text-emerald-700 tabular-nums">
            {formatMoney(stats.totalSaleValue)}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Ingreso potencial bruto</span>
        </div>
      </div>

      {/* VIEW SWITCH TABS (CATÁLOGO vs KARDEX) */}
      <div className="border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('catalogo')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'catalogo'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Catálogo & Stock Actual ({products.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('kardex')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'kardex'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Kardex / Historial de Movimientos ({inventoryMovements.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'catalogo' ? (
        /* ================= TAB 1: PRODUCT CATALOG & STOCK ================= */
        <div className="space-y-4">
          {/* SEARCH & FILTERS */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar por SKU, código de barras o nombre..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Category selector */}
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-lg px-3 py-2 font-medium focus:ring-2 focus:ring-indigo-500"
              >
                {categories.map(c => (
                  <option key={c} value={c} className="capitalize">
                    {c === 'todos' ? 'Todas las Categorías' : c}
                  </option>
                ))}
              </select>

              {/* Low stock toggle */}
              <button
                type="button"
                onClick={() => setOnlyLowStock(!onlyLowStock)}
                className={`px-3 py-2 text-xs font-medium rounded-lg border flex items-center gap-1.5 transition-colors ${
                  onlyLowStock
                    ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Solo Bajo Stock</span>
              </button>
            </div>
          </div>

          {/* TABLE OF PRODUCTS */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">SKU / Código</th>
                    <th className="py-3 px-4">Producto & Categoría</th>
                    <th className="py-3 px-4 text-right">Costo Unit.</th>
                    <th className="py-3 px-4 text-right">Precio Venta</th>
                    <th className="py-3 px-4 text-right">Margen</th>
                    <th className="py-3 px-4 text-right">Stock Actual</th>
                    <th className="py-3 px-4 text-center">Estado Stock</th>
                    <th className="py-3 px-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map(product => {
                    const margin = product.salePrice > 0
                      ? (((product.salePrice - product.costPrice) / product.salePrice) * 100).toFixed(1)
                      : '0';
                    const isLowStock = product.stock <= product.minStock;
                    const isOutOfStock = product.stock <= 0;

                    return (
                      <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-slate-900 block">{product.sku}</span>
                          <span className="font-mono text-[10px] text-slate-400">{product.barcode}</span>
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-900 block">{product.name}</span>
                          <span className="text-[11px] text-slate-500 capitalize">{product.category} • {product.unit}</span>
                        </td>

                        <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600">
                          {formatMoney(product.costPrice)}
                        </td>

                        <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-900">
                          {formatMoney(product.salePrice)}
                        </td>

                        <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-600 font-medium">
                          {margin}%
                        </td>

                        <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-sm">
                          <span className={isOutOfStock ? 'text-rose-600' : isLowStock ? 'text-amber-600' : 'text-slate-900'}>
                            {product.stock} {product.unit}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center">
                          {isOutOfStock ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                              Agotado
                            </span>
                          ) : isLowStock ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              Bajo Stock (mín. {product.minStock})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              Óptimo
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Stock Adjustment Button */}
                            <button
                              type="button"
                              onClick={() => handleOpenAdjust(product)}
                              className="p-1.5 text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                              title="Ajuste rápido de inventario (Entrada/Salida)"
                            >
                              <ArrowUpDown className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit Button */}
                            <button
                              type="button"
                              onClick={() => handleOpenEditProduct(product)}
                              className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                              title="Editar producto"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`¿Eliminar producto "${product.name}"?`)) {
                                  deleteProduct(product.id);
                                }
                              }}
                              className="p-1.5 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                              title="Eliminar producto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <Package className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                        <p className="font-medium text-slate-700 text-sm">No se encontraron productos en el inventario</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* ================= TAB 2: KARDEX MOVEMENTS ================= */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Libro Kardex de Movimientos</h3>
              <p className="text-xs text-slate-500">
                Auditoría detallada de entradas, salidas por ventas en POS y ajustes manuales.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500">
              Total Registros: {inventoryMovements.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Fecha y Hora</th>
                  <th className="py-3 px-4">Tipo Movimiento</th>
                  <th className="py-3 px-4">Producto</th>
                  <th className="py-3 px-4">Documento Ref.</th>
                  <th className="py-3 px-4 text-right">Cant. Movida</th>
                  <th className="py-3 px-4 text-right">Stock Anterior</th>
                  <th className="py-3 px-4 text-right">Nuevo Stock</th>
                  <th className="py-3 px-4">Motivo / Operador</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {inventoryMovements.map(mov => {
                  const isPositive = mov.quantity > 0;

                  return (
                    <tr key={mov.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 text-slate-600 tabular-nums">
                        {mov.date}
                      </td>

                      <td className="py-3 px-4 font-sans">
                        {mov.type === 'salida_venta' ? (
                          <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[11px] font-semibold">
                            Salida Venta POS
                          </span>
                        ) : mov.type === 'anulacion_venta' ? (
                          <span className="text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[11px] font-semibold">
                            Reverso Anulación
                          </span>
                        ) : mov.type === 'entrada_compra' ? (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-semibold">
                            Entrada Compra
                          </span>
                        ) : (
                          <span className="text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold">
                            Ajuste Manual
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-sans">
                        <span className="font-semibold text-slate-900 block">{mov.productName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{mov.sku}</span>
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {mov.referenceDoc}
                      </td>

                      <td className="py-3 px-4 text-right font-bold tabular-nums">
                        <span className={isPositive ? 'text-emerald-600' : 'text-rose-600'}>
                          {isPositive ? `+${mov.quantity}` : mov.quantity}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right text-slate-500 tabular-nums">
                        {mov.previousStock}
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-slate-900 tabular-nums">
                        {mov.newStock}
                      </td>

                      <td className="py-3 px-4 font-sans text-slate-600">
                        <span>{mov.reason}</span>
                        <span className="text-[10px] text-slate-400 block">Por: {mov.user}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT PRODUCT MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingProduct ? 'Editar Producto del Catálogo' : 'Nuevo Producto de Inventario'}
              </h3>
              <button
                type="button"
                onClick={() => setShowProductModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Código SKU *</label>
                  <input
                    type="text"
                    required
                    value={prodSku}
                    onChange={e => setProdSku(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-2 font-mono uppercase focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Código de Barras *</label>
                  <input
                    type="text"
                    required
                    value={prodBarcode}
                    onChange={e => setProdBarcode(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-2 font-mono focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre Comercial del Producto *</label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={e => setProdName(e.target.value)}
                  placeholder="Ej: Impresora Láser HP LaserJet Pro"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 font-medium focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Categoría</label>
                  <input
                    type="text"
                    value={prodCategory}
                    onChange={e => setProdCategory(e.target.value)}
                    placeholder="Tecnología, Oficina..."
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-2 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unidad de Medida</label>
                  <select
                    value={prodUnit}
                    onChange={e => setProdUnit(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-2 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Und">Unidad (Und)</option>
                    <option value="Caja">Caja</option>
                    <option value="Paquete">Paquete</option>
                    <option value="Kg">Kilogramo (Kg)</option>
                    <option value="Lt">Litro (Lt)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Costo de Compra ({settings.currencySymbol})</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={prodCostPrice}
                    onChange={e => setProdCostPrice(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-2 font-mono tabular-nums focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Precio de Venta al Público ({settings.currencySymbol}) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={prodSalePrice}
                    onChange={e => setProdSalePrice(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-2 font-mono tabular-nums font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Stock Actual</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={prodStock}
                    onChange={e => setProdStock(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-2 font-mono tabular-nums focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Umbral Mínimo de Alerta</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={prodMinStock}
                    onChange={e => setProdMinStock(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-2 font-mono tabular-nums focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs"
                >
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK ADJUSTMENT MODAL */}
      {showAdjustModal && adjustTargetProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Ajuste Manual de Existencias</h3>
              <button
                type="button"
                onClick={() => setShowAdjustModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmAdjust} className="p-5 space-y-3.5 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <p className="font-semibold text-slate-900">{adjustTargetProduct.name}</p>
                <p className="text-[11px] text-slate-500 font-mono">
                  SKU: {adjustTargetProduct.sku} • Stock Actual: {adjustTargetProduct.stock} {adjustTargetProduct.unit}
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tipo de Ajuste</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType('ajuste_positivo')}
                    className={`py-2 px-3 rounded-lg border font-semibold flex items-center justify-center gap-1.5 ${
                      adjustType === 'ajuste_positivo'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4 text-emerald-600" />
                    <span>Entrada (+)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('ajuste_negativo')}
                    className={`py-2 px-3 rounded-lg border font-semibold flex items-center justify-center gap-1.5 ${
                      adjustType === 'ajuste_negativo'
                        ? 'border-rose-600 bg-rose-50 text-rose-800'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <MinusCircle className="w-4 h-4 text-rose-600" />
                    <span>Salida (-)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cantidad a Ajustar</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustQty}
                  onChange={e => setAdjustQty(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 font-mono text-base font-bold focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Motivo / Razón del Ajuste</label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={e => setAdjustReason(e.target.value)}
                  placeholder="Ej: Reposición de proveedor, merma, corrección..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs"
                >
                  Aplicar Ajuste
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
