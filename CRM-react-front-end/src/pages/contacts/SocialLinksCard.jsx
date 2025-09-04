// src/pages/contacts/SocialLinksCard.jsx
import { useMemo, useState } from 'react';
import api from '../../services/api.js';

/* ---------------- Icons (inline SVG, 16x16) ---------------- */
const Icon = ({ name, title }) => {
  const common = {
    width: 16,
    height: 16,
    viewBox: '0 0 24 24',
    'aria-hidden': title ? undefined : true,
    role: title ? 'img' : 'presentation',
    focusable: 'false',
    style: { verticalAlign: '-2px' },
  };

  switch (name) {
    case 'website': // globe
      return (
        <svg {...common}>
          {title ? <title>{title}</title> : null}
          <path fill="currentColor" d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2Zm0 2c1.58 0 3.04.46 4.27 1.25A16.3 16.3 0 0 0 13 8h-2c-.4-1.21-.98-2.33-1.73-3.25A8.03 8.03 0 0 1 12 4Zm-3.4 1.55C9.3 6.77 10 8.3 10.4 10H6.2a8.03 8.03 0 0 1 2.4-4.45ZM4.06 12c0-.68.07-1.35.2-2h6.14c.08.66.12 1.33.12 2s-.04 1.34-.12 2H4.26a8.2 8.2 0 0 1-.2-2Zm2.14 6h4.2c-.4 1.7-1.1 3.23-1.8 4.45A8.03 8.03 0 0 1 6.2 18Zm3.8-2c-.4-1.7-1.1-3.23-1.8-4.45A8.03 8.03 0 0 0 6.2 16h3.8Zm7.8 2a8.03 8.03 0 0 1-4.27 1.25c.75-.92 1.33-2.04 1.73-3.25h2.54Zm-1.6-6h4.2c.13.65.2 1.32.2 2s-.07 1.35-.2 2h-4.2c.08-.66.12-1.33.12-2s-.04-1.34-.12-2Zm2.14-2h-3.8c.4-1.7 1.1-3.23 1.8-4.45A8.03 8.03 0 0 1 18.8 10Z"/>
        </svg>
      );
    case 'linkedin':
      return (
        <svg {...common}>
          {title ? <title>{title}</title> : null}
          <path fill="currentColor" d="M4.98 3.5A2.5 2.5 0 1 1 0 3.5a2.5 2.5 0 0 1 4.98 0zM.5 8.5h4.9V24H.5zM9 8.5h4.7v2.1h.1c.6-1.1 2-2.3 4.2-2.3 4.5 0 5.3 3 5.3 6.9V24H18.6v-6.6c0-1.6 0-3.7-2.3-3.7s-2.7 1.7-2.7 3.6V24H9z"/>
        </svg>
      );
    case 'twitter': // X/Twitter glyph (simplified)
      return (
        <svg {...common}>
          {title ? <title>{title}</title> : null}
          <path fill="currentColor" d="M18.9 2H21l-6.6 7.5L22 22h-6.9l-4.3-5.6L5.7 22H3.6l7.2-8.2L2 2h7l3.8 5.1L18.9 2Zm-2.4 18h2.3L9.7 4H7.4l9.1 16Z"/>
        </svg>
      );
    case 'instagram':
      return (
        <svg {...common}>
          {title ? <title>{title}</title> : null}
          <path fill="currentColor" d="M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 2 .2 2.8.6.7.3 1.3.7 1.8 1.2.5.5.9 1.1 1.2 1.8.3.8.5 1.6.6 2.8.1 1.2.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.2 2-.6 2.8-.3.7-.7 1.3-1.2 1.8-.5.5-1.1.9-1.8 1.2-.8.3-1.6.5-2.8.6-1.2.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-2-.2-2.8-.6a4.9 4.9 0 0 1-1.8-1.2 4.9 4.9 0 0 1-1.2-1.8c-.3-.8-.5-1.6-.6-2.8C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8c.1-1.2.2-2 .6-2.8.3-.7.7-1.3 1.2-1.8.5-.5 1.1-.9 1.8-1.2.8-.3 1.6-.5 2.8-.6C8.4 2.2 8.8 2.2 12 2.2ZM12 5.7a6.3 6.3 0 1 0 0 12.6 6.3 6.3 0 0 0 0-12.6Zm7.1-.6a1.4 1.4 0 1 0 0 2.9 1.4 1.4 0 0 0 0-2.9ZM12 8.3a3.7 3.7 0 1 1 0 7.4 3.7 3.7 0 0 1 0-7.4Z"/>
        </svg>
      );
    case 'facebook':
      return (
        <svg {...common}>
          {title ? <title>{title}</title> : null}
          <path fill="currentColor" d="M13.5 22V12h3l.5-3h-3.5V7.2c0-1 .3-1.7 1.8-1.7H17V2.2c-.3 0-1.4-.2-2.7-.2-2.7 0-4.6 1.7-4.6 4.7V9H7v3h2.7v10h3.8Z"/>
        </svg>
      );
    case 'github':
      return (
        <svg {...common}>
          {title ? <title>{title}</title> : null}
          <path fill="currentColor" d="M12 .5a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.5-1.2-1.2-1.5-1.2-1.5-1-.6.1-.6.1-.6 1.2.1 1.8 1.2 1.8 1.2 1 .1.7 2 .7 2 1.1.7 2.5.5 3.1.4.1-.8.4-1.4.8-1.8-2.7-.3-5.6-1.4-5.6-6.2 0-1.4.5-2.6 1.3-3.5-.1-.3-.6-1.7.1-3.4 0 0 1-.3 3.5 1.3a11.9 11.9 0 0 1 6.4 0c2.5-1.6 3.5-1.3 3.5-1.3.7 1.7.2 3.1.1 3.4.8.9 1.3 2.1 1.3 3.5 0 4.8-2.9 5.9-5.6 6.2.5.4.9 1.1.9 2.3v3.4c0 .3.2.7.8.6A12 12 0 0 0 12 .5Z"/>
        </svg>
      );
    default:
      return null;
  }
};

