import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import logoIcon from '../assets/logo-icon.png';
import './Login.css';

export default function Login() {
  const { login, isAuthenticated, loading } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>読み込み中...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-logo">
          <img src={logoIcon} alt="MedCalc Logo" className="login-logo-img" />
          <h1 className="login-title">MedCalc</h1>
          <p className="login-subtitle">医療用計算機アプリ</p>
        </div>

        <button className="google-login-button" onClick={login} id="google-login-btn">
          <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Googleでログイン
        </button>

        <p className="login-note">
          個人利用の医療計算ツールです
        </p>
      </div>

      <button
        className="login-theme-toggle"
        onClick={toggleTheme}
        aria-label={isDark ? 'ライトモードに切替' : 'ダークモードに切替'}
      >
        {isDark ? '☀️' : '🌙'}
      </button>
    </div>
  );
}
