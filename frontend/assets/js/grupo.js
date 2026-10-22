document.addEventListener('DOMContentLoaded', () => {
    // Integrantes del grupo
    const integrantes = [
        { nombre: 'Rodrigo' },
        { nombre: 'Gianluca' },
        { nombre: 'Lucas' },
        { nombre: 'Roman' }
    ];

    const grid = document.getElementById('teamGrid');
    grid.innerHTML = '';

    integrantes.forEach(persona => {
        const inicial = persona.nombre.charAt(0).toUpperCase();
        const card = document.createElement('div');
        card.className = 'team-card';
        card.innerHTML = `
            <div class="avatar avatar-inicial">${inicial}</div>
            <h3>${persona.nombre}</h3>
            <p style="color: var(--text-light);">Integrante del equipo</p>
        `;
        grid.appendChild(card);
    });

    if (typeof updateNavbar === 'function') {
        updateNavbar();
    }
});
