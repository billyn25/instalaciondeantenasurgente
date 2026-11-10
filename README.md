# Antenista Fuentes

Web de instalación y reparación de antenas para instalaciondeantenasurgente.com.

## Compilar

Ejecuta `node src/build.mjs` con Node.js 22. El resultado se escribe en `dist/`. Netlify lee automáticamente el comando y el directorio de salida de `netlify.toml`. El sitio no tiene dependencias de instalación ni requiere variables de entorno.

## Cobertura y contenido

- `src/contenido.mjs` contiene los municipios con página propia, su contenido, los servicios y los municipios con trabajos confirmados.
- Se incluyen como mínimo los ocho municipios más poblados de cada provincia, junto con otros municipios de referencia por ubicación o trabajos reales.
- `data/municipios.json` registra el código INE, el nombre, la población a 1 de enero de 2025, latitud, longitud y capital municipal cuando tiene otro nombre.
- El resto de municipios se enlaza a su apartado dentro de la página principal más cercana en línea recta en la misma provincia. Se confirma cada desplazamiento al contactar.
- Las fotografías de los trabajos se muestran como galería general. Los pies describen lo que aparece en la foto. La lista de lugares donde se han realizado trabajos va por separado.

## Fuentes

- [INE. Cifras oficiales de población municipal a 1 de enero de 2025](https://www.ine.es/dynt3/inebase/es/index.htm?padre=9041)
- [IGN. Información geográfica destacada, listado de municipios](https://www.ign.es/web/ane-datos-geograficos)
- Mapa del pie: [límites provinciales del IGN, servidos por el Ministerio de Transportes](https://mapas.fomento.gob.es/arcgis/rest/services/SIU/ENTIDADES_TERRITORIALES_EGRN/MapServer/2) y [Natural Earth](https://www.naturalearthdata.com/about/terms-of-use/) para el contexto internacional.

## Publicación

Conecta la rama `main` en Netlify y configura `instalaciondeantenasurgente.com` como dominio principal. Tras confirmar que responde por HTTPS, el sitemap estará en `https://instalaciondeantenasurgente.com/sitemap.xml`.
