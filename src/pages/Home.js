import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AnimatedCounter = ({ target, suffix = '' }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const step = Math.ceil(target / 40);
    const timer = setInterval(() => {
      setCount(prev => {
        if (prev + step >= target) { clearInterval(timer); return target; }
        return prev + step;
      });
    }, 40);
    return () => clearInterval(timer);
  }, [target]);
  return <>{count}{suffix}</>;
};

const Home = () => {
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });

  useEffect(() => {
    axios.get(`${API}/stats`).then(r => { if (r.data.success) setStats(r.data.stats); }).catch(() => {});
  }, []);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', overflow: 'hidden' }}>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', minHeight: '92vh', display: 'flex', alignItems: 'center' }}>

        {/* Background layers */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          {/* Grid lines */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'linear-gradient(rgba(249,115,22,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.04) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }} />
          {/* Radial glow */}
          <div style={{
            position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)',
            width: 900, height: 600,
            background: 'radial-gradient(ellipse at center, rgba(249,115,22,0.12) 0%, rgba(139,92,246,0.06) 40%, transparent 70%)',
          }} />
          {/* Floating orbs */}
          <div style={{ position: 'absolute', top: '15%', right: '8%', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.08), transparent 70%)', animation: 'float 6s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: '10%', left: '5%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.08), transparent 70%)', animation: 'float 8s ease-in-out infinite reverse' }} />
        </div>

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '60px 24px', width: '100%', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>

            {/* Left */}
            <div>
              {/* Live badge */}
              <div className="fade-up" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 20, padding: '7px 16px', marginBottom: 28 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#F97316', display: 'inline-block', animation: 'pulse 1.5s ease-in-out infinite' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#F97316', letterSpacing: '1.5px' }}>PUNE CIVIC SAFETY PLATFORM</span>
              </div>

              <h1 className="fade-up-1" style={{ fontSize: 'clamp(38px,5.5vw,70px)', fontWeight: 900, color: '#EEF2FF', lineHeight: 1.08, marginBottom: 20, letterSpacing: '-1px' }}>
                Report Road<br />
                <span style={{ background: 'linear-gradient(135deg, #F97316 20%, #FBBF24 80%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Hazards
                </span>
                <br />Make Pune Safe
              </h1>

              <p className="fade-up-2" style={{ fontSize: 17, color: '#8899BB', lineHeight: 1.75, maxWidth: 480, marginBottom: 36 }}>
                Spotted a dangerous pothole? Report it in under 60 seconds with a photo and GPS pin. Track when PMC fixes it. Together we build safer roads.
              </p>

              <div className="fade-up-3" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 52 }}>
                <Link to="/report" className="btn-primary" style={{ padding: '14px 30px', fontSize: 15 }}>
                  📍 Report a Hazard
                </Link>
                <Link to="/map" className="btn-secondary" style={{ padding: '14px 30px', fontSize: 15 }}>
                  🗺️ View Live Map
                </Link>
              </div>

              {/* Mini stats */}
              <div className="fade-up-4" style={{ display: 'flex', gap: 32, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 28 }}>
                {[
                  { val: stats.total, suf: '+', label: 'Reports Filed' },
                  { val: stats.resolved, suf: '+', label: 'Issues Resolved' },
                  { val: 15, suf: '', label: 'Pune Wards' },
                ].map((s, i) => (
                  <div key={i}>
                    <div style={{ fontSize: 30, fontWeight: 900, color: '#EEF2FF', lineHeight: 1 }}>
                      <AnimatedCounter target={s.val} suffix={s.suf} />
                    </div>
                    <div style={{ fontSize: 12, color: '#8899BB', marginTop: 4, fontWeight: 500 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Visual card */}
            <div className="fade-up-2 hide-mobile" style={{ position: 'relative' }}>
              <div style={{
                background: 'linear-gradient(145deg, rgba(15,21,37,0.9), rgba(9,14,26,0.95))',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 24, padding: 28, boxShadow: '0 40px 100px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
                animation: 'float 7s ease-in-out infinite',
              }}>
                {/* Map preview fake */}
                <div style={{ background: '#080e1c', borderRadius: 14, height: 220, position: 'relative', overflow: 'hidden', marginBottom: 20, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(59,130,246,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.06) 1px,transparent 1px)', backgroundSize: '30px 30px' }} />
                  {[
                    { top: '25%', left: '30%', c: '#EF4444', s: 22, d: '0s' },
                    { top: '50%', left: '55%', c: '#F97316', s: 16, d: '0.5s' },
                    { top: '65%', left: '25%', c: '#EF4444', s: 26, d: '1s' },
                    { top: '20%', left: '70%', c: '#FBBF24', s: 14, d: '0.3s' },
                    { top: '75%', left: '65%', c: '#10B981', s: 16, d: '0.8s' },
                    { top: '40%', left: '15%', c: '#F97316', s: 18, d: '0.2s' },
                    { top: '35%', left: '50%', c: '#EF4444', s: 12, d: '1.2s' },
                  ].map((p, i) => (
                    <div key={i} style={{ position: 'absolute', top: p.top, left: p.left }}>
                      <div style={{ width: p.s, height: p.s, borderRadius: '50%', background: p.c, boxShadow: `0 0 ${p.s}px ${p.c}`, animation: `pulse 2s ${p.d} ease-in-out infinite` }} />
                    </div>
                  ))}
                  <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', background: 'rgba(5,8,15,0.85)', backdropFilter: 'blur(10px)', padding: '6px 16px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: 12, color: '#8899BB' }}>🗺️ Pune Live Hazard Map</span>
                  </div>
                </div>

                {/* Recent report cards */}
                {[
                  { icon: '🕳️', title: 'Deep pothole — FC Road', area: 'Shivajinagar', sev: 'critical', time: '2 min ago' },
                  { icon: '💧', title: 'Waterlogging — Kothrud', area: 'Kothrud', sev: 'high', time: '15 min ago' },
                  { icon: '🔩', title: 'Missing manhole — Baner', area: 'Baner', sev: 'critical', time: '1 hr ago' },
                ].map((r, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                    background: i === 0 ? 'rgba(249,115,22,0.06)' : 'rgba(255,255,255,0.02)',
                    borderRadius: 10, marginBottom: 6,
                    border: i === 0 ? '1px solid rgba(249,115,22,0.15)' : '1px solid rgba(255,255,255,0.04)',
                  }}>
                    <span style={{ fontSize: 20 }}>{r.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#EEF2FF', marginBottom: 2 }}>{r.title}</div>
                      <div style={{ fontSize: 11, color: '#8899BB' }}>{r.area}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className={`badge ${r.sev}`}>{r.sev}</span>
                      <div style={{ fontSize: 10, color: '#3D4F6B', marginTop: 3 }}>{r.time}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Floating badge */}
              <div style={{
                position: 'absolute', top: -16, right: -16,
                background: 'linear-gradient(135deg, #10B981, #059669)',
                borderRadius: 12, padding: '10px 16px',
                boxShadow: '0 8px 24px rgba(16,185,129,0.3)',
                animation: 'float 5s ease-in-out infinite',
              }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#fff', letterSpacing: '0.5px' }}>✅ LIVE STATUS</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>Updates in real-time</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '36px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
          {[
            { icon: '📊', label: 'Total Reports', val: stats.total, color: '#F97316' },
            { icon: '⏳', label: 'Pending Review', val: stats.pending, color: '#FBBF24' },
            { icon: '🔧', label: 'Being Fixed', val: stats.inProgress, color: '#8B5CF6' },
            { icon: '✅', label: 'Resolved', val: stats.resolved, color: '#10B981' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '20px 16px', background: 'var(--card)', borderRadius: 16, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 34, fontWeight: 900, color: s.color, lineHeight: 1, marginBottom: 4 }}>
                <AnimatedCounter target={s.val} />
              </div>
              <div style={{ fontSize: 12, color: '#8899BB', fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '100px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ display: 'inline-block', background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.15)', borderRadius: 20, padding: '6px 16px', marginBottom: 16 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#F97316', letterSpacing: '2px' }}>HOW IT WORKS</span>
          </div>
          <h2 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 900, color: '#EEF2FF', letterSpacing: '-0.5px' }}>Three Steps to Safer Roads</h2>
          <p style={{ color: '#8899BB', fontSize: 16, maxWidth: 460, margin: '12px auto 0' }}>Anyone can report a road hazard in under a minute. No registration required to view, just to report.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
          {[
            { step: '01', icon: '📸', title: 'Snap & Report', desc: 'Take a photo of the hazard. Our form auto-captures your GPS location. Describe the issue and submit — done in 60 seconds.', color: '#F97316' },
            { step: '02', icon: '🗺️', title: 'It Goes Live', desc: 'Your report instantly appears on the public map for all Pune residents. Others can upvote it to increase priority for PMC teams.', color: '#8B5CF6' },
            { step: '03', icon: '✅', title: 'Track the Fix', desc: 'Follow your report through Pending → Verified → In Progress → Resolved. Get notified when PMC marks it as fixed.', color: '#10B981' },
          ].map((s, i) => (
            <div key={i} style={{
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 20, padding: 32, position: 'relative', overflow: 'hidden',
              transition: 'transform 0.2s, border-color 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = `${s.color}30`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <div style={{ position: 'absolute', top: 20, right: 20, fontSize: 48, fontWeight: 900, color: 'rgba(255,255,255,0.03)', lineHeight: 1 }}>{s.step}</div>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: `${s.color}15`, border: `1px solid ${s.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, marginBottom: 20 }}>{s.icon}</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#EEF2FF', marginBottom: 10 }}>{s.title}</h3>
              <p style={{ fontSize: 14, color: '#8899BB', lineHeight: 1.7 }}>{s.desc}</p>
              <div style={{ marginTop: 20, height: 3, width: 48, background: `linear-gradient(90deg, ${s.color}, transparent)`, borderRadius: 2 }} />
            </div>
          ))}
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(24px,3.5vw,40px)', fontWeight: 900, color: '#EEF2FF', marginBottom: 12 }}>What Can You Report?</h2>
          <p style={{ textAlign: 'center', color: '#8899BB', marginBottom: 48 }}>All types of road hazards across Pune covered</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14 }}>
            {[
              { icon: '🕳️', name: 'Potholes', desc: 'Holes in road surface', color: '#EF4444' },
              { icon: '💧', name: 'Waterlogging', desc: 'Flooded roads', color: '#3B82F6' },
              { icon: '🔩', name: 'Missing Manhole', desc: 'Open manholes', color: '#F97316' },
              { icon: '〰️', name: 'Road Cracks', desc: 'Surface cracking', color: '#FBBF24' },
              { icon: '🚧', name: 'Broken Divider', desc: 'Damaged dividers', color: '#8B5CF6' },
              { icon: '⚠️', name: 'Other Hazards', desc: 'Debris, obstacles', color: '#6B7280' },
            ].map((c, i) => (
              <div key={i} style={{
                background: 'var(--card)', border: `1px solid ${c.color}20`,
                borderRadius: 16, padding: '22px 16px', textAlign: 'center',
                transition: 'transform 0.2s, background 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.background = `${c.color}08`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'var(--card)'; }}
              >
                <div style={{ fontSize: 34, marginBottom: 10 }}>{c.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: c.color, marginBottom: 4 }}>{c.name}</div>
                <div style={{ fontSize: 11, color: '#3D4F6B' }}>{c.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '100px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(249,115,22,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <h2 style={{ fontSize: 'clamp(28px,4.5vw,54px)', fontWeight: 900, color: '#EEF2FF', marginBottom: 16, letterSpacing: '-0.5px' }}>
            Ready to make Pune roads safer?
          </h2>
          <p style={{ fontSize: 17, color: '#8899BB', marginBottom: 36, lineHeight: 1.7 }}>
            Join hundreds of Pune citizens already reporting hazards. Every report counts — your submission could prevent the next accident.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/register" className="btn-primary" style={{ padding: '15px 34px', fontSize: 16 }}>
              🚀 Get Started — Free
            </Link>
            <Link to="/map" className="btn-secondary" style={{ padding: '15px 34px', fontSize: 16 }}>
              View All Reports
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)', padding: '28px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>🚧</span>
            <span style={{ fontWeight: 800, color: '#F97316' }}>PotholeWatch Pune</span>
          </div>
          <span style={{ color: '#3D4F6B', fontSize: 13 }}>Built for Pune Citizens · Hackathon 2024 · Made with ❤️</span>
          <span style={{ color: '#3D4F6B', fontSize: 13 }}>Helping PMC build safer roads</span>
        </div>
      </footer>
    </div>
  );
};

export default Home;
