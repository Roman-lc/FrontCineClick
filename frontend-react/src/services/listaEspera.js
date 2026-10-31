import { api } from './http';
import { USE_MOCKS } from '../mocks/simular';
import { anotarMock, listaEsperaMock, quitarMock } from '../mocks/listaEspera';

// Lista de espera de proximos estrenos: el cliente pide que le avisen cuando salgan las entradas.
// ListaEsperaResponseDTO: { peliculaId, peliculaTitulo, fechaEstreno, clienteId, fechaAlta }

export async function getListaEspera(clienteId) {
  if (USE_MOCKS) return listaEsperaMock(clienteId);
  return api.get(`/api/clientes/${clienteId}/lista-espera`);
}

export async function anotarEnListaEspera(peliculaId, clienteId) {
  if (USE_MOCKS) return anotarMock(peliculaId, clienteId);
  return api.post(`/api/peliculas/${peliculaId}/lista-espera`, { clienteId });
}

export async function quitarDeListaEspera(peliculaId, clienteId) {
  if (USE_MOCKS) return quitarMock(peliculaId, clienteId);
  return api.delete(`/api/peliculas/${peliculaId}/lista-espera/${clienteId}`);
}
