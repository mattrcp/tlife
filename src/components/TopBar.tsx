import { Bell, Menu, Search, Sparkles } from 'lucide-react';
import { useLang } from '../i18n/lang';
import type { Lang } from '../i18n/strings';

interface Props { title: string; search?: string; onSearch?: (s: string) => void; onMenu?: () => void }

function LangToggle() {
  const { lang, setLang, t } = useLang();
  const langs: Lang[] = ['th', 'en'];
  return (
    <div role="group" aria-label={t('langSwitch')} className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-[11px] font-semibold">
      {langs.map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`rounded-md px-2 py-0.5 uppercase transition ${lang === l ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

export default function TopBar({ title, search, onSearch, onMenu }: Props) {
  const { t } = useLang();
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-4 sm:gap-4 sm:px-6">
      <button onClick={onMenu} aria-label={t('openMenu')} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 active:scale-95 lg:hidden">
        <Menu size={20} />
      </button>
      <div className="hidden text-sm text-slate-500 md:block">
        {t('breadcrumb')} <span className="mx-1 text-slate-300">/</span> <span className="font-semibold text-slate-900">{title}</span>
      </div>

      {onSearch && (
        <label className="flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 focus-within:border-blue-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 md:ml-4 md:max-w-sm">
          <Search size={15} className="text-slate-400" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
          />
        </label>
      )}

      <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
        <span className="hidden items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-medium text-violet-700 ring-1 ring-inset ring-violet-200 lg:inline-flex">
          <Sparkles size={12} /> {t('aiModelTag')}
        </span>
        <button className="relative grid h-8 w-8 place-items-center rounded-full text-slate-500 hover:bg-slate-100" aria-label={t('notifications')}>
          <Bell size={17} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>
        <LangToggle />
      </div>
    </header>
  );
}
