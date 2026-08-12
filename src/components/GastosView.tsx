import React, { useState } from 'react';
import { Plus, Search, Download, Trash2, DollarSign } from 'lucide-react';
import { Gasto, Moneda, TipoGasto, MetodoPago, CotizacionDolar } from '../types';
import { Modal } from './Modal';
import { exportGastosToExcel, fmtFecha } from '../services/exportService';

interface GastosViewProps {
  gastos: Gasto[];
  cotizacionDolar: CotizacionDolar;
  onAddGasto: (gasto: Omit<Gasto, 'id'>) => void;
  onDeleteGasto: (id: string) => void;
  onNotify: (msg: string, type: 'success' | 'warning' | 'danger' | 'info') => void;
}

export const GastosView: React.FC<GastosViewProps> = ({
  gastos,
  cotizacionDolar,
  onAddGasto,
  onDeleteGasto,
  onNotify,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [clasificacionFiltro, setClasificacionFiltro] = useState<string>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [clasificacion, setClasificacion] = useState<TipoGasto>('Fijo');
  const [categoria, setCategoria] = useState('Alquiler');
  const [item, setItem] = useState('');
  const [moneda, setMoneda] = useState<Moneda>('ARS');
  const [montoUSD, setMontoUSD] = useState<number | ''>('');
  const [cotizacionCustom, setCotizacionCustom] = useState<number>(cotizacionDolar.venta);
  const [montoARS, setMontoARS] = useState<number | ''>('');
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('Banco');
  const [estado, setEstado] = useState<'Pagado' | 'Pendiente'>('Pagado');
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
      onNotify('⚠️ Por favor ingrese un importe válido mayor a 0', 'warning');
      return;
    }

    onAddGasto({
      fecha,
      clasificacion,
      categoria,
      item: item.trim() || 'Gasto General',
      metodoPago,
      importe: finalARS,
      moneda,
      importeOriginalUSD: moneda === 'USD' && typeof montoUSD === 'number' ? montoUSD : undefined,
      cotizacionUsada: moneda === 'USD' ? cotizacionCustom : undefined,
      estado,
      observaciones: observaciones.trim(),
    });

    onNotify('✅ Gasto registrado correctamente', 'success');
    setIsModalOpen(false);

    // Reset
    setItem('');
    setMontoUSD('');
    setMontoARS('');
    setObservaciones('');
  };

  const filteredGastos = gastos.filter((g) => {
    const matchesSearch =
      g.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.categoria.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClas =
      clasificacionFiltro === 'todos' || g.clasificacion === clasificacionFiltro;

    return matchesSearch && matchesClas;
  });

  const totalFilteredARS = filteredGastos.reduce((acc, g) => acc + g.importe, 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header Controls */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>💸 Registro de Gastos y Operativos</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 font-semibold border border-rose-200 dark:border-rose-800">
              {filteredGastos.length} Registros
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Control de costos fijos y variables con conversión USD
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => exportGastosToExcel(filteredGastos)}
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
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium rounded-lg transition shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo Gasto</span>
          </button>
        </div>
      </div>

      {/* Filters bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por item o categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border rounded-lg border-gray-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
          />
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={clasificacionFiltro}
            onChange={(e) => setClasificacionFiltro(e.target.value)}
            className="w-full sm:w-48 px-3 py-2 text-xs border rounded-lg border-gray-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white font-medium"
          >
            <option value="todos">Todos los Tipos</option>
            <option value="Fijo">Gasto Fijo</option>
            <option value="Variable">Gasto Variable</option>
          </select>
        </div>
      </div>

      {/* Total Filtered Badge */}
      <div className="px-4 py-3 bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-800/80 rounded-xl flex items-center justify-between text-xs text-rose-900 dark:text-rose-200 font-medium">
        <span>Total Gastos Filtrados:</span>
        <span className="text-sm font-bold text-rose-700 dark:text-rose-400">${totalFilteredARS.toLocaleString('es-AR')} ARS</span>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-gray-200/80 dark:border-slate-800">
              <tr>
                <th className="p-3.5">Fecha</th>
                <th className="p-3.5">Tipo</th>
                <th className="p-3.5">Categoría</th>
                <th className="p-3.5">Item / Descripción</th>
                <th className="p-3.5">Método Pago</th>
                <th className="p-3.5 text-right">Importe USD</th>
                <th className="p-3.5 text-right">Importe ARS</th>
                <th className="p-3.5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {filteredGastos.length > 0 ? (
                filteredGastos.map((gas) => (
                  <tr
                    key={gas.id}
                    className="hover:bg-gray-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="p-3.5 font-normal text-slate-600 dark:text-slate-300 whitespace-nowrap">{fmtFecha(gas.fecha)}</td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          gas.clasificacion === 'Fijo'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800'
                            : 'bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800'
                        }`}
                      >
                        {gas.clasificacion}
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200">
                      {gas.categoria}
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">{gas.item}</td>
                    <td className="p-3.5 font-medium text-slate-500 dark:text-slate-400">
                      {gas.metodoPago}
                    </td>
                    <td className="p-3.5 text-right font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {gas.moneda === 'USD' && gas.importeOriginalUSD ? (
                        <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                          ${gas.importeOriginalUSD.toLocaleString('es-AR')} USD
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="p-3.5 text-right font-bold text-rose-600 dark:text-rose-400 text-sm whitespace-nowrap">
                      ${gas.importe.toLocaleString('es-AR')} ARS
                    </td>
                    <td className="p-3.5 text-center whitespace-nowrap">
                      <button
                        onClick={() => {
                          if (confirm('¿Eliminar este gasto?')) {
                            onDeleteGasto(gas.id);
                            onNotify('Gasto eliminado', 'info');
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
                    No se encontraron gastos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nuevo Gasto */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registrar Nuevo Gasto"
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
                Clasificación
              </label>
              <select
                value={clasificacion}
                onChange={(e) => setClasificacion(e.target.value as TipoGasto)}
                className="w-full px-3 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white font-bold"
              >
                <option value="Fijo">Gasto Fijo (Alquiler, Servicios, Sueldos)</option>
                <option value="Variable">Gasto Variable (Marketing, Mantenimiento, Varios)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Categoría
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              >
                <option value="Alquiler">Alquiler / Expensas</option>
                <option value="Servicios">Servicios (Luz, Gas, Internet, Agua)</option>
                <option value="Impuestos">Impuestos / Tasas / AFIP</option>
                <option value="Sueldos">Sueldos y Cargas Sociales</option>
                <option value="Marketing">Marketing y Publicidad</option>
                <option value="Software">Software y Licencias Cloud</option>
                <option value="Mantenimiento">Mantenimiento y Reparaciones</option>
                <option value="Viáticos">Viáticos y Transporte</option>
                <option value="Varios">Gastos Varios</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Item / Descripción
              </label>
              <input
                type="text"
                placeholder="Ej. Pago Meta Ads, Alquiler local..."
                value={item}
                onChange={(e) => setItem(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                required
              />
            </div>
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
                Método de Pago
              </label>
              <select
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value as MetodoPago)}
                className="w-full px-3 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              >
                <option value="Banco">Banco / Cta Cte</option>
                <option value="Mercado Pago">Mercado Pago</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Cheque">Cheque Físico</option>
                <option value="E-Cheq">E-Cheq</option>
              </select>
            </div>
          </div>

          {moneda === 'USD' ? (
            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200 dark:border-indigo-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-300 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-indigo-600" />
                <span>Pesificación USD de Gasto</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Monto USD
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="300"
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
                <span>Resultado ARS:</span>
                <span className="text-base font-black text-rose-600 dark:text-rose-400">
                  ${(montoARS || 0).toLocaleString('es-AR')} ARS
                </span>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Importe (ARS)
              </label>
              <input
                type="number"
                placeholder="150000"
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
              placeholder="Detalles sobre la factura o proveedor..."
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
              className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-md"
            >
              Guardar Gasto
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
