# TLIFE AI Claims Triage — interview prototype

A clickable prototype of a claims officer's console. The AI pre-scores and routes each incoming claim, and the officer approves, re-routes or rejects it. All data is synthetic, and the AI output is staged.

## Run it

```bash
npm install   # first time only
npm run dev   # open http://localhost:5173
```

Refreshing the page resets the demo.

## Suggested demo path (about 3 minutes)

1. **Queue:** claims are sorted by AI priority score. Point out the KPI cards and the High / Medium / Low / Missing docs tabs.
2. **Open Somchai Phongsri (92):** show the score breakdown, confidence, suggested route and files (click a file to preview it). **Approve**, and the panel moves to the next claim.
3. **Wichai Thongdee (88, ⚠):** the AI's confidence is low, so the banner asks for officer judgement. **Reject** with a reason.
4. **Filter:** Category = OPD, then **Edit route** on a low claim → Fast-track. Watch the Fast-tracked and AI fix rate KPIs change.
5. **Audit log** (sidebar): every AI suggestion is recorded next to the officer's decision.

## Tests

```bash
npm test
```

Design: `docs/superpowers/specs/2026-11-14-claims-triage-prototype-design.md` · Plan: `docs/superpowers/plans/2026-11-14-claims-triage-prototype.md`
