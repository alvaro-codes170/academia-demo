// SEO: direcciones absolutas, datos estructurados (JSON-LD),
// sitemap.xml, feed.xml (RSS) y robots.txt.
const { escapar } = require('./utilidades');

// "blog/x/index.html" -> "https://.../blog/x/"   |   "cursos.html" -> "https://.../cursos.html"
function urlAbsoluta(base, salida) {
  return base + salida.replace(/(^|\/)index\.html$/, '$1');
}

// Mete un objeto como datos estructurados dentro de <script>.
// Cambiamos "<" por su código para que un texto nunca pueda cerrar el <script>.
function jsonLd(objeto) {
  const json = JSON.stringify({ '@context': 'https://schema.org', ...objeto }, null, 2).replace(/</g, '\\u003c');
  return `  <script type="application/ld+json">\n${json}\n  </script>`;
}

// ---------- Organización educativa ----------
const DIAS = { 'Lunes a viernes': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], 'Lunes a jueves': ['Monday', 'Tuesday', 'Wednesday', 'Thursday'] };

// "10:00 a 13:00 y 16:00 a 21:00" -> [["10:00","13:00"], ["16:00","21:00"]]
const tramos = (texto) => [...texto.matchAll(/(\d{2}:\d{2}) a (\d{2}:\d{2})/g)].map((m) => [m[1], m[2]]);

function organizacion(negocio, profesorado) {
  const base = negocio.urlSitio;
  const horario = [];
  for (const { dias, horas } of negocio.horarioAtencion) {
    if (!DIAS[dias]) continue; // "Sábados y domingos: Cerrado" no se indica
    for (const [abre, cierra] of tramos(horas)) {
      horario.push({ '@type': 'OpeningHoursSpecification', dayOfWeek: DIAS[dias], opens: abre, closes: cierra });
    }
  }
  return {
    '@type': 'EducationalOrganization',
    '@id': base + '#organizacion',
    name: negocio.nombre,
    description: `${negocio.lema} en ${negocio.direccion.localidad}. Grupos de máximo ${negocio.condiciones.maxAlumnos} alumnos.`,
    url: base,
    logo: base + 'img/logo.png',
    image: base + 'img/og-academia-faro.png',
    telephone: negocio.telefonoEnlace,
    email: negocio.correo,
    foundingDate: String(negocio.fundacion),
    founder: { '@type': 'Person', name: negocio.fundadora },
    address: {
      '@type': 'PostalAddress',
      streetAddress: negocio.direccion.calle,
      postalCode: negocio.direccion.codigoPostal,
      addressLocality: negocio.direccion.localidad,
      addressCountry: 'ES',
    },
    openingHoursSpecification: horario,
    // Se genera desde profesorado.json: si quitas a alguien de ahí, desaparece también aquí.
    employee: profesorado.map((p) => ({ '@type': 'Person', name: p.nombre, jobTitle: `Profesor/a de ${p.materia}` })),
  };
}

// ---------- Preguntas frecuentes ----------
function faqPage(preguntas) {
  return {
    '@type': 'FAQPage',
    mainEntity: preguntas.map(({ pregunta, respuesta }) => ({
      '@type': 'Question',
      name: pregunta,
      acceptedAnswer: { '@type': 'Answer', text: respuesta },
    })),
  };
}

// ---------- Artículo del blog ----------
function blogPosting(a, negocio, url, imagen) {
  return {
    '@type': 'BlogPosting',
    headline: a.titulo,
    description: a.resumen,
    datePublished: a.fecha,
    dateModified: a.fecha,
    inLanguage: 'es-ES',
    articleSection: a.categoria,
    wordCount: a.palabras,
    image: imagen,
    url,
    mainEntityOfPage: url,
    author: { '@type': 'Organization', name: negocio.nombre, url: negocio.urlSitio },
    publisher: { '@id': negocio.urlSitio + '#organizacion', '@type': 'EducationalOrganization', name: negocio.nombre, logo: { '@type': 'ImageObject', url: negocio.urlSitio + 'img/logo.png' } },
  };
}

// ---------- sitemap.xml ----------
// Lista para los buscadores con todas las páginas públicas.
function sitemap(paginas) {
  const urls = paginas.map(({ url, fecha }) =>
    `  <url>\n    <loc>${escapar(url)}</loc>${fecha ? `\n    <lastmod>${fecha}</lastmod>` : ''}\n  </url>`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}

// ---------- feed.xml (RSS 2.0) ----------
// Los lectores de RSS lo consultan para avisar de artículos nuevos.
const fechaRss = (iso) => new Date(iso + 'T09:00:00Z').toUTCString(); // formato que pide RSS

function feed(articulos, negocio) {
  const base = negocio.urlSitio;
  const items = articulos.map((a) => {
    const url = `${base}blog/${a.slug}/`;
    return `    <item>
      <title>${escapar(a.titulo)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${fechaRss(a.fecha)}</pubDate>
      <category>${escapar(a.categoria)}</category>
      <description>${escapar(a.resumen)}</description>
    </item>`;
  });
  const ultima = articulos[0] ? fechaRss(articulos[0].fecha) : new Date().toUTCString();
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Blog de ${escapar(negocio.nombre)}</title>
    <link>${base}blog/</link>
    <atom:link href="${base}feed.xml" rel="self" type="application/rss+xml"/>
    <description>Consejos de estudio, idiomas e ideas para familias de ${escapar(negocio.nombre)}.</description>
    <language>es-ES</language>
    <lastBuildDate>${ultima}</lastBuildDate>
${items.join('\n')}
  </channel>
</rss>
`;
}

// ---------- robots.txt ----------
function robots(base) {
  return `# Todos los buscadores pueden rastrear la web entera\nUser-agent: *\nAllow: /\n\nSitemap: ${base}sitemap.xml\n`;
}

module.exports = { urlAbsoluta, jsonLd, organizacion, faqPage, blogPosting, sitemap, feed, robots };
