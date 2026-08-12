import React, { useState } from 'react';
import { Plus, Search, Download, Trash2, Edit2, DollarSign, Calendar, Filter } from 'lucide-react';
import { Ingreso, Moneda, MetodoPago, CotizacionDolar } from '../types';
import { Modal } from './Modal';
import { exportIngresosToExcel, fmtFecha } from '../services/exportService';

interface IngresosViewProps {
  ingresos: Ingreso[];
  cotizacionDolar: CotizacionDolar;
  onAddIngreso: (ingreso: Omit<Ingreso, 'id'>) => void;
  onDeleteIngreso: (id: string) => void;
  onNotify: (msg: string, type: 'success' | 'warning' | 'danger' | 'info') => void;
}

export const IngresosView: React.FC<IngresosViewProps> = ({
  ingresos,
  cotizacionDolar,
  onAddIngreso,
  onDeleteIngreso,
  onNotify,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [cliente, setCliente] = useState('');
  const [tipo, setTipo] = useState('Venta de Productos');
  const [moneda, setMoneda] = useState<Moneda>('ARS');
  const [montoUSD, setMontoUSD] = useState<number | ''>('');
  const [cotizacionCustom, setCotizacionCustom] = useState<number>(cotizacionDolar.venta);
  const [montoARS, setMontoARS] = useState<number | ''>('');
  const [metodoCobro, setMetodoCobro] = useState<MetodoPago>('Banco');
  const [estado, setEstado] = useState<'Cobrado' | 'Pendiente'>('Cobrado');
  const [observaciones, setObservaciones] = useState('');

  // Handle USD/ARS calculation
  const handleMonedaChange = (m: Moneda) => {
    setMoneda(m);
    if (m === 'USD') {
      if (typeof montoUSD === 'number' && montoUSD > 0) {
        setMontoARS(Math.round(montoUSD * cotizacionCustom));
      }
    }
  };

  const handleUSDChange = (val: number | '') => {
    setMontoUSD(val);
    if (moneda === 'USD' && typeof val === 'number') {
      setMontoARS(Math.round(val * cotizacionCustom));
    }
  };

  const handleCotizacionChange = (val: number) => {
    setCotizacionCustom(val);
    if (moneda === 'USD' && typeof montoUSD === 'number') {
      setMontoARS(Math.round(montoUSD * val));
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
      onNotify('⚠️ Por favor ingrese un importe válido mayor a 0', 'warning');
      return;
    }

    onAddIngreso({
      fecha,
      cliente: cliente.trim() || 'Cliente General',
      tipo,
      importe: finalARS,
      moneda,
      importeOriginalUSD: moneda === 'USD' && typeof montoUSD === 'number' ? montoUSD : undefined,
      cotizacionUsada: moneda === 'USD' ? cotizacionCustom : undefined,
      metodoCobro,
      estado,
      observaciones: observaciones.trim(),
    });

    onNotify('✅ Ingreso registrado con éxito', 'success');
    setIsModalOpen(false);

    // Reset Form
    setCliente('');
    setMontoUSD('');
    setMontoARS('');
    setObservaciones('');
  };

  // Filter logic
  const filteredIngresos = ingresos.filter((i) => {
    const matchesSearch =
      i.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (i.observaciones && i.observaciones.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDesde = !fechaDesde || i.fecha >= fechaDesde;
    const matchesHasta = !fechaHasta || i.fecha <= fechaHasta;

    return matchesSearch && matchesDesde && matchesHasta;
  });

  const totalFilteredARS = filteredIngresos.reduce((acc, i) => acc + i.importe, 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header Controls */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>💵 Registro de Ingresos</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-semibold border border-emerald-200 dark:border-emerald-800">
              {filteredIngresos.length} Registros
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ingresos en Pesos (ARS) y Dólares (USD pesificados al tipo de cambio)
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => exportIngresosToExcel(filteredIngresos)}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
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
            <span>Nuevo Ingreso</span>
          </button>
        </div>
      </div>

      {/* Filters bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por cliente, tipo u observación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border rounded-lg border-gray-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
          />
        </div>

        <div>
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            className="w-full px-3 py-2 text-xs border rounded-lg border-gray-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            placeholder="Desde"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            className="w-full px-3 py-2 text-xs border rounded-lg border-gray-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            placeholder="Hasta"
          />
          {(searchTerm || fechaDesde || fechaHasta) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFechaDesde('');
                setFechaHasta('');
              }}
              className="text-xs font-medium text-rose-500 whitespace-nowrap px-2 hover:underline cursor-pointer"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Summary Badge for list */}
      <div className="px-4 py-3 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/80 rounded-xl flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200 font-medium">
        <span>Total Filtrado:</span>
        <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">${totalFilteredARS.toLocaleString('es-AR')} ARS</span>
      </div>

      {/* Table of Incomes */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-gray-200/80 dark:border-slate-800">
              <tr>
                <th className="p-3.5">Fecha</th>
                <th className="p-3.5">Cliente</th>
                <th className="p-3.5">Tipo / Concepto</th>
                <th className="p-3.5">Método Cobro</th>
                <th className="p-3.5 text-right">Importe USD</th>
                <th className="p-3.5 text-right">Importe ARS</th>
                <th className="p-3.5 text-center">Estado</th>
                <th className="p-3.5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {filteredIngresos.length > 0 ? (
                filteredIngresos.map((ing) => (
                  <tr
                    key={ing.id}
                    className="hover:bg-gray-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="p-3.5 font-normal text-slate-600 dark:text-slate-300 whitespace-nowrap">{fmtFecha(ing.fecha)}</td>
                    <td className="p-3.5 font-semibold text-slate-900 dark:text-white">
                      {ing.cliente}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                        {ing.tipo}
                      </span>
                    </td>
                    <td className="p-3.5 font-medium text-indigo-600 dark:text-indigo-400">
                      {ing.metodoCobro}
                    </td>
                    <td className="p-3.5 text-right font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {ing.moneda === 'USD' && ing.importeOriginalUSD ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          ${ing.importeOriginalUSD.toLocaleString('es-AR')} USD
                          <span className="block text-[10px] text-slate-400">
                            (@ ${ing.cotizacionUsada})
                          </span>
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="p-3.5 text-right font-bold text-emerald-600 dark:text-emerald-400 text-sm whitespace-nowrap">
                      ${ing.importe.toLocaleString('es-AR')} ARS
                    </td>
                    <td className="p-3.5 text-center whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          ing.estado === 'Cobrado'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800'
                            : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800'
                        }`}
                      >
                        {ing.estado}
                      </span>
                    </td>
                    <td className="p-3.5 text-center whitespace-nowrap">
                      <button
                        onClick={() => {
                          if (confirm('¿Eliminar este registro de ingreso?')) {
                            onDeleteIngreso(ing.id);
                            onNotify('Registro eliminado', 'info');
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 font-medium">
                    No se encontraron ingresos registrados con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nuevo Ingreso */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registrar Nuevo Ingreso"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Fecha
              </label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Cliente / Entidad
              </label>
              <input
                type="text"
                placeholder="Nombre del cliente o empresa"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Tipo / Concepto
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              >
                <option value="Venta de Productos">Venta de Productos</option>
                <option value="Servicios de Consultoría">Servicios de Consultoría</option>
                <option value="Honorarios Profesionales">Honorarios Profesionales</option>
                <option value="Cobro de Servicio">Cobro de Servicio</option>
                <option value="Otros Ingresos">Otros Ingresos</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Moneda de Transacción
              </label>
              <select
                value={moneda}
                onChange={(e) => handleMonedaChange(e.target.value as Moneda)}
                className="w-full px-3 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white font-bold text-indigo-600 dark:text-indigo-400"
              >
                <option value="ARS">Pesos Argentinos (ARS)</option>
                <option value="USD">Dólares Estadounidenses (USD)</option>
              </select>
            </div>
          </div>

          {/* Section for USD Pesification */}
          {moneda === 'USD' ? (
            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200 dark:border-indigo-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-300 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-indigo-600" />
                <span>Pesificación Dólar Automática</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Monto en USD
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
                    Cotización USD Aplicada
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={cotizacionCustom}
                    onChange={(e) => handleCotizacionChange(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-600 dark:text-white font-bold"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center text-xs text-indigo-900 dark:text-indigo-200 font-bold">
                <span>Resultado Pesificado:</span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                  ${(montoARS || 0).toLocaleString('es-AR')} ARS
                </span>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Importe en Pesos (ARS)
              </label>
              <input
                type="number"
                placeholder="500000"
                value={montoARS}
                onChange={(e) => setMontoARS(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white text-lg font-bold"
                required
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Método de Cobro
              </label>
              <select
                value={metodoCobro}
                onChange={(e) => setMetodoCobro(e.target.value as MetodoPago)}
                className="w-full px-3 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              >
                <option value="Banco">Banco / Cta Cte</option>
                <option value="Mercado Pago">Mercado Pago</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Cheque">Cheque Físico</option>
                <option value="E-Cheq">E-Cheq</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Estado
              </label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value as any)}
                className="w-full px-3 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              >
                <option value="Cobrado">Cobrado / Acreditado</option>
                <option value="Pendiente">Pendiente de Cobro</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              Observaciones / Comprobante
            </label>
            <textarea
              rows={2}
              placeholder="Detalles adicionales, número de factura o transferencia..."
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
              Guardar Ingreso
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
