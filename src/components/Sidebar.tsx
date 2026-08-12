import React, { useState } from 'react';
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
  Sun,
  Moon,
  RotateCcw,
  Download,
  ShieldCheck,
  Menu,
  X,
  Cloud,
  CloudCheck,
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

interface SidebarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  pendingCountCount?: number;
  dark: boolean;
  onToggleDark: () => void;
  onResetData: () => void;
  onQuickExport: () => void;
  cloudSyncActive?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  pendingCountCount = 0,
  dark,
  onToggleDark,
  onResetData,
  onQuickExport,
  cloudSyncActive = false,
}) => {
  const [isOpenMobile, setIsOpenMobile] = useState(false);

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
    { id: 'empleados', label: 'Empleados & Adelantos', icon: Users },
    { id: 'saldos', label: 'Saldos & Cajas', icon: Wallet },
    {
      id: 'cuentas',
      label: 'Cuentas por Cobrar/Pagar',
      icon: FileSpreadsheet,
      badge: pendingCountCount > 0 ? pendingCountCount : undefined,
    },
    { id: 'contactos', label: 'Agenda Contactos', icon: BookUser },
    { id: 'ahorros', label: 'Fondo Ahorros', icon: PiggyBank },
    { id: 'exportar', label: 'Exportar & Respaldos', icon: FileDown },
  ];

  const handleTabClick = (tabId: TabId) => {
    onTabChange(tabId);
    setIsOpenMobile(false);
  };

  return (
    <>
      {/* Mobile Header Bar with Hamburger Menu */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-gray-200/80 dark:border-slate-800 sticky top-0 z-40 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsOpenMobile(!isOpenMobile)}
            className="p-2 text-slate-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
            aria-label="Abrir Menú Lateral"
          >
            {isOpenMobile ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl">💰</span>
            <span className="font-bold text-sm text-slate-900 dark:text-white">
              Sistema Financiero
            </span>
          </div>
        </div>

        <button
          onClick={onToggleDark}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
        >
          {dark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* Backdrop for Mobile Drawer */}
      {isOpenMobile && (
        <div
          onClick={() => setIsOpenMobile(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* Left Sidebar (Desktop Fixed/Sticky + Mobile Drawer) */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 md:z-30 w-64 h-screen bg-white dark:bg-slate-900 border-r border-gray-200/80 dark:border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-5 overflow-y-auto flex-1">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3 pb-5 border-b border-gray-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-800 flex items-center justify-center text-white text-xl shadow-2xs shrink-0">
              💰
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                Sistema Financiero
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
                <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>v10.1 PRO</span>
              </p>
            </div>
          </div>

          {/* Cloud Sync Status Tag */}
          <div className="mt-4 px-3 py-2 rounded-lg bg-gray-50 dark:bg-slate-800/80 border border-gray-200/80 dark:border-slate-800 flex items-center gap-2 text-xs">
            {cloudSyncActive ? (
              <>
                <CloudCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                  Nube Activa & Sincronizada
                </span>
              </>
            ) : (
              <>
                <Cloud className="w-4 h-4 text-indigo-500 shrink-0 animate-pulse" />
                <span className="text-slate-600 dark:text-slate-400 text-[11px]">
                  Sincronización en Nube
                </span>
              </>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="mt-5 space-y-1">
            <span className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Menú Principal
            </span>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-2xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive
                          ? 'text-white dark:text-slate-900'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    />
                    <span className="truncate">{tab.label}</span>
                  </div>
                  {tab.badge !== undefined && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full shrink-0 ${
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
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-100 dark:border-slate-800 space-y-2 bg-gray-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-1.5">
            <button
              onClick={onQuickExport}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition cursor-pointer"
              title="Exportar todo a Excel"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Excel</span>
            </button>

            <button
              onClick={onResetData}
              className="p-2 bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition border border-gray-200 dark:border-slate-700 cursor-pointer"
              title="Restablecer datos demo"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
            </button>

            <button
              onClick={onToggleDark}
              className="p-2 bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition border border-gray-200 dark:border-slate-700 cursor-pointer"
              title={dark ? 'Modo Claro' : 'Modo Oscuro'}
            >
              {dark ? (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-slate-700" />
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
