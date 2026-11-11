import { guiasServicio } from './guias-servicio.mjs';
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { ampliaciones, diagnosticos, fichas, provincias, servicioProvincial, servicios, trabajos } from './contenido.mjs';

const read = (path) => JSON.parse(readFileSync(new URL('../' + path, import.meta.url), 'utf8'));
const output = new URL('../dist/', import.meta.url);
const base = 'https://instalaciondeantenasurgente.com';
const brand = 'Antenista Fuentes';
const owner = 'David Corregidor Gonzalo';
const legalAddress = 'Calle La Fragua s/n, Madrid';
const phone = '+34 641 49 05 36';
const tel = 'tel:+34641490536';
const wa = (place, request = 'necesito un antenista') => 'https://wa.me/34641490536?text=' + encodeURIComponent(
  'Hola, ' + request + (place ? ' en ' + place : '') + '.'
);
const esc = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char]);
const normalize = (text) => text.toLowerCase().normalize('NFD')
  .replace(/\p{Diacritic}/gu, '').replace(/[^a-z0-9]+/g, ' ').trim();
const slug = (text) => normalize(text).replaceAll(' ', '-');
const names = {
  '20069': ['Donostia / San Sebastián', 'donostia-san-sebastian', 'donosti san sebastian'],
  '20067': ['Errenteria', 'errenteria', 'renteria'],
  '20055': ['Arrasate / Mondragón', 'arrasate-mondragon', 'mondragon'],
  '20045': ['Irun', 'irun', 'irun irún'],
  '01036': ['Llodio / Laudio', 'llodio', 'laudio llodio'],
  '01051': ['Agurain / Salvatierra', 'agurain-salvatierra', 'salvatierra'],
  '01901': ['Iruña de Oca', 'iruna-de-oca', 'iruna oka nanclares de la oca langraiz oka'],
  '01059': ['Vitoria-Gasteiz', 'vitoria-gasteiz', 'vitoria gasteiz'],
  '01043': ['Oyón-Oion', 'oyon-oion', 'oyon oion'],
  '09903': ['Villarcayo', 'villarcayo', 'merindad de castilla la vieja'],
};
const photos = read('data/fotos.json').filter(([name]) => name !== 'antena-en-cubierta');
const photosByName = new Map(photos.map((photo) => [photo[0], photo]));
const bilbaoPhotos = ['bilbao-cabecera-medidor', 'bilbao-cabecera-modular'].map((key) => photosByName.get(key));
const bilbaoCasePhoto = photosByName.get('bilbao-centro-antena-tdt');
const bilbaoCaseUrl = '/bizkaia/bilbao/#caso-pixelacion-bilbao';
const bilbaoCommunityUrl = '/bizkaia/bilbao/#instalaciones-comunitarias';
const gernikaSecondPhoto = photosByName.get('gernika-lumo-dos-antenas');
const gernikaPhoto = photosByName.get('gernika-lumo-antena-tdt');
const gernikaCaseUrl = '/bizkaia/gernika-lumo/#trabajos-locales';
const durangoPhoto = photosByName.get('durango-antena-caida-reparada');
const durangoCaseUrl = '/bizkaia/durango/#trabajos-locales';
const bermeoPhoto = photosByName.get('bermeo-antena-cable-vientos');
const bermeoCaseUrl = '/bizkaia/bermeo/#trabajos-locales';
const santurtziPhoto = ['santurtzi-antena-tdt', 'Antena TDT sobre un mástil exterior en Santurtzi', 676, 1200];
const santurtziCaseUrl = '/bizkaia/santurtzi/#trabajos-locales';
const debaPhotos = photos.filter(([name]) => name.startsWith('deba-'));
const galleryPhoto = photosByName.get('tdt-en-tejado');
const servicePhotos = {
  instalacion: ['antena-tdt-y-parabolica', 'tdt-en-tejado', 'antenas-cielo-azul'],
  reparacion: ['mastil-varias-antenas', 'amplificador-de-senal'],
  comunidades: ['medidor-y-cabecera', 'amplificador-de-senal'],
  satelite: ['antena-tdt-y-parabolica'],
};
const areaMap = new Map(provincias.map(([code, name, key, intro]) =>
  [code, { name, key, intro, url: '/' + key + '/', places: [] }]));
const towns = new Map(read('data/municipios.json').map(([code, official, population, lat, lon, capital]) => {
  const [name, key, alias = ''] = names[code] ?? [official.replaceAll('/', ' / '), slug(official)];
  const province = areaMap.get(code.slice(0, 2));
  const place = { code, name, population, lat, lon, capital, province, key, alias, official };
  province.places.push(place);
  return [code, place];
}));
const collator = new Intl.Collator('es');
const byName = (a, b) => collator.compare(a.name, b.name);
const radians = Math.PI / 180;

function distance(a, b) {
  const lat = Math.sin((a.lat - b.lat) * radians / 2) ** 2;
  const lon = Math.sin((a.lon - b.lon) * radians / 2) ** 2;
  return lat + Math.cos(a.lat * radians) * Math.cos(b.lat * radians) * lon;
}

for (const area of areaMap.values()) {
  area.centers = area.places.filter((place) => Object.hasOwn(fichas, place.code))
    .sort((a, b) => b.population - a.population);
  for (const center of area.centers) {
    center.url = area.url + center.key + '/';
    center.nearby = [];
  }
  for (const place of area.places.filter((item) => !item.url)) {
    const center = area.centers.reduce((nearest, candidate) =>
      distance(place, candidate) < distance(place, nearest) ? candidate : nearest);
    place.center = center;
    place.url = center.url + '#pueblo-' + place.code;
    center.nearby.push(place);
  }
  for (const center of area.centers) center.nearby.sort(byName);
}

const featured = trabajos.map((code) => towns.get(code));
const areaNames = [...areaMap.values()].map((area) => area.name);
const organization = {
  '@type': 'Organization',
  '@id': base + '/#empresa',
  name: brand,
  url: base + '/',
  logo: base + '/assets/logo.svg',
  telephone: phone,
  areaServed: areaNames,
};

function link(href, label, className = '') {
  return '<a href="' + esc(href) + '"' + (className ? ' class="' + className + '"' : '') + '>' + esc(label) + '</a>';
}

function logo() {
  return '<a class="brand" href="/"><img src="/assets/logo.svg" width="42" height="42" alt="">Antenista<br>Fuentes</a>';
}

const mapWidth = 640;
const mapHeight = 350;
// Límites geográficos del SVG en assets/mapa-cobertura.svg.
const { west, east, north, south } = { west: -7.3, east: -1.25, north: 43.87, south: 41.45 };
const mapAreas = ['24089', '39075', '48020', '20069', '01059', '09059', '26089'].map((code, index) => {
  const town = towns.get(code);
  const x = (town.lon - west) / (east - west) * 100;
  const y = (north - town.lat) / (north - south) * 100;
  return { ...town.province, number: index + 1, x: x.toFixed(2), y: y.toFixed(2) };
});
const footer = `<footer class="footer" id="mapa-cobertura"><div class="wrap">
<div class="footer-coverage">
  <div class="footer-intro"><p class="kicker dot">Zonas de servicio</p>
<h2>¿Hasta dónde llegamos?</h2><p>Desde nuestra base en Bilbao nos desplazamos para instalar y reparar antenas en los municipios de las siete provincias del mapa. Toca una provincia para consultar la cobertura.</p></div>
  <div class="footer-map" role="group" aria-label="Mapa de zonas de servicio">
    <img src="/assets/mapa-cobertura.svg" alt="" width="${mapWidth}" height="${mapHeight}" loading="lazy">
    <span class="footer-map-north" aria-hidden="true">↑ N</span>
    ${mapAreas.map(({ url, name, number, x, y }) =>
      `<a class="footer-pin" href="${esc(url)}" aria-label="Ver municipios de ${esc(name)}" style="--x:${x}%;--y:${y}%"><span aria-hidden="true">${number}</span></a>`).join('')}
  </div>
  <nav class="footer-zones" aria-label="Provincias con servicio de antenista">
    <ul>${mapAreas.map(({ url, name, number }) =>
      `<li><a href="${esc(url)}"><span aria-hidden="true">${number}</span>${esc(name)}</a></li>`).join('')}</ul>
    <a class="footer-search" href="/#zonas">Ver todos los municipios <span aria-hidden="true">↗</span></a>
  </nav>
</div>
<div class="footer-base">${logo()}<nav class="footer-links" aria-label="Pie de página">
<a href="/servicios/">Servicios</a><a href="/trabajos/">Trabajos reales</a><a href="/ayuda-antenas/">Ayuda con la TDT</a><a href="/aviso-legal/">Aviso legal</a><a href="/privacidad/">Privacidad</a>
</nav></div></div></footer>`;

