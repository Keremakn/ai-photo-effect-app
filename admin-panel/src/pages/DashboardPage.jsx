import { useEffect, useMemo, useState } from 'react';
import { Activity, Database, Image, ToggleRight, Users } from 'lucide-react';
import { getAdminDashboardStats, getAdminUsers } from '../api/adminApi.js';
import { getAdminEffects } from '../api/effectApi.js';
import { getApiErrorMessage } from '../api/apiClient.js';

export default function DashboardPage() {
  const [effects, setEffects] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getAdminEffects(), getAdminDashboardStats(), getAdminUsers()])
      .then(([effectsData, statsData, usersData]) => {
        setEffects(effectsData);
        setDashboardStats(statsData);
        setUsers(usersData);
      })
      .catch((requestError) => {
        setEffects([]);
        setDashboardStats(null);
        setUsers([]);
        setError(getApiErrorMessage(requestError));
      });
  }, []);

  const stats = useMemo(() => {
    const active = effects.filter((effect) => effect.isActive).length;

    return {
      total: effects.length,
      active,
      inactive: Math.max(effects.length - active, 0),
      generations: dashboardStats?.dailyGenerations?.reduce((total, item) => total + item.total, 0) || 0,
      users: users.length,
      activeUsers: dashboardStats?.activeUsers30d || 0,
    };
  }, [dashboardStats, effects, users]);

  return (
    <section className="page-section">
      <header className="page-header">
        <div>
          <p className="eyebrow">Özet</p>
          <h1>Panel Durumu</h1>
        </div>
      </header>

      {error && <div className="feedback error">{error}</div>}

      <div className="metric-grid">
        <Metric icon={Database} label="Toplam Efekt" value={stats.total} />
        <Metric icon={ToggleRight} label="Aktif Efekt" value={stats.active} />
        <Metric icon={Activity} label="Pasif Efekt" value={stats.inactive} />
        <Metric icon={Image} label="Üretim Logu" value={stats.generations} />
        <Metric icon={Users} label="Kullanıcı" value={stats.users} />
        <Metric icon={Users} label="Aktif Kullanıcı" value={stats.activeUsers} />
      </div>

      {dashboardStats && (
        <div className="dashboard-grid">
          <ChartPanel title="Günlük Üretim" items={dashboardStats.dailyGenerations} labelKey="date" />
          <ChartPanel title="Popüler Efektler" items={dashboardStats.topEffects} labelKey="effectName" />
        </div>
      )}
    </section>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="metric">
      <Icon size={20} strokeWidth={2.1} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ChartPanel({ title, items, labelKey }) {
  const maxValue = Math.max(...items.map((item) => item.total), 1);

  return (
    <div className="panel chart-panel">
      <div className="panel-header">
        <div>
          <h2>{title}</h2>
          <p>{items.length} kayıt</p>
        </div>
      </div>
      <div className="bar-list">
        {items.map((item) => (
          <div className="bar-row" key={item[labelKey]}>
            <span>{String(item[labelKey]).slice(0, 18)}</span>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${Math.max((item.total / maxValue) * 100, 6)}%` }} />
            </div>
            <strong>{item.total}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
