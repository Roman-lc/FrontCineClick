// En las listas de una sola opcion el panel se cierra al elegir con el mouse (e.detail > 0),
// pero no al moverse con las flechas del teclado, que tambien disparan el click del radio.
export const cerrarSiFueMouse = (cerrar) => (e) => {
  if (e.detail > 0) cerrar();
};
