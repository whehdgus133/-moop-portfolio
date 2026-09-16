import { element, galleryImages, localURL, photoElement, publishedProjects, readData, setupSite } from './shared.js';

async function init() {
  const status = document.querySelector('#work-status');
  try {
    const [data, site] = await Promise.all([readData('projects'), setupSite()]);
    const projects = publishedProjects(data);
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
