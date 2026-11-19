// Funciones pequeñas que usa build.js.
const fs = require('fs');
const path = require('path');

// Convierte un texto en HTML seguro: "<" deja de ser una etiqueta, etc.
function escapar(texto) {
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function leerJSON(ruta) {
  return JSON.parse(fs.readFileSync(ruta, 'utf8'));
}

// Borra la carpeta y la vuelve a crear vacía.
function vaciarCarpeta(carpeta) {
  fs.rmSync(carpeta, { recursive: true, force: true });
  fs.mkdirSync(carpeta, { recursive: true });
}

// Copia una carpeta entera (con sus subcarpetas).
function copiarCarpeta(origen, destino) {
  fs.cpSync(origen, destino, { recursive: true });
}

// Escribe un archivo creando antes las carpetas que hagan falta.
function escribir(ruta, contenido) {
  fs.mkdirSync(path.dirname(ruta), { recursive: true });
  fs.writeFileSync(ruta, contenido);
}

// Cuántos "../" hacen falta para volver a la raíz desde una página.
// "index.html" -> ""   |   "blog/pagina/2/index.html" -> "../../../"
function rutaRaiz(salida) {
  const niveles = salida.split('/').length - 1;
  return '../'.repeat(niveles);
}

module.exports = { escapar, leerJSON, vaciarCarpeta, copiarCarpeta, escribir, rutaRaiz };
