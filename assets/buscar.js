const form = document.querySelector('[data-search]');
if (form) {
  const field = form.querySelector('input');
  const province = form.querySelector('select');
  const output = document.querySelector('#resultados-municipios');
  const status = document.querySelector('#estado-busqueda');
  const normalize = (value) => value.toLowerCase().normalize('NFD')
    .replace(/\p{Diacritic}/gu, '').replace(/[^a-z0-9]+/g, ' ').trim();

  let index;
  function render() {
    const query = normalize(field.value).replace(/^antenista en /, '');
    if (query.length < 2) {
      output.replaceChildren();
      status.textContent = query ? 'Escribe al menos dos letras.' : '';
      return;
    }

    const matches = index
      .filter((place) => (!province.value || place[1] === province.value)
        && query.split(' ').every((word) => place[4].includes(word)))
      .sort((a, b) => Number(b[4].startsWith(query)) - Number(a[4].startsWith(query))
        || a[0].localeCompare(b[0], 'es'));

    const items = matches.slice(0, 12).map(([name, region, url, area]) => {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = url;
      link.textContent = 'Antenista en ' + name;
      const note = document.createElement('small');
      note.textContent = area ? region + ' · cobertura de ' + area : region;
      item.append(link, note);
      return item;
    });
    output.replaceChildren(...items);
    status.textContent = matches.length
      ? matches.length + (matches.length === 1 ? ' municipio encontrado.' : ' municipios encontrados.')
        + (matches.length > items.length ? ' Se muestran los primeros 12.' : '')
      : 'No encontramos ese nombre. Prueba con el municipio o revisa el listado por provincia.';
  }

  let dataRequest;
  async function search() {
    if (normalize(field.value).length < 2) {
      render();
      return;
    }

    try {
      dataRequest ??= fetch('/assets/municipios.json').then((response) => {
        if (!response.ok) throw new Error('Índice no disponible');
        return response.json();
      });
      index ??= await dataRequest;
      render();
    } catch {
      dataRequest = undefined;
      status.textContent = 'El buscador no está disponible. Puedes navegar por el listado de provincias.';
    }
  }
  field.addEventListener('input', search);
  province.addEventListener('change', search);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    search();
  });
}
