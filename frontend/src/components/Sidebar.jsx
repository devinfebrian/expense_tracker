import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

export default function Sidebar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = [
    { href: '/dashboard', icon: 'dashboard', label: 'Overview' },
    { href: '/transactions', icon: 'receipt_long', label: 'History Expense' },
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
        <div className="profile-card" style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '12px' }}>
          <div className="profile-avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', backgroundColor: 'var(--surface-dim)' }}>
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtln60KVN4RYuc3E_PWzJUg1Cy3GQNrr3IU0rg2E3__I4Yx_WBTS7o7Tadm5qx8oIMkdoP2_MxVkAShfY2pXmqO9rHuHbOdo2i_a385t9mvaGHZi_hgBXj8O02AulGfm730YCH6M0WuY3dtyS-tDAQyoP2h1Ur7Ou-YJyUDSzKeHnOPvBeYe6b5Mu8I-sDlTakY0kl0M2VfsI6ZeDFVLG3_LFpyyXmmJivXnlPsv2dV6T0qomvUJc2Dw"
              alt="Alex Chen Profile Portrait"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div className="profile-info" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <p className="profile-name" style={{ margin: 0, fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--on-surface)' }}>{user?.name || 'Alex Chen'}</p>
          </div>
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
              transition: 'background-color 0.2s'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
