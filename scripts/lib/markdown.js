// Lector de Markdown propio y pequeño (sin librerías).
// Entiende lo que usan los artículos del blog:
//   ## Título y ### Subtítulo   - listas   1. listas numeradas
//   > citas   **negrita**   *cursiva*   [enlace](url)   párrafos
const { escapar } = require('./utilidades');

// ---------- Cabecera del artículo (front matter) ----------
// Es el bloque entre las dos líneas "---" del principio:
//   ---
//   titulo: Cómo organizar el estudio
//   fecha: 2026-11-10
//   ---
function separarCabecera(texto, archivo) {
  const limpio = texto.replace(/^﻿/, '').replace(/\r\n/g, '\n');
  const encontrado = limpio.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!encontrado) {
    throw new Error(`"${archivo}" no tiene cabecera. Debe empezar con una línea "---".`);
  }
  const datos = {};
  for (const linea of encontrado[1].split('\n')) {
    if (!linea.trim()) continue;
    const pos = linea.indexOf(':');
    if (pos === -1) throw new Error(`"${archivo}": la línea "${linea}" de la cabecera no tiene "clave: valor".`);
    const clave = linea.slice(0, pos).trim();
    let valor = linea.slice(pos + 1).trim();
    // Quita las comillas si el valor va entre comillas (útil si lleva ":")
    if (/^(["']).*\1$/.test(valor)) valor = valor.slice(1, -1);
    datos[clave] = valor;
  }
  return { datos, cuerpo: encontrado[2] };
}

// ---------- Formato dentro de una línea ----------
function enLinea(texto) {
  let html = escapar(texto);
  html = html.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, txt, url) => {
    const externo = /^https?:\/\//.test(url);
    return `<a href="${url}"${externo ? ' rel="noopener"' : ''}>${txt}</a>`;
  });
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  return html;
}

// ---------- Bloques (párrafos, títulos, listas...) ----------
function aHTML(markdown) {
  const bloques = markdown.replace(/\r\n/g, '\n').trim().split(/\n\s*\n/);
  return bloques.map((bloque) => {
    const lineas = bloque.split('\n');
    const titulo = bloque.match(/^(#{1,4})\s+(.+)$/);
    if (titulo && lineas.length === 1) {
      // El <h1> de la página es el título del artículo: dentro del texto
      // empezamos en <h2> aunque se escriba "#".
      const nivel = Math.min(Math.max(titulo[1].length, 2), 4);
      return `<h${nivel}>${enLinea(titulo[2])}</h${nivel}>`;
    }
    if (lineas.every((l) => /^\s*[-*]\s+/.test(l))) {
      const items = lineas.map((l) => `  <li>${enLinea(l.replace(/^\s*[-*]\s+/, ''))}</li>`);
      return `<ul>\n${items.join('\n')}\n</ul>`;
    }
    if (lineas.every((l) => /^\s*\d+\.\s+/.test(l))) {
      const items = lineas.map((l) => `  <li>${enLinea(l.replace(/^\s*\d+\.\s+/, ''))}</li>`);
      return `<ol>\n${items.join('\n')}\n</ol>`;
    }
    if (lineas.every((l) => /^>\s?/.test(l))) {
      return `<blockquote><p>${enLinea(lineas.map((l) => l.replace(/^>\s?/, '')).join(' '))}</p></blockquote>`;
    }
    return `<p>${enLinea(lineas.join(' '))}</p>`;
  }).join('\n');
}

// Texto sin marcas de Markdown, para contar palabras.
function textoPlano(markdown) {
  return markdown
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#>*_`-]/g, ' ');
}

module.exports = { separarCabecera, aHTML, textoPlano };