function buttons(place = '', callLabel = 'Llamar al 641 49 05 36') {
  return '<div class="actions desktop-contact">' + link(tel, callLabel, 'btn')
    + link(wa(place), 'WhatsApp', 'btn whatsapp') + '</div>';
}

function callout(place = '') {
  return '<section class="section wrap"><div class="callout"><p class="kicker dot">Urgencias 24 horas</p><h2>'
    + esc(place ? '¿Necesitas un antenista en ' + place + '?' : 'Cuéntanos qué le pasa a tu antena')
    + '</h2><p>Atendemos avisos urgentes las 24 horas y nos desplazamos desde Bilbao. Indica el municipio, desde cuándo falla y si afecta a una toma o a varios vecinos. Te confirmamos la disponibilidad y el plazo estimado de llegada.</p>'
    + buttons(place, 'Llamar') + '</div></section>';
}

function crumbs(items) {
  return '<nav class="crumb wrap" aria-label="Ruta de navegación"><ol>'
    + items.map(([name, url], index) => '<li>' + (index === items.length - 1
      ? '<span aria-current="page">' + esc(name) + '</span>' : link(url, name)) + '</li>').join('')
    + '</ol></nav>';
}

function smallHero(eyebrow, heading, intro, place = '', contact = true) {
  return '<section class="hero"><div class="wrap hero-small"><p class="kicker">'
    + esc(eyebrow) + '</p><h1>' + esc(heading) + '</h1><p>' + esc(intro) + '</p>'
    + (contact ? buttons(place) : '') + '</div></section>';
}

function image([name, alt, width, height], eager = false) {
  return '<img src="/assets/trabajos/' + name + '.webp" alt="' + esc(alt) + '" width="' + width
    + '" height="' + height + '"' + (eager ? ' fetchpriority="high"' : ' loading="lazy" decoding="async"') + '>';
}

const tdtTuningFigure = '<figure class="service-photo tdt-tuning-photo">'
  + '<img src="/assets/televisor-sintonizando-tdt.webp" alt="Televisor en la búsqueda automática de canales TDT con la barra de progreso visible" width="1050" height="788" loading="lazy" decoding="async">'
  + '<figcaption>Ejemplo de una búsqueda automática de canales TDT.</figcaption></figure>';

function photoGrid(selection, className = 'photo-grid') {
  return '<div class="' + className + '">' + selection.map((photo) =>
    '<figure><a href="/assets/trabajos/' + photo[0] + '.webp">' + image(photo)
    + '</a><figcaption>' + esc(photo[1]) + '</figcaption></figure>').join('') + '</div>';
}

const porteroVisits = {"20036": [["hondarribia-placa-alcad", "Placa Alcad existente en una comunidad de Hondarribia, fotografiada para preparar el cambio a videoportero", 750, 1000], ["hondarribia-medicion-placa", "Medición del conjunto de placa y marco en Hondarribia para valorar el montaje del nuevo videoportero", 450, 1000], ["hondarribia-portero-exterior", "Portero comunitario exterior en Hondarribia antes de valorar su sustitución por videoportero", 750, 1000], ["hondarribia-placa-comunitaria", "Placa de audio de dos columnas en Hondarribia documentada durante la visita técnica", 450, 1000]], "20040": [["hernani-medicion-tegui", "Medición vertical de una placa Tegui antigua en Hernani para preparar el cambio a videoportero", 450, 1000], ["hernani-medicion-tres-escaleras", "Medición del conjunto Tegui de tres escaleras en Hernani antes de presupuestar la renovación", 750, 1000]]};
const llodioPhoto = ["llodio-fermax-grupo-fonico", "Placa comunitaria Fermax en Llodio / Laudio, documentada en una reparación urgente del grupo fónico", 1200, 903];
const llodioCaseUrl = "/alava/llodio/#visita-portero-01036";
const torrelavegaPhoto = ['torrelavega-golmar-estadio', 'Placa exterior Golmar Estadio de un portero automático en Torrelavega', 780, 1040];
const torrelavegaCaseUrl = '/cantabria/torrelavega/#visita-portero-39087';
function porteroVisit(code, name) {
 if (code === '39087') return '<section class="section surface" id="visita-portero-39087"><div class="wrap split">'
  + '<div><p class="kicker">Trabajo real en Torrelavega</p><h2>Reparación del grupo fónico de un portero Golmar Estadio</h2>'
  + '<p class="intro">Reparamos el grupo fónico de la placa exterior Golmar Estadio de un portero automático comunitario en Torrelavega. El grupo fónico permite hablar y escuchar entre la entrada y los telefonillos.</p>'
  + '<div class="actions">' + link('/servicios/porteros-videoporteros/', 'Ver el servicio de reparación de porteros', 'text-link')
  + link(wa(name, 'necesito reparar un portero automático'), 'Consultar por WhatsApp', 'btn dark') + '</div></div>'
  + '<figure class="service-photo service-photo--satelite">' + image(torrelavegaPhoto)
  + '<figcaption>Placa exterior Golmar Estadio del portal donde se reparó el grupo fónico.</figcaption></figure></div></section>';
 if (code === '01036') return '<section class="section surface" id="visita-portero-01036"><div class="wrap"><p class="kicker">Portero automático · Reparación urgente · Caso real</p><h2>Reparación del grupo fónico Fermax PVT9696 en Llodio / Laudio</h2><div class="split local-extra"><div><p class="intro">Intervención real de urgencia en el grupo fónico Fermax PVT9696 de un portero comunitario en Llodio / Laudio.</p><p>La fotografía muestra la placa exterior Fermax con tres columnas de pulsadores por vivienda. El trabajo corresponde a la reparación del sistema de audio existente.</p><p>'+link('/servicios/porteros-videoporteros/','Consultar reparación de porteros automáticos','text-link')+'</p></div><figure class="service-photo service-photo--satelite"><a href="/assets/trabajos/llodio-fermax-grupo-fonico.webp">'+image(llodioPhoto)+'</a><figcaption>'+esc(llodioPhoto[1])+'</figcaption></figure></div></div></section>';
 if (!porteroVisits[code]) return '';
 return '<section class="section surface" id="visita-portero-'+code+'"><div class="wrap"><p class="kicker">Porteros y videoporteros · Trabajo real</p><h2>Reparación de porteros y medición para un posible cambio a videoportero en '+esc(name)+'</h2>'
 +'<p class="intro">Trabajos reales realizados por David C. G. en '+esc(name)+': cambio de grupos fónicos que todavía disponen de recambio y medición de las placas existentes para valorar una posible sustitución por videoportero. Las fotografías documentan los equipos y las medidas tomadas durante estas intervenciones.</p>'
 +photoGrid(porteroVisits[code], 'photo-grid photo-grid--mediciones')
 +'<p>'+link('/servicios/porteros-videoporteros/','Reparación de porteros y renovación a videoportero','btn dark')+'</p>'
 +'<div class="prose"><h3>Por qué medimos antes de presupuestar</h3><p>El tamaño de la placa y del marco condiciona el montaje. Medir el conjunto permite estudiar si la nueva placa cubre el espacio existente o si necesita una adaptación. En una comunidad también hay que tener en cuenta la distribución de los pulsadores y las distintas escaleras.</p>'
 +'<h3>Qué debe concretar la valoración</h3><p>Además del montaje exterior, al preparar el presupuesto se determina qué monitores se necesitan y se comprueba la compatibilidad del sistema con el cableado del edificio. La posibilidad de aprovechar los cables se valora en la instalación, antes de darla por hecha.</p><p>La reparación de audio ya realizada y la posible renovación a videoportero son actuaciones distintas. Disponer de recambio para el grupo fónico permite reparar el portero actual; las medidas sirven para preparar una alternativa de renovación si la comunidad decide cambiarlo.</p></div></div></section>';
}
function provinceCaseCards(code) {
 const cases = [
  ['39','Torrelavega · Porteros','Reparación del grupo fónico Golmar Estadio',null,torrelavegaCaseUrl],
  ['01','Llodio / Laudio · Porteros','Reparación urgente del grupo fónico Fermax PVT9696',llodioPhoto,llodioCaseUrl],
  ['48','Bilbao centro · Antenas','Canales que desaparecían a ciertas horas',bilbaoCasePhoto,bilbaoCaseUrl],
  ['48','Bilbao · Antenas comunitarias','Arbolantxa, 5 y Cortes, 6',bilbaoPhotos[1],bilbaoCommunityUrl],
  ['48','Santurtzi · Antenas','Antena TDT en mástil exterior',null,santurtziCaseUrl],
  ['48','Durango · Antenas','Reparación de una antena caída',durangoPhoto,durangoCaseUrl],
  ['48','Bermeo · Antenas','Aldatseta Kalea: cable, vientos y amplificador',bermeoPhoto,bermeoCaseUrl],
  ['48','Gernika-Lumo · Antenas','Fotografías del montaje exterior',gernikaSecondPhoto,gernikaCaseUrl],
  ['20','Deba · Antenas','Medición con Promax y equipos de distribución',photosByName.get('deba-medicion-promax'),'/gipuzkoa/deba/#trabajos-locales'],
  ['20','Hondarribia · Porteros','Grupos fónicos y medición para valorar el cambio a videoportero',porteroVisits['20036'][1],'/gipuzkoa/hondarribia/#visita-portero-20036'],
  ['20','Hernani · Porteros','Reparaciones de audio y toma de medidas',porteroVisits['20040'][0],'/gipuzkoa/hernani/#visita-portero-20040']
 ].filter(item=>item[0]===code);
 return cases.length ? '<div class="cards case-previews">'+cases.map(([,place,title,photo,url])=>'<article class="card">'+(photo ? image(photo) : '')+'<p class="kicker">'+esc(place)+'</p><h3>'+esc(title)+'</h3><p>'+link(url,'Ver fotos y descripción del trabajo','text-link')+'</p></article>').join('')+'</div>' : '';
}
const hondarribiaAdvice = '<section class="section wrap prose"><h2>Cómo orientamos una avería de televisión en Hondarribia</h2>'
 +'<p>El primer dato es saber si falla un televisor, todas las tomas de una vivienda o varios vecinos. Si el mismo aparato funciona en otra toma, revisamos el recorrido de señal hacia la habitación afectada. Cuando coinciden varias viviendas, se compara la cabecera comunitaria con la distribución del edificio.</p>'
 +'<h3>Si los cortes aparecen con viento o lluvia</h3><p>Indica cuándo empezó el fallo y si afecta siempre a los mismos canales. En la revisión exterior se comprueban las fijaciones, el estado visible del coaxial y las conexiones. Después se compara la señal con la que llega al interior: el síntoma por sí solo no permite decidir que haya que cambiar la antena.</p>'
 +'<h3>Medición con Promax y valoración del equipo afectado</h3><p>Con el medidor de campo profesional Promax comprobamos nivel y calidad de señal en los puntos que necesita el diagnóstico. Comparar la entrada y la salida de los equipos ayuda a localizar dónde se pierde la recepción. Una medición en la toma permite valorar el resultado en el punto de uso.</p>'
 +'<p>Según lo observado, la propuesta puede incluir reparar una conexión, renovar un tramo de cable, ajustar la antena o sustituir el amplificador, su alimentación o la propia antena. Te explicamos qué intervención conviene según el estado real de la instalación.</p>'
 +'<h3>Qué enviar al solicitar una visita urgente</h3><p>Indica la dirección en Hondarribia, qué canales o tomas fallan y si otros vecinos tienen el mismo problema. Una foto del equipo accesible ayuda a orientar la consulta. Si es comunitaria, conviene coordinar el acceso a la cabecera con la persona responsable del edificio.</p></section>';

