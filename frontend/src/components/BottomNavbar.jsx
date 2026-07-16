import { Link, useLocation } from 'react-router-dom';

export default function BottomNavbar() {
  const { pathname } = useLocation();

  const links = [
    { href: '/dashboard', icon: 'dashboard', label: 'Overview' },
    { href: '/transactions', icon: 'receipt_long', label: 'History' },
    { href: '/budgets', icon: 'account_balance_wallet', label: 'Budgets' },
    { href: '/ai-insights', icon: 'auto_awesome', label: 'AI Insights' },
    { href: '/profile', icon: 'person', label: 'Profile' },
  ];

  return (
    <nav className="bottom-navbar">
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            to={link.href}
            className={`bottom-navbar-link ${isActive ? 'active' : ''}`}
          >
            <div className="bottom-navbar-icon-wrapper">
              <span className="material-symbols-outlined bottom-navbar-icon">
                {link.icon}
              </span>
            </div>
            <span className="bottom-navbar-label">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
