(() => {
  if (typeof HTMLDialogElement === 'undefined'
      || typeof HTMLDialogElement.prototype.showModal !== 'function') return;

  const links = [...document.querySelectorAll('a[href]')].filter((link) => {
    const url = new URL(link.href);
    return url.origin === location.origin
      && /^\/assets\/trabajos\/.+\.(webp|jpe?g|png)$/i.test(url.pathname)
      && link.querySelector('img');
  });
  if (!links.length) return;

  const viewer = document.createElement('dialog');
  viewer.className = 'photo-viewer';
  viewer.setAttribute('aria-label', 'Fotografía ampliada');
  viewer.setAttribute('aria-describedby', 'photo-viewer-caption');

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'photo-viewer__close';
  close.setAttribute('aria-label', 'Cerrar foto');
  close.autofocus = true;
  const cross = document.createElement('span');
  cross.setAttribute('aria-hidden', 'true');
  cross.textContent = '×';
  close.append(cross, ' Cerrar');

  const stage = document.createElement('div');
  stage.className = 'photo-viewer__stage';
  const photo = document.createElement('img');
  stage.append(photo);
  const caption = document.createElement('p');
  caption.id = 'photo-viewer-caption';
  caption.className = 'photo-viewer__caption';
  viewer.append(close, stage, caption);
  document.body.append(viewer);

  let previous;
  links.forEach((link) => {
    link.classList.add('photo-zoom');
    link.setAttribute('aria-haspopup', 'dialog');
    link.addEventListener('click', (event) => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      const thumbnail = link.querySelector('img');
      photo.src = link.href;
      photo.alt = thumbnail.alt;
      caption.textContent = link.closest('figure')?.querySelector('figcaption')?.textContent.trim()
        || thumbnail.alt;
      previous = {
        trigger: link, x: window.scrollX, y: window.scrollY,
        top: document.body.style.top, left: document.body.style.left,
      };
      document.body.style.top = `-${previous.y}px`;
      document.body.style.left = `-${previous.x}px`;
      document.body.classList.add('photo-viewer-open');
      viewer.showModal();
    });
  });

  close.addEventListener('click', () => viewer.close());
  viewer.addEventListener('click', (event) => {
    if (event.target === viewer || event.target === stage) viewer.close();
  });
  viewer.addEventListener('close', () => {
    document.body.classList.remove('photo-viewer-open');
    document.body.style.top = previous.top;
    document.body.style.left = previous.left;
    const root = document.documentElement;
    const scrollBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.scrollTo(previous.x, previous.y);
    previous.trigger.focus({ preventScroll: true });
    root.style.scrollBehavior = scrollBehavior;
    photo.removeAttribute('src');
  });
})();
