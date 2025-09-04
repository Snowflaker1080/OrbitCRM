import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '../EmptyState.jsx';

const ContactList = ({
  contacts = [],
  onDelete,                // optional: (contactId) => void
}) => {
  const [q, setQ] = useState('');
  const [sortBy, setSortBy] = useState('first');   // 'first' | 'last'
  const [dir, setDir] = useState('asc');           // 'asc' | 'desc'

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return contacts;
    return contacts.filter((c) => {
      const first = (c.firstName || '').toLowerCase();
      const last  = (c.lastName || '').toLowerCase();
      const email = (c.email || '').toLowerCase();
      return first.includes(term) || last.includes(term) || email.includes(term);
    });
  }, [contacts, q]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    const key = sortBy === 'first' ? 'firstName' : 'lastName';
    arr.sort((a, b) => {
      const va = (a[key] || '').toLowerCase();
      const vb = (b[key] || '').toLowerCase();
      if (va < vb) return dir === 'asc' ? -1 : 1;
      if (va > vb) return dir === 'asc' ? 1 : -1;
      // Tiebreaker: email
      const ea = (a.email || '').toLowerCase();
      const eb = (b.email || '').toLowerCase();
      if (ea < eb) return -1;
      if (ea > eb) return 1;
      return 0;
    });
    return arr;
  }, [filtered, sortBy, dir]);

  const count = contacts.length;
  const resultCount = sorted.length;

  if (count === 0) {
    return (
      <EmptyState
        title="No contacts yet"
        action={<Link className="btn btn-primary" to="/contacts/new">Add a contact</Link>}
        icon="📇"
      >
        Save people you want to keep in touch with.
      </EmptyState>
    );
  }

  return (
    <section aria-labelledby="contact-list-title">
      <header className="flex-between" style={{ marginBottom: '.8rem' }}>
        <h2 id="contact-list-title" style={{ margin: 0 }}>
          Contacts{' '}
          <span className="badge" aria-label={`${resultCount} of ${count} showing`}>
            {resultCount}/{count}
          </span>
        </h2>

        {/* Controls */}
        <div className="flex-between" style={{ gap: '.5rem' }}>
          <label className="sr-only" htmlFor="contact-search">Search contacts</label>
          <input
            id="contact-search"
            placeholder="Search name or email…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          <label className="sr-only" htmlFor="contact-sortby">Sort by</label>
          <select
            id="contact-sortby"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort by"
          >
            <option value="first">First name</option>
            <option value="last">Last name</option>
          </select>

          <button
            className="btn"
            type="button"
            onClick={() => setDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
            aria-label={`Sort ${dir === 'asc' ? 'descending' : 'ascending'}`}
            title={`Toggle ${dir === 'asc' ? 'DESC' : 'ASC'}`}
          >
            {dir === 'asc' ? 'A→Z' : 'Z→A'}
          </button>

          <Link className="btn btn-primary" to="/contacts/new">New Contact</Link>
        </div>
      </header>

      {/* List */}
      <div
        className="grid"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px,1fr))' }}
      >
        {sorted.map((c) => {
          const fullName = [c.firstName, c.lastName].filter(Boolean).join(' ') || 'Unnamed';
          const location = [c.city, c.country].filter(Boolean).join(', ');
          return (
            <article key={c._id} className="card" aria-label={`${fullName} card`}>
              <h3 style={{ marginTop: 0 }}>{fullName}</h3>
              {c.email && <p className="muted" style={{ margin: '.25rem 0' }}>{c.email}</p>}
              {location && <p className="muted" style={{ margin: '.25rem 0' }}>{location}</p>}

              <div className="flex-between" style={{ gap: '.5rem', marginTop: '.6rem' }}>
                <Link className="btn" to={`/contacts/${c._id}`}>View</Link>
                {typeof onDelete === 'function' && (
                  <button
                    className="btn btn-danger"
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Delete ${fullName}?`)) onDelete(c._id);
                    }}
                    aria-label={`Delete ${fullName}`}
                  >
                    Delete
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {resultCount === 0 && (
        <div style={{ marginTop: '1rem' }}>
          <EmptyState
            title="No matches"
            action={<button className="btn" onClick={() => setQ('')}>Clear search</button>}
            icon="🔎"
          >
            Try a different name or email.
          </EmptyState>
        </div>
      )}
    </section>
  );
};

export default ContactList;