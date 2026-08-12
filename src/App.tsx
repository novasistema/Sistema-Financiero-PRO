import React, { useState, useEffect, useRef } from 'react';
import { SistemaData, Ingreso, Gasto, Compra, Empleado, Adelanto, MovimientoInterno, CuentaPorCobrarPagar, Cliente, Proveedor, Saldos, Ahorro, CotizacionDolar } from './types';
import { initialSistemaData } from './data/initialData';
import { fetchLiveDolarQuote } from './services/dolarService';
import { subscribeToSistemaData, saveSistemaDataToCloud } from './lib/firebase';
import { Sidebar, TabId } from './components/Sidebar';
import { DolarBanner } from './components/DolarBanner';
import { DashboardView } from './components/DashboardView';
import { IngresosView } from './components/IngresosView';
import { GastosView } from './components/GastosView';
import { ComprasView } from './components/ComprasView';
import { EmpleadosView } from './components/EmpleadosView';
import { SaldosView } from './components/SaldosView';
import { CuentasView } from './components/CuentasView';
import { ContactosView } from './components/ContactosView';
import { AhorrosView } from './components/AhorrosView';
import { ExportarView } from './components/ExportarView';
import { exportTodoToExcel } from './services/exportService';

interface NotificationToast {
  id: string;
  msg: string;
  type: 'success' | 'warning' | 'danger' | 'info';
}

