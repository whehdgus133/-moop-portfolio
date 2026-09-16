import { element, photoElement, setupSite } from './shared.js';

async function init() {
  const site = await setupSite();
  if (!site) {
    document.querySelector('#about-status').textContent = '소개 정보를 불러오지 못했습니다. 잠시 후 새로고침해 주세요.';
    return;
  }
  const copy = site.copy || {};
  const about = site.about || {};
  for (const [id, value] of Object.entries({ 'profile-name': copy.aboutName, 'profile-role': copy.aboutRole, 'profile-bio': about.biography || copy.aboutDescription })) {
    if (typeof value === 'string') document.getElementById(id).textContent = value;
  }
  if (site.aboutPhoto) {
    const container = document.querySelector('#profile-photo');
    container.classList.remove('placeholder');
    const image = photoElement(site.aboutPhoto, '(max-width: 700px) 100vw, 40vw');
    image.loading = 'eager';
    container.replaceChildren(image);
  }
  for (const [key, prefix, unit] of [['shootCount', 'shoot', '회'], ['clientCount', 'client', '곳']]) {
    const value = String(about[key] ?? '').trim();
    if (value) {
      document.getElementById(`${prefix}-count`).textContent = value;
      document.getElementById(`${prefix}-note`).textContent = unit;
    }
  }
  const career = about.career || [];
  if (career.length) {
    const list = document.querySelector('#career-list');
    list.replaceChildren(...career.map(item => {
      const row = element('article', 'career-row');
      const content = element('div');
      content.append(element('h3', '', item.title));
      if (item.description) content.append(element('p', '', item.description));
      row.append(element('span', 'career-period', item.period), content);
      return row;
    }));
  }
  document.querySelector('#clients-intro').textContent = about.clientsIntro || '';
  const clients = about.clients || [];
  if (clients.length) {
    document.querySelector('#client-logos').replaceChildren(...clients.map(client => {
      const figure = element('figure', 'client-logo');
      if (client.logo) {
        const img = photoElement({ ...client.logo, alt: client.name }, '(max-width: 700px) 40vw, 180px');
        figure.append(img);
      }
      figure.append(element('figcaption', '', client.name));
      return figure;
    }));
  }
}
init();
