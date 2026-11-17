import { Construction } from 'lucide-react';
import { useLang } from '../i18n/lang';

export default function PlaceholderPage({ name, onBack }: { name: string; onBack: () => void }) {
  const { t } = useLang();
  return (
    <div className="grid flex-1 place-items-center p-10">
      <div className="max-w-sm text-center">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400">
          <Construction size={22} />
        </div>
        <h2 className="text-base font-semibold text-slate-900">{name}</h2>
        <p className="mt-1 text-sm text-slate-500">{t('placeholderBody')}</p>
        <button onClick={onBack} className="mt-5 rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-ink transition hover:brightness-95 active:scale-[0.98]">
          {t('goToTriage')}
        </button>
      </div>
    </div>
  );
}
