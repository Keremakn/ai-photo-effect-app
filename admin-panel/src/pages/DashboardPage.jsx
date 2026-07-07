import { useEffect, useMemo, useState } from 'react';
import { Activity, Database, ToggleRight } from 'lucide-react';
import { getAdminEffects } from '../api/effectApi.js';

export default function DashboardPage() {
  const [effects, setEffects] = useState([]);

  useEffect(() => {
    getAdminEffects()
      .then(setEffects)
      .catch(() => setEffects([]));
  }, []);

  const stats = useMemo(() => {
    const active = effects.filter((effect) => effect.isActive).length;

    return {
      total: effects.length,
      active,
      inactive: Math.max(effects.length - active, 0),
    };
  }, [effects]);

  return (
    <section className="page-section">
      <header className="page-header">
        <div>
          <p className="eyebrow">Özet</p>
          <h1>Panel Durumu</h1>
        </div>
      </header>

      <div className="metric-grid">
        <Metric icon={Database} label="Toplam Efekt" value={stats.total} />
        <Metric icon={ToggleRight} label="Aktif Efekt" value={stats.active} />
        <Metric icon={Activity} label="Pasif Efekt" value={stats.inactive} />
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
