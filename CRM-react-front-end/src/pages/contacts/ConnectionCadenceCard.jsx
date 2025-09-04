// src/components/contacts/ConnectionCadenceCard.jsx
import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api.js';

const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : '—');

// Approximate conversion factors
const UNIT_FACTORS = {
  weeks: 7,
  months: 30,
  years: 365,
};

function daysToQtyUnit(days) {
  if (!days || days <= 0) return { qty: 1, unit: 'months' };
  if (days % UNIT_FACTORS.years === 0) return { qty: days / UNIT_FACTORS.years, unit: 'years' };
  if (days % UNIT_FACTORS.months === 0) return { qty: days / UNIT_FACTORS.months, unit: 'months' };
  if (days % UNIT_FACTORS.weeks === 0) return { qty: days / UNIT_FACTORS.weeks, unit: 'weeks' };

  const months = Math.max(1, Math.round(days / UNIT_FACTORS.months));
  if (Math.abs(months * UNIT_FACTORS.months - days) <= 3) return { qty: months, unit: 'months' };

  const weeks = Math.max(1, Math.round(days / UNIT_FACTORS.weeks));
  return { qty: weeks, unit: 'weeks' };
}

function qtyUnitToDays(qty, unit) {
  const q = Number(qty) || 1;
  const factor = UNIT_FACTORS[unit] || UNIT_FACTORS.months;
  return q * factor;
}

const ConnectionCadenceCard = ({ contact, onRefresh }) => {
  const conn = contact?.connection || {};

  // Initial state from existing frequencyDays
  const initial = daysToQtyUnit(conn.frequencyDays ?? 30);
  const [qty, setQty] = useState(initial.qty);
  const [unit, setUnit] = useState(initial.unit);
  const [savingFreq, setSavingFreq] = useState(false);

  const [note, setNote] = useState('');
  const [logging, setLogging] = useState(false);

  useEffect(() => {
    const next = daysToQtyUnit(conn.frequencyDays ?? 30);
    setQty(next.qty);
    setUnit(next.unit);
  }, [conn.frequencyDays]);

  const approxDays = useMemo(() => qtyUnitToDays(qty, unit), [qty, unit]);

  const statusText = useMemo(() => {
    const due = conn.nextConnectDueAt ? new Date(conn.nextConnectDueAt) : null;
    if (!due) return '—';
    const now = new Date();
    const days = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    if (days < 0) return `Overdue by ${Math.abs(days)} day(s)`;
    if (days === 0) return 'Due today';
    return `Due in ${days} day(s)`;
  }, [conn.nextConnectDueAt]);

  const saveFrequency = async () => {
    setSavingFreq(true);
    try {
      const frequencyDays = qtyUnitToDays(qty, unit);
      await api.patch(`/contacts/${contact._id}/connection`, { frequencyDays });
      await onRefresh?.();
    } catch (e) {
      alert(e?.response?.data?.error || e?.message || 'Failed to save frequency');
    } finally {
      setSavingFreq(false);
    }
  };

  const logConnection = async () => {
    setLogging(true);
    try {
      await api.post(`/contacts/${contact._id}/connection/log`, { note });
      setNote('');
      await onRefresh?.();
    } catch (e) {
      alert(e?.response?.data?.error || e?.message || 'Failed to log connection');
    } finally {
      setLogging(false);
    }
  };

  return (
    <section className="card" style={{ padding: '1rem' }} aria-labelledby="cc-title">
      <h2 id="cc-title" style={{ marginTop: 0 }}>Connection cadence</h2>

      <p><strong>Status:</strong> {statusText}</p>
      <p>
        <strong>Frequency:</strong>{' '}
        {qty}{' '}
        {unit === 'years' ? (qty === 1 ? 'year' : 'years')
          : unit === 'months' ? (qty === 1 ? 'month' : 'months')
          : (qty === 1 ? 'week' : 'weeks')}
        {` (~${approxDays} day${approxDays === 1 ? '' : 's'})`}
      </p>
      <p><strong>First connected:</strong> {formatDate(conn.firstConnectedAt)}</p>
      <p><strong>Last connected:</strong> {formatDate(conn.lastConnectedAt)}</p>
      <p><strong>Next due:</strong> {formatDate(conn.nextConnectDueAt)}</p>

      <hr style={{ margin: '1rem 0' }} />

{/* FLEXBOX CONTROLS (prevents overlap) */}
      <label htmlFor="freq-qty" style={{ display: 'block', fontWeight: 600, marginBottom: '.5rem' }}>
        Every
      </label>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          id="freq-qty"
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
          style={{ maxWidth: '7rem' }}
          aria-label="Cadence quantity"
        />
        <select
          aria-label="Cadence unit"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          style={{ maxWidth: '10rem' }}
        >
          <option value="weeks">week(s)</option>
          <option value="months">month(s)</option>
          <option value="years">year(s)</option>
        </select>
        <button className="btn" onClick={saveFrequency} disabled={savingFreq}>
          {savingFreq ? 'Saving…' : 'Save frequency'}
        </button>
      </div>
      <div className="muted" style={{ fontSize: '.9rem', marginTop: '.4rem' }}>
        Stored as ~{approxDays} day{approxDays === 1 ? '' : 's'}.
      </div>

{/* Log a connection */}
      <div style={{ marginTop: '1rem', display: 'grid', gap: '.5rem' }}>
        <label htmlFor="log-note"><strong>Log a connection (today)</strong></label>
        <textarea
          id="log-note"
          rows={2}
          placeholder="Optional note…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button className="btn" onClick={logConnection} disabled={logging}>
          {logging ? 'Logging…' : 'Log connection'}
        </button>
      </div>
    </section>
  );
};

export default ConnectionCadenceCard;