import React, { useState } from 'react';
import { DollarSign, RefreshCw, Calculator, Edit3, TrendingUp, Check } from 'lucide-react';
import { CotizacionDolar } from '../types';
import { fetchLiveDolarQuote } from '../services/dolarService';
import { Modal } from './Modal';

interface DolarBannerProps {
  cotizacion: CotizacionDolar;
  onUpdateCotizacion: (newCot: CotizacionDolar) => void;
  onNotify: (msg: string, type: 'success' | 'warning' | 'danger' | 'info') => void;
}

export const DolarBanner: React.FC<DolarBannerProps> = ({
  cotizacion,
  onUpdateCotizacion,
  onNotify,
}) => {
  const [loading, setLoading] = useState(false);
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Edit form state
  const [editCompra, setEditCompra] = useState(cotizacion.compra);
  const [editVenta, setEditVenta] = useState(cotizacion.venta);
  const [editFuente, setEditFuente] = useState(cotizacion.fuente);

  // Calculator state
  const [calcUsd, setCalcUsd] = useState<number | ''>(100);
  const [calcArs, setCalcArs] = useState<number | ''>('');

  const handleFetchLive = async () => {
    setLoading(true);
    try {
      const { oficial } = await fetchLiveDolarQuote();
      onUpdateCotizacion(oficial);
      onNotify(`✅ Cotización actualizada desde ${oficial.fuente}: Venta $${oficial.venta}`, 'success');
    } catch {
      onNotify('⚠️ No se pudo obtener la cotización en vivo. Mantenida valor actual.', 'warning');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCot: CotizacionDolar = {
      compra: Number(editCompra) || 0,
      venta: Number(editVenta) || 0,
      fecha: new Date().toLocaleDateString('es-AR') + ' ' + new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      fuente: editFuente || 'Manual',
    };
    onUpdateCotizacion(newCot);
    setIsEditOpen(false);
    onNotify('✅ Cotización guardada manualmente', 'success');
  };

  const usdValue = typeof calcUsd === 'number' ? calcUsd : 0;
  const convertedArs = Math.round(usdValue * cotizacion.venta);

  const arsValue = typeof calcArs === 'number' ? calcArs : 0;
  const convertedUsd = cotizacion.venta > 0 ? (arsValue / cotizacion.venta).toFixed(2) : '0';

  return (
    <>
      <div className="mb-4 p-4 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-2xs border border-gray-200/80 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left info */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg border border-emerald-200/80 dark:border-emerald-800">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-900 dark:text-white">
                Cotización Dólar Pesificación:
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-medium border border-emerald-200 dark:border-emerald-800">
                {cotizacion.fuente}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Actualizado: <span className="font-medium text-slate-700 dark:text-slate-300">{cotizacion.fecha}</span>
            </p>
          </div>
        </div>

        {/* Rates badges */}
        <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-800/80 px-4 py-2 rounded-lg border border-gray-200/80 dark:border-slate-700">
          <div className="text-center px-2">
            <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              Compra
            </span>
            <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
              ${cotizacion.compra.toLocaleString('es-AR')}
            </span>
          </div>
          <div className="h-7 w-px bg-gray-200 dark:bg-slate-700" />
          <div className="text-center px-2">
            <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              Venta / Tipo Cambio
            </span>
            <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">
              ${cotizacion.venta.toLocaleString('es-AR')}
            </span>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleFetchLive}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition shadow-2xs disabled:opacity-50 cursor-pointer"
            title="Consultar API Banco Nación en tiempo real"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualizar Live</span>
          </button>

          <button
            onClick={() => {
              setEditCompra(cotizacion.compra);
              setEditVenta(cotizacion.venta);
              setEditFuente(cotizacion.fuente);
              setIsEditOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg border border-gray-200 dark:border-slate-700 transition cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-indigo-500" />
            <span>Editar</span>
          </button>

          <button
            onClick={() => setIsCalcOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition shadow-2xs cursor-pointer"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Calculadora USD</span>
          </button>
        </div>
      </div>

      {/* Modal Editar Cotización */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Editar Cotización del Dólar"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              Fuente / Descripción
            </label>
            <input
              type="text"
              value={editFuente}
              onChange={(e) => setEditFuente(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              placeholder="e.g. Banco Nación Oficial, Dólar Blue, MEP"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Precio Compra (ARS)
              </label>
              <input
                type="number"
                step="0.01"
                value={editCompra}
                onChange={(e) => setEditCompra(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Precio Venta / Pesificación (ARS)
              </label>
              <input
                type="number"
                step="0.01"
                value={editVenta}
                onChange={(e) => setEditVenta(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Guardar Cotización
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Calculadora de Pesificación */}
      <Modal
        isOpen={isCalcOpen}
        onClose={() => setIsCalcOpen(false)}
        title="Calculadora Rápida de Pesificación Dólar"
      >
        <div className="space-y-6">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 flex items-center justify-between">
            <span>Tipo de cambio actual para conversión:</span>
            <span className="font-bold text-sm text-indigo-700 dark:text-indigo-300">
              1 USD = ${cotizacion.venta.toLocaleString('es-AR')} ARS
            </span>
          </div>

          {/* USD -> ARS */}
          <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Convertir Dólares (USD) a Pesos (ARS)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Monto en USD
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    value={calcUsd}
                    onChange={(e) => setCalcUsd(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-600 text-slate-900 dark:text-white font-bold"
                    placeholder="100"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Equivalente en Pesos (ARS)
                </label>
                <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-600 dark:text-emerald-400 font-black text-lg">
                  ${convertedArs.toLocaleString('es-AR')} ARS
                </div>
              </div>
            </div>
          </div>

          {/* ARS -> USD */}
          <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Convertir Pesos (ARS) a Dólares (USD)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Monto en ARS
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    value={calcArs}
                    onChange={(e) => setCalcArs(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-600 text-slate-900 dark:text-white font-bold"
                    placeholder="100000"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Equivalente en Dólares (USD)
                </label>
                <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-600 dark:text-indigo-300 font-black text-lg">
                  ${convertedUsd} USD
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setIsCalcOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500"
            >
              Cerrar
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
