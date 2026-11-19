// build.js: genera la web completa en la carpeta docs/.
//
// Uso:
//   node build.js                     (usa la fecha de hoy)
//   node build.js --fecha=2026-11-19  (simula otra fecha)
//
// Qué hace, paso a paso:
//   1. Decide la fecha de referencia ("hoy" o la de --fecha).
//   2. Vacía docs/ y copia dentro estaticos/ (CSS, imágenes...).
//   3. Lee los datos de contenido/ (JSON) y los artículos (Markdown).
//   4. Separa los artículos publicados de los borradores y programados.
//   5. Genera las páginas fijas (inicio, cursos, profesorado, contacto).
//   6. Genera el blog: una página por artículo, el listado de 4 en 4
//      y una página por categoría.
//   7. Genera la página 404.
//   8. Genera sitemap.xml, feed.xml y robots.txt.
// Cada página lleva su URL canónica, Open Graph y datos estructurados.

const path = require('path');
const { leerJSON, vaciarCarpeta, copiarCarpeta, escribir, rutaRaiz, escapar } = require('./scripts/lib/utilidades');
const { leerPlantilla, rellenar } = require('./scripts/lib/plantillas');
const componentes = require('./scripts/lib/componentes');
const blog = require('./scripts/lib/blog');
const seo = require('./scripts/lib/seo');

const RAIZ = __dirname;
const SALIDA = path.join(RAIZ, 'docs');
const CONTENIDO = path.join(RAIZ, 'contenido');

// ---------- 1. Fecha de referencia ----------
function fechaDeHoy() {
  const d = new Date(); // fecha local del ordenador, no la de Londres (UTC)
  const dos = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;
}

const argFecha = process.argv.find((a) => a.startsWith('--fecha='));
const HOY = argFecha ? argFecha.split('=')[1] : fechaDeHoy();
if (!blog.esFechaValida(HOY)) {
  console.error(`La fecha "${HOY}" no es válida. Ejemplo correcto: node build.js --fecha=2026-11-19`);
  process.exit(1);
}

// ---------- 2. Preparar la carpeta de salida ----------
vaciarCarpeta(SALIDA);
copiarCarpeta(path.join(RAIZ, 'estaticos'), SALIDA);

// ---------- 3. Leer los datos ----------
const negocio = leerJSON(path.join(CONTENIDO, 'negocio.json'));
const cursos = leerJSON(path.join(CONTENIDO, 'cursos.json'));
const faq = leerJSON(path.join(CONTENIDO, 'faq.json'));
const profesorado = leerJSON(path.join(CONTENIDO, 'profesorado.json'));
const testimonios = leerJSON(path.join(CONTENIDO, 'testimonios.json'));
const paginas = leerJSON(path.join(CONTENIDO, 'paginas.json'));
const alts = leerJSON(path.join(CONTENIDO, 'imagenes.json'));
const todos = blog.leerArticulos(path.join(CONTENIDO, 'blog'));
const config = require('./estaticos/js/config.js');
if (config.formspree.includes('TU_ID')) {
  console.warn('AVISO: el formulario no está conectado. Pon tu endpoint de Formspree en estaticos/js/config.js');
}

// Analítica sin cookies (GoatCounter). Solo se añade si hay un código válido en config.js.
const codigoAnalitica = /^[a-z0-9-]+$/.test(config.goatcounter || '') && config.goatcounter !== 'TU_CODIGO' ? config.goatcounter : null;
const ANALITICA = codigoAnalitica
  ? `  <script data-goatcounter="https://${codigoAnalitica}.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>`
  : '';
if (!codigoAnalitica) console.warn('AVISO: la analítica está desactivada. Pon tu código de GoatCounter en estaticos/js/config.js');

// ---------- 4. Qué artículos se publican ----------
const { publicados, omitidos } = blog.clasificar(todos, HOY);
const categorias = blog.categorias(publicados);

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
  anio: HOY.slice(0, 4),
  formspree: escapar(config.formspree),
  analitica: ANALITICA,
  horario_atencion: componentes.horario(negocio.horarioAtencion),
  horario_clases: componentes.horario(negocio.horarioClases),
};

