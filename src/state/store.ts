import { useCallback, useReducer } from 'react';
import type { AuditEntry, Claim } from '../types';
import { CLAIMS } from '../data/claims';

export const OFFICER = 'Ratchapon N.';

export type Action =
  | { type: 'approve'; id: string; at: string }
  | { type: 'edit'; id: string; route: string; at: string }
  | { type: 'reject'; id: string; reason: string; at: string };

export interface State { claims: Claim[]; audit: AuditEntry[] }

export const initialState = (): State => ({ claims: structuredClone(CLAIMS), audit: [] });

export function reducer(s: State, a: Action): State {
  const c = s.claims.find((x) => x.id === a.id);
  if (!c) return s;
  const next: Claim =
    a.type === 'approve' ? { ...c, status: 'approved', finalRoute: c.suggestedRoute }
    : a.type === 'edit' ? { ...c, status: 'edited', finalRoute: a.route }
    : { ...c, status: 'rejected', rejectReason: a.reason };
  const entry: AuditEntry = {
    at: a.at, claimId: c.id, client: c.client, aiScore: c.aiScore, aiRoute: c.suggestedRoute,
    action: a.type === 'approve' ? 'approved' : a.type === 'edit' ? 'edited' : 'rejected',
    finalRoute: next.finalRoute, reason: next.rejectReason, officer: OFFICER,
  };
  return { claims: s.claims.map((x) => (x.id === a.id ? next : x)), audit: [entry, ...s.audit] };
}

export function useClaimsStore() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const now = () => new Date().toISOString();
  return {
    state,
    approve: useCallback((id: string) => dispatch({ type: 'approve', id, at: now() }), []),
    edit: useCallback((id: string, route: string) => dispatch({ type: 'edit', id, route, at: now() }), []),
    reject: useCallback((id: string, reason: string) => dispatch({ type: 'reject', id, reason, at: now() }), []),
  };
}
