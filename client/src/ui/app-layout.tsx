import { ReactElement, useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { clearToken, getToken } from '../api';

const THEME_STORAGE_KEY = 'wishcircle-theme';
type AppTheme = 'light' | 'dark';

/** Shared shell for WishCircle pages. */
export function AppLayout(): ReactElement {
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState<AppTheme>(() => getStoredTheme());
  const hasToken = Boolean(getToken());
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register';
  const isBirthdayRoute = location.pathname.startsWith('/b/');
  const toggleTheme = (): void => {
    setTheme((currentTheme) => currentTheme === 'dark' ? 'light' : 'dark');
  };
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);
  const executeLogout = (): void => {
    clearToken();
    navigate('/login');
  };
  if (isAuthRoute || isBirthdayRoute) {
    return (
      <>
        <button
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          className="theme-toggle floating-theme-toggle"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Light theme' : 'Dark theme'}
          type="button"
        >
          <span className="material-symbols-outlined">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
        </button>
        <Outlet />
      </>
    );
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
          <button
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            className="theme-toggle"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Light theme' : 'Dark theme'}
            type="button"
          >
            <span className="material-symbols-outlined">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
          </button>
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

function getStoredTheme(): AppTheme {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
