import * as XLSX from 'xlsx';
import { SistemaData, Ingreso, Gasto, Compra, CuentaPorCobrarPagar } from '../types';

export function fmtFecha(fechaStr: string): string {
  if (!fechaStr) return '-';
  try {
    const [y, m, d] = fechaStr.split('-');
    if (y && m && d) return `${d}/${m}/${y}`;
    return new Date(fechaStr).toLocaleDateString('es-AR');
  } catch {
    return fechaStr;
  }
}

export function exportIngresosToExcel(ingresos: Ingreso[]) {
  if (!ingresos.length) return false;

  const exportData = ingresos.map((i) => ({
    Fecha: fmtFecha(i.fecha),
    Cliente: i.cliente || '-',
    Tipo: i.tipo || '-',
    'Importe ARS': i.importe,
    Moneda: i.moneda || 'ARS',
    'Importe USD': i.importeOriginalUSD || 0,
    'Cotización USD': i.cotizacionUsada || 0,
    'Método Cobro': i.metodoCobro,
    Estado: i.estado,
    Observaciones: i.observaciones || '',
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(exportData);

  ws['!cols'] = [
    { wch: 12 },
    { wch: 25 },
    { wch: 20 },
    { wch: 15 },
    { wch: 10 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 12 },
    { wch: 25 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Ingresos');
  XLSX.writeFile(wb, `Ingresos_${new Date().toISOString().split('T')[0]}.xlsx`);
  return true;
}

export function exportGastosToExcel(gastos: Gasto[]) {
  if (!gastos.length) return false;

  const exportData = gastos.map((g) => ({
    Fecha: fmtFecha(g.fecha),
    Clasificación: g.clasificacion,
    Categoría: g.categoria || '-',
    Item: g.item || '-',
    'Método Pago': g.metodoPago || '-',
    'Importe ARS': g.importe,
    Moneda: g.moneda || 'ARS',
    'Importe USD': g.importeOriginalUSD || 0,
    'Cotización USD': g.cotizacionUsada || 0,
    Estado: g.estado,
    Observaciones: g.observaciones || '',
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(exportData);

  ws['!cols'] = [
    { wch: 12 },
    { wch: 14 },
    { wch: 18 },
    { wch: 25 },
    { wch: 15 },
    { wch: 15 },
    { wch: 10 },
    { wch: 15 },
    { wch: 15 },
    { wch: 12 },
    { wch: 25 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Gastos');
  XLSX.writeFile(wb, `Gastos_${new Date().toISOString().split('T')[0]}.xlsx`);
  return true;
}

export function exportComprasToExcel(compras: Compra[]) {
  if (!compras.length) return false;

  const exportData = compras.map((c) => ({
    Fecha: fmtFecha(c.fecha),
    Categoría: c.categoria || '-',
    Proveedor: c.proveedor || '-',
    Descripción: c.descripcion || '-',
    'Método Pago': c.metodoPago || '-',
    'Importe ARS': c.importe,
    Moneda: c.moneda || 'ARS',
    'Importe USD': c.importeOriginalUSD || 0,
    'Cotización USD': c.cotizacionUsada || 0,
    Estado: c.estado,
    Observaciones: c.observaciones || '',
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(exportData);

  ws['!cols'] = [
    { wch: 12 },
    { wch: 18 },
    { wch: 22 },
    { wch: 28 },
    { wch: 15 },
    { wch: 15 },
    { wch: 10 },
    { wch: 15 },
    { wch: 15 },
    { wch: 12 },
    { wch: 25 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Compras');
  XLSX.writeFile(wb, `Compras_${new Date().toISOString().split('T')[0]}.xlsx`);
  return true;
}

export function exportCuentasToExcel(cuentas: CuentaPorCobrarPagar[]) {
  if (!cuentas.length) return false;

  const exportData = cuentas.map((c) => ({
    Tipo: c.tipo,
    Entidad: c.entidad,
    Concepto: c.concepto,
    'Monto ARS': c.montoARS,
    Moneda: c.moneda,
    'Monto USD': c.montoUSD || 0,
    'Emisión': fmtFecha(c.fechaEmision),
    'Vencimiento': fmtFecha(c.fechaVencimiento),
    Estado: c.estado,
    Observaciones: c.observaciones || '',
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(exportData);

  XLSX.utils.book_append_sheet(wb, ws, 'Cuentas_Cobrar_Pagar');
  XLSX.writeFile(wb, `Cuentas_${new Date().toISOString().split('T')[0]}.xlsx`);
  return true;
}

export function exportTodoToExcel(data: SistemaData) {
  const wb = XLSX.utils.book_new();
  let addedAny = false;

  if (data.ingresos.length > 0) {
    const ws = XLSX.utils.json_to_sheet(
      data.ingresos.map((i) => ({
        Fecha: fmtFecha(i.fecha),
        Cliente: i.cliente || '-',
        Tipo: i.tipo || '-',
        'Importe ARS': i.importe,
        Moneda: i.moneda || 'ARS',
        'Importe USD': i.importeOriginalUSD || 0,
        'Cotización': i.cotizacionUsada || 0,
        Metodo: i.metodoCobro,
        Estado: i.estado,
      }))
    );
    XLSX.utils.book_append_sheet(wb, ws, 'Ingresos');
    addedAny = true;
  }

  if (data.gastos.length > 0) {
    const ws = XLSX.utils.json_to_sheet(
      data.gastos.map((g) => ({
        Fecha: fmtFecha(g.fecha),
        Clasificación: g.clasificacion,
        Categoría: g.categoria || '-',
        Item: g.item || '-',
        'Importe ARS': g.importe,
        Moneda: g.moneda || 'ARS',
        'Importe USD': g.importeOriginalUSD || 0,
        'Cotización': g.cotizacionUsada || 0,
        Metodo: g.metodoPago,
        Estado: g.estado,
      }))
    );
    XLSX.utils.book_append_sheet(wb, ws, 'Gastos');
    addedAny = true;
  }

  if (data.compras.length > 0) {
    const ws = XLSX.utils.json_to_sheet(
      data.compras.map((c) => ({
        Fecha: fmtFecha(c.fecha),
        Categoría: c.categoria || '-',
        Proveedor: c.proveedor || '-',
        Descripción: c.descripcion || '-',
        'Importe ARS': c.importe,
        Moneda: c.moneda || 'ARS',
        'Importe USD': c.importeOriginalUSD || 0,
        Metodo: c.metodoPago,
        Estado: c.estado,
      }))
    );
    XLSX.utils.book_append_sheet(wb, ws, 'Compras');
    addedAny = true;
  }

  if (data.cuentas.length > 0) {
    const ws = XLSX.utils.json_to_sheet(
      data.cuentas.map((c) => ({
        Tipo: c.tipo,
        Entidad: c.entidad,
        Concepto: c.concepto,
        'Monto ARS': c.montoARS,
        Moneda: c.moneda,
        'Monto USD': c.montoUSD || 0,
        Vencimiento: fmtFecha(c.fechaVencimiento),
        Estado: c.estado,
      }))
    );
    XLSX.utils.book_append_sheet(wb, ws, 'Cuentas_Cobrar_Pagar');
    addedAny = true;
  }

  if (data.empleados.length > 0) {
    const ws = XLSX.utils.json_to_sheet(
      data.empleados.map((e) => ({
        Nombre: e.nombre,
        Cargo: e.cargo,
        CUIL: e.cuilDni,
        'Sueldo Base ARS': e.sueldoBase,
        Ingreso: fmtFecha(e.fechaIngreso),
        Estado: e.activo ? 'Activo' : 'Inactivo',
      }))
    );
    XLSX.utils.book_append_sheet(wb, ws, 'Empleados');
    addedAny = true;
  }

  if (!addedAny) return false;

  XLSX.writeFile(wb, `Sistema_Financiero_Completo_${new Date().toISOString().split('T')[0]}.xlsx`);
  return true;
}

export function exportBackupJSON(data: SistemaData) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `backup_sistema_financiero_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importBackupJSON(file: File): Promise<SistemaData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (parsed && typeof parsed === 'object') {
          resolve(parsed as SistemaData);
        } else {
          reject(new Error('Formato JSON inválido'));
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsText(file);
  });
}
