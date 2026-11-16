# AI Claims Triage — prototype overview (for expert feedback)

**What this is:** an early, clickable prototype of an AI-assisted claims-triage console for a life & health insurer (TLIFE). It is a proof of concept for discussion, not a production system. All data is synthetic, and the AI's output is staged (pre-computed), so the prototype demonstrates the *workflow and the human's role*, not a live model.

**What I'd value feedback on:** whether the process below is realistic for a Thai life/health insurer, where it would break, and what controls or steps are missing. Open questions are listed at the end.

---

## The problem we're addressing

Today, incoming claims arrive as one undivided queue and are sorted by hand. Simple and complex claims sit together, so officers spend time triaging instead of resolving; simple claims wait behind hard ones; and complex or high-risk claims sometimes reach the wrong adjuster and get sent back. Triage quality depends on the individual officer's experience.

## The workflow we're prototyping

We anchored the demo on one channel — **hospital direct-billing (cashless)**, where a partner hospital submits the bill and supporting documents through our platform.

1. **Intake.** A partner hospital submits a claim (itemised bill, discharge summary, medical certificate, ID) through the platform.
2. **AI reads and analyses the files** *(represented in the prototype, not live)*:
   - classifies each document (bill, discharge summary, certificate, ID);
   - extracts key fields (patient, policy no., admission/discharge dates, diagnosis, amount);
   - matches the policy and checks it is in force and covered;
   - checks the required documents are all present (else flags "missing documents");
   - scores complexity, risk and urgency, and suggests a route.
3. **Officer review (the prototype's main screen).** Each claim appears in a queue, sorted by the AI's priority score, with its client, date, category tags, description, files, and a status. The officer opens a claim and sees the AI's suggested route, its **confidence**, the **reasoning** (each scoring factor and its weight), and the source files. The officer then **approves**, **changes the route**, or **rejects** with a reason.
4. **Downstream (not built; described for context).** After routing, the assigned adjuster does the actual assessment — verifying eligibility, documents, and, for medical claims, checking with the hospital — and the beneficiary is contacted at the decision/communication step. The AI does not do this; it only sorts and routes.

## What the AI does and does not do

- **Does:** read documents, extract data, score priority/risk, suggest a route, and explain why.
- **Does not:** make the payout decision, contract with the claimant, verify with the hospital, or auto-close a claim. A human officer approves before any claim advances. Low-confidence claims (below a set threshold) are flagged for officer judgement and cannot be fast-tracked without review.

## Controls built in from the start

- **Human in the loop** on every claim — the officer is the decision-maker.
- **Full audit trail** — every AI suggestion and every officer decision (approve / re-route / reject, with reason) is logged.
- **Conservative confidence threshold** with an escalation path for low-confidence or high-value cases.
- **Access by role** and **PDPA handling** for personal and health data (especially medical and death claims).
- Synthetic data only until a security review; no real customer data in the demo.

## What's real vs assumed in this prototype

- **Real (clickable):** the queue, priority scoring display, filters (priority, category, hospital, date, status), search, the claim detail panel with reasoning and confidence, approve / edit / reject, and the audit log.
- **Staged:** the AI's scores and reasoning are pre-written into the sample data, not produced by a live model.
- **Illustrative:** the performance figures shown (e.g. average triage time, fix rate) are pilot targets / placeholders, not measured results.

## Open questions for the expert

1. Is **hospital direct-billing** the right first channel to prove this on, or would reimbursement (claimant-submitted) be more representative of our real volume?
2. Are the **routing categories** sensible (fast-track auto-pay, standard assessor, senior adjuster, investigation unit, request missing documents)? What's missing?
3. What **risk signals** should drive priority that we haven't included (we currently use things like reinstatement recency, sum assured, ICU stay, diagnosis-vs-policy-start timing, document mismatches)?
4. Where are the real **PDPA and regulatory** constraints on letting AI pre-score medical and death claims, even with a human approving?
5. What is the **realistic ceiling** for straight-through / fast-tracked simple claims in this market?
6. Is the **downstream hand-off** (adjuster assessment, hospital verification, beneficiary communication) modelled correctly, and where does AI help vs. stay out?
7. What would make an officer **trust or distrust** this screen in daily use?
