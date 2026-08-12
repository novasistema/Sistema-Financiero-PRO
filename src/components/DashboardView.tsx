import React from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  PiggyBank,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { SistemaData } from '../types';

interface DashboardViewProps {
  data: SistemaData;
  onNavigateTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ data, onNavigateTab }) => {
  // Compute totals
  const totalEfectivo = data.saldos.efectivo;
  const totalBanco = data.saldos.banco;
  const totalMP = data.saldos.mp;
  const totalCheques = data.saldos.cheques;
  const totalECheq = data.saldos.echeq;

  const totalLiquidez = totalEfectivo + totalBanco + totalMP;
  const totalCarteraCheques = totalCheques + totalECheq;

  const totalIngresos = data.ingresos.reduce((acc, i) => acc + (i.importe || 0), 0);
  const totalGastos = data.gastos.reduce((acc, g) => acc + (g.importe || 0), 0);
  const totalCompras = data.compras.reduce((acc, c) => acc + (c.importe || 0), 0);

  const balanceNeto = totalIngresos - (totalGastos + totalCompras);

  const porCobrar = data.cuentas
    .filter((c) => c.tipo === 'Por Cobrar' && c.estado !== 'Cobrado')
    .reduce((acc, c) => acc + c.montoARS, 0);

  const porPagar = data.cuentas
    .filter((c) => c.tipo === 'Por Pagar' && c.estado !== 'Pagado')
    .reduce((acc, c) => acc + c.montoARS, 0);

  // Overdue and upcoming accounts
  const cuentasVencidas = data.cuentas.filter((c) => c.estado === 'Vencido');
  const cuentasProximas = data.cuentas.filter((c) => c.estado === 'Próximo');

  // Chart Data: Gastos por Categoría
  const gastosPorCategoriaMap: Record<string, number> = {};
  data.gastos.forEach((g) => {
    const cat = g.categoria || 'Otros';
    gastosPorCategoriaMap[cat] = (gastosPorCategoriaMap[cat] || 0) + g.importe;
  });

  const pieData = Object.keys(gastosPorCategoriaMap).map((cat) => ({
    name: cat,
    value: gastosPorCategoriaMap[cat],
  }));

  const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#3b82f6', '#14b8a6'];

  // Comparative chart
  const barData = [
    { name: 'Totales ARS', Ingresos: totalIngresos, Gastos: totalGastos, Compras: totalCompras },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Alertas destacadas */}
      {(cuentasVencidas.length > 0 || cuentasProximas.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cuentasVencidas.length > 0 && (
            <div
              onClick={() => onNavigateTab('cuentas')}
              className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 flex items-center justify-between cursor-pointer hover:bg-rose-500/20 transition"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-rose-500 animate-bounce" />
                <div>
                  <h4 className="font-bold text-sm">
                    {cuentasVencidas.length} Cuentas Vencidas
                  </h4>
                  <p className="text-xs opacity-90">
                    Suma total pendiente de pago/cobro vencido.
                  </p>
                </div>
              </div>
              <span className="text-xs font-black underline">Ver Cuentas &rarr;</span>
            </div>
          )}

          {cuentasProximas.length > 0 && (
            <div
              onClick={() => onNavigateTab('cuentas')}
              className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 flex items-center justify-between cursor-pointer hover:bg-amber-500/20 transition"
            >
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-amber-500" />
                <div>
                  <h4 className="font-bold text-sm">
                    {cuentasProximas.length} Cuentas Próximas a Vencer
                  </h4>
                  <p className="text-xs opacity-90">
                    Vencimiento programado dentro de los próximos días.
                  </p>
                </div>
              </div>
              <span className="text-xs font-black underline">Revisar &rarr;</span>
            </div>
          )}
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Liquidez */}
        <div className="p-5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white shadow-2xs relative overflow-hidden border border-slate-800">
          <div className="absolute top-3.5 right-3.5 p-2 bg-white/10 rounded-lg">
            <Wallet className="w-4 h-4 text-slate-200" />
          </div>
          <span className="text-[11px] uppercase font-semibold tracking-wider text-slate-300">
            Disponible Líquido
          </span>
          <div className="text-2xl font-bold mt-2 tracking-tight">
            ${totalLiquidez.toLocaleString('es-AR')}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Efectivo + Banco + Mercado Pago</span>
          </p>
        </div>

        {/* Total Ingresos */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 shadow-2xs relative">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">
              Total Ingresos
            </span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg border border-emerald-200/50 dark:border-emerald-800/50">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2 tracking-tight">
            ${totalIngresos.toLocaleString('es-AR')}
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{data.ingresos.length} registros cargados</span>
          </div>
        </div>

        {/* Total Egresos */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 shadow-2xs relative">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">
              Gastos + Compras
            </span>
            <div className="p-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-lg border border-rose-200/50 dark:border-rose-800/50">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2 tracking-tight">
            ${(totalGastos + totalCompras).toLocaleString('es-AR')}
          </div>
          <div className="flex items-center gap-1 text-xs text-rose-600 font-medium mt-1">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>Gastos: ${totalGastos.toLocaleString('es-AR')}</span>
          </div>
        </div>

        {/* Balance Neto */}
        <div
          className={`p-5 rounded-xl border shadow-2xs relative ${
            balanceNeto >= 0
              ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-200'
              : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200/80 dark:border-rose-900/50 text-rose-900 dark:text-rose-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-semibold tracking-wider opacity-80">
              Balance Neto
            </span>
            <div className="p-2 bg-current/10 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold mt-2 tracking-tight">
            ${balanceNeto.toLocaleString('es-AR')}
          </div>
          <p className="text-xs opacity-80 mt-1 font-medium">
            {balanceNeto >= 0 ? 'Superávit Financiero' : 'Déficit Financiero'}
          </p>
        </div>
      </div>

      {/* Secondary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Por Cobrar */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
              Por Cobrar (Clientes)
            </span>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              ${porCobrar.toLocaleString('es-AR')}
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('cuentas')}
            className="px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 rounded-lg border border-emerald-200/60 dark:border-emerald-800/60 hover:bg-emerald-100 transition cursor-pointer"
          >
            Ver
          </button>
        </div>

        {/* Por Pagar */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
              Por Pagar (Proveedores)
            </span>
            <div className="text-lg font-bold text-rose-600 dark:text-rose-400 mt-1">
              ${porPagar.toLocaleString('es-AR')}
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('cuentas')}
            className="px-3 py-1.5 text-xs font-medium bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 rounded-lg border border-rose-200/60 dark:border-rose-800/60 hover:bg-rose-100 transition cursor-pointer"
          >
            Ver
          </button>
        </div>

        {/* Cheques en Cartera */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
              Cheques en Cartera
            </span>
            <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-1">
              ${totalCarteraCheques.toLocaleString('es-AR')}
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('saldos')}
            className="px-3 py-1.5 text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 rounded-lg border border-indigo-200/60 dark:border-indigo-800/60 hover:bg-indigo-100 transition cursor-pointer"
          >
            Saldos
          </button>
        </div>
      </div>

      {/* Recharts Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Bar Chart: Ingresos vs Gastos vs Compras */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-2xs">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            <span>Comparativa de Flujo de Fondos (ARS)</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={10}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: any) => [`$${Number(value).toLocaleString('es-AR')}`, '']}
                  contentStyle={{
                    borderRadius: '8px',
                    backgroundColor: '#0f172a',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="Ingresos" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Gastos" fill="#ef4444" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Compras" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Gastos por Categoría */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-2xs">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-purple-500" />
            <span>Distribución de Gastos por Categoría</span>
          </h3>
          <div className="h-64">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => `$${Number(val).toLocaleString('es-AR')}`}
                    contentStyle={{
                      borderRadius: '8px',
                      backgroundColor: '#0f172a',
                      color: '#fff',
                      border: 'none',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    formatter={(value) => <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No hay datos suficientes para graficar
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Account Balances Grid */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-500" />
            <span>Desglose de Cuentas y Cartera</span>
          </h3>
          <button
            onClick={() => onNavigateTab('saldos')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            Gestionar Saldos &rarr;
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          <div className="p-3 bg-gray-50/80 dark:bg-slate-800/50 rounded-lg border border-gray-200/60 dark:border-slate-700/60">
            <span className="block text-[10px] font-semibold text-slate-400 uppercase">
              Efectivo
            </span>
            <span className="text-base font-bold text-slate-800 dark:text-white mt-1 block">
              ${totalEfectivo.toLocaleString('es-AR')}
            </span>
          </div>

          <div className="p-3 bg-gray-50/80 dark:bg-slate-800/50 rounded-lg border border-gray-200/60 dark:border-slate-700/60">
            <span className="block text-[10px] font-semibold text-slate-400 uppercase">
              Banco Cta Cte
            </span>
            <span className="text-base font-bold text-slate-800 dark:text-white mt-1 block">
              ${totalBanco.toLocaleString('es-AR')}
            </span>
          </div>

          <div className="p-3 bg-gray-50/80 dark:bg-slate-800/50 rounded-lg border border-gray-200/60 dark:border-slate-700/60">
            <span className="block text-[10px] font-semibold text-slate-400 uppercase">
              Mercado Pago
            </span>
            <span className="text-base font-bold text-cyan-600 dark:text-cyan-400 mt-1 block">
              ${totalMP.toLocaleString('es-AR')}
            </span>
          </div>

          <div className="p-3 bg-gray-50/80 dark:bg-slate-800/50 rounded-lg border border-gray-200/60 dark:border-slate-700/60">
            <span className="block text-[10px] font-semibold text-slate-400 uppercase">
              Cheques Físicos
            </span>
            <span className="text-base font-bold text-purple-600 dark:text-purple-400 mt-1 block">
              ${totalCheques.toLocaleString('es-AR')}
            </span>
          </div>

          <div className="p-3 bg-gray-50/80 dark:bg-slate-800/50 rounded-lg border border-gray-200/60 dark:border-slate-700/60">
            <span className="block text-[10px] font-semibold text-slate-400 uppercase">
              E-Cheqs
            </span>
            <span className="text-base font-bold text-indigo-600 dark:text-indigo-400 mt-1 block">
              ${totalECheq.toLocaleString('es-AR')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
