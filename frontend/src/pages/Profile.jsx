/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../hooks/useAuth.js';
import './Profile.css';

export default function Profile() {
  const { user, updateProfile, updatePassword, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('/avatars/avatar1.svg');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      if (user.avatar) {
        setSelectedAvatar(user.avatar);
      }
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setLoading(true);

    try {
      if (!name.trim() || !email.trim()) {
        throw new Error('Name and email are required');
      }
      await updateProfile(name, email, selectedAvatar);
      setProfileSuccess('Profile details updated successfully.');
    } catch (err) {
      setProfileError(err.response?.data?.message || err.message || 'Failed to update profile details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    setLoading(true);

    try {
      if (!currentPassword || !newPassword || !confirmPassword) {
        throw new Error('All password fields are required');
      }
      if (newPassword.length < 8) {
        throw new Error('New password must be at least 8 characters long');
      }
      if (newPassword !== confirmPassword) {
        throw new Error('Confirm password does not match new password');
      }

      await updatePassword(currentPassword, newPassword);
      setPasswordSuccess('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.response?.data?.message || err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="profile-container">
        <div className="profile-layout" style={{ marginTop: 24 }}>
          {/* Left Column: Identity Sidebar */}
          <div className="profile-sidebar">
            <section className="profile-identity-card">
              <div className="profile-avatar-container" style={{ marginBottom: 16 }}>
                <div
                  className="profile-avatar-img"
                  style={{
                    width: '128px',
                    height: '128px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    margin: '0 auto',
                    border: '4px solid var(--surface)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                  }}
                >
                  <img
                    src={selectedAvatar}
                    alt="Current Avatar Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              </div>
              <h2 className="profile-name">{user?.name || 'User Account'}</h2>
              <p style={{ fontSize: 13, color: 'var(--outline)', margin: 0, marginBottom: 24 }}>{user?.email}</p>

              <button
                onClick={handleLogout}
                className="btn"
                style={{
                  width: '100%',
                  background: 'transparent',
                  color: 'var(--error)',
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
                Sign Out
              </button>
            </section>
          </div>

          {/* Right Column: Edit Forms */}
          <div className="profile-forms-column">
            {/* Personal Details Form */}
            <form onSubmit={handleSaveProfile} className="profile-card">
              <div className="profile-card-header">
                <h3 className="profile-card-title">Personal Details</h3>
                <span className="profile-card-subtitle">Fields marked * are mandatory</span>
              </div>
              <div className="profile-card-body">
                {profileSuccess && (
                  <div className="alert" style={{ background: '#d1e7dd', color: '#0f5132', border: '1px solid #badbcc', marginBottom: 0 }}>
                    <span className="material-symbols-outlined">check_circle</span>
                    <span>{profileSuccess}</span>
                  </div>
                )}
                {profileError && (
                  <div className="alert alert-warning" style={{ marginBottom: 0 }}>
                    <span className="material-symbols-outlined">error</span>
                    <span>{profileError}</span>
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="full_name">Full Name *</label>
                    <input
                      className="form-input"
                      id="full_name"
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="email_address">Email Address *</label>
                    <input
                      className="form-input"
                      id="email_address"
                      type="email"
                      placeholder="name@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '24px', marginTop: '16px' }}>
                  <label className="form-label" style={{ display: 'block', marginBottom: '12px', fontWeight: 600 }}>Choose Profile Avatar</label>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {['/avatars/avatar1.svg', '/avatars/avatar2.svg', '/avatars/avatar3.svg', '/avatars/avatar4.svg', '/avatars/avatar5.svg', '/avatars/avatar6.svg'].map((av) => (
                      <button
                        key={av}
                        type="button"
                        onClick={() => setSelectedAvatar(av)}
                        style={{
                          width: '64px',
                          height: '64px',
                          borderRadius: '50%',
                          overflow: 'hidden',
                          border: selectedAvatar === av ? '3px solid var(--secondary)' : '1px solid var(--outline-variant)',
                          padding: 0,
                          cursor: 'pointer',
                          transform: selectedAvatar === av ? 'scale(1.08)' : 'scale(1)',
                          transition: 'all 0.2s ease',
                          boxShadow: selectedAvatar === av ? '0 4px 10px rgba(0, 108, 73, 0.2)' : 'none',
                        }}
                      >
                        <img src={av} alt="Avatar option" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="profile-actions" style={{ marginTop: 8 }}>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                    style={{ padding: '10px 24px', fontSize: 14 }}
                  >
                    {loading ? 'Saving Details...' : 'Save Details'}
                  </button>
                </div>
              </div>
            </form>

            {/* Edit Password Form */}
            <form onSubmit={handleSavePassword} className="profile-card">
              <div className="profile-card-header">
                <h3 className="profile-card-title">Edit Password</h3>
              </div>
              <div className="profile-card-body">
                {passwordSuccess && (
                  <div className="alert" style={{ background: '#d1e7dd', color: '#0f5132', border: '1px solid #badbcc', marginBottom: 0 }}>
                    <span className="material-symbols-outlined">check_circle</span>
                    <span>{passwordSuccess}</span>
                  </div>
                )}
                {passwordError && (
                  <div className="alert alert-warning" style={{ marginBottom: 0 }}>
                    <span className="material-symbols-outlined">error</span>
                    <span>{passwordError}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label" htmlFor="current_password">Current Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      className="form-input"
                      id="current_password"
                      type={showCurrentPass ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      style={{ paddingRight: 48 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <span className="material-symbols-outlined">{showCurrentPass ? 'visibility' : 'visibility_off'}</span>
                    </button>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="new_password">New Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        className="form-input"
                        id="new_password"
                        type={showNewPass ? 'text' : 'password'}
                        placeholder="Min. 8 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        style={{ paddingRight: 48 }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <span className="material-symbols-outlined">{showNewPass ? 'visibility' : 'visibility_off'}</span>
                      </button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="confirm_password">Confirm New Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        className="form-input"
                        id="confirm_password"
                        type={showConfirmPass ? 'text' : 'password'}
                        placeholder="Re-enter new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        style={{ paddingRight: 48 }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <span className="material-symbols-outlined">{showConfirmPass ? 'visibility' : 'visibility_off'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="profile-actions" style={{ marginTop: 8 }}>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                    style={{ padding: '10px 24px', fontSize: 14 }}
                  >
                    {loading ? 'Updating Password...' : 'Update Password'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
