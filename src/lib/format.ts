import type { Lang } from '../i18n/strings';

const TZ = 'Asia/Bangkok';
// Thai months with the Gregorian calendar (not Buddhist era), to match the English view.
const loc = (lang: Lang) => (lang === 'th' ? 'th-TH-u-ca-gregory' : 'en-GB');

export function fmtReceived(iso: string, lang: Lang = 'en'): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString(loc(lang), { day: 'numeric', month: 'short', timeZone: TZ });
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: TZ });
  return `${date} · ${time}`;
}

export function fmtLong(iso: string, lang: Lang = 'en'): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString(loc(lang), { day: 'numeric', month: 'short', year: 'numeric', timeZone: TZ });
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: TZ });
  return `${date}, ${time}`;
}

export const fmtTHB = (n: number) => `฿${n.toLocaleString('en-US')}`;

export const fmtSize = (kb: number) => (kb >= 1000 ? `${(kb / 1000).toFixed(1)} MB` : `${kb} KB`);
