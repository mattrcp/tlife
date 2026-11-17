import { useEffect, useRef, useState } from 'react';
import { Send, Sparkles, X } from 'lucide-react';
import type { Claim } from '../types';
import { LOW_CONFIDENCE } from '../lib/queue';
import { needsVerify } from '../lib/contacts';
import { fmtTHB } from '../lib/format';
import { scoreStyle, shortRoute } from './ui';

/**
 * A full-height AI assistant panel that docks to the left of the claim drawer. It is staged,
 * not live: every reply is written from the claim's pre-computed analysis (score, factors,
 * confidence, route, verify flags), then revealed with a short typing delay so it reads like a chat.
 */

interface Msg { role: 'ai' | 'user'; text: string }
type Kind = 'summary' | 'checks' | 'route' | 'score' | 'other';

const flaggedFactors = (c: Claim) =>
  c.factors.filter((f) => /mismatch|missing|unreadable|non-disclosure|unsigned|within|prior/i.test(f.label));

function buildReply(c: Claim, kind: Kind): string {
  const band = scoreStyle(c.aiScore).label.toLowerCase();
  const top = [...c.factors].sort((a, b) => b.points - a.points)[0];
  const flags = flaggedFactors(c);
  const lowConf = c.confidence < LOW_CONFIDENCE;
  const verify = needsVerify(c);

  if (kind === 'summary') {
    const lines = [
      `${c.client} is claiming ${fmtTHB(c.amount)} from ${c.hospital} (${c.tags.join(', ')}). I scored it ${c.aiScore}/100 — ${band} priority — and suggested routing to ${shortRoute(c.suggestedRoute)}.`,
      '',
      'What stands out:',
      ...c.factors.slice(0, 3).map((f) => `• ${f.label} (+${f.points})`),
    ];
    if (verify) {
      lines.push('', `⚠ Worth a second look: ${flags.map((f) => f.label.toLowerCase()).join('; ') || 'the AI is not fully sure here'}.`);
      if (lowConf) lines.push(`Confidence is only ${c.confidence}% (below the ${LOW_CONFIDENCE}% bar), so I would confirm with the hospital before approving.`);
    } else {
      lines.push('', 'Nothing looks off — the documents are complete and the figures are consistent, so this one is safe to action.');
    }
    return lines.join('\n');
  }

  if (kind === 'checks') {
    const items: string[] = [];
    if (lowConf) items.push(`Confidence is ${c.confidence}% — call the hospital coordinator to confirm the diagnosis and amount before deciding.`);
    flags.forEach((f) => items.push(`${f.label} — verify against the submitted documents.`));
    if (c.tags.includes('Missing doc')) items.push('A required document is missing or unreadable — request it before this can move forward.');
    if (!items.length) items.push('No red flags. Check the bill total against the policy limits, then this is ready to approve.');
    return ['Before you decide, I would check:', '', ...items.map((i) => `• ${i}`)].join('\n');
  }

  if (kind === 'route') {
    return [
      `I sent this to ${shortRoute(c.suggestedRoute)}.`,
      '',
      `It scored ${band} priority (${c.aiScore}/100), and the main driver is "${top.label}". ${
        verify ? 'Because something needs confirming, it should not be auto-paid — a person should look at it.' : 'The figures are clean, so it can move straight down this path.'
      }`,
      '',
      'You can override this with "Edit route" below if you disagree.',
    ].join('\n');
  }

  if (kind === 'score') {
    return [
      `The ${c.aiScore} is the sum of the signals I found:`,
      '',
      ...c.factors.map((f) => `• ${f.label}: +${f.points}`),
      '',
      `That lands in the ${band} band. Confidence (${c.confidence}%) is separate — it is how sure I am I read the files correctly.`,
    ].join('\n');
  }

  return 'In this demo I answer from the claim\'s staged analysis, so I keep to this case. Try one of the quick questions below — a summary, what to double-check, why I picked this route, or how the score was built.';
}

const QUICK: { label: string; kind: Kind }[] = [
  { label: 'Summarize this claim', kind: 'summary' },
  { label: 'What should I double-check?', kind: 'checks' },
  { label: 'Why this route?', kind: 'route' },
  { label: 'Explain the score', kind: 'score' },
];

export default function ClaimChat({ claim, onClose }: { claim: Claim; onClose: () => void }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }); }, [msgs, typing]);

  const ask = (text: string, kind: Kind) => {
    if (typing) return;
    setMsgs((m) => [...m, { role: 'user', text }]);
    setTyping(true);
    timer.current = setTimeout(() => {
      setTyping(false);
      setMsgs((m) => [...m, { role: 'ai', text: buildReply(claim, kind) }]);
    }, 750);
  };

  const send = () => {
    const t = draft.trim();
    if (!t) return;
    setDraft('');
    ask(t, 'other');
  };

  return (
    <div className="flex h-full w-full flex-col bg-slate-50">
      {/* Panel header */}
      <div className="flex items-center gap-2.5 border-b border-slate-200 bg-white px-4 py-3">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-violet-100 text-violet-600"><Sparkles size={15} /></span>
        <div className="min-w-0 flex-1 leading-tight">
          <div className="text-[13px] font-semibold text-slate-800">AI assistant</div>
          <div className="truncate text-[11px] text-slate-500">Staged · asks about this claim</div>
        </div>
        <button onClick={onClose} aria-label="Close assistant" className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X size={16} /></button>
      </div>

      {/* Transcript */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        <div className="msg-in max-w-[88%] rounded-2xl rounded-tl-sm bg-white px-3.5 py-2.5 text-[13px] leading-relaxed text-slate-700 shadow-sm ring-1 ring-slate-200">
          Hi — I’m the triage assistant for this claim. Tap a question below, or type your own.
        </div>

        {msgs.map((m, i) => (
          <div key={i} className={`mt-3 flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`msg-in max-w-[88%] whitespace-pre-line px-3.5 py-2.5 text-[13px] leading-relaxed shadow-sm ${
                m.role === 'user'
                  ? 'rounded-2xl rounded-tr-sm bg-blue-500 text-ink'
                  : 'rounded-2xl rounded-tl-sm bg-white text-slate-700 ring-1 ring-slate-200'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {typing && (
          <div className="mt-3 flex justify-start">
            <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-white px-3.5 py-3 shadow-sm ring-1 ring-slate-200">
              {[0, 1, 2].map((i) => (
                <span key={i} className="typing-dot h-1.5 w-1.5 rounded-full bg-slate-400" style={{ animationDelay: `${i * 0.16}s` }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-1.5 border-t border-slate-200 bg-white px-4 py-3">
        {QUICK.map((q) => (
          <button
            key={q.label}
            onClick={() => ask(q.label, q.kind)}
            disabled={typing}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-700 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 active:scale-[0.97] disabled:opacity-50"
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* Composer */}
      <div className="flex items-center gap-2 border-t border-slate-200 bg-white px-4 py-3">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); send(); } }}
          placeholder="Ask about this claim…"
          className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-[13px] outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
        />
        <button
          onClick={send}
          disabled={!draft.trim() || typing}
          aria-label="Send"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-violet-500 text-white transition hover:brightness-95 active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}
