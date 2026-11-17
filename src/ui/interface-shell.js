// UI-only preferences. A locale change returns to a checkpoint, with consent.
import { getLocale, t } from './i18n/index.js';
import './anime-theme.css';

export function createInterfaceShell(root) {
  document.documentElement.lang = getLocale();
  document.documentElement.dataset.uiTheme = 'anime-survival';
  document.title = t('Last Refuge — build by day, survive the night');
  const tools = document.createElement('div');
  tools.className = 'interface-tools';
  const label = document.createElement('label');
  label.textContent = t('Language');
  const select = document.createElement('select');
  select.setAttribute('aria-label', t('Language'));
  for (const [value, text] of [['zh-TW', '繁體中文'], ['en', 'English']]) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = text;
    select.append(option);
  }
  select.value = getLocale();
  select.addEventListener('change', () => {
    if (root.querySelector('.hud') && !window.confirm(t('Changing language returns to the last dawn checkpoint. Continue?'))) {
      select.value = getLocale();
      return;
    }
    const url = new URL(window.location.href);
    url.searchParams.set('lang', select.value);
    url.searchParams.delete('new');
    url.searchParams.delete('autostart');
    window.location.assign(url.href);
  });
  select.addEventListener('keydown', event => event.stopPropagation());
  select.addEventListener('keyup', event => event.stopPropagation());
  label.append(select);
  tools.append(label);
  root.append(tools);
  return tools;
}
