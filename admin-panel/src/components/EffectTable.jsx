import { useMemo, useState } from 'react';
import { ArrowUpDown, Pencil, Power, Search, Trash2 } from 'lucide-react';

export default function EffectTable({
  effects,
  isLoading,
  selectedEffectId,
  onEdit,
  onToggle,
  onDelete,
}) {
  const [query, setQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  const visibleEffects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filteredEffects = normalizedQuery
      ? effects.filter((effect) => [
        effect.id,
        effect.name,
        effect.prompt,
        effect.description,
        effect.category,
        Array.isArray(effect.tags) ? effect.tags.join(' ') : '',
        effect.isActive ? 'aktif active' : 'pasif inactive',
      ].join(' ').toLowerCase().includes(normalizedQuery))
      : effects;

    return [...filteredEffects].sort((first, second) => {
      const firstValue = getSortValue(first, sortConfig.key);
      const secondValue = getSortValue(second, sortConfig.key);

      if (firstValue < secondValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }

      if (firstValue > secondValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }

      return 0;
    });
  }, [effects, query, sortConfig]);

  function handleSort(key) {
    setSortConfig((currentSort) => ({
      key,
      direction: currentSort.key === key && currentSort.direction === 'asc' ? 'desc' : 'asc',
    }));
  }

  return (
    <div className="panel table-panel">
      <div className="panel-header">
        <div>
          <h2>Efektler</h2>
          <p>{isLoading ? 'Yükleniyor' : `${visibleEffects.length} kayıt`}</p>
        </div>
        <label className="table-search">
          <Search size={16} strokeWidth={2.1} />
          <input
            type="search"
            placeholder="Ara"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th><SortButton label="Ad" sortKey="name" sortConfig={sortConfig} onSort={handleSort} /></th>
              <th><SortButton label="Kategori" sortKey="category" sortConfig={sortConfig} onSort={handleSort} /></th>
              <th><SortButton label="Durum" sortKey="isActive" sortConfig={sortConfig} onSort={handleSort} /></th>
              <th><SortButton label="Prompt" sortKey="prompt" sortConfig={sortConfig} onSort={handleSort} /></th>
              <th aria-label="İşlemler"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan="5" className="empty-cell">Yükleniyor</td>
              </tr>
            )}

            {!isLoading && visibleEffects.length === 0 && (
              <tr>
                <td colSpan="5" className="empty-cell">Kayıt yok</td>
              </tr>
            )}

            {!isLoading && visibleEffects.map((effect) => (
              <tr key={effect.id} className={selectedEffectId === effect.id ? 'selected-row' : ''}>
                <td>
                  <strong>{effect.name}</strong>
                  <span className="muted">{effect.id}</span>
                  {Array.isArray(effect.tags) && effect.tags.length > 0 && (
                    <span className="muted">{effect.tags.join(', ')}</span>
                  )}
                </td>
                <td>{effect.category || 'General'}</td>
                <td>
                  <button
                    className={effect.isActive ? 'status active' : 'status inactive'}
                    type="button"
                    onClick={() => onToggle(effect)}
                    title={effect.isActive ? 'Pasifleştir' : 'Aktifleştir'}
                  >
                    <Power size={14} strokeWidth={2.2} />
                    {effect.isActive ? 'Aktif' : 'Pasif'}
                  </button>
                </td>
                <td className="prompt-cell">{effect.prompt}</td>
                <td>
                  <div className="row-actions">
                    <button className="icon-button" type="button" onClick={() => onEdit(effect)} title="Düzenle">
                      <Pencil size={17} strokeWidth={2.1} />
                    </button>
                    <button className="icon-button danger" type="button" onClick={() => onDelete(effect)} title="Sil">
                      <Trash2 size={17} strokeWidth={2.1} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SortButton({ label, sortKey, sortConfig, onSort }) {
  const isActive = sortConfig.key === sortKey;

  return (
    <button className={isActive ? 'sort-button active' : 'sort-button'} type="button" onClick={() => onSort(sortKey)}>
      {label}
      <ArrowUpDown size={14} strokeWidth={2.2} />
      {isActive && <span>{sortConfig.direction === 'asc' ? 'A-Z' : 'Z-A'}</span>}
    </button>
  );
}

function getSortValue(effect, key) {
  if (key === 'isActive') {
    return effect.isActive ? 1 : 0;
  }

  return String(effect[key] ?? '').toLowerCase();
}
