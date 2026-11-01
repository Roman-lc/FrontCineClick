import { listarAsociados } from './erroresApi';

// Flujo de "Eliminar" del patron de gestion:
// 1. Confirmacion "¿Eliminar X? Esta accion no se puede deshacer".
// 2. Si el backend responde 409 (tiene datos asociados), se ofrece la alternativa: desactivar
//    (o cancelar, en las funciones) para que deje de aparecer en el sitio.
//   alternativa(item, asociados): { titulo, mensaje, textoConfirmar, accion } o null si no hay.
export function useEliminacion({ confirmar, mostrarAviso, nombreDe, eliminar, textoEliminado, alternativa, onCambio }) {
  return async function iniciar(item) {
    const nombre = nombreDe(item);
    const seguro = await confirmar({
      titulo: `¿Eliminar ${nombre}?`,
      mensaje: 'Esta acción no se puede deshacer.',
      textoConfirmar: 'Eliminar',
      peligro: 'borrado',
    });
    if (!seguro) return;
    try {
      await eliminar(item);
      mostrarAviso(textoEliminado, 'exito');
      onCambio();
    } catch (err) {
      if (err.status !== 409) {
        mostrarAviso(err.status === 0 ? 'No se pudo conectar con el servidor.' : 'No se pudo eliminar. Intentá de nuevo.', 'error');
        return;
      }
      const opcion = alternativa(item, listarAsociados(err.detalles));
      if (!opcion.accion) {
        await confirmar({ titulo: `No se puede eliminar ${nombre}`, mensaje: opcion.mensaje, textoConfirmar: 'Entendido', soloAceptar: true });
        return;
      }
      const aceptar = await confirmar({ titulo: `No se puede eliminar ${nombre}`, mensaje: opcion.mensaje, textoConfirmar: opcion.textoConfirmar });
      if (!aceptar) return;
      try {
        await opcion.accion();
        mostrarAviso(opcion.textoListo, 'exito');
        onCambio();
      } catch {
        mostrarAviso('No se pudo completar la acción. Intentá de nuevo.', 'error');
      }
    }
  };
}