// Monta una página completa y la guarda en docs/.
//   salida:      ruta del archivo dentro de docs/ (ej. "blog/pagina/2/index.html")
//   menuActivo:  qué enlace del menú se marca
//   plantilla:   archivo de plantillas/paginas/
//   valores:     huecos propios de esa página (función que recibe "raiz")
const generadas = [];
//   scripts:     archivos JS que necesita solo esta página
//   datos:       datos estructurados (JSON-LD) de la página
//   og:          datos extra para redes sociales (tipo "article", fecha...)
//   fecha:       última modificación, para el sitemap
//   indexable:   false solo en la 404 (ni canonical ni sitemap)
const URL_SITIO = negocio.urlSitio;
const IMAGEN_REDES = URL_SITIO + 'img/og-academia-faro.png';
const paraSitemap = [];
function generarPagina({ salida, menuActivo, titulo, descripcion, plantilla, scripts = [], datos = [], og, fecha, indexable = true, valores = () => ({}) }) {
  // La 404 puede mostrarse en cualquier dirección (/blog/no-existe/...),
  // así que sus enlaces empiezan por la raíz absoluta del sitio.
  const raiz = indexable ? rutaRaiz(salida) : new URL(URL_SITIO).pathname;
  const url = seo.urlAbsoluta(URL_SITIO, salida);
  const todosLosValores = {
    ...datosComunes,
    raiz,
    titulo: escapar(titulo),
    descripcion: escapar(descripcion),
    menu: componentes.menu(menuActivo, raiz),
    scripts: scripts.map((s) => `  <script src="${raiz}${s}" defer></script>`).join('\n'),
    meta_seo: indexable ? metaSeo({ url, titulo, descripcion, og }) : '  <meta name="robots" content="noindex">',
    datos_estructurados: datos.map(seo.jsonLd).join('\n'),
    ...valores(raiz),
  };

  const contenido = rellenar(leerPlantilla(`paginas/${plantilla}`), todosLosValores, plantilla);
  const cabecera = rellenar(leerPlantilla('parciales/cabecera.html'), todosLosValores, 'cabecera.html');
  const pie = rellenar(leerPlantilla('parciales/pie.html'), todosLosValores, 'pie.html');
  const html = rellenar(leerPlantilla('base.html'), { ...todosLosValores, contenido, cabecera, pie }, 'base.html');

  escribir(path.join(SALIDA, salida), html);
  generadas.push(salida);
  if (indexable) paraSitemap.push({ url, fecha });
}

