import { AlertTriangle, ArrowRight, CheckCircle2, FileWarning, Gauge, Scale, ShieldCheck } from 'lucide-react';
import { FAST_TRACK, LOW_CONFIDENCE } from '../lib/queue';

/**
 * The shared rulebook. The AI applies exactly these rules to score, rank and route every
 * incoming claim; the officer reads the same page to check the AI's reasoning and to know
 * when to step in. Nothing here is live — the scores in this demo were produced by applying
 * these rules to synthetic claims, so the officer always sees why a number came out the way it did.
 */

const BANDS = [
  { label: 'High', range: '70 – 100', dot: 'bg-red-600', text: 'text-red-700', chip: 'bg-red-50 ring-red-200',
    meaning: 'Large benefit, early claim, or a severity/fraud signal. Look at these first; most go to a senior adjuster or investigation.' },
  { label: 'Medium', range: '40 – 69', dot: 'bg-amber-500', text: 'text-amber-700', chip: 'bg-amber-50 ring-amber-200',
    meaning: 'Normal in-patient claims within the usual limits. A standard assessor can handle them once nothing is missing.' },
  { label: 'Low', range: '0 – 39', dot: 'bg-emerald-600', text: 'text-emerald-700', chip: 'bg-emerald-50 ring-emerald-200',
    meaning: 'Small, clean, low-risk claims. If confidence is high and no document is missing, they can be auto-paid.' },
];

const FACTORS = [
  { group: 'Timing vs. the policy', why: 'A claim soon after the policy starts or is reinstated is the strongest fraud / non-disclosure signal, so it carries the most weight.',
    weight: 'up to +40', examples: ['Diagnosis within 90 days of policy start', 'Death within 2 years of reinstatement', 'Policy under 2 years old'] },
  { group: 'Benefit size & exposure', why: 'The larger the payout relative to the book, the more it is worth a careful human look before money goes out.',
    weight: '+18 – +30', examples: ['Sum assured ฿3.0M (top 5% of book)', 'Claim amount in the top 10%', 'Multiple beneficiaries'] },
  { group: 'Severity & benefit triggers', why: 'Signals that a specific, higher-value benefit has been triggered and the case is genuinely complex.',
    weight: '+22 – +30', examples: ['ICU stay ≥ 3 days', 'Accidental death — double indemnity', 'Death during admission'] },
  { group: 'Consistency & document flags', why: 'Anything unreadable, missing or contradictory both raises the score and forces a check with the source before any decision.',
    weight: '+20 – +26', examples: ['Diagnosis code mismatch', 'Required documents missing', 'Specialist report missing'] },
  { group: 'Claim history', why: 'Repeat or pattern claims on the same policy deserve a second read.',
    weight: '+24 – +28', examples: ['Second ICU claim in 12 months', 'Prior symptoms in hospital records'] },
];

const ROUTING = [
  { route: FAST_TRACK, tone: 'text-emerald-700', when: 'Low priority, confidence at or above 60, no missing documents and no red flag. Small and clean — the AI proposes paying it automatically.' },
  { route: 'Standard assessor — Health', tone: 'text-slate-700', when: 'Medium-priority in-patient or OPD health claims that sit within the usual room & board and sub-limits.' },
  { route: 'Senior adjuster — Health', tone: 'text-slate-700', when: 'High-value or complex health claims — ICU, bills over a sub-limit, or a repeat claim within 12 months.' },
  { route: 'Senior adjuster — Death claims', tone: 'text-slate-700', when: 'Any death or life-benefit claim. These always go to a senior adjuster, whatever the score.' },
  { route: 'Investigation unit', tone: 'text-red-700', when: 'A fraud / non-disclosure signal: an early claim against policy start, a diagnosis or disclosure mismatch, or low confidence on a high-value claim.' },
  { route: 'Request missing documents', tone: 'text-amber-700', when: 'A required document is missing or unreadable. Nothing can be decided until the hospital or claimant sends it.' },
];

