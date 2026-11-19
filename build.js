// build.js: genera la web completa en la carpeta docs/.
// Uso: node build.js
//
// Qué hace, paso a paso:
//   1. Vacía docs/ para empezar de cero.
//   2. Copia estaticos/ (CSS, imágenes...) dentro de docs/.
//   3. Lee los datos de contenido/ (JSON).
//   4. Para cada página de contenido/paginas.json:
//      rellena su plantilla, la mete dentro de base.html junto con
//      la cabecera y el pie, y guarda el HTML final en docs/.

const path = require('path');
const { leerJSON, vaciarCarpeta, copiarCarpeta, escribir, rutaRaiz, escapar } = require('./scripts/lib/utilidades');
const { leerPlantilla, rellenar } = require('./scripts/lib/plantillas');
const componentes = require('./scripts/lib/componentes');

const RAIZ = __dirname;
const SALIDA = path.join(RAIZ, 'docs');
const CONTENIDO = path.join(RAIZ, 'contenido');

// ---------- 1 y 2. Preparar la carpeta de salida ----------
vaciarCarpeta(SALIDA);
copiarCarpeta(path.join(RAIZ, 'estaticos'), SALIDA);

// ---------- 3. Leer los datos ----------
const negocio = leerJSON(path.join(CONTENIDO, 'negocio.json'));
const cursos = leerJSON(path.join(CONTENIDO, 'cursos.json'));
const faq = leerJSON(path.join(CONTENIDO, 'faq.json'));
const profesorado = leerJSON(path.join(CONTENIDO, 'profesorado.json'));
const testimonios = leerJSON(path.join(CONTENIDO, 'testimonios.json'));
const paginas = leerJSON(path.join(CONTENIDO, 'paginas.json'));

// Datos del negocio que pueden usar todas las plantillas como {{nombre}}.
const datosComunes = {
  nombre: escapar(negocio.nombre),
  lema: escapar(negocio.lema),
  fundacion: escapar(negocio.fundacion),
  fundadora: escapar(negocio.fundadora),
  direccion_calle: escapar(negocio.direccion.calle),
  direccion_cp: escapar(negocio.direccion.codigoPostal),
  direccion_localidad: escapar(negocio.direccion.localidad),
  telefono: escapar(negocio.telefono),
  telefono_enlace: escapar(negocio.telefonoEnlace),
  whatsapp: escapar(negocio.whatsapp),
  whatsapp_enlace: escapar(negocio.whatsappEnlace),
  correo: escapar(negocio.correo),
  instagram: escapar(negocio.instagram),
  matricula: escapar(negocio.condiciones.matricula),
  matricula_nota: escapar(negocio.condiciones.matriculaNota),
  descuento: escapar(negocio.condiciones.descuentoHermanos),
  max_alumnos: escapar(negocio.condiciones.maxAlumnos),
  anio: String(new Date().getFullYear()),
  horario_atencion: componentes.horario(negocio.horarioAtencion),
  horario_clases: componentes.horario(negocio.horarioClases),
};

// Monta una página completa: contenido + cabecera + pie dentro de base.html.
function generarPagina({ id, plantilla, salida, titulo, descripcion }) {
  const raiz = rutaRaiz(salida);

  // Los bloques que dependen de "raiz" (rutas relativas) se crean aquí.
  const valores = {
    ...datosComunes,
    raiz,
    titulo: escapar(titulo),
    descripcion: escapar(descripcion),
    menu: componentes.menu(id, raiz),
    cursos_destacados: componentes.cursosDestacados(cursos, raiz),
    fichas_cursos: componentes.fichasCursos(cursos, raiz),
    faq: componentes.faq(faq),
    testimonios: componentes.testimonios(testimonios),
    profesores: componentes.profesores(profesorado),
  };

  const contenido = rellenar(leerPlantilla(`paginas/${plantilla}`), valores, plantilla);
  const cabecera = rellenar(leerPlantilla('parciales/cabecera.html'), valores, 'cabecera.html');
  const pie = rellenar(leerPlantilla('parciales/pie.html'), valores, 'pie.html');

  const html = rellenar(leerPlantilla('base.html'), { ...valores, contenido, cabecera, pie }, 'base.html');
  escribir(path.join(SALIDA, salida), html);
  return salida;
}

// ---------- 4. Generar las páginas ----------
const generadas = paginas.map(generarPagina);

console.log(`Web generada en docs/ (${generadas.length} páginas):`);
generadas.forEach((p) => console.log('  - ' + p));
