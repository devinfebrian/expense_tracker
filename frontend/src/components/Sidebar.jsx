import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

export default function Sidebar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const mainLinks = [
    { href: '/dashboard', icon: 'dashboard', label: 'Overview' },
    { href: '/transactions', icon: 'receipt_long', label: 'History Expense' },
    { href: '/budgets', icon: 'account_balance_wallet', label: 'Budgets' },
    { href: '/ai-insights', icon: 'auto_awesome', label: 'AI Insights' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <span className="material-symbols-outlined">account_balance_wallet</span>
        </div>
        <div>
          <h1 className="sidebar-title">Duidku</h1>
          <p className="sidebar-subtitle">Track. Understand. Save.</p>
        </div>
      </div>
      <nav className="sidebar-nav">
        {mainLinks.map(l =>
          l.disabled ? (
            <span key={l.label} className="sidebar-link" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
              <span className="material-symbols-outlined">{l.icon}</span>
              <span>{l.label}</span>
            </span>
          ) : (
            <Link key={l.href} to={l.href} className={`sidebar-link ${pathname === l.href ? 'active' : ''}`}>
              <span className="material-symbols-outlined">{l.icon}</span>
              <span>{l.label}</span>
            </Link>
          )
        )}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-footer-row">
          <Link to="/profile" className="sidebar-profile-row">
            <div className="sidebar-avatar">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name || 'User'} />
              ) : (
                <span className="sidebar-avatar-fallback">
                  {(user?.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <span className="sidebar-profile-label">{user?.name || 'User'}</span>
          </Link>
          <button onClick={handleLogout} className="sidebar-btn" title="Log out">
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
