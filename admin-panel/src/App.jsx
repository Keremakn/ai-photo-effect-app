import { useEffect, useState } from 'react';
import { Images, LayoutDashboard, LogOut, Sparkles } from 'lucide-react';
import { getCurrentAdmin, getStoredAdminToken, logoutAdmin } from './api/authApi.js';
import DashboardPage from './pages/DashboardPage.jsx';
import EffectsPage from './pages/EffectsPage.jsx';
import LoginPage from './pages/LoginPage.jsx';

const tabs = [
  { id: 'effects', label: 'Efektler', icon: Sparkles },
  { id: 'dashboard', label: 'Özet', icon: LayoutDashboard },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('effects');
  const [admin, setAdmin] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(Boolean(getStoredAdminToken()));

  useEffect(() => {
    if (!getStoredAdminToken()) {
      setIsCheckingAuth(false);
      return undefined;
    }

    let isMounted = true;

    getCurrentAdmin()
      .then((currentAdmin) => {
        if (isMounted) {
          setAdmin(currentAdmin);
        }
      })
      .catch(() => {
        logoutAdmin();
        if (isMounted) {
          setAdmin(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsCheckingAuth(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    function handleAuthExpired() {
      setAdmin(null);
    }

    window.addEventListener('admin-auth-expired', handleAuthExpired);

    return () => {
      window.removeEventListener('admin-auth-expired', handleAuthExpired);
    };
  }, []);

  useEffect(() => {
    const nextPath = admin ? '/' : '/login';

    if (window.location.pathname !== nextPath) {
      window.history.replaceState(null, '', nextPath);
    }
  }, [admin]);

  function handleLogin(nextAdmin) {
    setAdmin(nextAdmin);
  }

  function handleLogout() {
    logoutAdmin();
    setAdmin(null);
    setActiveTab('effects');
  }

  if (isCheckingAuth) {
    return (
      <main className="login-shell">
        <div className="loading-panel">Oturum kontrol ediliyor...</div>
      </main>
    );
  }

  if (!admin) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <Images size={22} strokeWidth={2.1} />
          </div>
          <div>
            <strong>AI Photo Effects</strong>
            <span>Admin</span>
          </div>
        </div>

        <nav className="nav-list" aria-label="Admin">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                className={isActive ? 'nav-item active' : 'nav-item'}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                title={tab.label}
              >
                <Icon size={18} strokeWidth={2.1} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <span>{admin.email}</span>
          <button className="nav-item" type="button" onClick={handleLogout} title="Cikis">
            <LogOut size={18} strokeWidth={2.1} />
            <span>Cikis</span>
          </button>
        </div>
      </aside>

      <main className="main-area">
        {activeTab === 'dashboard' ? <DashboardPage /> : <EffectsPage />}
      </main>
    </div>
  );
}
