# BRIEFING: Web de Academia Faro (cliente ficticio)

## 1. Datos del negocio
- Nombre: Academia Faro, refuerzo escolar e idiomas
- Tipo: academia de barrio con grupos reducidos para alumnado de primaria, ESO, bachillerato y adultos
- Fundada: 2015 por Beatriz Salcedo, profesora de inglés
- Equipo: 7 personas (5 profesores, 1 coordinación y 1 administración)
- Dirección: Calle de la Luz 18, 1.º, 28994 Villanueva del Faro (dirección inventada)
- Teléfono: 600 000 005 (ficticio)
- WhatsApp: 600 000 005 (ficticio)
- Correo: info@academiafaro.example (ficticio)
- Instagram: @academiafaro (ficticio)
- Horario de atención: lunes a viernes de 10:00 a 13:00 y de 16:00 a 21:00; sábados y domingos cerrado
- Horario de clases: lunes a jueves de 16:00 a 21:00

## 2. Propuesta de valor (lo que debe transmitir la web)
- Grupos reducidos: **máximo 8 alumnos por grupo**
- Seguimiento personal: informe de progreso cada trimestre a las familias
- Profesorado titulado, con experiencia en el nivel que enseña
- Clase de prueba gratuita, sin compromiso
- Inglés con preparación para los exámenes oficiales de Cambridge
- Ambiente cercano: "aquí nadie se queda atrás"

## 3. Cursos y cuotas mensuales (ficticias, IVA no aplicable)
| Curso | Nivel | Horas por semana | Cuota mensual |
|---|---|---|---|
| Refuerzo escolar Primaria | 1.º a 6.º de Primaria | 2 | 49 € |
| Refuerzo escolar ESO | 1.º a 4.º de ESO | 2 | 59 € |
| Refuerzo escolar Bachillerato | 1.º y 2.º | 2 | 69 € |
| Inglés en grupo | Niveles A1 a C1 | 2 | 45 € |
| Preparación Cambridge B2 First | Nivel B2 | 3 | 79 € |
| Clases particulares (1 alumno) | Cualquier materia | 1 | 60 € |

- Matrícula anual: 25 € (única vez por curso escolar)
- Descuento por hermanos: 10 % en la cuota del segundo alumno y siguientes
- Primera clase de prueba: gratis
- Los precios son orientativos y se confirman al matricularse

## 4. Qué quiere el cliente en la web
- **Inicio:** propuesta de valor, cursos destacados, botón "Pide tu clase de prueba", testimonios de familias (ficticios), últimas 3 entradas del blog
- **Cursos:** ficha de cada uno de los 6 cursos con descripción, horas, cuota y botón para pedir información
- **Profesorado:** 5 profesores con nombre, materia y una frase (inventados)
- **Blog:** listado paginado, categorías, ficha de artículo con tiempo de lectura y artículos relacionados (ver sección 6)
- **Contacto:** formulario de solicitud de clase de prueba (ver sección 7), mapa, horario, teléfono y WhatsApp
- **Preguntas frecuentes** (en la página de inicio o de cursos), con 5 preguntas
- **Página 404** amable con enlaces a las secciones principales
- Botón de llamada y de WhatsApp visibles en el móvil
- Imágenes de marcador de posición (6 como mínimo)

## 5. Preguntas frecuentes (textos del cliente)
1. **¿Cuántos alumnos hay por grupo?** Como máximo 8.
2. **¿Puedo probar antes de matricularme?** Sí, la primera clase es gratuita y sin compromiso.
3. **¿Hay descuento por hermanos?** Sí, un 10 % en la cuota del segundo alumno y siguientes.
4. **¿Cómo sé cómo va mi hijo o hija?** Enviamos un informe de progreso cada trimestre.
5. **¿Preparáis exámenes de Cambridge?** Sí, ofrecemos preparación de B2 First.

## 6. Blog
- Los artículos se escriben en **archivos Markdown** dentro de la carpeta `contenido/blog/`, cada uno con una cabecera con: título, fecha, categoría, resumen, imagen (opcional) y `borrador` (sí o no).
- La web genera automáticamente: una página por artículo, el listado paginado (**4 artículos por página**), las páginas de categoría, el `sitemap.xml` y el `feed.xml` (RSS).
- Orden: del más reciente al más antiguo.
- **Tiempo de lectura:** palabras del artículo divididas entre 200, redondeado hacia arriba, con un mínimo de 1 minuto.
- **Artículos relacionados:** hasta 2 de la misma categoría, excluyendo el actual.
- **Borradores:** no se publican.
- **Programados:** los artículos con fecha futura no se publican hasta que llegue esa fecha (al generar la web se compara con la fecha de hoy).
- Categorías: Estudio, Idiomas, Familias.
- Los textos de los artículos deben ser consejos generales y **sin cifras ni estudios inventados** (ni "según un estudio...").

Artículos iniciales (la web puede redactar textos breves de unos 250 a 400 palabras):

| Título | Fecha | Categoría | Estado |
|---|---|---|---|
| Cómo organizar el estudio en época de exámenes | 2026-11-10 | Estudio | Publicado |
| Cinco hábitos para mejorar tu inglés sin darte cuenta | 2026-10-28 | Idiomas | Publicado |
| ¿Cuánto tiempo de estudio necesita un adolescente? | 2026-10-14 | Estudio | Publicado |
| Cambridge B2 First: qué esperar del examen | 2026-09-30 | Idiomas | Publicado |
| Vuelta al cole: preparar el curso en familia | 2026-09-12 | Familias | Publicado |
| Cómo elegir una academia de refuerzo | 2026-09-02 | Familias | Publicado |
| Técnicas de memoria que funcionan | 2026-11-15 | Estudio | **Borrador** |
| Propósitos de año nuevo para estudiantes | 2027-01-15 | Estudio | **Programado** (fecha futura) |

