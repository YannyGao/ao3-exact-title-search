const form = document.querySelector('#search-form');
const input = document.querySelector('#query');
const submitButton = form.querySelector('button[type="submit"]');
const section = document.querySelector('#results-section');
const title = document.querySelector('#results-title');
const count = document.querySelector('#result-count');
const status = document.querySelector('#status');
const list = document.querySelector('#results-list');
const pagination = document.querySelector('#pagination');
const pageLabel = document.querySelector('#page-label');
const prevButton = document.querySelector('#prev-page');
const nextButton = document.querySelector('#next-page');

let currentQuery = '';
let currentPage = 1;

const makeElement = (tag, className, text) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
};

const renderWorks = (works) => {
  list.replaceChildren();
  for (const work of works) {
    const item = makeElement('li', 'work');
    const heading = makeElement('h3');
    const link = makeElement('a', '', work.title);
    link.href = work.url;
    link.target = '_blank';
    link.rel = 'noreferrer';
    heading.append(link);
    item.append(heading);

    const details = [
      work.authors.length ? `作者：${work.authors.join('、')}` : '',
      work.language ? `语言：${work.language}` : '',
      work.words ? `${work.words} words` : ''
    ].filter(Boolean).join(' · ');
    if (details) item.append(makeElement('p', 'meta', details));
    if (work.fandoms.length) item.append(makeElement('p', 'fandoms', work.fandoms.join(' · ')));
    if (work.summary) item.append(makeElement('p', 'summary', work.summary));
    list.append(item);
  }
};

const search = async (query, page = 1) => {
  currentQuery = query.trim();
  currentPage = page;
  if (!currentQuery) return;

  section.hidden = false;
  title.textContent = `“${currentQuery}”`;
  status.textContent = '正在从 AO3 获取结果…';
  count.textContent = '';
  list.replaceChildren();
  pagination.hidden = true;
  submitButton.disabled = true;

  const url = new URL(window.location.href);
  url.search = '';
  url.searchParams.set('q', currentQuery);
  if (page > 1) url.searchParams.set('page', String(page));
  history.replaceState(null, '', url);

  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(currentQuery)}&page=${page}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || '搜索失败');
    renderWorks(data.works);
    count.textContent = `本页 ${data.works.length} 个严格匹配`;
    status.textContent = data.works.length
      ? '只显示标题中连续包含完整搜索文字的作品。'
      : '这一页没有严格匹配。可以尝试下一页，或检查输入文字。';
    pageLabel.textContent = `AO3 第 ${page} 页`;
    prevButton.disabled = page <= 1;
    pagination.hidden = false;
  } catch (error) {
    status.textContent = error.message;
  } finally {
    submitButton.disabled = false;
  }
};

form.addEventListener('submit', (event) => {
  event.preventDefault();
  search(input.value, 1);
});
prevButton.addEventListener('click', () => search(currentQuery, Math.max(1, currentPage - 1)));
nextButton.addEventListener('click', () => search(currentQuery, currentPage + 1));

const initial = new URLSearchParams(window.location.search);
if (initial.get('q')) {
  input.value = initial.get('q');
  search(input.value, Number(initial.get('page') || 1));
}
