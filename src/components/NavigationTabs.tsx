import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Users,
  Wallet,
  FileSpreadsheet,
  BookUser,
  PiggyBank,
  FileDown,
} from 'lucide-react';

export type TabId =
  | 'dashboard'
  | 'ingresos'
  | 'gastos'
  | 'compras'
  | 'empleados'
  | 'saldos'
  | 'cuentas'
  | 'contactos'
  | 'ahorros'
  | 'exportar';

interface NavigationTabsProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  pendingCountCount?: number;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onTabChange,
  pendingCountCount = 0,
}) => {
  interface TabItem {
    id: TabId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
  }

  const tabs: TabItem[] = [
    { id: 'dashboard', label: 'Resumen', icon: LayoutDashboard },
    { id: 'ingresos', label: 'Ingresos', icon: TrendingUp },
    { id: 'gastos', label: 'Gastos', icon: TrendingDown },
    { id: 'compras', label: 'Compras', icon: ShoppingBag },
    { id: 'empleados', label: 'Empleados', icon: Users },
    { id: 'saldos', label: 'Saldos', icon: Wallet },
    {
      id: 'cuentas',
      label: 'Cuentas',
      icon: FileSpreadsheet,
      badge: pendingCountCount > 0 ? pendingCountCount : undefined,
    },
    { id: 'contactos', label: 'Contactos', icon: BookUser },
    { id: 'ahorros', label: 'Ahorros', icon: PiggyBank },
    { id: 'exportar', label: 'Exportar', icon: FileDown },
  ];

  return (
    <nav className="mb-4 bg-white dark:bg-slate-900 p-1.5 rounded-xl shadow-2xs border border-gray-200/80 dark:border-slate-800 overflow-x-auto flex items-center gap-1 scrollbar-none">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id as TabId)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap relative cursor-pointer ${
              isActive
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white dark:text-slate-900' : 'text-slate-400 dark:text-slate-500'}`} />
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`ml-1 text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                  isActive
                    ? 'bg-emerald-500 text-white dark:bg-slate-900 dark:text-emerald-400'
                    : 'bg-rose-500 text-white'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
