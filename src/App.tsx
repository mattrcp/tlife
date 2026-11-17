import { useState } from 'react';
import Sidebar, { type Page } from './components/Sidebar';
import { useLang } from './i18n/lang';
import { tPage } from './i18n/strings';
import TopBar from './components/TopBar';
import TriagePage from './pages/TriagePage';
import AuditLogPage from './pages/AuditLogPage';
import RulesPage from './pages/RulesPage';
import PlaceholderPage from './pages/PlaceholderPage';
import { useClaimsStore } from './state/store';
import { kpis } from './lib/queue';

export default function App() {
  const [page, setPage] = useState<Page>('triage');
  const [search, setSearch] = useState('');
  const [navOpen, setNavOpen] = useState(false);
  const { state, approve, edit, reject } = useClaimsStore();
  const { lang } = useLang();

  const navigate = (p: Page) => { setPage(p); setNavOpen(false); };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar page={page} onNavigate={navigate} open={navOpen} onClose={() => setNavOpen(false)} triageCount={kpis(state.claims).waiting} auditCount={state.audit.length} />
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <TopBar title={tPage(lang, page)} search={search} onSearch={page === 'triage' ? setSearch : undefined} onMenu={() => setNavOpen(true)} />
        {page === 'triage' ? (
          <TriagePage claims={state.claims} audit={state.audit} search={search} onClearSearch={() => setSearch('')} approve={approve} edit={edit} reject={reject} />
        ) : page === 'audit' ? (
          <AuditLogPage entries={state.audit} />
        ) : page === 'rules' ? (
          <RulesPage />
        ) : (
          <PlaceholderPage name={tPage(lang, page)} onBack={() => setPage('triage')} />
        )}
      </div>
    </div>
  );
}
