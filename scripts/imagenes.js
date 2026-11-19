// scripts/imagenes.js: prepara las fotos para la web.
//
// Uso:  npm run imagenes      (o: node scripts/imagenes.js)
//
// Lee las fotos de contenido/fotos/ (JPG, PNG o WebP) y, por cada una, crea
// en estaticos/img/:
//   - nombre-480.webp, nombre-800.webp y nombre-1200.webp
//     (recortadas a 3:2; el navegador del móvil descarga la pequeña)
//   - nombre-og.jpg, de 1200 x 630, para la vista previa en redes sociales
// y anota en contenido/imagenes-webp.json qué fotos hay y en qué tamaños.
// build.js usa ese archivo: si una imagen tiene versión WebP, la usa;
// si no, sigue usando el SVG de marcador de posición.
//
// El nombre del archivo decide dónde va la foto: portada.jpg sustituye a
// portada.svg, curso-ingles.jpg a curso-ingles.svg, etc.
//
// Necesita la librería sharp (solo en tu ordenador, no se publica en la web).

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const RAIZ = path.join(__dirname, '..');
const ENTRADA = path.join(RAIZ, 'contenido', 'fotos');
const SALIDA = path.join(RAIZ, 'estaticos', 'img');
const MANIFIESTO = path.join(RAIZ, 'contenido', 'imagenes-webp.json');

const ANCHOS = [480, 800, 1200];
const PROPORCION = 2 / 3;          // alto = ancho x 2/3 (formato 3:2)
const CALIDAD_WEBP = 75;
const CALIDAD_JPG = 80;

async function procesar(archivo) {
  const nombre = path.basename(archivo, path.extname(archivo)).toLowerCase();
  const original = sharp(path.join(ENTRADA, archivo)).rotate(); // .rotate() respeta la orientación de las fotos del móvil
  const { width } = await original.metadata();

  // Nunca agrandamos una foto: solo los tamaños que caben en la original.
  let anchos = ANCHOS.filter((a) => a <= width);
  if (anchos.length === 0) anchos = [width];

  for (const ancho of anchos) {
    await original.clone()
      .resize(ancho, Math.round(ancho * PROPORCION), { fit: 'cover', position: 'attention' })
      .webp({ quality: CALIDAD_WEBP })
      .toFile(path.join(SALIDA, `${nombre}-${ancho}.webp`));
  }
  await original.clone()
    .resize(1200, 630, { fit: 'cover', position: 'attention' })
    .jpeg({ quality: CALIDAD_JPG, mozjpeg: true })
    .toFile(path.join(SALIDA, `${nombre}-og.jpg`));

  const mayor = anchos[anchos.length - 1];
  return [nombre, { anchos, ancho: mayor, alto: Math.round(mayor * PROPORCION) }];
}

async function main() {
  fs.mkdirSync(ENTRADA, { recursive: true });
  const fotos = fs.readdirSync(ENTRADA).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
  if (fotos.length === 0) {
    console.log('No hay fotos en contenido/fotos/. La web seguirá usando las imágenes SVG de marcador.');
  }

  const manifiesto = {};
  for (const foto of fotos) {
    const [nombre, datos] = await procesar(foto);
    manifiesto[nombre] = datos;
    const pesos = datos.anchos.map((a) => `${a}px ${(fs.statSync(path.join(SALIDA, `${nombre}-${a}.webp`)).size / 1024).toFixed(0)} KB`);
    console.log(`  ✓ ${foto} → ${pesos.join(', ')} + ${nombre}-og.jpg`);
  }

  fs.writeFileSync(MANIFIESTO, JSON.stringify(manifiesto, null, 2) + '\n');
  console.log(`\n${fotos.length} foto(s) preparadas. Ahora ejecuta: node build.js`);
}

main().catch((e) => {
  console.error('Error preparando las imágenes:', e.message);
  process.exit(1);
});
