const fs = require('fs');
const p = 'C:/Users/Usuario/Desktop/CineClick-mejoras-backend/FrontCineClick-main/frontend-react/src/features/cartelera/HomePage.jsx';
let c = fs.readFileSync(p, 'utf8');
c = c.replace('className="chips" id="filtroCines"', 'className="chips" id="filtroCines" style={{overflowX: "auto", flexWrap: "nowrap", WebkitOverflowScrolling: "touch"}}');
c = c.replace('className="chips" id="filtroFechas"', 'className="chips" id="filtroFechas" style={{overflowX: "auto", flexWrap: "nowrap", WebkitOverflowScrolling: "touch"}}');
fs.writeFileSync(p, c);
console.log('done');
