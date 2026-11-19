// Lógica del blog: leer artículos, decidir cuáles se publican,
// tiempo de lectura, relacionados, categorías y paginación.
const fs = require('fs');
const path = require('path');
const { separarCabecera, aHTML, textoPlano } = require('./markdown');

const POR_PAGINA = 4;
const PALABRAS_POR_MINUTO = 200;
const CAMPOS_OBLIGATORIOS = ['titulo', 'fecha', 'categoria', 'resumen'];

// "Cómo elegir" -> "como-elegir"
function aSlug(texto) {
  return texto
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function esFechaValida(texto) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;
  const d = new Date(texto + 'T00:00:00Z');
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === texto;
}

// "sí", "si", "true"... -> true
function esSi(valor = '') {
  return ['sí', 'si', 'true', 'yes'].includes(String(valor).trim().toLowerCase());
}

// Tiempo de lectura: palabras / 200, redondeado hacia arriba, mínimo 1.
function tiempoLectura(markdown) {
  const palabras = textoPlano(markdown).split(/\s+/).filter(Boolean).length;
  return { palabras, minutos: Math.max(1, Math.ceil(palabras / PALABRAS_POR_MINUTO)) };
}

// Lee todos los .md de la carpeta. El nombre del archivo es la URL del artículo.
function leerArticulos(carpeta) {
  return fs.readdirSync(carpeta)
    .filter((f) => f.endsWith('.md'))
    .map((archivo) => {
      const { datos, cuerpo } = separarCabecera(fs.readFileSync(path.join(carpeta, archivo), 'utf8'), archivo);
      for (const campo of CAMPOS_OBLIGATORIOS) {
        if (!datos[campo]) throw new Error(`"${archivo}": falta "${campo}" en la cabecera.`);
      }
      if (!esFechaValida(datos.fecha)) {
        throw new Error(`"${archivo}": la fecha "${datos.fecha}" no es válida. Usa el formato AAAA-MM-DD.`);
      }
      const { palabras, minutos } = tiempoLectura(cuerpo);
      return {
        archivo,
        slug: archivo.replace(/\.md$/, ''),
        titulo: datos.titulo,
        fecha: datos.fecha,
        categoria: datos.categoria,
        categoriaSlug: aSlug(datos.categoria),
        resumen: datos.resumen,
        imagen: datos.imagen || 'blog',
        borrador: esSi(datos.borrador),
        palabras,
        minutos,
        html: aHTML(cuerpo),
      };
    });
}

// Decide qué se publica. Las fechas AAAA-MM-DD se pueden comparar como texto.
// Se publica si NO es borrador y su fecha es igual o anterior a "hoy".
function clasificar(articulos, hoy) {
  const publicados = [];
  const omitidos = [];
  for (const a of articulos) {
    if (a.borrador) omitidos.push({ ...a, motivo: 'borrador' });
    else if (a.fecha > hoy) omitidos.push({ ...a, motivo: `programado para el ${a.fecha}` });
    else publicados.push(a);
  }
  // Del más reciente al más antiguo (si coinciden, por título)
  publicados.sort((x, y) => y.fecha.localeCompare(x.fecha) || x.titulo.localeCompare(y.titulo, 'es'));
  return { publicados, omitidos };
}

// Hasta 2 artículos de la misma categoría, sin contar el actual.
function relacionados(articulo, publicados, cuantos = 2) {
  return publicados
    .filter((a) => a.categoriaSlug === articulo.categoriaSlug && a.slug !== articulo.slug)
    .slice(0, cuantos);
}

// Las categorías se definen en contenido/categorias.json (así existen aunque
// todavía no tengan artículos). Cada artículo publicado se mete en la suya.
function categorias(publicados, lista) {
  const mapa = new Map(lista.map((c) => [aSlug(c.nombre), { ...c, slug: aSlug(c.nombre), articulos: [] }]));
  for (const a of publicados) mapa.get(a.categoriaSlug).articulos.push(a);
  return [...mapa.values()];
}

// Avisa si un artículo usa una categoría que no está en categorias.json
// (por ejemplo, por una falta de ortografía: "Idiomass").
function comprobarCategorias(articulos, lista) {
  const validas = new Set(lista.map((c) => aSlug(c.nombre)));
  for (const a of articulos) {
    if (!validas.has(a.categoriaSlug)) {
      throw new Error(`"${a.archivo}": la categoría "${a.categoria}" no existe. Categorías válidas: ${lista.map((c) => c.nombre).join(', ')} (contenido/categorias.json).`);
    }
  }
}

// Trocea una lista en páginas de 4.
// base "blog" -> página 1 en blog/, página 2 en blog/pagina/2/ ...
function paginar(lista, base) {
  const total = Math.max(1, Math.ceil(lista.length / POR_PAGINA));
  const ruta = (n) => (n === 1 ? `${base}/` : `${base}/pagina/${n}/`);
  return Array.from({ length: total }, (_, i) => {
    const numero = i + 1;
    return {
      numero,
      total,
      articulos: lista.slice(i * POR_PAGINA, numero * POR_PAGINA),
      ruta: ruta(numero),
      salida: ruta(numero) + 'index.html',
      anterior: numero > 1 ? ruta(numero - 1) : null,
      siguiente: numero < total ? ruta(numero + 1) : null,
    };
  });
}

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
// "2026-11-10" -> "10 de noviembre de 2026"
function fechaLarga(iso) {
  const [a, m, d] = iso.split('-').map(Number);
  return `${d} de ${MESES[m - 1]} de ${a}`;
}

module.exports = { leerArticulos, clasificar, relacionados, categorias, comprobarCategorias, paginar, fechaLarga, esFechaValida, tiempoLectura, aSlug };
