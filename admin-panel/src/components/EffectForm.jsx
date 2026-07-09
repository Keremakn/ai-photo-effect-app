import { Save, X } from 'lucide-react';

export default function EffectForm({
  formState,
  isEditing,
  isSaving,
  onChange,
  onCancel,
  onSubmit,
}) {
  function updateField(field, value) {
    onChange({
      ...formState,
      [field]: value,
    });
  }

  return (
    <form className="panel form-panel" onSubmit={onSubmit}>
      <div className="panel-header">
        <div>
          <h2>{isEditing ? 'Efekti Düzenle' : 'Yeni Efekt'}</h2>
          <p>{isEditing ? formState.id : 'Yeni preset tanımı'}</p>
        </div>
      </div>

      <label>
        <span>Effect ID</span>
        <input
          value={formState.id}
          disabled={isEditing}
          onChange={(event) => updateField('id', event.target.value)}
          placeholder="oil-paint"
          required
        />
      </label>

      <label>
        <span>Ad</span>
        <input
          value={formState.name}
          onChange={(event) => updateField('name', event.target.value)}
          placeholder="Oil Paint"
          required
        />
      </label>

      <label>
        <span>Açıklama</span>
        <input
          value={formState.description}
          onChange={(event) => updateField('description', event.target.value)}
          placeholder="Painterly portrait style"
        />
      </label>

      <label>
        <span>Kategori</span>
        <input
          value={formState.category}
          onChange={(event) => updateField('category', event.target.value)}
          placeholder="Illustration"
        />
      </label>

      <label>
        <span>Tagler</span>
        <input
          value={formState.tags}
          onChange={(event) => updateField('tags', event.target.value)}
          placeholder="anime, portrait, vibrant"
        />
      </label>

      <label>
        <span>Prompt</span>
        <textarea
          value={formState.prompt}
          onChange={(event) => updateField('prompt', event.target.value)}
          placeholder="Transform this photo..."
          rows={10}
          required
        />
      </label>

      <label className="switch-row">
        <span>Aktif</span>
        <input
          type="checkbox"
          checked={formState.isActive}
          onChange={(event) => updateField('isActive', event.target.checked)}
        />
      </label>

      <div className="form-actions">
        {isEditing && (
          <button className="secondary-button" type="button" onClick={onCancel}>
            <X size={17} strokeWidth={2.1} />
            Vazgeç
          </button>
        )}
        <button className="primary-button" type="submit" disabled={isSaving}>
          <Save size={17} strokeWidth={2.1} />
          {isSaving ? 'Kaydediliyor' : 'Kaydet'}
        </button>
      </div>
    </form>
  );
}
