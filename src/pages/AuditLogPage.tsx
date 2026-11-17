import { ScrollText } from 'lucide-react';
import type { AuditEntry } from '../types';
import { ScoreBadge } from '../components/ui';
import { fmtLong } from '../lib/format';
import { useLang } from '../i18n/lang';
import { tClientById, tRoute } from '../i18n/strings';

const ACTION_CLS = {
  approved: 'text-emerald-700 bg-emerald-50 ring-emerald-200',
  edited: 'text-violet-700 bg-violet-50 ring-violet-200',
  rejected: 'text-rose-700 bg-rose-50 ring-rose-200',
};

export default function AuditLogPage({ entries }: { entries: AuditEntry[] }) {
  const { lang, t } = useLang();
  const cols = ['time', 'claim', 'client', 'score', 'aiRoute', 'decision', 'final', 'officer'];
  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">{t('page.audit')}</h1>
        <p className="text-sm text-slate-500">{t('auditSubtitle')}</p>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        {entries.length === 0 ? (
          <div className="grid place-items-center px-6 py-16 text-center">
            <ScrollText className="mb-3 text-slate-300" size={28} />
            <p className="text-sm font-medium text-slate-700">{t('auditEmpty')}</p>
            <p className="text-sm text-slate-500">{t('auditEmptySub')}</p>
          </div>
        ) : (
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-500">
              <tr>
                {cols.map((h) => (
                  <th key={h} className="px-4 py-2.5 font-medium">{t(`auditCol.${h}`)}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {entries.map((e, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500">{fmtLong(e.at, lang)}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs">{e.claimId}</td>
                  <td className="px-4 py-3">{tClientById(lang, e.claimId, e.client)}</td>
                  <td className="px-4 py-3"><ScoreBadge score={e.aiScore} /></td>
                  <td className="px-4 py-3 text-slate-600">{tRoute(lang, e.aiRoute)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${ACTION_CLS[e.action]}`}>{t(`action.${e.action}`)}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{e.action === 'rejected' ? `“${e.reason}”` : tRoute(lang, e.finalRoute ?? '')}</td>
                  <td className="px-4 py-3 text-slate-500">{e.officer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
