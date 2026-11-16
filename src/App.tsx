import { useState } from 'react';
import Sidebar, { PAGE_TITLES, type Page } from './components/Sidebar';
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

  const navigate = (p: Page) => { setPage(p); setNavOpen(false); };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar page={page} onNavigate={navigate} open={navOpen} onClose={() => setNavOpen(false)} triageCount={kpis(state.claims).waiting} auditCount={state.audit.length} />
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <TopBar title={PAGE_TITLES[page]} search={search} onSearch={page === 'triage' ? setSearch : undefined} onMenu={() => setNavOpen(true)} />
        {page === 'triage' ? (
          <TriagePage claims={state.claims} audit={state.audit} search={search} onClearSearch={() => setSearch('')} approve={approve} edit={edit} reject={reject} />
        ) : page === 'audit' ? (
          <AuditLogPage entries={state.audit} />
        ) : page === 'rules' ? (
          <RulesPage />
        ) : (
          <PlaceholderPage name={PAGE_TITLES[page]} onBack={() => setPage('triage')} />
        )}
      </div>
    </div>
  );
}
