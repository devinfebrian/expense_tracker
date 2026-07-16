import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

export default function Topbar() {
  const { user } = useAuth();

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h2 className="topbar-title-mobile">Duidku</h2>
      </div>
      <div className="topbar-right-mobile">
        <Link to="/profile" className="topbar-profile-avatar" title="View Profile">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name || 'User'} />
          ) : (
            <span className="topbar-avatar-fallback">
              {(user?.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
