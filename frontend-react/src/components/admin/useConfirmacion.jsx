import { useCallback, useState } from 'react';
import DialogoConfirmar from './DialogoConfirmar';

// Dialogo de confirmacion del panel. Uso:
//   const [confirmar, dialogo] = useConfirmacion();
//   if (await confirmar({ titulo, mensaje, textoConfirmar, peligro })) ...
//   ...y renderizar {dialogo} en la pagina.
// Con soloAceptar se muestra un unico boton (para avisos que no tienen alternativa).
// peligro: true deja el boton con borde carmesi; peligro: 'borrado' lo llena (solo para confirmar un borrado).
export function useConfirmacion() {
  const [pedido, setPedido] = useState(null);
  const confirmar = useCallback((opciones) => new Promise((resolve) => setPedido({ ...opciones, resolve })), []);
  const responder = (valor) => {
    pedido.resolve(valor);
    setPedido(null);
  };
  return [confirmar, <DialogoConfirmar key="confirmacion" pedido={pedido} onResponder={responder} />];
}
