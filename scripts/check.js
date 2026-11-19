// scripts/check.js: revisa la web generada en docs/ y avisa de problemas.
//
// Uso:  node scripts/check.js            (revisa docs/)
//       node scripts/check.js otra-carpeta
//
// Revisa en cada página HTML:
//   - que el <title> y la meta description existan y no se repitan
//   - que la descripción no sea demasiado corta ni demasiado larga
//   - que haya un único <h1>
//   - que todas las imágenes tengan atributo alt
//   - que los enlaces internos lleven a un archivo que existe
//     (y, si llevan #ancla, que ese id exista en la página de destino)
// Además comprueba que todas las direcciones del sitemap.xml existen.
//
// Termina con código 1 si encuentra errores (útil para automatizarlo).

const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const DOCS = path.resolve(process.argv[2] || path.join(RAIZ, 'docs'));
const negocio = JSON.parse(fs.readFileSync(path.join(RAIZ, 'contenido', 'negocio.json'), 'utf8'));
const URL_SITIO = negocio.urlSitio;                 // https://usuario.github.io/academia-demo/
const RUTA_SITIO = new URL(URL_SITIO).pathname;     // /academia-demo/

const DESCRIPCION_MIN = 70;
const DESCRIPCION_MAX = 160;

if (!fs.existsSync(DOCS)) {
  console.error(`No existe la carpeta ${DOCS}. Ejecuta antes: node build.js`);
  process.exit(1);
}

// ---------- Utilidades ----------
function listarHtml(carpeta) {
  const lista = [];
  for (const e of fs.readdirSync(carpeta, { withFileTypes: true })) {
    const ruta = path.join(carpeta, e.name);
    if (e.isDirectory()) lista.push(...listarHtml(ruta));
    else if (e.name.endsWith('.html')) lista.push(ruta);
  }
  return lista;
}

const relativa = (archivo) => path.relative(DOCS, archivo).replace(/\\/g, '/');
const sinEtiquetas = (html) => html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const decodificar = (t) => t.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

// Quita los comentarios y el contenido de <script> para no confundirlos con HTML.
const limpiar = (html) => html.replace(/<!--[\s\S]*?-->/g, '').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '<script></script>');

