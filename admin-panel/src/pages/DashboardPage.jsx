import { useEffect, useMemo, useState } from 'react';
import { Activity, Database, Image, ToggleRight, Users } from 'lucide-react';
import { getAdminGenerations, getAdminUsers } from '../api/adminApi.js';
import { getAdminEffects } from '../api/effectApi.js';
import { getApiErrorMessage } from '../api/apiClient.js';

export default function DashboardPage() {
  const [effects, setEffects] = useState([]);
  const [generations, setGenerations] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getAdminEffects(), getAdminGenerations(), getAdminUsers()])
      .then(([effectsData, generationsData, usersData]) => {
        setEffects(effectsData);
        setGenerations(generationsData);
        setUsers(usersData);
      })
      .catch((requestError) => {
        setEffects([]);
        setGenerations([]);
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
      generations: generations.length,
      users: users.length,
    };
  }, [effects, generations, users]);

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
      </div>
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
