let funcionActual = null;
let butacasDisponibles = [];
let butacasSeleccionadas = [];

// Contexto con el que se llegó (película y filtros), para el botón de volver.
const CONTEXTO = { peliculaId: '', cineId: '', fecha: '' };

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    CONTEXTO.peliculaId = params.get('peliculaId') || '';
    CONTEXTO.cineId = params.get('cineId') || '';
    CONTEXTO.fecha = params.get('fecha') || '';
    aplicarLinkVolver();

    if (!id) {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('error').style.display = 'block';
        document.getElementById('error').textContent = 'ID de funciÃ³n no especificado';
        return;
    }
    
    const user = JSON.parse(localStorage.getItem('cineclick_user') || 'null');
    if (!user) {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('loginRequired').style.display = 'block';
        return;
    }
    
    document.getElementById('loginRequired').style.display = 'none';
    await verificarLogin();
    
    cargarFuncionYButacas(id);
    
    // Configurar botÃ³n de pagar
    document.getElementById('btnPagar').addEventListener('click', realizarCompra);
});

// Vuelve a funciones.html conservando los filtros con los que se llegó.
function aplicarLinkVolver() {
    const volver = document.getElementById('volverListado');
    if (!volver) return;
    const query = new URLSearchParams();
    if (CONTEXTO.peliculaId) query.set('peliculaId', CONTEXTO.peliculaId);
    if (CONTEXTO.cineId) query.set('cineId', CONTEXTO.cineId);
    if (CONTEXTO.fecha) query.set('fecha', CONTEXTO.fecha);
    volver.href = 'funciones.html' + (query.toString() ? '?' + query.toString() : '');
}

async function verificarLogin() {
    const user = JSON.parse(localStorage.getItem('cineclick_user') || 'null');
    if (user) {
        document.getElementById('clienteLogueado').style.display = 'block';
        document.getElementById('clienteNoLogueado').style.display = 'none';
        document.getElementById('formCliente').style.display = 'none';
        const nombreCompleto = (user.nombre || user.email || '').trim();
        document.getElementById('clienteLogueadoInfo').innerHTML = `Nombre: ${escapeHtml(nombreCompleto)}<br>Email: ${escapeHtml(user.email)}<br>Rol: ${escapeHtml(user.rol || '')}`;
        window.clienteLogueado = {
            nombre: nombreCompleto,
            email: (user.email || '').trim(),
            rol: user.rol
        };
        // Buscar clienteId por email
        try {
            const resp = await fetch(`${API_BASE_URL}/api/clientes`);
            if (resp.ok) {
                const clientes = await resp.json();
                const cliente = clientes.find(c => c.email && c.email.toLowerCase() === (user.email || '').toLowerCase());
                if (cliente) {
                    window.clienteLogueado.clienteId = cliente.id;
                } else {
                    // La cuenta existe para login pero no tiene perfil de cliente.
                    // No se crea automaticamente: antes se hacia con password '123456',
                    // que dejaba una cuenta de cliente con contrasena fija y desconocida.
                    window.clienteLogueado.sinCliente = true;
                    const info = document.getElementById('clienteLogueadoInfo');
                    if (info) {
                        const motivo = user.rol === 'ADMIN'
                            ? 'Los administradores no pueden comprar como cliente.'
                            : 'Tu cuenta no tiene perfil de cliente. Cerra sesion y registrate desde el formulario de login.';
                        info.innerHTML += '<br><span style="color: var(--danger);">\u26A0\uFE0F ' + escapeHtml(motivo) + '</span>';
                    }
                }
            }
        } catch(e) {}
        if (document.getElementById('btnPagar')) {
            if (user.rol === 'ADMIN' || !window.clienteLogueado.clienteId) {
                document.getElementById('btnPagar').disabled = true;
                document.getElementById('btnPagar').textContent = 'No disponible para este usuario';
            } else {
                document.getElementById('btnPagar').disabled = butacasSeleccionadas.length === 0;
                document.getElementById('btnPagar').textContent = 'Pagar y Confirmar Compra';
            }
        }
    }
}

