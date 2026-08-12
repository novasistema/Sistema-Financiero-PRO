import React, { useState } from 'react';
import { PiggyBank, Plus, Edit3, TrendingUp, TrendingDown } from 'lucide-react';
import { Ahorro } from '../types';
import { Modal } from './Modal';
import { fmtFecha } from '../services/exportService';

interface AhorrosViewProps {
  ahorros: Ahorro;
  onUpdateAhorro: (ahorro: Ahorro) => void;
  onNotify: (msg: string, type: 'success' | 'warning' | 'danger' | 'info') => void;
}

export const AhorrosView: React.FC<AhorrosViewProps> = ({
  ahorros,
  onUpdateAhorro,
  onNotify,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);

  // Contribution Form State
  const [tipoMov, setTipoMov] = useState<'Aporte' | 'Retiro'>('Aporte');
  const [monto, setMonto] = useState<number | ''>('');
  const [nota, setNota] = useState('');

  // Meta Form State
  const [nuevaMeta, setNuevaMeta] = useState(ahorros.meta);

  const porcentaje = ahorros.meta > 0 ? Math.min(100, Math.round((ahorros.actual / ahorros.meta) * 100)) : 0;

  const handleMovSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const montoNum = typeof monto === 'number' ? monto : 0;
    if (montoNum <= 0) {
      onNotify('⚠️ Ingrese un monto válido', 'warning');
      return;
    }

    let nuevoActual = ahorros.actual;
    if (tipoMov === 'Aporte') {
      nuevoActual += montoNum;
    } else {
      nuevoActual = Math.max(0, nuevoActual - montoNum);
    }

    const nuevoHistorial = [
      {
        id: `aho-${Date.now()}`,
        fecha: new Date().toISOString().split('T')[0],
        tipo: tipoMov,
        monto: montoNum,
        nota: nota.trim() || (tipoMov === 'Aporte' ? 'Depósito de ahorro' : 'Retiro de fondos'),
      },
      ...ahorros.historial,
    ];

    onUpdateAhorro({
      ...ahorros,
      actual: nuevoActual,
      historial: nuevoHistorial,
    });

    onNotify(
      `✅ ${tipoMov === 'Aporte' ? 'Aporte registrado' : 'Retiro registrado'} correctamente`,
      'success'
    );
    setIsModalOpen(false);

    setMonto('');
    setNota('');
  };

  const handleMetaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateAhorro({
      ...ahorros,
      meta: Number(nuevaMeta) || 0,
    });
    onNotify('✅ Meta de ahorro actualizada', 'success');
    setIsMetaModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>🐖 Fondo de Ahorros & Meta Financiera</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Reserva de capital para inversiones, contingencias o expansión
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => {
              setNuevaMeta(ahorros.meta);
              setIsMetaModalOpen(true);
            }}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-lg transition border border-gray-200 dark:border-slate-700 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-indigo-500" />
            <span>Editar Meta</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo Aporte / Retiro</span>
          </button>
        </div>
      </div>

      {/* Progress Card */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Acumulado Actual
            </span>
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              ${ahorros.actual.toLocaleString('es-AR')} <span className="text-xs font-normal text-slate-500">ARS</span>
            </div>
          </div>

          <div className="sm:text-right">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Meta Objetiva
            </span>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              ${ahorros.meta.toLocaleString('es-AR')} <span className="text-xs font-normal text-slate-500">ARS</span>
            </div>
          </div>
        </div>

        {/* Bar */}
        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
            <span>Progreso Alcanzado:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{porcentaje}%</span>
          </div>
          <div className="w-full h-3 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${porcentaje}%` }}
            />
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-2xs">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <PiggyBank className="w-4 h-4 text-emerald-500" />
          <span>Historial de Fondos de Reserva</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-gray-200/80 dark:border-slate-800">
              <tr>
                <th className="p-3">Fecha</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Detalle / Nota</th>
                <th className="p-3 text-right">Monto ARS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {ahorros.historial.length > 0 ? (
                ahorros.historial.map((h) => (
                  <tr key={h.id} className="hover:bg-gray-50/60 dark:hover:bg-slate-800/40">
                    <td className="p-3 text-slate-600 dark:text-slate-300">{fmtFecha(h.fecha)}</td>
                    <td className="p-3 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 w-max ${
                          h.tipo === 'Aporte'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800'
                            : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-800'
                        }`}
                      >
                        {h.tipo === 'Aporte' ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        <span>{h.tipo}</span>
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">{h.nota}</td>
                    <td
                      className={`p-3 text-right font-bold text-sm ${
                        h.tipo === 'Aporte'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {h.tipo === 'Aporte' ? '+' : '-'}${h.monto.toLocaleString('es-AR')} ARS
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-slate-400 font-medium">
                    No hay registros de aportes ni retiros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Aporte / Retiro */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registrar Aporte o Retiro de Ahorros"
      >
        <form onSubmit={handleMovSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              Tipo de Operación
            </label>
            <select
              value={tipoMov}
              onChange={(e) => setTipoMov(e.target.value as any)}
              className="w-full px-3 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white font-bold"
            >
              <option value="Aporte">Aporte / Depósito de Fondo (+)</option>
              <option value="Retiro">Retiro de Fondo (-)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              Monto (ARS)
            </label>
            <input
              type="number"
              placeholder="500000"
              value={monto}
              onChange={(e) => setMonto(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white font-bold text-lg"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              Nota / Concepto
            </label>
            <input
              type="text"
              placeholder="Ej. Reserva de ganancias del mes"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
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
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md"
            >
              Confirmar
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Editar Meta */}
      <Modal
        isOpen={isMetaModalOpen}
        onClose={() => setIsMetaModalOpen(false)}
        title="Modificar Meta de Ahorro"
      >
        <form onSubmit={handleMetaSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              Nueva Meta en Pesos (ARS)
            </label>
            <input
              type="number"
              value={nuevaMeta}
              onChange={(e) => setNuevaMeta(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white font-bold text-lg"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsMetaModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md"
            >
              Guardar Meta
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
