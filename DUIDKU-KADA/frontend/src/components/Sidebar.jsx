import { Link, useLocation } from 'react-router-dom'

export default function Sidebar() {
  const { pathname } = useLocation()

  const links = [
    { href: '/', icon: 'dashboard', label: 'Overview' },
    { href: '/transactions', icon: 'receipt_long', label: 'History Expense' },
    { href: '/budgets', icon: 'account_balance_wallet', label: 'Budgets' },
    { href: '#', icon: 'category', label: 'Categories' },
    { href: '#', icon: 'monitoring', label: 'Reports' },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <span className="material-symbols-outlined">account_balance_wallet</span>
        </div>
        <div>
          <h1 className="sidebar-title">WealthFlow</h1>
          <p className="sidebar-subtitle">Enterprise Finance</p>
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
        <button className="btn-primary sidebar-btn">Add Transaction</button>
        <a href="#" className="sidebar-link">
          <span className="material-symbols-outlined">help</span>
          <span>Help Center</span>
        </a>
        <a href="#" className="sidebar-link">
          <span className="material-symbols-outlined">logout</span>
          <span>Sign Out</span>
        </a>
      </div>
    </aside>
  )
}
