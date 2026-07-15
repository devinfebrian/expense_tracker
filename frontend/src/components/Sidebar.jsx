import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

export default function Sidebar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isMinimized, setIsMinimized] = useState(() => localStorage.getItem('sidebar-minimized') === 'true');

  const handleToggle = () => {
    const nextVal = !isMinimized;
    setIsMinimized(nextVal);
    localStorage.setItem('sidebar-minimized', String(nextVal));
  };

  const links = [
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
    <aside className={`sidebar ${isMinimized ? 'minimized' : ''}`}>
      <button
        onClick={handleToggle}
        className="sidebar-toggle-btn"
        title={isMinimized ? 'Expand Sidebar' : 'Collapse Sidebar'}
      >
        <span className="material-symbols-outlined">
          {isMinimized ? 'chevron_right' : 'chevron_left'}
        </span>
      </button>

      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <span className="material-symbols-outlined">account_balance_wallet</span>
        </div>
        <div>
          <h1 className="sidebar-title">Duidku</h1>
          <p className="sidebar-subtitle">Wealth Management</p>
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
      <div className="sidebar-profile" style={{ padding: '0 16px', marginTop: 'auto' }}>
        <div className="profile-card" style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '12px', border: 'none', background: 'transparent', padding: 0, boxShadow: 'none' }}>
          <Link to="/profile" style={{ display: 'flex', alignItems: 'center', flex: 1, gap: '12px', minWidth: 0 }}>
            <div className="profile-avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
              <img
                src={user?.avatar || '/avatars/avatar1.svg'}
                alt="Profile Avatar"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div className="profile-info" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <p className="profile-name" style={{ margin: 0, fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--on-surface)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'Alex Chen'}</p>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="icon-btn"
            title="Sign Out"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
              borderRadius: '50%',
              cursor: 'pointer',
              color: 'var(--error)',
              transition: 'background-color 0.2s',
              flexShrink: 0
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
