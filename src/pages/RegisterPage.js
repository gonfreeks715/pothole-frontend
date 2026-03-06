import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', ward: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('🎉 Account created! Welcome to PotholeWatch!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const wards = ['Shivajinagar','Kothrud','Hadapsar','Wakad','Baner','Kondhwa','Pimpri-Chinchwad','Aundh','Viman Nagar','Katraj','Swargate','Deccan','Kharadi','Hinjewadi','Yerawada'];

  const inputStyle = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: '#EEF2FF', padding: '13px 16px', borderRadius: 12, fontSize: 15, transition: 'all 0.2s' };
  const labelStyle = { display: 'block', fontSize: 12, fontWeight: 700, color: '#8899BB', letterSpacing: '0.8px', marginBottom: 8, textTransform: 'uppercase' };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(139,92,246,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,0.03) 1px,transparent 1px)', backgroundSize: '50px 50px', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(139,92,246,0.07), transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 500, position: 'relative', zIndex: 1 }}>
        <div style={{ background: 'rgba(13,20,36,0.9)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 40, backdropFilter: 'blur(20px)', boxShadow: '0 40px 100px rgba(0,0,0,0.5)' }}>

          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ width: 60, height: 60, background: 'linear-gradient(135deg,#8B5CF6,#6D28D9)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 16px', boxShadow: '0 8px 28px rgba(139,92,246,0.4)' }}>🚀</div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: '#EEF2FF', marginBottom: 6 }}>Join PotholeWatch</h1>
            <p style={{ color: '#8899BB', fontSize: 14 }}>Create your free account and start reporting hazards</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={labelStyle}>Full Name *</label>
                <input value={form.name} required onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Rahul Patil" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Phone</label>
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="9876543210" style={inputStyle} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Email Address *</label>
              <input type="email" value={form.email} required onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Password *</label>
              <input type="password" value={form.password} required minLength={6} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Minimum 6 characters" style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Your Ward / Area</label>
              <select value={form.ward} onChange={e => setForm({ ...form, ward: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">Select your ward in Pune</option>
                {wards.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>

            <button type="submit" disabled={loading} style={{
              background: loading ? 'rgba(139,92,246,0.5)' : 'linear-gradient(135deg,#8B5CF6,#6D28D9)',
              color: '#fff', border: 'none', padding: '14px', borderRadius: 12,
              fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 6px 24px rgba(139,92,246,0.4)',
              transition: 'all 0.2s', marginTop: 4,
            }}>
              {loading ? '⏳ Creating Account...' : '✨ Create Free Account'}
            </button>
          </form>

          <p style={{ color: '#8899BB', fontSize: 14, textAlign: 'center', marginTop: 20 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#F97316', fontWeight: 700 }}>Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
