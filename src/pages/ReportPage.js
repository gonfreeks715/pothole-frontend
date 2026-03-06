import React, { useState, useRef } from 'react';
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

const wards = ['Shivajinagar','Kothrud','Hadapsar','Wakad','Baner','Kondhwa','Pimpri-Chinchwad','Aundh','Viman Nagar','Katraj','Swargate','Deccan','Kharadi','Hinjewadi','Yerawada'];

const ReportPage = () => {
  const navigate = useNavigate();
  const fileRef = useRef();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', category: 'pothole',
    severity: 'medium', lat: '', lng: '',
    address: '', ward: '', landmark: '',
  });

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleGPS = () => {
    if (!navigator.geolocation) return toast.error('GPS not supported on this device');
    toast.info('📍 Getting your location...');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setForm(prev => ({ ...prev, lat: latitude, lng: longitude }));
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          setForm(prev => ({ ...prev, address: data.display_name?.substring(0, 120) || `${latitude}, ${longitude}` }));
        } catch {
          setForm(prev => ({ ...prev, address: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}` }));
        }
        toast.success('✅ GPS location captured!');
      },
      () => toast.error('Could not get GPS location. Try picking on map.')
    );
  };

  const handleMapClick = async (lat, lng) => {
    setForm(prev => ({ ...prev, lat, lng }));
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
      const data = await res.json();
      setForm(prev => ({ ...prev, address: data.display_name?.substring(0, 120) || `${lat.toFixed(5)}, ${lng.toFixed(5)}` }));
      toast.success('📍 Location pinned on map!');
    } catch {
      setForm(prev => ({ ...prev, address: `${lat.toFixed(5)}, ${lng.toFixed(5)}` }));
    }
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files).slice(0, 3);
    setImages(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.lat || !form.lng) return toast.error('📍 Please capture your GPS location or pick on map');
    if (!form.address) return toast.error('Address is required');
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      images.forEach(img => formData.append('images', img));
      await axios.post(`${API}/reports`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('🎉 Hazard reported! Thank you for making Pune safer.');
      setTimeout(() => navigate('/map'), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.09)', color: '#EEF2FF',
    padding: '12px 14px', borderRadius: 10, fontSize: 14, outline: 'none',
  };
  const labelStyle = {
    display: 'block', fontSize: 11, fontWeight: 700,
    color: '#8899BB', letterSpacing: '1px', marginBottom: 7, textTransform: 'uppercase',
  };

  return (
    <div style={{ background: '#05080F', minHeight: '100vh', padding: '40px 24px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.15)', borderRadius: 20, padding: '6px 16px', marginBottom: 16 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F97316', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#F97316', letterSpacing: '2px' }}>REPORT A ROAD HAZARD</span>
          </div>
          <h1 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 900, color: '#EEF2FF', letterSpacing: '-0.5px', marginBottom: 8 }}>
            Report Road Hazard
          </h1>
          <p style={{ color: '#8899BB', fontSize: 16 }}>Fill in the details below. Takes less than 60 seconds.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

            {/* LEFT COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Basic Info */}
              <div style={{ background: '#0D1424', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 28 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#EEF2FF', marginBottom: 20 }}>📋 Basic Information</h3>

                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Title *</label>
                  <input name="title" value={form.title} onChange={handleChange} required
                    placeholder="e.g. Deep pothole near Shivajinagar signal" style={inputStyle} />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Description *</label>
                  <textarea name="description" value={form.description} onChange={handleChange} required
                    placeholder="Describe the hazard — size, danger, how long it's been there..."
                    style={{ ...inputStyle, height: 90, resize: 'vertical' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div>
                    <label style={labelStyle}>Category *</label>
                    <select name="category" value={form.category} onChange={handleChange} style={{ ...inputStyle, cursor: 'pointer' }}>
                      <option value="pothole">🕳️ Pothole</option>
                      <option value="crack">〰️ Road Crack</option>
                      <option value="waterlogging">💧 Waterlogging</option>
                      <option value="broken_divider">🚧 Broken Divider</option>
                      <option value="missing_manhole">🔩 Missing Manhole</option>
                      <option value="other">⚠️ Other</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Severity *</label>
                    <select name="severity" value={form.severity} onChange={handleChange} style={{ ...inputStyle, cursor: 'pointer' }}>
                      <option value="low">🟢 Low</option>
                      <option value="medium">🟡 Medium</option>
                      <option value="high">🟠 High</option>
                      <option value="critical">🔴 Critical</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Ward / Area</label>
                  <select name="ward" value={form.ward} onChange={handleChange} style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="">Select your ward</option>
                    {wards.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Landmark (Optional)</label>
                  <input name="landmark" value={form.landmark} onChange={handleChange}
                    placeholder="e.g. Near McDonald's, opposite Pune station" style={inputStyle} />
                </div>
              </div>

              {/* Photo Upload */}
              <div style={{ background: '#0D1424', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 28 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#EEF2FF', marginBottom: 8 }}>📸 Upload Photos</h3>
                <p style={{ color: '#8899BB', fontSize: 12, marginBottom: 16 }}>Add up to 3 photos of the hazard (optional but recommended)</p>
                <div
                  onClick={() => fileRef.current.click()}
                  style={{
                    border: '2px dashed rgba(249,115,22,0.25)', borderRadius: 14,
                    padding: '28px 20px', textAlign: 'center', cursor: 'pointer',
                    background: 'rgba(249,115,22,0.03)', transition: 'all 0.2s',
                    minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
                  }}
                >
                  <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleImages} style={{ display: 'none' }} />
                  {previews.length === 0 ? (
                    <>
                      <div style={{ fontSize: 36, marginBottom: 8 }}>📷</div>
                      <p style={{ color: '#8899BB', fontSize: 14, fontWeight: 600 }}>Click to upload photos</p>
                      <p style={{ color: '#3D4F6B', fontSize: 12, marginTop: 4 }}>JPG, PNG — max 5MB each</p>
                    </>
                  ) : (
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                      {previews.map((p, i) => (
                        <img key={i} src={p} alt="" style={{ width: 80, height: 70, objectFit: 'cover', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)' }} />
                      ))}
                      <p style={{ color: '#F97316', fontSize: 12, width: '100%', textAlign: 'center', marginTop: 8 }}>✅ {previews.length} photo(s) selected — click to change</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Location */}
              <div style={{ background: '#0D1424', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 28 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#EEF2FF', marginBottom: 8 }}>📍 Location</h3>
                <p style={{ color: '#8899BB', fontSize: 12, marginBottom: 20 }}>Use GPS for instant location or pick manually on the map</p>

                <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                  <button type="button" onClick={handleGPS} style={{
                    flex: 1, background: 'linear-gradient(135deg,#F97316,#EA580C)', color: '#fff',
                    border: 'none', padding: '12px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(249,115,22,0.3)',
                  }}>🎯 Use My GPS</button>
                  <button type="button" onClick={() => setShowMap(!showMap)} style={{
                    flex: 1, background: 'rgba(255,255,255,0.05)', color: '#EEF2FF',
                    border: '1px solid rgba(255,255,255,0.1)', padding: '12px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}>{showMap ? '✕ Close Map' : '🗺️ Pick on Map'}</button>
                </div>

                {form.lat && (
                  <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
                    <p style={{ color: '#34D399', fontSize: 13, fontWeight: 700 }}>✅ Location captured!</p>
                    <p style={{ color: '#8899BB', fontSize: 11, marginTop: 2 }}>Lat: {parseFloat(form.lat).toFixed(5)} | Lng: {parseFloat(form.lng).toFixed(5)}</p>
                  </div>
                )}

                {showMap && (
                  <div style={{ height: 240, borderRadius: 12, overflow: 'hidden', marginBottom: 14, border: '1px solid rgba(255,255,255,0.08)' }}>
                    <MapContainer center={[18.5204, 73.8567]} zoom={13} style={{ height: '100%' }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <LocationPicker onLocationSelect={handleMapClick} />
                    </MapContainer>
                  </div>
                )}

                <div>
                  <label style={labelStyle}>Address / Location Description *</label>
                  <input name="address" value={form.address} onChange={handleChange} required
                    placeholder="Street name, area, Pune landmark" style={inputStyle} />
                </div>
              </div>

              {/* Severity Guide */}
              <div style={{ background: '#0D1424', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 28 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#EEF2FF', marginBottom: 16 }}>🎯 Severity Guide</h3>
                {[
                  { level: 'Critical 🔴', color: '#EF4444', desc: 'Immediate danger — vehicle damage, falls likely' },
                  { level: 'High 🟠', color: '#F97316', desc: 'Serious hazard — urgent repair needed' },
                  { level: 'Medium 🟡', color: '#FBBF24', desc: 'Moderate issue — fix within a week' },
                  { level: 'Low 🟢', color: '#10B981', desc: 'Minor issue — routine maintenance' },
                ].map(({ level, color, desc }) => (
                  <div key={level} style={{ display: 'flex', gap: 10, marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0, marginTop: 4 }} />
                    <div>
                      <span style={{ color, fontSize: 13, fontWeight: 700 }}>{level}: </span>
                      <span style={{ color: '#8899BB', fontSize: 12 }}>{desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" disabled={loading} style={{
            width: '100%', marginTop: 24,
            background: loading ? 'rgba(249,115,22,0.4)' : 'linear-gradient(135deg,#F97316,#EA580C)',
            color: '#fff', border: 'none', padding: 18,
            borderRadius: 14, fontSize: 17, fontWeight: 800,
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : '0 6px 28px rgba(249,115,22,0.4)',
            transition: 'all 0.2s', letterSpacing: '-0.2px',
          }}>
            {loading ? '⏳ Submitting your report...' : '🚀 Submit Hazard Report'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportPage;