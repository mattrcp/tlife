import { AlertTriangle, ArrowRight, CheckCircle2, FileWarning, Gauge, Scale, ShieldCheck } from 'lucide-react';
import { FAST_TRACK, LOW_CONFIDENCE } from '../lib/queue';
import { useLang } from '../i18n/lang';
import { tRoute, type Lang } from '../i18n/strings';

/**
 * The shared rulebook. The AI applies exactly these rules to score, rank and route every
 * incoming claim; the officer reads the same page to check the AI's reasoning and to know
 * when to step in. Nothing here is live — the scores in this demo were produced by applying
 * these rules to synthetic claims, so the officer always sees why a number came out the way it did.
 */

interface Band { label: string; range: string; dot: string; text: string; chip: string; meaning: string }
interface FactorRow { group: string; why: string; weight: string; examples: string[] }
interface RouteRow { route: string; tone: string; when: string }

const BANDS = (lang: Lang): Band[] => [
  { label: lang === 'th' ? 'สูง' : 'High', range: '70 – 100', dot: 'bg-red-600', text: 'text-red-700', chip: 'bg-red-50 ring-red-200',
    meaning: lang === 'th'
      ? 'ผลประโยชน์สูง เคลมเร็ว หรือมีสัญญาณความรุนแรง/การทุจริต ดูก่อนเป็นอันดับแรก ส่วนใหญ่ส่งผู้พิจารณาอาวุโสหรือหน่วยสืบสวน'
      : 'Large benefit, early claim, or a severity/fraud signal. Look at these first; most go to a senior adjuster or investigation.' },
  { label: lang === 'th' ? 'กลาง' : 'Medium', range: '40 – 69', dot: 'bg-amber-500', text: 'text-amber-700', chip: 'bg-amber-50 ring-amber-200',
    meaning: lang === 'th'
      ? 'เคลมผู้ป่วยในทั่วไปที่อยู่ในวงเงินปกติ ผู้พิจารณาทั่วไปจัดการได้เมื่อเอกสารครบ'
      : 'Normal in-patient claims within the usual limits. A standard assessor can handle them once nothing is missing.' },
  { label: lang === 'th' ? 'ต่ำ' : 'Low', range: '0 – 39', dot: 'bg-emerald-600', text: 'text-emerald-700', chip: 'bg-emerald-50 ring-emerald-200',
    meaning: lang === 'th'
      ? 'เคลมเล็ก สะอาด ความเสี่ยงต่ำ หากความเชื่อมั่นสูงและเอกสารครบ สามารถจ่ายอัตโนมัติได้'
      : 'Small, clean, low-risk claims. If confidence is high and no document is missing, they can be auto-paid.' },
];

