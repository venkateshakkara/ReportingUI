import React, { useEffect, useState } from 'react';
import StatementCountsPage from './components/StatementCountsPage';
import TransactionsTable from './components/TransactionsTable';
import './App.css';

const routes = {
  dashboard: '/',
  statementCounts: '/statement-counts',
};

const App = () => {
  const [pathname, setPathname] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setPathname(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (nextPath) => {
    if (nextPath === pathname) return;
    window.history.pushState({}, '', nextPath);
    setPathname(nextPath);
  };

  const isStatementCountsPage = pathname === routes.statementCounts;

  return (
      <div className="container">
        <nav className="top-nav" aria-label="Report navigation">
          <button
            className={pathname === routes.dashboard ? 'nav-link nav-link-active' : 'nav-link'}
            onClick={() => navigate(routes.dashboard)}
            type="button"
          >
            Dashboard
          </button>
          <button
            className={isStatementCountsPage ? 'nav-link nav-link-active' : 'nav-link'}
            onClick={() => navigate(routes.statementCounts)}
            type="button"
          >
            Statement Counts
          </button>
        </nav>
        <header className="page-header">
          <div className="eyebrow">Finance Reporting</div>
          <h1>{isStatementCountsPage ? 'Statement Count Lookup' : 'Transaction Reporting Console'}</h1>
          <p className="page-copy">
            {isStatementCountsPage
              ? 'Search reconciliation statement counts by start date and end date, then review the returned daily rows in a table.'
              : 'Monitor billing, matching, and transaction flow from a single operational view.'}
          </p>
        </header>
        {isStatementCountsPage ? <StatementCountsPage /> : <TransactionsTable />}
      </div>
  );
};

export default App;
