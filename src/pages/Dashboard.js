import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const STATUSES = ['pending', 'verified', 'in_progress', 'resolved', 'rejected'];

const Dashboard = () => {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [updating, setUpdating] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [rRes, sRes] = await Promise.all([
        axios.get(`${API}/reports`),
        axios.get(`${API}/stats`)
      ]);
      setReports(rRes.data.reports || []);
      setStats(sRes.data.stats || {});
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status, adminNotes = '') => {
    setUpdating(id);
    try {
      const res = await axios.patch(`${API}/reports/${id}/status`, { status, adminNotes });
      setReports(prev => prev.map(r => r._id === id ? res.data.report : r));
      if (selected?._id === id) setSelected(res.data.report);
      toast.success(`Status updated to ${status}`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  const deleteReport = async (id) => {
    if (!window.confirm('Delete this report?')) return;
    try {
      await axios.delete(`${API}/reports/${id}`);
      setReports(prev => prev.filter(r => r._id !== id));
      if (selected?._id === id) setSelected(null);
      toast.success('Report deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const filtered = filter ? reports.filter(r => r.status === filter) : reports;

  if (loading) return <div style={styles.center}><div className="spinner" /></div>;

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <p style={styles.tag}>⚙️ ADMIN PANEL</p>
          <h1 style={styles.title}>PMC Dashboard</h1>
          <p style={styles.sub}>Pune Municipal Corporation — Road Hazard Management</p>
        </div>
        <button onClick={fetchAll} style={styles.refreshBtn}>🔄 Refresh</button>
      </div>

      {/* Stats Row */}
      <div style={styles.statsRow}>
        {[
          { label: 'Total', val: stats.total || 0, icon: '📊', color: '#FF5C1A' },
          { label: 'Pending', val: stats.pending || 0, icon: '⏳', color: '#FCD34D' },
          { label: 'In Progress', val: stats.inProgress || 0, icon: '🔧', color: '#A855F7' },
          { label: 'Resolved', val: stats.resolved || 0, icon: '✅', color: '#22C55E' },
        ].map(s => (
          <div key={s.label} style={{ ...styles.statCard, borderColor: s.color + '40' }}>
            <span style={{ fontSize: '24px' }}>{s.icon}</span>
            <span style={{ fontSize: '32px', fontWeight: '800', color: s.color, fontFamily: 'Syne, sans-serif' }}>{s.val}</span>
            <span style={{ fontSize: '12px', color: '#666' }}>{s.label}</span>
          </div>
        ))}
      </div>

      <div style={styles.body}>
        {/* Reports Table */}
        <div style={styles.tableSection}>
          <div style={styles.tableHeader}>
            <h3 style={styles.sectionTitle}>All Reports</h3>
            <select value={filter} onChange={e => setFilter(e.target.value)} style={styles.select}>
              <option value="">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  <th style={styles.th}>Title</th>
                  <th style={styles.th}>Area</th>
                  <th style={styles.th}>Severity</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Upvotes</th>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(report => (
                  <tr key={report._id} style={{ ...styles.tr, background: selected?._id === report._id ? 'rgba(255,92,26,0.05)' : 'transparent' }}
                    onClick={() => setSelected(report)}>
                    <td style={styles.td}>
                      <span style={{ color: '#F0F0F0', fontWeight: '500', fontSize: '13px' }}>{report.title}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ color: '#888', fontSize: '12px' }}>{report.location.ward || report.location.address?.substring(0, 25)}</span>
                    </td>
                    <td style={styles.td}><span className={`badge ${report.severity}`}>{report.severity}</span></td>
                    <td style={styles.td}><span className={`badge ${report.status}`}>{report.status.replace('_', ' ')}</span></td>
                    <td style={styles.td}><span style={{ color: '#FF5C1A', fontWeight: '600' }}>👍 {report.upvotes}</span></td>
                    <td style={styles.td}><span style={{ color: '#666', fontSize: '12px' }}>{new Date(report.createdAt).toLocaleDateString('en-IN')}</span></td>
                    <td style={styles.td} onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <select
                          value={report.status}
                          onChange={e => updateStatus(report._id, e.target.value)}
                          style={styles.smallSelect}
                          disabled={updating === report._id}
                        >
                          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <button onClick={() => deleteReport(report._id)} style={styles.delBtn} title="Delete">🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#555' }}>No reports found</div>
            )}
          </div>
        </div>

        {/* Detail Panel */}
        {selected && (
          <div style={styles.detailPanel}>
            <div style={styles.detailHeader}>
              <h3 style={styles.sectionTitle}>Report Detail</h3>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '18px' }}>✕</button>
            </div>

            <h4 style={{ color: '#F0F0F0', fontFamily: 'Syne, sans-serif', fontSize: '16px', marginBottom: '8px' }}>{selected.title}</h4>
            <p style={{ color: '#888', fontSize: '13px', marginBottom: '12px' }}>{selected.description}</p>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
              <span className={`badge ${selected.severity}`}>{selected.severity}</span>
              <span className={`badge ${selected.status}`}>{selected.status}</span>
              <span style={{ fontSize: '12px', color: '#666' }}>👍 {selected.upvotes}</span>
            </div>

            <div style={styles.detailRow}><span style={styles.detailKey}>📍 Address</span><span style={styles.detailVal}>{selected.location.address}</span></div>
            <div style={styles.detailRow}><span style={styles.detailKey}>🏘️ Ward</span><span style={styles.detailVal}>{selected.location.ward || '—'}</span></div>
            <div style={styles.detailRow}><span style={styles.detailKey}>📂 Category</span><span style={styles.detailVal}>{selected.category}</span></div>
            <div style={styles.detailRow}><span style={styles.detailKey}>👤 Reporter</span><span style={styles.detailVal}>{selected.reportedBy?.name || 'Anonymous'}</span></div>
            <div style={styles.detailRow}><span style={styles.detailKey}>📅 Date</span><span style={styles.detailVal}>{new Date(selected.createdAt).toLocaleString('en-IN')}</span></div>

            {selected.images?.length > 0 && (
              <div style={{ marginTop: '12px' }}>
                <p style={{ color: '#666', fontSize: '12px', marginBottom: '8px' }}>PHOTOS</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {selected.images.map((img, i) => (
                    <img key={i} src={img.url} alt="" style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginTop: '16px' }}>
              <p style={{ color: '#666', fontSize: '12px', marginBottom: '8px' }}>UPDATE STATUS</p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {STATUSES.map(s => (
                  <button key={s} onClick={() => updateStatus(selected._id, s)}
                    style={{
                      padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: '600',
                      background: selected.status === s ? '#FF5C1A' : '#1A1A1A',
                      color: selected.status === s ? '#fff' : '#888',
                      border: selected.status === s ? 'none' : '1px solid #2E2E2E',
                    }}>
                    {s.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: { background: '#0D0D0D', minHeight: 'calc(100vh - 65px)', padding: '32px 24px' },
  center: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' },
  tag: { color: '#FF5C1A', fontSize: '11px', letterSpacing: '3px', fontFamily: 'Syne, sans-serif', fontWeight: '700', marginBottom: '6px' },
  title: { fontSize: '32px', fontWeight: '800', color: '#F0F0F0', fontFamily: 'Syne, sans-serif' },
  sub: { color: '#666', fontSize: '13px' },
  refreshBtn: {
    background: '#1A1A1A', border: '1px solid #2E2E2E',
    color: '#F0F0F0', padding: '10px 18px', borderRadius: '8px',
    fontSize: '13px', cursor: 'pointer',
  },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
  statCard: {
    background: '#1A1A1A', border: '1px solid', borderRadius: '14px',
    padding: '20px', display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: '6px', textAlign: 'center',
  },
  body: { display: 'flex', gap: '20px', alignItems: 'flex-start' },
  tableSection: { flex: 1, background: '#1A1A1A', border: '1px solid #2E2E2E', borderRadius: '16px', overflow: 'hidden' },
  tableHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px', borderBottom: '1px solid #2E2E2E' },
  sectionTitle: { fontSize: '16px', fontWeight: '700', color: '#F0F0F0', fontFamily: 'Syne, sans-serif' },
  select: {
    background: '#111', border: '1px solid #2E2E2E', color: '#F0F0F0',
    padding: '7px 12px', borderRadius: '8px', fontSize: '13px', outline: 'none', cursor: 'pointer',
  },
  smallSelect: {
    background: '#111', border: '1px solid #2E2E2E', color: '#F0F0F0',
    padding: '4px 8px', borderRadius: '6px', fontSize: '11px', outline: 'none', cursor: 'pointer',
  },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#111' },
  th: { padding: '10px 14px', textAlign: 'left', fontSize: '11px', color: '#555', letterSpacing: '1px', fontFamily: 'Syne, sans-serif', borderBottom: '1px solid #2E2E2E' },
  tr: { borderBottom: '1px solid #1E1E1E', cursor: 'pointer', transition: 'background 0.15s' },
  td: { padding: '10px 14px', verticalAlign: 'middle' },
  delBtn: {
    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
    color: '#EF4444', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px',
  },
  detailPanel: {
    width: '320px', flexShrink: 0, background: '#1A1A1A',
    border: '1px solid #2E2E2E', borderRadius: '16px',
    padding: '20px', position: 'sticky', top: '85px',
  },
  detailHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #2E2E2E' },
  detailRow: { display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'flex-start' },
  detailKey: { color: '#555', fontSize: '12px', flexShrink: 0, width: '90px' },
  detailVal: { color: '#F0F0F0', fontSize: '12px', flex: 1 },
};

export default Dashboard;
