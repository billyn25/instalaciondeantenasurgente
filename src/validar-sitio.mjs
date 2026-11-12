import { existsSync } from 'node:fs';
import { resolve, sep } from 'node:path';

const decode = (text) => text.replace(/&(?:amp|quot|apos|lt|gt|#39);/g, (value) =>
  ({ '&amp;': '&', '&quot;': '"', '&apos;': "'", '&#39;': "'", '&lt;': '<', '&gt;': '>' })[value]);

// Comprueba el HTML de esta plantilla estática antes de escribir dist/.
// No evalúa posicionamiento ni sustituye una revisión editorial o Search Console.
export function validarSitio(pages, base, assetRoot) {
  const errors = [];
  const documents = new Map();
  const titles = new Map();
  const descriptions = new Map();
  const origin = new URL(base).origin;
  const assetDirectory = resolve(assetRoot);
  const fail = (path, detail) => errors.push(path + ': ' + detail);

  for (const [path, page] of pages) {
    const tags = [...page.html.matchAll(/<([a-z][\w-]*)\b([^>]*?)>/gi)].map(([, name, text]) => ({
      name: name.toLowerCase(),
      attrs: Object.fromEntries([...text.matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/gs)]
        .map(([, key, , value]) => [key.toLowerCase(), decode(value)])),
    }));
    const ids = tags.filter(({ attrs }) => attrs.id).map(({ attrs }) => attrs.id);
    if (new Set(ids).size !== ids.length) fail(path, 'identificadores HTML duplicados');
    if (tags.filter(({ name }) => name === 'h1').length !== 1) fail(path, 'debe haber un único H1');
    const title = page.html.match(/<title>([^<]+)<\/title>/i)?.[1];
    const description = tags.find(({ name, attrs }) => name === 'meta' && attrs.name === 'description')?.attrs.content;
    if (!title || !description) fail(path, 'falta título o descripción');
    if (page.indexed) {
      const canonicals = tags.filter(({ name, attrs }) => name === 'link' && attrs.rel === 'canonical');
      if (canonicals.length !== 1 || canonicals[0].attrs.href !== base + path) fail(path, 'canonical incorrecto');
      if (tags.some(({ name, attrs }) => name === 'meta' && /^(robots|googlebot)$/i.test(attrs.name || '')
        && /\b(noindex|nofollow|none)\b/i.test(attrs.content || ''))) fail(path, 'bloqueo de indexación o enlaces');
      for (const [value, seen, label] of [[title, titles, 'título'], [description, descriptions, 'descripción']]) {
        if (seen.has(value)) fail(path, label + ' duplicado con ' + seen.get(value));
        seen.set(value, path);
      }
    }
    for (const [, json] of page.html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
      try { JSON.parse(json); } catch { fail(path, 'JSON-LD no válido'); }
    }
    documents.set(path, { tags, ids: new Set(ids), links: new Set() });
  }

  for (const [path, document] of documents) {
    for (const { name, attrs } of document.tags) {
      for (const reference of [attrs.href, attrs.src].filter(Boolean)) {
        let url;
        try { url = new URL(reference, base + path); } catch { fail(path, 'URL no válida: ' + reference); continue; }
        if (url.origin !== origin) continue;
        const target = decodeURIComponent(url.pathname);
        if (documents.has(target)) {
          if (name === 'a') document.links.add(target);
          if (url.hash && !documents.get(target).ids.has(decodeURIComponent(url.hash.slice(1)))) {
            fail(path, 'ancla inexistente: ' + reference);
          }
        } else if (target.startsWith('/assets/')) {
          const file = resolve(assetDirectory, target.slice('/assets/'.length));
          if (!file.startsWith(assetDirectory + sep) || !existsSync(file)) fail(path, 'archivo inexistente: ' + target);
        } else if (!['/sitemap.xml', '/robots.txt'].includes(target)) {
          fail(path, 'destino interno inexistente: ' + reference);
        }
      }
    }
  }
  const reached = new Set(['/']);
  for (const path of reached) {
    for (const target of documents.get(path)?.links || []) reached.add(target);
  }
  for (const [path, page] of pages) {
    if (page.indexed && !reached.has(path)) fail(path, 'página sin enlaces desde la portada');
  }
  if (errors.length) throw new Error('Publicación detenida por errores técnicos:\n' + errors.join('\n'));
  return { pages: pages.size, indexed: [...pages.values()].filter((page) => page.indexed).length };
}
