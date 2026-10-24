import fs from 'fs';
const p = 'C:/Users/Usuario/Desktop/CineClick-mejoras-backend/FrontCineClick-main/frontend-react/src/index.css';
let c = fs.readFileSync(p, 'utf8');

const add = `

/* Pasos */
.steps-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-top: 1.5rem;
}
.step-card {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    position: relative;
}
.step-number {
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--primary);
    color: white;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 1.2rem;
}
.step-card h3 {
    margin-top: 1rem;
    margin-bottom: 0.5rem;
    color: var(--bg-dark);
}
.step-card p {
    color: var(--text-light);
    font-size: 0.9rem;
}

/* Filtros activos */
.filtros-activos {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: #e3f2fd;
    padding: 0.75rem 1rem;
    border-radius: 4px;
    margin-bottom: 1rem;
    flex-wrap: wrap;
}
.filtros-activos span {
    color: var(--info);
    font-weight: 500;
}
.btn-sm {
    padding: 0.35rem 0.7rem;
    font-size: 0.8rem;
}

/* Grupos funciones */
.pelicula-group {
    background: white;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}
.pelicula-group-header {
    background: var(--bg-nav);
    color: white;
    padding: 0.75rem 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
}
.pelicula-group-header h3 {
    color: white;
    border: none;
    margin: 0;
    font-size: 1.1rem;
}
.pelicula-cines {
    padding: 1rem;
}
.pelicula-cine {
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border);
}
.pelicula-cine:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
}
.pelicula-cine-nombre {
    font-weight: 600;
    color: var(--bg-dark);
    margin-bottom: 0.5rem;
}

.cine-group {
    background: white;
    border-radius: 8px;
    margin-bottom: 1rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}
.cine-header {
    background: var(--bg-nav);
    color: white;
    padding: 0.75rem 1rem;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.cine-header h3 {
    color: white;
    border: none;
    margin: 0;
    font-size: 1rem;
}
.cine-toggle {
    font-size: 1.2rem;
    font-weight: bold;
}
.cine-toggle.open {
    color: var(--primary);
}
.cine-content {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}
.cine-content.hidden {
    display: none;
}

/* Cards */
.card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    margin-bottom: 1rem;
}
.card-header {
    background: #f8f9fa;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--border);
    font-weight: 600;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
}
.card-body {
    padding: 1rem;
}
.card-body p {
    margin-bottom: 0.5rem;
}
.card-actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-top: 0.75rem;
}
.badge {
    background: var(--info);
    color: white;
    padding: 0.25rem 0.6rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
}

/* Detalle */
.detail-card {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.detail-card h2 {
    border-bottom: 2px solid var(--primary);
    padding-bottom: 0.5rem;
    margin-bottom: 1rem;
}
.detail-card h3 {
    color: var(--bg-dark);
    margin-bottom: 0.75rem;
}

/* No results */
.no-results {
    text-align: center;
    padding: 2rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    color: var(--text-light);
}

/* Form */
.form {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    max-width: 500px;
    width: 100%;
    margin: 0 auto;
}
.form-group {
    margin-bottom: 1rem;
}
.form-group label {
    display: block;
    margin-bottom: 0.4rem;
    font-weight: 600;
    color: var(--bg-dark);
}
.form-input {
    width: 100%;
    padding: 0.6rem 0.75rem;
    border: 1px solid var(--border);
    border-radius: 4px;
    font-family: inherit;
    font-size: 0.95rem;
    transition: border-color 0.3s;
}
.form-input:focus {
    outline: none;
    border-color: var(--primary);
}
.form-hint {
    text-align: center;
    color: var(--text-light);
    font-size: 0.9rem;
    margin-top: 1rem;
}
.form-hint-inline {
    color: var(--text-light);
    font-size: 0.8rem;
    font-weight: normal;
}

/* Tabs */
.tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
    justify-content: center;
}
.tab-btn {
    padding: 0.6rem 1.5rem;
    background: white;
    border: 2px solid var(--border);
    color: var(--text-dark);
    cursor: pointer;
    border-radius: 4px;
    font-family: inherit;
    font-weight: 600;
    transition: all 0.3s;
}
.tab-btn.active {
    background: var(--primary);
    border-color: var(--primary);
    color: white;
}
.tab-btn:hover:not(.active) {
    border-color: var(--primary);
    color: var(--primary);
}
.tab-panel {
    display: none;
}
.tab-panel.active {
    display: flex;
}

/* Screen */
.screen {
    background: linear-gradient(to bottom, #e0e0e0, #bdbdbd);
    height: 8px;
    margin: 1rem auto 2rem;
    max-width: 80%;
    border-radius: 50% 50% 0 0;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* Loading/Error */
.loading {
    text-align: center;
    padding: 2rem;
    color: var(--text-light);
}
.error {
    background: #f8d7da;
    color: var(--danger);
    padding: 1rem;
    border-radius: 4px;
    border-left: 4px solid var(--danger);
    margin-bottom: 1rem;
}

@media (max-width: 768px) {
    .steps-grid {
        grid-template-columns: 1fr;
    }
    .card-actions {
        flex-direction: column;
    }
    .card-actions .btn {
        width: 100%;
    }
    .tabs {
        flex-direction: column;
    }
    .tab-btn {
        width: 100%;
    }
    .form {
        padding: 1rem;
    }
}
`;

if (!c.includes('.steps-grid')) {
  fs.appendFileSync(p, add);
  console.log('added');
} else {
  console.log('exists');
}
