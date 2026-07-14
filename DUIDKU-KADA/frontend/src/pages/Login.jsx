import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login({ onLogin }) {
  const [tab, setTab] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (tab === 'register') {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      })
      const data = await res.json()
      if (!res.ok) return setError(data.error)
      setTab('login')
      setPassword('')
      return
    }
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    const data = await res.json()
    if (!res.ok) return setError(data.error)
    onLogin(data)
    navigate('/')
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-brand">
          <div className="auth-logo">
            <span className="material-symbols-outlined">account_balance_wallet</span>
          </div>
          <h1 className="auth-brand-name">WealthFlow</h1>
          <p className="auth-brand-sub">Enterprise Finance</p>
        </div>
        <div className="auth-card">
          <div className="auth-tabs">
            <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>Login</button>
            <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => setTab('register')}>Register</button>
          </div>
          <form className="auth-form active" onSubmit={handleSubmit}>
            {error && <div className="auth-error">{error}</div>}
            {tab === 'register' && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" required className="form-input" />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required className="form-input" minLength={6} />
            </div>
            <button type="submit" className="btn-primary auth-submit">
              {tab === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
            </button>
            <p className="auth-alt">
              {tab === 'login' ? (
                <>Don't have an account? <a href="#" onClick={e => { e.preventDefault(); setTab('register') }}>Register</a></>
              ) : (
                <>Already have an account? <a href="#" onClick={e => { e.preventDefault(); setTab('login') }}>Sign in</a></>
              )}
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
