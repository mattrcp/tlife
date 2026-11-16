import type { Claim } from '../types';
import { HOSPITAL_CONTACTS } from '../data/claims';
import { LOW_CONFIDENCE } from './queue';

export interface HospitalContact { name: string; coordinator: string; phone: string; email: string; patientRef: string }
export interface ClaimantContact { role: 'Policyholder' | 'Beneficiary'; name: string; phone: string }

/** Deterministic synthetic Thai mobile, stable per seed so it doesn't change between renders. */
function genPhone(seed: string): string {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const n = (h % 100_000_000).toString().padStart(8, '0');
  return `0${8 + (h % 2)}${n.slice(0, 1)}-${n.slice(1, 4)}-${n.slice(4, 8)}`;
}

export function hospitalContact(c: Claim): HospitalContact {
  const d = HOSPITAL_CONTACTS[c.hospital] ?? { coordinator: 'Claims desk', phone: '02-000-0000', email: 'claims@hospital.demo' };
  const ref = (Math.abs([...c.id].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) | 0, 7)) % 1_000_000).toString().padStart(6, '0');
  return { name: c.hospital, patientRef: `HN-${ref}`, ...d };
}

export function claimantContact(c: Claim): ClaimantContact {
  const isDeath = c.tags.includes('Death');
  return {
    role: isDeath ? 'Beneficiary' : 'Policyholder',
    name: isDeath ? 'Beneficiary on file' : c.client,
    phone: genPhone(c.policyNo),
  };
}

/** True when the AI found something worth confirming with the source before deciding. */
export function needsVerify(c: Claim): boolean {
  return c.confidence < LOW_CONFIDENCE || c.factors.some((f) => /mismatch|missing|unreadable|non-disclosure|unsigned/i.test(f.label));
}
