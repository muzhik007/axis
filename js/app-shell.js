/**
 * App Shell Z-Axis — dock nav + sticky layer stack
 */
(function () {
  const shell = document.querySelector('[data-app-shell]');
  const stack = document.querySelector('[data-z-stack]');
  if (!shell || !stack) return;

  const layers = [...stack.querySelectorAll('.z-layer')];
  const dockLinks = [...shell.querySelectorAll('[data-z-goto]')];
  const depthHud = shell.querySelector('[data-z-hud-depth]');
  const labelHud = shell.querySelector('[data-z-hud-label]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let activeIndex = 0;
  let dockNavUntil = 0;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function getStickyTop() {
    return parseFloat(getComputedStyle(shell).getPropertyValue('--shell-sticky-top')) || 84;
  }

  function getLayerScrollTop(layer) {
    return Math.max(0, layer.offsetTop - getStickyTop());
  }

  function getActiveIndexFromScroll() {
    const scrollY = window.scrollY;
    const stickyTop = getStickyTop();
    let active = 0;

    layers.forEach((layer, index) => {
      if (scrollY >= layer.offsetTop - stickyTop - 8) active = index;
    });

    return active;
  }

  function setActiveLayer(index) {
    activeIndex = index;

    layers.forEach((layer, i) => {
      layer.classList.toggle('is-active', i === index);
      layer.classList.toggle('is-past', i < index);
      layer.classList.toggle('is-future', i > index);
    });

    dockLinks.forEach((link, i) => {
      link.classList.toggle('is-active', i === index);
      link.setAttribute('aria-current', i === index ? 'true' : 'false');
    });

    const layer = layers[index];
    if (depthHud) depthHud.textContent = layer?.dataset.zLayer ?? String(index);
    if (labelHud) labelHud.textContent = layer?.dataset.zLabel ?? '';
  }

  function getLayerScrollSpan(index) {
    const stickyTop = getStickyTop();
    const current = layers[index];
    const next = layers[index + 1];
    if (!current || !next) return 0;
    return Math.max(next.offsetTop - current.offsetTop, 1);
  }

  function getNextEnterMotion(active) {
    const next = layers[active + 1];
    if (!next) return 0;

    const stickyTop = getStickyTop();
    const scrollY = window.scrollY;
    const start = layers[active].offsetTop - stickyTop;
    const span = getLayerScrollSpan(active);

    if (scrollY <= start) return 0;

    return clamp((scrollY - start) / span, 0, 1);
  }

  /** Opacity досягає 100% раніше за завершення slide */
  function getNextOpacityReveal(motion) {
    return clamp(motion / 0.48, 0, 1);
  }

  function applyLayerVisuals(active) {
    const stickyTop = getStickyTop();
    const isDockNav = performance.now() < dockNavUntil;
    const nextMotion = reducedMotion || isDockNav ? 0 : getNextEnterMotion(active);
    const nextReveal = getNextOpacityReveal(nextMotion);

    layers.forEach((layer, index) => {
      const dist = layer.getBoundingClientRect().top - stickyTop;
      const isStuck = dist <= 1;

      if (index < active) {
        const depth = active - index;
        layer.style.zIndex = String(10 + index);
        layer.style.setProperty('--layer-scale', depth === 1 ? '0.96' : '0.94');
        layer.style.setProperty('--layer-opacity', depth === 1 ? '0.25' : '0');
        layer.style.setProperty('--layer-enter', '1');
        layer.classList.remove('is-entering', 'is-receding');
        return;
      }

      if (index === active) {
        layer.style.zIndex = nextMotion > 0.02 ? '90' : '100';
        layer.style.setProperty('--layer-scale', String(1 - nextMotion * 0.04));
        layer.style.setProperty('--layer-opacity', String(1 - nextReveal * 0.18));
        layer.style.setProperty('--layer-enter', '1');
        layer.classList.toggle('is-receding', nextMotion > 0.02);
        return;
      }

      if (index === active + 1) {
        const isEntering = nextMotion > 0.02;
        layer.style.zIndex = isEntering ? '110' : String(index);
        layer.style.setProperty('--layer-scale', String(0.96 + nextMotion * 0.04));
        layer.style.setProperty('--layer-opacity', String(nextReveal));
        layer.style.setProperty('--layer-enter', String(nextMotion));
        layer.classList.toggle('is-entering', isEntering);
        return;
      }

      // Far future — hide if stuck above scroll position (prevents mash-up on dock jump)
      layer.style.zIndex = String(index);
      layer.style.setProperty('--layer-scale', '0.94');
      layer.style.setProperty('--layer-opacity', isStuck ? '0' : '1');
      layer.style.setProperty('--layer-enter', isStuck ? '1' : '0');
      layer.classList.remove('is-entering', 'is-receding');
    });
  }

  function scrollToLayer(id) {
    const index = layers.findIndex((layer) => layer.id === id);
    if (index < 0) return;

    setActiveLayer(index);
    dockNavUntil = performance.now() + (reducedMotion ? 50 : 850);

    applyLayerVisuals(index);

    window.scrollTo({
      top: getLayerScrollTop(layers[index]),
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  }

  function updateFromScroll() {
    if (performance.now() >= dockNavUntil) {
      setActiveLayer(getActiveIndexFromScroll());
    }

    applyLayerVisuals(activeIndex);
  }

  dockLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      scrollToLayer(link.dataset.zGoto);
    });
  });

  shell.addEventListener('click', (event) => {
    const anchor = event.target.closest('a[href^="#layer-"]');
    if (!anchor || anchor.dataset.zGoto) return;
    const id = anchor.getAttribute('href').slice(1);
    if (!document.getElementById(id)) return;
    event.preventDefault();
    scrollToLayer(id);
  });

  const newsletter = shell.querySelector('.site-footer__newsletter');
  if (newsletter) {
    newsletter.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = newsletter.querySelector('input[type="email"]');
      if (input?.value) {
        input.value = '';
        input.placeholder = 'Дякуємо! ✓';
        setTimeout(() => { input.placeholder = 'your@email.com'; }, 2500);
      }
    });
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => {
        updateFromScroll();
        ticking = false;
      });
    }
  }, { passive: true });

  window.addEventListener('resize', updateFromScroll);
  setActiveLayer(0);
  updateFromScroll();
})();
