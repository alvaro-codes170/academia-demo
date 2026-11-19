# Academia Faro: reglas del proyecto

## Tecnologías
- HTML, CSS y JavaScript sencillos en el navegador. Sin frameworks ni librerías.
- Node.js solo para los scripts: `build.js` (genera la web) y `scripts/check.js` (revisa la calidad).
- Sin dependencias de npm: el lector de Markdown es un módulo propio y pequeño.

## Carpetas
- `contenido/`: los textos (artículos del blog en Markdown y datos en JSON: cursos, profesorado, FAQ).
- `plantillas/`: las plantillas HTML (cabecera, pie, páginas y artículo).
- `scripts/`: el script check.js y los módulos de apoyo de build.js.
- `estaticos/`: CSS, JS del navegador, imágenes y config.js.
- `docs/`: la web generada (no se edita a mano; se regenera con `node build.js`). Se sube a GitHub porque Pages la sirve.

## Reglas permanentes
- El HTML generado lleva todo el texto visible. Nunca se usa JavaScript para mostrar contenido; solo para mejorar cosas (formulario, menú).
- Las rutas son relativas para que funcionen en Live Server y en usuario.github.io/<repo>/.
- Nunca se escriben en el código claves secretas, contraseñas, tokens ni datos personales reales. Los identificadores públicos (Formspree, GoatCounter) van solo en config.js.
- No se inventan datos ni cifras que no estén en briefing.md. Los artículos son consejos generales, sin estudios ni porcentajes.
- Textos en español, tono cercano, frases cortas. Primero el móvil. Accesibilidad AA.
- Cada fase se hace en su rama, con commits que citan el número del Issue.
- Antes de dar una tarea por terminada, ejecuta `node build.js` y `node scripts/check.js` (debe terminar sin errores) y explica cómo probarla paso a paso.
