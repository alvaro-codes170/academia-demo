// Trozos de HTML que se repiten y que se construyen a partir de los datos
// de contenido/. Cada función devuelve un texto con HTML.
const { escapar } = require('./utilidades');

// Enlaces del menú principal. "actual" marca la página en la que estamos.
const MENU = [
  { id: 'inicio', texto: 'Inicio', ruta: 'index.html' },
  { id: 'cursos', texto: 'Cursos', ruta: 'cursos.html' },
  { id: 'profesorado', texto: 'Profesorado', ruta: 'profesorado.html' },
  { id: 'blog', texto: 'Blog', ruta: 'blog/' },
  { id: 'contacto', texto: 'Contacto', ruta: 'contacto.html' },
];

function menu(actual, raiz) {
  return MENU.map(({ id, texto, ruta }) => {
    const marca = id === actual ? ' aria-current="page"' : '';
    return `          <li><a href="${raiz}${ruta}"${marca}>${texto}</a></li>`;
  }).join('\n');
}

function horario(lista) {
  const filas = lista
    .map(({ dias, horas }) => `          <li><span>${escapar(dias)}</span> <span>${escapar(horas)}</span></li>`)
    .join('\n');
  return `        <ul class="horario">\n${filas}\n        </ul>`;
}

const horasTexto = (h) => (h === 1 ? '1 hora a la semana' : `${h} horas a la semana`);
const cuotaTexto = (c) => `${c} €/mes`;

// ---------- Imágenes ----------
// Si scripts/imagenes.js ha creado versiones WebP de una foto, las usamos con
// srcset (el navegador elige el tamaño según la pantalla). Si no, el SVG.
const fs = require('fs');
const path = require('path');
const RUTA_WEBP = path.join(__dirname, '..', '..', 'contenido', 'imagenes-webp.json');
const fotosWebp = fs.existsSync(RUTA_WEBP) ? JSON.parse(fs.readFileSync(RUTA_WEBP, 'utf8')) : {};

// Ancho con el que se muestra cada tipo de imagen (para "sizes")
const TAMANOS = {
  portada: '(min-width: 900px) 520px, calc(100vw - 2rem)',
  tarjeta: '(min-width: 1120px) 340px, (min-width: 900px) 30vw, (min-width: 640px) 45vw, calc(100vw - 2rem)',
  mitad: '(min-width: 1120px) 540px, (min-width: 900px) 48vw, calc(100vw - 2rem)',
  articulo: '(min-width: 780px) 740px, calc(100vw - 2rem)',
};

