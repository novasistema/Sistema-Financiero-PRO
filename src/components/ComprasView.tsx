import React, { useState } from 'react';
import { Plus, Search, Download, Trash2, ShoppingBag, DollarSign } from 'lucide-react';
import { Compra, Moneda, MetodoPago, CotizacionDolar, Proveedor } from '../types';
import { Modal } from './Modal';
import { exportComprasToExcel, fmtFecha } from '../services/exportService';

interface ComprasViewProps {
  compras: Compra[];
  proveedores: Proveedor[];
  cotizacionDolar: CotizacionDolar;
  onAddCompra: (compra: Omit<Compra, 'id'>) => void;
  onDeleteCompra: (id: string) => void;
  onNotify: (msg: string, type: 'success' | 'warning' | 'danger' | 'info') => void;
}

export const ComprasView: React.FC<ComprasViewProps> = ({
  compras,
  proveedores,
  cotizacionDolar,
  onAddCompra,
  onDeleteCompra,
  onNotify,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [categoria, setCategoria] = useState('Mercadería / Stock');
  const [proveedor, setProveedor] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [moneda, setMoneda] = useState<Moneda>('ARS');
  const [montoUSD, setMontoUSD] = useState<number | ''>('');
  const [cotizacionCustom, setCotizacionCustom] = useState<number>(cotizacionDolar.venta);
  const [montoARS, setMontoARS] = useState<number | ''>('');
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('Banco');
  const [estado, setEstado] = useState<'Completada' | 'Pendiente'>('Completada');
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
      onNotify('⚠️ Ingrese un monto válido para la compra', 'warning');
      return;
    }

    onAddCompra({
      fecha,
      categoria,
      proveedor: proveedor.trim() || 'Proveedor Varios',
      descripcion: descripcion.trim() || 'Compra de Insumos/Stock',
      metodoPago,
      importe: finalARS,
      moneda,
      importeOriginalUSD: moneda === 'USD' && typeof montoUSD === 'number' ? montoUSD : undefined,
      cotizacionUsada: moneda === 'USD' ? cotizacionCustom : undefined,
      estado,
      observaciones: observaciones.trim(),
    });

    onNotify('✅ Compra registrada correctamente', 'success');
    setIsModalOpen(false);

    // Reset
    setDescripcion('');
    setMontoUSD('');
    setMontoARS('');
    setObservaciones('');
  };

  const filteredCompras = compras.filter((c) => {
    return (
      c.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.proveedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.categoria.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalFilteredARS = filteredCompras.reduce((acc, c) => acc + c.importe, 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>🛒 Compras y Mercadería</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 font-semibold border border-amber-200 dark:border-amber-800">
              {filteredCompras.length} Compras
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Adquisición de insumos, equipamiento y stock comercial
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => exportComprasToExcel(filteredCompras)}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Excel</span>
          </button>

          <button
            onClick={() => {
              setCotizacionCustom(cotizacionDolar.venta);
              if (proveedores.length > 0 && !proveedor) {
                setProveedor(proveedores[0].nombre);
              }
              setIsModalOpen(true);
            }}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded-lg transition shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nueva Compra</span>
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por descripción, proveedor o categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border rounded-lg border-gray-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
          />
        </div>
      </div>

      {/* Badge Total */}
      <div className="px-4 py-3 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/80 rounded-xl flex items-center justify-between text-xs text-amber-900 dark:text-amber-200 font-medium">
        <span>Total Compras Filtradas:</span>
        <span className="text-sm font-bold text-amber-700 dark:text-amber-400">${totalFilteredARS.toLocaleString('es-AR')} ARS</span>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-gray-200/80 dark:border-slate-800">
              <tr>
                <th className="p-3.5">Fecha</th>
                <th className="p-3.5">Categoría</th>
                <th className="p-3.5">Proveedor</th>
                <th className="p-3.5">Descripción</th>
                <th className="p-3.5">Método Pago</th>
                <th className="p-3.5 text-right">Importe USD</th>
                <th className="p-3.5 text-right">Importe ARS</th>
                <th className="p-3.5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {filteredCompras.length > 0 ? (
                filteredCompras.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-gray-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="p-3.5 font-normal text-slate-600 dark:text-slate-300 whitespace-nowrap">{fmtFecha(c.fecha)}</td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800 font-semibold text-[11px]">
                        {c.categoria}
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200">
                      {c.proveedor}
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">{c.descripcion}</td>
                    <td className="p-3.5 font-medium text-slate-500 dark:text-slate-400">
                      {c.metodoPago}
                    </td>
                    <td className="p-3.5 text-right font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {c.moneda === 'USD' && c.importeOriginalUSD ? (
                        <span className="text-amber-600 dark:text-amber-400 font-semibold">
                          ${c.importeOriginalUSD.toLocaleString('es-AR')} USD
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="p-3.5 text-right font-bold text-slate-900 dark:text-white text-sm whitespace-nowrap">
                      ${c.importe.toLocaleString('es-AR')} ARS
                    </td>
                    <td className="p-3.5 text-center whitespace-nowrap">
                      <button
                        onClick={() => {
                          if (confirm('¿Eliminar esta compra?')) {
                            onDeleteCompra(c.id);
                            onNotify('Compra eliminada', 'info');
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
                    No hay compras registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nueva Compra */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registrar Nueva Compra / Stock"
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
                Categoría
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              >
                <option value="Mercadería / Stock">Mercadería / Stock para Venta</option>
                <option value="Insumos">Insumos y Materias Primas</option>
                <option value="Equipamiento">Equipamiento e Informática</option>
                <option value="Mobiliario">Mobiliario de Oficina</option>
                <option value="Repuestos">Repuestos y Herramientas</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Proveedor
              </label>
              <input
                type="text"
                list="proveedores-list"
                placeholder="Nombre del proveedor"
                value={proveedor}
                onChange={(e) => setProveedor(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                required
              />
              <datalist id="proveedores-list">
                {proveedores.map((p) => (
                  <option key={p.id} value={p.nombre} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Descripción de la Compra
              </label>
              <input
                type="text"
                placeholder="Ej. Lote de 50 monitores 24 pulgadas"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
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
                <option value="E-Cheq">E-Cheq</option>
                <option value="Cheque">Cheque Físico</option>
                <option value="Mercado Pago">Mercado Pago</option>
                <option value="Efectivo">Efectivo</option>
              </select>
            </div>
          </div>

          {moneda === 'USD' ? (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-amber-600" />
                <span>Pesificación Dólar para Compra</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Monto USD
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="2000"
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

              <div className="pt-2 flex justify-between items-center text-xs text-amber-900 dark:text-amber-200 font-bold">
                <span>Resultado Total ARS:</span>
                <span className="text-base font-black text-amber-700 dark:text-amber-300">
                  ${(montoARS || 0).toLocaleString('es-AR')} ARS
                </span>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Importe Total (ARS)
              </label>
              <input
                type="number"
                placeholder="2100000"
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
              placeholder="Notas de recepción, remito, depósito..."
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
              className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl shadow-md"
            >
              Guardar Compra
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
