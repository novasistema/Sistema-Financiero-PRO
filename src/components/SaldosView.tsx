import React, { useState } from 'react';
import { Wallet, ArrowLeftRight, Edit3, Plus, ArrowRight } from 'lucide-react';
import { Saldos, MovimientoInterno, MetodoPago } from '../types';
import { Modal } from './Modal';
import { fmtFecha } from '../services/exportService';

interface SaldosViewProps {
  saldos: Saldos;
  movimientos: MovimientoInterno[];
  onUpdateSaldos: (saldos: Saldos) => void;
  onAddMovimiento: (mov: Omit<MovimientoInterno, 'id'>) => void;
  onNotify: (msg: string, type: 'success' | 'warning' | 'danger' | 'info') => void;
}

export const SaldosView: React.FC<SaldosViewProps> = ({
  saldos,
  movimientos,
  onUpdateSaldos,
  onAddMovimiento,
  onNotify,
}) => {
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Transfer form
  const [origen, setOrigen] = useState<MetodoPago>('Efectivo');
  const [destino, setDestino] = useState<MetodoPago>('Banco');
  const [monto, setMonto] = useState<number | ''>('');
  const [concepto, setConcepto] = useState('Transferencia de fondos');

  // Edit saldos form
  const [editEfectivo, setEditEfectivo] = useState(saldos.efectivo);
  const [editBanco, setEditBanco] = useState(saldos.banco);
  const [editMP, setEditMP] = useState(saldos.mp);
  const [editCheques, setEditCheques] = useState(saldos.cheques);
  const [editECheq, setEditECheq] = useState(saldos.echeq);

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (origen === destino) {
      onNotify('⚠️ La cuenta de origen y destino no pueden ser la misma', 'warning');
      return;
    }

    const transferMonto = typeof monto === 'number' ? monto : 0;
    if (transferMonto <= 0) {
      onNotify('⚠️ Ingrese un monto de transferencia válido', 'warning');
      return;
    }

    onAddMovimiento({
      fecha: new Date().toISOString().split('T')[0],
      origen,
      destino,
      monto: transferMonto,
      concepto: concepto.trim(),
    });

    onNotify('✅ Transferencia entre cuentas registrada', 'success');
    setIsTransferModalOpen(false);

    // Reset
    setMonto('');
  };

  const handleEditSaldosSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSaldos({
      efectivo: Number(editEfectivo) || 0,
      banco: Number(editBanco) || 0,
      mp: Number(editMP) || 0,
      cheques: Number(editCheques) || 0,
      echeq: Number(editECheq) || 0,
    });
    onNotify('✅ Saldos de caja actualizados', 'success');
    setIsEditModalOpen(false);
  };

  const totalSaldos =
    saldos.efectivo + saldos.banco + saldos.mp + saldos.cheques + saldos.echeq;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>💳 Saldos de Caja, Cuentas y Cartera</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Estado de liquidez disponible y movimientos internos entre cuentas
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => {
              setEditEfectivo(saldos.efectivo);
              setEditBanco(saldos.banco);
              setEditMP(saldos.mp);
              setEditCheques(saldos.cheques);
              setEditECheq(saldos.echeq);
              setIsEditModalOpen(true);
            }}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-lg transition border border-gray-200 dark:border-slate-700 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-indigo-500" />
            <span>Ajustar Saldos</span>
          </button>

          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition shadow-2xs cursor-pointer"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Transferencia Interna</span>
          </button>
        </div>
      </div>

      {/* Account Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-2xs text-center">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Efectivo en Caja
          </span>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">
            ${saldos.efectivo.toLocaleString('es-AR')}
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-2xs text-center">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Banco Cta Cte
          </span>
          <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-1">
            ${saldos.banco.toLocaleString('es-AR')}
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-2xs text-center">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Mercado Pago
          </span>
          <div className="text-lg font-bold text-cyan-600 dark:text-cyan-400 mt-1">
            ${saldos.mp.toLocaleString('es-AR')}
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-2xs text-center">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Cheques Físicos
          </span>
          <div className="text-lg font-bold text-purple-600 dark:text-purple-400 mt-1">
            ${saldos.cheques.toLocaleString('es-AR')}
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-2xs text-center">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            E-Cheqs
          </span>
          <div className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-1">
            ${saldos.echeq.toLocaleString('es-AR')}
          </div>
        </div>
      </div>

      <div className="p-5 bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 rounded-xl shadow-2xs flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
          Patrimonio Líquido Total en Cuentas
        </span>
        <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
          ${totalSaldos.toLocaleString('es-AR')} <span className="text-xs font-normal text-slate-500">ARS</span>
        </span>
      </div>

      {/* Movements Table */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-2xs">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <ArrowLeftRight className="w-4 h-4 text-emerald-500" />
          <span>Historial de Movimientos e Intercambios Internos</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-gray-200/80 dark:border-slate-800">
              <tr>
                <th className="p-3">Fecha</th>
                <th className="p-3">Origen</th>
                <th className="p-3">Destino</th>
                <th className="p-3">Concepto</th>
                <th className="p-3 text-right">Monto ARS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {movimientos.length > 0 ? (
                movimientos.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50/60 dark:hover:bg-slate-800/40">
                    <td className="p-3 text-slate-600 dark:text-slate-300">{fmtFecha(m.fecha)}</td>
                    <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">
                      {m.origen}
                    </td>
                    <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <ArrowRight className="w-3 h-3" />
                      <span>{m.destino}</span>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">{m.concepto}</td>
                    <td className="p-3 text-right font-bold text-slate-900 dark:text-white">
                      ${m.monto.toLocaleString('es-AR')} ARS
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400 font-medium">
                    No hay movimientos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Transferencia Interna */}
      <Modal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        title="Nueva Transferencia Interna de Fondos"
      >
        <form onSubmit={handleTransferSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Cuenta Origen (Sale)
              </label>
              <select
                value={origen}
                onChange={(e) => setOrigen(e.target.value as MetodoPago)}
                className="w-full px-3 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white font-bold"
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Banco">Banco / Cta Cte</option>
                <option value="Mercado Pago">Mercado Pago</option>
                <option value="Cheque">Cheque Físico</option>
                <option value="E-Cheq">E-Cheq</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Cuenta Destino (Entra)
              </label>
              <select
                value={destino}
                onChange={(e) => setDestino(e.target.value as MetodoPago)}
                className="w-full px-3 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white font-bold text-emerald-600"
              >
                <option value="Banco">Banco / Cta Cte</option>
                <option value="Mercado Pago">Mercado Pago</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Cheque">Cheque Físico</option>
                <option value="E-Cheq">E-Cheq</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              Monto a Transferir (ARS)
            </label>
            <input
              type="number"
              placeholder="100000"
              value={monto}
              onChange={(e) => setMonto(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white font-bold text-lg"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              Concepto / Nota
            </label>
            <input
              type="text"
              placeholder="Ej. Depósito por autoservicio bancario"
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsTransferModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md"
            >
              Realizar Transferencia
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Ajustar Saldos */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Ajuste Manual de Saldos Iniciales"
      >
        <form onSubmit={handleEditSaldosSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Efectivo (ARS)
              </label>
              <input
                type="number"
                value={editEfectivo}
                onChange={(e) => setEditEfectivo(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Banco (ARS)
              </label>
              <input
                type="number"
                value={editBanco}
                onChange={(e) => setEditBanco(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Mercado Pago (ARS)
              </label>
              <input
                type="number"
                value={editMP}
                onChange={(e) => setEditMP(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Cheques Físicos
              </label>
              <input
                type="number"
                value={editCheques}
                onChange={(e) => setEditCheques(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                E-Cheqs
              </label>
              <input
                type="number"
                value={editECheq}
                onChange={(e) => setEditECheq(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white font-bold"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md"
            >
              Guardar Saldos
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
