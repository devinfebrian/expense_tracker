import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Scores character-class diversity (lowercase/uppercase/digit/symbol) plus
  // length, so a long run of the same character no longer maxes out the meter.
  const getStrength = (val) => {
    if (val.length === 0) return 0;

    let variety = 0;
    if (/[a-z]/.test(val)) variety += 1;
    if (/[A-Z]/.test(val)) variety += 1;
    if (/[0-9]/.test(val)) variety += 1;
    if (/[^a-zA-Z0-9]/.test(val)) variety += 1;

    if (val.length < 8) return 1;
    if (variety <= 1) return 1;
    if (variety === 2) return 2;
    if (variety === 3) return 3;
    return 4;
  };

  const strength = getStrength(password);
  const colors = ['#e5eeff', '#ba1a1a', '#f23d5c', '#006c49', '#006c49'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/register', { name, email, password });
      // NOTE: storing the JWT in localStorage is convenient but exposes it to
      // any XSS on the page. If you want stronger protection, move to an
      // httpOnly cookie set by the backend instead (requires a small server change).
      localStorage.setItem('token', res.data.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: 'Inter, sans-serif', color: '#0b1c30' }}>
      <header style={{ position: 'fixed', top: 0, width: '100%', background: '#f8f9ff', zIndex: 50, padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1280, margin: '0 auto' }}>
          <span style={{ fontSize: 24, fontWeight: 700 }}>Duidku</span>
          <Link to="/login" style={{ fontSize: 14, color: '#45464d', textDecoration: 'none' }}>Sign In</Link>
        </div>
      </header>
      <main style={{ paddingTop: 80, paddingBottom: 48, paddingLeft: 16, paddingRight: 16, minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: '#0b1c30', marginBottom: 4 }}>Create Account</h1>
        </div>
        <div style={{ maxWidth: 400, margin: '0 auto', width: '100%', background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: 32, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          {error && <p style={{ color: '#ba1a1a', marginBottom: 16, fontSize: 14, textAlign: 'center' }}>{error}</p>}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <label htmlFor="name" style={{ fontSize: 14, fontWeight: 600, color: '#45464d', marginBottom: 8, display: 'block' }}>Full Name</label>
              <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your full name" required
                style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #c6c6cd', fontSize: 16, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label htmlFor="email" style={{ fontSize: 14, fontWeight: 600, color: '#45464d', marginBottom: 8, display: 'block' }}>Email Address</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" required
                style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #c6c6cd', fontSize: 16, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label htmlFor="password" style={{ fontSize: 14, fontWeight: 600, color: '#45464d', marginBottom: 8, display: 'block' }}>Password</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a strong password" required minLength={8}
                style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #c6c6cd', fontSize: 16, outline: 'none', boxSizing: 'border-box' }} />
              <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= strength ? colors[strength] : '#e5eeff' }} />
                ))}
              </div>
              <p style={{ fontSize: 14, color: '#45464d', marginTop: 4 }}>Minimum 8 characters, mix upper/lowercase, numbers &amp; symbols for a stronger score</p>
            </div>
            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: 12, background: '#000', color: '#fff', fontWeight: 600, fontSize: 16, borderRadius: 8, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}