const diagnosticoEnVisita = '<p>Revisamos el estado de la antena, el cable coaxial, los conectores y los equipos de amplificación o reparto. Con un medidor de campo profesional Promax comprobamos el nivel y la calidad de la señal en los puntos necesarios, como la salida de la antena, la cabecera o la toma de TV.</p>'
  + '<p>Con esas medidas te explicamos dónde está el fallo y qué conviene hacer. A veces basta con reparar una conexión o cambiar un tramo de cable. Si el problema está en la antena, la fuente de alimentación o el amplificador, valoramos la sustitución del equipo afectado.</p>';

function workTowns(selection = featured) {
  return '<ul class="work-towns">' + selection.map((place) =>
    '<li>' + link(place.url, place.name) + '</li>').join('') + '</ul>';
}

function search() {
  return `<section class="search-panel" aria-labelledby="buscar-municipio"><div class="wrap search-grid">
  <div><p class="kicker">Cobertura por municipio</p><h2 id="buscar-municipio">Encuentra tu pueblo</h2>
  <p>Busca por nombre o consulta el <a href="#zonas">listado de provincias</a>.</p></div>
  <div><form role="search" data-search aria-labelledby="buscar-municipio"><div class="search-controls">
  <label>Municipio<input type="search" placeholder="Ej. Zalla o Lerma" autocomplete="off" aria-controls="resultados-municipios"></label>
  <label>Provincia<select><option value="">Todas las provincias</option>${areaNames.map((name) => '<option>' + esc(name) + '</option>').join('')}</select></label>
  </div></form><p id="estado-busqueda" aria-live="polite"></p><ul id="resultados-municipios" class="search-results"></ul>
  <noscript>Consulta los municipios en el listado por provincia.</noscript></div></div></section>`;
}

const mobileAntennaPath = '/servicios/antenas-4g-5g/';
const mobileAntennaName = 'Antenas 4G y 5G para cobertura móvil';

function serviceCards() {
  const cards = Object.entries(servicios).map(([key, [name, intro]]) => ['/servicios/' + key + '/', name, intro]);
  cards.push(
    ['/servicios/porteros-videoporteros/', 'Porteros automáticos y videoporteros', 'Reparación de audio, cambio de grupos fónicos y valoración del paso de portero convencional a videoportero.'],
    ['/ayuda-antenas/#servicio-resintonizacion', 'Resintonización de TDT y UHD', 'Buscamos y ordenamos los canales y comprobamos la compatibilidad del televisor con UHD.'],
    [mobileAntennaPath, mobileAntennaName, 'Medimos la señal de tu operador e instalamos antenas exteriores para routers compatibles. Valoramos opciones para las llamadas dentro del edificio.']
  );
  return '<div class="cards service-cards">' + cards.map(([url, name, intro]) =>
    '<article class="card"><h3>' + link(url, name) + '</h3><p>' + esc(intro) + '</p></article>').join('') + '</div>';
}

function diagnosticCards() {
  return '<div class="cards diagnostic-cards">' + Object.entries(diagnosticos).map(([key, [name]]) =>
    '<article class="card"><h3>' + link('/ayuda-antenas/#' + key, name) + '</h3><p>'
    + link('/ayuda-antenas/#' + key, 'Ver qué comprobar →', 'text-link') + '</p></article>').join('') + '</div>';
}

function directory(showAll = false) {
  return '<div class="zones">' + [...areaMap.values()].map((area) => {
    const featuredPlaces = area.centers.slice(0, showAll ? 12 : 6);
    const highlights = featuredPlaces.map((place) =>
      '<li>' + link(place.url, 'Antenista en ' + place.name) + '</li>').join('');
    const remaining = []; // El listado completo permanece en cada provincia y en el buscador.
    const fullList = remaining.length ? '<details class="zone-all"><summary>Ver todos los municipios (' + area.places.length
      + ')</summary><ul>' + remaining.map((place) =>
        '<li>' + link(place.url, place.center ? place.name : 'Antenista en ' + place.name) + '</li>').join('')
      + '</ul></details>' : '';
    return '<article class="zone"><h3>' + link(area.url, area.name) + '</h3><ul>' + highlights + '</ul>'
      + fullList + link(area.url, 'Página de ' + area.name + ' →', 'text-link') + '</article>';
  }).join('') + '</div>';
}

const pages = new Map();

function add(path, title, description, content, options = {}) {
  if (pages.has(path)) throw new Error('URL duplicada: ' + path);
  const { trail = [], area, type, indexed = true, searchEnabled = false } = options;
  const seoDescription = indexed ? 'Tel. ' + phone + '. ' + description : description;
  const url = base + path;
  const data = [organization];
  if (trail.length) data.push({
    '@type': 'BreadcrumbList',
    itemListElement: trail.map(([name, item], index) =>
      ({ '@type': 'ListItem', position: index + 1, name, item: base + item })),
  });
  if (type) data.push({
    '@type': 'Service', '@id': url + '#servicio', name: type, description, url,
    provider: { '@id': organization['@id'] }, areaServed: area ?? areaNames,
  });
  if (path === '/') data.push({ '@type': 'WebSite', '@id': base + '/#web', name: brand, url, inLanguage: 'es' });

  const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(seoDescription)}">
