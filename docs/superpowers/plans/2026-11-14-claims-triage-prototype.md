# AI Claims Triage Console — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A local, clickable claims-triage dashboard prototype: staged AI priority scores, filters, a slide-over claim panel with approve/edit/reject, and an audit log.

**Architecture:** A single-page React app. Synthetic claims live in one TS data file. Pure functions in `src/lib/queue.ts` do the filtering, sorting and counts. One `useReducer` store holds claim statuses and the audit log. Page switching is a `page` state value in `App` (no router).

**Tech Stack:** Vite 5, React 18, TypeScript, Tailwind CSS 3, lucide-react (icons), Vitest (logic tests). Inter via Google Fonts.

**Spec:** `docs/superpowers/specs/2026-11-14-claims-triage-prototype-design.md`

## Global Constraints

- Runs locally with `npm run dev`. No network calls at runtime other than the Google Fonts stylesheet, with a system-ui fallback.
- All data is synthetic. Show the TLIFE name as text only; no logo.
- Score colours: red ≥ 70 (High), amber 40–69 (Medium), green < 40 (Low).
- Low-confidence threshold: confidence < 60 → "AI unsure — needs officer judgement" banner.
- Panel width about 40% of the viewport (min 480px), sliding in from the right over a dimmed list. Esc and ✕ close it.
- State is in memory only, so a refresh resets the demo.
- English UI. "today" for date filters is fixed at `2026-11-14` (`DEMO_NOW`) so the demo is stable.
- The folder is not a git repo, and the user hasn't asked for commits, so there are no commit steps.

## Review Focus

1. Filters that match nothing → show an empty state ("No claims match these filters" + Clear filters), not a blank table.
2. Approving the last claim in the filtered list → the panel must not crash. It should close, or stay on the claim if no next claim exists.
3. A claim that drops out of the current filter after an action (e.g. Status filter = "AI suggested", then you approve it) → next/prev still works, and the panel shows the updated claim.
4. Reject with an empty reason → Confirm is disabled.
5. Search with mixed case or a partial policy number → case-insensitive substring match on id, client and policyNo.

---

## File Structure

```
package.json, vite.config.ts, tsconfig.json, tailwind.config.js, postcss.config.js, index.html
src/main.tsx                     – mount
src/index.css                    – tailwind layers + Inter
src/App.tsx                      – shell layout, page switch, drawer + toast wiring
src/types.ts                     – Claim, Filters, AuditEntry, Status, Priority…
src/data/claims.ts               – CLAIMS: Claim[] (24), ROUTES: string[], DEMO_NOW
src/lib/queue.ts                 – pure: priorityOf, filterClaims, sortClaims, tabCounts, kpis
src/lib/queue.test.ts
src/state/store.ts               – reducer + useClaimsStore()
src/state/store.test.ts
src/components/Sidebar.tsx
src/components/TopBar.tsx
src/components/KpiCards.tsx
src/components/FilterBar.tsx     – tabs + dropdown filters + sort
src/components/ClaimsTable.tsx
src/components/ClaimDrawer.tsx   – slide-over panel incl. edit/reject sub-forms
src/components/FilePreview.tsx   – placeholder doc preview inside drawer
src/components/Toast.tsx
src/components/ui.tsx            – ScoreBadge, Tag, StatusPill, ScoreRing
src/pages/TriagePage.tsx
src/pages/AuditLogPage.tsx
src/pages/PlaceholderPage.tsx
```

---

### Task 1: Scaffold, types, synthetic data

**Files:** Create the config files, `src/main.tsx`, `src/index.css`, `src/types.ts` and `src/data/claims.ts`.

