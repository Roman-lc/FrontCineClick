document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btnLogin').addEventListener('click', realizarLogin);
    
    // Si ya está logueado, redirigir
    const user = getCurrentUser();
    if (user) {
        window.location.href = '../index.html';
    }
});

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
            // Guardar usuario en localStorage
            localStorage.setItem('cineclick_user', JSON.stringify({
                nombre: data.nombreCompleto || data.nombre || '',
                email: data.email || '',
                rol: data.rol || ''
            }));
            localStorage.setItem('cineclick_token', data.token || '');
            alert('Login exitoso');
            window.location.replace('../index.html');
        } else {
            errorDiv.style.display = 'block';
            errorDiv.textContent = 'Email o contraseña incorrectos';
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
