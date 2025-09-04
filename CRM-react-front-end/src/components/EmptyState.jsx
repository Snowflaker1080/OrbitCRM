const EmptyState = ({
  title = 'Nothing here yet',
  children,
  action,              // React node (e.g., <Link ...>Add…</Link>)
  icon = '🛰️',
}) => {
  return (
    <div
      className="card"
      role="status"
      aria-live="polite"
      style={{ textAlign: 'center', padding: '2rem' }}
    >
      <div
        style={{ fontSize: '2rem', marginBottom: '.25rem' }}
        aria-hidden="true"
      >
        {icon}
      </div>

      <h3 style={{ margin: '0 0 .35rem 0' }}>{title}</h3>

      {children && (
        <p className="muted" style={{ marginTop: 0 }}>
          {children}
        </p>
      )}

      {action && <div style={{ marginTop: '.8rem' }}>{action}</div>}
    </div>
  );
};

export default EmptyState;