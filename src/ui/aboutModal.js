// "About Me" overlay. Built from real DOM (not the Phaser canvas) so the photo
// and prose render crisply above the low-res pixel game. openAboutModal builds
// the card, wires Esc / backdrop / ✕ to dismiss, and calls onClose so the scene
// can unfreeze the player. Only one can be open at a time.
let current = null;

export function openAboutModal({ name, tagline, photo, about = [], links = {}, onClose } = {}) {
  if (current) return;

  const backdrop = el('div', 'about-modal');
  const card = el('div', 'about-card');

  // Photo, with a graceful fallback to initials if the file is missing.
  const pic = el('div', 'about-photo');
  if (photo) {
    const img = document.createElement('img');
    img.src = photo;
    img.alt = name || 'Portrait';
    img.onerror = () => {
      img.remove();
      pic.classList.add('about-photo--empty');
      pic.textContent = initials(name);
    };
    pic.appendChild(img);
  } else {
    pic.classList.add('about-photo--empty');
    pic.textContent = initials(name);
  }

  const body = el('div', 'about-body');
  body.appendChild(el('h2', 'about-name', name));
  if (tagline) body.appendChild(el('p', 'about-tagline', tagline));
  about.forEach((line) => body.appendChild(el('p', 'about-text', line)));

  const linkKeys = Object.keys(links);
  if (linkKeys.length) {
    const row = el('div', 'about-links');
    linkKeys.forEach((k) => {
      const a = document.createElement('a');
      a.textContent = k;
      a.href = k === 'email' ? `mailto:${links[k]}` : links[k];
      if (k !== 'email') {
        a.target = '_blank';
        a.rel = 'noopener';
      }
      row.appendChild(a);
    });
    body.appendChild(row);
  }

  const close = el('button', 'about-close', '✕');
  close.setAttribute('aria-label', 'Close');

  card.append(close, pic, body, el('div', 'about-hint', 'Esc to close'));
  backdrop.appendChild(card);
  document.body.appendChild(backdrop);

  const dismiss = () => closeAboutModal(onClose);
  backdrop.addEventListener('mousedown', (e) => {
    if (e.target === backdrop) dismiss();
  });
  close.addEventListener('click', dismiss);
  // Capture-phase so Esc closes the modal before Phaser's own key handlers see it.
  const onKey = (e) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      dismiss();
    }
  };
  window.addEventListener('keydown', onKey, true);

  current = { backdrop, onKey };
  requestAnimationFrame(() => backdrop.classList.add('about-modal--open'));
}

export function closeAboutModal(onClose) {
  if (!current) return;
  window.removeEventListener('keydown', current.onKey, true);
  current.backdrop.remove();
  current = null;
  if (onClose) onClose();
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function initials(name = '') {
  return (
    name
      .split(/\s+/)
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?'
  );
}
