# Antenista Fuentes

Web de instalación y reparación de antenas para instalaciondeantenasurgente.com.

## Compilar

Ejecuta `node src/build.mjs` con Node.js 22. El resultado se escribe en `dist/`. Netlify lee automáticamente el comando y el directorio de salida de `netlify.toml`. El sitio no tiene dependencias de instalación ni requiere variables de entorno.

## Cobertura y contenido

- `src/contenido.mjs` contiene los municipios con página propia, su contenido, los servicios y los municipios con trabajos confirmados.
- Las páginas municipales existentes cubren poblaciones principales y lugares con trabajos confirmados. Una nueva ficha necesita información útil propia; la población del municipio no basta para justificar otra página.
- `data/municipios.json` registra el código INE, el nombre, la población a 1 de enero de 2025, latitud, longitud y capital municipal cuando tiene otro nombre.
- El resto de municipios se enlaza a su apartado dentro de la página principal más cercana en línea recta en la misma provincia. Se confirma cada desplazamiento al contactar.
- Los casos documentados enlazan la foto y la descripción de la intervención con su municipio. La galería general de equipos no acredita por sí sola un trabajo en un municipio concreto.

## Criterios para futuras actualizaciones

- Este repositorio corresponde solo a instalaciondeantenasurgente.com. No incorporar trabajos ni fotos de Antenas Rapid u otras webs sin confirmación expresa para este proyecto.
- En cada caso publicado conservar la ubicación y el alcance comunicados por el titular. Distinguir avería, actuación y resultado conocido; no inventar mediciones, fechas, resultados, direcciones, reseñas ni certificaciones. Un aviso pendiente no es una reparación terminada.
- Las orientaciones de servicio se presentan como consejos o posibilidades, no como experiencias realizadas en ese municipio. `src/burgos.mjs` reúne cuatro orientaciones prácticas de Burgos.
- Actualizar las guías sobre canales con fuentes oficiales y fechas comprobadas. No multiplicar una noticia por todos los municipios ni cambiar fechas solo para aparentar actualidad.
- Priorizar información que ayude a decidir o preparar una visita. Reescribir sinónimos, añadir nombres de pueblos o alcanzar una cantidad de palabras no convierte una ficha en contenido propio.
- Mantener las URL existentes. Antes de eliminar o consolidar una página, revisar sus enlaces y sus datos de Search Console para preparar la redirección que corresponda.

## Validación de publicación

`node src/build.mjs` ejecuta `src/validar-sitio.mjs` antes de escribir `dist/`. El despliegue se detiene si detecta páginas sin H1 único, títulos o descripciones duplicados, canonical incorrecto, bloqueos de indexación en páginas indexables, JSON-LD no válido, identificadores duplicados, destinos internos o imágenes ausentes, anclas rotas o páginas indexables sin ruta de enlaces desde la portada.

Esta comprobación técnica no determina la calidad editorial ni garantiza indexación o posiciones. La evolución real se comprueba en Search Console: rendimiento, indexación, acciones manuales y seguridad.

## Fuentes

- [INE. Cifras oficiales de población municipal a 1 de enero de 2025](https://www.ine.es/dynt3/inebase/es/index.htm?padre=9041)
- [IGN. Información geográfica destacada, listado de municipios](https://www.ign.es/web/ane-datos-geograficos)
- Mapa del pie: [límites provinciales del IGN, servidos por el Ministerio de Transportes](https://mapas.fomento.gob.es/arcgis/rest/services/SIU/ENTIDADES_TERRITORIALES_EGRN/MapServer/2) y [Natural Earth](https://www.naturalearthdata.com/about/terms-of-use/) para el contexto internacional.

## Publicación

Conecta la rama `main` en Netlify y configura `instalaciondeantenasurgente.com` como dominio principal. Tras confirmar que responde por HTTPS, el sitemap estará en `https://instalaciondeantenasurgente.com/sitemap.xml`.
