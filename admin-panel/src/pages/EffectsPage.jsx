import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, RefreshCcw } from 'lucide-react';
import EffectForm from '../components/EffectForm.jsx';
import EffectTable from '../components/EffectTable.jsx';
import {
  createEffect,
  deleteEffect,
  getAdminEffects,
  updateEffect,
} from '../api/effectApi.js';

const emptyForm = {
  id: '',
  name: '',
  description: '',
  prompt: '',
  isActive: true,
};

export default function EffectsPage() {
  const [effects, setEffects] = useState([]);
  const [selectedEffect, setSelectedEffect] = useState(null);
  const [formState, setFormState] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const isEditing = Boolean(selectedEffect);

  const stats = useMemo(() => {
    const active = effects.filter((effect) => effect.isActive).length;
    return {
      total: effects.length,
      active,
      inactive: effects.length - active,
    };
  }, [effects]);

  const loadEffects = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const data = await getAdminEffects();
      setEffects(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEffects();
  }, [loadEffects]);

  function startCreate() {
    setSelectedEffect(null);
    setFormState(emptyForm);
    setNotice('');
    setError('');
  }

  function startEdit(effect) {
    setSelectedEffect(effect);
    setFormState({
      id: effect.id,
      name: effect.name,
      description: effect.description,
      prompt: effect.prompt,
      isActive: effect.isActive,
    });
    setNotice('');
    setError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setNotice('');
    setError('');

    const payload = {
      id: formState.id.trim(),
      name: formState.name.trim(),
      description: formState.description.trim(),
      prompt: formState.prompt.trim(),
      isActive: formState.isActive,
    };

    if (isEditing) {
      delete payload.id;
    }

    try {
      await (isEditing
        ? updateEffect(selectedEffect.id, payload)
        : createEffect(payload));
      setNotice(isEditing ? 'Efekt güncellendi.' : 'Efekt eklendi.');
      await loadEffects();

      if (!isEditing) {
        setFormState(emptyForm);
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(effect) {
    const isConfirmed = window.confirm(`${effect.name} silinsin mi?`);

    if (!isConfirmed) {
      return;
    }

    setNotice('');
    setError('');

    try {
      await deleteEffect(effect.id);
      setNotice('Efekt silindi.');
      if (selectedEffect?.id === effect.id) {
        startCreate();
      }
      await loadEffects();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function handleToggle(effect) {
    setNotice('');
    setError('');

    try {
      await updateEffect(effect.id, { isActive: !effect.isActive });
      await loadEffects();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <section className="page-section">
      <header className="page-header">
        <div>
          <p className="eyebrow">Efekt Yönetimi</p>
          <h1>Prompt ve Presetler</h1>
        </div>
        <div className="header-actions">
          <button className="icon-button" type="button" onClick={loadEffects} title="Yenile">
            <RefreshCcw size={18} strokeWidth={2.1} />
          </button>
          <button className="primary-button" type="button" onClick={startCreate}>
            <Plus size={18} strokeWidth={2.1} />
            Yeni Efekt
          </button>
        </div>
      </header>

      <div className="summary-strip">
        <span>{stats.total} toplam</span>
        <span>{stats.active} aktif</span>
        <span>{stats.inactive} pasif</span>
      </div>

      {(notice || error) && (
        <div className={error ? 'feedback error' : 'feedback success'}>
          {error || notice}
        </div>
      )}

      <div className="work-grid">
        <EffectTable
          effects={effects}
          isLoading={isLoading}
          selectedEffectId={selectedEffect?.id}
          onEdit={startEdit}
          onToggle={handleToggle}
          onDelete={handleDelete}
        />

        <EffectForm
          formState={formState}
          isEditing={isEditing}
          isSaving={isSaving}
          onChange={setFormState}
          onCancel={startCreate}
          onSubmit={handleSubmit}
        />
      </div>
    </section>
  );
}
