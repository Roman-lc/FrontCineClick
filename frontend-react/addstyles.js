const fs = require('fs');
const p = 'C:/Users/Usuario/Desktop/CineClick-mejoras-backend/FrontCineClick-main/frontend-react/src/index.css';
let c = fs.readFileSync(p, 'utf8');
if (c.includes('.poster-grid')) {
  console.log('exists');
  process.exit(0);
}
const add = `

/* Cartelera */
.poster-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-top: 1.5rem;
}
.poster-card {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: transform 0.3s, box-shadow 0.3s;
    text-decoration: none;
    color: inherit;
    display: block;
}
.poster-card:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}
.poster-img {
    width: 100%;
    height: 300px;
    object-fit: cover;
    background: #ddd;
}
.poster-info {
    padding: 0.75rem;
}
.poster-title {
    font-weight: 600;
    color: var(--bg-dark);
    font-size: 0.9rem;
    margin-bottom: 0.25rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.poster-genre {
    color: var(--text-light);
    font-size: 0.8rem;
}

.cartelera-filtros {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
    background: white;
    padding: 1rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    margin-bottom: 0.75rem;
}
.filtro-grupo {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    min-width: 0;
}
.filtro-grupo-label {
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--text-light);
}
.chips {
    display: flex;
    gap: 0.5rem;
    overflow-x: auto;
    padding-bottom: 0.35rem;
    scrollbar-width: thin;
}
.chip {
    flex: 0 0 auto;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.1rem;
    min-height: 46px;
    padding: 0.4rem 0.95rem;
    border: 1px solid var(--border);
    border-radius: 999px;
    background: white;
    font-family: inherit;
    color: var(--text-dark);
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, color 0.15s;
}
.chip:hover:not(:disabled) {
    border-color: var(--primary);
    color: var(--primary);
}
.chip:focus-visible {
    outline: 2px solid var(--info);
    outline-offset: 2px;
}
.chip-titulo {
    font-size: 0.88rem;
    font-weight: 600;
    line-height: 1.15;
    white-space: nowrap;
}
.chip-sub {
    font-size: 0.68rem;
    line-height: 1.1;
    white-space: nowrap;
    opacity: 0.7;
}
.chip.active {
    background: var(--primary);
    border-color: var(--primary);
    color: white;
}
.chip.sin-funciones {
    border-style: dashed;
    color: var(--text-light);
}
.chip:disabled {
    cursor: not-allowed;
    opacity: 0.55;
}
.chip:disabled:hover {
    border-color: var(--border);
    color: var(--text-light);
}
.chip.sin-funciones.active {
    color: white;
}
.chip-horario {
    padding: 0.3rem 0.7rem;
    min-height: 38px;
    text-decoration: none;
}
.chip-horario:hover {
    background: var(--primary);
    color: white;
    border-color: var(--primary);
}
.cartelera-resultado {
    color: var(--text-light);
    font-size: 0.85rem;
    margin-bottom: 0.5rem;
    min-height: 1.2em;
}
.cartelera-vacio {
    grid-column: 1 / -1;
    background: white;
    border-radius: 8px;
    padding: 2rem;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    color: var(--text-light);
}
.cartelera-vacio p {
    margin-bottom: 1rem;
}
@media (max-width: 768px) {
    .poster-grid {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 1rem;
    }
    .poster-img {
        height: 225px;
    }
}
`;
fs.appendFileSync(p, add);
console.log('added');
