// Textos de los estados que llegan del backend, para el listado y el detalle de compras del panel
export const ESTADOS_COMPRA = {
  CONFIRMADA: { texto: 'Confirmada', activo: true },
  PENDIENTE_PAGO: { texto: 'Pendiente de pago', activo: false },
  CANCELADA: { texto: 'Cancelada', activo: false },
  ARREPENTIDA: { texto: 'Arrepentida', activo: false },
};

export const ESTADOS_ENTRADA = { EMITIDA: 'Emitida', USADA: 'Usada', CANCELADA: 'Anulada' };

export const ESTADOS_PAGO = { PENDIENTE: 'Pendiente', APROBADO: 'Aprobado', RECHAZADO: 'Rechazado', REEMBOLSADO: 'Reembolsado' };

export const METODOS_PAGO = {
  TARJETA_CREDITO: 'Tarjeta de crédito',
  TARJETA_DEBITO: 'Tarjeta de débito',
  MERCADO_PAGO: 'Mercado Pago',
  EFECTIVO: 'Efectivo',
  SIN_CARGO: 'Sin cargo',
};

export const ESTADOS_ARREPENTIMIENTO = { APROBADA: 'Aprobada', FUERA_DE_PLAZO: 'Fuera de plazo (para revisar)', RECHAZADA: 'Rechazada' };

export const MOTIVOS_SOPORTE = {
  PROBLEMA_COMPRA: 'Problema con mi compra',
  PAGO: 'Pago',
  CUENTA: 'Mi cuenta',
  SUGERENCIA: 'Sugerencia',
  OTRO: 'Otro',
};
