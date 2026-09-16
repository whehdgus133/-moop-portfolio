const ROOT = new URL('../', import.meta.url);

export function localURL(path) {
  if (typeof path !== 'string' || !path || path.startsWith('/') || path.includes('\\')) {
    throw new Error('사이트 내부 경로는 images/… 형식으로 입력해 주세요.');
  }
  const url = new URL(path, ROOT);
  if (url.origin !== ROOT.origin || !url.pathname.startsWith(ROOT.pathname)) {
    throw new Error('사이트 폴더 밖의 경로는 사용할 수 없습니다.');
  }
  return url.href;
}

export async function readData(name) {
  const response = await fetch(localURL(`data/${name}.json`));
  if (!response.ok) throw new Error(`${name} 데이터를 불러올 수 없습니다.`);
  return response.json();
}

export function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function photoElement(photo, sizes = '100vw') {
  const img = element('img');
  img.src = localURL(photo.src);
  if (photo.sources?.length) {
    img.srcset = photo.sources.map(source => `${localURL(source.src)} ${source.width}w`).join(', ');
    img.sizes = sizes;
  }
  img.width = photo.width;
  img.height = photo.height;
  img.alt = photo.alt || '';
  img.loading = 'lazy';
  img.decoding = 'async';
  return img;
}

export function publishedProjects(data) {
  if (data.schemaVersion !== 1 || !Array.isArray(data.projects) || !Array.isArray(data.categories)) {
    throw new Error('지원하지 않는 프로젝트 데이터 형식입니다.');
  }
  return data.projects.filter(project => project.status === 'published')
    .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
}

export function galleryImages(project) {
  return [...project.images].sort((a, b) => a.order - b.order);
}

function externalURL(value) {
  const url = new URL(value);
  if (url.protocol !== 'https:') throw new Error('외부 링크에는 https 주소를 입력해 주세요.');
  return url.href;
}

export async function setupSite() {
  try {
    const site = await readData('site');
    for (const placeholder of document.querySelectorAll('[data-site-link]')) {
      const key = placeholder.dataset.siteLink;
      const value = site.links[key];
      if (!value) continue;
      const link = element('a', placeholder.className, placeholder.textContent);
      link.removeAttribute('aria-disabled');
      link.classList.remove('unavailable');
      link.href = key === 'email' ? `mailto:${value}` : externalURL(value);
      placeholder.replaceWith(link);
    }
    const hero = document.querySelector('[data-hero]');
    if (hero && site.hero) {
      const img = photoElement(site.hero, '(max-width: 700px) 100vw, 68vw');
      img.loading = 'eager';
      img.fetchPriority = 'high';
      hero.replaceChildren(img);
    }
    const about = document.querySelector('[data-about-photo]');
    if (about && site.aboutPhoto) {
      about.classList.remove('placeholder');
      about.replaceChildren(photoElement(site.aboutPhoto, '280px'));
    }
    return site;
  } catch (error) {
    // Existing text, placeholders and the optimized hero remain usable on failure.
    console.error(error);
    return null;
  }
}
