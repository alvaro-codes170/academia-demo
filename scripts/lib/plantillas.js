// Un "motor de plantillas" mínimo: cambia cada {{nombre}} por su valor.
const fs = require('fs');
const path = require('path');

const CARPETA = path.join(__dirname, '..', '..', 'plantillas');

function leerPlantilla(nombre) {
  return fs.readFileSync(path.join(CARPETA, nombre), 'utf8');
}

// Si una plantilla pide un {{hueco}} que no tenemos, paramos con un error
// claro en vez de publicar una página con "{{hueco}}" a la vista.
function rellenar(texto, valores, nombrePlantilla) {
  return texto.replace(/\{\{\s*([a-z0-9_]+)\s*\}\}/gi, (_, clave) => {
    if (!(clave in valores)) {
      throw new Error(`La plantilla "${nombrePlantilla}" usa {{${clave}}}, pero no hay ningún dato con ese nombre.`);
    }
    return valores[clave];
  });
}

module.exports = { leerPlantilla, rellenar };
