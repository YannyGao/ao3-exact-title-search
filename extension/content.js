(() => {
  'use strict';

  const QUERY_SELECTORS = [
    'input[name="work_search[query]"]',
    'input[name="site_search"]',
    'input[type="search"]'
  ];
  const RESULT_SELECTOR = 'ol.work.index.group > li.work.blurb, li.work.blurb';
  const TITLE_SELECTOR = 'h4.heading a[href*="/works/"]';

  const findQueryInput = (form) => {
    for (const selector of QUERY_SELECTORS) {
      const input = form.querySelector(selector);
      if (input) return input;
    }
    return null;
  };

  const isNativeHeaderSearch = (form, input) => {
    if (!form || !input) return false;
    if (form.id === 'search') return true;
    if (form.closest('#header, header')) return true;
    return input.name === 'site_search';
  };

  const exactSearchURL = (query) => {
    const url = new URL('/works/search', window.location.origin);
    url.searchParams.set('work_search[title]', `"${query}"`);
    return url;
  };

  document.addEventListener('submit', (event) => {
    const form = event.target instanceof HTMLFormElement ? event.target : null;
    const input = form ? findQueryInput(form) : null;
    if (!isNativeHeaderSearch(form, input)) return;

    const query = input.value.trim();
    if (!query) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    window.location.assign(exactSearchURL(query));
  }, true);

  const normalize = (value) => value.normalize('NFC').toLocaleLowerCase();

  const exactQueryFromLocation = () => {
    const value = new URLSearchParams(window.location.search).get('work_search[title]') || '';
    return value.startsWith('"') && value.endsWith('"') ? value.slice(1, -1) : '';
  };

  const filterRenderedResults = () => {
    const query = exactQueryFromLocation().trim();
    if (!query) return;
    const needle = normalize(query);

    for (const result of document.querySelectorAll(RESULT_SELECTOR)) {
      const title = result.querySelector(TITLE_SELECTOR)?.textContent?.trim() || '';
      result.classList.toggle('ao3-exact-title-hidden', !normalize(title).includes(needle));
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', filterRenderedResults, { once: true });
  } else {
    filterRenderedResults();
  }
})();
