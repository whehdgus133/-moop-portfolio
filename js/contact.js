import { element, setupSite } from './shared.js';

const form = document.querySelector('#contact-form');
const submit = document.querySelector('#send-inquiry');
const status = document.querySelector('#form-status');
const availability = document.querySelector('#form-availability');
let endpoint = '';
let recipient = '';
let sending = false;

export function inquiryMailto(fields, email) {
  const subject = `[프로젝트 문의] ${fields.get('company') || fields.get('name')}`;
  const body = [
    `이름: ${fields.get('name')}`, `회사 / 브랜드: ${fields.get('company') || '—'}`,
    `회신 이메일: ${fields.get('email')}`, `작업 분야: ${fields.get('category') || '—'}`,
    `희망 일정: ${fields.get('schedule') || '—'}`, '', String(fields.get('message')),
  ].join('\n');
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// Attach before loading configuration: unconfigured forms must never POST to this page.
form.addEventListener('submit', async event => {
  event.preventDefault();
  if ((!endpoint && !recipient) || sending || !form.reportValidity()) return;
  const payload = new FormData(form);
  if (!endpoint) {
    location.href = inquiryMailto(payload, recipient);
    status.textContent = '아직 전송되지 않았습니다. 메일 앱에서 내용을 확인한 뒤 보내기를 눌러 주세요. 앱이 열리지 않으면 아래의 내용 복사 버튼을 이용해 주세요.';
    return;
  }
  sending = true;
  submit.disabled = true;
  submit.textContent = '전송 중…';
  status.textContent = '';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(endpoint, {
      method: 'POST', body: payload, headers: { Accept: 'application/json' }, signal: controller.signal,
    });
    if (!response.ok) throw new Error('전송 실패');
    status.textContent = '문의가 접수되었습니다. 감사합니다.';
    form.reset();
  } catch (error) {
    status.textContent = error.name === 'AbortError'
      ? '전송 결과를 확인하지 못했습니다. 입력 내용은 유지됩니다. 잠시 후 확인하거나 이메일로 문의해 주세요.'
      : '문의 전송을 완료하지 못했습니다. 입력 내용은 유지됩니다. 잠시 후 다시 시도해 주세요.';
  } finally {
    clearTimeout(timeout);
    sending = false;
    submit.disabled = false;
    submit.textContent = 'SEND INQUIRY →';
  }
});

async function init() {
  const site = await setupSite();
  if (!site) return;
  const phone = site.contact?.phone?.trim();
  if (phone) {
    const link = element('a', '', phone);
    link.href = `tel:${phone.replace(/[^+\d]/g, '')}`;
    document.querySelector('#contact-phone').replaceChildren(link);
  }
  if (site.links.email) {
    recipient = site.links.email;
    const link = element('a', '', site.links.email);
    link.href = `mailto:${site.links.email}`;
    document.querySelector('#contact-email').replaceChildren(link);
  }
  const configured = site.contact?.formEndpoint || '';
  const faq = Array.isArray(site.contact?.faq) ? site.contact.faq : [];
  const faqList = document.querySelector('#faq-list');
  for (const item of faq) {
    if (!item?.question?.trim() || !item?.answer?.trim()) continue;
    const detail = element('details', 'faq-item');
    detail.append(element('summary', '', item.question), element('p', '', item.answer));
    faqList.append(detail);
  }
  document.querySelector('#contact-faq').hidden = faqList.childElementCount === 0;
  // Only a public Formspree form URL is required; never put secret keys in site data.
  if (/^https:\/\/formspree\.io\/f\/[a-zA-Z0-9]+$/.test(configured)) {
    endpoint = configured;
    availability.textContent = '문의는 Formspree를 통해 전달됩니다. 회신받을 이메일을 정확히 입력해 주세요.';
    submit.textContent = 'SEND INQUIRY →';
    submit.disabled = false;
  } else if (recipient) {
    availability.textContent = '작성한 내용을 메일 앱으로 연결합니다. 메일 앱에서 보내기를 눌러야 전송됩니다.';
    submit.textContent = '메일 앱에서 보내기 →';
    submit.disabled = false;
  }
}

document.querySelector('#copy-inquiry').addEventListener('click', async () => {
  const fields = new FormData(form);
  const text = `받는 사람: ${recipient}\n이름: ${fields.get('name')}\n회사 / 브랜드: ${fields.get('company')}\n회신 이메일: ${fields.get('email')}\n작업 분야: ${fields.get('category')}\n희망 일정: ${fields.get('schedule')}\n\n${fields.get('message')}`;
  try {
    await navigator.clipboard.writeText(text);
    status.textContent = '문의 내용을 복사했습니다. 사용하시는 메일에 붙여 넣어 보내 주세요.';
  } catch {
    status.textContent = '복사할 수 없습니다. 입력한 내용을 직접 선택해 복사해 주세요.';
  }
});
init();
