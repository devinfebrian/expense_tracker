import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

export default function Sidebar() {
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const mainLinks = [
    { href: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { href: '/transactions', icon: 'receipt_long', label: 'Transactions' },
    { href: '#', icon: 'analytics', label: 'Analytics', disabled: true },
    { href: '/budgets', icon: 'account_balance_wallet', label: 'Budgets' },
    { href: '#', icon: 'flag', label: 'Goals', disabled: true },
    { href: '#', icon: 'summarize', label: 'Reports', disabled: true },
    { href: '#', icon: 'category', label: 'Categories', disabled: true },
  ];

  const bottomLinks = [
    { href: '#', icon: 'settings', label: 'Settings', disabled: true },
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
          <h1 className="sidebar-title">SpendWise</h1>
          <p className="sidebar-subtitle">Track. Understand. Save.</p>
        </div>
      </div>
      <nav className="sidebar-nav">
        {mainLinks.map(l => (
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
        ))}
      </nav>
      <div className="sidebar-footer">
        {bottomLinks.map(l => (
          <span key={l.label} className="sidebar-link" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
            <span className="material-symbols-outlined">{l.icon}</span>
            <span>{l.label}</span>
          </span>
        ))}
        <button onClick={handleLogout} className="sidebar-btn">
          <span className="material-symbols-outlined">logout</span>
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
