import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import axios from 'axios';
import { toast } from 'react-toastify';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const LocationPicker = ({ onLocationSelect }) => {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      onLocationSelect(lat, lng);
    }
  });

  return position ? <Marker position={position} /> : null;
};

const ReportPage = () => {
  const navigate = useNavigate();
  const fileRef = useRef();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [locationMode, setLocationMode] = useState('gps'); // 'gps' or 'map'

  const [form, setForm] = useState({
    title: '', description: '', category: 'pothole',
    severity: 'medium', lat: '', lng: '',
    address: '', ward: '', landmark: '',
  });

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGPS = () => {
    if (!navigator.geolocation) return toast.error('GPS not supported');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setForm(prev => ({ ...prev, lat: latitude, lng: longitude }));
        // Reverse geocode
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          setForm(prev => ({ ...prev, address: data.display_name?.substring(0, 100) || `${latitude}, ${longitude}` }));
          toast.success('📍 GPS location captured!');
        } catch {
          setForm(prev => ({ ...prev, address: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}` }));
        }
      },
      () => toast.error('Could not get GPS location')
    );
  };

  const handleMapClick = async (lat, lng) => {
    setForm(prev => ({ ...prev, lat, lng }));
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
      const data = await res.json();
      setForm(prev => ({ ...prev, address: data.display_name?.substring(0, 100) || `${lat}, ${lng}` }));
    } catch {
      setForm(prev => ({ ...prev, address: `${lat.toFixed(5)}, ${lng.toFixed(5)}` }));
    }
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files).slice(0, 3);
    setImages(files);
    const prev = files.map(f => URL.createObjectURL(f));
    setPreviews(prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.lat || !form.lng) return toast.error('Please select a location on the map or use GPS');
    if (!form.address) return toast.error('Address is required');

    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      images.forEach(img => formData.append('images', img));

      await axios.post(`${API}/reports`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('✅ Hazard reported successfully! Thank you for making Pune safer.');
      setTimeout(() => navigate('/map'), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <p style={styles.tag}>🚧 REPORT HAZARD</p>
          <h1 style={styles.title}>Report a Road Hazard</h1>
          <p style={styles.subtitle}>Help keep Pune roads safe. Fill in the details below.</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.grid}>
            {/* Left Column */}
            <div style={styles.col}>
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>📋 Basic Information</h3>

                <div style={styles.field}>
                  <label style={styles.label}>Title *</label>
                  <input
                    name="title" value={form.title} onChange={handleChange}
                    placeholder="e.g. Deep pothole near Shivajinagar signal"
                    style={styles.input} required
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Description *</label>
                  <textarea
                    name="description" value={form.description} onChange={handleChange}
                    placeholder="Describe the hazard in detail — size, danger level, how long it's been there..."
                    style={{ ...styles.input, height: '100px', resize: 'vertical' }} required
                  />
                </div>

                <div style={styles.row2}>
                  <div style={styles.field}>
                    <label style={styles.label}>Category *</label>
                    <select name="category" value={form.category} onChange={handleChange} style={styles.select}>
                      <option value="pothole">🕳️ Pothole</option>
                      <option value="crack">🔱 Road Crack</option>
                      <option value="waterlogging">💧 Waterlogging</option>
                      <option value="broken_divider">🛑 Broken Divider</option>
                      <option value="missing_manhole">🔩 Missing Manhole</option>
                      <option value="other">⚠️ Other</option>
                    </select>
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>Severity *</label>
                    <select name="severity" value={form.severity} onChange={handleChange} style={styles.select}>
                      <option value="low">🟢 Low</option>
                      <option value="medium">🟡 Medium</option>
                      <option value="high">🟠 High</option>
                      <option value="critical">🔴 Critical</option>
                    </select>
                  </div>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Landmark</label>
                  <input
                    name="landmark" value={form.landmark} onChange={handleChange}
                    placeholder="e.g. Near McDonald's, opposite Pune station"
                    style={styles.input}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Ward / Area</label>
                  <select name="ward" value={form.ward} onChange={handleChange} style={styles.select}>
                    <option value="">Select Ward</option>
                    {['Shivajinagar', 'Kothrud', 'Hadapsar', 'Wakad', 'Baner', 'Kondhwa',
                      'Pimpri-Chinchwad', 'Aundh', 'Viman Nagar', 'Katraj', 'Swargate',
                      'Deccan', 'Kharadi', 'Hinjewadi', 'Yerawada'].map(w => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Image Upload */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>📸 Upload Photos (max 3)</h3>
                <div
                  style={styles.dropzone}
                  onClick={() => fileRef.current.click()}
                >
                  <input
                    ref={fileRef} type="file" accept="image/*" multiple
                    onChange={handleImages} style={{ display: 'none' }}
                  />
                  {previews.length === 0 ? (
                    <>
                      <div style={{ fontSize: '40px', marginBottom: '8px' }}>📷</div>
                      <p style={{ color: '#666', fontSize: '14px' }}>Click to upload photos</p>
                      <p style={{ color: '#444', fontSize: '12px' }}>JPG, PNG up to 5MB each</p>
                    </>
                  ) : (
                    <div style={styles.previewGrid}>
                      {previews.map((p, i) => (
                        <img key={i} src={p} alt="" style={styles.previewImg} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div style={styles.col}>
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>📍 Location</h3>

                <div style={styles.locBtns}>
                  <button type="button" onClick={handleGPS} style={styles.gpsBtn}>
                    🎯 Use My GPS Location
                  </button>
                  <button type="button"
                    onClick={() => setLocationMode(locationMode === 'map' ? 'gps' : 'map')}
                    style={styles.mapBtn}
                  >
                    {locationMode === 'map' ? '✕ Close Map' : '🗺️ Pick on Map'}
                  </button>
                </div>

                {form.lat && (
                  <div style={styles.coordBox}>
                    <span style={{ color: '#22C55E', fontSize: 13 }}>✅ Location captured!</span>
                    <span style={{ color: '#666', fontSize: 12 }}>Lat: {parseFloat(form.lat).toFixed(5)} | Lng: {parseFloat(form.lng).toFixed(5)}</span>
                  </div>
                )}

                {locationMode === 'map' && (
                  <div style={{ height: '250px', borderRadius: '10px', overflow: 'hidden', margin: '10px 0', border: '1px solid #2E2E2E' }}>
                    <MapContainer center={[18.5204, 73.8567]} zoom={13} style={{ height: '100%' }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <LocationPicker onLocationSelect={handleMapClick} />
                    </MapContainer>
                  </div>
                )}

                <div style={styles.field}>
                  <label style={styles.label}>Address / Location Description *</label>
                  <input
                    name="address" value={form.address} onChange={handleChange}
                    placeholder="Street name, area, Pune landmark"
                    style={styles.input} required
                  />
                </div>

                <p style={{ color: '#555', fontSize: '12px', lineHeight: '1.5' }}>
                  💡 Tip: Use GPS for precise location, or click on the map to drop a pin anywhere in Pune.
                </p>
              </div>

              {/* Severity Guide */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>🎯 Severity Guide</h3>
                {[
                  { level: 'Critical', color: '#EF4444', desc: 'Immediate danger — vehicle damage, falls possible' },
                  { level: 'High', color: '#F97316', desc: 'Serious hazard — needs urgent attention' },
                  { level: 'Medium', color: '#FCD34D', desc: 'Moderate issue — fix within a week' },
                  { level: 'Low', color: '#22C55E', desc: 'Minor issue — routine maintenance' },
                ].map(({ level, color, desc }) => (
                  <div key={level} style={styles.severityRow}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
                    <div>
                      <span style={{ color, fontSize: 13, fontWeight: 600 }}>{level}: </span>
                      <span style={{ color: '#888', fontSize: 12 }}>{desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? '⏳ Submitting...' : '🚀 Submit Report'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  page: { background: '#0D0D0D', minHeight: 'calc(100vh - 65px)', padding: '40px 24px' },
  container: { maxWidth: '1100px', margin: '0 auto' },
  header: { textAlign: 'center', marginBottom: '40px' },
  tag: { color: '#FF5C1A', fontSize: '11px', letterSpacing: '3px', fontFamily: 'Syne, sans-serif', fontWeight: '700', marginBottom: '8px' },
  title: { fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: '800', color: '#F0F0F0', fontFamily: 'Syne, sans-serif', marginBottom: '8px' },
  subtitle: { color: '#666', fontSize: '16px' },
  form: {},
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' },
  col: { display: 'flex', flexDirection: 'column', gap: '20px' },
  section: {
    background: '#1A1A1A', border: '1px solid #2E2E2E',
    borderRadius: '16px', padding: '24px',
    display: 'flex', flexDirection: 'column', gap: '14px',
  },
  sectionTitle: { fontSize: '16px', fontWeight: '700', color: '#F0F0F0', fontFamily: 'Syne, sans-serif', marginBottom: '4px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '12px', color: '#888', letterSpacing: '0.5px', fontFamily: 'Syne, sans-serif' },
  input: {
    background: '#111', border: '1px solid #2E2E2E',
    color: '#F0F0F0', padding: '10px 14px', borderRadius: '8px',
    fontSize: '14px', outline: 'none', width: '100%',
    transition: 'border-color 0.2s',
  },
  select: {
    background: '#111', border: '1px solid #2E2E2E',
    color: '#F0F0F0', padding: '10px 14px', borderRadius: '8px',
    fontSize: '14px', outline: 'none', width: '100%',
    cursor: 'pointer',
  },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  dropzone: {
    border: '2px dashed #2E2E2E', borderRadius: '10px',
    padding: '24px', textAlign: 'center', cursor: 'pointer',
    transition: 'border-color 0.2s', minHeight: '120px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexDirection: 'column',
  },
  previewGrid: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  previewImg: { width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #2E2E2E' },
  locBtns: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  gpsBtn: {
    background: 'linear-gradient(135deg, #FF5C1A, #E04400)',
    color: '#fff', border: 'none', padding: '10px 16px',
    borderRadius: '8px', fontSize: '13px', fontWeight: '600',
    cursor: 'pointer', flex: 1,
  },
  mapBtn: {
    background: '#1A1A1A', color: '#F0F0F0',
    border: '1px solid #3A3A3A', padding: '10px 16px',
    borderRadius: '8px', fontSize: '13px', cursor: 'pointer', flex: 1,
  },
  coordBox: {
    background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.2)',
    borderRadius: '8px', padding: '10px 14px',
    display: 'flex', flexDirection: 'column', gap: '4px',
  },
  severityRow: { display: 'flex', alignItems: 'flex-start', gap: '10px', paddingBottom: '8px', borderBottom: '1px solid #1E1E1E' },
  submitBtn: {
    width: '100%', marginTop: '24px',
    background: 'linear-gradient(135deg, #FF5C1A, #E04400)',
    color: '#fff', border: 'none', padding: '16px',
    borderRadius: '12px', fontSize: '16px', fontWeight: '700',
    cursor: 'pointer', boxShadow: '0 4px 20px rgba(255,92,26,0.4)',
    fontFamily: 'Syne, sans-serif', transition: 'opacity 0.2s',
  },
};

export default ReportPage;
