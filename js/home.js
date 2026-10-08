import { element, galleryImages, localURL, photoElement, publishedProjects, readData, setupSite } from './shared.js';

function projectCover(project) {
  return project.images.find(photo => photo.id === project.coverId) || galleryImages(project)[0];
}

function setupHighlights(projects) {
  const card = document.querySelector('[data-highlight-card]');
  const media = document.querySelector('[data-highlight-media]');
  const toggle = card?.querySelector('.highlight-toggle');
  const count = document.querySelector('[data-highlight-count]');
  const highlights = projects.map(project => ({ project, photo: projectCover(project) }))
    .filter(item => item.photo).slice(0, 5);
  if (!card || !media || !toggle || !highlights.length) return;

  const slides = highlights.map(({ project, photo }, index) => {
    const img = photoElement(photo, '(max-width: 700px) 100vw, 68vw');
    img.alt = '';
    img.className = `highlight-slide${index === 0 ? ' active' : ''}`;
    img.style.objectPosition = project.coverPosition || '50% 50%';
    media.append(img);
    return img;
  });
  card.classList.add('has-highlights');
  let current = 0;
  let timer;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stackGap = highlights.length > 1 ? 48 / (highlights.length - 1) : 0;
  media.style.setProperty('--stack-width', `${stackGap * (highlights.length - 1)}px`);
  const show = index => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, position) => {
      const stack = (position - current + slides.length) % slides.length;
      slide.classList.toggle('active', stack === 0);
      slide.style.setProperty('--offset', `${stack * stackGap}px`);
      slide.style.zIndex = String(slides.length - stack);
    });
    count.textContent = `${String(current + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
  };
  const reveal = () => {
    card.classList.add('is-flipped');
    toggle.setAttribute('aria-expanded', 'true');
  };
  const showBrand = () => {
    card.classList.remove('is-flipped');
    toggle.setAttribute('aria-expanded', 'false');
  };
  const advance = () => {
    if (!card.classList.contains('is-flipped')) {
      show(0);
      reveal();
    } else if (current < slides.length - 1) {
      show(current + 1);
    } else {
      showBrand();
      show(0);
    }
  };
  const start = () => {
    if (reducedMotion || timer) return;
    timer = setInterval(advance, 1800);
  };
  const stop = () => {
    clearInterval(timer);
    timer = undefined;
  };
  toggle.addEventListener('click', event => {
    event.stopPropagation();
    reveal();
    start();
  });
  document.addEventListener('pointerdown', event => {
    if (card.classList.contains('is-flipped') && !card.contains(event.target)) showBrand();
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') showBrand(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else start(); });
  show(0);
  start();
}

async function init() {
  const status = document.querySelector('#work-status');
  try {
    const [data, site] = await Promise.all([readData('projects'), setupSite()]);
    const projects = publishedProjects(data);
    setupHighlights(projects);
    const grid = document.querySelector('#category-grid');
    for (const category of data.categories) {
      const project = projects.find(item => item.category === category.id);
      const cover = category.cover || project?.images.find(photo => photo.id === project.coverId)
        || (project && galleryImages(project)[0]) || site?.hero;
      const item = element('div', 'category-item');
      const link = element('a', 'category-cover');
      link.href = localURL(`work.html?category=${encodeURIComponent(category.id)}`);
      link.setAttribute('aria-label', `${category.label} — 작업 모아보기`);
      if (cover) {
        const img = photoElement(cover, '(max-width: 700px) 100vw, 31vw');
        img.alt = ''; // The category link supplies the accessible name.
        img.style.objectPosition = category.coverPosition || '50% 50%';
        link.append(img);
      }
      const overlay = element('span', 'category-overlay');
      const text = element('span', 'category-label');
      text.append(element('span', 'category-name', category.label));
      text.append(element('span', 'category-description', category.description || ''));
      overlay.append(text, element('span', 'category-cta', '사진 더 보기 →'));
      link.append(overlay);
      item.append(link);
      // Do not imply the reused portrait is an actual product/event assignment.
      if (!category.cover && (!project || project.isSample)) item.append(element('p', 'category-note', '임시 대표 이미지'));
      grid.append(item);
    }
    status.hidden = true;
  } catch (error) {
    console.error(error);
    status.textContent = '작업 분야를 불러오지 못했습니다. 잠시 후 새로고침해 주세요.';
  }
}
init();
