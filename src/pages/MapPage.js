import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const createCustomIcon = (severity) => {
  const colors = { low: '#10B981', medium: '#FBBF24', high: '#F97316', critical: '#EF4444' };
  const color = colors[severity] || '#F97316';
  return L.divIcon({
    html: `<div style="width:14px;height:14px;background:${color};border-radius:50%;border:2px solid white;box-shadow:0 0 8px ${color};"></div>`,
    className: 'custom-marker',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
};

const SEVERITY_COLORS = { low: '#10B981', medium: '#FBBF24', high: '#F97316', critical: '#EF4444' };

const MapPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', severity: '', category: '' });
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchReports();
  // eslint-disable-next-line
  }, [filter]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = Object.entries(filter)
        .filter(([, v]) => v)
        .map(([k, v]) => `${k}=${v}`)
        .join('&');
      const res = await axios.get(`${API}/reports?${params}`);
      setReports(res.data.reports || []);
    } catch {
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <h2 style={styles.sidebarTitle}>🗺️ Live Hazard Map</h2>
        <p style={styles.sidebarSub}>Pune Urban Roads</p>

        <div style={styles.filterBox}>
          <label style={styles.filterLabel}>Filter by Status</label>
          <select style={styles.select} value={filter.status} onChange={e => setFilter(p => ({ ...p, status: e.target.value }))}>
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          <label style={styles.filterLabel}>Filter by Severity</label>
          <select style={styles.select} value={filter.severity} onChange={e => setFilter(p => ({ ...p, severity: e.target.value }))}>
            <option value="">All Severities</option>
            <option value="low">🟢 Low</option>
            <option value="medium">🟡 Medium</option>
            <option value="high">🟠 High</option>
            <option value="critical">🔴 Critical</option>
          </select>

          <label style={styles.filterLabel}>Filter by Type</label>
          <select style={styles.select} value={filter.category} onChange={e => setFilter(p => ({ ...p, category: e.target.value }))}>
            <option value="">All Types</option>
            <option value="pothole">🕳️ Pothole</option>
            <option value="crack">〰️ Road Crack</option>
            <option value="waterlogging">💧 Waterlogging</option>
            <option value="broken_divider">🚧 Broken Divider</option>
            <option value="missing_manhole">🔩 Missing Manhole</option>
            <option value="other">⚠️ Other</option>
          </select>
        </div>

        {/* Legend */}
        <div style={styles.legend}>
          <p style={styles.legendTitle}>SEVERITY LEGEND</p>
          {Object.entries(SEVERITY_COLORS).map(([sev, col]) => (
            <div key={sev} style={styles.legendItem}>
              <div style={{ width: 11, height: 11, borderRadius: '50%', background: col, boxShadow: `0 0 6px ${col}` }} />
              <span style={{ color: col, textTransform: 'capitalize', fontSize: 13, fontWeight: 600 }}>{sev}</span>
            </div>
          ))}
        </div>

        <div style={styles.countBox}>
          <span style={styles.countNum}>{reports.length}</span>
          <span style={styles.countLabel}>Reports on Map</span>
        </div>

        {selected && (
          <div style={styles.selectedCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <h4 style={{ color: '#EEF2FF', fontSize: 13, fontWeight: 700, flex: 1, lineHeight: 1.4 }}>{selected.title}</h4>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: 16, marginLeft: 8 }}>✕</button>
            </div>
            <p style={{ color: '#8899BB', fontSize: 11, marginBottom: 8 }}>📍 {selected.location.address}</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
              <span className={`badge ${selected.severity}`}>{selected.severity}</span>
              <span className={`badge ${selected.status}`}>{selected.status.replace('_', ' ')}</span>
            </div>
            <p style={{ color: '#666', fontSize: 11 }}>👍 {selected.upvotes} upvotes</p>
          </div>
        )}

        <Link to="/report" style={styles.reportBtn}>+ Report New Hazard</Link>
      </div>

      {/* Map */}
      <div style={styles.mapContainer}>
        {loading && (
          <div style={styles.loadingOverlay}>
            <div className="spinner" />
            <p style={{ color: '#8899BB', marginTop: 12, fontSize: 14 }}>Loading reports...</p>
          </div>
        )}
        <MapContainer center={[18.5204, 73.8567]} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" />
          {reports.map(report => (
            <Marker
              key={report._id}
              position={[report.location.lat, report.location.lng]}
              icon={createCustomIcon(report.severity)}
              eventHandlers={{ click: () => setSelected(report) }}
            >
              <Popup>
                <div style={{ minWidth: 180, fontFamily: 'Outfit, sans-serif' }}>
                  <b style={{ fontSize: 13 }}>{report.title}</b>
                  <p style={{ color: '#666', fontSize: 11, margin: '4px 0' }}>{report.location.address}</p>
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
  page: { display: 'flex', height: 'calc(100vh - 68px)', background: '#05080F' },
  sidebar: {
    width: 290, flexShrink: 0,
    background: '#090E1A', borderRight: '1px solid rgba(255,255,255,0.06)',
    padding: '20px 16px', overflowY: 'auto',
    display: 'flex', flexDirection: 'column', gap: 14,
  },
  sidebarTitle: { fontSize: 18, fontWeight: 800, color: '#EEF2FF' },
  sidebarSub: { fontSize: 12, color: '#8899BB', marginTop: -10 },
  filterBox: { display: 'flex', flexDirection: 'column', gap: 8 },
  filterLabel: { fontSize: 10, color: '#3D4F6B', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700 },
  select: {
    background: '#0D1424', border: '1px solid rgba(255,255,255,0.08)',
    color: '#EEF2FF', padding: '9px 12px', borderRadius: 10,
    fontSize: 13, outline: 'none', cursor: 'pointer', width: '100%',
  },
  legend: { background: '#0D1424', borderRadius: 12, padding: '14px', border: '1px solid rgba(255,255,255,0.06)' },
  legendTitle: { fontSize: 10, color: '#3D4F6B', letterSpacing: '1.5px', marginBottom: 10, fontWeight: 700 },
  legendItem: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 },
  countBox: {
    background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)',
    borderRadius: 12, padding: '16px', textAlign: 'center',
  },
  countNum: { display: 'block', fontSize: 36, fontWeight: 900, color: '#F97316', lineHeight: 1 },
  countLabel: { fontSize: 12, color: '#8899BB', marginTop: 4, display: 'block' },
  selectedCard: {
    background: '#0D1424', border: '1px solid rgba(249,115,22,0.2)',
    borderRadius: 12, padding: 14,
  },
  reportBtn: {
    display: 'block', textAlign: 'center', marginTop: 'auto',
    background: 'linear-gradient(135deg, #F97316, #EA580C)',
    color: '#fff', padding: '13px', borderRadius: 12,
    textDecoration: 'none', fontWeight: 700, fontSize: 14,
    boxShadow: '0 4px 20px rgba(249,115,22,0.3)',
  },
  mapContainer: { flex: 1, position: 'relative' },
  loadingOverlay: {
    position: 'absolute', inset: 0, zIndex: 1000,
    background: 'rgba(5,8,15,0.8)', backdropFilter: 'blur(4px)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  },
};

export default MapPage;