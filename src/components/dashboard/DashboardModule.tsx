import React, { useMemo } from 'react';
import {
  TrendingUp,
  Wallet,
  AlertTriangle,
  ShoppingCart,
  Boxes,
  Clock,
  ArrowUpRight,
  Receipt,
  CheckCircle2,
  DollarSign,
  BarChart3,
  Calendar
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';
import { useERP } from '../../context/ERPContext';
import { StockAlertToast } from './StockAlertToast';


interface DashboardModuleProps {
  onNavigate: (tab: any) => void;
}

export const DashboardModule: React.FC<DashboardModuleProps> = ({ onNavigate }) => {
  const { sales, debts, products, formatMoney, openReceiptModal, settings } = useERP();

  // Aggregate Metrics
  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];

    let salesTotal = 0;
    let salesToday = 0;
    sales.forEach(s => {
      if (s.status === 'completada') {
        salesTotal += s.total;
        if (s.date.startsWith(todayStr)) {
          salesToday += s.total;
        }
      }
    });

    let pendingReceivables = 0;
    let overdueReceivables = 0;
    let collectedTotal = 0;

    debts.forEach(d => {
      pendingReceivables += d.balanceDue;
      collectedTotal += d.paidAmount;
      if (d.balanceDue > 0 && d.dueDate < todayStr) {
        overdueReceivables += d.balanceDue;
      }
    });

    const lowStockProducts = products.filter(p => p.stock <= p.minStock);

    return {
      salesTotal,
      salesToday,
      pendingReceivables,
      overdueReceivables,
      collectedTotal,
      lowStockCount: lowStockProducts.length,
      lowStockProducts: lowStockProducts.slice(0, 4)
    };
  }, [sales, debts, products]);

  // Urgent pending debts
  const urgentDebts = useMemo(() => {
    return debts
      .filter(d => d.balanceDue > 0)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .slice(0, 5);
  }, [debts]);

  // Recent sales
  const recentSales = useMemo(() => {
    return sales.slice(0, 5);
  }, [sales]);

  // Last 7 days sales data for Recharts BarChart
  const last7DaysData = useMemo(() => {
    const days: Array<{
      dateKey: string;
      displayDay: string;
      dayOfWeek: string;
      fullDateLabel: string;
      total: number;
      contado: number;
      credito: number;
      count: number;
      isToday: boolean;
    }> = [];

    const now = new Date();
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;

      const isToday = i === 0;
      const dayOfWeek = dayNames[d.getDay()];
      const displayDay = isToday ? 'Hoy' : `${dayOfWeek} ${d.getDate()}`;
      const fullDateLabel = `${d.getDate()} de ${monthNames[d.getMonth()]}, ${year}`;

      days.push({
        dateKey,
        displayDay,
        dayOfWeek,
        fullDateLabel,
        total: 0,
        contado: 0,
        credito: 0,
        count: 0,
        isToday
      });
    }

    // Accumulate sales for each day
    sales.forEach(sale => {
      if (sale.status === 'completada') {
        const saleDay = sale.date.slice(0, 10);
        const targetDay = days.find(d => d.dateKey === saleDay);
        if (targetDay) {
          targetDay.total = Number((targetDay.total + sale.total).toFixed(2));
          if (sale.paymentType === 'credito') {
            targetDay.credito = Number((targetDay.credito + sale.total).toFixed(2));
          } else {
            targetDay.contado = Number((targetDay.contado + sale.total).toFixed(2));
          }
          targetDay.count += 1;
        }
      }
    });

    return days;
  }, [sales]);

  const total7Days = useMemo(() => {
    return last7DaysData.reduce((acc, d) => acc + d.total, 0);
  }, [last7DaysData]);

  const total7DaysCount = useMemo(() => {
    return last7DaysData.reduce((acc, d) => acc + d.count, 0);
  }, [last7DaysData]);

  const maxSaleDay = useMemo(() => {
    const sorted = [...last7DaysData].sort((a, b) => b.total - a.total);
    return sorted[0];
  }, [last7DaysData]);

  // Custom Tooltip for Recharts BarChart
  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs space-y-1.5 font-sans z-50">
          <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-1">
            <span className="font-semibold text-slate-300">{data.fullDateLabel}</span>
            <span
              className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                data.isToday ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              {data.isToday ? 'HOY' : data.dayOfWeek}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 font-mono">
            <span className="text-slate-400 font-sans">Total Facturado:</span>
            <span className="font-bold text-sm text-indigo-400 tabular-nums">
              {formatMoney(data.total)}
            </span>
          </div>

          <div className="text-[11px] text-slate-400 space-y-0.5 pt-1 border-t border-slate-800/80 font-mono">
            <div className="flex justify-between">
              <span className="font-sans">De Contado:</span>
              <span className="tabular-nums text-emerald-400">{formatMoney(data.contado)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-sans">A Crédito:</span>
              <span className="tabular-nums text-amber-400">{formatMoney(data.credito)}</span>
            </div>
            <div className="flex justify-between pt-0.5 text-slate-400 border-t border-slate-800/50">
              <span className="font-sans">N° Comprobantes:</span>
              <span className="tabular-nums text-slate-200">
                {data.count} {data.count === 1 ? 'ticket' : 'tickets'}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* WELCOME BANNER & QUICK ACTIONS */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider block mb-1">
            Sistema ERP de Gestión Comercial
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            {settings.tradeName}
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Control integral de cobranzas a crédito, emisión de recibos y facturación POS, catálogo de inventario y auditoría de ventas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => onNavigate('pos')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Abrir POS / Cobrar</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('cobranzas')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95"
          >
            <Wallet className="w-4 h-4" />
            <span>Gestor Cobranzas</span>
          </button>
        </div>
      </div>

      {/* TOP 4 KEY METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Facturación Total</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-mono text-xl font-bold text-slate-900 tabular-nums">
            {formatMoney(stats.salesTotal)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>Hoy en mostrador:</span>
            <span className="font-mono font-semibold text-emerald-700">{formatMoney(stats.salesToday)}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Cuentas por Cobrar</span>
            <Wallet className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="font-mono text-xl font-bold text-indigo-700 tabular-nums">
            {formatMoney(stats.pendingReceivables)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>Cartera en mora:</span>
            <span className="font-mono font-semibold text-rose-600">{formatMoney(stats.overdueReceivables)}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Cobrado / Recuperado</span>
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="font-mono text-xl font-bold text-slate-900 tabular-nums">
            {formatMoney(stats.collectedTotal)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Abonos con recibos oficiales</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Alerta Inventario</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="font-mono text-xl font-bold text-amber-600 tabular-nums">
            {stats.lowStockCount} productos
          </div>
          <span className="text-[11px] text-amber-700 mt-1 block">Requieren reposición de compra</span>
        </div>
      </div>

      {/* RECHARTS BAR CHART: VENTAS ÚLTIMOS 7 DÍAS */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
        {/* Chart Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 tracking-tight">
                Ventas de los Últimos 7 Días
              </h3>
              <p className="text-xs text-slate-500">
                Evolución diaria de facturación y volumen de operaciones registradas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="text-left sm:text-right">
              <span className="text-[10px] text-slate-400 font-sans block">Total 7 Días</span>
              <span className="font-bold text-sm text-slate-900 tabular-nums">
                {formatMoney(total7Days)}
              </span>
            </div>
            <div className="h-6 w-px bg-slate-200 hidden sm:block" />
            <div className="text-left sm:text-right hidden sm:block">
              <span className="text-[10px] text-slate-400 font-sans block">Transacciones</span>
              <span className="font-bold text-sm text-indigo-600 tabular-nums">
                {total7DaysCount} {total7DaysCount === 1 ? 'venta' : 'ventas'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('consultas')}
              className="px-2.5 py-1.5 text-[11px] font-sans font-semibold text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Ver consultas</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Recharts BarChart Canvas */}
        <div className="h-64 sm:h-72 w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={last7DaysData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="displayDay"
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                tick={{ fill: '#64748b', fontSize: 11 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={v => `${settings.currencySymbol}${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
              />
              <Tooltip content={<CustomBarTooltip />} cursor={{ fill: '#f8fafc' }} />
              <Bar
                dataKey="total"
                radius={[6, 6, 0, 0]}
                maxBarSize={48}
              >
                {last7DaysData.map((entry, index) => (
                  <Cell
                    key={`bar-cell-${index}`}
                    fill={entry.isToday ? '#4338ca' : entry.total > 0 ? '#4f46e5' : '#e2e8f0'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart Legend & Peak Day footer */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#4f46e5] inline-block" />
              <span>Días anteriores</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#4338ca] inline-block" />
              <span className="font-semibold text-slate-700">Día en curso (Hoy)</span>
            </span>
          </div>

          {maxSaleDay && maxSaleDay.total > 0 && (
            <span className="font-mono">
              Mayor venta:{' '}
              <strong className="text-slate-800 font-sans">{maxSaleDay.displayDay}</strong> con{' '}
              <strong className="text-indigo-600 tabular-nums">{formatMoney(maxSaleDay.total)}</strong>
            </span>
          )}
        </div>
      </div>

      {/* TWO COLUMN WORKSPACE: URGENT DEBTORS & RECENT TRANSACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Cartera de Cobranzas Prioritarias (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Cuentas por Cobrar Prioritarias
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('cobranzas')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
              >
                <span>Ver cartera completa</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {urgentDebts.map(debt => {
                const todayStr = new Date().toISOString().split('T')[0];
                const isOverdue = debt.dueDate < todayStr;

                return (
                  <div key={debt.id} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-900">{debt.customerName}</span>
                        <span className="font-mono text-[10px] text-slate-400">({debt.saleNumber})</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span className={`font-mono ${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-600'}`}>
                          Vence: {debt.dueDate} {isOverdue ? '⚠️ Vencido' : ''}
                        </span>
                        <span>·</span>
                        <span>Doc: {debt.customerDoc}</span>
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-3">
                      <div>
                        <span className="font-mono font-bold text-xs text-indigo-700 block tabular-nums">
                          {formatMoney(debt.balanceDue)}
                        </span>
                        <span className="text-[10px] text-slate-400 tabular-nums">
                          De {formatMoney(debt.totalAmount)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => onNavigate('cobranzas')}
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Abonar
                      </button>
                    </div>
                  </div>
                );
              })}

              {urgentDebts.length === 0 && (
                <div className="py-8 text-center text-slate-400 text-xs">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-1 text-emerald-500" />
                  <p className="font-medium text-slate-700">Todas las cuentas por cobrar están al día</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-4 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Saldos deudores sincronizados con el emisor de recibos</span>
            <span className="font-mono font-bold text-slate-700">{urgentDebts.length} cuentas activas</span>
          </div>
        </div>

        {/* RIGHT: Últimas Ventas & Alertas de Stock (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Recent Sales Widget */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">Últimas Ventas Emitidas</h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('consultas')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
              >
                <span>Ver historial</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {recentSales.map(sale => (
                <div key={sale.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-slate-900">{sale.saleNumber}</span>
                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                          sale.paymentType === 'credito'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {sale.paymentType}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{sale.customerName}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold tabular-nums text-slate-900">
                      {formatMoney(sale.total)}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        openReceiptModal({
                          type: 'sale',
                          sale: sale
                        })
                      }
                      className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded"
                      title="Ver recibo / ticket"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock Alert Box */}
          {stats.lowStockProducts.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Reponer Existencias Críticas</span>
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate('inventario')}
                  className="text-xs font-semibold text-amber-800 hover:text-amber-950 underline"
                >
                  Ir a inventario
                </button>
              </div>

              <div className="space-y-1.5 text-xs">
                {stats.lowStockProducts.map(p => (
                  <div key={p.id} className="flex justify-between items-center text-amber-900">
                    <span className="truncate pr-2">{p.name}</span>
                    <span className="font-mono font-bold tabular-nums whitespace-nowrap">
                      {p.stock} / {p.minStock} {p.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stock Critical Toast Alert */}
      <StockAlertToast
        products={products}
        onNavigateToInventory={() => onNavigate('inventario')}
      />
    </div>
  );
};

