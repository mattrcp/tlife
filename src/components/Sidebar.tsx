import { useLayoutEffect, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { BarChart3, CheckCircle2, FolderOpen, Inbox, ScrollText, Search, SlidersHorizontal, ShieldCheck, X } from 'lucide-react';

export type Page = 'overview' | 'triage' | 'mine' | 'investigations' | 'completed' | 'performance' | 'audit' | 'rules';

export const PAGE_TITLES: Record<Page, string> = {
  overview: 'Overview', triage: 'Triage queue', mine: 'My claims', investigations: 'Investigations',
  completed: 'Completed', performance: 'Performance', audit: 'Audit log', rules: 'AI rules & thresholds',
};

// The two working pages first, then the rest muted below a hairline. No group headers — less noise.
const ITEMS: { page: Page; icon: LucideIcon; muted?: boolean }[] = [
  { page: 'triage', icon: Inbox },
  { page: 'audit', icon: ScrollText },
  { page: 'mine', icon: FolderOpen, muted: true },
  { page: 'investigations', icon: Search, muted: true },
  { page: 'completed', icon: CheckCircle2, muted: true },
  { page: 'performance', icon: BarChart3, muted: true },
  { page: 'rules', icon: SlidersHorizontal, muted: true },
];

interface Props { page: Page; onNavigate: (p: Page) => void; triageCount: number; auditCount: number; open: boolean; onClose: () => void }

export default function Sidebar({ page, onNavigate, triageCount, auditCount, open, onClose }: Props) {
  const listRef = useRef<HTMLUListElement>(null);
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [pill, setPill] = useState<{ top: number; height: number } | null>(null);

  // Measure the active item so the highlight can slide to it.
  useLayoutEffect(() => {
    const btn = btnRefs.current[page];
    const list = listRef.current;
    if (btn && list) setPill({ top: btn.offsetTop, height: btn.offsetHeight });
  }, [page]);

  const firstMuted = ITEMS.findIndex((i) => i.muted);

  return (
    <>
      {/* Mobile scrim */}
      <div
        aria-hidden
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-ink/40 transition-opacity duration-300 lg:hidden ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[82vw] flex-col bg-slate-900 text-slate-300 shadow-[inset_-1px_0_0_rgba(255,255,255,0.06),2px_0_16px_rgba(20,20,19,0.12)] transition-transform duration-300 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] lg:static lg:z-10 lg:w-56 lg:max-w-none lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
      <div className="flex items-center gap-2.5 px-5 pb-7 pt-5">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-500 text-ink shadow-sm">
          <ShieldCheck size={19} />
        </div>
        <div className="leading-tight">
          <div className="font-display text-[15px] font-semibold tracking-tight text-white">TLIFE</div>
          <div className="text-[11px] text-slate-400">Claims Workspace</div>
        </div>
        <button onClick={onClose} aria-label="Close menu" className="ml-auto grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-white lg:hidden">
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 px-3">
        <ul ref={listRef} className="relative space-y-0.5">
          {/* Sliding highlight (spring-like easing via cubic-bezier overshoot) */}
          {pill && (
            <div
              aria-hidden
              className="pointer-events-none absolute left-0 right-0 rounded-lg bg-slate-800 transition-[top] duration-[350ms]"
              style={{ top: pill.top, height: pill.height, transitionTimingFunction: 'cubic-bezier(0.34, 1.26, 0.64, 1)' }}
            >
              <span className="absolute inset-y-2 left-0 w-[3px] rounded-r bg-blue-500" />
            </div>
          )}
          {ITEMS.map((it, i) => {
            const active = it.page === page;
            const count = it.page === 'triage' ? triageCount : it.page === 'audit' ? auditCount : 0;
            return (
              <li key={it.page}>
                {i === firstMuted && <div className="mx-3 my-2 h-px bg-white/5" />}
                <button
                  ref={(el) => { btnRefs.current[it.page] = el; }}
                  onClick={() => onNavigate(it.page)}
                  className={`relative flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] outline-none transition active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-blue-500/60 ${
                    active ? 'font-medium text-white' : it.muted ? 'text-slate-400 hover:text-slate-200' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <it.icon size={16} className={active ? 'text-blue-400' : 'text-slate-500'} />
                  <span className="flex-1 text-left">{PAGE_TITLES[it.page]}</span>
                  {count > 0 && (
                    <span className={`rounded-full px-1.5 text-[10px] font-semibold tabular-nums ${it.page === 'triage' ? 'bg-blue-500 text-ink' : 'bg-slate-700 text-slate-200'}`}>
                      {count}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="m-3 flex items-center gap-2.5 rounded-xl bg-white/5 p-3">
        <div className="grid h-8 w-8 place-items-center rounded-full bg-blue-500/20 text-xs font-semibold text-blue-300">RN</div>
        <div className="leading-tight">
          <div className="text-[13px] font-medium text-white">Ratchapon N.</div>
          <div className="text-[11px] text-slate-400">Claims officer</div>
        </div>
      </div>
      </aside>
    </>
  );
}
