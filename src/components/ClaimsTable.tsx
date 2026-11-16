import { Paperclip, SearchX, AlertTriangle } from 'lucide-react';
import type { Claim } from '../types';
import { AiRecommends, ScoreBadge, Tag, scoreStyle } from './ui';
import { fmtReceived } from '../lib/format';
import { LOW_CONFIDENCE } from '../lib/queue';

interface Props { claims: Claim[]; total: number; selectedId: string | null; onOpen: (id: string) => void; onClear: () => void }

const COLS = 'grid-cols-[128px_minmax(140px,1.1fr)_100px_minmax(140px,1fr)_minmax(200px,2fr)_44px_165px]';

export default function ClaimsTable({ claims, total, selectedId, onOpen, onClear }: Props) {
  if (claims.length === 0) {
    return (
      <div className="grid place-items-center border-t border-slate-200 px-6 py-16 text-center">
        <SearchX size={28} className="mb-3 text-slate-300" />
        <p className="text-sm font-medium text-slate-700">No claims match these filters</p>
        <button onClick={onClear} className="mt-3 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">Clear filters</button>
      </div>
    );
  }

  return (
    <div>
      {/* Mobile: stacked cards */}
      <ul className="divide-y divide-slate-200/50 md:hidden">
        {claims.map((c) => {
          const sel = c.id === selectedId;
          const lowConf = c.confidence < LOW_CONFIDENCE && c.status === 'ai_suggested';
          return (
            <li
              key={c.id}
              data-claim-id={c.id}
              role="button"
              tabIndex={0}
              aria-label={`Open claim ${c.id}, ${c.client}, AI score ${c.aiScore}`}
              onClick={() => onOpen(c.id)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(c.id); } }}
              className={`relative flex cursor-pointer flex-col gap-2 px-4 py-3.5 outline-none transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 active:bg-slate-100 ${sel ? 'bg-blue-50/60' : ''}`}
            >
              <span aria-hidden className="absolute left-0 inset-y-0 w-[3px]" style={{ backgroundColor: scoreStyle(c.aiScore).ring }} />
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5">
                  <ScoreBadge score={c.aiScore} />
                  <span className={`text-[12px] font-semibold ${scoreStyle(c.aiScore).text}`}>{scoreStyle(c.aiScore).label}</span>
                  {lowConf && <AlertTriangle size={13} className="text-amber-500" aria-label="Low confidence" />}
                </span>
                <AiRecommends claim={c} />
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate font-medium text-slate-900">{c.client}</span>
                <span className="shrink-0 whitespace-nowrap text-[11px] text-slate-500">{fmtReceived(c.receivedAt)}</span>
              </div>
              <div className="flex flex-wrap items-center gap-1">
                {c.tags.map((t) => <Tag key={t} label={t} />)}
                <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-slate-500"><Paperclip size={12} />{c.files.length}</span>
              </div>
              <p className="line-clamp-2 text-[13px] text-slate-500">{c.description}</p>
            </li>
          );
        })}
      </ul>

      {/* Desktop: table */}
      <div className="hidden overflow-x-auto md:block">
        <div className="min-w-[1000px]">
          <div className={`grid ${COLS} items-center gap-3 border-b border-slate-200/70 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.07em] text-slate-400`}>
            <span>AI priority</span><span>Client</span><span>Received</span><span>Tags</span><span>Description</span><span>Files</span><span>AI recommends</span>
          </div>
          <ul className="divide-y divide-slate-200/50">
            {claims.map((c) => {
              const sel = c.id === selectedId;
              const lowConf = c.confidence < LOW_CONFIDENCE && c.status === 'ai_suggested';
              return (
                <li
                  key={c.id}
                  data-claim-id={c.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open claim ${c.id}, ${c.client}, AI score ${c.aiScore}`}
                  onClick={() => onOpen(c.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(c.id); } }}
                  className={`relative grid ${COLS} cursor-pointer items-center gap-3 px-5 py-3.5 text-[13px] outline-none transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 active:bg-slate-100 ${sel ? 'bg-blue-50/60' : 'hover:bg-slate-50'}`}
                >
                  <span aria-hidden className="absolute left-0 inset-y-0 w-[3px]" style={{ backgroundColor: scoreStyle(c.aiScore).ring }} />
                  <span className="flex flex-col items-start gap-1">
                    <span className="flex items-center gap-1.5">
                      <ScoreBadge score={c.aiScore} />
                      <span className={`text-[11px] font-semibold ${scoreStyle(c.aiScore).text}`}>{scoreStyle(c.aiScore).label}</span>
                    </span>
                    {lowConf && (
                      <span className="inline-flex items-center gap-0.5 whitespace-nowrap text-[10px] font-medium text-amber-700">
                        <AlertTriangle size={11} /> Low confidence
                      </span>
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-slate-900">{c.client}</span>
                    <span className="block font-mono text-[11px] text-slate-500">{c.id}</span>
                  </span>
                  <span className="whitespace-nowrap text-slate-500">{fmtReceived(c.receivedAt)}</span>
                  <span className="flex flex-wrap gap-1">{c.tags.map((t) => <Tag key={t} label={t} />)}</span>
                  <span className="truncate text-slate-500">{c.description}</span>
                  <span className="inline-flex items-center gap-1 text-slate-500"><Paperclip size={13} />{c.files.length}</span>
                  <span><AiRecommends claim={c} /></span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-200/60 px-4 py-2.5 text-xs text-slate-400 sm:px-5">Showing {claims.length} of {total} claims</div>
    </div>
  );
}
