import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '../EmptyState.jsx';

const TYPES = ['all','cohort','network','friend','family','business','sport','other'];

const GroupList = ({
  groups = [],
  onDelete,                // optional: (groupId) => void
}) => {
  const [q, setQ] = useState('');
  const [type, setType] = useState('all');
  const [dir, setDir] = useState('asc'); // 'asc' | 'desc'

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return groups.filter((g) => {
      const matchesType = type === 'all' ? true : (g.type === type);
      const matchesText = term
        ? (g.name || '').toLowerCase().includes(term)
        : true;
      return matchesType && matchesText;
    });
  }, [groups, q, type]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const an = (a.name || '').toLowerCase();
      const bn = (b.name || '').toLowerCase();
      if (an < bn) return dir === 'asc' ? -1 : 1;
      if (an > bn) return dir === 'asc' ? 1 : -1;
      // tie-breaker by type
      const at = (a.type || '').toLowerCase();
      const bt = (b.type || '').toLowerCase();
      if (at < bt) return -1;
      if (at > bt) return 1;
      return 0;
    });
    return arr;
  }, [filtered, dir]);

  const count = groups.length;
  const resultCount = sorted.length;

  if (count === 0) {
    return (
      <EmptyState
        title="No groups yet"
        action={<Link className="btn btn-primary" to="/groups/new">Create your first group</Link>}
        icon="👥"
      >
        Organise contacts into cohorts like Friends, Business, Sport…
      </EmptyState>
    );
  }

  return (
    <section aria-labelledby="group-list-title">
      <header className="flex-between" style={{ marginBottom: '.8rem' }}>
        <h2 id="group-list-title" style={{ margin: 0 }}>
          Groups{' '}
          <span className="badge" aria-label={`${resultCount} of ${count} showing`}>
            {resultCount}/{count}
          </span>
        </h2>

        <div className="flex-between" style={{ gap: '.5rem' }}>
          <label className="sr-only" htmlFor="group-search">Search groups</label>
          <input
            id="group-search"
            placeholder="Search group name…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          <label className="sr-only" htmlFor="group-type">Filter by type</label>
          <select
            id="group-type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            aria-label="Filter by type"
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t === 'all' ? 'All types' : t}
              </option>
            ))}
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

          <Link className="btn btn-primary" to="/groups/new">New Group</Link>
        </div>
      </header>

      <div
        className="grid"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px,1fr))' }}
      >
        {sorted.map((g) => (
          <article key={g._id} className="card" aria-label={`${g.name} group card`}>
            <h3 style={{ marginTop: 0 }}>{g.name || 'Untitled group'}</h3>
            <span className="badge" title="Group type">{g.type || 'other'}</span>

            {/* Optional member count if your API returns it or you pass it in */}
            {typeof g.memberCount === 'number' && (
              <p className="muted" style={{ margin: '.4rem 0 0' }}>
                {g.memberCount} member{g.memberCount === 1 ? '' : 's'}
              </p>
            )}

            <div className="flex-between" style={{ gap: '.5rem', marginTop: '.7rem' }}>
              <Link className="btn" to={`/groups/${g._id}`}>View</Link>
              {typeof onDelete === 'function' && (
                <button
                  className="btn btn-danger"
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Delete group "${g.name}"? Members will remain.`)) {
                      onDelete(g._id);
                    }
                  }}
                  aria-label={`Delete group ${g.name}`}
                >
                  Delete
                </button>
              )}
            </div>
          </article>
        ))}
      </div>

      {resultCount === 0 && (
        <div style={{ marginTop: '1rem' }}>
          <EmptyState
            title="No matches"
            action={
              <button
                className="btn"
                onClick={() => { setQ(''); setType('all'); }}
              >
                Clear filters
              </button>
            }
            icon="🔎"
          >
            Try a different name or type.
          </EmptyState>
        </div>
      )}
    </section>
  );
};

export default GroupList;