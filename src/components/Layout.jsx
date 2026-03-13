import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import './Layout.css';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === '/';

  return (
    <div className="layout">
      <header className="header">
        <div className="header-left">
          {!isHome && (
            <button
              className="back-button"
              onClick={() => navigate('/')}
              aria-label="ダッシュボードに戻る"
            >
              ←
            </button>
          )}
          <h1 className="header-title" onClick={() => navigate('/')}>
            MedCalc
          </h1>
        </div>
        <div className="header-right">
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={isDark ? 'ライトモードに切替' : 'ダークモードに切替'}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
          {user && (
            <div className="user-menu">
              <img
                src={user.photoURL || ''}
                alt=""
                className="user-avatar"
                referrerPolicy="no-referrer"
              />
              <button className="logout-button" onClick={logout}>
                ログアウト
              </button>
            </div>
          )}
        </div>
      </header>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
