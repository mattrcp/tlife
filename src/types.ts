export type Priority = 'high' | 'medium' | 'low';
export type Status = 'ai_suggested' | 'approved' | 'edited' | 'rejected';
export type Hospital = string;
export type Category = 'Life' | 'Death' | 'Hospital' | 'ICU' | 'OPD' | 'Critical illness' | 'Accident' | 'Missing doc';
export interface Factor { label: string; points: number }
export interface ClaimFile { name: string; kind: 'pdf' | 'image'; sizeKb: number }
export interface Claim {
  id: string; client: string; policyNo: string; receivedAt: string;
  hospital: Hospital; tags: Category[]; amount: number;
  description: string; files: ClaimFile[];
  aiScore: number; confidence: number; factors: Factor[];
  suggestedRoute: string; status: Status;
  finalRoute?: string; rejectReason?: string;
}
export type DateRange = 'today' | '7d' | '30d' | 'all';
export type Tab = 'all' | Priority | 'missing';
export type SortKey = 'score' | 'received';
export interface Filters { tab: Tab; categories: Category[]; hospital: Hospital | 'all'; range: DateRange; status: Status | 'all'; search: string; sort: SortKey }
export interface AuditEntry { at: string; claimId: string; client: string; aiScore: number; aiRoute: string; action: 'approved' | 'edited' | 'rejected'; finalRoute?: string; reason?: string; officer: string }
