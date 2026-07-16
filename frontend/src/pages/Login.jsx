import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import './Auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Pattern Overlays */}
      <div className="auth-bg-patterns">
        <div className="auth-bg-pattern-1">
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCz4vR0d5-A1sLEZjjq1hL1XyDUjR5XKk1x02gKWpl2OYjZGLlBxNC-dmtLNqUWT2EYFJm6uDQU5WG5t-KyJnpl5Raeuic8bPToK5mcVXsC5EzO8icxDvNp_26InZA1of9COkRGdL67pVUoggwivD7ZYs02QlIwq0Uy-glp5erlP7bbCawem5I4aTyXrqFzaSvtqA7xdjS2M44s874YDLl3g_EtieGdGHRZxtI85IGNPLv1S96dgcuwqQ" alt="Subtle architectural pattern" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <div className="auth-bg-pattern-2">
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAg2TknQN2OSWAdx77TPOtlOfPtarlw_UJ5zAUaTRRwv36IdTIb6uMzhIDY5cPBVhRjQbkn0oJ7CWb7NIV2KRyELTPHzDOgmlYsaVzItIh80-0QyOcFepY8-5Znn7w3e8M3obBrYZZNurJ_z2YhLpkhmGqj-0Pma95kZYN_iqG4VQRMWh6TDUmnIfJFpLq-_rpqOSrOWsPRN-INaUk4bhfeYMEEAT9lzbgJRltKUpGMOMBlNbFpJFX2Gw" alt="Premium paper texture pattern" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
      </div>

      <header className="auth-header">
        <div className="auth-brand">Duidku</div>
      </header>

      <main className="auth-main">
        <div className="auth-card-wrapper">
          <div className="auth-brand-center">
            <h1 className="auth-brand-title">Duidku</h1>
          </div>

          <div className="auth-card">
            <div className="auth-card-header">
              <h2 className="auth-card-title">Sign In</h2>
              <p className="auth-card-subtitle">Please enter your details to sign in</p>
            </div>

            {error && (
              <div className="auth-error-banner">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              {/* Email Field */}
              <div className="auth-field">
                <label htmlFor="email" className="auth-label">Email Address</label>
                <div className="auth-input-wrapper">
                  <input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="name@company.com" 
                    required 
                    className="auth-input"
                  />
                  <span className="material-symbols-outlined auth-input-icon">mail</span>
                </div>
              </div>

              {/* Password Field */}
              <div className="auth-field">
                <label htmlFor="password" className="auth-label">Password</label>
                <div className="auth-input-wrapper">
                  <input 
                    id="password" 
                    type={showPass ? 'text' : 'password'} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="••••••••" 
                    required 
                    className="auth-input"
                    style={{ paddingRight: '48px' }}
                  />
                  <span className="material-symbols-outlined auth-input-icon">lock</span>
                  <button 
                    type="button" 
                    onClick={() => setShowPass(!showPass)} 
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                    style={{ 
                      position: 'absolute', 
                      right: '12px', 
                      background: 'none', 
                      border: 'none', 
                      cursor: 'pointer', 
                      color: '#45464d', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      padding: '4px'
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                      {showPass ? 'visibility' : 'visibility_off'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button type="submit" disabled={loading} className="auth-btn-submit">
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin" style={{ fontSize: '18px' }}>progress_activity</span>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>
          </div>

          <div className="auth-footer">
            <p className="auth-footer-text">
              Don't have an account?{' '}
              <Link to="/register" className="auth-footer-link">Register Now</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}