# AI Claims Triage — what the prototype can do

A clickable prototype of a claims officer's console for a life & health insurer (TLIFE). Claims arrive from partner hospitals via direct-billing, the AI scores and routes each one, and the officer stays the decision-maker. All data is synthetic and the AI output is staged (pre-computed).

**Run it:** `npm install` then `npm run dev`, and open http://localhost:5173. Refreshing the page resets the demo.

---

## The dashboard (Triage queue)

- **Claims list sorted by AI priority score.** Each row shows the score (red = high, amber = medium, green = low), the client, the date and time received, category tags (Life, Death, Hospital, ICU, OPD, Critical illness, Accident, Missing doc), a short description, the file count, and a status.
- **KPI cards** at the top: claims waiting for review, claims fast-tracked, average triage time, and the AI fix rate. "Waiting" and "Fast-tracked" update as you make decisions; the time and fix-rate figures are marked as pilot targets.
- **Priority tabs:** All, High, Medium, Low, and Missing docs, each with a live count.
- **Filters:** by category, by hospital, by date received, and by status. They combine, and a "Clear filters" button resets them.
- **Search:** filters the list live by claim ID, client name, or policy number.
- **Sort:** by AI priority score or by newest received.
- **Low-confidence flag:** claims the AI is unsure about show a "Low confidence" warning in the list.

## The claim panel (slides in from the right)

Clicking a claim opens a detail panel over the list:

- **Header:** priority score as a ring, client name, date and time received, the submitting hospital, category tags, and the claim amount.
- **Description:** the full claim summary.
- **Why the AI scored it:** the confidence level, plus each scoring factor and how many points it contributed (e.g. "ICU stay ≥ 3 days +30").
- **Suggested route:** where the AI recommends sending the claim.
- **Files:** the attached documents; clicking one opens a document preview inside the panel.
- **Low-confidence banner:** on unsure claims, a notice that the case needs officer judgement and can't be fast-tracked without review.
- **Actions:** **Approve** the route, **Edit route** (choose a different one), or **Reject** (with a required reason).
- **Navigation:** previous/next arrows (and ← → keys) step through claims without closing the panel; Esc or ✕ closes it.

## What happens when the officer acts

- **Approve / Edit / Reject** updates the claim's status, shows a brief confirmation, and moves to the next claim.
- The KPI cards and the queue update immediately.
- Every action is written to the **Audit log**.

## Audit log (sidebar)

A running record of every AI suggestion next to the officer's decision: the time, the claim, the client, the AI score, the AI's suggested route, the officer's decision, and the final route or rejection reason. This is the governance trail.

## The rest of the app

- A realistic **sidebar** (Overview, Triage queue, My claims, Investigations, Completed, Performance, Audit log, AI rules & thresholds) and **top bar** with search and an "AI model · demo data" label, so it reads like a real insurance tool.
- The Triage queue and Audit log are built; the other sidebar items show a short "not part of this prototype" placeholder.

## Accessibility

- The whole queue and panel work by keyboard: claims open with Enter, focus moves into the panel and stays trapped there while it's open, and closing returns focus to the claim's row.
- Score colours, status, and the low-confidence flag are backed by text, not colour alone.

## What is not in the prototype

- No live AI — the scores and reasoning are pre-written into the sample data.
- No backend, login, real customer data, or downstream processing (adjuster assessment, hospital verification, beneficiary communication).
- The checkboxes, bulk actions, and non-triage pages are illustrative only.
