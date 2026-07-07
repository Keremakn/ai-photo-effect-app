import { Pencil, Power, Trash2 } from 'lucide-react';

export default function EffectTable({
  effects,
  isLoading,
  selectedEffectId,
  onEdit,
  onToggle,
  onDelete,
}) {
  return (
    <div className="panel table-panel">
      <div className="panel-header">
        <div>
          <h2>Efektler</h2>
          <p>{isLoading ? 'Yükleniyor' : `${effects.length} kayıt`}</p>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Ad</th>
              <th>Durum</th>
              <th>Prompt</th>
              <th aria-label="İşlemler"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan="4" className="empty-cell">Yükleniyor</td>
              </tr>
            )}

            {!isLoading && effects.length === 0 && (
              <tr>
                <td colSpan="4" className="empty-cell">Kayıt yok</td>
              </tr>
            )}

            {!isLoading && effects.map((effect) => (
              <tr key={effect.id} className={selectedEffectId === effect.id ? 'selected-row' : ''}>
                <td>
                  <strong>{effect.name}</strong>
                  <span className="muted">{effect.id}</span>
                </td>
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