const VERIFY = ['confidence below 60', 'a diagnosis or amount mismatch', 'a missing or unreadable document', 'a possible non-disclosure', 'an unsigned form'];

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-slate-200 bg-white ${className}`}>{children}</div>;
}

function SectionTitle({ icon: Icon, n, title, sub }: { icon: typeof Gauge; n: number; title: string; sub: string }) {
  return (
    <div className="mb-3 flex items-start gap-3">
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600"><Icon size={17} /></span>
      <div>
        <h2 className="text-[15px] font-semibold text-slate-900">{n}. {title}</h2>
        <p className="text-sm text-slate-500">{sub}</p>
      </div>
    </div>
  );
}

export default function RulesPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 p-4 sm:p-6">
      {/* Intro */}
      <header>
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
          <ShieldCheck size={13} className="text-blue-500" /> Shared rulebook — officer &amp; AI
        </div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-slate-900">AI rules &amp; thresholds</h1>
        <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-slate-600">
          The AI scores, ranks and routes every incoming claim by the rules on this page — and the officer reads the
          same page to check its reasoning. There are no hidden weights: each priority number is just these rules
          applied to the claim. In this demo the scores are pre-computed, so what you see always matches what is written here.
        </p>
      </header>

      {/* 1. Priority bands */}
      <section>
        <SectionTitle icon={Gauge} n={1} title="Priority score (0–100)" sub="One number for how urgently a claim needs a human, built by adding up the signals below." />
        <div className="grid gap-3 sm:grid-cols-3">
          {BANDS.map((b) => (
            <Card key={b.label} className="p-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                  <span className={`h-2 w-2 rounded-full ${b.dot}`} /> {b.label}
                </span>
                <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ring-1 ring-inset ${b.chip} ${b.text}`}>{b.range}</span>
              </div>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-600">{b.meaning}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* 2. How the score is built */}
      <section>
        <SectionTitle icon={Scale} n={2} title="How the score is built" sub="Each claim is read for these signals. Every signal that applies adds points; the total is the priority score." />
        <Card className="overflow-hidden">
          <div className="divide-y divide-slate-100">
            {FACTORS.map((f) => (
              <div key={f.group} className="grid gap-x-4 gap-y-2 p-4 sm:grid-cols-[180px_1fr]">
                <div>
                  <div className="text-[13px] font-semibold text-slate-900">{f.group}</div>
                  <div className="mt-1 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-slate-600">{f.weight}</div>
                </div>
                <div>
                  <p className="text-[13px] leading-relaxed text-slate-600">{f.why}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {f.examples.map((ex) => (
                      <span key={ex} className="rounded-md bg-slate-50 px-2 py-0.5 text-[11px] text-slate-500 ring-1 ring-inset ring-slate-200">{ex}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* 3. Confidence + verification */}
      <section>
        <SectionTitle icon={FileWarning} n={3} title="Confidence & when to verify" sub="A second number, separate from priority: how sure the AI is that it read the files correctly." />
        <Card className="p-4">
          <p className="text-[13px] leading-relaxed text-slate-600">
            Priority says <span className="font-medium text-slate-800">how urgent</span>; confidence says
            <span className="font-medium text-slate-800"> how sure</span>. The two are independent — a claim can be high-priority
            and low-confidence at once, which is exactly when a human is needed most.
          </p>
          <div className="mt-3 flex items-start gap-2.5 rounded-lg bg-amber-50 p-3 ring-1 ring-inset ring-amber-200">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-600" />
            <p className="text-[13px] leading-relaxed text-amber-900">
              The AI flags a claim <span className="font-semibold">“verify with the source”</span> whenever any of these is true:
              {' '}{VERIFY.map((v, i) => (<span key={v}>{i > 0 && ', '}<span className="font-medium">{v}</span></span>))}.
              Below <span className="font-semibold tabular-nums">{LOW_CONFIDENCE}</span> confidence, the officer is asked to call the
              hospital coordinator or claimant before approving anything.
            </p>
          </div>
        </Card>
      </section>

      {/* 4. Routing */}
      <section>
        <SectionTitle icon={ArrowRight} n={4} title="Routing rules" sub="Where the AI sends each claim once it is scored. The officer can accept, change or reject the route." />
        <Card className="overflow-hidden">
          <ul className="divide-y divide-slate-100">
            {ROUTING.map((r) => (
              <li key={r.route} className="flex flex-col gap-1 p-4 sm:flex-row sm:items-baseline sm:gap-4">
                <span className={`shrink-0 text-[13px] font-semibold sm:w-56 ${r.tone}`}>{r.route}</span>
                <span className="text-[13px] leading-relaxed text-slate-600">{r.when}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* 5. Guardrails */}
      <section>
        <SectionTitle icon={ShieldCheck} n={5} title="Guardrails" sub="What the AI is and is not allowed to do." />
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: ArrowRight, t: 'The AI only suggests', d: 'It scores and proposes a route. It never pays, rejects or closes a claim on its own.' },
            { icon: CheckCircle2, t: 'The officer decides', d: 'Every claim waits for a person to approve, change the route, or reject it.' },
            { icon: ShieldCheck, t: 'Everything is logged', d: 'The AI’s suggestion and the officer’s decision are both recorded in the audit log.' },
          ].map((g) => (
            <Card key={g.t} className="p-4">
              <g.icon size={17} className="text-blue-500" />
              <div className="mt-2 text-[13px] font-semibold text-slate-900">{g.t}</div>
              <p className="mt-1 text-[13px] leading-relaxed text-slate-600">{g.d}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
