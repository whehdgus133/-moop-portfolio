import { element, localURL, photoElement, readData, setupSite } from './shared.js';

setupSite();
const grid = document.querySelector('#film-grid');
const filters = document.querySelector('#film-filters');
const status = document.querySelector('#film-status');
const dialog = document.querySelector('#film-player');
const video = document.querySelector('#film-video');
const youtube = document.querySelector('#film-youtube');

function youtubeThumbnail(item) {
  return `https://i.ytimg.com/vi/${encodeURIComponent(item.videoId)}/hqdefault.jpg`;
}

function closePlayer() {
  video.pause();
  video.removeAttribute('src');
  video.removeAttribute('poster');
  video.load();
  youtube.src = 'about:blank';
  youtube.hidden = true;
  if (dialog.open) dialog.close();
}

function openPlayer(film, category) {
  document.querySelector('#film-player-title').textContent = film.title;
  document.querySelector('#film-player-category').textContent = [category?.label, film.client, film.year].filter(Boolean).join(' · ');
  document.querySelector('#film-player-description').textContent = film.description || '';
  const isYouTube = film.video.kind === 'youtube';
  video.hidden = isYouTube;
  youtube.hidden = !isYouTube;
  if (isYouTube) {
    youtube.title = `${film.title} — YouTube 영상`;
    youtube.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(film.video.videoId)}?autoplay=1&rel=0`;
  } else {
    video.src = localURL(film.video.src);
    if (film.thumbnail) video.poster = localURL(film.thumbnail.src);
  }
  dialog.showModal();
  document.querySelector('#film-player-close').focus();
}

function filmCard(film, category) {
  const article = element('article', 'film-card');
  const button = element('button', 'film-thumb');
  button.type = 'button';
  button.setAttribute('aria-label', `${film.title} — 영상 보기`);
  const img = film.thumbnail ? photoElement(film.thumbnail, '(max-width: 700px) 100vw, 48vw') : element('img');
  if (!film.thumbnail) {
    img.src = youtubeThumbnail(film.video);
    img.loading = 'lazy';
    img.decoding = 'async';
  }
  img.alt = '';
  button.append(img);
  const play = element('span', 'film-play', 'PLAY FILM →');
  button.append(play);
  const info = element('div', 'film-info');
  info.append(element('h2', '', film.title));
  info.append(element('p', '', [category?.label, film.client, film.year].filter(Boolean).join(' · ')));
  article.append(button, info);
  button.addEventListener('click', () => openPlayer(film, category));
  return article;
}

document.querySelector('#film-player-close').addEventListener('click', closePlayer);
dialog.addEventListener('click', event => { if (event.target === dialog) closePlayer(); });
dialog.addEventListener('close', () => {
  video.pause();
  video.removeAttribute('src');
  video.load();
  youtube.src = 'about:blank';
  youtube.hidden = true;
});

async function init() {
  try {
    const data = await readData('films');
    const films = data.films.filter(film => film.status === 'published' && film.video && (film.thumbnail || film.video.kind === 'youtube'))
      .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
    const id = new URLSearchParams(location.search).get('category') || 'all';
    const category = data.categories.find(item => item.id === id);
    for (const item of [{ id: 'all', label: 'ALL' }, ...data.categories]) {
      const link = element('a', 'filter-button', item.label);
      link.href = localURL(item.id === 'all' ? 'film.html' : `film.html?category=${encodeURIComponent(item.id)}`);
      if (item.id === id) link.setAttribute('aria-current', 'page');
      filters.append(link);
    }
    if (id !== 'all' && !category) {
      status.textContent = '위 메뉴에서 영상 분야를 선택해 주세요.';
      return;
    }
    document.title = `${category?.label || 'Film'} — The moop studio.`;
    document.querySelector('#film-category-title').textContent = category?.label || 'FILM';
    document.querySelector('#film-category-description').textContent = category?.description || 'DOP · Commercial · Campaign · Contents';
    const selection = id === 'all' ? films : films.filter(film => film.category === id);
    grid.replaceChildren(...selection.map(film => filmCard(film, data.categories.find(item => item.id === film.category))));
    status.textContent = selection.length ? `${String(selection.length).padStart(2, '0')} FILM${selection.length === 1 ? '' : 'S'}` : '영상 작업을 준비하고 있습니다.';
  } catch (error) {
    console.error(error);
    status.textContent = '영상 작업을 불러오지 못했습니다. 잠시 후 새로고침해 주세요.';
  }
}
init();
