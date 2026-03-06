import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Fix default leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const createCustomIcon = (severity) => {
  const colors = { low: '#22C55E', medium: '#FCD34D', high: '#F97316', critical: '#EF4444' };
  const color = colors[severity] || '#FF5C1A';
  return L.divIcon({
    html: `<div style="
      width:14px; height:14px; background:${color}; border-radius:50%;
      border:2px solid white; box-shadow:0 0 8px ${color};
    "></div>`,
    className: 'custom-marker',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
};

const SEVERITY_COLORS = { low: '#22C55E', medium: '#FCD34D', high: '#F97316', critical: '#EF4444' };

const MapPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', severity: '', category: '' });
  const [selected, setSelected] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filter).toString();
      const res = await axios.get(`${API}/reports?${params}`);
      setReports(res.data.reports || []);
    } catch {
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, [filter]);

  const handleFilterChange = (key, val) => {
    setFilter(prev => ({ ...prev, [key]: val }));
  };

  return (
    <div style={styles.page}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <h2 style={styles.sidebarTitle}>🗺️ Live Hazard Map</h2>
        <p style={styles.sidebarSub}>Pune Urban Road Reports</p>

        {/* Filters */}
        <div style={styles.filterBox}>
          <label style={styles.filterLabel}>Status</label>
          <select style={styles.select} value={filter.status} onChange={e => handleFilterChange('status', e.target.value)}>
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          <label style={styles.filterLabel}>Severity</label>
          <select style={styles.select} value={filter.severity} onChange={e => handleFilterChange('severity', e.target.value)}>
            <option value="">All Severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>

          <label style={styles.filterLabel}>Category</label>
          <select style={styles.select} value={filter.category} onChange={e => handleFilterChange('category', e.target.value)}>
            <option value="">All Categories</option>
            <option value="pothole">Pothole</option>
            <option value="crack">Road Crack</option>
            <option value="waterlogging">Waterlogging</option>
            <option value="broken_divider">Broken Divider</option>
            <option value="missing_manhole">Missing Manhole</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Legend */}
        <div style={styles.legend}>
          <p style={styles.legendTitle}>Severity Legend</p>
          {Object.entries(SEVERITY_COLORS).map(([sev, col]) => (
            <div key={sev} style={styles.legendItem}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: col, boxShadow: `0 0 6px ${col}` }} />
              <span style={{ color: col, textTransform: 'capitalize', fontSize: 13 }}>{sev}</span>
            </div>
          ))}
        </div>

        {/* Report Count */}
        <div style={styles.countBox}>
          <span style={styles.countNum}>{reports.length}</span>
          <span style={styles.countLabel}>Reports Found</span>
        </div>

        {/* Selected Report */}
        {selected && (
          <div style={styles.selectedCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
              <h4 style={{ color: '#F0F0F0', fontSize: 14, fontFamily: 'Syne, sans-serif' }}>{selected.title}</h4>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>
            <p style={{ color: '#999', fontSize: 12, marginBottom: 8 }}>{selected.location.address}</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
              <span className={`badge ${selected.severity}`}>{selected.severity}</span>
              <span className={`badge ${selected.status}`}>{selected.status}</span>
            </div>
            <p style={{ color: '#aaa', fontSize: 12 }}>{selected.description?.substring(0, 100)}...</p>
            <p style={{ color: '#666', fontSize: 11, marginTop: 6 }}>👍 {selected.upvotes} upvotes</p>
          </div>
        )}

        <Link to="/report" style={styles.reportBtn}>+ Report New Hazard</Link>
      </div>

      {/* Map */}
      <div style={styles.mapContainer}>
        {loading && (
          <div style={styles.loadingOverlay}>
            <div className="spinner" />
            <p style={{ color: '#999', marginTop: 12 }}>Loading reports...</p>
          </div>
        )}
        <MapContainer
          center={[18.5204, 73.8567]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© OpenStreetMap contributors'
          />
          {reports.map(report => (
            <Marker
              key={report._id}
              position={[report.location.lat, report.location.lng]}
              icon={createCustomIcon(report.severity)}
              eventHandlers={{ click: () => setSelected(report) }}
            >
              <Popup>
                <div style={{ minWidth: 200, fontFamily: 'DM Sans, sans-serif' }}>
                  <b style={{ fontSize: 14 }}>{report.title}</b>
                  <p style={{ color: '#666', fontSize: 12, margin: '4px 0' }}>{report.location.address}</p>
                  <p style={{ fontSize: 12 }}>Severity: <b style={{ color: SEVERITY_COLORS[report.severity] }}>{report.severity}</b></p>
                  <p style={{ fontSize: 12 }}>Status: <b>{report.status}</b></p>
                  <p style={{ fontSize: 12 }}>👍 {report.upvotes} upvotes</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

const styles = {
  page: { display: 'flex', height: 'calc(100vh - 65px)', background: '#0D0D0D' },
  sidebar: {
    width: '300px', flexShrink: 0,
    background: '#111', borderRight: '1px solid #1E1E1E',
    padding: '24px 20px', overflowY: 'auto',
    display: 'flex', flexDirection: 'column', gap: '16px',
  },
  sidebarTitle: { fontSize: '20px', fontWeight: '800', color: '#F0F0F0', fontFamily: 'Syne, sans-serif' },
  sidebarSub: { fontSize: '13px', color: '#666', marginTop: '-8px' },
  filterBox: { display: 'flex', flexDirection: 'column', gap: '8px' },
  filterLabel: { fontSize: '11px', color: '#666', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'Syne, sans-serif' },
  select: {
    background: '#1A1A1A', border: '1px solid #2E2E2E',
    color: '#F0F0F0', padding: '8px 12px',
    borderRadius: '8px', fontSize: '13px', outline: 'none',
    cursor: 'pointer',
  },
  legend: { background: '#1A1A1A', borderRadius: '10px', padding: '14px', border: '1px solid #2E2E2E' },
  legendTitle: { fontSize: '11px', color: '#666', letterSpacing: '1px', marginBottom: '10px', fontFamily: 'Syne, sans-serif' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' },
  countBox: {
    background: 'rgba(255,92,26,0.1)', border: '1px solid rgba(255,92,26,0.3)',
    borderRadius: '10px', padding: '14px', textAlign: 'center',
  },
  countNum: { display: 'block', fontSize: '32px', fontWeight: '800', color: '#FF5C1A', fontFamily: 'Syne, sans-serif' },
  countLabel: { fontSize: '12px', color: '#999' },
  selectedCard: {
    background: '#1A1A1A', border: '1px solid #FF5C1A33',
    borderRadius: '10px', padding: '14px',
  },
  reportBtn: {
    display: 'block', textAlign: 'center',
    background: 'linear-gradient(135deg, #FF5C1A, #E04400)',
    color: '#fff', padding: '12px',
    borderRadius: '10px', textDecoration: 'none',
    fontWeight: '600', fontSize: '14px',
    boxShadow: '0 4px 15px rgba(255,92,26,0.3)',
    marginTop: 'auto',
  },
  mapContainer: { flex: 1, position: 'relative' },
  loadingOverlay: {
    position: 'absolute', inset: 0, zIndex: 1000,
    background: 'rgba(13,13,13,0.7)', backdropFilter: 'blur(4px)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  },
};

export default MapPage;
