import { ScrollText } from 'lucide-react';
import type { AuditEntry } from '../types';
import { ScoreBadge } from '../components/ui';
import { fmtLong } from '../lib/format';

const ACTION = {
  approved: { label: 'Approved AI route', cls: 'text-emerald-700 bg-emerald-50 ring-emerald-200' },
  edited: { label: 'Changed route', cls: 'text-violet-700 bg-violet-50 ring-violet-200' },
  rejected: { label: 'Rejected', cls: 'text-rose-700 bg-rose-50 ring-rose-200' },
};

export default function AuditLogPage({ entries }: { entries: AuditEntry[] }) {
  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Audit log</h1>
        <p className="text-sm text-slate-500">Every AI suggestion and officer decision is recorded, showing who decided, when, and what the AI proposed.</p>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        {entries.length === 0 ? (
          <div className="grid place-items-center px-6 py-16 text-center">
            <ScrollText className="mb-3 text-slate-300" size={28} />
            <p className="text-sm font-medium text-slate-700">No decisions yet</p>
            <p className="text-sm text-slate-500">Approve, edit or reject a claim in the Triage queue to see it here.</p>
          </div>
        ) : (
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-500">
              <tr>
                {['Time', 'Claim', 'Client', 'AI score', 'AI suggested route', 'Officer decision', 'Final route / reason', 'Officer'].map((h) => (
                  <th key={h} className="px-4 py-2.5 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {entries.map((e, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500">{fmtLong(e.at)}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs">{e.claimId}</td>
                  <td className="px-4 py-3">{e.client}</td>
                  <td className="px-4 py-3"><ScoreBadge score={e.aiScore} /></td>
                  <td className="px-4 py-3 text-slate-600">{e.aiRoute}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${ACTION[e.action].cls}`}>{ACTION[e.action].label}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{e.action === 'rejected' ? `“${e.reason}”` : e.finalRoute}</td>
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
