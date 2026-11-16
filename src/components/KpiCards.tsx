import type { AuditEntry, Claim } from '../types';
import { kpis } from '../lib/queue';

function PilotTag() {
  return (
    <span title="Illustrative pilot target, not a measured result" className="ml-1.5 align-middle rounded border border-dashed border-slate-300 px-1 text-[9px] font-medium uppercase tracking-wide text-slate-400">
      Pilot target
    </span>
  );
}

function Stat({ label, value, sub, tag }: { label: React.ReactNode; value: string; sub: string; tag?: boolean }) {
  return (
    <div className="basis-[calc(50%-0.625rem)] sm:flex-1 sm:basis-0 sm:border-l sm:border-slate-200 sm:pl-5">
      <div className="text-[12px] text-slate-500">{label}{tag && <PilotTag />}</div>
      <div className="mt-1 font-display text-2xl font-semibold tabular-nums text-slate-800">{value}</div>
      <div className="mt-0.5 text-[11px] text-slate-500">{sub}</div>
    </div>
  );
}

export default function KpiCards({ claims, audit }: { claims: Claim[]; audit: AuditEntry[] }) {
  const k = kpis(claims);
  const fixes = audit.filter((a) => a.action !== 'approved').length;
  const fixRate = audit.length ? `${Math.round((fixes / audit.length) * 100)}%` : '9%';
  const fixSub = audit.length ? `Officers changed the AI’s call ${fixes} of ${audit.length} times` : 'How often officers change the AI’s call';

  return (
    <div className="flex flex-wrap items-stretch gap-x-5 gap-y-5 rounded-2xl bg-white px-5 py-4 ring-1 ring-slate-200/70 shadow-[0_1px_2px_rgba(20,20,19,0.04),0_14px_30px_-24px_rgba(20,20,19,0.25)] sm:px-6 sm:py-5">
      {/* Primary — the number the officer works against */}
      <div className="basis-full sm:basis-auto sm:min-w-[160px] sm:pr-6">
        <div className="text-[12px] font-medium text-slate-500">Waiting for review</div>
        <div className="mt-1 font-display text-[40px] font-semibold leading-none tabular-nums text-slate-900">{k.waiting}</div>
        <div className="mt-1.5 text-[11px] text-slate-500">{k.highWaiting} high priority · needs an officer</div>
      </div>
      <Stat label="Auto-approved (simple)" value={String(k.fastTracked)} sub="Sent straight to auto-pay" />
      <Stat label="Avg. time to sort a claim" value="3m 40s" sub="▼ from 15m doing it by hand" tag />
      <Stat label={<>Officer override rate</>} value={fixRate} sub={fixSub} tag={!audit.length} />
    </div>
  );
}
