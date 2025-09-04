import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GroupForm from '../../components/forms/GroupForm.jsx';

const NewGroup = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  return (
    <section className="container" aria-labelledby="new-group-title">
      <header className="flex-between" style={{ marginBottom: '.8rem' }}>
        <h1 id="new-group-title" style={{ margin: 0 }}>Create Group</h1>
        <nav aria-label="Breadcrumb">
          <ol style={{ listStyle: 'none', display: 'flex', gap: '.5rem', margin: 0, padding: 0 }}>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li className="muted">/</li>
            <li className="muted">New Group</li>
          </ol>
        </nav>
      </header>

      {error && <p role="alert">{error}</p>}

      <div className="card" style={{ padding: '1rem' }}>
        <GroupForm
          mode="create"
          onSaved={(group) => {
            if (!group?._id) {
              setError('Group saved, but no ID returned. Please refresh and check “Your Groups”.');
              return;
            }
            navigate(`/groups/${group._id}`, { replace: true });
          }}
        />
      </div>
    </section>
  );
};

export default NewGroup;