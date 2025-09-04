// src/components/NavBar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import orbitLogo from '../assets/Orbit CRM Logo.png';

const NavBar = () => {
  const { token, setToken, setUser } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    navigate('/sign-in', { replace: true });
  };

  return (
    <nav
      className="navbar"
      style={{
        display: 'flex',
        alignItems: 'center',
        // Space between brand and the centered cluster; cluster itself is centered via .nav-center
        justifyContent: 'space-between',
        padding: '0.75rem 1.5rem',
      }}
    >
      {/* Left: logo + brand */}
      <div className="nav-left" style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
        <img
          src={orbitLogo}
          alt="Orbit CRM"
          width={32}
          height={32}
          style={{ display: 'inline-block' }}
        />
        <Link to="/" className="nav-logo">
          Orbit CRM
        </Link>
      </div>

{/* Center: ALL action links/buttons (guest + authed) */}
{!token ? (
  <div className="nav-center">
    <Link to="/sign-up" className="signup nav-button">Sign Up</Link>
    <Link to="/sign-in" className="signin nav-button">Sign In</Link>
  </div>
) : (
  <div className="nav-center">
    <Link to="/dashboard" className="dashboard nav-button">Dashboard</Link>
    <Link to="/groups/new" className="new-group nav-button">New Group</Link>
    <Link to="/contacts/new" className="new-contact nav-button">New Contact</Link>
    <Link to="/invite" className="invite nav-button">Invite</Link>
    <button onClick={handleSignOut} className="btn-link signout nav-button">Sign Out</button>
  </div>
)}
    </nav>
  );
};

export default NavBar;