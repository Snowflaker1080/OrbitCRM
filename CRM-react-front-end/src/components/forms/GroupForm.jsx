// src/components/forms/GroupForm.jsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api.js';

const FALLBACK_GROUP_TYPES = [
  'acquaintances',
  'club',
  'cohort',
  'colleagues',
  'friends',
  'family',
  'business',
  'network',
  'team',
  'volunteers',
  'other',
];

const toLabel = (v) =>
  String(v)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase());

const GroupForm = ({
  mode = 'create',
  initialData = null,
  onSaved,
}) => {
  const navigate = useNavigate();
  const params = useParams();
  const groupId = useMemo(() => initialData?._id || params.id, [initialData, params]);

  const [form, setForm] = useState({ name: '', type: 'other', description: '' }); // ← add description
  const [loading, setLoading] = useState(mode === 'edit' && !initialData);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const [types, setTypes] = useState(FALLBACK_GROUP_TYPES);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get('/groups/meta'); // optional convenience route
        if (!mounted) return;
        const serverTypes = Array.isArray(data?.types) && data.types.length > 0
          ? data.types
          : FALLBACK_GROUP_TYPES;
        setTypes(serverTypes);
      } catch {
        if (mounted) setTypes(FALLBACK_GROUP_TYPES);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name ?? '',
        type: initialData.type ?? 'other',
        description: initialData.description ?? '',
      });
      setLoading(false);
      return;
    }
    if (mode === 'edit' && groupId) {
      (async () => {
        try {
          const { data } = await api.get(`/groups/${groupId}`);
          setForm({
            name: data.name ?? '',
            type: data.type ?? 'other',
            description: data.description ?? '',
          });
        } catch (e) {
          setError(e?.response?.data?.error || e?.message || 'Failed to load group');
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [mode, groupId, initialData]);

  const effectiveTypes = useMemo(() => {
    const list = Array.isArray(types) ? types.slice() : FALLBACK_GROUP_TYPES.slice();
    if (form.type && !list.includes(form.type)) list.push(form.type);
    return list;
  }, [types, form.type]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setError('Group name is required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        type: form.type,
        description: form.description?.trim() || '',
      };

      const { data } =
        mode === 'edit'
          ? await api.put(`/groups/${groupId}`, payload)
          : await api.post('/groups', payload);

      onSaved?.(data);
      navigate(mode === 'edit' ? `/groups/${data._id || groupId}` : '/dashboard');
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading…</p>;

  return (
    <form onSubmit={handleSubmit} aria-labelledby="group-form-title">
      <h1 id="group-form-title">{mode === 'edit' ? 'Edit Group' : 'Create Group'}</h1>

      <label>
        Group Name
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          aria-required="true"
          placeholder="e.g. Product Team"
        />
      </label>

      <label>
        Group Type
        <select name="type" value={form.type} onChange={handleChange}>
          {effectiveTypes.map((t) => (
            <option key={t} value={t}>{toLabel(t)}</option>
          ))}
        </select>
      </label>

      <label>
        Description (optional)
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          placeholder="Add a short descriptor for this group (shown on the dashboard card)…"
        />
      </label>

      {error && <p role="alert">{error}</p>}

      <button className="btn" type="submit" disabled={saving}>
        {saving ? 'Saving…' : (mode === 'edit' ? 'Update Group' : 'Create Group')}
      </button>
    </form>
  );
};

export default GroupForm;