document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btnLogin').addEventListener('click', realizarLogin);
    document.getElementById('btnRegistro').addEventListener('click', realizarRegistro);

    // Tabs Iniciar Sesión / Crear Cuenta
    document.getElementById('tabLogin').addEventListener('click', () => mostrarPanel('panelLogin'));
    document.getElementById('tabRegistro').addEventListener('click', () => mostrarPanel('panelRegistro'));
    document.getElementById('linkRegistro').addEventListener('click', (e) => {
        e.preventDefault();
        mostrarPanel('panelRegistro');
    });
    document.getElementById('linkLogin').addEventListener('click', (e) => {
        e.preventDefault();
        mostrarPanel('panelLogin');
    });

    // Si ya está logueado, redirigir
    const user = getCurrentUser();
    if (user) {
        window.location.href = '../index.html';
    }
});

function mostrarPanel(idPanel) {
    document.getElementById('panelLogin').style.display = idPanel === 'panelLogin' ? 'flex' : 'none';
    document.getElementById('panelRegistro').style.display = idPanel === 'panelRegistro' ? 'flex' : 'none';

    document.getElementById('tabLogin').classList.toggle('active', idPanel === 'panelLogin');
    document.getElementById('tabRegistro').classList.toggle('active', idPanel === 'panelRegistro');
}

async function realizarLogin() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorDiv = document.getElementById('errorDiv');
    
    if (!email || !password) {
        errorDiv.style.display = 'block';
        errorDiv.textContent = 'Por favor completá email y contraseña';
        return;
    }
    
    try {
        document.getElementById('btnLogin').disabled = true;
        document.getElementById('btnLogin').textContent = 'Iniciando...';
        errorDiv.style.display = 'none';
        
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            guardarSesion(data);
            alert('Login exitoso');
            window.location.replace('../index.html');
        } else {
            errorDiv.style.display = 'block';
            errorDiv.textContent = await mensajeDeError(response, 'Email o contraseña incorrectos');
            document.getElementById('btnLogin').disabled = false;
            document.getElementById('btnLogin').textContent = 'Iniciar Sesión';
        }
    } catch (err) {
        errorDiv.style.display = 'block';
        errorDiv.textContent = 'Error de conexión: ' + err.message;
        document.getElementById('btnLogin').disabled = false;
        document.getElementById('btnLogin').textContent = 'Iniciar Sesión';
    }
}

async function realizarRegistro() {
    const nombre = document.getElementById('regNombre').value.trim();
    const apellido = document.getElementById('regApellido').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const passwordConfirm = document.getElementById('regPasswordConfirm').value;
    const telefono = document.getElementById('regTelefono').value.trim();
    const errorDiv = document.getElementById('registroErrorDiv');
    const btn = document.getElementById('btnRegistro');

    if (!nombre || !apellido || !email || !password) {
        mostrarErrorRegistro('Completá nombre, apellido, email y contraseña');
        return;
    }
    if (password.length < 4) {
        mostrarErrorRegistro('La contraseña tiene que tener al menos 4 caracteres');
        return;
    }
    if (password !== passwordConfirm) {
        mostrarErrorRegistro('Las contraseñas no coinciden');
        return;
    }

    try {
        btn.disabled = true;
        btn.textContent = 'Creando cuenta...';
        errorDiv.style.display = 'none';

        const response = await fetch(`${API_BASE_URL}/api/clientes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nombre: nombre,
                apellido: apellido,
                email: email,
                password: password,
                telefono: telefono || null
            })
        });

        if (response.ok) {
            // La cuenta ya quedó creada: iniciamos sesión con los mismos datos
            const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: email, password: password })
            });

            if (loginResponse.ok) {
                guardarSesion(await loginResponse.json());
                alert('¡Cuenta creada con éxito!');
                window.location.replace('../index.html');
                return;
            }

            // La cuenta se creó pero el login falló: avisamos y mandamos al login manual
            mostrarPanel('panelLogin');
            document.getElementById('email').value = email;
            document.getElementById('password').value = password;
            mostrarErrorRegistro('Cuenta creada. Ya podés iniciar sesión.');
        } else {
            mostrarErrorRegistro(await mensajeDeError(response, 'No se pudo crear la cuenta'));
            btn.disabled = false;
            btn.textContent = 'Crear Cuenta';
        }
    } catch (err) {
        mostrarErrorRegistro('Error de conexión: ' + err.message);
        btn.disabled = false;
        btn.textContent = 'Crear Cuenta';
    }
}

function guardarSesion(data) {
    localStorage.setItem('cineclick_user', JSON.stringify({
        nombre: data.nombreCompleto || data.nombre || '',
        email: data.email || '',
        rol: data.rol || ''
    }));
    localStorage.setItem('cineclick_token', data.token || '');
}

function mostrarErrorRegistro(mensaje) {
    const errorDiv = document.getElementById('registroErrorDiv');
    errorDiv.style.display = 'block';
    errorDiv.textContent = mensaje;
}

// El backend responde con { mensaje, detalles } cuando algo sale mal
async function mensajeDeError(response, porDefecto) {
    try {
        const data = await response.json();
        const detalles = Array.isArray(data.detalles) && data.detalles.length ? ' (' + data.detalles.join(', ') + ')' : '';
        return (data.mensaje || porDefecto) + detalles;
    } catch (e) {
        return porDefecto;
    }
}
