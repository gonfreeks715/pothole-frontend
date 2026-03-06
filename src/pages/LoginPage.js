import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}! 👋`);
      navigate(user.role === 'admin' ? '/dashboard' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative' }}>
      {/* BG */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(249,115,22,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(249,115,22,0.03) 1px,transparent 1px)', backgroundSize: '50px 50px', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(249,115,22,0.07), transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
        {/* Card */}
        <div style={{ background: 'rgba(13,20,36,0.9)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 40, backdropFilter: 'blur(20px)', boxShadow: '0 40px 100px rgba(0,0,0,0.5)' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ width: 60, height: 60, background: 'linear-gradient(135deg,#F97316,#EA580C)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 16px', boxShadow: '0 8px 28px rgba(249,115,22,0.4)' }}>🚧</div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: '#EEF2FF', marginBottom: 6, letterSpacing: '-0.3px' }}>Welcome Back</h1>
            <p style={{ color: '#8899BB', fontSize: 14 }}>Sign in to your PotholeWatch account</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#8899BB', letterSpacing: '0.8px', marginBottom: 8, textTransform: 'uppercase' }}>Email Address</label>
              <input
                type="email" value={form.email} required
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: '#EEF2FF', padding: '13px 16px', borderRadius: 12, fontSize: 15, transition: 'all 0.2s' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#8899BB', letterSpacing: '0.8px', marginBottom: 8, textTransform: 'uppercase' }}>Password</label>
              <input
                type="password" value={form.password} required
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: '#EEF2FF', padding: '13px 16px', borderRadius: 12, fontSize: 15, transition: 'all 0.2s' }}
              />
            </div>

            <button type="submit" disabled={loading} style={{
              background: loading ? 'rgba(249,115,22,0.5)' : 'linear-gradient(135deg,#F97316,#EA580C)',
              color: '#fff', border: 'none', padding: '14px', borderRadius: 12,
              fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 6px 24px rgba(249,115,22,0.4)',
              transition: 'all 0.2s', marginTop: 4,
            }}>
              {loading ? '⏳ Signing in...' : '🔑 Sign In'}
            </button>
          </form>

          {/* Demo creds */}
          <div style={{ background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.12)', borderRadius: 12, padding: 14, marginTop: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#F97316', letterSpacing: '1px', marginBottom: 8 }}>DEMO CREDENTIALS</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <p style={{ fontSize: 12, color: '#8899BB' }}>👤 Citizen: <span style={{ color: '#EEF2FF' }}>rahul@gmail.com</span> / <span style={{ color: '#EEF2FF' }}>pass123</span></p>
              <p style={{ fontSize: 12, color: '#8899BB' }}>⚙️ Admin: <span style={{ color: '#EEF2FF' }}>admin@pune.gov.in</span> / <span style={{ color: '#EEF2FF' }}>admin123</span></p>
            </div>
          </div>

          <p style={{ color: '#8899BB', fontSize: 14, textAlign: 'center', marginTop: 20 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#F97316', fontWeight: 700 }}>Register free</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
