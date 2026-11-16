import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, ArrowRight, Building2, Check, ChevronLeft, ChevronRight, FileText, Image, Mail, Pencil, Phone, Sparkles, User, X, XCircle } from 'lucide-react';
import type { Claim, ClaimFile } from '../types';
import { ROUTES } from '../data/claims';
import { LOW_CONFIDENCE } from '../lib/queue';
import { hospitalContact, claimantContact, needsVerify } from '../lib/contacts';
import { fmtLong, fmtSize, fmtTHB } from '../lib/format';
import { ScoreRing, StatusPill, Tag, scoreStyle, shortRoute } from './ui';
import FilePreview from './FilePreview';

interface Props {
  claim: Claim; index: number; total: number;
  onPrev: () => void; onNext: () => void; onClose: () => void;
  onApprove: () => void; onEdit: (route: string) => void; onReject: (reason: string) => void;
}

type Mode = 'view' | 'edit' | 'reject';

const Section = ({ title, children, right }: { title: string; children: React.ReactNode; right?: React.ReactNode }) => (
  <section className="border-b border-slate-100 px-6 py-4">
    <div className="mb-2 flex items-center justify-between">
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{title}</h3>
      {right}
    </div>
    {children}
  </section>
);

export default function ClaimDrawer({ claim: c, index, total, onPrev, onNext, onClose, onApprove, onEdit, onReject }: Props) {
  const [shown, setShown] = useState(false);
  const [mode, setMode] = useState<Mode>('view');
  const [route, setRoute] = useState(c.suggestedRoute);
  const [reason, setReason] = useState('');
  const [file, setFile] = useState<ClaimFile | null>(null);

  const panelRef = useRef<HTMLElement>(null);
  const lastIdRef = useRef(c.id);
  lastIdRef.current = c.id;

  // Slide in, move keyboard focus into the panel; on close, return focus to the row of the last claim shown.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const r = requestAnimationFrame(() => { setShown(true); panelRef.current?.focus({ preventScroll: true }); });
    return () => {
      cancelAnimationFrame(r);
      const row = document.querySelector<HTMLElement>(`[data-claim-id="${lastIdRef.current}"]`);
      (row ?? opener)?.focus({ preventScroll: false });
    };
  }, []);
  // reset local UI when switching claims
  useEffect(() => { setMode('view'); setRoute(c.suggestedRoute); setReason(''); setFile(null); }, [c.id, c.suggestedRoute]);
  // If the focused control disappeared (claim switched, file preview opened/closed), keep focus inside the panel.
  useEffect(() => {
    const p = panelRef.current;
    if (p && !p.contains(document.activeElement)) p.focus({ preventScroll: true });
  }, [c.id, file, mode]);

  const close = () => { setShown(false); setTimeout(onClose, 220); };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement).closest('input, textarea, select');
      if (e.key === 'Tab' && panelRef.current) {
        // Trap Tab inside the panel while it is open.
        const items = [...panelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), select, textarea, input, [tabindex="0"]')];
        if (!items.length) return;
        const first = items[0], last = items[items.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && (active === first || active === panelRef.current)) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && (active === last || !panelRef.current.contains(active))) { e.preventDefault(); first.focus(); }
      } else if (e.key === 'Escape') {
        if (file) setFile(null);
        else if (mode !== 'view') setMode('view');
        else close();
      } else if (!typing && e.key === 'ArrowRight') onNext();
      else if (!typing && e.key === 'ArrowLeft') onPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const maxPts = Math.max(...c.factors.map((f) => f.points));
  const topFactor = [...c.factors].sort((a, b) => b.points - a.points)[0];
  const s = scoreStyle(c.aiScore);
  const pending = c.status === 'ai_suggested';
  const hc = hospitalContact(c);
  const cc = claimantContact(c);
  const verify = needsVerify(c);

  // Portal to <body> so the sticky top bar can never paint over the panel.
  return createPortal(
    <div className="fixed inset-0 z-40">
      <div onClick={close} className={`absolute inset-0 bg-ink/35 transition-opacity duration-[400ms] [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] ${shown ? 'opacity-100' : 'opacity-0'}`} />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Claim ${c.id}, ${c.client}`}
        tabIndex={-1}
        className={`absolute outline-none inset-y-0 right-0 flex w-full flex-col bg-white shadow-[-24px_0_70px_-24px_rgba(20,20,19,0.4)] transition-transform duration-[400ms] [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] sm:w-[min(46vw,760px)] sm:min-w-[460px] ${shown ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {file ? (
          <FilePreview file={file} claim={c} onBack={() => setFile(null)} />
        ) : (
          <>
            {/* Header */}
            <div className="relative z-10 bg-white px-6 pb-4 pt-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-mono">{c.id}</span>
                <span className="text-slate-300">•</span>
                <span className="font-mono">{c.policyNo}</span>
                <div className="ml-auto flex items-center gap-1">
                  <button onClick={onPrev} className="grid h-7 w-7 place-items-center rounded-md hover:bg-slate-100" aria-label="Previous claim"><ChevronLeft size={16} /></button>
                  <span className="tabular-nums">{index >= 0 ? `${index + 1} of ${total}` : `— of ${total}`}</span>
                  <button onClick={onNext} className="grid h-7 w-7 place-items-center rounded-md hover:bg-slate-100" aria-label="Next claim"><ChevronRight size={16} /></button>
                  <button onClick={close} className="ml-2 grid h-7 w-7 place-items-center rounded-md hover:bg-slate-100" aria-label="Close"><X size={16} /></button>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-4">
                <ScoreRing score={c.aiScore} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate text-lg font-semibold text-slate-900">{c.client}</h2>
                    <StatusPill status={c.status} />
                  </div>
                  <div className="text-[13px] text-slate-500">Received {fmtLong(c.receivedAt)} · from {c.hospital}</div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1">
                    {c.tags.map((t) => <Tag key={t} label={t} />)}
                    <span className="ml-1 text-[13px] font-medium text-slate-700">{fmtTHB(c.amount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Body — scroll-edge fade where content passes under the floating header/footer */}
            <div className="flex-1 overflow-y-auto [mask-image:linear-gradient(to_bottom,transparent,#000_16px,#000_calc(100%-16px),transparent)]">
              {/* Plain-English verdict so anyone grasps the claim before reading the factors. */}
              <div className="border-b border-slate-100 px-6 py-4">
                <p className="text-[15px] leading-snug text-slate-800">
                  <b className={s.text}>{s.label} priority.</b>{' '}
                  Main reason: {topFactor.label}. The AI suggests sending it to <b>{shortRoute(c.suggestedRoute)}</b>.
                </p>
              </div>
              {c.confidence < LOW_CONFIDENCE && (
                <div className="mx-6 mt-4 flex gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-[13px] text-amber-900">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-500" />
                  <div><b>The AI isn't sure, so this needs your judgement.</b> Its confidence of {c.confidence}% is below the {LOW_CONFIDENCE}% threshold, so this claim can't be fast-tracked without review.</div>
                </div>
              )}

              <Section title="Claim description">
                <p className="text-[13px] leading-relaxed text-slate-700">{c.description}</p>
              </Section>

              <Section
                title={`Why the AI scored ${c.aiScore}`}
                right={<span className="inline-flex items-center gap-1 text-[11px] text-violet-600"><Sparkles size={12} /> Triage v0.3</span>}
              >
                <div className="mb-3 flex items-center gap-3">
                  <span className="text-[12px] text-slate-500">Confidence</span>
                  <div className="h-1.5 flex-1 rounded-full bg-slate-100">
                    <div className={`h-1.5 rounded-full ${c.confidence < LOW_CONFIDENCE ? 'bg-amber-500' : 'bg-violet-500'}`} style={{ width: `${c.confidence}%` }} />
                  </div>
                  <span className="text-[12px] font-semibold tabular-nums text-slate-700">{c.confidence}%</span>
                </div>
                <ul className="space-y-2.5">
                  {c.factors.map((f) => (
                    <li key={f.label}>
                      <div className="flex justify-between text-[13px]">
                        <span className="text-slate-700">{f.label}</span>
                        <span className={`font-semibold tabular-nums ${s.text}`}>+{f.points}</span>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-slate-100">
                        <div className="h-1.5 rounded-full" style={{ width: `${(f.points / maxPts) * 100}%`, background: s.ring, opacity: 0.75 }} />
                      </div>
                    </li>
                  ))}
                </ul>
              </Section>

              <Section title="AI suggested route">
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-[13px]">
                  <ArrowRight size={15} className="text-blue-600" />
                  <span className="font-medium text-slate-800">{c.suggestedRoute}</span>
                </div>
              </Section>

              <Section title={`Files (${c.files.length})`}>
                <ul className="space-y-1.5">
                  {c.files.map((f) => {
                    const Icon = f.kind === 'pdf' ? FileText : Image;
                    return (
                      <li key={f.name}>
                        <button onClick={() => setFile(f)} className="group flex w-full items-center gap-2.5 rounded-lg border border-slate-200 px-3 py-2 text-left text-[13px] hover:border-blue-300 hover:bg-blue-50/50">
                          <Icon size={16} className="text-slate-400" />
                          <span className="flex-1 truncate text-slate-700">{f.name}</span>
                          <span className="text-xs text-slate-500">{fmtSize(f.sizeKb)}</span>
                          <span className="text-xs font-medium text-blue-600 opacity-70 group-hover:opacity-100">View</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </Section>

              <Section title="Contact / verify the source">
                {verify && (
                  <div className="mb-3 flex gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-900">
                    <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-500" />
                    <span>The AI flagged something that doesn’t line up. You may want to confirm with the hospital before deciding.</span>
                  </div>
                )}
                <div className="space-y-2">
                  <div className="rounded-lg border border-slate-200 px-3 py-2.5">
                    <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      <Building2 size={13} /> Submitting hospital
                    </div>
                    <div className="text-[13px] font-medium text-slate-800">{hc.name}</div>
                    <div className="text-[12px] text-slate-500">{hc.coordinator} · Patient ref {hc.patientRef}</div>
                    <div className="mt-1.5 flex flex-wrap gap-2 text-[12px]">
                      <a href={`tel:${hc.phone.replace(/[^0-9+]/g, '')}`} className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 font-medium text-blue-700 hover:bg-blue-100"><Phone size={12} /> {hc.phone}</a>
                      <a href={`mailto:${hc.email}`} className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-slate-600 hover:bg-slate-50"><Mail size={12} /> {hc.email}</a>
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 px-3 py-2.5">
                    <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      <User size={13} /> {cc.role}
                    </div>
                    <div className="text-[13px] font-medium text-slate-800">{cc.name}</div>
                    <div className="mt-1.5 flex flex-wrap gap-2 text-[12px]">
                      <a href={`tel:${cc.phone.replace(/[^0-9+]/g, '')}`} className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 font-medium text-blue-700 hover:bg-blue-100"><Phone size={12} /> {cc.phone}</a>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400">Contact details are synthetic demo data.</p>
                </div>
              </Section>
            </div>

            {/* Footer */}
            <div className="relative z-10 bg-white px-6 py-4 shadow-[0_-1px_0_rgba(20,20,19,0.06)]">
              {/* Footer actions */}
              {!pending ? (
                <div className="flex items-center gap-2 text-[13px] text-slate-600">
                  <Check size={16} className="text-emerald-600" />
                  {c.status === 'rejected'
                    ? <span>Rejected. Reason: “{c.rejectReason}”</span>
                    : <span>{c.status === 'edited' ? 'Re-routed' : 'Approved'} → <b className="text-slate-800">{c.finalRoute}</b></span>}
                </div>
              ) : mode === 'edit' ? (
                <div className="space-y-3">
                  <label className="block text-[12px] font-medium text-slate-600">Send this claim to</label>
                  <select value={route} onChange={(e) => setRoute(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-[13px] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                    {ROUTES.map((r) => <option key={r} value={r}>{r}{r === c.suggestedRoute ? ' (AI suggestion)' : ''}</option>)}
                  </select>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setMode('view')} className="rounded-lg px-3 py-2 text-[13px] text-slate-600 hover:bg-slate-100">Cancel</button>
                    <button onClick={() => onEdit(route)} disabled={route === c.suggestedRoute} className="rounded-lg bg-blue-500 px-4 py-2 text-[13px] font-semibold text-ink transition hover:brightness-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40">Confirm new route</button>
                  </div>
                </div>
              ) : mode === 'reject' ? (
                <div className="space-y-3">
                  <label className="block text-[12px] font-medium text-slate-600">Reason for rejecting the AI suggestion <span className="text-rose-500">*</span></label>
                  <textarea autoFocus value={reason} onChange={(e) => setReason(e.target.value)} rows={2} placeholder="e.g. Exclusion applies: pre-existing condition" className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-[13px] outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100" />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setMode('view')} className="rounded-lg px-3 py-2 text-[13px] text-slate-600 hover:bg-slate-100">Cancel</button>
                    <button onClick={() => onReject(reason.trim())} disabled={!reason.trim()} className="rounded-lg bg-rose-600 px-4 py-2 text-[13px] font-medium text-white transition hover:bg-rose-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40">Confirm reject</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="mr-auto hidden text-[11px] text-slate-500 sm:inline">The officer has the final say</span>
                  <button onClick={() => setMode('reject')} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-[13px] font-medium text-rose-600 transition hover:bg-rose-50 active:scale-[0.98]"><XCircle size={15} /> Reject</button>
                  <button onClick={() => setMode('edit')} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-[13px] font-medium text-slate-700 transition hover:bg-slate-50 active:scale-[0.98]"><Pencil size={14} /> Edit route</button>
                  <button onClick={onApprove} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-500 px-4 py-2 text-[13px] font-semibold text-ink transition hover:brightness-95 active:scale-[0.98]"><Check size={15} /> Approve &amp; send</button>
                </div>
              )}
            </div>
          </>
        )}
      </aside>
    </div>,
    document.body,
  );
}
