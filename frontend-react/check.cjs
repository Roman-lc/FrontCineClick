const fs = require('fs');
const c = fs.readFileSync('C:/Users/Usuario/Desktop/CineClick-mejoras-backend/FrontCineClick-main/frontend/index.html','utf8');
const idx = c.indexOf('<div class="banner-container"');
console.log(c.substring(idx, idx+600));
