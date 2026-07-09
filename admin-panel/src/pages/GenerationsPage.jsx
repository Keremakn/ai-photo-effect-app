import { useEffect, useMemo, useState } from 'react';
import { ArrowUpDown, Search } from 'lucide-react';
import { getAdminGenerations, getMyGenerations } from '../api/adminApi.js';
import { getApiErrorMessage } from '../api/apiClient.js';

export default function GenerationsPage({
  title = 'Loglar',
  eyebrow = 'Loglar',
  heading = 'Fotoğraf Üretimleri',
  scope = 'admin',
}) {
  const [generations, setGenerations] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  useEffect(() => {
    const request = scope === 'admin' ? getAdminGenerations : getMyGenerations;
    setIsLoading(true);

    request({
      page,
      limit: 10,
      ...(scope === 'user' && favoritesOnly ? { favorites: 'true' } : {}),
    })
      .then((payload) => {
        setGenerations(payload.items || payload);
        setPagination(payload.pagination || { page: 1, limit: 10, total: payload.length || 0, totalPages: 1 });
      })
      .catch((requestError) => setError(getApiErrorMessage(requestError)))
      .finally(() => setIsLoading(false));
  }, [favoritesOnly, page, scope]);

  const visibleGenerations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filteredGenerations = normalizedQuery
      ? generations.filter((generation) => [
        generation.userEmail || 'Misafir',
        generation.userRole || 'public',
        generation.effectName,
        generation.provider,
        formatDate(generation.createdAt),
      ].join(' ').toLowerCase().includes(normalizedQuery))
      : generations;

    return [...filteredGenerations].sort((first, second) => compareValues(
      getGenerationSortValue(first, sortConfig.key),
      getGenerationSortValue(second, sortConfig.key),
      sortConfig.direction
    ));
  }, [generations, query, sortConfig]);

  function handleSort(key) {
    setSortConfig((currentSort) => ({
      key,
      direction: currentSort.key === key && currentSort.direction === 'asc' ? 'desc' : 'asc',
    }));
  }

  return (
    <section className="page-section">
      <header className="page-header">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{heading}</h1>
        </div>
      </header>

      {error && <div className="feedback error">{error}</div>}

      <div className="panel">
        <div className="panel-header">
          <div>
            <h2>{title}</h2>
            <p>{isLoading ? 'Yukleniyor' : `${visibleGenerations.length} kayıt`}</p>
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
          {scope === 'user' && (
            <button
              className={favoritesOnly ? 'secondary-button active-filter' : 'secondary-button'}
              type="button"
              onClick={() => {
                setFavoritesOnly((current) => !current);
                setPage(1);
              }}
            >
              Favoriler
            </button>
          )}
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {scope === 'admin' && <th><SortButton label="Kullanıcı" sortKey="userEmail" sortConfig={sortConfig} onSort={handleSort} /></th>}
                <th><SortButton label="Efekt" sortKey="effectName" sortConfig={sortConfig} onSort={handleSort} /></th>
                <th><SortButton label="Provider" sortKey="provider" sortConfig={sortConfig} onSort={handleSort} /></th>
                <th><SortButton label="Tarih" sortKey="createdAt" sortConfig={sortConfig} onSort={handleSort} /></th>
                <th>Sonuç</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td className="empty-cell" colSpan={scope === 'admin' ? 5 : 4}>Yukleniyor...</td>
                </tr>
              )}
              {!isLoading && visibleGenerations.length === 0 && (
                <tr>
                  <td className="empty-cell" colSpan={scope === 'admin' ? 5 : 4}>Uretim kaydi bulunamadi.</td>
                </tr>
              )}
              {!isLoading && visibleGenerations.map((generation) => (
                <tr key={generation.id}>
                  {scope === 'admin' && (
                    <td>
                      <strong>{generation.userEmail || 'Misafir'}</strong>
                      <span className="muted">{generation.userRole || 'public'}</span>
                    </td>
                  )}
                  <td>{generation.effectName}</td>
                  <td>{generation.provider}</td>
                  <td>{formatDate(generation.createdAt)}</td>
                  <td>
                    <a href={generation.resultImageUrl} target="_blank" rel="noreferrer">
                      Görüntüle
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pagination-row">
          <button className="secondary-button" type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>
            Önceki
          </button>
          <span>Sayfa {pagination.page} / {pagination.totalPages} · {pagination.total} kayıt</span>
          <button className="secondary-button" type="button" disabled={page >= pagination.totalPages} onClick={() => setPage((current) => current + 1)}>
            Sonraki
          </button>
        </div>
      </div>
    </section>
  );
}

function SortButton({ label, sortKey, sortConfig, onSort }) {
  const isActive = sortConfig.key === sortKey;

  return (
    <button className={isActive ? 'sort-button active' : 'sort-button'} type="button" onClick={() => onSort(sortKey)}>
      {label}
      <ArrowUpDown size={14} strokeWidth={2.2} />
      {isActive && <span>{sortConfig.direction === 'asc' ? 'Artan' : 'Azalan'}</span>}
    </button>
  );
}

function getGenerationSortValue(generation, key) {
  if (key === 'createdAt') {
    return new Date(generation.createdAt || 0).getTime();
  }

  if (key === 'userEmail') {
    return String(generation.userEmail || 'Misafir').toLowerCase();
  }

  return String(generation[key] ?? '').toLowerCase();
}

function compareValues(firstValue, secondValue, direction) {
  if (firstValue < secondValue) {
    return direction === 'asc' ? -1 : 1;
  }

  if (firstValue > secondValue) {
    return direction === 'asc' ? 1 : -1;
  }

  return 0;
}

function formatDate(value) {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}
