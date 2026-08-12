import React, { useRef } from 'react';
import {
  FileSpreadsheet,
  Download,
  Upload,
  Database,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  ShieldCheck,
  FileDown,
} from 'lucide-react';
import { SistemaData } from '../types';
import {
  exportIngresosToExcel,
  exportGastosToExcel,
  exportComprasToExcel,
  exportCuentasToExcel,
  exportTodoToExcel,
  exportBackupJSON,
  importBackupJSON,
} from '../services/exportService';

interface ExportarViewProps {
  data: SistemaData;
  onRestoreData: (data: SistemaData) => void;
  onResetData: () => void;
  onNotify: (msg: string, type: 'success' | 'warning' | 'danger' | 'info') => void;
}

export const ExportarView: React.FC<ExportarViewProps> = ({
  data,
  onRestoreData,
  onResetData,
  onNotify,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportIngresos = () => {
    const ok = exportIngresosToExcel(data.ingresos);
    if (ok) onNotify('✅ Ingresos exportados a Excel', 'success');
    else onNotify('⚠️ No hay ingresos para exportar', 'warning');
  };

  const handleExportGastos = () => {
    const ok = exportGastosToExcel(data.gastos);
    if (ok) onNotify('✅ Gastos exportados a Excel', 'success');
    else onNotify('⚠️ No hay gastos para exportar', 'warning');
  };

  const handleExportCompras = () => {
    const ok = exportComprasToExcel(data.compras);
    if (ok) onNotify('✅ Compras exportadas a Excel', 'success');
    else onNotify('⚠️ No hay compras para exportar', 'warning');
  };

  const handleExportCuentas = () => {
    const ok = exportCuentasToExcel(data.cuentas);
    if (ok) onNotify('✅ Cuentas exportadas a Excel', 'success');
    else onNotify('⚠️ No hay cuentas para exportar', 'warning');
  };

  const handleExportTodo = () => {
    const ok = exportTodoToExcel(data);
    if (ok) onNotify('✅ Todos los datos exportados a un único archivo Excel', 'success');
    else onNotify('⚠️ No hay datos para exportar', 'warning');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const restored = await importBackupJSON(file);
      onRestoreData(restored);
      onNotify('✅ Copia de seguridad restaurada con éxito', 'success');
    } catch (err) {
      onNotify('❌ Archivo de copia de seguridad inválido o corrupto', 'danger');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-2xs">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span>📥 Exportación a Excel & Respaldos de Seguridad</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Descargue sus planillas en formato .XLSX compatible con Microsoft Excel, Google Sheets y LibreOffice, o cree copias de seguridad de su base de datos.
        </p>
      </div>

      {/* Individual Exports */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-2xs space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
          <span>📊 Exportación Individual por Módulo</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Descargue individualmente las planillas de cada sección con montos originales en USD y tipo de cambio.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={handleExportIngresos}
            className="p-3.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-between transition font-medium text-xs cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Ingresos</span>
            </div>
            <span className="text-[10px] opacity-80">({data.ingresos.length})</span>
          </button>

          <button
            onClick={handleExportGastos}
            className="p-3.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:hover:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800/80 flex items-center justify-between transition font-medium text-xs cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Gastos</span>
            </div>
            <span className="text-[10px] opacity-80">({data.gastos.length})</span>
          </button>

          <button
            onClick={handleExportCompras}
            className="p-3.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:hover:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800/80 flex items-center justify-between transition font-medium text-xs cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Compras</span>
            </div>
            <span className="text-[10px] opacity-80">({data.compras.length})</span>
          </button>

          <button
            onClick={handleExportCuentas}
            className="p-3.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/80 flex items-center justify-between transition font-medium text-xs cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Cuentas</span>
            </div>
            <span className="text-[10px] opacity-80">({data.cuentas.length})</span>
          </button>
        </div>
      </div>

      {/* Full Export */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-lg">
            <FileDown className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">📦 Exportación Completa (Multi-Hoja Excel)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Descargue un único archivo .XLSX consolidado con pestañas independientes para Ingresos, Gastos, Compras, Cuentas y Empleados.
            </p>
          </div>
        </div>

        <button
          onClick={handleExportTodo}
          className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg shadow-2xs transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Descargar Libro Excel Completo (.xlsx)</span>
        </button>
      </div>

      {/* Backup & Restore JSON */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-2xs space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-indigo-500" />
          <span>💾 Copia de Seguridad & Restauración (JSON)</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Guarde un respaldo local de todos sus registros para restaurarlo en otro dispositivo o navegador.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => exportBackupJSON(data)}
            className="p-3.5 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-medium text-xs flex items-center justify-center gap-2 border border-gray-200 dark:border-slate-700 transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-indigo-500" />
            <span>Descargar Respaldo JSON</span>
          </button>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-3.5 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-medium text-xs flex items-center justify-center gap-2 border border-gray-200 dark:border-slate-700 transition cursor-pointer"
            >
              <Upload className="w-4 h-4 text-purple-500" />
              <span>Restaurar desde Respaldo JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Demo Reset */}
      <div className="p-5 bg-gray-50/80 dark:bg-slate-800/40 rounded-xl border border-gray-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
            Restablecer Datos de Demostración
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Recargue los datos de ejemplo iniciales si desea reiniciar sus pruebas.
          </p>
        </div>

        <button
          onClick={() => {
            if (confirm('¿Está seguro de reiniciar los datos a la demostración inicial?')) {
              onResetData();
            }
          }}
          className="px-4 py-2 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-medium text-xs rounded-lg border border-amber-200 dark:border-amber-800/80 flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restablecer Demo</span>
        </button>
      </div>
    </div>
  );
};
