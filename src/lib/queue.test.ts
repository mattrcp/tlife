import { describe, it, expect } from 'vitest';
import { CLAIMS } from '../data/claims';
import { priorityOf, filterClaims, sortClaims, tabCounts, kpis, DEFAULT_FILTERS } from './queue';

const F = DEFAULT_FILTERS;

describe('data integrity', () => {
  it('has 24 claims whose factors sum to the AI score', () => {
    expect(CLAIMS).toHaveLength(24);
    for (const c of CLAIMS) expect(c.factors.reduce((s, f) => s + f.points, 0)).toBe(c.aiScore);
  });
});

describe('priorityOf', () => {
  it('uses 70 / 40 thresholds', () => {
    expect(priorityOf(70)).toBe('high');
    expect(priorityOf(69)).toBe('medium');
    expect(priorityOf(40)).toBe('medium');
    expect(priorityOf(39)).toBe('low');
  });
});

describe('filterClaims', () => {
  it('filters by tab', () => {
    const r = filterClaims(CLAIMS, { ...F, tab: 'high' });
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((c) => c.aiScore >= 70)).toBe(true);
  });
  it('search is case-insensitive on client', () => {
    expect(filterClaims(CLAIMS, { ...F, search: 'somCHAI' }).map((c) => c.client)).toContain('Somchai Phongsri');
  });
  it('search matches partial policy number and claim id', () => {
    expect(filterClaims(CLAIMS, { ...F, search: CLAIMS[0].policyNo.slice(-4) }).length).toBeGreaterThanOrEqual(1);
    expect(filterClaims(CLAIMS, { ...F, search: 'clm-10474' }).map((c) => c.id)).toEqual(['CLM-10474']);
  });
  it('range today keeps only 14 Nov claims', () => {
    const r = filterClaims(CLAIMS, { ...F, range: 'today' });
    expect(r.length).toBe(5);
    expect(r.every((c) => c.receivedAt.startsWith('2026-11-14'))).toBe(true);
  });
  it('categories match any selected', () => {
    const r = filterClaims(CLAIMS, { ...F, categories: ['OPD', 'ICU'] });
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((c) => c.tags.some((t) => t === 'OPD' || t === 'ICU'))).toBe(true);
  });
  it('no match gives empty list', () => {
    expect(filterClaims(CLAIMS, { ...F, search: 'zzzz' })).toEqual([]);
  });
});

describe('sortClaims', () => {
  it('sorts by score desc and received desc without mutating', () => {
    const s = sortClaims(CLAIMS, 'score');
    for (let i = 1; i < s.length; i++) expect(s[i - 1].aiScore).toBeGreaterThanOrEqual(s[i].aiScore);
    const r = sortClaims(CLAIMS, 'received');
    for (let i = 1; i < r.length; i++) expect(r[i - 1].receivedAt >= r[i].receivedAt).toBe(true);
    expect(s).not.toBe(CLAIMS);
  });
});

describe('counts and kpis', () => {
  it('tab counts', () => {
    expect(tabCounts(CLAIMS)).toEqual({ all: 24, high: 6, medium: 9, low: 9, missing: 3 });
  });
  it('kpis', () => {
    expect(kpis(CLAIMS)).toEqual({ waiting: 21, highWaiting: 6, fastTracked: 3 });
  });
});
