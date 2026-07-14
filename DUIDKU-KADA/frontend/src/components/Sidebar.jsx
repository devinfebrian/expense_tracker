import { useLocation, useNavigate } from 'react-router-dom'

export default function Sidebar({ onLogout }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const links = [
    { href: '/', icon: 'dashboard', label: 'Overview' },
    { href: '/history-expense', icon: 'receipt_long', label: 'History Expense' },
    { href: '/budgets', icon: 'account_balance_wallet', label: 'Budgets' },
  ]

  const handleSignOut = (e) => {
    e.preventDefault()
    onLogout()
    navigate('/login')
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <span className="material-symbols-outlined">account_balance_wallet</span>
        </div>
        <div>
          <h1 className="sidebar-title">DUIDKU</h1>
          <p className="sidebar-subtitle">Expense Tracker</p>
        </div>
      </div>
      <nav className="sidebar-nav">
        {links.map(l => (
          <button key={l.href} onClick={() => navigate(l.href)} className={`sidebar-link ${pathname === l.href ? 'active' : ''}`}>
            <span className="material-symbols-outlined">{l.icon}</span>
            <span>{l.label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button className="btn-primary sidebar-btn" onClick={() => navigate('/history-expense')}>Add Transaction</button>
        <a href="#" onClick={handleSignOut} className="sidebar-link">
          <span className="material-symbols-outlined">logout</span>
          <span>Sign Out</span>
        </a>
      </div>
    </aside>
  )
}
