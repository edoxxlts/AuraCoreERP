import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  AlertOctagon,
  X,
  ArrowRight
} from 'lucide-react';
import { Product } from '../../types/erp';

interface StockAlertToastProps {
  products: Product[];
  onNavigateToInventory: () => void;
}

interface ToastItem {
  id: string;
  product: Product;
  isOutOfStock: boolean;
  createdAt: number;
}

export const StockAlertToast: React.FC<StockAlertToastProps> = ({
  products,
  onNavigateToInventory
}) => {
  const [activeToasts, setActiveToasts] = useState<ToastItem[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [isMinimized, setIsMinimized] = useState(false);

  // Detect products that are critical (stock <= minStock) and haven't been dismissed
  useEffect(() => {
    const criticalList = products
      .filter(p => p.stock <= p.minStock && p.isActive)
      .slice(0, 3); // Show top 3 most critical items to avoid spamming the screen

    const newToasts: ToastItem[] = criticalList
      .filter(p => !dismissedIds.has(p.id))
      .map(p => ({
        id: p.id,
        product: p,
        isOutOfStock: p.stock <= 0,
        createdAt: Date.now()
      }));

    setActiveToasts(newToasts);
  }, [products, dismissedIds]);

  const dismissToast = (productId: string) => {
    setDismissedIds(prev => {
      const next = new Set(prev);
      next.add(productId);
      return next;
    });
  };

  const dismissAll = () => {
    setDismissedIds(prev => {
      const next = new Set(prev);
      activeToasts.forEach(t => next.add(t.id));
      return next;
    });
  };

  if (activeToasts.length === 0) {
    return null;
  }

  // Minimized pill in the bottom-right corner
  if (isMinimized) {
    return (
      <div className="fixed bottom-5 right-5 z-40 transition-all">
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-lg font-semibold text-xs transition-transform active:scale-95 cursor-pointer"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>{activeToasts.length} Alertas de Stock</span>
        </button>
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label="Alertas emergentes de stock crítico"
      className="fixed bottom-5 right-5 z-40 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none"
    >
      {activeToasts.map((toast, idx) => {
        const { product, isOutOfStock } = toast;

        return (
          <div
            key={toast.id}
            style={{ animation: 'slideInRight 0.3s ease-out forwards' }}
            className={`pointer-events-auto bg-white rounded-xl shadow-xl border overflow-hidden transition-all ${
              isOutOfStock
                ? 'border-rose-300 ring-1 ring-rose-200'
                : 'border-amber-300 ring-1 ring-amber-200'
            }`}
          >
            {/* Top status bar */}
            <div
              className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider flex items-center justify-between text-white ${
                isOutOfStock ? 'bg-rose-600' : 'bg-amber-600'
              }`}
            >
              <div className="flex items-center gap-1.5">
                {isOutOfStock ? (
                  <AlertOctagon className="w-3 h-3" />
                ) : (
                  <AlertTriangle className="w-3 h-3" />
                )}
                <span>{isOutOfStock ? 'Producto Agotado' : 'Alerta de Stock Crítico'}</span>
              </div>

              <div className="flex items-center gap-1">
                <span className="font-mono text-[9px] opacity-90">{product.sku}</span>
                <button
                  type="button"
                  onClick={() => dismissToast(product.id)}
                  className="p-0.5 hover:bg-black/20 rounded ml-1 transition-colors"
                  title="Cerrar notificación"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-3.5 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="font-bold text-xs text-slate-900 leading-snug line-clamp-2">
                    {product.name}
                  </h4>
                  <span className="text-[11px] text-slate-500 capitalize block mt-0.5">
                    Categoría: {product.category}
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`font-mono font-bold text-sm tabular-nums block ${
                      isOutOfStock ? 'text-rose-600' : 'text-amber-700'
                    }`}
                  >
                    {product.stock} {product.unit}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    Mínimo: {product.minStock} {product.unit}
                  </span>
                </div>
              </div>

              {/* Progress visual indicator */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    isOutOfStock
                      ? 'w-0 bg-rose-600'
                      : 'bg-amber-500'
                  }`}
                  style={{
                    width: `${Math.min(100, Math.max(5, (product.stock / product.minStock) * 100))}%`
                  }}
                />
              </div>

              {/* Action buttons */}
              <div className="pt-1 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setIsMinimized(true)}
                  className="text-[10px] text-slate-400 hover:text-slate-600 font-medium"
                >
                  Minimizar
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => dismissToast(product.id)}
                    className="px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-100 rounded-md font-medium transition-colors"
                  >
                    Descartar
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      dismissToast(product.id);
                      onNavigateToInventory();
                    }}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-md text-white font-semibold text-[11px] shadow-2xs transition-colors cursor-pointer ${
                      isOutOfStock
                        ? 'bg-rose-600 hover:bg-rose-700'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    <span>Reponer en Inventario</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Dismiss all footer if multiple toasts */}
      {activeToasts.length > 1 && (
        <div className="pointer-events-auto flex justify-end">
          <button
            type="button"
            onClick={dismissAll}
            className="px-2.5 py-1 bg-slate-900/80 hover:bg-slate-900 text-white text-[10px] font-medium rounded-lg shadow-sm backdrop-blur-xs transition-colors"
          >
            Descartar todas ({activeToasts.length})
          </button>
        </div>
      )}
    </div>
  );
};