export default function App() {
  const [data, setData] = useState<SistemaData>(() => {
    try {
      const saved = localStorage.getItem('sistema_v10');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...initialSistemaData,
          ...parsed,
          saldos: { ...initialSistemaData.saldos, ...(parsed.saldos || {}) },
          config: { ...initialSistemaData.config, ...(parsed.config || {}) },
        };
      }
    } catch (e) {
      console.error('Error reading localStorage:', e);
    }
    return initialSistemaData;
  });

  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [notifs, setNotifs] = useState<NotificationToast[]>([]);
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const isRemoteChange = useRef(false);

  // Toast Notification Helper
  const notify = (msg: string, type: 'success' | 'warning' | 'danger' | 'info') => {
    const id = `notif-${Date.now()}-${Math.random()}`;
    setNotifs((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setNotifs((prev) => prev.filter((n) => n.id !== id));
    }, 3500);
  };

  // Subscribe to real-time Cloud updates from Firestore
  useEffect(() => {
    const unsubscribe = subscribeToSistemaData((cloudData) => {
      if (cloudData) {
        isRemoteChange.current = true;
        setData((prev) => ({
          ...initialSistemaData,
          ...cloudData,
          saldos: { ...initialSistemaData.saldos, ...(cloudData.saldos || {}) },
          config: { ...initialSistemaData.config, ...(cloudData.config || {}) },
        }));
        setIsCloudConnected(true);
      } else {
        // First initialization on cloud: push initial local data
        saveSistemaDataToCloud(data).catch(console.error);
        setIsCloudConnected(true);
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync to Cloud & LocalStorage whenever local state changes
  useEffect(() => {
    try {
      localStorage.setItem('sistema_v10', JSON.stringify(data));
    } catch (e) {
      console.error('Error saving localStorage:', e);
    }

    if (isRemoteChange.current) {
      isRemoteChange.current = false;
      return;
    }

    saveSistemaDataToCloud(data).catch((e) => {
      console.error('Error syncing to Firestore:', e);
    });
  }, [data]);

  // Dark mode class toggle
  useEffect(() => {
    if (data.config.dark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [data.config.dark]);

  // Auto-fetch live Dollar rate on first load
  useEffect(() => {
    fetchLiveDolarQuote()
      .then(({ oficial }) => {
        if (oficial) {
          setData((prev) => ({
            ...prev,
            cotizacionDolar: oficial,
          }));
        }
      })
      .catch(() => {});
  }, []);

  // Handlers
  const handleToggleDark = () => {
    setData((prev) => ({
      ...prev,
      config: { ...prev.config, dark: !prev.config.dark },
    }));
  };

  const handleUpdateCotizacion = (cotizacionDolar: CotizacionDolar) => {
    setData((prev) => ({ ...prev, cotizacionDolar }));
  };

  const handleAddIngreso = (newIngreso: Omit<Ingreso, 'id'>) => {
    const ingreso: Ingreso = { id: `ing-${Date.now()}`, ...newIngreso };
    setData((prev) => {
      // Update balance if paid
      const newSaldos = { ...prev.saldos };
      if (ingreso.estado === 'Cobrado') {
        if (ingreso.metodoCobro === 'Efectivo') newSaldos.efectivo += ingreso.importe;
        else if (ingreso.metodoCobro === 'Banco') newSaldos.banco += ingreso.importe;
        else if (ingreso.metodoCobro === 'Mercado Pago') newSaldos.mp += ingreso.importe;
        else if (ingreso.metodoCobro === 'Cheque') newSaldos.cheques += ingreso.importe;
        else if (ingreso.metodoCobro === 'E-Cheq') newSaldos.echeq += ingreso.importe;
      }

      return {
        ...prev,
        saldos: newSaldos,
        ingresos: [ingreso, ...prev.ingresos],
      };
    });
  };

  const handleDeleteIngreso = (id: string) => {
    setData((prev) => ({
      ...prev,
      ingresos: prev.ingresos.filter((i) => i.id !== id),
    }));
  };

  const handleAddGasto = (newGasto: Omit<Gasto, 'id'>) => {
    const gasto: Gasto = { id: `gas-${Date.now()}`, ...newGasto };
    setData((prev) => {
      const newSaldos = { ...prev.saldos };
      if (gasto.estado === 'Pagado') {
        if (gasto.metodoPago === 'Efectivo') newSaldos.efectivo -= gasto.importe;
        else if (gasto.metodoPago === 'Banco') newSaldos.banco -= gasto.importe;
        else if (gasto.metodoPago === 'Mercado Pago') newSaldos.mp -= gasto.importe;
        else if (gasto.metodoPago === 'Cheque') newSaldos.cheques -= gasto.importe;
        else if (gasto.metodoPago === 'E-Cheq') newSaldos.echeq -= gasto.importe;
      }

      return {
        ...prev,
        saldos: newSaldos,
        gastos: [gasto, ...prev.gastos],
      };
    });
  };

  const handleDeleteGasto = (id: string) => {
    setData((prev) => ({
      ...prev,
      gastos: prev.gastos.filter((g) => g.id !== id),
    }));
  };

  const handleAddCompra = (newCompra: Omit<Compra, 'id'>) => {
    const compra: Compra = { id: `com-${Date.now()}`, ...newCompra };
    setData((prev) => {
      const newSaldos = { ...prev.saldos };
      if (compra.estado === 'Completada') {
        if (compra.metodoPago === 'Efectivo') newSaldos.efectivo -= compra.importe;
        else if (compra.metodoPago === 'Banco') newSaldos.banco -= compra.importe;
        else if (compra.metodoPago === 'Mercado Pago') newSaldos.mp -= compra.importe;
        else if (compra.metodoPago === 'Cheque') newSaldos.cheques -= compra.importe;
        else if (compra.metodoPago === 'E-Cheq') newSaldos.echeq -= compra.importe;
      }

      return {
        ...prev,
        saldos: newSaldos,
        compras: [compra, ...prev.compras],
      };
    });
  };

  const handleDeleteCompra = (id: string) => {
    setData((prev) => ({
      ...prev,
      compras: prev.compras.filter((c) => c.id !== id),
    }));
  };

  const handleAddEmpleado = (newEmp: Omit<Empleado, 'id'>) => {
    const emp: Empleado = { id: `emp-${Date.now()}`, ...newEmp };
    setData((prev) => ({ ...prev, empleados: [...prev.empleados, emp] }));
  };

  const handleToggleEmpleadoStatus = (id: string) => {
    setData((prev) => ({
      ...prev,
      empleados: prev.empleados.map((e) => (e.id === id ? { ...e, activo: !e.activo } : e)),
    }));
  };

  const handleDeleteEmpleado = (id: string) => {
    setData((prev) => ({
      ...prev,
      empleados: prev.empleados.filter((e) => e.id !== id),
    }));
  };

  const handleAddAdelanto = (newAde: Omit<Adelanto, 'id'>) => {
    const ade: Adelanto = { id: `ade-${Date.now()}`, ...newAde };
    setData((prev) => {
      // Also register as Gasto in Sueldos
      const autoGasto: Gasto = {
        id: `gas-ade-${Date.now()}`,
        fecha: ade.fecha,
        clasificacion: 'Fijo',
        categoria: 'Sueldos',
        item: `Adelanto Sueldo - ${ade.empleadoNombre}`,
        metodoPago: 'Efectivo',
        importe: ade.monto,
        moneda: 'ARS',
        estado: 'Pagado',
        observaciones: ade.concepto,
      };

      const newSaldos = { ...prev.saldos, efectivo: prev.saldos.efectivo - ade.monto };

      return {
        ...prev,
        saldos: newSaldos,
        adelantos: [ade, ...prev.adelantos],
        gastos: [autoGasto, ...prev.gastos],
      };
    });
  };

  const handleAddMovimiento = (newMov: Omit<MovimientoInterno, 'id'>) => {
    const mov: MovimientoInterno = { id: `mov-${Date.now()}`, ...newMov };
    setData((prev) => {
      const newSaldos = { ...prev.saldos };

      // Subtract from origin
      if (mov.origen === 'Efectivo') newSaldos.efectivo -= mov.monto;
      else if (mov.origen === 'Banco') newSaldos.banco -= mov.monto;
      else if (mov.origen === 'Mercado Pago') newSaldos.mp -= mov.monto;
      else if (mov.origen === 'Cheque') newSaldos.cheques -= mov.monto;
      else if (mov.origen === 'E-Cheq') newSaldos.echeq -= mov.monto;

      // Add to destination
      if (mov.destino === 'Efectivo') newSaldos.efectivo += mov.monto;
      else if (mov.destino === 'Banco') newSaldos.banco += mov.monto;
      else if (mov.destino === 'Mercado Pago') newSaldos.mp += mov.monto;
      else if (mov.destino === 'Cheque') newSaldos.cheques += mov.monto;
      else if (mov.destino === 'E-Cheq') newSaldos.echeq += mov.monto;

      return {
        ...prev,
        saldos: newSaldos,
        movimientos: [mov, ...prev.movimientos],
      };
    });
  };

  const handleUpdateSaldos = (saldos: Saldos) => {
    setData((prev) => ({ ...prev, saldos }));
  };

  const handleAddCuenta = (newCuenta: Omit<CuentaPorCobrarPagar, 'id'>) => {
    const cuenta: CuentaPorCobrarPagar = { id: `cue-${Date.now()}`, ...newCuenta };
    setData((prev) => ({ ...prev, cuentas: [cuenta, ...prev.cuentas] }));
  };

  const handlePagarOCobrarCuenta = (cuenta: CuentaPorCobrarPagar) => {
    setData((prev) => {
      const nuevoEstado = cuenta.tipo === 'Por Cobrar' ? 'Cobrado' : 'Pagado';
      const updatedCuentas = prev.cuentas.map((c) =>
        c.id === cuenta.id ? { ...c, estado: nuevoEstado as any } : c
      );

      let newIngresos = [...prev.ingresos];
      let newGastos = [...prev.gastos];

      if (cuenta.tipo === 'Por Cobrar') {
        const autoIngreso: Ingreso = {
          id: `ing-cue-${Date.now()}`,
          fecha: new Date().toISOString().split('T')[0],
          cliente: cuenta.entidad,
          tipo: 'Cobro de Cuenta',
          importe: cuenta.montoARS,
          moneda: cuenta.moneda,
          importeOriginalUSD: cuenta.montoUSD,
          cotizacionUsada: cuenta.cotizacion,
          metodoCobro: 'Banco',
          estado: 'Cobrado',
          observaciones: `Cobro de cuenta por cobrar (${cuenta.concepto})`,
        };
        newIngresos = [autoIngreso, ...newIngresos];
      } else {
        const autoGasto: Gasto = {
          id: `gas-cue-${Date.now()}`,
          fecha: new Date().toISOString().split('T')[0],
          clasificacion: 'Variable',
          categoria: 'Servicios',
          item: `Pago a ${cuenta.entidad} - ${cuenta.concepto}`,
          metodoPago: 'Banco',
          importe: cuenta.montoARS,
          moneda: cuenta.moneda,
          importeOriginalUSD: cuenta.montoUSD,
          cotizacionUsada: cuenta.cotizacion,
          estado: 'Pagado',
          observaciones: `Pago de cuenta por pagar`,
        };
        newGastos = [autoGasto, ...newGastos];
      }

      return {
        ...prev,
        cuentas: updatedCuentas,
        ingresos: newIngresos,
        gastos: newGastos,
      };
    });
  };

  const handleDeleteCuenta = (id: string) => {
    setData((prev) => ({
      ...prev,
      cuentas: prev.cuentas.filter((c) => c.id !== id),
    }));
  };

  const handleAddCliente = (newCli: Omit<Cliente, 'id'>) => {
    const cli: Cliente = { id: `cli-${Date.now()}`, ...newCli };
    setData((prev) => ({ ...prev, clientes: [...prev.clientes, cli] }));
  };

  const handleDeleteCliente = (id: string) => {
    setData((prev) => ({
      ...prev,
      clientes: prev.clientes.filter((c) => c.id !== id),
    }));
  };

  const handleAddProveedor = (newPro: Omit<Proveedor, 'id'>) => {
    const pro: Proveedor = { id: `pro-${Date.now()}`, ...newPro };
    setData((prev) => ({ ...prev, proveedores: [...prev.proveedores, pro] }));
  };

  const handleDeleteProveedor = (id: string) => {
    setData((prev) => ({
      ...prev,
      proveedores: prev.proveedores.filter((p) => p.id !== id),
    }));
  };

  const handleUpdateAhorro = (ahorros: Ahorro) => {
    setData((prev) => ({ ...prev, ahorros }));
  };

  const handleResetData = () => {
    setData(initialSistemaData);
    notify('✅ Sistema restablecido a los datos demo iniciales', 'info');
  };

  const handleQuickExport = () => {
    const ok = exportTodoToExcel(data);
    if (ok) notify('✅ Exportación completa realizada', 'success');
    else notify('⚠️ No hay datos para exportar', 'warning');
  };

  const pendingCuentasCount = data.cuentas.filter(
    (c) => c.estado === 'Vencido' || c.estado === 'Próximo'
  ).length;

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row transition-colors font-sans">
      {/* Toast Notification Stack */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {notifs.map((n) => (
          <div
            key={n.id}
            className={`p-3.5 rounded-xl shadow-sm text-xs font-medium pointer-events-auto border backdrop-blur-md animate-fadeIn flex items-center justify-between ${
              n.type === 'success'
                ? 'bg-slate-900/95 text-emerald-400 border-slate-800'
                : n.type === 'warning'
                ? 'bg-slate-900/95 text-amber-400 border-slate-800'
                : n.type === 'danger'
                ? 'bg-slate-900/95 text-rose-400 border-slate-800'
                : 'bg-slate-900/95 text-indigo-300 border-slate-800'
            }`}
          >
            <span>{n.msg}</span>
          </div>
        ))}
      </div>

      {/* Left Sidebar Menu */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingCountCount={pendingCuentasCount}
        dark={data.config.dark}
        onToggleDark={handleToggleDark}
        onResetData={handleResetData}
        onQuickExport={handleQuickExport}
        cloudSyncActive={isCloudConnected}
      />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-5 max-w-7xl">
        {/* Dolar Rate Live Banner */}
        <DolarBanner
          cotizacion={data.cotizacionDolar}
          onUpdateCotizacion={handleUpdateCotizacion}
          onNotify={notify}
        />

        {/* Tab Views */}
        <main className="pb-12">
          {activeTab === 'dashboard' && (
            <DashboardView data={data} onNavigateTab={setActiveTab} />
          )}

          {activeTab === 'ingresos' && (
            <IngresosView
              ingresos={data.ingresos}
              cotizacionDolar={data.cotizacionDolar}
              onAddIngreso={handleAddIngreso}
              onDeleteIngreso={handleDeleteIngreso}
              onNotify={notify}
            />
          )}

          {activeTab === 'gastos' && (
            <GastosView
              gastos={data.gastos}
              cotizacionDolar={data.cotizacionDolar}
              onAddGasto={handleAddGasto}
              onDeleteGasto={handleDeleteGasto}
              onNotify={notify}
            />
          )}

          {activeTab === 'compras' && (
            <ComprasView
              compras={data.compras}
              proveedores={data.proveedores}
              cotizacionDolar={data.cotizacionDolar}
              onAddCompra={handleAddCompra}
              onDeleteCompra={handleDeleteCompra}
              onNotify={notify}
            />
          )}

          {activeTab === 'empleados' && (
            <EmpleadosView
              empleados={data.empleados}
              adelantos={data.adelantos}
              onAddEmpleado={handleAddEmpleado}
              onAddAdelanto={handleAddAdelanto}
              onToggleEmpleadoStatus={handleToggleEmpleadoStatus}
              onDeleteEmpleado={handleDeleteEmpleado}
              onNotify={notify}
            />
          )}

          {activeTab === 'saldos' && (
            <SaldosView
              saldos={data.saldos}
              movimientos={data.movimientos}
              onUpdateSaldos={handleUpdateSaldos}
              onAddMovimiento={handleAddMovimiento}
              onNotify={notify}
            />
          )}

          {activeTab === 'cuentas' && (
            <CuentasView
              cuentas={data.cuentas}
              cotizacionDolar={data.cotizacionDolar}
              onAddCuenta={handleAddCuenta}
              onPagarOCobrarCuenta={handlePagarOCobrarCuenta}
              onDeleteCuenta={handleDeleteCuenta}
              onNotify={notify}
            />
          )}

          {activeTab === 'contactos' && (
            <ContactosView
              clientes={data.clientes}
              proveedores={data.proveedores}
              onAddCliente={handleAddCliente}
              onAddProveedor={handleAddProveedor}
              onDeleteCliente={handleDeleteCliente}
              onDeleteProveedor={handleDeleteProveedor}
              onNotify={notify}
            />
          )}

          {activeTab === 'ahorros' && (
            <AhorrosView
              ahorros={data.ahorros}
              onUpdateAhorro={handleUpdateAhorro}
              onNotify={notify}
            />
          )}

          {activeTab === 'exportar' && (
            <ExportarView
              data={data}
              onRestoreData={(restored) => {
                setData(restored);
                notify('✅ Base de datos restaurada', 'success');
              }}
              onResetData={handleResetData}
              onNotify={notify}
            />
          )}
        </main>
      </div>
    </div>
  );
}
