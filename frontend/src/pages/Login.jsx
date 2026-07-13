import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '16px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0b1c30' }}>Duidku</h1>
      </header>
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 16px 48px' }}>
        <div style={{ maxWidth: 400, width: '100%', textAlign: 'center', marginBottom: 32 }}>
          <h2 style={{ fontSize: 28, fontWeight: 600, color: '#0b1c30', marginBottom: 8 }}>Sign In</h2>
          <p style={{ color: '#45464d', fontSize: 16 }}>Please enter your details to sign in</p>
        </div>
        <div style={{ maxWidth: 400, width: '100%', background: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          {error && <p style={{ color: '#ba1a1a', marginBottom: 16, fontSize: 14, textAlign: 'center' }}>{error}</p>}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <label htmlFor="email" style={{ display: 'block', fontWeight: 600, color: '#0b1c30', marginBottom: 8, fontSize: 16 }}>Email Address</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" required
                style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid #c6c6cd', fontSize: 16, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label htmlFor="password" style={{ fontWeight: 600, color: '#0b1c30', fontSize: 16 }}>Password</label>
              </div>
              <div style={{ position: 'relative' }}>
                <input id="password" type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid #c6c6cd', fontSize: 16, outline: 'none', boxSizing: 'border-box' }} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#45464d', fontSize: 20 }}>
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '12px', background: '#213145', color: '#fff', fontWeight: 600, fontSize: 16, borderRadius: 8, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p style={{ marginTop: 24, textAlign: 'center', color: '#45464d', fontSize: 16 }}>
            Don't have an account? <Link to="/register" style={{ color: '#006c49', fontWeight: 600, textDecoration: 'underline' }}>Register Now</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