**Interfaces — Produces (`src/types.ts`):**
```ts
export type Priority = 'high' | 'medium' | 'low';
export type Status = 'ai_suggested' | 'approved' | 'edited' | 'rejected';
export type Channel = 'LINE' | 'Branch' | 'Agent' | 'Call centre' | 'Email' | 'Online';
export type Category = 'Life' | 'Death' | 'Hospital' | 'ICU' | 'OPD' | 'Critical illness' | 'Accident' | 'Missing doc';
export interface Factor { label: string; points: number }
export interface ClaimFile { name: string; kind: 'pdf' | 'image'; sizeKb: number }
export interface Claim {
  id: string; client: string; policyNo: string; receivedAt: string /* ISO */;
  channel: Channel; tags: Category[]; amount: number /* THB */;
  description: string; files: ClaimFile[];
  aiScore: number; confidence: number; factors: Factor[];
  suggestedRoute: string; status: Status;
  finalRoute?: string; rejectReason?: string;
}
export type DateRange = 'today' | '7d' | '30d' | 'all';
export type Tab = 'all' | Priority | 'missing';
export type SortKey = 'score' | 'received';
export interface Filters { tab: Tab; categories: Category[]; channel: Channel | 'all'; range: DateRange; status: Status | 'all'; search: string; sort: SortKey }
export interface AuditEntry { at: string; claimId: string; client: string; aiScore: number; aiRoute: string; action: 'approved' | 'edited' | 'rejected'; finalRoute?: string; reason?: string; officer: string }
```
`src/data/claims.ts` exports `DEMO_NOW = '2026-11-14T10:00:00+07:00'`, `ROUTES: string[]` (Fast-track auto-pay, Standard assessor — Health, Senior adjuster — Health, Senior adjuster — Death claims, Investigation unit, Request missing documents) and `CLAIMS: Claim[]`.

- [ ] **Step 1:** `npm create vite@5 . -- --template react-ts`, then `npm i lucide-react` and `npm i -D tailwindcss@3 postcss autoprefixer vitest@2`. Run `npx tailwindcss init -p`, set content globs, and add a `"test": "vitest run"` script.
- [ ] **Step 2:** Write `types.ts` exactly as above.
- [ ] **Step 3:** Write 24 claims. Mix: 6 high (≥ 70), 9 medium, 9 low. 3 claims tagged `Missing doc` with route "Request missing documents". 3 claims with confidence < 60. Received dates span 2026-10-20 to 2026-11-14, with at least 5 on 11-14. All 6 channels used. Factors sum to aiScore, 2–4 per claim. All claims start as `ai_suggested` except 3 low claims already `approved`. Use the descriptions and names from the mockups for the first five (Somchai P. 92 Death, Nattaya K. 81 ICU, Arthit S. 58 Hospital, Kanya R. 44 Missing doc, Pimchanok W. 21 OPD).
- [ ] **Step 4:** `npm run build` → succeeds.

### Task 2: Queue logic (TDD)

**Files:** Create `src/lib/queue.ts` and `src/lib/queue.test.ts`.

**Interfaces — Produces:**
```ts
priorityOf(score: number): Priority
filterClaims(claims: Claim[], f: Filters, now?: string): Claim[]
sortClaims(claims: Claim[], key: SortKey): Claim[]          // returns new array
tabCounts(claims: Claim[]): Record<Tab, number>             // counts over all claims, ignoring filters
kpis(claims: Claim[]): { waiting: number; highWaiting: number; fastTracked: number }
DEFAULT_FILTERS: Filters  // tab 'all', categories [], channel 'all', range 'all', status 'all', search '', sort 'score'
```
Rules: `tab: 'missing'` = tags include 'Missing doc'. An empty `categories` array means any category; otherwise the claim must have at least one of them. `range` is measured back from `now` (default `DEMO_NOW`): today = same calendar day in +07:00. waiting = status `ai_suggested`. fastTracked = status approved/edited with final route "Fast-track auto-pay".

