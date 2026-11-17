import { ArrowRight, Check, X } from 'lucide-react';
import type { Category, Claim, Status } from '../types';
import { priorityOf } from '../lib/queue';
import { useLang } from '../i18n/lang';
import { tBand, tRouteShort, tStatus, tTag } from '../i18n/strings';

export const ROUTE_SHORT: Record<string, string> = {
  'Fast-track auto-pay': 'Fast-track',
  'Standard assessor — Health': 'Standard assessor',
  'Senior adjuster — Health': 'Senior adjuster',
  'Senior adjuster — Death claims': 'Senior adjuster (death)',
  'Investigation unit': 'Investigation',
  'Request missing documents': 'Request documents',
};
export const shortRoute = (r: string) => ROUTE_SHORT[r] ?? r;

/** The list's last column: the AI's recommended destination, or the officer's decision once made. */
export function AiRecommends({ claim: c }: { claim: Claim }) {
  const { lang, t } = useLang();
  if (c.status === 'rejected')
    return <span className="inline-flex items-center gap-1 whitespace-nowrap text-[12px] font-medium text-rose-600"><X size={13} /> {t('rejectedShort')}</span>;
  if (c.status === 'approved' || c.status === 'edited')
    return <span className="inline-flex items-center gap-1 whitespace-nowrap text-[12px] font-medium text-emerald-700"><Check size={13} /> {tRouteShort(lang, c.finalRoute ?? c.suggestedRoute)}</span>;
  return <span className="inline-flex items-center gap-1 whitespace-nowrap text-[12px] text-slate-600"><ArrowRight size={13} className="text-blue-500" /> {tRouteShort(lang, c.suggestedRoute)}</span>;
}

const SCORE_STYLE = {
  high: { badge: 'bg-red-600 text-white', ring: '#dc2626', track: '#fee2e2', text: 'text-red-600', label: 'High' },
  medium: { badge: 'bg-amber-400 text-amber-950', ring: '#d97706', track: '#fef3c7', text: 'text-amber-700', label: 'Medium' },
  low: { badge: 'bg-emerald-700 text-white', ring: '#059669', track: '#d1fae5', text: 'text-emerald-700', label: 'Low' },
} as const;

export const scoreStyle = (score: number) => SCORE_STYLE[priorityOf(score)];

export function ScoreBadge({ score }: { score: number }) {
  return (
    <span className={`inline-flex w-10 justify-center rounded-md py-0.5 text-xs font-bold tabular-nums ${scoreStyle(score).badge}`}>
      {score}
    </span>
  );
}

export function ScoreRing({ score, size = 64 }: { score: number; size?: number }) {
  const { lang } = useLang();
  const s = scoreStyle(score);
  return (
    <div
      className="grid shrink-0 place-items-center rounded-full"
      style={{ width: size, height: size, background: `conic-gradient(${s.ring} ${score}%, ${s.track} 0)` }}
    >
      <div className="grid place-items-center rounded-full bg-white" style={{ width: size - 14, height: size - 14 }}>
        <span className={`font-display text-lg font-bold leading-none tabular-nums ${s.text}`}>{score}</span>
        <span className="text-[9px] font-medium uppercase tracking-wide text-slate-500">{tBand(lang, priorityOf(score))}</span>
      </div>
    </div>
  );
}

const TAG_STYLE: Record<Category, string> = {
  Life: 'bg-pink-50 text-pink-700 ring-pink-200',
  Death: 'bg-slate-100 text-slate-700 ring-slate-300',
  Hospital: 'bg-cyan-50 text-cyan-700 ring-cyan-200',
  ICU: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  OPD: 'bg-teal-50 text-teal-700 ring-teal-200',
  'Critical illness': 'bg-violet-50 text-violet-700 ring-violet-200',
  Accident: 'bg-orange-50 text-orange-700 ring-orange-200',
  'Missing doc': 'bg-amber-50 text-amber-800 ring-amber-300',
};

export function Tag({ label }: { label: Category }) {
  const { lang } = useLang();
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${TAG_STYLE[label]}`}>
      {tTag(lang, label)}
    </span>
  );
}

const STATUS_CLS: Record<Status, string> = {
  ai_suggested: '',
  approved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  edited: 'bg-slate-100 text-slate-700 ring-slate-300',
  rejected: 'bg-rose-50 text-rose-700 ring-rose-200',
};

export const STATUS_KEYS: Status[] = ['ai_suggested', 'approved', 'edited', 'rejected'];

export function StatusPill({ status }: { status: Status }) {
  const { lang } = useLang();
  const label = tStatus(lang, status);
  if (status === 'ai_suggested') {
    // Undecided is the default state: keep it quiet so decided claims stand out.
    return (
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[12px] text-slate-500">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />{label}
      </span>
    );
  }
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${STATUS_CLS[status]}`}>{label}</span>;
}