${indexed ? '<link rel="canonical" href="' + esc(url) + '">' : '<meta name="robots" content="noindex,follow">'}
<meta property="og:type" content="website"><meta property="og:site_name" content="${brand}">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(seoDescription)}">
<meta property="og:url" content="${esc(url)}"><meta property="og:image" content="${base}/assets/trabajos/tdt-en-tejado.webp">
<meta property="og:image:alt" content="${esc(galleryPhoto[1])}">
<link rel="icon" type="image/svg+xml" href="/assets/logo.svg"><link rel="stylesheet" href="/assets/site.css">
${searchEnabled ? '<script src="/assets/buscar.js" defer></script>' : ''}
<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@graph':data}).replaceAll('<', '\\u003c')}</script>
</head><body><a class="skip" href="#contenido">Saltar al contenido</a>
<header class="site-header"><div class="urgent-bar"><div class="wrap"><span class="urgent-status"><span aria-hidden="true"></span>Urgencias 24 horas</span></div></div><div class="wrap header-row">${logo()}<nav class="site-nav" aria-label="Principal">
<a href="/servicios/">Servicios</a><a href="/#zonas">Zonas</a><a href="/trabajos/">Trabajos reales</a>
</nav></div></header>
<main id="contenido">${trail.length ? crumbs(trail) : ''}${content}</main>
${footer}
<nav class="mobile-actions" aria-label="Contacto rápido">${link(tel, 'Llamar', 'btn')}${link(wa(options.contactPlace), 'WhatsApp', 'btn whatsapp')}</nav>
</body></html>`;
  pages.set(path, { html, indexed });
}

const homeTrail = ['Inicio', '/'];

add('/', 'Antenista urgente | Instalación y reparación de antenas TDT y SAT',
  'Antenista Fuentes. Instalación y reparación de antenas TDT, parabólicas y antenas de comunidades. Busca tu municipio en siete provincias.',
  `<section class="hero"><div class="wrap hero-grid"><div><p class="kicker dot">Instalación y reparación de antenas</p>
  <h1>Antenista urgente.<br><em>TDT y satélite.</em></h1>
  <p>Instalamos antenas y reparamos fallos de señal en viviendas y comunidades. Cuéntanos en qué pueblo estás y qué falla en tu televisión.</p>
  ${buttons()}</div><figure class="hero-photo">${image(galleryPhoto, true)}<figcaption><span>01 / TRABAJOS REALES</span> Antena TDT sobre cubierta de teja</figcaption></figure>
  </div></section>${search()}
  <section class="section wrap"><p class="kicker">Viviendas y comunidades</p><h2>Antenas, porteros automáticos y videoporteros</h2>
  <p class="intro">Si solo falla una habitación, empezamos por su toma. Si varios vecinos pierden los mismos canales, revisamos qué parte de la instalación comparten.</p>${serviceCards()}</section>
  <section class="section surface" id="trabajos-destacados"><div class="wrap"><p class="kicker">Fotografías de obra</p><h2>Trabajos reales de Antenista Fuentes</h2>
  <div class="cards case-previews">
    <article class="card">${image(bilbaoCasePhoto)}<p class="kicker">Bilbao centro · Reparación</p>
      <h3>Canales que desaparecían a ciertas horas</h3>
      <p>La instalación había perdido blindaje. Los cortes se resolvieron al sustituir la antena TDT, el previo y su fuente de alimentación.</p>
      ${link(bilbaoCaseUrl, 'Ver el caso de Bilbao', 'text-link')}</article>
    <article class="card">${image(photosByName.get('deba-medicion-promax'))}<p class="kicker">Deba · Medición de señal</p>
      <h3>TDT, parabólica y distribución en viviendas</h3>
      <p>Las fotos muestran el espectro de la señal TDT medido con Promax, una central Rover Polar con repartidores y las antenas de una de las viviendas.</p>
      ${link('/gipuzkoa/deba/#trabajos-locales', 'Ver los trabajos de Deba', 'text-link')}</article>
    <article class="card">${image(bilbaoPhotos[1])}<p class="kicker">Bilbao · Antenas comunitarias</p>
      <h3>Instalaciones en Arbolantxa y Cortes</h3>
      <p>Trabajos reales en comunidades de Calle Arbolantxa, 5 y Calle Cortes, 6. Las fotografías del caso muestran cabeceras y equipos de distribución de televisión.</p>
      ${link(bilbaoCommunityUrl, 'Ver las instalaciones comunitarias de Bilbao', 'text-link')}</article>
    <article class="card">${image(durangoPhoto)}<p class="kicker">Durango · Antenas</p>
      <h3>Reparación de una antena caída</h3><p>Trabajo real en Durango. La fotografía muestra la antena caída sobre la cubierta antes de la reparación.</p>
      ${link(durangoCaseUrl, 'Ver el trabajo en Durango', 'text-link')}</article>
    <article class="card">${image(bermeoPhoto)}<p class="kicker">Bermeo · Antena TDT</p>
      <h3>Antena TDT en Aldatseta Kalea</h3><p>Cambio de cable, vientos de sujeción y amplificador. Trabajo real en Bermeo, con desplazamiento urgente desde Bilbao. Intervención en la instalación de televisión terrestre y sus elementos de sujeción.</p>
      ${link(bermeoCaseUrl, 'Ver el trabajo real de antena en Bermeo', 'text-link')}</article>
    <article class="card">${image(llodioPhoto)}<p class="kicker">Llodio / Laudio · Porteros</p><h3>Reparación urgente de grupo fónico Fermax</h3><p>Trabajo real de reparación del grupo fónico Fermax PVT9696 en un portero comunitario.</p>${link(llodioCaseUrl,'Ver el caso real en Llodio / Laudio','text-link')}</article>
    <article class="card">${image(porteroVisits['20036'][1])}<p class="kicker">Hondarribia · Porteros comunitarios</p>
      <h3>Reparación de audio y medición para renovar</h3><p>David C. G. realizó cambios de grupos fónicos con recambio vigente y tomó medidas de las placas para valorar un posible cambio a videoportero.</p>
      ${link('/gipuzkoa/hondarribia/#visita-portero-20036', 'Ver el trabajo real de Hondarribia', 'text-link')}</article>
    <article class="card">${image(porteroVisits['20040'][0])}<p class="kicker">Hernani · Porteros comunitarios</p>
      <h3>Grupos fónicos y medidas de la placa existente</h3><p>Trabajos reales de David C. G.: reparación mediante cambio de grupos fónicos y medición para preparar una alternativa de renovación a videoportero.</p>
      ${link('/gipuzkoa/hernani/#visita-portero-20040', 'Ver el trabajo real de Hernani', 'text-link')}</article>
  </div>
  ${workTowns()}
  <div class="actions">${link('/trabajos/', 'Ver todos los trabajos', 'btn dark')}</div></div></section>
  <section class="section wrap" id="zonas"><p class="kicker">Siete provincias</p><h2>Antenas en tu municipio</h2>
  <h3>Bilbao y alrededores</h3>
  <p class="intro">Nuestro equipo sale de Bilbao y se desplaza a todos los municipios que figuran en esta zona de cobertura, tanto para visitas programadas como para averías urgentes. Busca tu pueblo o abre el listado de tu provincia. Al contactar, te confirmamos cuándo podemos llegar.</p>${workTowns(['48020', '48013', '48082', '48078', '48084', '48044', '48054', '48015'].map(code => towns.get(code)))}
  ${directory(true)}</section>
  <section class="section surface"><div class="wrap"><p class="kicker">Antes de llamar</p><h2>¿Qué le pasa a tu televisión?</h2><p class="intro">Comprueba si el fallo está en una toma o si afecta a todo el edificio. Estas son las pruebas que puedes hacer desde casa.</p><p>${link('/ayuda-antenas/#resintonizar', 'Cómo resintonizar la TDT y comprobar los canales UHD', 'text-link')}</p>${diagnosticCards()}</div></section>
  ${callout()}`, { searchEnabled: true, type: 'Instalación y reparación de antenas' });

for (const [code, area] of areaMap) {
  const heading = 'Antenista en ' + area.name;
  const centerLinks = area.centers.map((place) => '<li>' + link(place.url, 'Antenista en ' + place.name) + '</li>').join('');
  const covered = area.centers.filter((place) => place.nearby.length).map((center) =>
    '<section><h3>' + link(center.url + '#pueblos-cercanos', 'Entorno de ' + center.name) + '</h3><ul class="places">'
    + center.nearby.map((place) => '<li>' + link(place.url, 'Antenista en ' + place.name) + '</li>').join('') + '</ul></section>').join('');
  const localWorks = featured.filter((place) => place.province === area);
  const [serviceHeading, serviceText, serviceKey, photoKey] = servicioProvincial[code];
  const servicePhoto = photosByName.get(photoKey === 'antena-en-cubierta' ? 'mastil-varias-antenas' : photoKey);
  add(area.url, heading + ' | Antenas TDT y parabólicas',
    'Instalación y reparación de antenas en ' + area.name + '. Consulta la cobertura de Antenista Fuentes por municipio y solicita una visita.',
    smallHero('Cobertura provincial', 'Cobertura de antenas en ' + area.name, area.intro, area.name)
    + '<section class="section wrap split"><div><p class="kicker">Instalación y reparación de antenas</p><h2>' + esc(serviceHeading)
    + '</h2><p class="intro">' + esc(serviceText) + '</p><div class="actions">'
    + link('/servicios/' + serviceKey + '/', servicios[serviceKey][0], 'text-link')
    + link('#municipios', 'Consultar mi municipio', 'text-link') + '</div></div>'
    + '<figure class="service-photo">' + image(servicePhoto) + '<figcaption>' + esc(servicePhoto[1]) + '</figcaption></figure></section>'
    + '<section class="section wrap" id="municipios"><h2>Servicio de antenista por municipio</h2><ul class="places">' + centerLinks + '</ul></section>'
    + (localWorks.length ? '<section class="surface"><div class="wrap section"><h2>Trabajos en ' + esc(area.name)
      + '</h2>' + provinceCaseCards(code) + '<h3 class="province-work-towns">Municipios donde hemos trabajado</h3>'+workTowns(localWorks) + link('/trabajos/', 'Ver galería de trabajos', 'text-link') + '</div></section>' : '')
    + '<section class="section wrap region-directory"><h2>Todos los municipios de ' + esc(area.name)
    + '</h2><p class="intro">Además de las poblaciones anteriores, puedes consultar estos municipios, organizados por la zona más cercana.</p>'
    + covered + '</section>'
    + (area.code === '20' || area.name === 'Gipuzkoa' ? '<section class="section wrap"><h2>Reparaciones y mediciones reales de porteros</h2><p>David C. G. realizó cambios de grupos fónicos con recambio vigente y tomó medidas para valorar un posible cambio a videoportero.</p><ul><li>'+link('/gipuzkoa/hondarribia/#visita-portero-20036','Mediciones en Hondarribia')+'</li><li>'+link('/gipuzkoa/hernani/#visita-portero-20040','Mediciones en Hernani')+'</li></ul></section>' : '')
    + callout(area.name),
    { trail: [homeTrail, [area.name, area.url]], area: area.name, type: heading, contactPlace: area.name });

  for (const place of area.centers) {
    const [topic, advice, service] = fichas[place.code];
    const [serviceName, serviceIntro] = servicios[service];
    const choices = servicePhotos[service];
    const isSanturtzi = place.code === '48082';
    const servicePhoto = place.code === '48046' ? gernikaPhoto
      : photosByName.get(choices[Number(place.code) % choices.length]);
    const extra = ampliaciones[place.code];
    const guideKey = service === 'comunidades' ? 'colectiva' : service === 'reparacion' ? 'pixelacion' : 'sin-senal';
    const guide = link('/ayuda-antenas/#' + guideKey, diagnosticos[guideKey][0], 'text-link');
    const heading = 'Antenista en ' + place.name;
    const localService = service === 'satelite' ? 'TDT y parabólicas'
      : service === 'comunidades' ? 'TDT y antenas colectivas' : 'Instalación y reparación TDT';
    const otherServices = Object.entries(servicios).filter(([key]) => key !== service).map(([key, [name]]) =>
      '<li>' + link('/servicios/' + key + '/', name) + '</li>').join('');
    const near = place.nearby.map((item) => '<li id="pueblo-' + item.code + '"><strong>Antenista en ' + esc(item.name)
      + '</strong>' + (item.capital ? '<small class="nucleus"> · ' + esc(item.capital) + '</small>' : '')
      + ' <small>' + link(wa(item.name), 'Consultar visita') + '</small></li>').join('');
    const nearbyCenters = area.centers.filter((center) => center !== place)
      .sort((a, b) => distance(place, a) - distance(place, b)).slice(0, 3);
    const diagnosisService = place.code === '48027' ? 'reparacion' : service;
    const signalCheck = '<div class="local-signal-check"><h3>Cómo comprobamos la señal y valoramos la reparación</h3>'
      + '<p>' + esc(guiasServicio[diagnosisService].local) + '</p></div>';
    const durangoCase = '<section class="surface durango-case" id="trabajos-locales"><div class="wrap section split">'
      + '<div><p class="kicker">Trabajo real en Durango</p><h2>Reparación de una antena caída</h2>'
      + '<p class="intro">Reparamos una antena que había caído sobre la cubierta. La foto muestra la antena y el mástil antes de la intervención.</p>'
      + signalCheck
      + '<div class="actions">' + link('/servicios/reparacion/', 'Ver el servicio de reparación', 'btn dark') + '</div></div>'
      + '<figure class="service-photo durango-photo"><a href="/assets/trabajos/durango-antena-caida-reparada.webp">'
      + image(durangoPhoto) + '</a><figcaption>' + esc(durangoPhoto[1]) + '</figcaption></figure></div></section>';
    add(place.url, heading + ' | ' + localService,
      heading + '. ' + topic.replace(/[?¿]/g, '') + '. Visitas para viviendas y comunidades.',
      smallHero(area.name + ' · Servicio de antenista', heading,
        'Instalación y reparación de antenas en ' + place.name + '. TDT, parabólicas y señal de televisión para viviendas y comunidades.', place.name)
      + (place.code === '48027' ? durangoCase
        : '<section class="section wrap split"><div><p class="kicker">Diagnóstico y reparación</p><h2>' + esc(topic)
      + '</h2><p class="intro">' + esc(advice) + '</p>' + signalCheck
      + '<aside class="note"><h3>' + esc(serviceName)
      + '</h3><p>' + esc(serviceIntro) + '</p><p>' + link('/servicios/' + service + '/', 'Ver cómo se realiza el servicio', 'text-link')
      + '</p><p>' + guide + '</p></aside></div>'
      + (isSanturtzi ? '<figure class="service-photo service-photo--reparacion" id="trabajos-locales">'
        + '<a href="/assets/trabajos/' + santurtziPhoto[0] + '.webp">' + image(santurtziPhoto) + '</a>'
        + '<figcaption>Trabajo real en Santurtzi. La fotografía muestra la antena TDT, su abrazadera y el cable que baja por el mástil.</figcaption></figure>'
        : '<figure class="service-photo service-photo--' + service + '">' + image(servicePhoto)
          + '<figcaption>' + esc(servicePhoto[1]) + '</figcaption></figure>') + '</section>')
      + '<section class="wrap section local-extra split tdt-tuning" id="resintonizar-tdt"><div class="prose"><h2>Resintonización de canales TDT en ' + esc(place.name) + '</h2>'
      + '<p class="intro">Si faltan canales tras los cambios de noviembre, prueba la búsqueda automática en el modo Antena del televisor o receptor. Si ves los canales HD y faltan los UHD, comprueba que tu equipo admite DVB-T2 y HEVC/H.265.</p>'
      + '<p>' + (service === 'comunidades'
        ? 'Si varios vecinos pierden los mismos canales después de la búsqueda, podemos comprobar la cabecera y medir en una toma afectada.'
        : 'Hacemos la resintonización y ordenamos los canales a domicilio. Si tras la búsqueda sigue faltando señal, podemos medir en la toma.') + '</p>'
      + (service === 'comunidades' ? '<p>También resintonizamos y ordenamos los canales del televisor o receptor a domicilio.</p>' : '')
      + '<div class="actions">' + link('/ayuda-antenas/#resintonizar', 'Cómo resintonizar y comprobar UHD', 'text-link')
      + link(wa(place.name, 'necesito resintonizar los canales TDT'), 'Pedir una resintonización', 'btn dark') + '</div></div>' + tdtTuningFigure + '</section>'
      + (place.code === '20036' ? hondarribiaAdvice : '')
      + porteroVisit(place.code, place.name)
      + (extra ? '<section class="wrap section local-extra"><h2>' + esc(extra[0]) + '</h2><p class="intro">' + esc(extra[1]) + '</p>'
        + (extra[2] ? '<p>' + link(...extra[2], 'text-link') + '</p>' : '') + '</section>' : '')
      + (place.code !== '48027' && !isSanturtzi && trabajos.includes(place.code) ? '<section class="surface" id="trabajos-locales"><div class="wrap section"><p class="kicker">Trabajos realizados</p><h2>'
        + (place.code === '48020' ? 'Equipos de antena comunitaria en Bilbao</h2><p class="intro">Estas fotos de Bilbao muestran dos cabeceras de televisión. La cabecera recibe la señal de la antena y la prepara para distribuirla a las viviendas. Al revisar una avería, el medidor de campo permite comparar la señal antes y después de la amplificación.</p>'
          + photoGrid(bilbaoPhotos, 'photo-grid photo-grid--equipos')
          + '<div class="split local-extra" id="caso-pixelacion-bilbao"><div><p class="kicker">Caso real en Bilbao centro</p><h3>Canales que dejaban de verse a ciertas horas</h3>'
          + '<p class="intro">En una instalación de Bilbao centro, algunos canales desaparecían a determinadas horas. La instalación había perdido blindaje. Sustituimos el previo de antena, su fuente de alimentación y la antena TDT. Con esos cambios se resolvieron los cortes.</p></div>'
          + '<figure class="service-photo"><a href="/assets/trabajos/bilbao-centro-antena-tdt.webp">' + image(bilbaoCasePhoto)
          + '</a><figcaption>' + esc(bilbaoCasePhoto[1]) + '</figcaption></figure></div>'
          + '<div class="local-extra" id="instalaciones-comunitarias"><h3>Instalaciones de antena comunitaria en Bilbao</h3>'
          + '<p class="intro">Hemos realizado trabajos en las instalaciones comunitarias de estos dos portales de Bilbao.</p>'
          + '<ul class="work-towns"><li>Calle Arbolantxa, 5</li><li>Calle Cortes, 6</li></ul>'
          + '<p class="intro">Cuando varios vecinos pierden los mismos canales, podemos comparar la señal en la cabecera común y en distintas tomas. Así se distingue un problema del equipo compartido de una pérdida en un ramal del edificio.</p></div>'
          : place.code === '48046' ? 'Trabajo real de antena TDT en Gernika-Lumo</h2>'
            + '<div class="split local-extra"><div><h3>Antena y montaje sobre cubierta</h3><p>La fotografía principal de esta página corresponde al trabajo real en Gernika-Lumo: antena de televisión terrestre instalada sobre un mástil en cubierta, con su cableado y elementos de sujeción.</p><p>Al revisar un montaje de este tipo se comprueban tanto la recepción de señal como el estado del mástil, el cable y las conexiones.</p></div><figure class="service-photo service-photo--satelite"><a href="/assets/trabajos/gernika-lumo-dos-antenas.webp">'+image(gernikaSecondPhoto)+'</a><figcaption>'+esc(gernikaSecondPhoto[1])+'</figcaption></figure></div>'
          : place.code === '48017' ? 'Trabajo real de antena TDT en Bermeo</h2>'
            + '<div class="split local-extra"><div><p class="kicker">Desplazamiento urgente desde Bilbao</p><h3>Cambio de cable, vientos de sujeción y amplificador</h3><p class="intro">En esta intervención real en Aldatseta Kalea, Bermeo, se trabajó sobre la instalación de antena de televisión terrestre, con cambio del cable, los vientos de sujeción del mástil y el amplificador.</p><p>La fotografía muestra la antena TDT sobre el mástil y los vientos de sujeción. El trabajo incluyó tanto elementos de la recepción y distribución de señal como de la sujeción de la instalación.</p></div><figure class="service-photo service-photo--satelite"><a href="/assets/trabajos/bermeo-antena-cable-vientos.webp">'+image(bermeoPhoto)+'</a><figcaption>'+esc(bermeoPhoto[1])+'</figcaption></figure></div>'
          : place.code === '20029' ? 'Trabajos de antena en varias viviendas de Deba</h2>'
            + '<p class="intro">Las fotos muestran antenas terrestres y parabólica, una central Rover Polar con sus repartidores y una medición de TDT con Promax. Medir el nivel y la calidad de la señal ayuda a decidir si conviene intervenir en la antena o revisar el equipo y el cable que llevan la televisión a las tomas.</p>'
            + photoGrid(debaPhotos)
          : 'Hemos trabajado en ' + esc(place.name) + '</h2><p class="intro">En la galería puedes ver fotografías de antenas y equipos de trabajos de Antenista Fuentes.</p>')
        + '<div class="actions">'
        + link('/trabajos/', 'Ver la galería', 'btn dark') + '</div></div></section>' : '')
      + '<section class="section surface" id="pueblos-cercanos"><div class="wrap"><p class="kicker">Zona de servicio</p><h2>'
      + (near ? 'Antenista en pueblos cercanos a ' : 'Cobertura desde ') + esc(place.name) + '</h2>'
      + (near ? '<p class="intro">Si estás en alguno de estos municipios, puedes enviar el aviso indicando dónde está la vivienda.</p><ul class="places nearby">' + near + '</ul>' : '')
      + '<h3>Otras páginas de la zona</h3><ul class="places">' + nearbyCenters.map((item) =>
        '<li>' + link(item.url, 'Antenista en ' + item.name) + '</li>').join('') + '</ul>'
      + link(area.url, 'Ver todos los municipios de ' + area.name, 'text-link') + '</div></section>'
      + '<section class="section wrap"><h2>Otros servicios de antenista</h2><ul class="places">' + otherServices + '</ul></section>'
      + callout(place.name),
      { trail: [homeTrail, [area.name, area.url], [place.name, place.url]], area: place.name, type: heading, contactPlace: place.name });
  }
}

const officialTdt = 'https://television.digital.gob.es/atencion-a-la-ciudadania/notas-prensa/tdt/nueva-tdt-uhd--que-cambia-el-5-de-noviembre-de-2026';
const tdtGuide = '<section class="section wrap tdt-guide"><div class="split tdt-tuning"><div class="prose guide"><h2 id="resintonizar">Cómo resintonizar la TDT</h2>'
  + '<p>El 5 de noviembre de 2026 se redistribuyeron varios canales estatales. Si has perdido Clan, DKiss, A3Series, BeMad o Boing, o quieres buscar La Séptima HD, haz una búsqueda nueva. En esta primera fase se mantienen las emisiones habituales en HD y se incorporan emisiones UHD en DVB-T2.</p>'
  + '<ol><li>Abre el menú del equipo al que está conectado el cable de antena. Si usas un receptor externo para ver la TDT, busca en ese receptor.</li>'
  + '<li>En Ajustes, abre Canales, Emisión o Sintonización. Elige Antena, Terrestre o TDT y selecciona la búsqueda automática de canales digitales.</li>'
  + '<li>Deja que termine, guarda la lista y revisa también los últimos puestos. Si faltan tus favoritos, vuelve a ordenarlos.</li></ol>'
  + '<p>' + link(officialTdt, 'Consulta los cambios y las fechas en el portal oficial de Televisión Digital', 'text-link') + '.</p>'
  + '</div>' + tdtTuningFigure + '</div>'
  + '<div class="split local-extra tdt-guide-details"><div class="prose guide"><h2 id="tdt-uhd">Qué necesitas para ver la TDT en UHD</h2>'
  + '<p>Busca DVB-T2 y HEVC/H.265 en la ficha de tu televisor o receptor. Para ver la imagen en 4K necesitas también una pantalla UHD. Si los canales HD funcionan pero faltan los UHD, comprueba primero el modelo exacto. Si el equipo es compatible, pregunta si otro vecino con un equipo compatible recibe esas emisiones.</p>'
  + '</div><div class="prose guide"><h2 id="servicio-resintonizacion">Servicio de resintonización de canales y comprobación UHD</h2>'
  + '<p>Podemos sintonizar y ordenar los canales de tu televisor o receptor TDT y comprobar si admite las emisiones UHD. Si siguen faltando canales, medimos la señal en la toma. Cuando el fallo afecta a varias viviendas, podemos revisar la cabecera comunitaria con acceso autorizado por la comunidad.</p>'
  + '<p>Al pedir visita, indica tu municipio, el modelo del televisor o receptor y los canales que faltan. Dinos también si ya has hecho la búsqueda y si el problema afecta a algún vecino.</p>'
  + '<div class="actions">' + link(wa('', 'necesito resintonizar los canales TDT'), 'Pedir ayuda por WhatsApp', 'btn dark') + '</div></div></div></section>';

add('/ayuda-antenas/', 'Resintonizar la TDT y comprobar canales UHD | Antenista Fuentes',
  'Cómo buscar los canales tras los cambios de noviembre de 2026, comprobar la compatibilidad UHD y pedir ayuda con la resintonización o la señal de antena.',
  smallHero('Ayuda con la televisión', 'Resintonización de la TDT y canales UHD', 'Busca los canales que han cambiado, comprueba qué admite tu televisor y averigua cuándo conviene revisar la antena.', '', false)
  + tdtGuide
  + '<div class="wrap guide tdt-diagnostics">' + Object.entries(diagnosticos).map(([key, [title, copy]]) =>
    '<section id="' + key + '"><h2>' + esc(title) + '</h2><p>' + esc(copy) + '</p>'
    + (key === 'pixelacion' ? '<ul>'
      + '<li><strong>Cableado y conectores.</strong> Un coaxial deteriorado, un conector flojo o un repartidor con pérdidas pueden reducir la señal en una o varias tomas.</li>'
      + '<li><strong>Emisiones móviles en 700 MHz.</strong> En algunas instalaciones, una señal 5G intensa puede saturar el amplificador. Una medición permite comprobar si un filtro es adecuado. Consulta la ' + link('https://television.digital.gob.es/2DD-5G/5g-banda-700', 'información oficial sobre TDT y 5G') + '.</li>'
      + '<li><strong>Rebotes o ecos.</strong> Una señal reflejada en edificios o en el terreno puede llegar con retraso y afectar a la calidad de recepción.</li>'
      + '<li><strong>Emisiones en el mismo canal.</strong> Con ciertas condiciones de propagación puede llegar una emisión de otro repetidor en la misma frecuencia y dificultar la recepción de algunos canales.</li>'
      + '</ul><p>' + link(bilbaoCaseUrl, 'Ver el caso real de canales intermitentes en Bilbao centro') + '</p>' : '')
    + '</section>').join('')
  + '</div>' + callout(),
  { trail: [homeTrail, ['Ayuda con la TDT', '/ayuda-antenas/']] });

add('/trabajos/', 'Trabajos reales de antenas y TDT | Antenista Fuentes',
  'Galería de trabajos reales de Antenista Fuentes. Antenas en cubierta, mástiles, cabeceras de televisión y equipos de distribución.',
  smallHero('Galería de obra', 'Trabajos reales de antenas', 'Fotografías de antenas de televisión, equipos de medida y distribución de señal.', '', false)
  + '<section class="section wrap"><h2>Municipios donde hemos trabajado</h2>'
  + '<p class="intro">Atendemos avisos a diario. Estos municipios son una muestra de los lugares donde hemos realizado trabajos. Una visita para localizar un fallo de señal también cuenta, igual que una reparación o una instalación.</p>'
  + workTowns() + '<div class="prose"><h3>Qué hacemos en una visita de antena</h3>' + diagnosticoEnVisita + '</div><h2>Fotografías de instalaciones y equipos</h2>'
  + '<p class="intro">Las fotos muestran una selección de intervenciones y equipos de Antenista Fuentes.</p>'
  + photoGrid(photos.filter(([name])=>!name.startsWith('gernika-lumo-') && !name.startsWith('bermeo-') && !name.startsWith('durango-'))) + '<h3>Fotografías identificadas por municipio</h3>'+photoGrid([durangoPhoto,gernikaPhoto,gernikaSecondPhoto,bermeoPhoto])+'<ul><li>' + link(bilbaoCaseUrl, 'Caso real en Bilbao centro: canales que se cortaban a ciertas horas', 'text-link')
  + '</li><li>' + link(bilbaoCommunityUrl, 'Instalaciones comunitarias en Arbolantxa y Cortes, Bilbao', 'text-link') + '</li><li>'+link(bermeoCaseUrl,'Bermeo: cambio de cable, vientos y amplificador con desplazamiento urgente desde Bilbao','text-link')+'</li><li>'+link(gernikaCaseUrl,'Gernika-Lumo: fotografía de un trabajo real de antena TDT','text-link')+'</li><li>'+link(durangoCaseUrl,'Durango: reparación de una antena caída','text-link')+'</li><li>'+link(santurtziCaseUrl,'Santurtzi: antena TDT en mástil exterior','text-link')+'</li><li>'+link(torrelavegaCaseUrl,'Torrelavega: reparación del grupo fónico Golmar Estadio','text-link')+'</li></ul></section>' + porteroVisit('20036','Hondarribia') + porteroVisit('20040','Hernani') + porteroVisit('01036','Llodio / Laudio') + callout(),
  { trail: [homeTrail, ['Trabajos reales', '/trabajos/']] });

const serviceTrail = ['Servicios', '/servicios/'];
add('/servicios/', 'Antenas TDT, 4G y 5G, porteros y videoporteros | Antenista Fuentes',
  'Instalación de antenas TDT, parabólicas y antenas para routers 4G y 5G. Resintonización de canales y reparación de porteros.',
  smallHero('Viviendas y comunidades', 'Servicios de antenas, porteros y videoporteros', 'Instalamos y reparamos antenas de televisión, montamos antenas para conexión móvil 4G y 5G y reparamos porteros automáticos.')
  + '<section class="section wrap"><h2>Servicios de instalación y reparación</h2>' + serviceCards() + '</section>' + callout(),
  { trail: [homeTrail, serviceTrail] });

const repeaterInfo = 'https://digital.gob.es/telecomunicaciones-infraestructuras-digitales/areas-interes/equipos-telecomunicacion/repetidores-senal-telefonia-movil';
add(mobileAntennaPath, 'Instalación de antenas 4G y 5G para cobertura móvil | Antenista Fuentes',
  'Medición de señal móvil e instalación de antenas exteriores para routers 4G y 5G. Valoración de cobertura para llamadas GSM y datos en interiores.',
  smallHero('Cobertura móvil', 'Instalación de antenas 4G y 5G', 'Medimos la señal móvil del operador y valoramos cómo mejorar la conexión en viviendas, locales y comunidades.', '', false)
  + '<section class="section wrap split"><div class="prose guide"><h2>Antena exterior para internet 4G o 5G</h2>'
  + '<p>Comparamos la señal exterior con la del interior. Si el router admite antena externa y hay señal aprovechable, instalamos y orientamos la antena y comprobamos la conexión desde el router.</p></div>'
  + '<div class="prose guide"><h2>Cobertura para llamadas GSM y móvil</h2>'
  + '<p>Si el móvil pierde llamadas dentro, dinos el operador y en qué habitaciones sucede. Comprobamos la señal y valoramos opciones como las llamadas por Wi-Fi, si el teléfono y el operador las admiten. Los repetidores activos requieren la intervención o autorización del operador.</p>'
  + '<p>' + link(repeaterInfo, 'Información oficial sobre repetidores de telefonía móvil', 'text-link') + '</p></div></section>'
  + '<section class="wrap section local-extra"><div class="prose"><h2>Pide una valoración de cobertura</h2><p>Indica el municipio, el operador, si fallan las llamadas o los datos y si tienes un router 4G o 5G. Si conoces el modelo del router, inclúyelo.</p>'
  + '<div class="actions">' + link(wa('', 'necesito revisar la cobertura móvil 4G o 5G'), 'Consultar cobertura por WhatsApp', 'btn dark') + '</div></div></section>',
  { trail: [homeTrail, serviceTrail, [mobileAntennaName, mobileAntennaPath]], type: mobileAntennaName });

const porteroPath = '/servicios/porteros-videoporteros/';
const porteroWhatsApp = 'https://wa.me/34641490536?text='+encodeURIComponent('Hola, necesito consultar una reparación de portero automático o un cambio a videoportero.');
add(porteroPath, 'Reparación de porteros y cambio a videoportero | Antenista Fuentes',
 'Reparación de porteros automáticos, grupos fónicos y renovación a videoportero. Trabajos reales de David C. G. en Hondarribia y Hernani.',
 '<section class="hero door-hero"><div class="wrap door-layout"><div><p class="kicker">Viviendas y comunidades</p><h1>Tu portero, reparado.<br><em>O listo para renovarlo.</em></h1><p>Reparación de audio y valoración del cambio a videoportero, partiendo del equipo que ya tiene tu comunidad.</p><div class="actions">'+link(tel,'Llamar: '+phone,'btn')+link(porteroWhatsApp,'Consultar por WhatsApp','btn whatsapp')+'</div><a class="door-jump" href="#trabajos-porteros">Ver trabajos reales de David C. G. ↓</a></div><figure class="door-photo">'+image(porteroVisits['20036'][0],true)+'<figcaption>Hondarribia · Placa existente durante la visita técnica</figcaption></figure></div></section>'
 +'<section class="section wrap door-section"><div class="door-heading"><p class="kicker">01 · Reparar</p><h2>¿No suena, no se oye<br>o no abre?</h2><p>Primero localizamos el fallo. No todas las averías requieren cambiar el portero completo.</p></div><div class="cards door-cards"><article class="card"><h3>Revisar el sistema actual</h3><p>Indica si afecta a una vivienda o a toda la comunidad. Según el síntoma, revisamos telefonillo, pulsadores, grupo fónico, alimentación, cableado o abrepuertas.</p></article><article class="card"><h3>Cambiar el grupo fónico</h3><p>Si hay recambio compatible, se puede valorar la sustitución del módulo de audio. Identificamos la marca y el modelo antes de elegir la referencia. David C. G. ha realizado estos trabajos en Hondarribia y Hernani.</p></article></div></section>'
 +'<section class="surface"><div class="section wrap door-layout door-renew"><figure class="door-photo">'+image(porteroVisits['20040'][0])+'<figcaption>Hernani · Medición de una placa Tegui para valorar la renovación</figcaption></figure><div><p class="kicker">02 · Renovar</p><h2>Del portero de audio<br>al videoportero</h2><p>Medimos la placa y el marco, contamos viviendas y escaleras e identificamos el sistema existente. Así podemos estudiar qué placa y monitores necesita la comunidad.</p><h3>El cableado también cuenta</h3><p>Un sistema de dos hilos puede ser una opción. Aprovechar los cables depende de su estado y de la compatibilidad con el equipo elegido; se comprueba antes de presupuestar.</p><h3>Una placa que encaje en tu portal</h3><p>La anchura y la altura del conjunto permiten valorar si hace falta adaptar el hueco o el marco. El presupuesto debe indicar equipos, remates y cableado que se conserva o sustituye.</p></div></div></section>'
 +'<section class="section wrap door-section" id="trabajos-porteros"><div class="door-heading"><p class="kicker">Fotografías propias · Trabajo real</p><h2>Reparaciones y mediciones<br>de David C. G.</h2><p>Cambio de grupos fónicos con recambio vigente y toma de medidas para un posible cambio a videoportero. La renovación con cámara es una actuación que se está valorando.</p></div>'+photoGrid([porteroVisits['20036'][1],porteroVisits['20036'][2],porteroVisits['20036'][3],porteroVisits['20040'][1]],'photo-grid photo-grid--mediciones')+'<div class="actions">'+link('/gipuzkoa/hondarribia/#visita-portero-20036','Ver la intervención en Hondarribia','text-link')+link('/gipuzkoa/hernani/#visita-portero-20040','Ver la intervención en Hernani','text-link')+link(llodioCaseUrl,'Reparación urgente Fermax en Llodio / Laudio','text-link')+link(torrelavegaCaseUrl,'Reparación Golmar Estadio en Torrelavega','text-link')+'</div></section>'
 +'<section class="surface"><div class="section wrap door-section"><div class="door-heading"><p class="kicker">Preparar la visita</p><h2>Cuéntanos qué necesita tu entrada</h2></div><ol class="door-steps"><li><strong>Municipio y edificio</strong><span>Indica dónde está la instalación y si es una casa o comunidad.</span></li><li><strong>Fotos del equipo</strong><span>Envía la placa exterior y el telefonillo o monitor interior.</span></li><li><strong>Fallo o renovación</strong><span>Explica qué ocurre y cuántas viviendas están afectadas.</span></li></ol><div class="door-contact"><div><h3>¿Necesitas atención urgente?</h3><p>Consulta la disponibilidad de desplazamiento para tu localidad.</p></div><div class="actions">'+link(tel,'Llamar','btn dark')+link(porteroWhatsApp,'WhatsApp','btn whatsapp')+'</div></div></div></section>',
 {trail:[homeTrail,serviceTrail,['Porteros y videoporteros',porteroPath]],type:'Reparación de porteros automáticos y renovación a videoportero'});

for (const [key, [name, intro, steps]] of Object.entries(servicios)) {
  const path = '/servicios/' + key + '/';
  const detail = guiasServicio[key];
  add(path, name + ' | ' + brand, intro, smallHero('Servicio de antenista', name, intro)
    + '<section class="section wrap split"><div><p class="kicker">Diagnóstico y valoración</p><h2>'+esc(detail.heading)+'</h2><p class="intro">'+esc(steps)+'</p></div><figure class="service-photo service-photo--satelite">'+image(photosByName.get(detail.photo))+'<figcaption>'+esc(photosByName.get(detail.photo)[1])+'</figcaption></figure></section>'
    + '<section class="section surface"><div class="wrap"><h2>Cómo planteamos el trabajo</h2><div class="cards diagnostic-cards">'+detail.blocks.map(([title,copy])=>'<article class="card"><h3>'+esc(title)+'</h3><p>'+esc(copy)+'</p></article>').join('')+'</div></div></section>'
    + '<section class="section wrap"><h2>Trabajos documentados relacionados</h2><ul class="places">'+detail.cases.map(([url,label])=>'<li>'+link(url,label)+'</li>').join('')+'</ul><p class="intro">Consulta las fotos y la descripción de cada intervención para conocer el alcance del trabajo mostrado.</p></section>'
    + '<section class="section wrap service-questions"><h2>Antes de pedir presupuesto</h2>'+detail.questions.map(([q,a])=>'<details><summary>'+esc(q)+'</summary><p>'+esc(a)+'</p></details>').join('')+'</section>'
    + '<section class="section surface"><div class="wrap"><h2>Consulta la cobertura de este servicio</h2>'
    + directory() + '</div></section>' + callout(),
    { trail: [homeTrail, serviceTrail, [name, path]], type: name });
}

add('/aviso-legal/', 'Aviso legal | Antenista Fuentes', 'Información y contacto de Antenista Fuentes.',
  '<article class="section wrap prose"><h1>Aviso legal</h1><h2>Titular del sitio</h2><p>' + owner + ', titular de Antenista Fuentes.</p>'
  + '<p>Domicilio a efectos de este aviso legal: ' + esc(legalAddress) + '.</p><p>Teléfono de contacto: '
  + link(tel, phone) + '.</p><h2>Información del servicio</h2><p>La web informa sobre instalación y reparación de antenas, porteros automáticos y videoporteros. La disponibilidad, el alcance de cada visita y el presupuesto se confirman al contactar.</p></article>',
  { trail: [homeTrail, ['Aviso legal', '/aviso-legal/']], indexed: false });

add('/privacidad/', 'Privacidad | Antenista Fuentes', 'Información sobre el uso de datos al contactar con Antenista Fuentes.',
  '<article class="section wrap prose"><h1>Privacidad</h1><h2>Responsable del tratamiento</h2><p>' + owner + '. Puedes consultar sus datos de contacto en el <a href="/aviso-legal/">aviso legal</a>.</p>'
  + '<h2>Datos de contacto</h2><p>Si nos llamas o escribes, usamos los datos que facilites para responder a tu consulta, preparar un presupuesto o gestionar el servicio solicitado. Se conservan durante el tiempo necesario para atender la solicitud y, si procede, para cumplir las obligaciones aplicables.</p>'
  + '<h2>WhatsApp y cookies</h2><p>Los enlaces de WhatsApp abren un servicio externo sujeto a su propia política de privacidad. La web no incorpora formularios, publicidad, cookies propias ni scripts de analítica.</p>'
  + '<h2>Derechos</h2><p>Puedes solicitar acceso, rectificación, supresión, oposición, limitación o portabilidad mediante los datos de contacto del responsable. También puedes acudir a la Agencia Española de Protección de Datos.</p></article>',
  { trail: [homeTrail, ['Privacidad', '/privacidad/']], indexed: false });

add('/404.html', 'Página no encontrada | Antenista Fuentes', 'Accede a la portada de Antenista Fuentes para encontrar servicios y municipios.',
  '<section class="section wrap"><h1>Página no encontrada</h1><p class="intro">Consulta el buscador de municipios o los servicios de antenista desde la portada.</p><div class="actions">'
  + link('/', 'Volver a la portada', 'btn dark') + '</div></section>', { indexed: false });

const dist = decodeURIComponent(output.pathname);
rmSync(dist, { force: true, recursive: true });
mkdirSync(dist, { recursive: true });
cpSync(new URL('../assets/', import.meta.url), join(dist, 'assets'), { recursive: true });
for (const [path, { html }] of pages) {
  const file = join(dist, path.endsWith('/') ? path + 'index.html' : path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

const searchRows = [...towns.values()].sort(byName).map((place) => [
  place.name, place.province.name, place.url, place.center?.name ?? '',
  normalize([place.name, place.official, place.capital, place.alias].join(' ')),
]);
writeFileSync(join(dist, 'assets/municipios.json'), JSON.stringify(searchRows));

const urls = [...pages].filter(([, page]) => page.indexed).map(([path]) => '  <url><loc>' + esc(base + path) + '</loc></url>');
writeFileSync(join(dist, 'sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?>\n'
  + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls.join('\n') + '\n</urlset>\n');
writeFileSync(join(dist, 'robots.txt'), 'User-agent: *\nAllow: /\nSitemap: ' + base + '/sitemap.xml\n');
console.log(`${urls.length} URLs indexables · ${Object.keys(fichas).length} páginas municipales · ${towns.size} municipios cubiertos`);
for (const area of areaMap.values()) console.log(`${area.name} · ${area.centers.length} páginas · ${area.places.length} municipios`);
