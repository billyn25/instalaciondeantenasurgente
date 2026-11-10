import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { ampliaciones, diagnosticos, fichas, provincias, servicios, trabajos } from './contenido.mjs';

const read = (path) => JSON.parse(readFileSync(new URL('../' + path, import.meta.url), 'utf8'));
const output = new URL('../dist/', import.meta.url);
const base = 'https://instalaciondeantenasurgente.com';
const brand = 'Antenista Fuentes';
const owner = 'David Corregidor Gonzalo';
const legalAddress = 'Calle La Fragua s/n, Madrid';
const phone = '+34 641 49 05 36';
const tel = 'tel:+34641490536';
const wa = (place) => 'https://wa.me/34641490536?text=' + encodeURIComponent(
  'Hola, necesito un antenista' + (place ? ' en ' + place : '') + '.'
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
const photos = read('data/fotos.json');
const photosByName = new Map(photos.map((photo) => [photo[0], photo]));
const galleryPhoto = photosByName.get('tdt-en-tejado');
const servicePhotos = {
  instalacion: ['antena-tdt-y-parabolica', 'tdt-en-tejado', 'antenas-cielo-azul'],
  reparacion: ['mastil-varias-antenas', 'antena-en-cubierta', 'amplificador-de-senal'],
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
const mapHeight = 340;
const mapPadding = 28;
const mapTowns = [...towns.values()];
const west = Math.min(...mapTowns.map(({ lon }) => lon));
const east = Math.max(...mapTowns.map(({ lon }) => lon));
const north = Math.max(...mapTowns.map(({ lat }) => lat));
const south = Math.min(...mapTowns.map(({ lat }) => lat));
const mapPosition = ({ lat, lon }) => [
  Math.round(mapPadding + (lon - west) / (east - west) * (mapWidth - 2 * mapPadding)),
  Math.round(mapPadding + (north - lat) / (north - south) * (mapHeight - 2 * mapPadding)),
];
const mapDots = mapTowns.map((town) => {
  const [x, y] = mapPosition(town);
  return `M${x} ${y}h.01`;
}).join('');
const coverageMap = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${mapWidth} ${mapHeight}"><path d="${mapDots}" fill="none" stroke="#849ec5" stroke-opacity=".52" stroke-width="2.6" stroke-linecap="round"/></svg>`;
const mapAreas = ['24089', '39075', '48020', '20069', '01059', '09059', '26089'].map((code, index) => {
  const town = towns.get(code);
  const [x, y] = mapPosition(town);
  return { ...town.province, number: index + 1, x: x / mapWidth * 100, y: y / mapHeight * 100 };
});
const footer = `<footer class="footer" id="mapa-cobertura"><div class="wrap">
<div class="footer-coverage">
  <div class="footer-intro"><p class="kicker dot">Zonas de servicio</p>
  <h2>¿Hasta dónde llegamos?</h2><p>Instalamos y reparamos antenas en siete provincias. Toca un punto del mapa para ver los municipios de esa zona.</p></div>
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
    + '</h2><p>Indica el municipio, si el fallo afecta a una toma o a varios vecinos y desde cuándo ocurre. Te confirmamos la disponibilidad para el desplazamiento.</p>'
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

function photoGrid(selection) {
  return '<div class="photo-grid">' + selection.map((photo) =>
    '<figure><a href="/assets/trabajos/' + photo[0] + '.webp">' + image(photo)
    + '</a><figcaption>' + esc(photo[1]) + '</figcaption></figure>').join('') + '</div>';
}

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

function serviceCards() {
  return '<div class="cards">' + Object.entries(servicios).map(([key, [name, intro]], index) =>
    '<article class="card"><span class="number">0' + (index + 1) + '</span><h3>'
    + link('/servicios/' + key + '/', name) + '</h3><p>' + esc(intro) + '</p></article>').join('') + '</div>';
}

function diagnosticCards() {
  return '<div class="cards diagnostic-cards">' + Object.entries(diagnosticos).map(([key, [name]]) =>
    '<article class="card"><h3>' + link('/ayuda-antenas/#' + key, name) + '</h3><p>'
    + link('/ayuda-antenas/#' + key, 'Ver qué comprobar →', 'text-link') + '</p></article>').join('') + '</div>';
}

function directory(showAll = false) {
  return '<div class="zones">' + [...areaMap.values()].map((area) => {
    const featuredPlaces = area.centers.slice(0, 6);
    const highlights = featuredPlaces.map((place) =>
      '<li>' + link(place.url, 'Antenista en ' + place.name) + '</li>').join('');
    const remaining = showAll ? area.places.filter((place) => !featuredPlaces.includes(place)).sort(byName) : [];
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
  <section class="section wrap"><p class="kicker">Servicios de antenista</p><h2>De la antena a la toma de TV</h2>
  <p class="intro">Si solo falla una habitación, empezamos por su toma. Si varios vecinos pierden los mismos canales, revisamos qué parte de la instalación comparten.</p>${serviceCards()}</section>
  <section class="section surface"><div class="wrap"><p class="kicker">Fotografías de obra</p><h2>Trabajos reales de Antenista Fuentes</h2>
  <p class="intro">Antenas en cubierta, cabeceras de televisión y equipos de distribución. Estos son algunos de los municipios donde hemos trabajado.</p>
  ${workTowns()}${photoGrid([photos[7], photos[1], photos[2], photos[6]])}
  <div class="actions">${link('/trabajos/', 'Ver los trabajos', 'btn dark')}</div></div></section>
  <section class="section wrap" id="zonas"><p class="kicker">Siete provincias</p><h2>Antenas en tu municipio</h2>
  <p class="intro">Abre el listado de tu provincia para ver todos sus municipios o usa el buscador de la portada. Indica la localidad al pedir cita para confirmar el desplazamiento.</p>${directory(true)}</section>
  <section class="section surface"><div class="wrap"><p class="kicker">Antes de llamar</p><h2>¿Qué le pasa a tu televisión?</h2><p class="intro">Comprueba si el fallo está en una toma o si afecta a todo el edificio. Estas son las pruebas que puedes hacer desde casa.</p>${diagnosticCards()}</div></section>
  ${callout()}`, { searchEnabled: true, type: 'Instalación y reparación de antenas' });

for (const area of areaMap.values()) {
  const heading = 'Antenista en ' + area.name;
  const centerLinks = area.centers.map((place) => '<li>' + link(place.url, 'Antenista en ' + place.name) + '</li>').join('');
  const covered = area.centers.filter((place) => place.nearby.length).map((center) =>
    '<section><h3>' + link(center.url + '#pueblos-cercanos', 'Entorno de ' + center.name) + '</h3><ul class="places">'
    + center.nearby.map((place) => '<li>' + link(place.url, 'Antenista en ' + place.name) + '</li>').join('') + '</ul></section>').join('');
  const localWorks = featured.filter((place) => place.province === area);
  add(area.url, heading + ' | Antenas TDT y parabólicas',
    'Instalación y reparación de antenas en ' + area.name + '. Consulta la cobertura de Antenista Fuentes por municipio y solicita una visita.',
    smallHero('Cobertura provincial', heading, area.intro, area.name)
    + '<section class="section wrap"><h2>Servicio de antenista por municipio</h2><ul class="places">' + centerLinks + '</ul></section>'
    + (localWorks.length ? '<section class="surface"><div class="wrap section"><h2>Trabajos en ' + esc(area.name)
      + '</h2>' + workTowns(localWorks) + link('/trabajos/', 'Ver galería de trabajos', 'text-link') + '</div></section>' : '')
    + '<section class="section wrap region-directory"><h2>Todos los municipios de ' + esc(area.name)
    + '</h2><p class="intro">Además de las poblaciones anteriores, puedes consultar estos municipios, organizados por la zona más cercana.</p>'
    + covered + '</section>' + callout(area.name),
    { trail: [homeTrail, [area.name, area.url]], area: area.name, type: heading, contactPlace: area.name });

  for (const place of area.centers) {
    const [topic, advice, service] = fichas[place.code];
    const [serviceName, serviceIntro] = servicios[service];
    const choices = servicePhotos[service];
    const servicePhoto = photosByName.get(choices[Number(place.code) % choices.length]);
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
    add(place.url, heading + ' | ' + localService,
      heading + '. ' + topic.replace(/[?¿]/g, '') + '. Visitas para viviendas y comunidades.',
      smallHero(area.name + ' · Servicio de antenista', heading,
        'Instalación y reparación de antenas en ' + place.name + '. TDT, parabólicas y señal de televisión para viviendas y comunidades.', place.name)
      + '<section class="section wrap split"><div><p class="kicker">Diagnóstico y reparación</p><h2>' + esc(topic)
      + '</h2><p class="intro">' + esc(advice) + '</p><aside class="note"><h3>' + esc(serviceName)
      + '</h3><p>' + esc(serviceIntro) + '</p><p>' + link('/servicios/' + service + '/', 'Ver cómo se realiza el servicio', 'text-link')
      + '</p><p>' + guide + '</p></aside></div><figure class="service-photo service-photo--' + service + '">'
      + image(servicePhoto) + '<figcaption>' + esc(servicePhoto[1]) + '</figcaption></figure></section>'
      + (extra ? '<section class="wrap section local-extra"><h2>' + esc(extra[0]) + '</h2><p class="intro">' + esc(extra[1]) + '</p></section>' : '')
      + (trabajos.includes(place.code) ? '<section class="surface"><div class="wrap section"><p class="kicker">Trabajos realizados</p><h2>Hemos trabajado en '
        + esc(place.name) + '</h2><p class="intro">En la galería puedes ver fotografías de antenas y equipos de trabajos de Antenista Fuentes.</p><div class="actions">'
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

add('/ayuda-antenas/', 'TV sin señal y TDT pixelada | Qué comprobar antes de llamar',
  'Qué revisar cuando la televisión se queda sin señal, la TDT se pixela o varios vecinos pierden canales de la antena comunitaria.',
  smallHero('Guía de diagnóstico', 'Qué comprobar si falla la TDT', 'Tres averías habituales y las comprobaciones que puedes hacer desde casa.', '', false)
  + '<section class="section wrap prose guide">' + Object.entries(diagnosticos).map(([key, [title, copy]]) =>
    '<section id="' + key + '"><h2>' + esc(title) + '</h2><p>' + esc(copy) + '</p></section>').join('')
  + '</section>' + callout(),
  { trail: [homeTrail, ['Ayuda con la TDT', '/ayuda-antenas/']] });

add('/trabajos/', 'Trabajos reales de antenas y TDT | Antenista Fuentes',
  'Galería de trabajos reales de Antenista Fuentes. Antenas en cubierta, mástiles, cabeceras de televisión y equipos de distribución.',
  smallHero('Galería de obra', 'Trabajos reales de antenas', 'Fotografías de antenas de televisión, equipos de medida y distribución de señal.', '', false)
  + '<section class="section wrap"><h2>Municipios donde hemos trabajado</h2>' + workTowns()
  + '<h2>Galería de trabajos</h2>' + photoGrid(photos) + '</section>' + callout(),
  { trail: [homeTrail, ['Trabajos reales', '/trabajos/']] });

const serviceTrail = ['Servicios', '/servicios/'];
add('/servicios/', 'Instalación y reparación de antenas | Antenista Fuentes',
  'Servicios de antenista para televisión terrestre y satélite, instalación de antenas, reparación de averías y mantenimiento de antenas colectivas.',
  smallHero('Viviendas y comunidades', 'Servicios de antenista', 'Instalación de antenas TDT y parabólicas, reparación de averías y revisión de la distribución de televisión.')
  + '<section class="section wrap"><h2>Qué podemos revisar</h2>' + serviceCards() + '</section>' + callout(),
  { trail: [homeTrail, serviceTrail] });

for (const [key, [name, intro, steps]] of Object.entries(servicios)) {
  const path = '/servicios/' + key + '/';
  add(path, name + ' | ' + brand, intro, smallHero('Servicio de antenista', name, intro)
    + '<section class="section wrap prose"><h2>Cómo preparar la visita</h2><p>' + esc(steps) + '</p></section>'
    + '<section class="section surface"><div class="wrap"><h2>Consulta la cobertura de este servicio</h2>'
    + directory() + '</div></section>' + callout(),
    { trail: [homeTrail, serviceTrail, [name, path]], type: name });
}

add('/aviso-legal/', 'Aviso legal | Antenista Fuentes', 'Información y contacto de Antenista Fuentes.',
  '<article class="section wrap prose"><h1>Aviso legal</h1><h2>Titular del sitio</h2><p>' + owner + ', titular de Antenista Fuentes.</p>'
  + '<p>Domicilio a efectos de este aviso legal: ' + esc(legalAddress) + '.</p><p>Teléfono de contacto: '
  + link(tel, phone) + '.</p><h2>Información del servicio</h2><p>La web informa sobre instalación y reparación de antenas. La disponibilidad, el alcance de cada visita y el presupuesto se confirman al contactar.</p></article>',
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
writeFileSync(join(dist, 'assets/mapa-cobertura.svg'), coverageMap);
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
