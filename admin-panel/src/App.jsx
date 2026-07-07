import { useMemo, useState } from 'react';
import { Images, LayoutDashboard, Sparkles } from 'lucide-react';
import DashboardPage from './pages/DashboardPage.jsx';
import EffectsPage from './pages/EffectsPage.jsx';

const tabs = [
  { id: 'effects', label: 'Efektler', icon: Sparkles },
  { id: 'dashboard', label: 'Özet', icon: LayoutDashboard },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('effects');
  const [effectsSnapshot, setEffectsSnapshot] = useState([]);

  const activePage = useMemo(() => {
    if (activeTab === 'dashboard') {
      return <DashboardPage effects={effectsSnapshot} />;
    }

    return <EffectsPage onEffectsChange={setEffectsSnapshot} />;
  }, [activeTab, effectsSnapshot]);

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
      </aside>

      <main className="main-area">{activePage}</main>
    </div>
  );
}
