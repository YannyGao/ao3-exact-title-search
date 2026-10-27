const toggle = document.querySelector('#enabled');
const status = document.querySelector('#status');

const render = (enabled) => {
  toggle.checked = enabled;
  status.textContent = enabled ? 'Enabled' : 'Disabled';
};

chrome.storage.local.get({ enabled: true }, ({ enabled }) => render(enabled));
toggle.addEventListener('change', () => {
  chrome.storage.local.set({ enabled: toggle.checked });
  render(toggle.checked);
});
