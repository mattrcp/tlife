import { describe, it, expect } from 'vitest';
import { reducer, initialState } from './store';

const AT = '2026-11-14T03:00:00.000Z';

describe('reducer', () => {
  it('approve sets status, final route and logs', () => {
    const s = reducer(initialState(), { type: 'approve', id: 'CLM-10482', at: AT });
    const c = s.claims.find((x) => x.id === 'CLM-10482')!;
    expect(c.status).toBe('approved');
    expect(c.finalRoute).toBe('Senior adjuster — Death claims');
    expect(s.audit).toHaveLength(1);
    expect(s.audit[0]).toMatchObject({ action: 'approved', claimId: 'CLM-10482', aiRoute: 'Senior adjuster — Death claims', aiScore: 92, officer: 'Ratchapon N.' });
  });
  it('edit stores the chosen route', () => {
    const s = reducer(initialState(), { type: 'edit', id: 'CLM-10476', route: 'Fast-track auto-pay', at: AT });
    const c = s.claims.find((x) => x.id === 'CLM-10476')!;
    expect(c.status).toBe('edited');
    expect(c.finalRoute).toBe('Fast-track auto-pay');
    expect(s.audit[0]).toMatchObject({ action: 'edited', finalRoute: 'Fast-track auto-pay' });
  });
  it('reject stores the reason', () => {
    const s = reducer(initialState(), { type: 'reject', id: 'CLM-10474', reason: 'Not covered', at: AT });
    const c = s.claims.find((x) => x.id === 'CLM-10474')!;
    expect(c.status).toBe('rejected');
    expect(c.rejectReason).toBe('Not covered');
    expect(s.audit[0]).toMatchObject({ action: 'rejected', reason: 'Not covered' });
  });
  it('audit is newest first', () => {
    let s = reducer(initialState(), { type: 'approve', id: 'CLM-10482', at: AT });
    s = reducer(s, { type: 'approve', id: 'CLM-10479', at: AT });
    expect(s.audit.map((a) => a.claimId)).toEqual(['CLM-10479', 'CLM-10482']);
  });
  it('unknown id returns same state', () => {
    const s = initialState();
    expect(reducer(s, { type: 'approve', id: 'NOPE', at: AT })).toBe(s);
  });
  it('initialState does not share objects with seed data', () => {
    const a = initialState();
    reducer(a, { type: 'approve', id: 'CLM-10482', at: AT });
    expect(initialState().claims.find((x) => x.id === 'CLM-10482')!.status).toBe('ai_suggested');
  });
});
