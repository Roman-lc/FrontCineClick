// Utilidades de fecha compartidas.
// Las fechas viajan como string ISO (yyyy-mm-dd), asi se comparan y ordenan
// como texto y no hay corrimientos por zona horaria.

const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

function hoyISO() {
    const hoy = new Date();
    return aISO(hoy.getFullYear(), hoy.getMonth() + 1, hoy.getDate());
}

function sumarDiasISO(iso, dias) {
    const [anio, mes, dia] = iso.split('-').map(Number);
    const fecha = new Date(anio, mes - 1, dia + dias);
    return aISO(fecha.getFullYear(), fecha.getMonth() + 1, fecha.getDate());
}

function aISO(anio, mes, dia) {
    return `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}

// "Hoy · 22/10", "Mañana · 23/10" o "Sábado 24/10"
function etiquetaFecha(iso) {
    const [anio, mes, dia] = iso.split('-').map(Number);
    const corta = `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}`;

    if (iso === hoyISO()) return `Hoy · ${corta}`;
    if (iso === sumarDiasISO(hoyISO(), 1)) return `Mañana · ${corta}`;

    const diaSemana = new Date(anio, mes - 1, dia).getDay();
    return `${DIAS_SEMANA[diaSemana]} ${corta}`;
}

// Toma la parte de fecha de un LocalDateTime del backend ("2026-10-22T18:00:00")
function fechaDeFuncion(funcion) {
    return (funcion.fechaHoraInicio || '').slice(0, 10);
}
