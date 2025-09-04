// pages/dashboard/Dashboard.jsx
import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import api from '../../services/api.js';
import EmptyState from '../../components/EmptyState.jsx';
import SectionHeader from '../../components/SectionHeader.jsx';
import { useAuth } from '../../hooks/useAuth.jsx';
import orbitLogo from '../../assets/Orbit CRM Logo.png';
import classes from './Dashboard.module.css';

const SORT_FIELD_KEY = 'dashboard.contacts.sortField';
const SORT_ORDER_KEY = 'dashboard.contacts.sortOrder';
const VALID_FIELDS = new Set(['firstName', 'lastName']);
const VALID_ORDERS = new Set(['asc', 'desc']);

const readPersisted = (key, fallback, validSet) => {
  const v = localStorage.getItem(key);
  return v && validSet?.has(v) ? v : (v ?? fallback);
};

// Helpers
const formatDate = (d) => {
  if (!d) return '—';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return '—';
  return dt.toLocaleDateString();
};
const daysUntil = (d) => {
  if (!d) return null;
  const today = new Date();
  const due = new Date(d);
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const diffMs = due - today;
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
};

// Reminder UI
const ReminderRow = ({ c }) => {
  const du = daysUntil(c.nextConnectionDate);
  const overdue = du !== null && du < 0;
  const dueLabel = du === 0 ? 'Due today' : overdue ? `${Math.abs(du)}d overdue` : `${du}d`;
  return (
    <li
      key={c._id}
      className={classes.listreminderUI}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '.75rem',
        padding: '.5rem 0',
        borderBottom: '1px solid var(--border, #e5e7eb)',
      }}
    >
      <div style={{ minWidth: 0 }}>
        <Link to={`/contacts/${c._id}`} style={{ fontWeight: 600 }}>
          {c.firstName} {c.lastName}
        </Link>
        <div className="muted" style={{ fontSize: '.85rem' }}>
          Connect by {formatDate(c.nextConnectionDate)}
        </div>
      </div>
      <span
        className="badge"
        style={{
          whiteSpace: 'nowrap',
          padding: '.25rem .5rem',
          borderRadius: '999px',
          fontSize: '.8rem',
          background: overdue ? '#fee2e2' : '#eef2ff',
          color: overdue ? '#991b1b' : '#3730a3',
          border: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        {dueLabel}
      </span>
    </li>
  );
};

const RemindersCard = ({ reminders, isLoading }) => (
  <section className="card" aria-labelledby="reminders-title" style={{ padding: '1rem' }}>
    <h2 id="reminders-title" style={{ marginTop: 0 }}>Connection Reminders</h2>
    {isLoading ? (
      <p className="muted">Loading reminders…</p>
    ) : reminders.length === 0 ? (
      <EmptyState
        title="No upcoming reminders"
        body="Set a connection cadence on contact profiles to see them here."
      />
    ) : (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {reminders.map((c) => (
          <ReminderRow key={c._id} c={c} />
        ))}
      </ul>
    )}
  </section>
);

