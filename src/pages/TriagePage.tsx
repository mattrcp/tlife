import { useCallback, useMemo, useState } from 'react';
import type { AuditEntry, Claim, Filters } from '../types';
import { DEFAULT_FILTERS, filterClaims, sortClaims, tabCounts } from '../lib/queue';
import KpiCards from '../components/KpiCards';
import FilterBar from '../components/FilterBar';
import ClaimsTable from '../components/ClaimsTable';
import ClaimDrawer from '../components/ClaimDrawer';
import Toast, { type ToastMsg } from '../components/Toast';
import { useLang } from '../i18n/lang';
import { tRoute } from '../i18n/strings';

interface Props {
  claims: Claim[]; audit: AuditEntry[]; search: string; onClearSearch: () => void;
  approve: (id: string) => void; edit: (id: string, route: string) => void; reject: (id: string, reason: string) => void;
}

export default function TriagePage({ claims, audit, search, onClearSearch, approve, edit, reject }: Props) {
  const { lang, t } = useLang();
  const [filters, setFilters] = useState<Omit<Filters, 'search'>>(DEFAULT_FILTERS);
  const [openId, setOpenId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastMsg | null>(null);

  const full: Filters = { ...filters, search };
  const visible = useMemo(() => sortClaims(filterClaims(claims, full), full.sort), [claims, filters, search]); // eslint-disable-line react-hooks/exhaustive-deps
  const counts = useMemo(() => tabCounts(claims), [claims]);
  const open = openId ? claims.find((c) => c.id === openId) ?? null : null;
  const index = open ? visible.findIndex((c) => c.id === open.id) : -1;

  const step = (dir: 1 | -1) => {
    if (!visible.length) return;
    const i = index < 0 ? (dir === 1 ? 0 : visible.length - 1) : index + dir;
    if (i >= 0 && i < visible.length) setOpenId(visible[i].id);
  };

  /** After a decision, move to the next claim in the list as it was before the action; close if none. */
  const afterAction = (id: string, text: string) => {
    const i = visible.findIndex((c) => c.id === id);
    const next = i >= 0 ? visible[i + 1] : undefined;
    setOpenId(next ? next.id : null);
    setToast({ id: Date.now(), text });
  };

  const clearFilters = () => { setFilters(DEFAULT_FILTERS); onClearSearch(); };
  const hideToast = useCallback(() => setToast(null), []);

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{t('page.triage')}</h1>
          <p className="text-sm text-slate-500">{t('triageSubtitle')}</p>
        </div>
      </div>

      <KpiCards claims={claims} audit={audit} />

      <div className="rounded-xl border border-slate-200 bg-white">
        <FilterBar filters={full} counts={counts} onChange={({ search: _s, ...f }) => setFilters(f)} />
        <ClaimsTable claims={visible} total={claims.length} selectedId={openId} onOpen={setOpenId} onClear={clearFilters} />
      </div>

      {open && (
        <ClaimDrawer
          key="drawer"
          claim={open}
          index={index}
          total={visible.length}
          onPrev={() => step(-1)}
          onNext={() => step(1)}
          onClose={() => setOpenId(null)}
          onApprove={() => { approve(open.id); afterAction(open.id, t('toastApproved', { id: open.id, route: tRoute(lang, open.suggestedRoute) })); }}
          onEdit={(r) => { edit(open.id, r); afterAction(open.id, t('toastRerouted', { id: open.id, route: tRoute(lang, r) })); }}
          onReject={(reason) => { reject(open.id, reason); afterAction(open.id, t('toastRejected', { id: open.id })); }}
        />
      )}

      <Toast msg={toast} onDone={hideToast} />
    </div>
  );
}