// Etiquetas para buscadores y redes sociales (Open Graph = vista previa al compartir).
function metaSeo({ url, titulo, descripcion, og = {} }) {
  const tipo = og.tipo || 'website';
  const lineas = [
    `<link rel="canonical" href="${url}">`,
    `<meta property="og:type" content="${tipo}">`,
    `<meta property="og:site_name" content="${escapar(negocio.nombre)}">`,
    `<meta property="og:locale" content="es_ES">`,
    `<meta property="og:title" content="${escapar(og.titulo || titulo)}">`,
    `<meta property="og:description" content="${escapar(descripcion)}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:image" content="${og.imagen || IMAGEN_REDES}">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta property="og:image:alt" content="${escapar(negocio.nombre)}: ${escapar(negocio.lema.toLowerCase())}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
  ];
  if (tipo === 'article') {
    lineas.push(`<meta property="article:published_time" content="${og.fecha}">`);
    lineas.push(`<meta property="article:section" content="${escapar(og.seccion)}">`);
  }
  return lineas.map((l) => '  ' + l).join('\n');
}

// ---------- 5. Páginas fijas ----------
// En paginas.json, "datos" dice qué datos estructurados lleva cada página.
const datosEstructurados = {
  organizacion: seo.organizacion(negocio, profesorado),
  faq: seo.faqPage(faq),
};

for (const p of paginas) {
  generarPagina({
    salida: p.salida,
    menuActivo: p.id,
    titulo: p.titulo,
    descripcion: p.descripcion,
    plantilla: p.plantilla,
    scripts: p.scripts,
    datos: (p.datos || []).map((tipo) => datosEstructurados[tipo]),
    valores: (raiz) => ({
      cursos_destacados: componentes.cursosDestacados(cursos, raiz),
      fichas_cursos: componentes.fichasCursos(cursos, raiz),
      faq: componentes.faq(faq),
      testimonios: componentes.testimonios(testimonios),
      profesores: componentes.profesores(profesorado),
      ultimos_articulos: componentes.listaArticulos(publicados.slice(0, 3), raiz, alts, 'h3'),
      img_portada: componentes.imagen('portada', alts.portada, raiz, { primera: true, tamano: 'portada', clase: 'hero__imagen' }),
      img_profesorado: componentes.imagen('profesorado', alts.profesorado, raiz, { primera: true, tamano: 'mitad', clase: 'profesorado__imagen' }),
      img_mapa: componentes.imagen('mapa', alts.mapa, raiz, { tamano: 'mitad' }),
      img_contacto: componentes.imagen('contacto', alts.contacto, raiz, { tamano: 'mitad' }),
    }),
  });
}

// ---------- 6. Blog ----------

// 6a. Una página por artículo publicado: docs/blog/<nombre-del-archivo>/index.html
for (const a of publicados) {
  const fotoRedes = componentes.imagenRedes(a.imagen);
  const imagenRedes = fotoRedes ? URL_SITIO + fotoRedes : IMAGEN_REDES;
  generarPagina({
    salida: `blog/${a.slug}/index.html`,
    menuActivo: 'blog',
    titulo: `${a.titulo} | Blog de ${negocio.nombre}`,
    descripcion: a.resumen,
    plantilla: 'articulo.html',
    fecha: a.fecha,
    og: { tipo: 'article', titulo: a.titulo, fecha: a.fecha, seccion: a.categoria, imagen: imagenRedes },
    datos: [seo.blogPosting(a, negocio, `${URL_SITIO}blog/${a.slug}/`, imagenRedes)],
    valores: (raiz) => ({
      titulo_articulo: escapar(a.titulo),
      categoria: escapar(a.categoria),
      categoria_slug: a.categoriaSlug,
      fecha: a.fecha,
      fecha_larga: blog.fechaLarga(a.fecha),
      minutos: String(a.minutos),
      imagen_articulo: componentes.imagen(a.imagen, alts[a.imagen] || '', raiz, { primera: true, tamano: 'articulo', clase: 'articulo__imagen' }),
      cuerpo: a.html,
      relacionados: componentes.relacionados(blog.relacionados(a, publicados), raiz, alts),
    }),
  });
}

// 6b. Listados paginados (el general y uno por categoría).
function generarListado({ lista, base, actual, titulo, entradilla, descripcion }) {
  for (const pagina of blog.paginar(lista, base)) {
    const sufijo = pagina.numero > 1 ? `, página ${pagina.numero}` : '';
    generarPagina({
      salida: pagina.salida,
      menuActivo: 'blog',
      titulo: `${titulo}${sufijo} | ${negocio.nombre}`,
      descripcion: descripcion + (pagina.numero > 1 ? ` Página ${pagina.numero}.` : ''),
      plantilla: 'blog.html',
      fecha: pagina.articulos[0] && pagina.articulos[0].fecha,
      valores: (raiz) => ({
        blog_titulo: escapar(titulo) + escapar(sufijo),
        blog_entradilla: escapar(entradilla),
        categorias: componentes.navCategorias(categorias, publicados.length, actual, raiz),
        articulos: componentes.listaArticulos(pagina.articulos, raiz, alts, 'h2', true),
        paginacion: componentes.paginacion(pagina, raiz),
      }),
    });
  }
}

generarListado({
  lista: publicados,
  base: 'blog',
  actual: null,
  titulo: 'Blog',
  entradilla: 'Consejos de estudio, idiomas y ideas para familias, escritos por el equipo de la academia.',
  descripcion: 'Blog de Academia Faro: consejos para estudiar mejor, aprender idiomas y acompañar a tus hijos en el curso.',
});

for (const c of categorias) {
  generarListado({
    lista: c.articulos,
    base: `blog/categoria/${c.slug}`,
    actual: c.slug,
    titulo: `Blog: ${c.nombre}`,
    entradilla: `Artículos de la categoría ${c.nombre}.`,
    descripcion: `Artículos del blog de Academia Faro sobre ${c.nombre.toLowerCase()}: consejos prácticos y sencillos del equipo de la academia.`,
  });
}

// ---------- 7. Página 404 ----------
// GitHub Pages la muestra cuando alguien escribe una dirección que no existe.
generarPagina({
  salida: '404.html',
  menuActivo: null,
  titulo: `Página no encontrada | ${negocio.nombre}`,
  descripcion: 'La página que buscas no existe o ha cambiado de dirección. Desde aquí puedes volver al inicio, a los cursos, al blog o al contacto.',
  plantilla: '404.html',
  indexable: false,
});

// ---------- 8. Archivos para buscadores y lectores de RSS ----------
escribir(path.join(SALIDA, 'sitemap.xml'), seo.sitemap(paraSitemap));
escribir(path.join(SALIDA, 'feed.xml'), seo.feed(publicados, negocio));
escribir(path.join(SALIDA, 'robots.txt'), seo.robots(URL_SITIO));

// ---------- Resumen en la terminal ----------
console.log(`Fecha de referencia: ${HOY}`);
console.log(`Artículos publicados: ${publicados.length}`);
publicados.forEach((a) => console.log(`  ✓ ${a.fecha}  [${a.categoria}]  ${a.titulo}  (${a.minutos} min)`));
if (omitidos.length) {
  console.log(`Artículos NO publicados: ${omitidos.length}`);
  omitidos.forEach((a) => console.log(`  ✗ ${a.fecha}  ${a.titulo}  → ${a.motivo}`));
}
console.log(`Categorías: ${categorias.map((c) => `${c.nombre} (${c.articulos.length})`).join(', ')}`);
console.log(`Páginas generadas en docs/: ${generadas.length} (+ sitemap.xml con ${paraSitemap.length} direcciones, feed.xml y robots.txt)`);
