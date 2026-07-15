import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

export default function Topbar({ onMenuClick }) {
  const { user } = useAuth();
  const displayName = user?.name || 'User';
  const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="menu-btn" onClick={onMenuClick} aria-label="Open menu">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h2 className="topbar-title-mobile">Duidku</h2>
      </div>
      <div className="topbar-actions">
        <button className="topbar-icon-btn" aria-label="Notifications">
          <span className="material-symbols-outlined">notifications</span>
          <span className="badge" />
        </button>
        <Link to="/profile" className="topbar-profile" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
          <span className="topbar-profile-name">{displayName}</span>
          <div className="topbar-avatar">
            {user?.avatar ? (
              <img src={user.avatar} alt={displayName} />
            ) : (
              <span className="avatar-fallback">{initials}</span>
            )}
          </div>
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--text-secondary)' }}>expand_more</span>
        </Link>
      </div>
    </header>
  );
}
