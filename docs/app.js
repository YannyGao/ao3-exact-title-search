const form = document.querySelector('#search-form');
const input = document.querySelector('#query');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const query = input.value.trim();
  if (!query) return;
  const ao3URL = new URL('https://archiveofourown.org/works/search');
  ao3URL.searchParams.set('work_search[title]', `"${query}"`);
  window.location.assign(ao3URL.toString());
});
