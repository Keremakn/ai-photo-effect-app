import { useEffect, useState } from 'react';
import { History, Images, LayoutDashboard, LogOut, Sparkles, Users } from 'lucide-react';
import { getCurrentAdmin, getStoredAdminToken, logoutAdmin } from './api/authApi.js';
import DashboardPage from './pages/DashboardPage.jsx';
import EffectsPage from './pages/EffectsPage.jsx';
import GenerationsPage from './pages/GenerationsPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import MyGenerationsPage from './pages/MyGenerationsPage.jsx';
import UsersPage from './pages/UsersPage.jsx';

const tabs = [
  { id: 'effects', label: 'Efektler', icon: Sparkles },
  { id: 'dashboard', label: 'Özet', icon: LayoutDashboard },
  { id: 'generations', label: 'Loglar', icon: History },
  { id: 'users', label: 'Kullanıcılar', icon: Users },
];

const userTabs = [
  { id: 'my-generations', label: 'Geçmişim', icon: History },
];

function getInitialTab() {
  const tab = new URLSearchParams(window.location.search).get('tab');
  return tab || 'effects';
}

export default function App() {
  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [user, setUser] = useState(null);
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
          setUser(currentAdmin);
        }
      })
      .catch(() => {
        logoutAdmin();
        if (isMounted) {
          setUser(null);
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
      setUser(null);
    }

    window.addEventListener('admin-auth-expired', handleAuthExpired);

    return () => {
      window.removeEventListener('admin-auth-expired', handleAuthExpired);
    };
  }, []);

  useEffect(() => {
    const nextPath = user ? `/?tab=${activeTab}` : '/login';

    if (`${window.location.pathname}${window.location.search}` !== nextPath) {
      window.history.replaceState(null, '', nextPath);
    }
  }, [activeTab, user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const allowedTabs = user.role === 'admin'
      ? tabs.map((tab) => tab.id)
      : userTabs.map((tab) => tab.id);

    if (!allowedTabs.includes(activeTab)) {
      setActiveTab(allowedTabs[0]);
    }
  }, [activeTab, user]);

  function handleLogin(nextUser) {
    setUser(nextUser);
  }

  function handleLogout() {
    logoutAdmin();
    setUser(null);
    setActiveTab('effects');
  }

  if (isCheckingAuth) {
    return (
      <main className="login-shell">
        <div className="loading-panel">Oturum kontrol ediliyor...</div>
      </main>
    );
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const visibleTabs = user.role === 'admin' ? tabs : userTabs;
  const shellLabel = user.role === 'admin' ? 'Admin' : 'Kullanıcı';

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <Images size={22} strokeWidth={2.1} />
          </div>
          <div>
            <strong>AI Photo Effects</strong>
            <span>{shellLabel}</span>
          </div>
        </div>

        <nav className="nav-list" aria-label={shellLabel}>
          {visibleTabs.map((tab) => {
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
          <span>{user.email}</span>
          <button className="nav-item" type="button" onClick={handleLogout} title="Cikis">
            <LogOut size={18} strokeWidth={2.1} />
            <span>Cikis</span>
          </button>
        </div>
      </aside>

      <main className="main-area">
        {activeTab === 'dashboard' && <DashboardPage />}
        {activeTab === 'effects' && <EffectsPage />}
        {activeTab === 'generations' && <GenerationsPage />}
        {activeTab === 'users' && <UsersPage />}
        {activeTab === 'my-generations' && <MyGenerationsPage />}
      </main>
    </div>
  );
}
