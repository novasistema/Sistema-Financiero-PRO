import { CotizacionDolar } from '../types';

export interface DolarQuoteApi {
  moneda: string;
  casa: string;
  nombre: string;
  compra: number;
  venta: number;
  fechaActualizacion: string;
}

export async function fetchLiveDolarQuote(): Promise<{ oficial: CotizacionDolar; blue?: CotizacionDolar }> {
  try {
    const response = await fetch('https://dolarapi.com/v1/dolares');
    if (response.ok) {
      const data: DolarQuoteApi[] = await response.json();
      const oficialData = data.find((d) => d.casa === 'oficial') || data[0];
      const blueData = data.find((d) => d.casa === 'blue');

      const oficial: CotizacionDolar = {
        compra: oficialData?.compra || 1050,
        venta: oficialData?.venta || 1090,
        fecha: oficialData?.fechaActualizacion
          ? new Date(oficialData.fechaActualizacion).toLocaleString('es-AR')
          : new Date().toLocaleDateString('es-AR'),
        fuente: 'Banco Nación (Oficial)',
      };

      const blue: CotizacionDolar | undefined = blueData
        ? {
            compra: blueData.compra,
            venta: blueData.venta,
            fecha: blueData.fechaActualizacion
              ? new Date(blueData.fechaActualizacion).toLocaleString('es-AR')
              : new Date().toLocaleDateString('es-AR'),
            fuente: 'Dólar Blue',
          }
        : undefined;

      return { oficial, blue };
    }
  } catch (error) {
    console.warn('Error fetching live dollar quote:', error);
  }

  // Default fallback if network error or offline
  return {
    oficial: {
      compra: 1045,
      venta: 1085,
      fecha: new Date().toLocaleDateString('es-AR'),
      fuente: 'Banco Nación (Manual)',
    },
    blue: {
      compra: 1210,
      venta: 1230,
      fecha: new Date().toLocaleDateString('es-AR'),
      fuente: 'Dólar Blue (Manual)',
    },
  };
}
