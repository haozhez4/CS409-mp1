/* Your JS here. */
import '../css/main.scss';

const navbar   = document.getElementById('navbar');
const navInner = document.querySelector('.nav-inner');
const navLinks = Array.from(document.querySelectorAll('.nav-link'));
const indicator = document.querySelector('.nav-indicator');

const sections = navLinks
  .map(a => document.querySelector(a.getAttribute('href')))
  .filter(Boolean);

function layoutIndicator() {
  if (!indicator || !navInner || navLinks.length === 0) return;
  const first = navLinks[0];
  indicator.style.width = `${first.getBoundingClientRect().width}px`;
  indicator.style.opacity = '1';
}

function moveIndicatorToIndex(i) {
  if (!indicator || !navLinks[i]) return;
  const linkRect = navLinks[i].getBoundingClientRect();
  const innerRect = navInner.getBoundingClientRect();
  const x = linkRect.left - innerRect.left;
  indicator.style.width = `${linkRect.width}px`;
  indicator.style.transform = `translateX(${x}px)`;
}

layoutIndicator();

window.addEventListener('resize', () => {
  layoutIndicator();
  lastIndex = -1;
}, { passive: true });

navLinks.forEach((a, i) => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;

    moveIndicatorToIndex(i);

    const top = target.getBoundingClientRect().top + window.scrollY - navbar.offsetHeight + 1;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

function computeActiveIndex() {
  const yLine = navbar.getBoundingClientRect().bottom + 1;

  let bestIndex = 0;
  let bestDist = Infinity;

  sections.forEach((sec, idx) => {
    const rect = sec.getBoundingClientRect();

    if (rect.top <= yLine && rect.bottom > yLine) {
      bestIndex = idx;
      bestDist = 0;
      return;
    }

    const dist = Math.min(Math.abs(rect.top - yLine), Math.abs(rect.bottom - yLine));
    if (dist < bestDist) {
      bestDist = dist;
      bestIndex = idx;
    }
  });

  const atBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 2;
  if (atBottom) bestIndex = sections.length - 1;

  return bestIndex;
}

let lastIndex = -1;
function rafUpdate() {
  const idx = computeActiveIndex();
  if (idx !== lastIndex) {
    moveIndicatorToIndex(idx);
    lastIndex = idx;
  }
  requestAnimationFrame(rafUpdate);
}
requestAnimationFrame(rafUpdate);

function updateNavbarShrink() {
  if (!navbar) return;
  if (window.scrollY > 10) {
    navbar.classList.add('shrink');
  } else {
    navbar.classList.remove('shrink');
  }
}
updateNavbarShrink();
window.addEventListener('scroll', updateNavbarShrink, { passive: true });

const modalEl  = document.getElementById('aboutModal');
const modalImg = modalEl ? modalEl.querySelector('.modal-img') : null;
const triggers = Array.from(document.querySelectorAll('.modal-trigger'));

function openModal(src) {
  if (!modalEl || !modalImg) return;
  modalImg.src = src || modalImg.src;
  modalEl.classList.add('show');
  modalEl.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  if (!modalEl) return;
  modalEl.classList.remove('show');
  modalEl.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

triggers.forEach(btn => {
  btn.addEventListener('click', () => openModal(btn.dataset.img));
});

modalEl?.addEventListener('click', (e) => {
  if (e.target.hasAttribute('data-close')) closeModal();
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});



/* My Cat */
(function setupCatCarousel() {
  const root = document.getElementById('catCarousel');
  if (!root) return;

  const viewport = root.querySelector('.carousel-viewport');
  const track    = root.querySelector('.carousel-track');
  const slides   = Array.from(root.querySelectorAll('.carousel-slide'));
  const prevBtn  = root.querySelector('.carousel-arrow.prev');
  const nextBtn  = root.querySelector('.carousel-arrow.next');

  let index = 0;

  function slideTo(i) {
    const max = slides.length - 1;
    index = Math.max(0, Math.min(i, max));
    const x = -index * viewport.clientWidth;
    track.style.transform = `translateX(${x}px)`;
  }

  prevBtn.addEventListener('click', () => slideTo(index - 1));
  nextBtn.addEventListener('click', () => slideTo(index + 1));

  window.addEventListener('resize', () => slideTo(index), { passive: true });

  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  { e.preventDefault(); slideTo(index - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); slideTo(index + 1); }
  });

  root.setAttribute('tabindex', '0');
  let startX = 0, isDragging = false;

  function onStart(clientX) {
    isDragging = true;
    startX = clientX;
  }
  function onMove(clientX) {
    if (!isDragging) return;
    const dx = clientX - startX;
    track.style.transform = `translateX(${-index * viewport.clientWidth + dx}px)`;
  }
  function onEnd(clientX) {
    if (!isDragging) return;
    isDragging = false;
    const dx = clientX - startX;
    const threshold = viewport.clientWidth * 0.2; // 超过 20% 宽度就翻页
    if (dx > threshold) slideTo(index - 1);
    else if (dx < -threshold) slideTo(index + 1);
    else slideTo(index);
  }


  viewport.addEventListener('touchstart', (e) => onStart(e.touches[0].clientX), { passive: true });
  viewport.addEventListener('touchmove',  (e) => onMove(e.touches[0].clientX),  { passive: true });
  viewport.addEventListener('touchend',   (e) => onEnd(e.changedTouches[0].clientX));



  slideTo(0);
})();

(function setupReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.25 });

  els.forEach(el => io.observe(el));
})();
