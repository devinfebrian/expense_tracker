import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

export default function Sidebar() {
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const links = [
    { href: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { href: '/transactions', icon: 'receipt_long', label: 'Transactions' },
    { href: '/budgets', icon: 'account_balance_wallet', label: 'Budgets' },
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
        {links.map(l => (
          <Link key={l.href} to={l.href} className={`sidebar-link ${pathname === l.href ? 'active' : ''}`}>
            <span className="material-symbols-outlined">{l.icon}</span>
            <span>{l.label}</span>
          </Link>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button onClick={handleLogout} className="sidebar-btn">
          <span className="material-symbols-outlined">logout</span>
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
