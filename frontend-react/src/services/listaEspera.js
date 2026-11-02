import { api } from './http';

// Lista de espera de proximos estrenos: el cliente pide que le avisen cuando salgan las entradas.
// ListaEsperaResponseDTO: { peliculaId, peliculaTitulo, fechaEstreno, clienteId, fechaAlta }

export async function getListaEspera(clienteId) {
  return api.get(`/api/clientes/${clienteId}/lista-espera`);
}

export async function anotarEnListaEspera(peliculaId, clienteId) {
  return api.post(`/api/peliculas/${peliculaId}/lista-espera`, { clienteId });
}

export async function quitarDeListaEspera(peliculaId, clienteId) {
  return api.delete(`/api/peliculas/${peliculaId}/lista-espera/${clienteId}`);
}
