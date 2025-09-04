// src/pages/contacts/ContactProfile.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../services/api.js';
import ContactForm from '../../components/forms/ContactForm.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import ConnectionCadenceCard from './ConnectionCadenceCard.jsx';
import SocialLinksCard from './SocialLinksCard.jsx';

// --- helpers for DOB display ---
const formatDOB = (d) => {
  if (!d) return '';
  const dt = typeof d === 'string' ? new Date(d) : d;
  if (Number.isNaN(dt?.getTime?.())) return '';
  return dt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const getAge = (d) => {
  if (!d) return null;
  const dt = typeof d === 'string' ? new Date(d) : d;
  if (Number.isNaN(dt?.getTime?.())) return null;
  const now = new Date();
  let age = now.getFullYear() - dt.getFullYear();
  const m = now.getMonth() - dt.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dt.getDate())) age--;
  return age >= 0 ? age : null;
};

// --- helper for history timestamps ---
const formatWhen = (d) => {
  if (!d) return '—';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return '—';
  return dt.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const ContactProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [contact, setContact] = useState(null);
  const [groups, setGroups]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [{ data: c }, { data: allGroups }] = await Promise.all([
          api.get(`/contacts/${id}`),
          api.get('/groups'),
        ]);
        if (!isMounted) return;
        setContact(c);
        setGroups(Array.isArray(allGroups) ? allGroups : []);
      } catch (e) {
        if (!isMounted) return;
        setError(e?.response?.data?.error || e?.message || 'Failed to load contact');
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, [id]);

  const refreshContact = async () => {
    const { data } = await api.get(`/contacts/${id}`);
    setContact(data);
  };

  const onDelete = async () => {
    if (!window.confirm('Delete this contact?')) return;
    try {
      await api.delete(`/contacts/${id}`);
      navigate('/dashboard', { replace: true });
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || 'Delete failed');
    }
  };

  // helpers
  const idStr = (v) => (typeof v === 'string' ? v : v?._id ? String(v._id) : String(v));
  const sameId = (a, b) => String(a) === String(b);
  const groupNameById = (gid) => {
    const g = groups.find((gg) => sameId(gg._id, gid));
    return g?.name || 'Unknown';
  };

  if (loading) return <p className="muted">Loading…</p>;
  if (error) return <p role="alert">{error}</p>;
  if (!contact) return <p>Contact not found.</p>;

  if (editing) {
    return (
      <section className="container">
        <button className="btn" onClick={() => setEditing(false)}>&larr; Cancel</button>
        <ContactForm
          mode="edit"
          initialData={contact}
          onSaved={(updated) => {
            setContact(updated);
            setEditing(false);
          }}
        />
      </section>
    );
  }

  // union of contact.groups + groups.members (deduped)
  const contactGroupIds = Array.isArray(contact.groups)
    ? contact.groups.map(idStr).filter(Boolean)
    : [];
  const derivedGroupIds = groups
    .filter((g) => Array.isArray(g.members) && g.members.some((m) => sameId(m, contact._id)))
    .map((g) => String(g._id));
  const displayGroupIds = Array.from(new Set([...contactGroupIds, ...derivedGroupIds]));

  const age = getAge(contact.dateOfBirth);
  const hasDOB = Boolean(contact.dateOfBirth && formatDOB(contact.dateOfBirth));

  // history array (newest first; your backend unshifts, so just guard)
  const history = contact?.connection?.history || [];

  return (
    <section className="container" aria-labelledby="contact-title">
      <header className="flex-between" style={{ marginBottom: '.8rem' }}>
        <div>
          <h1 id="contact-title" style={{ margin: 0 }}>
            {contact.firstName || contact.lastName
              ? `${contact.firstName ?? ''} ${contact.lastName ?? ''}`.trim()
              : 'Unnamed Contact'}
          </h1>
          {/* Profession under the name */}
          {contact.jobTitle?.trim() && (
            <p className="muted" style={{ margin: '.25rem 0 0' }}>
              {contact.jobTitle}
            </p>
          )}
        </div>
        <div className="actions" style={{ display: 'flex', gap: '.5rem' }}>
          <button className="btn" onClick={() => setEditing(true)}>Edit</button>
          <button className="btn btn-danger" onClick={onDelete}>Delete</button>
        </div>
      </header>

      <div className="grid two">
        {/* Left column: details */}
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Details</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {/* Date of Birth with age */}
            {hasDOB && (
              <li>
                <strong>Date of Birth:</strong> {formatDOB(contact.dateOfBirth)}
                {Number.isFinite(age) && <span className="muted"> ({age} yrs)</span>}
              </li>
            )}

            {contact.email && <li><strong>Email:</strong> {contact.email}</li>}
            {contact.phone && <li><strong>Phone:</strong> {contact.phone}</li>}
            {(contact.city || contact.country) && (
              <li>
                <strong>Location:</strong> {[contact.city, contact.country].filter(Boolean).join(', ')}
              </li>
            )}
            {contact.notes && <li><strong>Notes:</strong> {contact.notes}</li>}
          </ul>
        </div>

        {/* Right column: groups */}
        <div>
          <h2>Groups</h2>
          {displayGroupIds.length > 0 ? (
            <ul className="card" style={{ padding: '1rem', listStyle: 'none', margin: 0 }}>
              {displayGroupIds.map((gid) => (
                <li key={gid} style={{ padding: '.35rem 0' }}>
                  <Link to={`/groups/${gid}`}>{groupNameById(gid)}</Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="Not in any group"
              action={<Link className="btn btn-primary" to="/groups/new">Create a group</Link>}
              icon="📁"
            >
              Use groups to organise contacts (Friends, Business, Sport).
            </EmptyState>
          )}
        </div>
      </div>

      {/* --- NEW: Side-by-side row (50% / 50%) for Cadence + Social Links --- */}
      <div
        className="cardless-row"
        style={{
          marginTop: '1rem',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
        }}
      >
        <div>
          {/* ConnectionCadenceCard likely already has its own card styling */}
          <ConnectionCadenceCard contact={contact} onRefresh={refreshContact} />
        </div>
        <div>
          <SocialLinksCard contact={contact} onRefresh={refreshContact} />
        </div>
      </div>

      {/* --- Connection History card --- */}
      <div className="card" style={{ marginTop: '1rem', padding: '1rem' }}>
        <h2 style={{ marginTop: 0 }}>Connection History</h2>
        {history.length === 0 ? (
          <EmptyState
            title="No history yet"
            body="Log a connection to start tracking your interactions."
            action={null}
            icon="🗓️"
          />
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {history.map((h, idx) => (
              <li
                key={`${h.connectedAt ?? idx}-${idx}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  padding: '.5rem 0',
                  borderBottom: '1px solid var(--border, #e5e7eb)',
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600 }}>{formatWhen(h.connectedAt)}</div>
                  {h.note ? (
                    <div className="muted" style={{ fontSize: '.9rem', whiteSpace: 'pre-wrap' }}>
                      {h.note}
                    </div>
                  ) : (
                    <div className="muted" style={{ fontSize: '.9rem' }}>(no note)</div>
                  )}
                </div>
                {/* badge area */}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default ContactProfile;