const fs = require('fs');
const c = fs.readFileSync('C:/Users/Usuario/Desktop/CineClick-mejoras-backend/FrontCineClick-main/frontend/index.html','utf8');
const idx = c.indexOf('<div class="banner-container"');
const end = c.indexOf('</section>', idx);
console.log(c.substring(idx, end));
