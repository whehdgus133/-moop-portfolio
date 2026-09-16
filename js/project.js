import { element, galleryImages, localURL, photoElement, publishedProjects, readData, setupSite } from './shared.js';

setupSite();
const content = document.querySelector('#project-content');
const dialog = document.querySelector('#lightbox');
const stage = dialog.querySelector('.lightbox-stage');
const counter = dialog.querySelector('.lightbox-counter');
const message = dialog.querySelector('.lightbox-message');
const previous = dialog.querySelector('[data-previous]');
const next = dialog.querySelector('[data-next]');
let photos = [];
let current = 0;
let returnFocus;
let gesture = null;
let suppressClick = false;

function showPhoto(index) {
  current = (index + photos.length) % photos.length;
  const photo = photos[current];
  const img = element('img', 'lightbox-image');
  img.alt = photo.alt || '';
  img.width = photo.width;
  img.height = photo.height;
  img.draggable = false;
  message.textContent = '불러오는 중…';
  img.addEventListener('load', () => { if (stage.contains(img)) message.textContent = ''; });
  img.addEventListener('error', () => { if (stage.contains(img)) message.textContent = '사진을 불러오지 못했습니다. 다른 사진으로 이동해 주세요.'; });
  img.src = localURL(photo.full || photo.src);
  stage.replaceChildren(img);
  counter.textContent = `${current + 1} / ${photos.length}`;
  previous.hidden = next.hidden = photos.length < 2;
}

function openLightbox(index, trigger) {
  returnFocus = trigger;
  showPhoto(index);
  dialog.showModal();
  document.body.classList.add('lightbox-open');
  dialog.querySelector('[data-close]').focus();
}

function closeLightbox() { dialog.close(); }
dialog.querySelector('[data-close]').addEventListener('click', closeLightbox);
previous.addEventListener('click', () => showPhoto(current - 1));
next.addEventListener('click', () => showPhoto(current + 1));
dialog.addEventListener('close', () => {
  document.body.classList.remove('lightbox-open');
  stage.replaceChildren(); // Stop displaying a previous project image on the next open.
  gesture = null;
  returnFocus?.focus({ preventScroll: true });
});
dialog.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    showPhoto(current + (event.key === 'ArrowLeft' ? -1 : 1));
  }
});
dialog.addEventListener('click', event => {
  if (suppressClick) { suppressClick = false; return; }
  if (event.target === dialog || event.target === stage) closeLightbox();
});
dialog.addEventListener('pointerdown', event => {
  suppressClick = false;
  if (!event.isPrimary || event.pointerType === 'mouse' || event.target.closest('button')) {
    gesture = null;
    return;
  }
  gesture = { x: event.clientX, y: event.clientY, id: event.pointerId };
});
dialog.addEventListener('pointerup', event => {
  if (!gesture || gesture.id !== event.pointerId) return;
  const dx = event.clientX - gesture.x;
  const dy = event.clientY - gesture.y;
  gesture = null;
  if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4 && photos.length > 1) {
    suppressClick = true;
    showPhoto(current + (dx < 0 ? 1 : -1));
  }
});
dialog.addEventListener('pointercancel', () => { gesture = null; });

async function init() {
  try {
    const data = await readData('projects');
    const id = new URLSearchParams(location.search).get('id');
    const project = publishedProjects(data).find(item => item.id === id);
    if (!project) {
      content.replaceChildren(element('h1', 'empty-title', '프로젝트를 찾을 수 없습니다.'), element('p', 'empty-copy', '주소가 변경되었거나 아직 공개되지 않은 프로젝트입니다.'));
      return;
    }
    photos = galleryImages(project);
    document.title = `${project.name} — The moop studio.`;
    const header = element('header', 'project-heading');
    const label = data.categories.find(item => item.id === project.category)?.label || project.category;
    for (const link of document.querySelectorAll('[data-category-back]')) {
      link.href = localURL(`work.html?category=${encodeURIComponent(project.category)}`);
      link.textContent = `← ${label} PROJECTS`;
    }
    const title = element('div');
    title.append(element('span', 'section-label', project.isSample ? `${label} / SAMPLE PROJECT` : label), element('h1', '', project.name));
    const info = element('div', 'project-heading-info');
    info.append(element('p', 'project-client', [project.client, project.medium, project.year].filter(Boolean).join(' · ')), element('p', '', project.description));
    header.append(title, info);
    const gallery = element('div', 'project-gallery');
    photos.forEach((photo, index) => {
      const figure = element('figure', photo.width / photo.height >= 1.45 ? 'gallery-item gallery-wide' : 'gallery-item');
      const button = element('button', 'gallery-photo');
      button.type = 'button';
      button.setAttribute('aria-label', `${photo.alt || `사진 ${index + 1}`} — 크게 보기`);
      const wide = photo.width / photo.height >= 1.45;
      button.append(photoElement(photo, wide ? '92vw' : '(max-width: 700px) 100vw, 46vw'));
      button.addEventListener('click', () => openLightbox(index, button));
      figure.append(button);
      if (photo.caption) figure.append(element('figcaption', '', photo.caption));
      gallery.append(figure);
    });
    if (!photos.length) gallery.append(element('p', 'empty-copy', '사진을 준비하고 있습니다.'));
    content.replaceChildren(header, gallery);
  } catch (error) {
    console.error(error);
    content.replaceChildren(element('h1', 'empty-title', '프로젝트를 불러오지 못했습니다.'), element('p', 'empty-copy', '잠시 후 새로고침해 주세요.'));
  }
}
init();
