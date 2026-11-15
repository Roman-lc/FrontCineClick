import { requisitosPassword } from './validacionRegistro';

export default function RequisitosPassword({ id, password }) {
  return (
    <ul id={id} className="form-requisitos" aria-label="Requisitos de la contraseña">
      {requisitosPassword(password).map((r) => (
        <li key={r.id} data-icono={r.ok ? 'ok' : undefined} className={r.ok ? 'cumple' : ''}>
          {r.texto}
          <span className="visually-hidden">{r.ok ? ' (cumplido)' : ' (pendiente)'}</span>
        </li>
      ))}
    </ul>
  );
}