async function cargarFuncionYButacas(id) {
    const loading = document.getElementById('loading');
    const errorDiv = document.getElementById('error');
    const compraContent = document.getElementById('compraContent');
    
    try {
        loading.style.display = 'block';
        errorDiv.style.display = 'none';
        compraContent.style.display = 'none';
        
        // Cargar funciÃ³n
        const respFuncion = await fetch(`${API_BASE_URL}/api/funciones/${id}`);
        if (!respFuncion.ok) throw new Error('Error al cargar funciÃ³n');
        funcionActual = await respFuncion.json();

        // No se puede comprar para una funciÃ³n vencida o cancelada.
        if (!funcionVigente(funcionActual)) {
            throw new Error('Esta funciÃ³n ya no estÃ¡ disponible (pasada o cancelada).');
        }

        // Cargar butacas disponibles
        const respButacas = await fetch(`${API_BASE_URL}/api/funciones/${id}/butacas-disponibles`);
        if (!respButacas.ok) throw new Error('Error al cargar butacas disponibles');
        butacasDisponibles = await respButacas.json();
        
        loading.style.display = 'none';
        mostrarInfoFuncion();
        mostrarMapaButacas();
        await verificarLogin();
        compraContent.style.display = 'block';
        
        if (typeof updateNavbar === 'function') {
            updateNavbar();
        }
        
    } catch (err) {
        loading.style.display = 'none';
        errorDiv.style.display = 'block';
        errorDiv.textContent = err.message;
    }
}

function mostrarInfoFuncion() {
    const fechaStr = fechaHoraCorta(funcionActual.fechaHoraInicio);

    document.getElementById('infoFuncion').innerHTML = `
        <strong>${escapeHtml(funcionActual.peliculaTitulo || '')}</strong> - ${funcionActual.formato.replace('_', 'D')}<br>
        <small>${escapeHtml(funcionActual.cineNombre || '')} | ${escapeHtml(funcionActual.salaNombre || '')} | ${fechaStr} | ${escapeHtml(funcionActual.idioma)}</small><br>
        <strong style="color: var(--success);">Precio base: $${funcionActual.precioBase.toLocaleString('es-AR')}</strong>
    `;
}

function mostrarMapaButacas() {
    const seatMap = document.getElementById('seatMap');
    seatMap.innerHTML = '';
    
    // Agrupar butacas por fila
    const butacasPorFila = {};
    butacasDisponibles.forEach(butaca => {
        if (!butacasPorFila[butaca.fila]) {
            butacasPorFila[butaca.fila] = [];
        }
        butacasPorFila[butaca.fila].push(butaca);
    });
    
    // Ordenar filas
    const filasOrdenadas = Object.keys(butacasPorFila).sort();
    
    filasOrdenadas.forEach(fila => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'seat-row';
        
        const label = document.createElement('div');
        label.className = 'seat-row-label';
        label.textContent = fila;
        rowDiv.appendChild(label);
        
        // Ordenar butacas por nÃºmero
        butacasPorFila[fila].sort((a, b) => a.numero - b.numero).forEach(butaca => {
            // disponible === false son las ya vendidas para esta funciÃ³n.
            const ocupada = butaca.disponible === false;
            const seat = document.createElement('div');
            seat.className = `seat ${butaca.tipo === 'VIP' ? 'vip' : ''}${ocupada ? ' occupied' : ''}`;
            seat.textContent = butaca.numero;
            seat.dataset.butacaId = butaca.id;
            seat.dataset.fila = butaca.fila;
            seat.dataset.numero = butaca.numero;
            seat.dataset.tipo = butaca.tipo;
            seat.title = ocupada
                ? `${butaca.fila}${butaca.numero} - ocupada`
                : `${butaca.fila}${butaca.numero} - ${butaca.tipo}`;

            if (!ocupada) {
                seat.addEventListener('click', () => {
                    toggleButaca(seat, butaca);
                });
            }
            
            rowDiv.appendChild(seat);
        });
        
        seatMap.appendChild(rowDiv);
    });
}

function toggleButaca(seatElement, butaca) {
    // Las butacas ocupadas no se pueden seleccionar.
    if (butaca.disponible === false || seatElement.classList.contains('occupied')) {
        return;
    }

    const butacaId = butaca.id;
    const index = butacasSeleccionadas.findIndex(b => b.id === butacaId);
    
    if (index > -1) {
        // Deseleccionar
        butacasSeleccionadas.splice(index, 1);
        seatElement.classList.remove('selected');
    } else {
        // Seleccionar
        butacasSeleccionadas.push(butaca);
        seatElement.classList.add('selected');
    }
    
    actualizarResumen();
}

