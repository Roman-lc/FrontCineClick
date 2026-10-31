import { ApiError } from '../services/http';
import { simular, simularNoEncontrado } from './simular';
import { peliculasMock } from './peliculas';
import { proximosEstrenosMock } from './destacadas';

// Lista de espera en memoria: se pierde al recargar la pagina
const avisos = [];

function aDto(aviso) {
  const pelicula = peliculasMock.find((p) => p.id === aviso.peliculaId);
  return { ...aviso, peliculaTitulo: pelicula.titulo, fechaEstreno: pelicula.fechaEstreno };
}

export async function listaEsperaMock(clienteId) {
  return simular(avisos.filter((a) => a.clienteId === Number(clienteId)).map(aDto));
}

export async function anotarMock(peliculaId, clienteId) {
  const pelicula = peliculasMock.find((p) => p.id === Number(peliculaId));
  if (!pelicula) return simularNoEncontrado(`Pelicula no encontrada con id ${peliculaId}`);
  const proxima = proximosEstrenosMock().find((d) => d.pelicula.id === pelicula.id);
  if (proxima?.categoria !== 'PROXIMAMENTE') {
    await simular(null);
    throw new ApiError(400, 'Solo se puede pedir aviso para peliculas que todavia no estan a la venta');
  }
  let aviso = avisos.find((a) => a.peliculaId === pelicula.id && a.clienteId === Number(clienteId));
  if (!aviso) {
    aviso = { peliculaId: pelicula.id, clienteId: Number(clienteId), fechaAlta: new Date().toISOString() };
    avisos.push(aviso);
  }
  return simular(aDto(aviso));
}

export async function quitarMock(peliculaId, clienteId) {
  const i = avisos.findIndex((a) => a.peliculaId === Number(peliculaId) && a.clienteId === Number(clienteId));
  if (i >= 0) avisos.splice(i, 1);
  return simular(null);
}
