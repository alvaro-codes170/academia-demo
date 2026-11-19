// Trozos de HTML que se repiten y que se construyen a partir de los datos
// de contenido/. Cada función devuelve un texto con HTML.
const { escapar } = require('./utilidades');

// Enlaces del menú principal. "actual" marca la página en la que estamos.
const MENU = [
  { id: 'inicio', texto: 'Inicio', ruta: 'index.html' },
  { id: 'cursos', texto: 'Cursos', ruta: 'cursos.html' },
  { id: 'profesorado', texto: 'Profesorado', ruta: 'profesorado.html' },
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

function imagenCurso(curso, raiz) {
  return `<img src="${raiz}img/${curso.imagen}.svg" alt="${escapar(curso.alt)}" width="1200" height="800" loading="lazy" decoding="async">`;
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
  return cursos.map((c) => `          <li class="ficha" id="${c.id}">
            ${imagenCurso(c, raiz)}
            <div class="ficha__cuerpo">
              <h2>${escapar(c.nombre)}</h2>
              <p class="ficha__nivel">${escapar(c.nivel)}</p>
              <ul class="ficha__datos">
                <li>${escapar(horasTexto(c.horas))}</li>
                <li class="ficha__cuota">${escapar(cuotaTexto(c.cuota))}</li>
              </ul>
              <p>${escapar(c.descripcion)}</p>
              <div class="botones">
                <a class="boton boton--acento" href="${raiz}contacto.html#clase-prueba">Pedir información<span class="visualmente-oculto"> sobre ${escapar(c.nombre)}</span></a>
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

module.exports = { menu, horario, cursosDestacados, fichasCursos, faq, testimonios, profesores };