// "lazy" retrasa la carga hasta que la imagen se acerca a la pantalla.
// La primera imagen visible de una página NO debe ser lazy (es lo que mide el LCP).
const carga = (primera) => (primera ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"');

function imagen(nombre, alt, raiz, { primera = false, tamano = 'tarjeta', clase = '' } = {}) {
  const claseAttr = clase ? ` class="${clase}"` : '';
  const foto = fotosWebp[nombre];
  if (!foto) {
    return `<img${claseAttr} src="${raiz}img/${nombre}.svg" alt="${escapar(alt)}" width="1200" height="800" ${carga(primera)}>`;
  }
  const srcset = foto.anchos.map((a) => `${raiz}img/${nombre}-${a}.webp ${a}w`).join(', ');
  const media = foto.anchos.find((a) => a >= 800) || foto.ancho;
  return `<img${claseAttr} src="${raiz}img/${nombre}-${media}.webp" srcset="${srcset}" sizes="${TAMANOS[tamano]}" alt="${escapar(alt)}" width="${foto.ancho}" height="${foto.alto}" ${carga(primera)}>`;
}

// Imagen para compartir en redes: la de la foto si existe, si no la genérica.
const imagenRedes = (nombre) => (fotosWebp[nombre] ? `img/${nombre}-og.jpg` : null);

function imagenCurso(curso, raiz, primera = false, tamano = 'tarjeta') {
  return imagen(curso.imagen, curso.alt, raiz, { primera, tamano });
}

// Tarjetas pequeñas para la página de inicio (solo los cursos destacados).
function cursosDestacados(cursos, raiz) {
  return cursos.filter((c) => c.destacado).map((c) => `          <li class="tarjeta">
            ${imagenCurso(c, raiz)}
            <div class="tarjeta__cuerpo">
              <h3>${escapar(c.nombre)}</h3>
              <p>${escapar(c.descripcion)}</p>
              <p class="tarjeta__precio">${escapar(cuotaTexto(c.cuota))} · ${escapar(horasTexto(c.horas))}</p>
              <a href="${raiz}cursos.html#${c.id}">Más sobre este curso</a>
            </div>
          </li>`).join('\n');
}

// Fichas completas para la página de cursos.
function fichasCursos(cursos, raiz) {
  return cursos.map((c, i) => `          <li class="ficha" id="${c.id}">
            ${imagenCurso(c, raiz, i === 0, 'mitad')}
            <div class="ficha__cuerpo">
              <h2>${escapar(c.nombre)}</h2>
              <p class="ficha__nivel">${escapar(c.nivel)}</p>
              <ul class="ficha__datos">
                <li>${escapar(horasTexto(c.horas))}</li>
                <li class="ficha__cuota">${escapar(cuotaTexto(c.cuota))}</li>
              </ul>
              <p>${escapar(c.descripcion)}</p>
              <div class="botones">
                <a class="boton boton--acento" href="${raiz}contacto.html?interes=${encodeURIComponent(c.interes)}#clase-prueba">Pedir información<span class="visualmente-oculto"> sobre ${escapar(c.nombre)}</span></a>
              </div>
            </div>
          </li>`).join('\n');
}

// Preguntas frecuentes con <details>: se abren sin JavaScript
// y el texto de la respuesta ya está en el HTML.
function faq(preguntas) {
  const items = preguntas.map(({ pregunta, respuesta }) => `          <details>
            <summary>${escapar(pregunta)}</summary>
            <p>${escapar(respuesta)}</p>
          </details>`).join('\n');
  return `        <div class="faq">\n${items}\n        </div>`;
}

function testimonios(lista) {
  return lista.map(({ texto, autor }) => `          <li>
            <figure class="testimonio">
              <blockquote><p>${escapar(texto)}</p></blockquote>
              <figcaption>${escapar(autor)}</figcaption>
            </figure>
          </li>`).join('\n');
}

function profesores(lista) {
  return lista.map((p) => {
    const iniciales = p.nombre.split(' ').map((parte) => parte[0]).slice(0, 2).join('');
    const nota = p.nota ? ` · ${escapar(p.nota)}` : '';
    return `          <li class="profe">
            <span class="profe__inicial" aria-hidden="true">${escapar(iniciales)}</span>
            <h2>${escapar(p.nombre)}</h2>
            <p class="profe__materia">${escapar(p.materia)}${nota}</p>
            <p class="profe__frase">«${escapar(p.frase)}»</p>
          </li>`;
  }).join('\n');
}

// ---------- Blog ----------
const { fechaLarga } = require('./blog');

// Tarjeta de un artículo. "nivel" es el título: h2 en el listado, h3 en otras secciones.
function tarjetaArticulo(a, raiz, alts, nivel = 'h2', primera = false) {
  return `          <li class="articulo-tarjeta">
            ${imagen(a.imagen, alts[a.imagen] || '', raiz, { primera })}
            <div class="articulo-tarjeta__cuerpo">
              <p class="articulo-tarjeta__meta"><a href="${raiz}blog/categoria/${a.categoriaSlug}/">${escapar(a.categoria)}</a> · <time datetime="${a.fecha}">${fechaLarga(a.fecha)}</time> · ${a.minutos} min</p>
              <${nivel}><a href="${raiz}blog/${a.slug}/">${escapar(a.titulo)}</a></${nivel}>
              <p>${escapar(a.resumen)}</p>
            </div>
          </li>`;
}

// "primeraVisible": true en el listado del blog, donde la primera tarjeta se ve al entrar.
function listaArticulos(lista, raiz, alts, nivel, primeraVisible = false) {
  return lista.map((a, i) => tarjetaArticulo(a, raiz, alts, nivel, primeraVisible && i === 0)).join('\n');
}

// Enlaces a "Todos" y a cada categoría, con el número de artículos.
function navCategorias(cats, total, actual, raiz) {
  const enlace = (texto, ruta, n, esActual) =>
    `            <li><a href="${raiz}${ruta}"${esActual ? ' aria-current="page"' : ''}>${escapar(texto)} <span class="categorias__n">(${n})</span></a></li>`;
  return [
    enlace('Todos', 'blog/', total, actual === null),
    ...cats.map((c) => enlace(c.nombre, `blog/categoria/${c.slug}/`, c.articulos.length, actual === c.slug)),
  ].join('\n');
}

// Enlaces "Anterior" / "Siguiente". Si solo hay una página, no se muestra nada.
function paginacion(pagina, raiz) {
  if (pagina.total === 1) return '';
  const anterior = pagina.anterior
    ? `<a class="boton boton--borde" href="${raiz}${pagina.anterior}" rel="prev">← Anterior</a>`
    : '<span></span>';
  const siguiente = pagina.siguiente
    ? `<a class="boton boton--borde" href="${raiz}${pagina.siguiente}" rel="next">Siguiente →</a>`
    : '<span></span>';
  return `        <nav class="paginacion" aria-label="Páginas del blog">
          ${anterior}
          <p>Página ${pagina.numero} de ${pagina.total}</p>
          ${siguiente}
        </nav>`;
}

function relacionados(lista, raiz, alts) {
  if (lista.length === 0) return '';
  return `    <section class="seccion" aria-labelledby="titulo-relacionados">
      <div class="contenedor">
        <h2 id="titulo-relacionados" class="seccion__titulo">Artículos relacionados</h2>
        <ul class="articulos articulos--dos">
${listaArticulos(lista, raiz, alts, 'h3')}
        </ul>
      </div>
    </section>`;
}

module.exports = {
  imagen, imagenRedes,
  menu, horario, cursosDestacados, fichasCursos, faq, testimonios, profesores,
  listaArticulos, navCategorias, paginacion, relacionados,
};
