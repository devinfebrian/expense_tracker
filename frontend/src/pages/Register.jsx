import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import './Auth.css';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const getStrength = (val) => {
    if (val.length === 0) return 0;
    let score = 0;
    if (val.length > 0) score += 20;
    if (val.length >= 8) score += 20;
    if (/[A-Z]/.test(val)) score += 20;
    if (/[0-9]/.test(val)) score += 20;
    if (/[^A-Za-z0-9]/.test(val)) score += 20;
    return score;
  };

  const strength = getStrength(password);

  const getStrengthText = (score) => {
    if (score === 0) return 'STRENGTH';
    if (score <= 40) return 'WEAK';
    if (score <= 80) return 'MEDIUM';
    return 'STRONG';
  };

  const getStrengthClass = (score) => {
    if (score === 0) return 'strength-weak';
    if (score <= 40) return 'strength-weak';
    if (score <= 80) return 'strength-medium';
    return 'strength-strong';
  };

  const getStrengthTextClass = (score) => {
    if (score === 0) return 'text-on-primary-container';
    if (score <= 40) return 'text-error';
    if (score <= 80) return 'text-on-tertiary-fixed-variant';
    return 'text-on-secondary-container';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <header className="auth-header">
        <div className="auth-brand">Duidku</div>
        <Link to="/login" className="auth-header-link">Sign In</Link>
      </header>

      <main className="auth-main">
        <div className="auth-card-wrapper">
          <div className="auth-brand-center">
            <h1 className="auth-brand-title">Duidku</h1>
          </div>

          <div className="auth-card">
            <div className="auth-card-header">
              <h2 className="auth-card-title">Create Account</h2>
              <p className="auth-card-subtitle">Please enter your details to sign up</p>
            </div>

            {error && (
              <div className="auth-error-banner">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form" id="registrationForm">
              {/* Name Field */}
              <div className="auth-field">
                <label htmlFor="name" className="auth-label">Full Name</label>
                <div className="auth-input-wrapper">
                  <input 
                    id="name" 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Enter your full name" 
                    required 
                    className="auth-input"
                  />
                  <span className="material-symbols-outlined auth-input-icon">person</span>
                </div>
              </div>

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
                <div className="auth-label-row">
                  <label htmlFor="password" className="auth-label">Password</label>
                  <span 
                    id="strengthText" 
                    className={`strength-text ${getStrengthTextClass(strength)}`}
                  >
                    {getStrengthText(strength)}
                  </span>
                </div>
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
                      color: 'var(--text-secondary)', 
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
                
                {/* Strength Bar */}
                <div className="strength-bar-container">
                  <div 
                    id="strengthBar" 
                    className={`strength-bar-fill ${getStrengthClass(strength)}`}
                    style={{ width: `${strength}%` }}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={loading} 
                className="auth-btn-submit" 
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin" style={{ fontSize: '18px' }}>sync</span>
                    <span>Creating...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </form>

            <div className="auth-footer" style={{ marginTop: '24px' }}>
              <p className="auth-footer-text">
                Already have an account?{' '}
                <Link to="/login" className="auth-footer-link">Log in</Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}