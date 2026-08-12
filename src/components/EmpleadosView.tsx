import React, { useState } from 'react';
import { UserPlus, DollarSign, Users, Trash2, CheckCircle, Clock } from 'lucide-react';
import { Empleado, Adelanto } from '../types';
import { Modal } from './Modal';
import { fmtFecha } from '../services/exportService';

interface EmpleadosViewProps {
  empleados: Empleado[];
  adelantos: Adelanto[];
  onAddEmpleado: (emp: Omit<Empleado, 'id'>) => void;
  onAddAdelanto: (ade: Omit<Adelanto, 'id'>) => void;
  onToggleEmpleadoStatus: (id: string) => void;
  onDeleteEmpleado: (id: string) => void;
  onNotify: (msg: string, type: 'success' | 'warning' | 'danger' | 'info') => void;
}

export const EmpleadosView: React.FC<EmpleadosViewProps> = ({
  empleados,
  adelantos,
  onAddEmpleado,
  onAddAdelanto,
  onToggleEmpleadoStatus,
  onDeleteEmpleado,
  onNotify,
}) => {
  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
  const [isAdeModalOpen, setIsAdeModalOpen] = useState(false);

  // Employee Form State
  const [nombre, setNombre] = useState('');
  const [cargo, setCargo] = useState('Administrativo');
  const [cuilDni, setCuilDni] = useState('');
  const [sueldoBase, setSueldoBase] = useState<number | ''>('');
  const [fechaIngreso, setFechaIngreso] = useState(new Date().toISOString().split('T')[0]);

  // Advance Form State
  const [selectedEmpleadoId, setSelectedEmpleadoId] = useState('');
  const [adeMonto, setAdeMonto] = useState<number | ''>('');
  const [adeFecha, setAdeFecha] = useState(new Date().toISOString().split('T')[0]);
  const [adeConcepto, setAdeConcepto] = useState('Adelanto quincenal de sueldo');

  const handleAddEmpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    onAddEmpleado({
      nombre: nombre.trim(),
      cargo: cargo.trim(),
      cuilDni: cuilDni.trim() || 'No especificado',
      sueldoBase: typeof sueldoBase === 'number' ? sueldoBase : 0,
      fechaIngreso,
      activo: true,
    });

    onNotify('✅ Empleado registrado con éxito', 'success');
    setIsEmpModalOpen(false);

    // Reset
    setNombre('');
    setCuilDni('');
    setSueldoBase('');
  };

  const handleAddAdeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = empleados.find((e) => e.id === selectedEmpleadoId);
    if (!emp) {
      onNotify('⚠️ Seleccione un empleado válido', 'warning');
      return;
    }

    const montoNum = typeof adeMonto === 'number' ? adeMonto : 0;
    if (montoNum <= 0) {
      onNotify('⚠️ Ingrese un monto de adelanto válido', 'warning');
      return;
    }

    onAddAdelanto({
      empleadoId: emp.id,
      empleadoNombre: emp.nombre,
      fecha: adeFecha,
      monto: montoNum,
      concepto: adeConcepto.trim(),
      descontado: false,
    });

    onNotify(`✅ Adelanto de $${montoNum.toLocaleString('es-AR')} otorgado a ${emp.nombre}`, 'success');
    setIsAdeModalOpen(false);

    // Reset
    setAdeMonto('');
  };

  const totalSueldos = empleados.filter((e) => e.activo).reduce((acc, e) => acc + e.sueldoBase, 0);
  const totalAdelantosPendientes = adelantos
    .filter((a) => !a.descontado)
    .reduce((acc, a) => acc + a.monto, 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>👥 Empleados & Adelantos de Sueldo</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 font-semibold border border-indigo-200 dark:border-indigo-800">
              {empleados.length} Personal
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Gestión de nómina, haberes y adelantos de sueldo otorgados
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => {
              if (empleados.length === 0) {
                onNotify('⚠️ Debe registrar al menos un empleado primero', 'warning');
                return;
              }
              setSelectedEmpleadoId(empleados[0].id);
              setIsAdeModalOpen(true);
            }}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded-lg transition shadow-2xs cursor-pointer"
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Registrar Adelanto</span>
          </button>

          <button
            onClick={() => setIsEmpModalOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition shadow-2xs cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Nuevo Empleado</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 rounded-xl shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Masa Salarial Mensual (Activos)
            </span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              ${totalSueldos.toLocaleString('es-AR')} <span className="text-xs font-normal text-slate-500">ARS</span>
            </div>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-lg">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 rounded-xl shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Adelantos Otorgados (Pendientes)
            </span>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              ${totalAdelantosPendientes.toLocaleString('es-AR')} <span className="text-xs font-normal text-slate-500">ARS</span>
            </div>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-lg">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Employee List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {empleados.map((emp) => {
          const empAdelantos = adelantos.filter((a) => a.empleadoId === emp.id);
          const totalAde = empAdelantos.reduce((acc, a) => acc + a.monto, 0);
          const sueldoLiquidoAproximado = emp.sueldoBase - totalAde;

          return (
            <div
              key={emp.id}
              className={`p-5 rounded-xl bg-white dark:bg-slate-900 border shadow-2xs flex flex-col justify-between space-y-4 ${
                emp.activo
                  ? 'border-gray-200/80 dark:border-slate-800'
                  : 'border-gray-200 dark:border-slate-800 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    {emp.cargo}
                  </span>
                  <button
                    onClick={() => onToggleEmpleadoStatus(emp.id)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold cursor-pointer ${
                      emp.activo
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800'
                        : 'bg-gray-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {emp.activo ? 'Activo' : 'Inactivo'}
                  </button>
                </div>

                <h3 className="text-base font-semibold text-slate-900 dark:text-white mt-1">
                  {emp.nombre}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">CUIL: {emp.cuilDni}</p>

                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Sueldo Base:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      ${emp.sueldoBase.toLocaleString('es-AR')}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Adelantos Otorgados:</span>
                    <span className="font-semibold text-amber-600 dark:text-amber-400">
                      -${totalAde.toLocaleString('es-AR')}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs font-bold pt-1 border-t border-gray-100 dark:border-slate-800">
                    <span className="text-indigo-600 dark:text-indigo-400">Saldo a Cobrar:</span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      ${Math.max(0, sueldoLiquidoAproximado).toLocaleString('es-AR')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-[10px] text-slate-400">
                  Ingreso: {fmtFecha(emp.fechaIngreso)}
                </span>
                <button
                  onClick={() => {
                    if (confirm(`¿Eliminar empleado ${emp.nombre}?`)) {
                      onDeleteEmpleado(emp.id);
                      onNotify('Empleado eliminado', 'info');
                    }
                  }}
                  className="p-1 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Advances Table */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-2xs">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-500" />
          <span>Historial de Adelantos de Sueldo</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-gray-200/80 dark:border-slate-800">
              <tr>
                <th className="p-3">Fecha</th>
                <th className="p-3">Empleado</th>
                <th className="p-3">Concepto</th>
                <th className="p-3 text-right">Monto ARS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {adelantos.length > 0 ? (
                adelantos.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50/60 dark:hover:bg-slate-800/40">
                    <td className="p-3 text-slate-600 dark:text-slate-300">{fmtFecha(a.fecha)}</td>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">
                      {a.empleadoNombre}
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">{a.concepto}</td>
                    <td className="p-3 text-right font-bold text-amber-600 dark:text-amber-400">
                      ${a.monto.toLocaleString('es-AR')} ARS
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-slate-400 font-medium">
                    No hay adelantos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nuevo Empleado */}
      <Modal
        isOpen={isEmpModalOpen}
        onClose={() => setIsEmpModalOpen(false)}
        title="Registrar Nuevo Empleado"
      >
        <form onSubmit={handleAddEmpSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              Nombre Completo
            </label>
            <input
              type="text"
              placeholder="Ej. Juan Pérez"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Cargo / Puesto
              </label>
              <input
                type="text"
                placeholder="Ej. Vendedor, Desarrollador, Contador"
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                CUIL / DNI
              </label>
              <input
                type="text"
                placeholder="20-12345678-9"
                value={cuilDni}
                onChange={(e) => setCuilDni(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Sueldo Base Mensual (ARS)
              </label>
              <input
                type="number"
                placeholder="1200000"
                value={sueldoBase}
                onChange={(e) => setSueldoBase(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Fecha de Ingreso
              </label>
              <input
                type="date"
                value={fechaIngreso}
                onChange={(e) => setFechaIngreso(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsEmpModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md"
            >
              Guardar Empleado
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Registrar Adelanto */}
      <Modal
        isOpen={isAdeModalOpen}
        onClose={() => setIsAdeModalOpen(false)}
        title="Otorgar Adelanto de Sueldo"
      >
        <form onSubmit={handleAddAdeSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              Seleccionar Empleado
            </label>
            <select
              value={selectedEmpleadoId}
              onChange={(e) => setSelectedEmpleadoId(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white font-bold"
              required
            >
              {empleados.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.nombre} - ({emp.cargo})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Monto del Adelanto (ARS)
              </label>
              <input
                type="number"
                placeholder="150000"
                value={adeMonto}
                onChange={(e) => setAdeMonto(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white font-bold text-amber-600 dark:text-amber-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Fecha
              </label>
              <input
                type="date"
                value={adeFecha}
                onChange={(e) => setAdeFecha(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              Concepto / Motivo
            </label>
            <input
              type="text"
              placeholder="Ej. Adelanto quincenal de haberes"
              value={adeConcepto}
              onChange={(e) => setAdeConcepto(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsAdeModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl shadow-md"
            >
              Confirmar Adelanto
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
