// Locale state is UI-only. Importing this module does not access DOM or storage.
import { BUILDING_DEFS } from '../../buildings/definitions.js';
import { TECHS } from '../../sim/research.js';
import { messages, buildingTranslations, techTranslations } from './zh-TW.js';

export const LOCALE_KEY = 'lr-ui-locale';
export const DEFAULT_LOCALE = 'zh-TW';
export const SUPPORTED_LOCALES = ['zh-TW', 'en'];
let locale = DEFAULT_LOCALE;
const catalog = { ...messages };
for (const [defs, translations] of [[BUILDING_DEFS, buildingTranslations], [TECHS, techTranslations]]) {
  for (const [id, [name, desc]] of Object.entries(translations)) {
    catalog[defs[id].name] = name;
    catalog[defs[id].desc] = desc;
  }
}
const escape = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const numericFields = new Set(['day', 'seconds', 'count', 'nights', 'record', 'slot', 'step', 'total', 'bonus', 'range', 'damage', 'level', 'id', 'seed', 'dps', 'base']);
const patterns = Object.keys(catalog).filter(key => /\{\w+\}/.test(key))
  .sort((a, b) => b.replace(/\{\w+\}/g, '').length - a.replace(/\{\w+\}/g, '').length).map(key => {
  const names = [...key.matchAll(/\{(\w+)\}/g)].map(match => match[1]);
  const parts = key.split(/\{\w+\}/);
  const expression = parts.map((part, index) => escape(part) + (index < names.length
    ? numericFields.has(names[index]) ? '(-?\\d+(?:\\.\\d+)?)' : '(.+?)' : '')).join('');
  return { key, names, regex: new RegExp('^' + expression + '$', 'u') };
});

export function getLocale() { return locale; }
export function setLocale(next) {
  locale = SUPPORTED_LOCALES.includes(next) ? next : DEFAULT_LOCALE;
  return locale;
}
export function hasTranslation(message) { return Object.hasOwn(catalog, message); }
const format = (message, values) => message.replace(/\{(\w+)\}/g,
  (token, key) => Object.hasOwn(values, key) ? String(values[key]) : token);

// Exact messages and explicitly registered templates only; never rewrite game
// objects, identifiers, HTML, or arbitrary substrings in diagnostic text.
function translate(message, values, depth) {
  if (message == null) return '';
  const source = String(message);
  if (locale === 'en') return format(source, values);
  if (Object.hasOwn(catalog, source)) return format(catalog[source], values);
  if (depth < 4 && /[A-Za-z]/.test(source)) {
    for (const { key, names, regex } of patterns) {
      const match = regex.exec(source);
      if (!match) continue;
      const captures = Object.fromEntries(names.map((name, index) =>
        [name, translate(match[index + 1], {}, depth + 1)]));
      return format(catalog[key], captures);
    }
  }
  return format(source, values); // deterministic English fallback for missing messages
}
export function t(message, values = {}) { return translate(message, values, 0); }

/** Resolve ?lang= before preference. Only the dedicated UI key may be written. */
export function initializeLocale(search = '', storage) {
  let saved;
  try { storage ??= globalThis.localStorage; saved = storage?.getItem(LOCALE_KEY); } catch { /* optional preference */ }
  const requested = new URLSearchParams(search).get('lang');
  const chosen = SUPPORTED_LOCALES.includes(requested) ? requested
    : SUPPORTED_LOCALES.includes(saved) ? saved : DEFAULT_LOCALE;
  setLocale(chosen);
  if (SUPPORTED_LOCALES.includes(requested) && saved !== chosen) {
    try { storage?.setItem(LOCALE_KEY, chosen); } catch { /* quota must not stop gameplay */ }
  }
  return chosen;
}
