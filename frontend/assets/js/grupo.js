document.addEventListener('DOMContentLoaded', () => {
    // Mostrar integrantes aleatorios
    const integrantes = [
        { nombre: 'Juan', apellido: 'Pérez', rol: 'Desarrollador Backend' },
        { nombre: 'María', apellido: 'González', rol: 'Desarrolladora Frontend' },
        { nombre: 'Carlos', apellido: 'Rodríguez', rol: 'Analista de Sistemas' },
        { nombre: 'Laura', apellido: 'Martínez', rol: 'Diseñadora UX/UI' }
    ];
    
    // Mezclar aleatoriamente
    const mezclados = integrantes.sort(() => Math.random() - 0.5);
    
    const grid = document.getElementById('teamGrid');
    grid.innerHTML = '';
    
    mezclados.forEach(persona => {
        const card = document.createElement('div');
        card.className = 'team-card';
        card.innerHTML = `
            <div class="avatar">👤</div>
            <h3>${persona.nombre} ${persona.apellido}</h3>
            <p style="color: var(--text-light);">${persona.rol}</p>
        `;
        grid.appendChild(card);
    });
    
    if (typeof updateNavbar === 'function') {
        updateNavbar();
    }
});
