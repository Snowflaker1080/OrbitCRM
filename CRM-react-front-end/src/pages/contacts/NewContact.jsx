import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ContactForm from '../../components/forms/ContactForm.jsx';

const NewContact = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  return (
    <section className="container" aria-labelledby="new-contact-title">
      <header className="flex-between" style={{ marginBottom: '.8rem' }}>
        <h1 id="new-contact-title" style={{ margin: 0 }}>Add New Contact</h1>

        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb">
          <ol style={{ listStyle: 'none', display: 'flex', gap: '.5rem', margin: 0, padding: 0 }}>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li className="muted">/</li>
            <li className="muted">New Contact</li>
          </ol>
        </nav>
      </header>

      {error && <p role="alert">{error}</p>}

      <div className="card" style={{ padding: '1rem' }}>
        <ContactForm
          mode="create"
          onSaved={(contact) => {
            if (!contact?._id) {
              setError('Contact saved, but no ID returned. Please check “Your Contacts”.');
              return;
            }
            navigate(`/contacts/${contact._id}`, { replace: true });
          }}
        />
      </div>

      {/* Helpful hint to align with UX goals */}
      <div className="muted" style={{ marginTop: '.75rem' }}>
        Tip: You can assign this contact to one or more groups now, or later from the contact profile.
      </div>
    </section>
  );
};

export default NewContact;