# AI Claims Triage Console — Prototype Design

Date: 2026-11-14
Source PRD: Notion, "AI Claims Triage: Product Requirements Brief (TLIFE Interview Case)"

## Intent

An interactive, clickable prototype for a job interview (AI Workflow & Automation Designer, TLIFE). It shows how AI can pre-sort incoming life/health insurance claims by priority while a human claims officer stays in control (approve / edit / reject). The goal is to make the idea tangible and believable for an interviewer, not to build a production system.

## Goals

- Look and feel like a real insurance claims dashboard: sidebar, top bar, KPI cards, filters, claims list.
- Let the officer see each claim's **AI priority score**, client name, date and time received, category tags (Hospital, Life, OPD, Death, ICU, Missing doc…), description, and files.
- Clicking a claim opens a **slide-over panel from the right** with full details, the AI's reasoning and confidence, the suggested route, files, and Approve / Edit route / Reject.
- Interactions really work: filtering, tabs, search, sorting, opening and closing the panel, moving to the previous or next claim, and approve/edit/reject changing the claim's status and the KPIs.

## Non-goals

- No real AI or LLM call. AI output is **staged**: pre-written in the synthetic data.
- No backend, auth, real customer data, or deployment. It runs locally on the presenter's machine.
- Other sidebar pages are not built beyond what's listed below.

## Anti-goals (a failure even if it works)

- Looks like a generic template or toy, and loses the "real insurance tool" credibility.
- Hides why the AI scored something. The reasoning must be visible: it's the core of the pitch.
- Implies full automation. The human decision must always be explicit.

## Constraints

- Runs on the presenter's Mac (Node 22 is available). It has to be reliable during a live demo, with no network dependency.
- Uses only synthetic data, as the PRD requires: names, amounts and policies are made up.
- Shows the TLIFE name as plain text only, not a copied logo.

## Approaches considered

1. **Vite + React + TypeScript + Tailwind (picked).** Component state makes filters, the panel and status changes easy. It runs locally with `npm run dev`, and it looks like a real product build, which helps in a design interview.
2. **Single HTML file + vanilla JS.** Zero setup, but filters, the panel and state handling become messy quickly, and it's harder to polish.
3. **Next.js.** It adds routing and server features this prototype doesn't need.

The user handed over the "how". Approach 1 is my call.

## Design (decided with the user)

### App shell
- **Sidebar (dark):** TLIFE / Claims Workspace; Overview, **Triage queue** (count badge), My claims, Investigations, Completed. Insights section: Performance, Audit log. Admin section: AI rules & thresholds. Current user at the bottom (Ratchapon N., Claims officer).
- **Top bar:** breadcrumb, search (claim ID, client, policy no.), "AI model: Triage v0.3 · demo data" label, notifications icon, language chip.

### Triage queue page
- **KPI cards (4):** Waiting for review, Fast-tracked today, Avg triage time (vs 15-minute baseline), AI fix rate. "Waiting" and "Fast-tracked" update when the officer acts. The other two are staged numbers.
- **Priority tabs:** All / High / Medium / Low / Missing docs, each with a count.
- **Filters:** Category (multi-select), Channel (LINE, Branch, Agent, Call centre, Email, Online), Received date range (Today / 7 days / 30 days), Status (AI suggested / Approved / Edited / Rejected), plus sort (AI score ↓ by default, or Received newest).
- **Search** filters the list live.
- **List columns:** checkbox, Score (colored: red ≥ 70, amber 40–69, green < 40), Client, Received (date · time), Tags, Description (truncated), Files count, Status.

### Slide-over panel (from the right, about 40% wide, over a dimmed list)
- Header: claim ID, previous/next arrows ("1 of 24"), close button (✕ or Esc). Score ring, client full name, received date and time, channel, tags.
- Description (full text).
- "Why the AI scored N": confidence %, plus 2–4 factors with point contributions and bars.
- Suggested route (team / adjuster plus any flag).
- Files list (name, type icon, View).
- Footer actions: **Reject** (asks for a reason), **Edit route** (choose a different route or priority), **Approve route**. Acting updates the status, shows a toast, and moves to the next claim.
- Low-confidence claims (< 60%) show an "AI unsure — needs officer judgement" banner. This demonstrates the escalation control from the PRD.

### Data
- About 24 synthetic claims in a local TS file: a mix of Life/death, Hospital (IPD/ICU), OPD, Critical illness, and Missing-doc cases. Thai-style synthetic names, amounts in ฿, dates around 10–14 Nov 2026.
- Each claim: id, client, policyNo, receivedAt, channel, category tags, description, files[], aiScore, priority, confidence, factors[], suggestedRoute, status.
- State lives in memory and resets on refresh, which is good for repeat demos.

## My calls (please check)

- **Other sidebar pages:** they show a simple "Not part of this prototype" placeholder. **Audit log** is the exception: a simple table of every action taken this session (time, claim, AI suggestion, officer decision). It's cheap once actions exist, and it backs the governance story.
- **File "View":** opens a placeholder document preview inside the panel. There are no real PDFs.
- **Visual style:** clean, light main area, dark navy sidebar, blue primary color. Sans-serif (Inter).
- **Language:** English UI, with Thai names in the data.
- **Bulk actions:** checkboxes are shown but are visual only.

## Left to the builder

Component breakdown, exact spacing and colors, animation timing for the panel, toast library choice, and wording of the synthetic claims.
