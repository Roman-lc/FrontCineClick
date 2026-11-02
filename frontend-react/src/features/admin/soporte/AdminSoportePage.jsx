import { useState } from 'react';
import { Link } from 'react-router-dom';
import BadgeEstado from '../../../components/admin/BadgeEstado';
import PaginaGestion, { SinDato } from '../../../components/admin/PaginaGestion';
import { useListado } from '../../../components/admin/useListado';
import admin from '../../../components/admin/admin.module.css';
import { useToast } from '../../../components/ui/useToast';
import { fechaHoraBreve } from '../../../lib/fechas';
import { clave } from '../../../lib/normalizar';
import { adminSoporte } from '../../../services/admin';
import styles from './soporte.module.css';

const MOTIVOS = { PROBLEMA_COMPRA: 'Problema con mi compra', PAGO: 'Pago', CUENTA: 'Mi cuenta', SUGERENCIA: 'Sugerencia', OTRO: 'Otro' };
const FILTROS = [
  { valor: 'ABIERTA', texto: 'Abiertas' },
  { valor: 'RESUELTA', texto: 'Resueltas' },
  { valor: 'todos', texto: 'Todas' },
];

export default function AdminSoportePage() {
  const { mostrarAviso } = useToast();
  const listado = useListado(() => adminSoporte.listar());
  const consultas = listado.datos ?? [];
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState('ABIERTA');

  const resolver = async (consulta) => {
    try {
      await adminSoporte.resolver(consulta.id);
      mostrarAviso(`${consulta.numero} marcada como resuelta`, 'exito');
      listado.recargar();
    } catch {
      mostrarAviso('No se pudo actualizar la consulta. Intentá de nuevo.', 'error');
    }
  };

  const filtradas = consultas.filter(
    (c) =>
      (estado === 'todos' || c.estado === estado) &&
      [c.numero, c.email, c.nombre].some((valor) => clave(valor).includes(clave(busqueda)))
  );

  return (
    <PaginaGestion
      titulo="Soporte"
      busqueda={busqueda}
      onBuscar={setBusqueda}
      etiquetaBusqueda="Buscar por número, nombre o email"
      estado={estado}
      onEstado={setEstado}
      opcionesEstado={FILTROS}
      carga={{ cargando: listado.cargando, error: listado.error, onReintentar: listado.reintentar }}
      total={consultas.length}
      cantidad={filtradas.length}
      textoCantidad={(n) => `${n} ${n === 1 ? 'consulta' : 'consultas'}`}
      vacio={{ titulo: 'Todavía no hay consultas', mensaje: 'Las que lleguen desde Ayuda aparecen acá.' }}
    >
      <table className={admin.tabla}>
        <thead>
          <tr>
            <th scope="col">Número</th>
            <th scope="col">Fecha</th>
            <th scope="col">De</th>
            <th scope="col">Motivo</th>
            <th scope="col">Mensaje</th>
            <th scope="col">Estado</th>
            <th scope="col" className={admin.colAcciones}>
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {filtradas.map((c) => (
            <tr key={c.id}>
              <td className={admin.codigo}>{c.numero}</td>
              <td className={admin.numero}>{fechaHoraBreve(c.fecha)}</td>
              <td>
                {c.nombre}
                <span className={admin.secundario}>{c.email}</span>
              </td>
              <td>
                {MOTIVOS[c.motivo] ?? c.motivo}
                <span className={admin.secundario}>{c.compraId ? <Link to={`/admin/compras?compra=${c.compraId}`}>Compra N° {c.compraId}</Link> : <SinDato />}</span>
              </td>
              <td className={styles.mensaje}>
                <details>
                  <summary>{c.mensaje.length > 60 ? `${c.mensaje.slice(0, 60)}…` : c.mensaje}</summary>
                  <p>{c.mensaje}</p>
                </details>
              </td>
              <td>
                <BadgeEstado activo={c.estado === 'ABIERTA'} texto={c.estado === 'ABIERTA' ? 'Abierta' : 'Resuelta'} />
              </td>
              <td>
                {c.estado === 'ABIERTA' && (
                  <div className={admin.acciones}>
                    <button type="button" className="btn btn-sm" onClick={() => resolver(c)}>
                      Marcar como resuelta
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </PaginaGestion>
  );
}
