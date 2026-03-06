import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (p) => location.pathname === p;

  const navLinks = [
    { to: '/', label: 'Home', icon: '🏠' },
    { to: '/map', label: 'Live Map', icon: '🗺️' },
    ...(user ? [{ to: '/report', label: 'Report', icon: '📍' }] : []),
    ...(user ? [{ to: '/my-reports', label: 'My Reports', icon: '📋' }] : []),
    ...(user?.role === 'admin' ? [{ to: '/dashboard', label: 'Dashboard', icon: '⚙️' }] : []),
  ];

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        transition: 'all 0.3s ease',
        background: scrolled ? 'rgba(5,8,15,0.95)' : 'rgba(5,8,15,0.6)',
        backdropFilter: 'blur(24px)',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'linear-gradient(135deg, #F97316, #EA580C)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, boxShadow: '0 4px 16px rgba(249,115,22,0.4)',
            }}>🚧</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 17, color: '#EEF2FF', letterSpacing: '-0.3px', lineHeight: 1.1 }}>PotholeWatch</div>
              <div style={{ fontSize: 10, color: '#F97316', fontWeight: 700, letterSpacing: '2px' }}>PUNE</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }} className="hide-mobile">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} style={{
                padding: '8px 16px', borderRadius: 10, fontSize: 14, fontWeight: 500,
                color: isActive(link.to) ? '#F97316' : '#8899BB',
                background: isActive(link.to) ? 'rgba(249,115,22,0.1)' : 'transparent',
                transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span style={{ fontSize: 13 }}>{link.icon}</span> {link.label}
              </Link>
            ))}
          </div>

          {/* Auth */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }} className="hide-mobile">
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10, padding: '7px 14px',
                }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg, #F97316, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
                    {user.name[0].toUpperCase()}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#EEF2FF' }}>{user.name.split(' ')[0]}</span>
                  {user.role === 'admin' && <span style={{ background: 'rgba(249,115,22,0.2)', color: '#F97316', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, letterSpacing: '0.5px' }}>ADMIN</span>}
                </div>
                <button onClick={() => { logout(); navigate('/'); }} style={{
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                  color: '#F87171', padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                  transition: 'all 0.2s',
                }}>Logout</button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <Link to="/login" style={{
                  padding: '8px 18px', borderRadius: 10, fontSize: 14, fontWeight: 600,
                  color: '#EEF2FF', border: '1px solid rgba(255,255,255,0.1)',
                  background: 'transparent', transition: 'all 0.2s',
                }}>Login</Link>
                <Link to="/register" style={{
                  padding: '8px 18px', borderRadius: 10, fontSize: 14, fontWeight: 700,
                  color: '#fff', background: 'linear-gradient(135deg, #F97316, #EA580C)',
                  boxShadow: '0 4px 16px rgba(249,115,22,0.35)', transition: 'all 0.2s',
                }}>Register</Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)} style={{
            display: 'none', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#EEF2FF', width: 38, height: 38, borderRadius: 10, fontSize: 16,
            alignItems: 'center', justifyContent: 'center',
          }} className="show-mobile-flex">
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{
            background: 'rgba(9,14,26,0.98)', backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            padding: '16px 24px 24px',
          }}>
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '13px 0', color: isActive(link.to) ? '#F97316' : '#8899BB',
                fontSize: 15, fontWeight: 500, borderBottom: '1px solid rgba(255,255,255,0.05)',
              }}>
                {link.icon} {link.label}
              </Link>
            ))}
            <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
              {user ? (
                <button onClick={() => { logout(); navigate('/'); setMenuOpen(false); }} style={{
                  flex: 1, padding: '12px', borderRadius: 10, background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.2)', color: '#F87171', fontWeight: 600, fontSize: 14,
                }}>Logout</button>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMenuOpen(false)} style={{ flex: 1, padding: '12px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#EEF2FF', fontWeight: 600, fontSize: 14, textAlign: 'center' }}>Login</Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)} style={{ flex: 1, padding: '12px', borderRadius: 10, background: 'linear-gradient(135deg,#F97316,#EA580C)', color: '#fff', fontWeight: 700, fontSize: 14, textAlign: 'center' }}>Register</Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
      <div style={{ height: 68 }} />

      <style>{`
        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
          .show-mobile-flex { display: flex !important; }
        }
        @media (min-width: 769px) {
          .show-mobile-flex { display: none !important; }
        }
      `}</style>
    </>
  );
};

export default Navbar;
