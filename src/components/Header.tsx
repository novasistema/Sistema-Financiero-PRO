import React from 'react';
import { Sun, Moon, RotateCcw, ShieldCheck, Download } from 'lucide-react';

interface HeaderProps {
  dark: boolean;
  onToggleDark: () => void;
  onResetData: () => void;
  onQuickExport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  dark,
  onToggleDark,
  onResetData,
  onQuickExport,
}) => {
  return (
    <header className="mb-2 bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 shadow-2xs border border-gray-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors">
      <div className="flex items-center gap-3.5 text-center sm:text-left">
        <div className="w-10 h-10 rounded-lg bg-gray-900 dark:bg-slate-800 flex items-center justify-center text-white text-xl shadow-2xs">
          💰
        </div>
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Sistema Financiero v10.1 PRO
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 flex items-center gap-1.5 justify-center sm:justify-start">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Gestión Integral + Pesificación Automática Dólar Banco Nación</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap justify-center">
        <button
          onClick={onQuickExport}
          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition shadow-2xs cursor-pointer"
          title="Exportar todo a Excel"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Excel Rápido</span>
        </button>

        <button
          onClick={onResetData}
          className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg transition border border-gray-200 dark:border-slate-700 cursor-pointer"
          title="Restablecer datos demo"
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
          <span className="hidden sm:inline">Restablecer Demo</span>
        </button>

        <button
          onClick={onToggleDark}
          className="p-2 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition border border-gray-200 dark:border-slate-700 cursor-pointer"
          title={dark ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
        >
          {dark ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>
      </div>
    </header>
  );
};
