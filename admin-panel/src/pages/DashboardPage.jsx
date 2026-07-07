import { Activity, Database, ToggleRight } from 'lucide-react';

export default function DashboardPage({ effects }) {
  const activeCount = effects.filter((effect) => effect.isActive).length;
  const inactiveCount = Math.max(effects.length - activeCount, 0);

  return (
    <section className="page-section">
      <header className="page-header">
        <div>
          <p className="eyebrow">Özet</p>
          <h1>Panel Durumu</h1>
        </div>
      </header>

      <div className="metric-grid">
        <Metric icon={Database} label="Toplam Efekt" value={effects.length} />
        <Metric icon={ToggleRight} label="Aktif Efekt" value={activeCount} />
        <Metric icon={Activity} label="Pasif Efekt" value={inactiveCount} />
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
