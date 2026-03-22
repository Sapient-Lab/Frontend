const fs = require('fs');
const file = './src/pages/Dashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("Insight del Agente IA", "EN QUE PUEDO AYUDARTE");
content = content.replace("La fase de diseño inicial de la arquitectura...", "Estoy listo para ayudarle a coordinar el proyecto. Los datos se actualizan en base al progreso de las verificaciones.");

content = content.replace("5%", "0%");
content = content.replace("3 de 7 bloques", "0 de \ bloques");
content = content.replace("2 verificaciones pendientes", "\ verificaciones pendientes");

fs.writeFileSync(file, content, 'utf8');
console.log('patched Dashboard static text');
