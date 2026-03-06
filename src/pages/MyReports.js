import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const STATUS_STEPS = ['pending', 'verified', 'in_progress', 'resolved'];

const ReportCard = ({ report, onUpvote }) => {
  const stepIndex = STATUS_STEPS.indexOf(report.status);

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div style={{ flex: 1 }}>
          <h3 style={styles.cardTitle}>{report.title}</h3>
          <p style={styles.cardAddr}>📍 {report.location.address}</p>
        </div>
        <div style={styles.badges}>
          <span className={`badge ${report.severity}`}>{report.severity}</span>
          <span className={`badge ${report.status}`}>{report.status.replace('_', ' ')}</span>
        </div>
      </div>

      <p style={styles.cardDesc}>{report.description}</p>

      {report.images?.length > 0 && (
        <div style={styles.imgRow}>
          {report.images.map((img, i) => (
            <img key={i} src={img.url} alt="" style={styles.img} />
          ))}
        </div>
      )}

      {/* Progress Bar */}
      <div style={styles.progressSection}>
        <div style={styles.progressTrack}>
          {STATUS_STEPS.map((step, i) => (
            <React.Fragment key={step}>
              <div style={{
                ...styles.progressStep,
                background: i <= stepIndex ? '#FF5C1A' : '#2E2E2E',
                boxShadow: i === stepIndex ? '0 0 10px rgba(255,92,26,0.5)' : 'none',
              }}>
                {i < stepIndex ? '✓' : i === stepIndex ? '●' : '○'}
              </div>
              {i < STATUS_STEPS.length - 1 && (
                <div style={{ ...styles.progressLine, background: i < stepIndex ? '#FF5C1A' : '#2E2E2E' }} />
              )}
            </React.Fragment>
          ))}
        </div>
        <div style={styles.stepLabels}>
          {STATUS_STEPS.map(step => (
            <span key={step} style={{ fontSize: '10px', color: '#555', textTransform: 'capitalize', textAlign: 'center' }}>
              {step.replace('_', '\n')}
            </span>
          ))}
        </div>
      </div>

      <div style={styles.cardFooter}>
        <span style={{ color: '#555', fontSize: '12px' }}>
          📅 {new Date(report.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
        <button onClick={() => onUpvote(report._id)} style={styles.upvoteBtn}>
          👍 {report.upvotes} Upvotes
        </button>
      </div>
    </div>
  );
};

const MyReports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await axios.get(`${API}/reports`);
      const mine = res.data.reports.filter(r => r.reportedBy?._id === user?.id || r.reportedBy?.id === user?.id);
      setReports(mine);
    } catch {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (id) => {
    try {
      const res = await axios.patch(`${API}/reports/${id}/upvote`);
      setReports(prev => prev.map(r => r._id === id ? { ...r, upvotes: res.data.upvotes } : r));
    } catch {
      toast.error('Login to upvote');
    }
  };

  if (loading) return <div style={styles.center}><div className="spinner" /></div>;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <p style={styles.tag}>MY CONTRIBUTIONS</p>
            <h1 style={styles.title}>My Reports</h1>
            <p style={styles.sub}>Track all hazards you've reported</p>
          </div>
          <Link to="/report" style={styles.reportBtn}>+ New Report</Link>
        </div>

        {reports.length === 0 ? (
          <div style={styles.empty}>
            <div style={{ fontSize: '60px', marginBottom: '16px' }}>📋</div>
            <h3 style={{ color: '#F0F0F0', fontFamily: 'Syne, sans-serif', marginBottom: '8px' }}>No reports yet</h3>
            <p style={{ color: '#666' }}>Start by reporting a road hazard in your area!</p>
            <Link to="/report" style={{ ...styles.reportBtn, display: 'inline-block', marginTop: '20px' }}>Report First Hazard</Link>
          </div>
        ) : (
          <div style={styles.grid}>
            {reports.map(r => (
              <ReportCard key={r._id} report={r} onUpvote={handleUpvote} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: { background: '#0D0D0D', minHeight: 'calc(100vh - 65px)', padding: '40px 24px' },
  container: { maxWidth: '1100px', margin: '0 auto' },
  center: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: '36px', flexWrap: 'wrap', gap: '16px',
  },
  tag: { color: '#FF5C1A', fontSize: '11px', letterSpacing: '3px', fontFamily: 'Syne, sans-serif', fontWeight: '700', marginBottom: '8px' },
  title: { fontSize: '36px', fontWeight: '800', color: '#F0F0F0', fontFamily: 'Syne, sans-serif' },
  sub: { color: '#666', fontSize: '14px', marginTop: '4px' },
  reportBtn: {
    background: 'linear-gradient(135deg, #FF5C1A, #E04400)',
    color: '#fff', padding: '12px 22px', borderRadius: '10px',
    textDecoration: 'none', fontWeight: '600', fontSize: '14px',
    boxShadow: '0 4px 15px rgba(255,92,26,0.3)',
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))', gap: '20px' },
  card: {
    background: '#1A1A1A', border: '1px solid #2E2E2E',
    borderRadius: '16px', padding: '24px',
    display: 'flex', flexDirection: 'column', gap: '14px',
    animation: 'fadeIn 0.4s ease forwards',
  },
  cardHeader: { display: 'flex', gap: '12px', alignItems: 'flex-start' },
  cardTitle: { fontSize: '16px', fontWeight: '700', color: '#F0F0F0', fontFamily: 'Syne, sans-serif', marginBottom: '4px' },
  cardAddr: { color: '#666', fontSize: '12px' },
  badges: { display: 'flex', flexDirection: 'column', gap: '4px', flexShrink: 0 },
  cardDesc: { color: '#888', fontSize: '13px', lineHeight: '1.6' },
  imgRow: { display: 'flex', gap: '8px' },
  img: { width: '80px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #2E2E2E' },
  progressSection: { padding: '12px 0' },
  progressTrack: { display: 'flex', alignItems: 'center', marginBottom: '8px' },
  progressStep: {
    width: '22px', height: '22px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '10px', color: '#fff', flexShrink: 0, fontWeight: 700,
    transition: 'all 0.3s',
  },
  progressLine: { flex: 1, height: '2px', transition: 'background 0.3s' },
  stepLabels: { display: 'flex', justifyContent: 'space-between' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid #2E2E2E' },
  upvoteBtn: {
    background: 'rgba(255,92,26,0.1)', border: '1px solid rgba(255,92,26,0.3)',
    color: '#FF5C1A', padding: '6px 14px', borderRadius: '20px',
    fontSize: '12px', cursor: 'pointer', fontWeight: '600',
  },
  empty: {
    textAlign: 'center', padding: '80px 20px',
    background: '#1A1A1A', borderRadius: '20px', border: '1px solid #2E2E2E',
  },
};

export default MyReports;
