import { element, galleryImages, localURL, photoElement, publishedProjects, readData, setupSite } from './shared.js';

setupSite();
const grid = document.querySelector('#project-grid');
const status = document.querySelector('#work-status');
const filters = document.querySelector('#work-filters');
let openCard = null;

function closeCard(restoreFocus = false) {
  if (!openCard) return;
  const card = openCard;
  openCard = null;
  card.classList.remove('is-flipped');
  card.querySelector('.project-back').inert = true;
  const front = card.querySelector('.project-front');
  front.inert = false;
  front.setAttribute('aria-expanded', 'false');
  if (restoreFocus || card.contains(document.activeElement)) front.focus({ preventScroll: true });
}

function flipCard(card, focusBack = false) {
  if (openCard !== card) closeCard();
  openCard = card;
  card.classList.add('is-flipped');
  const front = card.querySelector('.project-front');
  front.setAttribute('aria-expanded', 'true');
  const back = card.querySelector('.project-back');
  back.inert = false;
  // Move keyboard focus off the side that is becoming hidden.
  if (focusBack || document.activeElement === front) back.querySelector('a').focus({ preventScroll: true });
  front.inert = true;
}

function projectCard(project, categories) {
  const card = element('article', 'project-card');
  const inner = element('div', 'project-card-inner');
  const front = element('button', 'project-front');
  front.type = 'button';
  front.setAttribute('aria-label', `${project.name} — 프로젝트 정보 보기`);
  front.setAttribute('aria-expanded', 'false');
  front.setAttribute('aria-controls', `info-${project.id}`);
  const cover = project.images.find(photo => photo.id === project.coverId) || galleryImages(project)[0];
  if (cover) {
    const img = photoElement(cover, '(max-width: 700px) 100vw, 46vw');
    img.style.objectPosition = project.coverPosition || '50% 50%';
    front.append(img);
  }
  const back = element('div', 'project-back');
  back.id = `info-${project.id}`;
  back.inert = true;
  const category = categories.find(item => item.id === project.category)?.label || project.category;
  const meta = element('div', 'project-meta');
  meta.append(element('span', '', project.isSample ? 'SAMPLE PROJECT' : category), element('span', '', project.year || 'YEAR —'));
  const copy = element('div', 'project-copy');
  copy.append(element('h3', '', project.name));
  copy.append(element('p', 'project-client', [project.client || category, project.medium].filter(Boolean).join(' / ')));
  copy.append(element('p', 'project-description', project.description));
  const actions = element('div', 'project-actions');
  const link = element('a', 'project-link', 'VIEW PROJECT →');
  link.href = localURL(`project.html?id=${encodeURIComponent(project.id)}`);
  const reset = element('button', 'text-button', '사진으로 돌아가기');
  reset.type = 'button';
  reset.addEventListener('click', () => closeCard(true));
  actions.append(link, reset);
  back.append(meta, copy, actions);
  inner.append(front, back);
  card.append(inner);
  front.addEventListener('click', event => flipCard(card, event.detail === 0));
  card.addEventListener('pointerenter', event => {
    if (event.pointerType === 'mouse' && matchMedia('(hover: hover)').matches) flipCard(card);
  });
  card.addEventListener('pointerleave', event => {
    if (event.pointerType === 'mouse' && openCard === card && !card.contains(document.activeElement)) closeCard();
  });
  card.addEventListener('focusout', event => {
    if (openCard === card && !card.contains(event.relatedTarget)) closeCard();
  });
  return card;
}

document.addEventListener('pointerdown', event => {
  if (openCard && !openCard.contains(event.target)) closeCard();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeCard(true);
});

async function init() {
  try {
    const data = await readData('projects');
    const projects = publishedProjects(data);
    const id = new URLSearchParams(location.search).get('category') || 'all';
    const category = data.categories.find(item => item.id === id);
    for (const item of [{ id: 'all', label: 'ALL' }, ...data.categories]) {
      const link = element('a', 'filter-button', item.label);
      link.href = localURL(item.id === 'all' ? 'work.html' : `work.html?category=${encodeURIComponent(item.id)}`);
      if (item.id === id) link.setAttribute('aria-current', 'page');
      filters.append(link);
    }
    if (id !== 'all' && !category) {
      document.querySelector('#category-title').textContent = 'WORK';
      status.textContent = '위 메뉴에서 작업 분야를 선택해 주세요.';
      return;
    }
    document.title = `${category?.label || 'Work'} — The moop studio.`;
    document.querySelector('#category-title').textContent = category?.label || 'WORK';
    document.querySelector('#category-description').textContent = category?.description || 'Portrait · Product · Event';
    const selection = id === 'all' ? projects : projects.filter(project => project.category === id);
    grid.replaceChildren(...selection.map(project => projectCard(project, data.categories)));
    status.textContent = selection.length ? `${String(selection.length).padStart(2, '0')} PROJECT${selection.length === 1 ? '' : 'S'}` : '프로젝트를 준비하고 있습니다.';
  } catch (error) {
    console.error(error);
    status.textContent = '프로젝트를 불러오지 못했습니다. 잠시 후 새로고침해 주세요.';
  }
}
init();
