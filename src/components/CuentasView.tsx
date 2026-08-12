import React, { useState } from 'react';
import { Plus, Search, CheckCircle, AlertCircle, Clock, Trash2, DollarSign } from 'lucide-react';
import { CuentaPorCobrarPagar, Moneda, CotizacionDolar } from '../types';
import { Modal } from './Modal';
import { fmtFecha, exportCuentasToExcel } from '../services/exportService';

interface CuentasViewProps {
  cuentas: CuentaPorCobrarPagar[];
  cotizacionDolar: CotizacionDolar;
  onAddCuenta: (cuenta: Omit<CuentaPorCobrarPagar, 'id'>) => void;
  onPagarOCobrarCuenta: (cuenta: CuentaPorCobrarPagar) => void;
  onDeleteCuenta: (id: string) => void;
  onNotify: (msg: string, type: 'success' | 'warning' | 'danger' | 'info') => void;
}

export const CuentasView: React.FC<CuentasViewProps> = ({
  cuentas,
  cotizacionDolar,
  onAddCuenta,
  onPagarOCobrarCuenta,
  onDeleteCuenta,
  onNotify,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<'todos' | 'Por Cobrar' | 'Por Pagar'>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [tipo, setTipo] = useState<'Por Cobrar' | 'Por Pagar'>('Por Cobrar');
  const [entidad, setEntidad] = useState('');
  const [concepto, setConcepto] = useState('');
  const [moneda, setMoneda] = useState<Moneda>('ARS');
  const [montoUSD, setMontoUSD] = useState<number | ''>('');
  const [montoARS, setMontoARS] = useState<number | ''>('');
  const [cotizacionCustom, setCotizacionCustom] = useState<number>(cotizacionDolar.venta);
  const [fechaEmision, setFechaEmision] = useState(new Date().toISOString().split('T')[0]);
  const [fechaVencimiento, setFechaVencimiento] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [observaciones, setObservaciones] = useState('');

  const handleMonedaChange = (m: Moneda) => {
    setMoneda(m);
    if (m === 'USD' && typeof montoUSD === 'number') {
      setMontoARS(Math.round(montoUSD * cotizacionCustom));
    }
  };

  const handleUSDChange = (val: number | '') => {
    setMontoUSD(val);
    if (moneda === 'USD' && typeof val === 'number') {
      setMontoARS(Math.round(val * cotizacionCustom));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let finalARS = typeof montoARS === 'number' ? montoARS : 0;
    if (moneda === 'USD') {
      const usdVal = typeof montoUSD === 'number' ? montoUSD : 0;
      finalARS = Math.round(usdVal * cotizacionCustom);
    }

    if (finalARS <= 0) {
      onNotify('⚠️ Por favor ingrese un monto válido', 'warning');
      return;
    }

    // Determine initial state based on due date
    const today = new Date().toISOString().split('T')[0];
    let estadoInicial: 'Pendiente' | 'Próximo' | 'Vencido' = 'Pendiente';

    if (fechaVencimiento < today) {
      estadoInicial = 'Vencido';
    } else {
      const diffDays =
        (new Date(fechaVencimiento).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
      if (diffDays <= 5) {
        estadoInicial = 'Próximo';
      }
    }

    onAddCuenta({
      tipo,
      entidad: entidad.trim() || 'Entidad Varios',
      concepto: concepto.trim() || 'Factura / Compromiso',
      montoARS: finalARS,
      moneda,
      montoUSD: moneda === 'USD' && typeof montoUSD === 'number' ? montoUSD : undefined,
      cotizacion: moneda === 'USD' ? cotizacionCustom : undefined,
      fechaEmision,
      fechaVencimiento,
      estado: estadoInicial,
      observaciones: observaciones.trim(),
    });

    onNotify(`✅ Cuenta ${tipo} creada con éxito`, 'success');
    setIsModalOpen(false);

    // Reset
    setEntidad('');
    setConcepto('');
    setMontoUSD('');
    setMontoARS('');
    setObservaciones('');
  };

  const filteredCuentas = cuentas.filter((c) => {
    const matchesSearch =
      c.entidad.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.concepto.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTipo = tipoFiltro === 'todos' || c.tipo === tipoFiltro;

    return matchesSearch && matchesTipo;
  });

  const totalPorCobrar = filteredCuentas
    .filter((c) => c.tipo === 'Por Cobrar' && c.estado !== 'Cobrado')
    .reduce((acc, c) => acc + c.montoARS, 0);

  const totalPorPagar = filteredCuentas
    .filter((c) => c.tipo === 'Por Pagar' && c.estado !== 'Pagado')
    .reduce((acc, c) => acc + c.montoARS, 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>📑 Cuentas por Cobrar y por Pagar</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 font-semibold border border-indigo-200 dark:border-indigo-800">
              {filteredCuentas.length} Cuentas
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Control de cobros a clientes y compromisos de pago con proveedores
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => exportCuentasToExcel(filteredCuentas)}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition shadow-2xs cursor-pointer"
          >
            <span>Exportar Excel</span>
          </button>

          <button
            onClick={() => {
              setCotizacionCustom(cotizacionDolar.venta);
              setIsModalOpen(true);
            }}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nueva Cuenta</span>
          </button>
        </div>
      </div>

      {/* Summary totals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 rounded-xl shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Pendiente por Cobrar (Clientes)
            </span>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              ${totalPorCobrar.toLocaleString('es-AR')} <span className="text-xs font-normal text-slate-500">ARS</span>
            </div>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-lg">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 rounded-xl shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Pendiente por Pagar (Proveedores)
            </span>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
              ${totalPorPagar.toLocaleString('es-AR')} <span className="text-xs font-normal text-slate-500">ARS</span>
            </div>
          </div>
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-lg">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por cliente, proveedor o concepto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border rounded-lg border-gray-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
          />
        </div>

        <select
          value={tipoFiltro}
          onChange={(e) => setTipoFiltro(e.target.value as any)}
          className="px-3 py-2 text-xs border rounded-lg border-gray-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white font-medium"
        >
          <option value="todos">Todos los Tipos</option>
          <option value="Por Cobrar">Por Cobrar</option>
          <option value="Por Pagar">Por Pagar</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-gray-200/80 dark:border-slate-800">
              <tr>
                <th className="p-3.5">Tipo</th>
                <th className="p-3.5">Entidad (Cliente/Proveedor)</th>
                <th className="p-3.5">Concepto</th>
                <th className="p-3.5">Vencimiento</th>
                <th className="p-3.5 text-right">Monto USD</th>
                <th className="p-3.5 text-right">Monto ARS</th>
                <th className="p-3.5 text-center">Estado</th>
                <th className="p-3.5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {filteredCuentas.length > 0 ? (
                filteredCuentas.map((cue) => {
                  const isDone = cue.estado === 'Cobrado' || cue.estado === 'Pagado';
                  return (
                    <tr
                      key={cue.id}
                      className={`hover:bg-gray-50/60 dark:hover:bg-slate-800/40 transition-colors ${
                        cue.estado === 'Vencido'
                          ? 'bg-rose-50/50 dark:bg-rose-950/20'
                          : cue.estado === 'Próximo'
                          ? 'bg-amber-50/50 dark:bg-amber-950/20'
                          : ''
                      }`}
                    >
                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            cue.tipo === 'Por Cobrar'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800'
                              : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-800'
                          }`}
                        >
                          {cue.tipo}
                        </span>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-900 dark:text-white">
                        {cue.entidad}
                      </td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-300">{cue.concepto}</td>
                      <td className="p-3.5 font-medium whitespace-nowrap text-slate-700 dark:text-slate-300">{fmtFecha(cue.fechaVencimiento)}</td>
                      <td className="p-3.5 text-right text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                        {cue.moneda === 'USD' && cue.montoUSD ? (
                          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                            ${cue.montoUSD.toLocaleString('es-AR')} USD
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="p-3.5 text-right font-bold text-slate-900 dark:text-white text-sm whitespace-nowrap">
                        ${cue.montoARS.toLocaleString('es-AR')} ARS
                      </td>
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            isDone
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800'
                              : cue.estado === 'Vencido'
                              ? 'bg-rose-500 text-white'
                              : cue.estado === 'Próximo'
                              ? 'bg-amber-500 text-white'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-400 dark:border-indigo-800'
                          }`}
                        >
                          {cue.estado}
                        </span>
                      </td>
                      <td className="p-3.5 text-center whitespace-nowrap space-x-2">
                        {!isDone && (
                          <button
                            onClick={() => {
                              onPagarOCobrarCuenta(cue);
                              onNotify(
                                `✅ Cuenta marcada como ${
                                  cue.tipo === 'Por Cobrar' ? 'Cobrada' : 'Pagada'
                                }`,
                                'success'
                              );
                            }}
                            className="px-2.5 py-1 text-[11px] font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition cursor-pointer"
                          >
                            {cue.tipo === 'Por Cobrar' ? 'Cobrar' : 'Pagar'}
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (confirm('¿Eliminar esta cuenta?')) {
                              onDeleteCuenta(cue.id);
                              onNotify('Cuenta eliminada', 'info');
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 font-medium">
                    No se encontraron cuentas con los filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nueva Cuenta */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Crear Nueva Cuenta por Cobrar / Pagar"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Tipo de Cuenta
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as any)}
                className="w-full px-3 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white font-bold"
              >
                <option value="Por Cobrar">Por Cobrar (A un Cliente)</option>
                <option value="Por Pagar">Por Pagar (A un Proveedor)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Entidad (Cliente o Proveedor)
              </label>
              <input
                type="text"
                placeholder="Ej. Distribuidora del Sur"
                value={entidad}
                onChange={(e) => setEntidad(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              Concepto
            </label>
            <input
              type="text"
              placeholder="Ej. Factura #00129 Venta de Lote"
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Moneda
              </label>
              <select
                value={moneda}
                onChange={(e) => handleMonedaChange(e.target.value as Moneda)}
                className="w-full px-3 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white font-bold"
              >
                <option value="ARS">Pesos (ARS)</option>
                <option value="USD">Dólares (USD)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Fecha Vencimiento
              </label>
              <input
                type="date"
                value={fechaVencimiento}
                onChange={(e) => setFechaVencimiento(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white font-bold"
                required
              />
            </div>
          </div>

          {moneda === 'USD' ? (
            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200 dark:border-indigo-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-300 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-indigo-600" />
                <span>Pesificación Dólar</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Monto USD
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="1000"
                    value={montoUSD}
                    onChange={(e) => handleUSDChange(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-600 dark:text-white font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Cotización USD
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={cotizacionCustom}
                    onChange={(e) => {
                      setCotizacionCustom(Number(e.target.value));
                      if (typeof montoUSD === 'number') {
                        setMontoARS(Math.round(montoUSD * Number(e.target.value)));
                      }
                    }}
                    className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-600 dark:text-white font-bold"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center text-xs text-indigo-900 dark:text-indigo-200 font-bold">
                <span>Total ARS:</span>
                <span className="text-base font-black text-indigo-600 dark:text-indigo-400">
                  ${(montoARS || 0).toLocaleString('es-AR')} ARS
                </span>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Monto Total (ARS)
              </label>
              <input
                type="number"
                placeholder="450000"
                value={montoARS}
                onChange={(e) => setMontoARS(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white text-lg font-bold"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              Observaciones
            </label>
            <textarea
              rows={2}
              placeholder="Notas sobre el acuerdo o plazo..."
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md"
            >
              Guardar Cuenta
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
