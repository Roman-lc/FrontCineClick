import { useCallback, useState } from 'react';
import DialogoConfirmar from './DialogoConfirmar';

export function useConfirmacion() {
  const [pedido, setPedido] = useState(null);
  const confirmar = useCallback((opciones) => new Promise((resolve) => setPedido({ ...opciones, resolve })), []);
  const responder = (valor) => {
    pedido.resolve(valor);
    setPedido(null);
  };
  return [confirmar, <DialogoConfirmar key="confirmacion" pedido={pedido} onResponder={responder} />];
}