- [ ] **Step 1: Failing tests**
```ts
expect(priorityOf(70)).toBe('high'); expect(priorityOf(69)).toBe('medium');
expect(priorityOf(40)).toBe('medium'); expect(priorityOf(39)).toBe('low');
filterClaims(CLAIMS, {...DEFAULT_FILTERS, tab:'high'}).every(c => c.aiScore >= 70) === true
filterClaims(CLAIMS, {...DEFAULT_FILTERS, search:'somCHAI'}).map(c=>c.client) contains 'Somchai P.'
filterClaims(CLAIMS, {...DEFAULT_FILTERS, search: CLAIMS[0].policyNo.slice(-4)}).length >= 1
filterClaims(CLAIMS, {...DEFAULT_FILTERS, range:'today'}).every(c => c.receivedAt.startsWith('2026-11-14'))
filterClaims(CLAIMS, {...DEFAULT_FILTERS, categories:['OPD','ICU']}).every(c => c.tags.some(t => t==='OPD'||t==='ICU'))
filterClaims(CLAIMS, {...DEFAULT_FILTERS, search:'zzzz'}) toEqual []
sortClaims(CLAIMS,'score') is non-increasing in aiScore; sortClaims(CLAIMS,'received') is non-increasing in receivedAt
tabCounts(CLAIMS) → all 24, high 6, medium 9, low 9, missing 3
kpis(CLAIMS).waiting === 21
```
- [ ] **Step 2:** `npm test` → FAIL (module missing).
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** `npm test` → PASS.

### Task 3: Store (TDD)

**Files:** Create `src/state/store.ts` and `src/state/store.test.ts`.

**Interfaces — Produces:**
```ts
type Action =
  | { type: 'approve'; id: string; at: string }
  | { type: 'edit'; id: string; route: string; at: string }
  | { type: 'reject'; id: string; reason: string; at: string };
interface State { claims: Claim[]; audit: AuditEntry[] }  // audit newest first
reducer(s: State, a: Action): State
initialState(): State   // structuredClone(CLAIMS), audit []
useClaimsStore(): { state: State; approve(id): void; edit(id, route): void; reject(id, reason): void }  // fills `at` with new Date().toISOString()
OFFICER = 'Ratchapon N.'
```
approve → status `approved`, finalRoute = suggestedRoute. edit → `edited`, finalRoute = route. reject → `rejected`, rejectReason = reason. Each action prepends one AuditEntry. An unknown id returns the state unchanged.

- [ ] **Step 1: Failing tests:** approve sets the status and finalRoute and adds 1 audit entry with action 'approved' and aiRoute = suggestedRoute. edit stores the route. reject stores the reason. Two actions → audit[0] is the latest. Unknown id → `toBe(s)` (same reference).
- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** `npm test` → PASS.

### Task 4: Shell — Sidebar, TopBar, page switch, placeholder & audit pages

**Files:** Create `ui.tsx`, `Sidebar.tsx`, `TopBar.tsx`, `pages/PlaceholderPage.tsx` and `pages/AuditLogPage.tsx`. Write `App.tsx`.

**Interfaces:**
- `type Page = 'overview' | 'triage' | 'mine' | 'investigations' | 'completed' | 'performance' | 'audit' | 'rules'`
- `<Sidebar page={Page} onNavigate={(p: Page) => void} triageCount={number} />`. The triage badge = `kpis().waiting`.
- `<TopBar title={string} search={string} onSearch={(s: string) => void} />`. Search is shown only on the triage page.
- `<AuditLogPage entries={AuditEntry[]} />`: table with Time, Claim, Client, AI score, AI route, Decision, Final route / reason. Empty state: "No decisions yet. Approve, edit or reject a claim in the Triage queue."
- `<PlaceholderPage name={string} />`: "Not part of this prototype" + a button back to the Triage queue.
- `ui.tsx`: `ScoreBadge({score})`, `ScoreRing({score})`, `Tag({label})` (colour per category), `StatusPill({status})`.

Visual: sidebar `bg-slate-900`, 232px wide, groups as in the spec, active item with a blue left bar. Main area `bg-slate-50`. Top bar white with a bottom border and "AI model: Triage v0.3 · demo data".

- [ ] **Step 1:** Implement. The App holds `page` and the store, and renders the TriagePage slot (a stub for now).
- [ ] **Step 2:** `npm run dev`, open it in the browser pane, click each sidebar item → the correct page or placeholder shows, and the active state moves.

### Task 5: Triage page — KPIs, filter bar, table

