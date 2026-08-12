export type Moneda = 'ARS' | 'USD';

export type EstadoPago = 'Pagado' | 'Cobrado' | 'Pendiente' | 'Vencido' | 'Próximo';

export type TipoGasto = 'Fijo' | 'Variable';

export type MetodoPago = 'Efectivo' | 'Banco' | 'Mercado Pago' | 'Cheque' | 'E-Cheq';

export interface CotizacionDolar {
  compra: number;
  venta: number;
  fecha: string;
  fuente: string;
}

export interface Ingreso {
  id: string;
  fecha: string; // YYYY-MM-DD
  cliente: string;
  tipo: string; // e.g. Venta, Servicio, Honorarios
  importe: number; // Siempre guardado en ARS
  moneda: Moneda;
  importeOriginalUSD?: number;
  cotizacionUsada?: number;
  metodoCobro: MetodoPago;
  estado: 'Cobrado' | 'Pendiente';
  observaciones?: string;
}

export interface Gasto {
  id: string;
  fecha: string;
  clasificacion: TipoGasto;
  categoria: string; // Alquiler, Servicios, Impuestos, Sueldos, Mantenimiento, Marketing, etc.
  item: string;
  metodoPago: MetodoPago;
  importe: number; // ARS
  moneda: Moneda;
  importeOriginalUSD?: number;
  cotizacionUsada?: number;
  estado: 'Pagado' | 'Pendiente';
  observaciones?: string;
}

export interface Compra {
  id: string;
  fecha: string;
  categoria: string; // Mercadería, Insumos, Equipamiento, Materia Prima, etc.
  proveedor: string;
  descripcion: string;
  metodoPago: MetodoPago;
  importe: number; // ARS
  moneda: Moneda;
  importeOriginalUSD?: number;
  cotizacionUsada?: number;
  estado: 'Completada' | 'Pendiente';
  observaciones?: string;
}

export interface Empleado {
  id: string;
  nombre: string;
  cargo: string;
  cuilDni: string;
  sueldoBase: number;
  fechaIngreso: string;
  activo: boolean;
  observaciones?: string;
}

export interface Adelanto {
  id: string;
  empleadoId: string;
  empleadoNombre: string;
  fecha: string;
  monto: number;
  concepto: string;
  descontado: boolean;
}

export interface MovimientoInterno {
  id: string;
  fecha: string;
  origen: MetodoPago;
  destino: MetodoPago;
  monto: number;
  concepto: string;
}

export interface CuentaPorCobrarPagar {
  id: string;
  tipo: 'Por Cobrar' | 'Por Pagar';
  entidad: string; // Cliente o Proveedor
  concepto: string;
  montoARS: number;
  moneda: Moneda;
  montoUSD?: number;
  cotizacion?: number;
  fechaEmision: string;
  fechaVencimiento: string;
  estado: EstadoPago;
  observaciones?: string;
}

export interface Cliente {
  id: string;
  nombre: string;
  cuitDni: string;
  telefono: string;
  email: string;
  categoria: string;
  notas?: string;
}

export interface Proveedor {
  id: string;
  nombre: string;
  cuit: string;
  telefono: string;
  email?: string;
  rubro: string;
  cbuAlias?: string;
  notas?: string;
}

export interface Saldos {
  efectivo: number;
  banco: number;
  mp: number;
  cheques: number;
  echeq: number;
}

export interface Ahorro {
  meta: number;
  actual: number;
  historial: {
    id: string;
    fecha: string;
    tipo: 'Aporte' | 'Retiro';
    monto: number;
    nota: string;
  }[];
}

export interface ConfigSistema {
  dark: boolean;
  notificaciones: boolean;
  alertaVencimientoDias: number;
}

export interface SistemaData {
  ingresos: Ingreso[];
  gastos: Gasto[];
  compras: Compra[];
  empleados: Empleado[];
  adelantos: Adelanto[];
  movimientos: MovimientoInterno[];
  cuentas: CuentaPorCobrarPagar[];
  clientes: Cliente[];
  proveedores: Proveedor[];
  saldos: Saldos;
  ahorros: Ahorro;
  config: ConfigSistema;
  cotizacionDolar: CotizacionDolar;
}
