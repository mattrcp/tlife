import { ArrowLeft, Download, FileText, Image } from 'lucide-react';
import type { Claim, ClaimFile } from '../types';
import { fmtSize } from '../lib/format';

export default function FilePreview({ file, claim, onBack }: { file: ClaimFile; claim: Claim; onBack: () => void }) {
  const Icon = file.kind === 'pdf' ? FileText : Image;
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-3">
        <button onClick={onBack} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[13px] text-slate-600 hover:bg-slate-100">
          <ArrowLeft size={15} /> Back to claim
        </button>
        <span className="ml-2 flex min-w-0 items-center gap-1.5 text-[13px] font-medium text-slate-800">
          <Icon size={15} className="shrink-0 text-slate-400" /><span className="truncate">{file.name}</span>
        </span>
        <span className="ml-auto text-xs text-slate-500">{fmtSize(file.sizeKb)}</span>
        <button className="grid h-7 w-7 place-items-center rounded-md text-slate-500 hover:bg-slate-100" aria-label="Download"><Download size={15} /></button>
      </div>
      <div className="flex-1 overflow-y-auto bg-slate-100 p-6">
        <div className="mx-auto max-w-md rounded-sm bg-white p-8 shadow-md">
          <div className="mb-6 flex items-center justify-between border-b-2 border-slate-800 pb-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-800">{file.name.replace(/\.(pdf|jpg)$/, '').replace(/_/g, ' ')}</div>
              <div className="text-[10px] text-slate-500">Synthetic document · for demo only</div>
            </div>
            <div className="text-right font-mono text-[10px] text-slate-500">{claim.id}<br />{claim.policyNo}</div>
          </div>
          <div className="mb-4 grid grid-cols-2 gap-y-1 text-[11px]">
            <span className="text-slate-500">Name</span><span className="text-slate-700">{claim.client}</span>
            <span className="text-slate-500">Category</span><span className="text-slate-700">{claim.tags.join(', ')}</span>
          </div>
          <div className="space-y-2">
            {[100, 92, 96, 70, 88, 95, 60, 90, 82].map((w, i) => (
              <div key={i} className="h-2 rounded bg-slate-200" style={{ width: `${w}%` }} />
            ))}
          </div>
          {file.kind === 'image' && <div className="mt-6 grid h-32 place-items-center rounded bg-slate-200 text-[11px] text-slate-400">image preview</div>}
          <div className="mt-8 flex justify-end"><div className="h-8 w-24 border-b border-slate-400" /></div>
        </div>
      </div>
    </div>
  );
}