## 7. Formulario de solicitud de clase de prueba (real, con servicio externo)
- Campos: nombre y apellidos de la persona de contacto, correo, teléfono, nombre del alumno o alumna, edad o curso del alumno (lista: "menor de 14 años", "14 a 17 años", "adulto"), interés (refuerzo, inglés, Cambridge o clases particulares), franja horaria preferida (tardes: 16:00 a 18:30 o 18:30 a 21:00) y mensaje (opcional)
- Si se elige **"menor de 14 años"**, aparece una casilla obligatoria: "Soy el padre, la madre o el tutor legal y doy mi consentimiento para que Academia Faro trate estos datos para contactar conmigo."
- Casilla obligatoria de lectura de la política de privacidad
- **Antispam:** campo oculto que los humanos no ven (si se rellena, no se envía) y desactivar el botón tras pulsarlo para evitar envíos dobles
- **Estados:** botón normal, "Enviando...", mensaje de éxito ("¡Gracias! Te escribiremos en 1 o 2 días laborables.") y mensaje de error con el teléfono de la academia como alternativa. Si falla la conexión, no se pierde lo escrito
- El mensaje debe llegar al correo del propietario del servicio de formularios (en el ejercicio, **tu correo personal**)
- Las claves o identificadores del servicio van en un archivo de configuración aparte (`config.js`)
- Todo el ejercicio se hace **solo con datos inventados**

## 8. Preferencias de diseño
- Estilo: cercano, luminoso, de confianza; educativo sin parecer un colegio
- Colores: azul faro (#1D4E89), amarillo luz (#F2B134) como acento, blanco roto (#FAFAF7) y gris azulado (#2B3A4A) para el texto
- Tipografía: títulos con sans redondeada y texto con sans legible
- Fotos de aulas pequeñas, estudio y lectura, sin caras de menores identificables; esquinas redondeadas
- Tono de los textos: cercano y claro, en segunda persona del singular (tú) o tratando de "vosotros" a las familias; frases cortas
- Debe verse perfecto en móvil: el 75 % de las visitas viene del teléfono
- Modo oscuro: no hace falta

## 9. Requisitos técnicos y legales
- HTML, CSS y JavaScript sencillos en el navegador; un único script de Node (`build.js`) para generar el blog; sin frameworks ni librerías externas, salvo una pequeña librería de Markdown si es imprescindible
- El HTML generado debe contener **todo el texto visible** (no depender de JavaScript para mostrar el contenido)
- Carga rápida: imágenes en WebP con tamaños adaptados y `loading="lazy"`; objetivo de Lighthouse en móvil: **95 o más** en las cuatro categorías
- Accesibilidad: contraste AA, formularios con etiquetas, mensajes de error asociados a cada campo, navegación con teclado
- SEO avanzado: `title` y `meta description` únicos, URL canónica, etiquetas Open Graph, datos estructurados (organización educativa, artículos de blog y preguntas frecuentes), `sitemap.xml`, `robots.txt` y `feed.xml`
- Un script `scripts/check.js` que revise todas las páginas y avise de: títulos o descripciones repetidos, descripciones demasiado largas o cortas, páginas sin un único `<h1>`, imágenes sin `alt` y enlaces internos rotos
- Analítica sin cookies (por ejemplo, GoatCounter), que no identifique a personas
- Páginas de aviso legal, política de privacidad (con apartado específico sobre datos de menores y conservación) y política de cookies (plantillas genéricas para revisar por un profesional)
- `404.html` personalizada

## 10. Presupuesto del proyecto web (para el freelance)
| Concepto | Importe |
|---|---|
| Diseño y maquetación de la web (7 páginas) | 640 € |
| Blog con generador desde Markdown | 380 € |
| Formulario real con servicio externo y antispam | 160 € |
| SEO avanzado (datos estructurados, redes, RSS) | 200 € |
| Comprobador automático de calidad | 90 € |
| Analítica sin cookies | 60 € |
| Páginas legales con apartado de menores (plantillas) | 90 € |
| Página 404 y redirecciones | 30 € |
| Dominio y hosting, primer año | 100 € |
| **Total** | **1.750 €** |
- Plazo de entrega: 6 semanas
- Mantenimiento opcional: 60 €/mes (publicación de artículos, cambios de cuotas y textos)
- Pago: 50 % al empezar y 50 % al entregar

## 11. Cambios del cliente (ronda 1, noviembre de 2026)
Estos cambios sustituyen a los datos anteriores de este briefing:
- **Cuotas nuevas:** Refuerzo escolar Primaria 52 €, ESO 62 € y Bachillerato 72 € (el resto no cambia).
- **Artículo nuevo:** "Cómo preparar un examen oral de inglés", categoría Idiomas, fecha 2026-11-25 (programado).
- **Categorías del blog:** Estudio, Idiomas, Familias y **Selectividad**.
- **Formulario:** nuevo campo obligatorio "¿Cómo nos has conocido?" (Google, Instagram, un amigo o familiar, otro).
- **Profesorado:** Samuel ya no forma parte del equipo; la web muestra 4 profesores.
- **Color de acento:** naranja suave (#F4A261) en lugar del amarillo luz.