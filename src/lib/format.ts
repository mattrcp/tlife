const TZ = 'Asia/Bangkok';

export function fmtReceived(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: TZ });
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: TZ });
  return `${date} · ${time}`;
}

export function fmtLong(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: TZ });
}

export const fmtTHB = (n: number) => `฿${n.toLocaleString('en-US')}`;

export const fmtSize = (kb: number) => (kb >= 1000 ? `${(kb / 1000).toFixed(1)} MB` : `${kb} KB`);