**Files:** Create `KpiCards.tsx`, `FilterBar.tsx`, `ClaimsTable.tsx` and `pages/TriagePage.tsx`.

**Interfaces:**
- `<KpiCards claims={Claim[]} />`: Waiting for review (`waiting`, sub "N high priority"), Fast-tracked today (`fastTracked`, sub "of simple claims"), Avg triage time "3m 40s" (sub "▼ from 15m baseline", staged), AI fix rate (staged "9%", sub "officer overrides this week").
- `<FilterBar filters={Filters} counts={Record<Tab,number>} onChange={(f: Filters) => void} />`: tabs (All / 🔴 High / 🟡 Medium / 🟢 Low / ⚠️ Missing docs, with counts), a Category multi-select popover with checkboxes, Channel, Received, and Status selects, a Sort select, and "Clear filters" when the filters differ from the defaults.
- `<ClaimsTable claims={Claim[]} selectedId={string|null} onOpen={(id) => void} onClear={() => void} />`: columns as in the spec, row hover, the selected row highlighted, and the empty state from Review Focus 1. Received is formatted `14 Nov · 09:12` in Asia/Bangkok.
- `TriagePage` owns `filters` (search comes from App) and `openId`, and computes `visible = sortClaims(filterClaims(...))`.

- [ ] **Step 1:** Implement.
- [ ] **Step 2:** In the browser: each tab narrows the list and its count matches. A category plus channel combination filters. Search "kanya" → 1 row. Search "zzz" → empty state, and Clear restores the list. The sort toggle reorders.

### Task 6: Slide-over panel, file preview, actions, toast

**Files:** Create `ClaimDrawer.tsx`, `FilePreview.tsx` and `Toast.tsx`. Modify `TriagePage.tsx`.

**Interfaces:**
- `<ClaimDrawer claim={Claim} index={number} total={number} onPrev onNext onClose onApprove={() => void} onEdit={(route: string) => void} onReject={(reason: string) => void} />`
- `<FilePreview file={ClaimFile} claim={Claim} onBack={() => void} />`: a fake page (grey header bar, claim id, client, placeholder lines).
- `<Toast message={string|null} />`: auto-hides after 2.5s.

Behaviour:
- Backdrop `bg-slate-900/40` fades in. The panel `translate-x-full → 0` over 250ms ease-out, and clicking the backdrop closes it. Esc closes it. ←/→ keys move to the previous/next claim when focus isn't in an input.
- The panel is built from the spec's sections. Low-confidence banner (amber) when confidence < 60. Factors are drawn as bars scaled to the largest factor.
- If the status isn't `ai_suggested`, the footer shows the decision (e.g. "Approved → Senior adjuster — Death claims") in place of the buttons.
- Edit route: an inline select of ROUTES (default = suggestedRoute) + Confirm/Cancel.
- Reject: an inline textarea; Confirm is disabled while it's empty after trim.
- After any action: a toast ("Claim CLM-10482 approved"), then move to the next claim in the `visible` list captured *before* the action. If there's no next claim, close the panel. The panel reads the claim by id from the store, so it always shows the updated status (Review Focus 2 and 3).

- [ ] **Step 1:** Implement.
- [ ] **Step 2:** In the browser: open Somchai → the panel slides in with score 92 and 3 files, View → preview, Back. Approve → toast, the panel moves to Nattaya, and the Waiting KPI drops by 1. Reject with an empty reason → Confirm disabled. Edit → choose Fast-track → the Fast-tracked KPI rises. Esc closes the panel. Open the Audit log → 3 entries, newest first. Approve the last row of a filtered list → the panel closes without errors (check the console).
- [ ] **Step 3:** `npm test` and `npm run build` both pass.

---

## Self-review notes

- Spec coverage: shell (T4), KPIs, tabs, filters, search and sort (T5), panel with reasoning, route, files, actions and low-confidence banner (T6), synthetic data (T1), audit log (T3/T4), placeholder pages (T4). Bulk-action checkboxes are visual only (T5 table).
- Undo isn't in the spec and is excluded.
