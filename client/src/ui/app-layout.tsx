import { ReactElement } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { clearToken, getToken } from '../api';

/** Shared shell for WishCircle pages. */
export function AppLayout(): ReactElement {
  const navigate = useNavigate();
  const location = useLocation();
  const hasToken = Boolean(getToken());
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register';
  const isBirthdayRoute = location.pathname.startsWith('/b/');
  const executeLogout = (): void => {
    clearToken();
    navigate('/login');
  };
  if (isAuthRoute || isBirthdayRoute) {
    return <Outlet />;
  }
  return (
    <div className="app-shell">
      <header className="shell-nav">
        <div className="nav-cluster">
          <Link className="nav-logo brand-gradient" to="/dashboard">WishCircle</Link>
          <nav className="nav-links">
            <Link className="nav-link active" to="/dashboard">Groups</Link>
            <Link className="nav-link" to="/dashboard">Calendar</Link>
            <Link className="nav-link" to="/dashboard">Memories</Link>
          </nav>
        </div>
        <div className="nav-actions">
          <button aria-label="Notifications" className="icon-button" type="button">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          {hasToken ? (
            <button className="secondary-button" onClick={executeLogout} type="button">Logout</button>
          ) : (
            <Link className="secondary-button" to="/login">Login</Link>
          )}
          <span className="avatar">WC</span>
        </div>
      </header>
      <main className="shell-main">
        <Outlet />
      </main>
      <nav className="mobile-bottom-nav">
        <Link className="bottom-item" to="/dashboard">
          <span className="material-symbols-outlined">home</span>
          Feed
        </Link>
        <Link className="bottom-item active" to="/dashboard">
          <span className="material-symbols-outlined">group</span>
          Groups
        </Link>
        <Link className="bottom-item" to="/dashboard">
          <span className="material-symbols-outlined">add_circle</span>
          Create
        </Link>
        <button className="bottom-item" onClick={hasToken ? executeLogout : () => navigate('/login')} type="button">
          <span className="material-symbols-outlined">person</span>
          Profile
        </button>
      </nav>
    </div>
  );
}