// Lee un atributo de una etiqueta: atributo('<img alt="x">', 'alt') -> 'x'
function atributo(etiqueta, nombre) {
  const m = etiqueta.match(new RegExp(`\\s${nombre}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
  if (!m) return null;
  return decodificar(m[2] ?? m[3] ?? m[4] ?? '');
}

// Convierte un enlace en el archivo de docs/ al que apunta.
// Devuelve null si el enlace es externo (otra web, tel:, mailto:...).
function destinoLocal(href, archivoOrigen) {
  if (/^(mailto:|tel:|data:|javascript:)/i.test(href)) return null;
  let ruta = href;
  if (ruta.startsWith(URL_SITIO)) ruta = RUTA_SITIO + ruta.slice(URL_SITIO.length); // nuestra web con dirección completa
  else if (/^(https?:)?\/\//i.test(ruta)) return null;                              // otra web

  const [sinAncla, ancla = ''] = ruta.split('#');
  const camino = decodeURIComponent(sinAncla.split('?')[0]);
  let archivo;
  if (camino === '') archivo = archivoOrigen;                                      // "#ancla" en la misma página
  else if (camino.startsWith('/')) {
    if (!camino.startsWith(RUTA_SITIO)) return { archivo: null, ancla, fuera: true };
    archivo = path.join(DOCS, camino.slice(RUTA_SITIO.length));
  } else archivo = path.join(path.dirname(archivoOrigen), camino);
  if (camino.endsWith('/') || (camino !== '' && fs.existsSync(archivo) && fs.statSync(archivo).isDirectory())) {
    archivo = path.join(archivo, 'index.html');
  }
  return { archivo, ancla };
}

// ---------- Leer todas las páginas ----------
const paginas = listarHtml(DOCS).map((archivo) => {
  const html = limpiar(fs.readFileSync(archivo, 'utf8'));
  const titulo = html.match(/<title>([\s\S]*?)<\/title>/i);
  const metaDesc = (html.match(/<meta\s[^>]*name=["']description["'][^>]*>/i) || [])[0];
  return {
    archivo,
    nombre: relativa(archivo),
    html,
    titulo: titulo ? decodificar(sinEtiquetas(titulo[1])) : null,
    descripcion: metaDesc ? atributo(metaDesc, 'content') : null,
    ids: new Set([...html.matchAll(/\sid=["']([^"']+)["']/g)].map((m) => m[1])),
  };
});
const porArchivo = new Map(paginas.map((p) => [path.resolve(p.archivo), p]));

const errores = [];
const avisos = [];
const error = (pagina, texto) => errores.push(`${pagina}: ${texto}`);

// ---------- 1. Títulos y descripciones ----------
function buscarRepetidos(campo, nombreCampo) {
  const grupos = new Map();
  for (const p of paginas) {
    if (!p[campo]) continue;
    if (!grupos.has(p[campo])) grupos.set(p[campo], []);
    grupos.get(p[campo]).push(p.nombre);
  }
  for (const [valor, lista] of grupos) {
    if (lista.length > 1) errores.push(`${nombreCampo} repetido en ${lista.length} páginas (${lista.join(', ')}): "${valor}"`);
  }
}

for (const p of paginas) {
  if (!p.titulo) error(p.nombre, 'no tiene <title>.');
  if (p.descripcion === null) error(p.nombre, 'no tiene meta description.');
  else if (p.descripcion.length < DESCRIPCION_MIN) error(p.nombre, `la descripción es demasiado corta (${p.descripcion.length} caracteres; mínimo ${DESCRIPCION_MIN}).`);
  else if (p.descripcion.length > DESCRIPCION_MAX) error(p.nombre, `la descripción es demasiado larga (${p.descripcion.length} caracteres; máximo ${DESCRIPCION_MAX}).`);
}
buscarRepetidos('titulo', 'Título');
buscarRepetidos('descripcion', 'Descripción');

// ---------- 2. Un único <h1> ----------
for (const p of paginas) {
  const n = (p.html.match(/<h1[\s>]/gi) || []).length;
  if (n !== 1) error(p.nombre, `tiene ${n} etiquetas <h1> (debe haber exactamente una).`);
}

// ---------- 3. Imágenes sin alt ----------
for (const p of paginas) {
  for (const [img] of p.html.matchAll(/<img\b[^>]*>/gi)) {
    const alt = atributo(img, 'alt');
    const src = atributo(img, 'src') || '(sin src)';
    if (alt === null) error(p.nombre, `imagen sin atributo alt: ${src}`);
    else if (alt.trim() === '') avisos.push(`${p.nombre}: imagen con alt vacío (correcto solo si es decorativa): ${src}`);
  }
}

// ---------- 4. Enlaces internos rotos ----------
for (const p of paginas) {
  const enlaces = [
    ...[...p.html.matchAll(/<(a|link)\b[^>]*>/gi)].map((m) => atributo(m[0], 'href')),
    ...[...p.html.matchAll(/<(img|script|source)\b[^>]*>/gi)].map((m) => atributo(m[0], 'src')),
    ...[...p.html.matchAll(/<(img|source)\b[^>]*>/gi)].flatMap((m) => (atributo(m[0], 'srcset') || '').split(',').map((s) => s.trim().split(/\s+/)[0])),
  ].filter(Boolean);

  for (const href of new Set(enlaces)) {
    const destino = destinoLocal(href, p.archivo);
    if (!destino) continue;
    if (destino.fuera) { error(p.nombre, `enlace fuera de la web (${href}): debería empezar por ${RUTA_SITIO}`); continue; }
    if (!fs.existsSync(destino.archivo)) { error(p.nombre, `enlace roto: ${href}`); continue; }
    if (destino.ancla) {
      const objetivo = porArchivo.get(path.resolve(destino.archivo));
      if (objetivo && !objetivo.ids.has(destino.ancla)) error(p.nombre, `el enlace ${href} apunta a #${destino.ancla}, pero ese id no existe.`);
    }
  }
}

// ---------- 5. Sitemap ----------
const rutaSitemap = path.join(DOCS, 'sitemap.xml');
if (!fs.existsSync(rutaSitemap)) errores.push('Falta sitemap.xml');
else {
  for (const [, loc] of fs.readFileSync(rutaSitemap, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const destino = destinoLocal(decodificar(loc), path.join(DOCS, 'index.html'));
    if (!destino || destino.fuera || !fs.existsSync(destino.archivo)) errores.push(`sitemap.xml: la dirección ${loc} no existe en la web.`);
  }
}

// ---------- Informe ----------
console.log(`Revisadas ${paginas.length} páginas en ${relativa(DOCS) || DOCS}`);
if (avisos.length) {
  console.log(`\nAvisos (${avisos.length}):`);
  avisos.forEach((a) => console.log('  ! ' + a));
}
if (errores.length) {
  console.log(`\nErrores (${errores.length}):`);
  errores.forEach((e) => console.log('  ✗ ' + e));
  process.exit(1);
}
console.log('\n✓ Sin errores.');