const Dashboard = () => {
  const { token } = useAuth();

  const [me, setMe] = useState(null);
  const [groups, setGroups] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [remindersLoading, setRemindersLoading] = useState(true);

  // persisted sort
  const [sortField, setSortField] = useState(() =>
    readPersisted(SORT_FIELD_KEY, 'firstName', VALID_FIELDS)
  );
  const [sortOrder, setSortOrder] = useState(() =>
    readPersisted(SORT_ORDER_KEY, 'asc', VALID_ORDERS)
  );

  useEffect(() => {
    localStorage.setItem(SORT_FIELD_KEY, sortField);
  }, [sortField]);
  useEffect(() => {
    localStorage.setItem(SORT_ORDER_KEY, sortOrder);
  }, [sortOrder]);

  if (!token) return <Navigate to="/sign-in" replace />;

  // Load dashboard data
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        const [{ data: meRaw }, { data: groupData }, { data: contactData }] = await Promise.all([
          api.get('/users/me'),
          api.get('/groups'),
          api.get('/contacts'),
        ]);

        if (!isMounted) return;

        // 👇 Normalize /users/me payload (handles {user: {...}} or raw user)
        const userObj = meRaw?.user ?? meRaw ?? null;
        setMe(userObj);

        setGroups(groupData || []);
        setContacts(contactData || []);
      } catch (e) {
        if (!isMounted) return;
        setError(e.response?.data?.error || 'Failed to load dashboard data');
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  // Load reminders
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setRemindersLoading(true);
        const { data } = await api.get('/contacts/reminders/next');
        if (!isMounted) return;
        setReminders(Array.isArray(data) ? data : []);
      } catch {
        if (!isMounted) return;
        const derived = (contacts || [])
          .filter((c) => !!c.connection?.nextConnectDueAt)
          .sort((a, b) => new Date(a.connection.nextConnectDueAt) - new Date(b.connection.nextConnectDueAt))
          .slice(0, 3)
          .map((c) => ({ ...c, nextConnectionDate: c.connection.nextConnectDueAt }));
        setReminders(derived);
      } finally {
        if (isMounted) setRemindersLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, [contacts]);

  // Sort contacts (right panel)
  const sortedContacts = useMemo(() => {
    const list = [...(contacts || [])];
    list.sort((a, b) => {
      const av = (a?.[sortField] || '').toLowerCase();
      const bv = (b?.[sortField] || '').toLowerCase();
      if (av < bv) return sortOrder === 'asc' ? -1 : 1;
      if (av > bv) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [contacts, sortField, sortOrder]);

  // Layout styles
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '1rem',
    alignItems: 'start',
  };
  const asideSticky = { position: 'sticky', top: '1rem' };
  const contactsPanelStyle = {
    display: 'flex',
    flexDirection: 'column',
    padding: '1rem',
    maxHeight: 'calc(100vh - 2rem)',
    overflow: 'hidden',
  };
  const contactsSortRow = { display: 'flex', gap: '.5rem', alignItems: 'center', flexWrap: 'wrap', marginTop: '.5rem' };
  const contactsListScroll = { overflowY: 'auto', marginTop: '.75rem', paddingRight: '.25rem' };

  const groupDescriptionStyle = {
    margin: '.35rem 0 0',
    fontSize: '.9rem',
    color: 'var(--muted, #6b7280)',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '.5rem',
    paddingLeft: '1rem',
  };

  return (
    <section className="container" aria-labelledby="dashboard-title" style={{ marginTop: '1rem' }}>

      {/* Centered SectionHeader with logo + title */}
      <header style={{ marginBottom: '1rem', textAlign: 'center' }}>
       <SectionHeader
  title={
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem' }}>
        <img
          src={orbitLogo}
          alt="Orbit CRM"
          width={48}
          height={48}
          style={{ display: 'inline-block' }}
        />
        <span style={{ fontWeight: 600, fontSize: '1.5rem' }}>Dashboard</span>
      </span>
      <span className="muted" style={{ fontSize: '1.2rem' }}>
        {me
          ? `Welcome back, ${me.username || me.name || me.firstName || me.email || 'friend'}`
          : 'Overview'}
      </span>
    </div>
  }
        />
      </header>
      {error && (
        <div role="alert" className="card" style={{ padding: '1rem', borderLeft: '4px solid #ef4444' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      <div style={gridStyle}>

{/* LEFT: Groups, then Reminders */}
        <main>
          <section aria-labelledby="groups-title" className="card" style={{ padding: '1rem', marginBottom: '1rem' }}>
            <h2 id="groups-title" style={{ marginTop: 0 }}>Groups</h2>
            {loading ? (
              <p className="muted">Loading groups…</p>
            ) : groups.length === 0 ? (
              <EmptyState
                title="No groups yet"
                body="Create a cohort, network, or friend group to organise contacts."
                actionLabel="+ New Group"
                actionHref="/groups/new"
              />
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '.5rem' }}>
                {groups.map((g) => (
                  <li key={g._id} className="card" style={{ padding: '.75rem' }}>
                    {/* Title row: name + type (text only, same style) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flexWrap: 'wrap' }}>
                      <Link
                        to={`/groups/${g._id}`}
                        style={{ fontWeight: 600, color: 'inherit', textDecoration: 'none' }}
                      >
                        {g.name}
                      </Link>
                      {g.type && (
                        <span style={{ fontWeight: 600, color: 'inherit' }}>
                      | {g.type}
                        </span>
                      )}
                    </div>

{/* Description */}
                    {g.description ? (
                      <div style={groupDescriptionStyle}>
                        <span aria-hidden="true" style={{ lineHeight: 1.2 }}>•</span>
                        <span>{g.description}</span>
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <RemindersCard reminders={reminders} isLoading={remindersLoading} />
        </main>
        
{/* RIGHT: Contacts */}
        <aside style={asideSticky}>
          <section aria-labelledby="contacts-title" className="card" style={contactsPanelStyle}>
            <h2 id="contacts-title" style={{ margin: 0 }}>Contacts</h2>

            <div style={contactsSortRow}>
              <label className="muted" htmlFor="sort-field">Sort</label>
              <select id="sort-field" value={sortField} onChange={(e) => setSortField(VALID_FIELDS.has(e.target.value) ? e.target.value : 'firstName')}>
                <option value="firstName">First name</option>
                <option value="lastName">Last name</option>
              </select>
              <select aria-label="Sort order" value={sortOrder} onChange={(e) => setSortOrder(VALID_ORDERS.has(e.target.value) ? e.target.value : 'asc')}>
                <option value="asc">A → Z</option>
                <option value="desc">Z → A</option>
              </select>
            </div>

            {loading ? (
              <p className="muted" style={{ marginTop: '.75rem' }}>Loading contacts…</p>
            ) : sortedContacts.length === 0 ? (
              <div style={{ marginTop: '.75rem' }}>
                <EmptyState
                  title="No contacts yet"
                  body="Add your first contact to start organising your network."
                  actionLabel="+ New Contact"
                  actionHref="/contacts/new"
                />
              </div>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, ...contactsListScroll }}>
                {sortedContacts.map((c) => {
                  const nextDate = c.nextConnectionDate || c.connection?.nextConnectDueAt;
                  return (
                    <li key={c._id} className="card" style={{ padding: '.75rem', marginBottom: '.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '.75rem' }}>
                        <div style={{ minWidth: 0 }}>
                          <Link to={`/contacts/${c._id}`} style={{ fontWeight: 600 }}>
                            {c.firstName} {c.lastName}
                          </Link>
                          {c.location && (
                            <div className="muted" style={{ fontSize: '.85rem' }}>{c.location}</div>
                          )}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          {nextDate ? (
                            <span className="muted" style={{ fontSize: '.85rem' }}>
                              Next connect: {formatDate(nextDate)}
                            </span>
                          ) : (
                            <Link to={`/contacts/${c._id}`} className="link" style={{ fontSize: '.9rem' }}>
                              Set cadence →
                            </Link>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
                <li aria-hidden="true" style={{ height: '.25rem' }} />
              </ul>
            )}
          </section>
        </aside>
      </div>
    </section>
  );
};

export default Dashboard;