function actualizarResumen() {
    const resumen = document.getElementById('resumenCompra');
    const totalSpan = document.getElementById('totalCompra');
    const btnPagar = document.getElementById('btnPagar');
    const user = JSON.parse(localStorage.getItem('cineclick_user') || 'null');
    
    if (butacasSeleccionadas.length === 0) {
        resumen.innerHTML = '<p style="color: var(--text-light);">No hay butacas seleccionadas</p>';
        totalSpan.textContent = '$0';
        if (user && btnPagar) {
            if (user.rol === 'ADMIN') {
                btnPagar.disabled = true;
                btnPagar.textContent = 'No disponible para admin';
            } else {
                btnPagar.disabled = true;
            }
        }
        return;
    }
    
    let total = butacasSeleccionadas.length * funcionActual.precioBase;
    
    let items = butacasSeleccionadas.map(b => 
        `<div>â€¢ Butaca ${b.fila}${b.numero} (${b.tipo}) - $${funcionActual.precioBase.toLocaleString('es-AR')}</div>`
    ).join('');
    
    resumen.innerHTML = items;
    totalSpan.textContent = `$${total.toLocaleString('es-AR')}`;
    if (user && btnPagar) {
        if (user.rol === 'ADMIN') {
            btnPagar.disabled = true;
            btnPagar.textContent = 'No disponible para admin';
        } else if (window.clienteLogueado && window.clienteLogueado.clienteId) {
            btnPagar.disabled = false;
            btnPagar.textContent = 'Pagar y Confirmar Compra';
        }
    }
}

async function realizarCompra() {
    const user = JSON.parse(localStorage.getItem('cineclick_user') || 'null');
    if (!user) {
        alert('DebÃ©s iniciar sesiÃ³n para realizar la compra');
        window.location.href = 'login.html';
        return;
    }
    if (user.rol === 'ADMIN') {
        alert('Los administradores no pueden realizar compras');
        return;
    }
    
    await verificarLogin();
    
    if (!window.clienteLogueado || !window.clienteLogueado.clienteId) {
        alert('No se encontrÃ³/creÃ³ el cliente. ProbÃ¡ cerrando sesiÃ³n y volviendo a ingresar.');
        return;
    }
    
    const codigoPromo = document.getElementById('codigoPromo').value.trim();
    const metodoPago = document.getElementById('metodoPago').value;
    const tokenPago = document.getElementById('tokenPago').value.trim();
    
    if (butacasSeleccionadas.length === 0) {
        alert('Por favor seleccionÃ¡ al menos una butaca');
        return;
    }
    
    if (!tokenPago) {
        alert('Por favor ingresÃ¡ los datos de pago');
        return;
    }
    
    try {
        const btn = document.getElementById('btnPagar');
        if (btn) { btn.disabled = true; btn.textContent = 'Procesando...'; }
        
        // Paso 1: Crear compra
        const compraRequest = {
            clienteId: window.clienteLogueado.clienteId,
            funcionId: funcionActual.id,
            butacasIds: butacasSeleccionadas.map(b => b.id),
            codigoPromocion: codigoPromo || null
        };
        console.log('Compra request:', compraRequest);
        
        const respCompra = await fetch(`${API_BASE_URL}/api/compras`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(compraRequest)
        });
        
        if (!respCompra.ok) {
            let error = {};
            try { error = await respCompra.json(); } catch(e) { error = { mensaje: respCompra.statusText }; }
            console.error('Error compra:', error, 'Status:', respCompra.status);
            throw new Error(error.mensaje || error.message || 'Error al crear la compra');
        }
        
        const compra = await respCompra.json();
        
        // Paso 2: Realizar pago
        const pagoRequest = {
            metodoPago: metodoPago,
            datosPagoToken: tokenPago
        };
        
        const respPago = await fetch(`${API_BASE_URL}/api/compras/${compra.id}/pagos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pagoRequest)
        });
        
        if (!respPago.ok) {
            const error = await respPago.json().catch(() => ({}));
            console.error('Error pago:', error);
            throw new Error(error.mensaje || 'Error al procesar el pago');
        }
        
        const pago = await respPago.json();
        
        // Ã‰xito: refrescar las butacas para no dejar lugares fantasma si el
        // usuario vuelve atrÃ¡s o compra otra vez en la misma sesiÃ³n.
        try {
            const respRefresco = await fetch(`${API_BASE_URL}/api/funciones/${funcionActual.id}/butacas-disponibles`);
            if (respRefresco.ok) {
                butacasDisponibles = await respRefresco.json();
                butacasSeleccionadas = [];
                if (typeof mostrarMapaButacas === 'function') mostrarMapaButacas();
                if (typeof actualizarResumen === 'function') actualizarResumen();
            }
        } catch (e) {}

        alert(`Â¡Compra confirmada!\n\nCompra NÂ°: ${compra.id}\nPago NÂ°: ${pago.id}\nEstado: ${pago.estado}\nTotal: $${pago.montoPagado || compra.total}`);
        window.location.href = '../index.html';
        
    } catch (err) {
        alert('Error: ' + err.message);
        const btn = document.getElementById('btnPagar');
        if (btn) { btn.disabled = false; btn.textContent = 'Pagar y Confirmar Compra'; }
    }
}
