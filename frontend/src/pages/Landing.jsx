import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import './Landing.css';

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      navigate('/dashboard');
    }

    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [user, navigate]);

  return (
    <div className="landing-page">
      {/* Decorative Background Elements */}
      <div className="landing-bg-glow">
        <div className="glow-blob blob-1"></div>
        <div className="glow-blob blob-2"></div>
        <div className="glow-blob blob-3"></div>
      </div>

      {/* Navigation */}
      <header className={`landing-header ${scrolled ? 'scrolled' : ''}`}>
        <nav className="landing-nav">
          <div className="landing-logo">Duidku</div>
          <div className="landing-nav-actions">
            <Link to="/login" className="btn-nav-login">Login</Link>
            <Link to="/register" className="btn-nav-cta">Register</Link>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="landing-section hero-section">
          <div className="hero-content">
            <div className="landing-section-tag">
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>auto_awesome</span>
              <span>Smart Financial Management</span>
            </div>
            <h1 className="hero-title">
              Manage Finances More <span>Smartly</span> & Precisely
            </h1>
            <p className="hero-description">
              Track every expense manually, create category-based monthly budgets with intuitive visual indicators, and secure your financial future.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn-hero-primary">
                Get Started
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
              <a href="#features" className="btn-hero-secondary">Learn Features</a>
            </div>
          </div>

          <div className="hero-visual">
            {/* Custom Laptop Mockup */}
            <div className="laptop-mockup">
              <div className="laptop-screen">
                <div className="laptop-screen-display">
                  <img src="/dashboard-screenshot.png" alt="Duidku Dashboard Preview" />
                </div>
              </div>
              <div className="laptop-base"></div>
            </div>

            {/* Floating Micro UI Cards */}
            <div className="floating-card savings">
              <div className="floating-card-icon green">
                <span className="material-symbols-outlined">trending_up</span>
              </div>
              <div className="floating-card-content">
                <p className="floating-card-title">Surplus Balance</p>
                <p className="floating-card-value">+Rp 2.450.000</p>
              </div>
            </div>

            <div className="floating-card budget">
              <div className="floating-card-content">
                <p className="floating-card-title">Budget Limit</p>
                <div className="floating-card-progress">
                  <div className="floating-card-progress-bar" style={{ width: '75%' }}></div>
                </div>
                <p className="floating-card-title" style={{ marginTop: '4px', textAlign: 'right' }}>75% used</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="landing-section">
          <div className="landing-section-header">
            <div className="landing-section-tag">
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>grid_view</span>
              <span>App Features</span>
            </div>
            <h2 className="landing-section-title">Simple Tools, Maximum Control</h2>
          </div>

          <div className="features-grid">
            {/* Card 1 */}
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <span className="material-symbols-outlined">dashboard</span>
              </div>
              <h3 className="feature-card-title">Analytical Dashboard</h3>
              <p className="feature-card-desc">
                View daily spending trend charts, current remaining budget, today's expenses, and category percentage breakdown in one clean dashboard.
              </p>
            </div>

            {/* Card 2 */}
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <span className="material-symbols-outlined">account_balance_wallet</span>
              </div>
              <h3 className="feature-card-title">Category Budgeting</h3>
              <p className="feature-card-desc">
                Set monthly limits for food, entertainment, shopping, transport, and more. Get instant color-coded statuses like ON TRACK, REACHED, or EXCEEDED.
              </p>
            </div>

            {/* Card 3 */}
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <span className="material-symbols-outlined">history</span>
              </div>
              <h3 className="feature-card-title">Transaction History</h3>
              <p className="feature-card-desc">
                Search transactions by merchant or notes. Filter your spending with flexible timeframes (Today, This Week, This Month, Last 7 Days, Last 30 Days).
              </p>
            </div>
          </div>
        </section>

        {/* CTA Banner Section */}
        <section className="landing-section cta-section">
          <div className="cta-banner">
            <div className="cta-banner-content">
              <h2 className="cta-banner-title">Ready to Take Full Control of Your Money?</h2>
              <p className="cta-banner-desc">
                Join for free today. Record transactions, set budget limits, and achieve your financial goals with Duidku.
              </p>
              <div className="cta-banner-actions">
                <Link to="/register" className="btn-cta-banner-primary">Sign Up Free</Link>
                <Link to="/login" className="btn-cta-banner-secondary">Login to Account</Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-grid">
          <div className="footer-brand-column">
            <div className="footer-logo">Duidku</div>
            <p className="footer-brand-desc">
              A digital financial management solution helping you achieve your financial goals independently and securely.
            </p>
            <div className="footer-socials">
              <a href="#" className="footer-social-link"><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>public</span></a>
              <a href="#" className="footer-social-link"><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>alternate_email</span></a>
            </div>
          </div>

          <div className="footer-column">
            <h4 className="footer-column-title">Application</h4>
            <ul className="footer-links-list">
              <li><Link to="/login" className="footer-link">Login</Link></li>
              <li><Link to="/register" className="footer-link">Register Account</Link></li>
              <li><Link to="/dashboard" className="footer-link">Dashboard</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4 className="footer-column-title">Key Features</h4>
            <ul className="footer-links-list">
              <li><a href="#features" className="footer-link">Manual Tracking</a></li>
              <li><a href="#features" className="footer-link">Budget Allocation</a></li>
              <li><a href="#features" className="footer-link">Trend Charts</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4 className="footer-column-title">Technology</h4>
            <ul className="footer-links-list">
              <li><span className="footer-link" style={{ cursor: 'default' }}>React / Zustand</span></li>
              <li><span className="footer-link" style={{ cursor: 'default' }}>Node.js / Express</span></li>
              <li><span className="footer-link" style={{ cursor: 'default' }}>MongoDB / JWT</span></li>
            </ul>
          </div>
        </div>

        <div className="landing-footer-bottom">
          <div>
            <p className="footer-copyright">
              © {new Date().getFullYear()} DUIDKU FINTECH SOLUTIONS. ALL RIGHTS RESERVED.
            </p>
            <p className="footer-developer" style={{ fontSize: '12px', color: 'var(--on-surface-variant)', opacity: 0.8, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span>developed by lastMinute team with ❤️</span>
              <span style={{ opacity: 0.4 }}>|</span>
              <img src="https://www.vectorlogo.zone/logos/google_cloud/google_cloud-icon.svg" alt="GCP Logo" style={{ height: '14px', width: 'auto', display: 'inline-block', verticalAlign: 'middle' }} />
              <span>Powered by GCP</span>
            </p>
          </div>
          <div className="footer-badges">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1rcfkopx75lis3qhT7ZUg4qBfaBuRShsagTAZZN-8xMag-JLpVc0BrH0JEjA7iZz0gEUWEbzxdVtBabSK9uW9OTuc3OEJD7CxhNygf8q7Z3W_jaJwGH3pCNBn8hlsh-6nJAQuOCIrB9N2EssblpEURUNrWZjfjV5p-glUNN1gi_hR245nhRgxA4RZ06FP7k4N4tRJpLvWs95kMsPgEhpjAEUAOX2rebH9TyQaPDXKHFCZ93ENWETcUjaIq7uVg6mzzHvrN39yANc" alt="Secured Badge" />
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDkn4J8yWODqFm8vs9NHYII8Stn3MrVdEr7JNSDG9_GInHKysgkf-crppqtxE0TG1wtgNDPJ4598_JLzhssz5ZXXBIrIDCp4RN9aMgQIupsLd-7IIq8r1ZlV4ViBIKrZpzPggkunACmXlUPTUd1tKvEdpxQuKCHpXdvf_nBTma1I8O43Rjs5MKM8NsREhrwTtSKqoqkuj1ty7jrRx8fcIJd1LWWEKyt0Ome0w6jItmhxDNE4klWyq80PDPA6UERcrAERwwegqyxMWs" alt="Secure Certification Badge" />
          </div>
        </div>
      </footer>
    </div>
  );
}
