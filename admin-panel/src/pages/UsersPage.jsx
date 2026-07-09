import { useEffect, useMemo, useState } from 'react';
import { ArrowUpDown, Search } from 'lucide-react';
import { getAdminUserDetail, getAdminUserGenerations, getAdminUsers, updateAdminUserRole } from '../api/adminApi.js';
import { getApiErrorMessage } from '../api/apiClient.js';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState('');
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [selectedGenerations, setSelectedGenerations] = useState([]);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  useEffect(() => {
    getAdminUsers()
      .then(setUsers)
      .catch((requestError) => setError(getApiErrorMessage(requestError)))
      .finally(() => setIsLoading(false));
  }, []);

  const visibleUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filteredUsers = normalizedQuery
      ? users.filter((user) => [
        user.email,
        user.role,
        formatDate(user.createdAt),
      ].join(' ').toLowerCase().includes(normalizedQuery))
      : users;

    return [...filteredUsers].sort((first, second) => compareValues(
      getUserSortValue(first, sortConfig.key),
      getUserSortValue(second, sortConfig.key),
      sortConfig.direction
    ));
  }, [query, sortConfig, users]);

  function handleSort(key) {
    setSortConfig((currentSort) => ({
      key,
      direction: currentSort.key === key && currentSort.direction === 'asc' ? 'desc' : 'asc',
    }));
  }

  async function handleRoleChange(user, role) {
    setUpdatingUserId(user.id);
    setError('');
    setNotice('');

    try {
      const updatedUser = await updateAdminUserRole(user.id, role);
      setUsers((currentUsers) => currentUsers.map((currentUser) => (
        currentUser.id === updatedUser.id ? updatedUser : currentUser
      )));
      if (selectedDetail?.user.id === updatedUser.id) {
        await loadUserDetail(updatedUser.id);
      }
      setNotice(`${updatedUser.email} rolü ${updatedUser.role} olarak güncellendi.`);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setUpdatingUserId('');
    }
  }

  async function loadUserDetail(id) {
    setIsDetailLoading(true);
    setError('');

    try {
      const [detail, generations] = await Promise.all([
        getAdminUserDetail(id),
        getAdminUserGenerations(id, { page: 1, limit: 100 }),
      ]);
      setSelectedDetail(detail);
      setSelectedGenerations(generations.items || []);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsDetailLoading(false);
    }
  }

  return (
    <section className="page-section">
      <header className="page-header">
        <div>
          <p className="eyebrow">Kullanıcılar</p>
          <h1>Hesaplar ve Roller</h1>
        </div>
      </header>

      {error && <div className="feedback error">{error}</div>}
      {notice && <div className="feedback success">{notice}</div>}

      <div className="panel">
        <div className="panel-header">
          <div>
            <h2>Kullanıcılar</h2>
            <p>{isLoading ? 'Yukleniyor' : `${visibleUsers.length} kayıt`}</p>
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
                <th><SortButton label="Email" sortKey="email" sortConfig={sortConfig} onSort={handleSort} /></th>
                <th><SortButton label="Rol" sortKey="role" sortConfig={sortConfig} onSort={handleSort} /></th>
                <th><SortButton label="Oluşturulma" sortKey="createdAt" sortConfig={sortConfig} onSort={handleSort} /></th>
                <th>Yetki</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td className="empty-cell" colSpan="4">Yukleniyor...</td>
                </tr>
              )}
              {!isLoading && visibleUsers.length === 0 && (
                <tr>
                  <td className="empty-cell" colSpan="4">Kullanici bulunamadi.</td>
                </tr>
              )}
              {!isLoading && visibleUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <button className="link-button" type="button" onClick={() => loadUserDetail(user.id)}>
                      <strong>{user.email}</strong>
                    </button>
                  </td>
                  <td><span className={user.role === 'admin' ? 'status active' : 'status inactive'}>{user.role}</span></td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>
                    <select
                      className="role-select"
                      value={user.role}
                      disabled={updatingUserId === user.id}
                      onChange={(event) => handleRoleChange(user, event.target.value)}
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {(selectedDetail || isDetailLoading) && (
        <div className="panel detail-panel">
          <div className="panel-header">
            <div>
              <h2>Kullanıcı Detayı</h2>
              <p>{isDetailLoading ? 'Yükleniyor' : selectedDetail.user.email}</p>
            </div>
          </div>
          {isDetailLoading ? (
            <div className="empty-cell">Yükleniyor...</div>
          ) : (
            <div className="detail-grid">
              <div>
                <h3>Profil</h3>
                <p><strong>Email:</strong> {selectedDetail.user.email}</p>
                <p><strong>Rol:</strong> {selectedDetail.user.role}</p>
                <p><strong>Kayıt:</strong> {formatDate(selectedDetail.user.createdAt)}</p>
              </div>
              <div>
                <h3>Role Geçmişi</h3>
                {selectedDetail.roleHistory.length === 0 && <p className="muted">Role değişimi yok.</p>}
                {selectedDetail.roleHistory.map((item) => (
                  <p key={item.id}>
                    {item.previousRole} → {item.nextRole}
                    <span className="muted">{formatDate(item.createdAt)} · {item.changedByEmail || 'system'}</span>
                  </p>
                ))}
              </div>
              <div>
                <h3>Üretimler</h3>
                {selectedGenerations.length === 0 && <p className="muted">Üretim kaydı yok.</p>}
                {selectedGenerations.map((generation) => (
                  <p key={generation.id}>
                    {generation.effectName}
                    <span className="muted">{formatDate(generation.createdAt)} · {generation.provider}</span>
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
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

function getUserSortValue(user, key) {
  if (key === 'createdAt') {
    return new Date(user.createdAt || 0).getTime();
  }

  return String(user[key] ?? '').toLowerCase();
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