const normalise = (url) => {
  if (!url) return '';
  const v = String(url).trim();
  if (!v) return '';
  if (/^https?:\/\//i.test(v)) return v;
  if (/^[\w.-]+\.[a-z]{2,}($|\/)/i.test(v)) return `https://${v}`;
  return v; // keep handles like @name as-is
};

/* -------------- list row with icon + url ------------------- */
const LinkRow = ({ kind, label, href }) => {
  if (!href) return null;
  return (
    <li style={{ padding: '.35rem 0' }}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="link"
        aria-label={`${label} (opens in new tab)`}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem' }}
      >
        <span className="muted" aria-hidden="true" style={{ color: 'inherit' }}>
          <Icon name={kind} title={label} />
        </span>
        <span>{label}</span>
      </a>
      <div className="muted" style={{ fontSize: '.85rem', wordBreak: 'break-all', marginLeft: '1.4rem' }}>
        {href}
      </div>
    </li>
  );
};

const FieldLabel = ({ kind, children }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem' }}>
    <Icon name={kind} title={children} />
    {children}
  </span>
);

const SocialLinksCard = ({ contact, onRefresh }) => {
  const initial = useMemo(() => {
    const s = contact?.socials || {};
    return {
      website: s.website || '',
      linkedin: s.linkedin || '',
      twitter: s.twitter || '',
      instagram: s.instagram || '',
      facebook: s.facebook || '',
      github: s.github || '',
      other1: s.other1 || '',
      other2: s.other2 || '',
    };
  }, [contact]);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const anyLink = Object.values(initial).some(Boolean);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onCancel = () => {
    setForm(initial);
    setEditing(false);
    setError('');
  };

  const onSave = async (e) => {
    e?.preventDefault?.();
    setSaving(true);
    setError('');
    try {
      const payload = {
        socials: {
          website: normalise(form.website),
          linkedin: normalise(form.linkedin),
          twitter: normalise(form.twitter),
          instagram: normalise(form.instagram),
          facebook: normalise(form.facebook),
          github: normalise(form.github),
          other1: normalise(form.other1),
          other2: normalise(form.other2),
        },
      };
      await api.put(`/contacts/${contact._id}`, payload);
      setEditing(false);
      await onRefresh?.();
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Failed to save links');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="card" aria-labelledby="social-links-title" style={{ padding: '1rem' }}>
      <div className="flex-between" style={{ marginBottom: '.5rem' }}>
        <h2 id="social-links-title" style={{ margin: 0 }}>Social media & url links</h2>
        {!editing ? (
          <button className="btn btn-sm" onClick={() => setEditing(true)}>
            {anyLink ? 'Edit' : 'Add'}
          </button>
        ) : null}
      </div>

      {!editing ? (
        anyLink ? (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            <LinkRow kind="website"  label="Website"    href={initial.website} />
            <LinkRow kind="linkedin" label="LinkedIn"   href={initial.linkedin} />
            <LinkRow kind="twitter"  label="Twitter / X" href={initial.twitter} />
            <LinkRow kind="instagram" label="Instagram" href={initial.instagram} />
            <LinkRow kind="facebook" label="Facebook"   href={initial.facebook} />
            <LinkRow kind="github"   label="GitHub"     href={initial.github} />
            <LinkRow kind="website"  label="Other #1"   href={initial.other1} />
            <LinkRow kind="website"  label="Other #2"   href={initial.other2} />
          </ul>
        ) : (
          <div>
            <p className="muted" style={{ marginTop: 0 }}>
              No links yet. Add your contact’s website and social profiles.
            </p>
          </div>
        )
      ) : (
        <form onSubmit={onSave}>
          <div className="grid two" style={{ gap: '.75rem' }}>
            <label className="field">
              <span><FieldLabel kind="website">Website</FieldLabel></span>
              <input
                type="text"
                name="website"
                value={form.website}
                onChange={onChange}
                placeholder="https://example.com"
                aria-label="Website URL"
              />
            </label>

            <label className="field">
              <span><FieldLabel kind="linkedin">LinkedIn</FieldLabel></span>
              <input
                type="text"
                name="linkedin"
                value={form.linkedin}
                onChange={onChange}
                placeholder="https://linkedin.com/in/username"
                aria-label="LinkedIn URL"
              />
            </label>

            <label className="field">
              <span><FieldLabel kind="twitter">Twitter / X</FieldLabel></span>
              <input
                type="text"
                name="twitter"
                value={form.twitter}
                onChange={onChange}
                placeholder="https://twitter.com/handle"
                aria-label="Twitter / X URL"
              />
            </label>

            <label className="field">
              <span><FieldLabel kind="instagram">Instagram</FieldLabel></span>
              <input
                type="text"
                name="instagram"
                value={form.instagram}
                onChange={onChange}
                placeholder="https://instagram.com/handle"
                aria-label="Instagram URL"
              />
            </label>

            <label className="field">
              <span><FieldLabel kind="facebook">Facebook</FieldLabel></span>
              <input
                type="text"
                name="facebook"
                value={form.facebook}
                onChange={onChange}
                placeholder="https://facebook.com/username"
                aria-label="Facebook URL"
              />
            </label>

            <label className="field">
              <span><FieldLabel kind="github">GitHub</FieldLabel></span>
              <input
                type="text"
                name="github"
                value={form.github}
                onChange={onChange}
                placeholder="https://github.com/username"
                aria-label="GitHub URL"
              />
            </label>

            <label className="field">
              <span><FieldLabel kind="website">Other #1</FieldLabel></span>
              <input
                type="text"
                name="other1"
                value={form.other1}
                onChange={onChange}
                placeholder="https://..."
                aria-label="Other link 1"
              />
            </label>

            <label className="field">
              <span><FieldLabel kind="website">Other #2</FieldLabel></span>
              <input
                type="text"
                name="other2"
                value={form.other2}
                onChange={onChange}
                placeholder="https://..."
                aria-label="Other link 2"
              />
            </label>
          </div>

          {error && (
            <p role="alert" style={{ color: 'var(--danger, #b91c1c)', marginTop: '.75rem' }}>
              {error}
            </p>
          )}

          <div style={{ display: 'flex', gap: '.5rem', marginTop: '.75rem' }}>
            <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button type="button" className="btn btn-sm" onClick={onCancel} disabled={saving}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  );
};

export default SocialLinksCard;