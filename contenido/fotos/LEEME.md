# Fotos de la web

Deja aquí las fotos originales (JPG, PNG o WebP) y ejecuta:

```
npm run imagenes
node build.js
```

El **nombre del archivo** decide dónde aparece cada foto:

| Nombre del archivo | Dónde se ve |
|---|---|
| `portada.jpg` | Portada (inicio) |
| `curso-primaria.jpg` | Refuerzo de Primaria |
| `curso-secundaria.jpg` | Refuerzo de ESO y Bachillerato |
| `curso-ingles.jpg` | Inglés en grupo |
| `curso-cambridge.jpg` | Preparación Cambridge B2 First |
| `curso-particulares.jpg` | Clases particulares |
| `profesorado.jpg` | Página de profesorado |
| `contacto.jpg` | Entrada de la academia (contacto) |
| `mapa.jpg` | Plano de situación (contacto) |
| `blog.jpg` | Imagen por defecto de los artículos |

Las que no tengan foto seguirán usando el dibujo SVG de marcador.

- Usa fotos horizontales de al menos 1200 px de ancho. Se recortan a formato 3:2.
- Comprueba que la licencia permite el uso comercial (Unsplash, Pexels o Pixabay).
- Nada de menores identificables.
- Si cambias una foto, revisa también su texto alternativo en `contenido/imagenes.json` (o en `cursos.json` para los cursos).