const FACTORS = (lang: Lang): FactorRow[] => lang === 'th' ? [
  { group: 'ระยะเวลาเทียบกับกรมธรรม์', why: 'เคลมที่เกิดขึ้นไม่นานหลังเริ่มหรือต่ออายุกรมธรรม์เป็นสัญญาณการทุจริต/การปกปิดข้อมูลที่ชัดเจนที่สุด จึงให้น้ำหนักมากที่สุด',
    weight: 'สูงสุด +40', examples: ['วินิจฉัยภายใน 90 วันหลังเริ่มกรมธรรม์', 'เสียชีวิตภายใน 2 ปีหลังต่ออายุ', 'กรมธรรม์อายุไม่ถึง 2 ปี'] },
  { group: 'ขนาดผลประโยชน์และความเสี่ยง', why: 'ยิ่งยอดจ่ายใหญ่เมื่อเทียบกับพอร์ต ยิ่งควรให้คนตรวจอย่างละเอียดก่อนจ่ายเงิน',
    weight: '+18 – +30', examples: ['ทุนประกัน ฿3.0 ล้าน (สูงสุด 5% ของพอร์ต)', 'ยอดเคลมอยู่ใน 10% สูงสุด', 'ผู้รับผลประโยชน์หลายราย'] },
  { group: 'ความรุนแรงและเงื่อนไขจ่ายสินไหม', why: 'สัญญาณว่ามีการเข้าเงื่อนไขจ่ายผลประโยชน์เฉพาะที่มูลค่าสูง และเคสมีความซับซ้อนจริง',
    weight: '+22 – +30', examples: ['อยู่ไอซียู ≥ 3 วัน', 'เสียชีวิตจากอุบัติเหตุ — จ่ายสองเท่า', 'เสียชีวิตระหว่างรักษาตัว'] },
  { group: 'ความสอดคล้องและเอกสาร', why: 'อะไรที่อ่านไม่ออก ขาดหาย หรือขัดแย้งกัน ทั้งเพิ่มคะแนนและบังคับให้ต้องตรวจกับต้นทางก่อนตัดสินใจ',
    weight: '+20 – +26', examples: ['รหัสวินิจฉัยไม่ตรงกัน', 'ขาดเอกสารที่จำเป็น', 'ขาดรายงานแพทย์เฉพาะทาง'] },
  { group: 'ประวัติการเคลม', why: 'เคลมซ้ำหรือมีรูปแบบบนกรมธรรม์เดียวกันควรได้รับการตรวจซ้ำ',
    weight: '+24 – +28', examples: ['เคลมไอซียูครั้งที่สองใน 12 เดือน', 'มีอาการมาก่อนในประวัติโรงพยาบาล'] },
] : [
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

const ROUTING = (lang: Lang): RouteRow[] => [
  { route: FAST_TRACK, tone: 'text-emerald-700', when: lang === 'th'
    ? 'ความสำคัญต่ำ ความเชื่อมั่นตั้งแต่ 60 ขึ้นไป เอกสารครบและไม่มีสัญญาณผิดปกติ เคลมเล็กและสะอาด AI เสนอให้จ่ายอัตโนมัติ'
    : 'Low priority, confidence at or above 60, no missing documents and no red flag. Small and clean — the AI proposes paying it automatically.' },
  { route: 'Standard assessor — Health', tone: 'text-slate-700', when: lang === 'th'
    ? 'เคลมสุขภาพผู้ป่วยในหรือผู้ป่วยนอกความสำคัญปานกลางที่อยู่ในวงเงินค่าห้องและวงเงินย่อยตามปกติ'
    : 'Medium-priority in-patient or OPD health claims that sit within the usual room & board and sub-limits.' },
  { route: 'Senior adjuster — Health', tone: 'text-slate-700', when: lang === 'th'
    ? 'เคลมสุขภาพมูลค่าสูงหรือซับซ้อน — ไอซียู ค่ารักษาเกินวงเงินย่อย หรือเคลมซ้ำภายใน 12 เดือน'
    : 'High-value or complex health claims — ICU, bills over a sub-limit, or a repeat claim within 12 months.' },
  { route: 'Senior adjuster — Death claims', tone: 'text-slate-700', when: lang === 'th'
    ? 'เคลมกรณีเสียชีวิตหรือผลประโยชน์ชีวิตทุกราย ส่งผู้พิจารณาอาวุโสเสมอไม่ว่าคะแนนเท่าใด'
    : 'Any death or life-benefit claim. These always go to a senior adjuster, whatever the score.' },
  { route: 'Investigation unit', tone: 'text-red-700', when: lang === 'th'
    ? 'สัญญาณการทุจริต/การปกปิดข้อมูล: เคลมเร็วเทียบกับวันเริ่มกรมธรรม์ การวินิจฉัยหรือข้อมูลไม่ตรงกัน หรือความเชื่อมั่นต่ำบนเคลมมูลค่าสูง'
    : 'A fraud / non-disclosure signal: an early claim against policy start, a diagnosis or disclosure mismatch, or low confidence on a high-value claim.' },
  { route: 'Request missing documents', tone: 'text-amber-700', when: lang === 'th'
    ? 'มีเอกสารที่จำเป็นขาดหายหรืออ่านไม่ออก ตัดสินใจไม่ได้จนกว่าโรงพยาบาลหรือผู้เรียกร้องจะส่งมา'
    : 'A required document is missing or unreadable. Nothing can be decided until the hospital or claimant sends it.' },
];

const VERIFY = (lang: Lang): string[] => lang === 'th'
  ? ['ความเชื่อมั่นต่ำกว่า 60', 'การวินิจฉัยหรือยอดเงินไม่ตรงกัน', 'เอกสารขาดหายหรืออ่านไม่ออก', 'มีความเป็นไปได้ว่าปกปิดข้อมูล', 'ใบเคลมไม่ได้ลงนาม']
  : ['confidence below 60', 'a diagnosis or amount mismatch', 'a missing or unreadable document', 'a possible non-disclosure', 'an unsigned form'];

const TXT = {
  badge: { en: 'Shared rulebook — officer & AI', th: 'คู่มือร่วม — เจ้าหน้าที่และ AI' },
  title: { en: 'AI rules & thresholds', th: 'กฎและเกณฑ์ของ AI' },
  intro: {
    en: 'The AI scores, ranks and routes every incoming claim by the rules on this page — and the officer reads the same page to check its reasoning. There are no hidden weights: each priority number is just these rules applied to the claim. In this demo the scores are pre-computed, so what you see always matches what is written here.',
    th: 'AI ให้คะแนน จัดลำดับ และกำหนดเส้นทางของทุกเคลมตามกฎในหน้านี้ — และเจ้าหน้าที่อ่านหน้าเดียวกันเพื่อตรวจสอบเหตุผล ไม่มีน้ำหนักที่ซ่อนไว้ คะแนนความสำคัญแต่ละตัวคือกฎเหล่านี้ที่ใช้กับเคลม ในเดโมนี้คะแนนถูกคำนวณไว้ล่วงหน้า สิ่งที่เห็นจึงตรงกับที่เขียนไว้เสมอ',
  },
  s1t: { en: 'Priority score (0–100)', th: 'คะแนนความสำคัญ (0–100)' },
  s1s: { en: 'One number for how urgently a claim needs a human, built by adding up the signals below.', th: 'ตัวเลขเดียวที่บอกว่าเคลมต้องการคนเร่งด่วนแค่ไหน สร้างจากการรวมสัญญาณด้านล่าง' },
  s2t: { en: 'How the score is built', th: 'คะแนนสร้างขึ้นอย่างไร' },
  s2s: { en: 'Each claim is read for these signals. Every signal that applies adds points; the total is the priority score.', th: 'แต่ละเคลมถูกอ่านหาสัญญาณเหล่านี้ ทุกสัญญาณที่เข้าเกณฑ์จะเพิ่มคะแนน ผลรวมคือคะแนนความสำคัญ' },
  s3t: { en: 'Confidence & when to verify', th: 'ความเชื่อมั่นและเมื่อใดต้องตรวจสอบ' },
  s3s: { en: 'A second number, separate from priority: how sure the AI is that it read the files correctly.', th: 'ตัวเลขที่สอง แยกจากความสำคัญ: AI มั่นใจแค่ไหนว่าอ่านเอกสารถูกต้อง' },
  s3p1: { en: 'Priority says', th: 'ความสำคัญบอกว่า' },
  s3urgent: { en: 'how urgent', th: 'เร่งด่วนแค่ไหน' },
  s3p2: { en: '; confidence says', th: '; ความเชื่อมั่นบอกว่า' },
  s3sure: { en: 'how sure', th: 'มั่นใจแค่ไหน' },
  s3p3: {
    en: '. The two are independent — a claim can be high-priority and low-confidence at once, which is exactly when a human is needed most.',
    th: ' ทั้งสองเป็นอิสระต่อกัน — เคลมหนึ่งอาจความสำคัญสูงและความเชื่อมั่นต่ำพร้อมกัน ซึ่งเป็นจังหวะที่ต้องการคนมากที่สุด',
  },
  s3flagA: { en: 'The AI flags a claim', th: 'AI จะติดธงเคลมว่า' },
  s3flagQuote: { en: '“verify with the source”', th: '“ตรวจสอบกับต้นทาง”' },
  s3flagB: { en: 'whenever any of these is true:', th: 'เมื่อข้อใดข้อหนึ่งเป็นจริง:' },
  s3flagC: {
    en: 'Below {low} confidence, the officer is asked to call the hospital coordinator or claimant before approving anything.',
    th: 'เมื่อความเชื่อมั่นต่ำกว่า {low} เจ้าหน้าที่จะถูกขอให้โทรหาผู้ประสานงานของโรงพยาบาลหรือผู้เรียกร้องก่อนอนุมัติใด ๆ',
  },
  s4t: { en: 'Routing rules', th: 'กฎการจัดเส้นทาง' },
  s4s: { en: 'Where the AI sends each claim once it is scored. The officer can accept, change or reject the route.', th: 'AI ส่งแต่ละเคลมไปที่ใดหลังให้คะแนน เจ้าหน้าที่ยอมรับ เปลี่ยน หรือปฏิเสธเส้นทางได้' },
  s5t: { en: 'Guardrails', th: 'กรอบป้องกัน' },
  s5s: { en: 'What the AI is and is not allowed to do.', th: 'สิ่งที่ AI ทำได้และทำไม่ได้' },
  g: {
    en: [
      { t: 'The AI only suggests', d: 'It scores and proposes a route. It never pays, rejects or closes a claim on its own.' },
      { t: 'The officer decides', d: 'Every claim waits for a person to approve, change the route, or reject it.' },
      { t: 'Everything is logged', d: 'The AI’s suggestion and the officer’s decision are both recorded in the audit log.' },
    ],
    th: [
      { t: 'AI เพียงแค่แนะนำ', d: 'AI ให้คะแนนและเสนอเส้นทาง ไม่เคยจ่าย ปฏิเสธ หรือปิดเคลมด้วยตัวเอง' },
      { t: 'เจ้าหน้าที่เป็นผู้ตัดสิน', d: 'ทุกเคลมรอให้คนอนุมัติ เปลี่ยนเส้นทาง หรือปฏิเสธ' },
      { t: 'บันทึกทุกอย่าง', d: 'ทั้งคำแนะนำของ AI และการตัดสินใจของเจ้าหน้าที่ถูกบันทึกในบันทึกการตรวจสอบ' },
    ],
  },
} as const;

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
  const { lang } = useLang();
  const x = <K extends keyof typeof TXT>(k: K) => (TXT[k] as { en: string; th: string })[lang];
  return (
    <div className="mx-auto max-w-3xl space-y-8 p-4 sm:p-6">
      {/* Intro */}
      <header>
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
          <ShieldCheck size={13} className="text-blue-500" /> {x('badge')}
        </div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-slate-900">{x('title')}</h1>
        <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-slate-600">{x('intro')}</p>
      </header>

      {/* 1. Priority bands */}
      <section>
        <SectionTitle icon={Gauge} n={1} title={x('s1t')} sub={x('s1s')} />
        <div className="grid gap-3 sm:grid-cols-3">
          {BANDS(lang).map((b) => (
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
        <SectionTitle icon={Scale} n={2} title={x('s2t')} sub={x('s2s')} />
        <Card className="overflow-hidden">
          <div className="divide-y divide-slate-100">
            {FACTORS(lang).map((f) => (
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
        <SectionTitle icon={FileWarning} n={3} title={x('s3t')} sub={x('s3s')} />
        <Card className="p-4">
          <p className="text-[13px] leading-relaxed text-slate-600">
            {x('s3p1')} <span className="font-medium text-slate-800">{x('s3urgent')}</span>{x('s3p2')}
            <span className="font-medium text-slate-800"> {x('s3sure')}</span>{x('s3p3')}
          </p>
          <div className="mt-3 flex items-start gap-2.5 rounded-lg bg-amber-50 p-3 ring-1 ring-inset ring-amber-200">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-600" />
            <p className="text-[13px] leading-relaxed text-amber-900">
              {x('s3flagA')} <span className="font-semibold">{x('s3flagQuote')}</span> {x('s3flagB')}
              {' '}{VERIFY(lang).map((v, i) => (<span key={v}>{i > 0 && ', '}<span className="font-medium">{v}</span></span>))}.
              {' '}{x('s3flagC').replace('{low}', `${LOW_CONFIDENCE}`)}
            </p>
          </div>
        </Card>
      </section>

      {/* 4. Routing */}
      <section>
        <SectionTitle icon={ArrowRight} n={4} title={x('s4t')} sub={x('s4s')} />
        <Card className="overflow-hidden">
          <ul className="divide-y divide-slate-100">
            {ROUTING(lang).map((r) => (
              <li key={r.route} className="flex flex-col gap-1 p-4 sm:flex-row sm:items-baseline sm:gap-4">
                <span className={`shrink-0 text-[13px] font-semibold sm:w-56 ${r.tone}`}>{tRoute(lang, r.route)}</span>
                <span className="text-[13px] leading-relaxed text-slate-600">{r.when}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* 5. Guardrails */}
      <section>
        <SectionTitle icon={ShieldCheck} n={5} title={x('s5t')} sub={x('s5s')} />
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: ArrowRight, ...TXT.g[lang][0] },
            { icon: CheckCircle2, ...TXT.g[lang][1] },
            { icon: ShieldCheck, ...TXT.g[lang][2] },
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
