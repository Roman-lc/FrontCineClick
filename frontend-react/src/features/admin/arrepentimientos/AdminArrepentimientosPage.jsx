import { useState } from 'react';
import { useAuth } from '../../../app/AuthContext';
import BadgeEstado from '../../../components/admin/BadgeEstado';
import PaginaGestion, { SinDato } from '../../../components/admin/PaginaGestion';
import { useConfirmacion } from '../../../components/admin/useConfirmacion';
import { useListado } from '../../../components/admin/useListado';
import admin from '../../../components/admin/admin.module.css';
import { useToast } from '../../../components/ui/ToastProvider';
import { fechaHoraBreve } from '../../../lib/fechas';
import { formatearPrecio } from '../../../lib/formato';
import { clave } from '../../../lib/normalizar';
import { adminArrepentimientos } from '../../../services/admin';

const ESTADOS = {
  APROBADA: { texto: 'Aprobada', activo: true },
  FUERA_DE_PLAZO: { texto: 'Fuera de plazo', activo: false },
  RECHAZADA: { texto: 'Rechazada', activo: false },
};
const MOTIVOS = { EQUIVOQUE_FUNCION: 'Me equivoqué de función', NO_PUEDO_ASISTIR: 'No puedo asistir', OTRO: 'Otro' };
const FILTROS = [
  { valor: 'FUERA_DE_PLAZO', texto: 'Para revisar' },
  { valor: 'APROBADA', texto: 'Aprobadas' },
  { valor: 'RECHAZADA', texto: 'Rechazadas' },
  { valor: 'todos', texto: 'Todas' },
];

export default function AdminArrepentimientosPage() {
  const { user } = useAuth();
  const { mostrarAviso } = useToast();
  const [confirmar, dialogo] = useConfirmacion();
  const listado = useListado(() => adminArrepentimientos.listar(user.usuarioId));
  const solicitudes = listado.datos ?? [];
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState('FUERA_DE_PLAZO');

  const resolver = async (solicitud, aprobar) => {
    const seguro = await confirmar(
      aprobar
        ? {
            titulo: `¿Aprobar ${solicitud.codigo}?`,
            mensaje: `Se anulan las entradas de la compra N° ${solicitud.compraId}, se liberan las butacas y se registra el reembolso.`,
            textoConfirmar: 'Aprobar y anular la compra',
          }
        : {
            titulo: `¿Rechazar ${solicitud.codigo}?`,
            mensaje: 'La compra sigue confirmada y sus entradas siguen valiendo.',
            textoConfirmar: 'Rechazar',
            peligro: true,
          }
    );
    if (!seguro) return;
    try {
      await (aprobar ? adminArrepentimientos.aprobar(solicitud.id, user.usuarioId) : adminArrepentimientos.rechazar(solicitud.id, user.usuarioId));
      mostrarAviso(aprobar ? `${solicitud.codigo} aprobada: la compra quedó anulada` : `${solicitud.codigo} rechazada`, 'exito');
      listado.recargar();
    } catch {
      mostrarAviso('No se pudo resolver la solicitud. Intentá de nuevo.', 'error');
    }
  };

  const filtradas = solicitudes.filter(
    (s) => (estado === 'todos' || s.estado === estado) && (clave(s.codigo).includes(clave(busqueda)) || clave(s.email).includes(clave(busqueda)))
  );

  return (
    <>
      <PaginaGestion
        titulo="Arrepentimientos"
        busqueda={busqueda}
        onBuscar={setBusqueda}
        etiquetaBusqueda="Buscar por código o email"
        estado={estado}
        onEstado={setEstado}
        opcionesEstado={FILTROS}
        carga={{ cargando: listado.cargando, error: listado.error, onReintentar: listado.reintentar }}
        total={solicitudes.length}
        cantidad={filtradas.length}
        textoCantidad={(n) => `${n} ${n === 1 ? 'solicitud' : 'solicitudes'}`}
        vacio={{ titulo: 'Todavía no hay solicitudes de arrepentimiento', mensaje: 'Las que lleguen desde el botón de arrepentimiento aparecen acá.' }}
      >
        <table className={admin.tabla}>
          <thead>
            <tr>
              <th scope="col">Código</th>
              <th scope="col">Compra</th>
              <th scope="col">Fecha</th>
              <th scope="col">Solicitante</th>
              <th scope="col">Estado</th>
              <th scope="col">Reembolso</th>
              <th scope="col" className={admin.colAcciones}>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {filtradas.map((s) => {
              const est = ESTADOS[s.estado] ?? { texto: s.estado };
              return (
                <tr key={s.id}>
                  <td className={admin.codigo}>{s.codigo}</td>
                  <td>
                    <span className={admin.principal}>N° {s.compraId}</span>
                    <span className={admin.secundario}>{s.peliculaTitulo}</span>
                  </td>
                  <td className={admin.numero}>{fechaHoraBreve(s.fecha)}</td>
                  <td>
                    {s.nombre}
                    <span className={admin.secundario}>{s.email}</span>
                    {s.motivo && <span className={admin.secundario}>{MOTIVOS[s.motivo]}</span>}
                  </td>
                  <td>
                    <BadgeEstado activo={est.activo} texto={est.texto} />
                    {s.motivoFueraDePlazo && <span className={admin.secundario}>{s.motivoFueraDePlazo}</span>}
                  </td>
                  <td className={admin.numero}>{s.montoReembolso != null ? formatearPrecio(s.montoReembolso) : <SinDato />}</td>
                  <td>
                    {s.estado === 'FUERA_DE_PLAZO' && (
                      <div className={admin.acciones}>
                        <button type="button" className="btn btn-sm" onClick={() => resolver(s, true)}>
                          Aprobar
                        </button>
                        <button type="button" className="btn btn-sm btn-danger" onClick={() => resolver(s, false)}>
                          Rechazar
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </PaginaGestion>
      {dialogo}
    </>
  );
}
