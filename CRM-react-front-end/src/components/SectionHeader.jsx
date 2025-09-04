// src/components/SectionHeader.jsx
import React from 'react';

const SectionHeader = ({ title, subtitle, actions, center = false }) => {
  // base container: flex row by default
  const baseStyle = {
    display: 'flex',
    justifyContent: center ? 'center' : 'space-between',
    alignItems: center ? 'center' : 'flex-start',
    flexDirection: center ? 'column' : 'row',
    textAlign: center ? 'center' : 'left',
    gap: center ? '.5rem' : '0',
  };

  return (
    <header className="section-header" style={baseStyle}>
      <div className="title" style={{ fontWeight: 600, fontSize: '1.5rem' }}>
        {title}
      </div>
      {subtitle && (
        <p
          className="muted"
          style={{
            margin: center ? '.25rem 0 0' : 0,
            fontSize: '1rem',
          }}
        >
          {subtitle}
        </p>
      )}
      {actions && (
        <div
          className="actions"
          style={{
            marginTop: center ? '.5rem' : 0,
            display: 'inline-flex',
            gap: '.5rem',
          }}
        >
          {actions}
        </div>
      )}
    </header>
  );
};

export default SectionHeader;