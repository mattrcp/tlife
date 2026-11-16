import type { Claim, Filters, Priority, SortKey, Tab } from '../types';
import { DEMO_NOW } from '../data/claims';

export const DEFAULT_FILTERS: Filters = {
  tab: 'all', categories: [], hospital: 'all', range: 'all', status: 'all', search: '', sort: 'score',
};

export const LOW_CONFIDENCE = 60;
export const FAST_TRACK = 'Fast-track auto-pay';

export function priorityOf(score: number): Priority {
  return score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low';
}

const DAY = 86_400_000;
/** Calendar date (YYYY-MM-DD) in Bangkok time. */
const bkkDate = (iso: string) => new Date(new Date(iso).getTime() + 7 * 3_600_000).toISOString().slice(0, 10);

function inRange(c: Claim, range: Filters['range'], now: string): boolean {
  if (range === 'all') return true;
  if (range === 'today') return bkkDate(c.receivedAt) === bkkDate(now);
  const days = range === '7d' ? 7 : 30;
  return new Date(now).getTime() - new Date(c.receivedAt).getTime() <= days * DAY;
}

function inTab(c: Claim, tab: Tab): boolean {
  if (tab === 'all') return true;
  if (tab === 'missing') return c.tags.includes('Missing doc');
  return priorityOf(c.aiScore) === tab;
}

export function filterClaims(claims: Claim[], f: Filters, now: string = DEMO_NOW): Claim[] {
  const q = f.search.trim().toLowerCase();
  return claims.filter(
    (c) =>
      inTab(c, f.tab) &&
      (f.categories.length === 0 || c.tags.some((t) => f.categories.includes(t))) &&
      (f.hospital === 'all' || c.hospital === f.hospital) &&
      (f.status === 'all' || c.status === f.status) &&
      inRange(c, f.range, now) &&
      (!q || [c.id, c.client, c.policyNo].some((v) => v.toLowerCase().includes(q))),
  );
}

export function sortClaims(claims: Claim[], key: SortKey): Claim[] {
  const byReceived = (a: Claim, b: Claim) => b.receivedAt.localeCompare(a.receivedAt);
  return [...claims].sort(key === 'score' ? (a, b) => b.aiScore - a.aiScore || byReceived(a, b) : byReceived);
}

export function tabCounts(claims: Claim[]): Record<Tab, number> {
  const tabs: Tab[] = ['all', 'high', 'medium', 'low', 'missing'];
  return Object.fromEntries(tabs.map((t) => [t, claims.filter((c) => inTab(c, t)).length])) as Record<Tab, number>;
}

export function kpis(claims: Claim[]) {
  const waiting = claims.filter((c) => c.status === 'ai_suggested');
  return {
    waiting: waiting.length,
    highWaiting: waiting.filter((c) => priorityOf(c.aiScore) === 'high').length,
    fastTracked: claims.filter((c) => (c.status === 'approved' || c.status === 'edited') && c.finalRoute === FAST_TRACK).length,
  };
}

export const isDefaultFilters = (f: Filters) =>
  f.tab === 'all' && f.categories.length === 0 && f.hospital === 'all' && f.range === 'all' && f.status === 'all' && f.sort === 'score';
