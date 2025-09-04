// src/pages/groups/GroupProfile.jsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../services/api.js';
import GroupForm from '../../components/forms/GroupForm.jsx';
import EmptyState from '../../components/EmptyState.jsx';

const idStr = (v) => (typeof v === 'string' ? v : v?._id ? String(v._id) : String(v));
const sameId = (a, b) => String(a) === String(b);

const GroupProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);          // contacts in this group
  const [allContacts, setAllContacts] = useState([]);  // all user contacts (picker)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);

  // Single-add UI state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('');

  // Bulk actions UI state
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkQuery, setBulkQuery] = useState('');
  const [bulkAddIds, setBulkAddIds] = useState([]);       // contactIds to add
  const [bulkRemoveIds, setBulkRemoveIds] = useState([]); // memberIds to remove
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        // Load the group
        const { data: g } = await api.get(`/groups/${id}`);
        if (!isMounted) return;
        setGroup(g);

        // Load members filtered by this group + all contacts for pickers
        const [{ data: contactsInGroup }, { data: all }] = await Promise.all([
          api.get('/contacts', { params: { group: id } }),
          api.get('/contacts'),
        ]);
        if (!isMounted) return;
        setMembers(Array.isArray(contactsInGroup) ? contactsInGroup : []);
        setAllContacts(Array.isArray(all) ? all : []);
      } catch (e) {
        if (!isMounted) return;
        setError(e?.response?.data?.error || e?.message || 'Failed to load group');
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => { isMounted = false; };
  }, [id]);

  const reloadMembers = async () => {
    const { data: contactsInGroup } = await api.get('/contacts', { params: { group: id } });
    setMembers(Array.isArray(contactsInGroup) ? contactsInGroup : []);
  };

  const onDelete = async () => {
    if (!window.confirm('Delete this group? Members will remain but lose this tag.')) return;
    try {
      await api.delete(`/groups/${id}`);
      navigate('/dashboard', { replace: true });
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || 'Delete failed');
    }
  };

  // Compute candidates = all contacts minus current members, with search (single-add)
  const memberIdSet = useMemo(() => new Set(members.map((m) => idStr(m._id))), [members]);
  const candidates = useMemo(() => {
    const base = allContacts.filter((c) => !memberIdSet.has(idStr(c._id)));
    if (!query.trim()) return base;
    const q = query.trim().toLowerCase();
    return base.filter((c) => {
      const name = [c.firstName, c.lastName].filter(Boolean).join(' ').toLowerCase();
      return name.includes(q) || (c.email || '').toLowerCase().includes(q);
    });
  }, [allContacts, memberIdSet, query]);

  // Single add existing contact
  const onAddExisting = async (e) => {
    e.preventDefault();
    if (!selectedId) return;
    try {
      await api.post(`/groups/${id}/members/${selectedId}`); // single add
      const added = allContacts.find((c) => sameId(c._id, selectedId));
      if (added) setMembers((prev) => [...prev, added]);
      setSelectedId('');
      setQuery('');
      setPickerOpen(false);
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || 'Failed to add member');
    }
  };

  // ===== Bulk actions helpers =====
  const candidateOptions = useMemo(() => {
    // For bulk ADD: re-use non-member list, but with separate search (bulkQuery)
    const base = allContacts.filter((c) => !memberIdSet.has(idStr(c._id)));
    if (!bulkQuery.trim()) return base;
    const q = bulkQuery.trim().toLowerCase();
    return base.filter((c) => {
      const name = [c.firstName, c.lastName].filter(Boolean).join(' ').toLowerCase();
      return name.includes(q) || (c.email || '').toLowerCase().includes(q);
    });
  }, [allContacts, memberIdSet, bulkQuery]);

  const onToggleRemoveCheck = (memberId) => {
    setBulkRemoveIds((prev) =>
      prev.includes(memberId) ? prev.filter((id0) => id0 !== memberId) : [...prev, memberId]
    );
  };

  const onBulkAdd = async () => {
    if (bulkAddIds.length === 0) return;
    try {
      setBusy(true);
      await api.post(`/groups/${id}/members`, { contactIds: bulkAddIds });
      await reloadMembers();
      setBulkAddIds([]);
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || 'Bulk add failed');
    } finally {
      setBusy(false);
    }
  };

  const onBulkRemove = async () => {
    if (bulkRemoveIds.length === 0) return;
    try {
      setBusy(true);
      await api.delete(`/groups/${id}/members`, { data: { contactIds: bulkRemoveIds } });
      await reloadMembers();
      setBulkRemoveIds([]);
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || 'Bulk remove failed');
    } finally {
      setBusy(false);
    }
  };

  // === delete (remove) a single member from this group ===
  const onRemoveMember = async (contactId) => {
    if (!window.confirm('Remove this contact from the group?')) return;
    try {
      await api.delete(`/groups/${id}/members/${contactId}`);
      // Optimistic update:
      setMembers((prev) => prev.filter((m) => !sameId(m._id, contactId)));
      // Or: await reloadMembers();
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || 'Failed to remove member');
    }
  };

  if (loading) return <p>Loading…</p>;
  if (error) return <p role="alert">{error}</p>;
  if (!group) return <p>Group not found.</p>;

  // Edit-in-place view
  if (editing) {
    return (
      <section>
        <button className="btn" onClick={() => setEditing(false)}>&larr; Cancel</button>
        <GroupForm
          mode="edit"
          initialData={group}
          onSaved={(updated) => {
            setGroup(updated);
            setEditing(false);
          }}
        />
      </section>
    );
  }

  // Read-only view
  return (
    <section aria-labelledby="group-title">
      <header className="flex-between">
        <h1 id="group-title">{group.name}</h1>
        <div className="actions" style={{ display: 'flex', gap: '.5rem' }}>
          <button className="btn" onClick={() => setEditing(true)}>Edit</button>
          <button className="btn btn-danger" onClick={onDelete}>Delete</button>
        </div>
      </header>

      <p><strong>Type:</strong> {group.type}</p>

      <h2>Members</h2>

{/* Single-add existing contact controls */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1rem' }}>
        {!pickerOpen ? (
          <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
            <Link className="btn btn-primary" to="/contacts/new">Create a new contact</Link>
            <button className="btn" onClick={() => setPickerOpen(true)}>Add existing contact</button>
            <button className="btn" onClick={() => setBulkOpen((v) => !v)}>
              {bulkOpen ? 'Hide bulk actions' : 'Show bulk actions'}
            </button>
          </div>
        ) : (
          <form onSubmit={onAddExisting} style={{ display: 'grid', gap: '.5rem', gridTemplateColumns: '1fr auto auto' }}>
            <input
              type="search"
              placeholder="Search contacts by name or email"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search contacts"
            />
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              aria-label="Select contact to add"
            >
              <option value="">Select a contact…</option>
              {candidates.map((c) => {
                const label = [c.firstName, c.lastName].filter(Boolean).join(' ') || 'Unnamed';
                return (
                  <option key={c._id} value={c._id}>
                    {label}{c.email ? ` — ${c.email}` : ''}
                  </option>
                );
              })}
            </select>
            <div style={{ display: 'flex', gap: '.5rem' }}>
              <button className="btn btn-primary" type="submit" disabled={!selectedId}>Add</button>
              <button
                type="button"
                className="btn"
                onClick={() => { setPickerOpen(false); setSelectedId(''); setQuery(''); }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

{/* Bulk actions (unchanged) */}
      {bulkOpen && (
        <div className="card" style={{ padding: '1rem', marginBottom: '1rem', display: 'grid', gap: '.75rem' }}>
          <h3 style={{ margin: 0 }}>Bulk actions</h3>

          {/* Bulk ADD */}
          <div>
            <label className="muted" htmlFor="bulk-search">Search non-members</label>
            <input
              id="bulk-search"
              type="search"
              placeholder="Type to filter available contacts…"
              value={bulkQuery}
              onChange={(e) => setBulkQuery(e.target.value)}
              aria-label="Search non-members"
              style={{ marginTop: '.25rem', width: '100%' }}
            />
            <div style={{ display: 'grid', gap: '.5rem', gridTemplateColumns: '1fr auto', alignItems: 'start', marginTop: '.5rem' }}>
              <select
                multiple
                size={8}
                value={bulkAddIds}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions).map((o) => o.value);
                  setBulkAddIds(values);
                }}
                aria-label="Select contacts to add"
                style={{ width: '100%' }}
              >
                {candidateOptions.map((c) => {
                  const label = [c.firstName, c.lastName].filter(Boolean).join(' ') || 'Unnamed';
                  return (
                    <option key={c._id} value={c._id}>
                      {label}{c.email ? ` — ${c.email}` : ''}
                    </option>
                  );
                })}
              </select>
              <button
                className="btn btn-primary"
                onClick={onBulkAdd}
                disabled={busy || bulkAddIds.length === 0}
                aria-disabled={busy || bulkAddIds.length === 0}
              >
                {busy ? 'Adding…' : `Add Selected (${bulkAddIds.length})`}
              </button>
            </div>
          </div>

{/* Bulk REMOVE */}
          <div style={{ marginTop: '.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span className="muted">Select members to remove</span>
              <button
                className="btn btn-danger"
                onClick={onBulkRemove}
                disabled={busy || bulkRemoveIds.length === 0}
                aria-disabled={busy || bulkRemoveIds.length === 0}
              >
                {busy ? 'Removing…' : `Remove Selected (${bulkRemoveIds.length})`}
              </button>
            </div>
            <ul className="card" style={{ padding: '0.5rem', marginTop: '.5rem', maxHeight: 260, overflow: 'auto' }}>
              {members.length === 0 ? (
                <li className="muted" style={{ padding: '.5rem' }}>No members to remove.</li>
              ) : (
                members.map((m) => {
                  const label = [m.firstName, m.lastName].filter(Boolean).join(' ') || 'Unnamed';
                  return (
                    <li key={m._id} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.25rem 0' }}>
                      <input
                        type="checkbox"
                        id={`rm-${m._id}`}
                        checked={bulkRemoveIds.includes(m._id)}
                        onChange={() => onToggleRemoveCheck(m._id)}
                      />
                      <label htmlFor={`rm-${m._id}`} style={{ cursor: 'pointer' }}>
                        {label}
                      </label>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        </div>
      )}

{/* Members list with per-row Delete button */}
      {members.length === 0 ? (
        <EmptyState
          title="No members in this group"
          action={
            <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
              <Link className="btn btn-primary" to="/contacts/new">Create a new contact</Link>
              <button className="btn" onClick={() => setPickerOpen(true)}>Add existing contact</button>
              <button className="btn" onClick={() => setBulkOpen(true)}>Bulk add/remove</button>
            </div>
          }
          icon="👥"
        >
          Add contacts and assign them to <strong>{group.name}</strong>.
        </EmptyState>
      ) : (
        <ul className="card" style={{ padding: '1rem' }}>
          {members.map((c) => {
            const label = [c.firstName, c.lastName].filter(Boolean).join(' ') || 'Unnamed';
            return (
              <li
                key={c._id}
                style={{
                  padding: '.4rem 0',
                  borderBottom: '1px solid rgba(255,255,255,.06)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '.75rem',
                }}
              >
                <Link to={`/contacts/${c._id}`}>{label}</Link>
                <button
                  className="btn btn-danger"
                  onClick={() => onRemoveMember(c._id)}
                  aria-label={`Remove ${label} from ${group.name}`}
                  title="Remove from group"
                >
                  Delete
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default GroupProfile;