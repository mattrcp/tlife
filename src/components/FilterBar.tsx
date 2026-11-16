import { useEffect, useRef, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import type { Category, DateRange, Filters, SortKey, Status, Tab } from '../types';
import { DEFAULT_FILTERS, isDefaultFilters } from '../lib/queue';
import { HOSPITALS } from '../data/claims';
import { STATUS_LABEL } from './ui';

const TABS: { id: Tab; label: string; dot?: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'high', label: 'High', dot: 'bg-red-600' },
  { id: 'medium', label: 'Medium', dot: 'bg-amber-500' },
  { id: 'low', label: 'Low', dot: 'bg-emerald-600' },
  { id: 'missing', label: 'Missing docs', dot: 'bg-amber-300' },
];
const CATEGORIES: Category[] = ['Life', 'Death', 'Hospital', 'ICU', 'OPD', 'Critical illness', 'Accident', 'Missing doc'];
const RANGES: { id: DateRange; label: string }[] = [
  { id: 'all', label: 'Any time' }, { id: 'today', label: 'Today' }, { id: '7d', label: 'Last 7 days' }, { id: '30d', label: 'Last 30 days' },
];

function Select<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { id: T; label: string }[]; onChange: (v: T) => void }) {
  const active = value !== options[0].id;
  return (
    <label className={`relative inline-flex items-center rounded-lg border text-[13px] ${active ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-700'}`}>
      <span className="pl-3 text-slate-500">{label}:</span>
      <select value={value} onChange={(e) => onChange(e.target.value as T)} className="cursor-pointer appearance-none bg-transparent py-1.5 pl-1 pr-7 font-medium outline-none">
        {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-2 text-slate-400" />
    </label>
  );
}

function CategoryPicker({ value, onChange }: { value: Category[]; onChange: (v: Category[]) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);
  const active = value.length > 0;
  const toggle = (c: Category) => onChange(value.includes(c) ? value.filter((x) => x !== c) : [...value, c]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex items-center gap-1 rounded-lg border py-1.5 pl-3 pr-2 text-[13px] ${active ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-700'}`}
      >
        <span className="text-slate-500">Category:</span>
        <span className="font-medium">{active ? (value.length <= 2 ? value.join(', ') : `${value.length} selected`) : 'All'}</span>
        <ChevronDown size={14} className="text-slate-400" />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 w-56 rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg">
          {CATEGORIES.map((c) => (
            <label key={c} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-[13px] hover:bg-slate-50">
              <input type="checkbox" checked={value.includes(c)} onChange={() => toggle(c)} className="h-3.5 w-3.5 accent-blue-600" />
              {c}
            </label>
          ))}
          {active && (
            <button onClick={() => onChange([])} className="mt-1 w-full rounded-md px-2 py-1.5 text-left text-[12px] text-blue-600 hover:bg-blue-50">Clear categories</button>
          )}
        </div>
      )}
    </div>
  );
}

interface Props { filters: Filters; counts: Record<Tab, number>; onChange: (f: Filters) => void }

export default function FilterBar({ filters: f, counts, onChange }: Props) {
  const set = (patch: Partial<Filters>) => onChange({ ...f, ...patch });
  return (
    <div>
      <div className="flex items-center gap-5 overflow-x-auto border-b border-slate-200 px-4 sm:gap-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((t) => {
          const on = f.tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => set({ tab: t.id })}
              className={`relative flex shrink-0 items-center gap-2 py-3 text-[13px] ${on ? 'font-semibold text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {t.dot && <span className={`h-2 w-2 rounded-full ${t.dot}`} />}
              {t.label}
              <span className={`rounded-full px-1.5 text-[11px] tabular-nums ${on ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>{counts[t.id]}</span>
              {on && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded bg-blue-600" />}
            </button>
          );
        })}
        <div className="ml-auto shrink-0 py-2">
          <Select<SortKey> label="Sort" value={f.sort} onChange={(sort) => set({ sort })}
            options={[{ id: 'score', label: 'AI priority score' }, { id: 'received', label: 'Newest received' }]} />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 px-4 py-3">
        <CategoryPicker value={f.categories} onChange={(categories) => set({ categories })} />
        <Select label="Hospital" value={f.hospital} onChange={(hospital) => set({ hospital })}
          options={[{ id: 'all', label: 'All' }, ...HOSPITALS.map((h) => ({ id: h, label: h }))]} />
        <Select label="Received" value={f.range} onChange={(range) => set({ range })} options={RANGES} />
        <Select label="Status" value={f.status} onChange={(status) => set({ status })}
          options={[{ id: 'all' as const, label: 'All' }, ...(Object.keys(STATUS_LABEL) as Status[]).map((s) => ({ id: s, label: STATUS_LABEL[s] }))]} />
        {!isDefaultFilters(f) && (
          <button onClick={() => onChange({ ...DEFAULT_FILTERS, search: f.search })} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[13px] text-slate-500 hover:bg-slate-100 hover:text-slate-800">
            <X size={14} /> Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
