import { useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';

export interface ToastMsg { id: number; text: string }

export default function Toast({ msg, onDone }: { msg: ToastMsg | null; onDone: () => void }) {
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [msg, onDone]);
  if (!msg) return null;
  return (
    <div key={msg.id} className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 animate-[toast_.2s_ease-out]">
      <div className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm text-white shadow-xl">
        <CheckCircle2 size={16} className="text-emerald-400" /> {msg.text}
      </div>
    </div>
  );
}
