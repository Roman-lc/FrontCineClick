// Utilidades de fecha compartidas.
// Las fechas viajan como string ISO (yyyy-mm-dd), asi se comparan y ordenan
// como texto y no hay corrimientos por zona horaria.

const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const DIAS_SEMANA_CORTOS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function hoyISO() {
    const hoy = new Date();
    return aISO(hoy.getFullYear(), hoy.getMonth() + 1, hoy.getDate());
}

function aISO(anio, mes, dia) {
    return `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}

function sumarDiasISO(iso, dias) {
    const [anio, mes, dia] = iso.split('-').map(Number);
    const fecha = new Date(anio, mes - 1, dia + dias);
    return aISO(fecha.getFullYear(), fecha.getMonth() + 1, fecha.getDate());
}

function fechaCorta(iso) {
    const [, mes, dia] = iso.split('-').map(Number);
    return `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}`;
}

function diaSemanaCorto(iso) {
    const [anio, mes, dia] = iso.split('-').map(Number);
    return DIAS_SEMANA_CORTOS[new Date(anio, mes - 1, dia).getDay()];
}

// "Hoy · 22/10", "Mañana · 23/10" o "Sábado 24/10"
function etiquetaFecha(iso) {
    const hoy = hoyISO();
    if (iso === hoy) return `Hoy · ${fechaCorta(iso)}`;
    if (iso === sumarDiasISO(hoy, 1)) return `Mañana · ${fechaCorta(iso)}`;

    const [anio, mes, dia] = iso.split('-').map(Number);
    return `${DIAS_SEMANA[new Date(anio, mes - 1, dia).getDay()]} ${fechaCorta(iso)}`;
}

// Toma la parte de fecha de un LocalDateTime del backend ("2026-10-22T18:00:00")
function fechaDeFuncion(funcion) {
    return (funcion.fechaHoraInicio || '').slice(0, 10);
}

// Una función sirve si no está cancelada y todavía no empezó.
// El backend no filtra ninguna de las dos cosas, así que se descartan acá.
function funcionVigente(funcion) {
    if (!funcion || !funcion.fechaHoraInicio) return false;
    if (funcion.estado === 'CANCELADA') return false;
    return new Date(funcion.fechaHoraInicio) >= new Date();
}

// "04:00 p. m." -> "16:00" (es-AR suele caer en formato 12h según el navegador)
function horaCorta(fechaHora) {
    return new Date(fechaHora).toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
}

// Igual que horaCorta pero con la fecha adelante: "23/10/2026 16:00"
function fechaHoraCorta(fechaHora) {
    const fecha = new Date(fechaHora);
    return `${fecha.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })} ${horaCorta(fechaHora)}`;
}
