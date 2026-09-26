/** Settings Page */
import React, { useState } from 'react';
import { Save, RefreshCw, Wifi, WifiOff, Zap, AlertTriangle } from 'lucide-react';
import { useSensor } from '../context/SensorContext';
import apiService from '../services/api';

export default function Settings() {
  const { backendOnline, simMode, simScenario, changeScenario, refresh } = useSensor();
  const [backendUrl, setBackendUrl] = useState(import.meta.env.VITE_API_URL || 'http://localhost:5000');
  const [updateInterval, setUpdateInterval] = useState(5);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const testEsp32 = async () => {
    try {
      await apiService.postSensorData({
        timestamp: new Date().toISOString(),
        gas_level: 450, temperature: 31.5, humidity: 62, flame_status: 0
      });
      alert('ESP32 test data sent successfully! Check dashboard.');
    } catch (e) {
      alert('Failed to send test data. Is the backend running?');
    }
  };

  return (
    <div className="page-content fade-in">
      <div className="page-title">System Settings</div>
      <div className="page-subtitle">Configure simulation, backend connection, and system parameters</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {/* Connection Settings */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 12 }}>Backend Connection</div>

          <div style={{ marginBottom: 10 }}>
            <div className="pred-row">
              <span className="pred-key">Status</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: backendOnline ? '#10b981' : '#ef4444' }}>
                {backendOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
                {backendOnline ? 'CONNECTED' : 'DISCONNECTED'}
              </span>
            </div>
          </div>

          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 10, color: '#64748b', fontWeight: 700, display: 'block', marginBottom: 4 }}>
              Backend API URL
            </label>
            <input
              type="text"
              value={backendUrl}
              onChange={e => setBackendUrl(e.target.value)}
              style={{
                width: '100%', background: '#151e2d', border: '1px solid #2d3748',
                color: '#e2e8f0', borderRadius: 5, padding: '6px 10px', fontSize: 12, outline: 'none'
              }}
            />
            <div style={{ fontSize: 10, color: '#475569', marginTop: 3 }}>
              This URL is set at build time via VITE_API_URL environment variable
            </div>
          </div>

          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 10, color: '#64748b', fontWeight: 700, display: 'block', marginBottom: 4 }}>
              Update Interval (seconds)
            </label>
            <input
              type="number" min={2} max={30} value={updateInterval}
              onChange={e => setUpdateInterval(e.target.value)}
              style={{
                width: '100%', background: '#151e2d', border: '1px solid #2d3748',
                color: '#e2e8f0', borderRadius: 5, padding: '6px 10px', fontSize: 12, outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-primary" onClick={handleSave}>
              <Save size={12} /> {saved ? 'Saved!' : 'Save Settings'}
            </button>
            <button className="btn-secondary" onClick={refresh}>
              <RefreshCw size={12} /> Refresh
            </button>
          </div>
        </div>

        {/* Simulation Settings */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 12 }}>Simulation Mode</div>

          <div style={{ padding: '8px 10px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 6, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#f59e0b' }}>
              <Zap size={13} />
              <strong>SIMULATION ACTIVE</strong>
            </div>
            <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>
              Simulation generates realistic sensor data without physical hardware.
              It will automatically disable when real ESP32 data is received.
            </div>
          </div>

          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700, marginBottom: 6 }}>Active Scenario</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {[
                { id: 'normal',      label: 'Normal',      color: '#10b981' },
                { id: 'gas_warning', label: 'Gas Warning', color: '#f59e0b' },
                { id: 'fire_risk',   label: 'Fire Risk',   color: '#f97316' },
                { id: 'critical',    label: 'Critical',    color: '#ef4444' },
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => changeScenario(s.id)}
                  style={{
                    padding: '8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                    cursor: 'pointer', border: '1px solid',
                    background: simScenario === s.id ? `${s.color}20` : '#151e2d',
                    color: simScenario === s.id ? s.color : '#64748b',
                    borderColor: simScenario === s.id ? s.color : '#2d3748',
                    textAlign: 'center'
                  }}
                >
                  {simScenario === s.id ? '▶ ' : ''}{s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ESP32 Configuration */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 12 }}>ESP32 Connection (Future)</div>

          <div style={{ padding: '8px 10px', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 6, marginBottom: 12, fontSize: 11, color: '#60a5fa' }}>
            The backend is ready to accept ESP32 data. Connect your ESP32 and send POST requests to: <br />
            <code style={{ display: 'block', marginTop: 4, background: '#0d1117', padding: '4px 8px', borderRadius: 4, fontFamily: 'monospace', color: '#10b981' }}>
              POST {backendUrl}/api/sensor-data
            </code>
          </div>

          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700, marginBottom: 4 }}>Expected JSON Format:</div>
            <pre style={{ fontSize: 10, background: '#0d1117', padding: 10, borderRadius: 6, color: '#94a3b8', border: '1px solid #2d3748', overflow: 'auto' }}>
{`{
  "timestamp": "2026-01-01T00:00:00Z",
  "gas_level": 450,
  "temperature": 31.5,
  "humidity": 62,
  "flame_status": 0
}`}
            </pre>
          </div>

          <button className="btn-secondary" onClick={testEsp32}>
            <Zap size={12} /> Send Test ESP32 Data
          </button>
        </div>

        {/* API Endpoints */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 12 }}>API Endpoints</div>
          <table className="data-table">
            <thead>
              <tr><th>Method</th><th>Endpoint</th><th>Description</th></tr>
            </thead>
            <tbody>
              {[
                { m: 'POST', e: '/api/sensor-data', d: 'ESP32 data ingestion' },
                { m: 'GET',  e: '/api/latest',      d: 'Latest sensor reading' },
                { m: 'GET',  e: '/api/history',     d: 'Historical data' },
                { m: 'GET',  e: '/api/chart-data',  d: 'Chart-ready data' },
                { m: 'GET',  e: '/api/prediction',  d: 'Next value predictions' },
                { m: 'GET',  e: '/api/model-status',d: 'AI model info' },
                { m: 'GET',  e: '/api/events',      d: 'System events' },
                { m: 'POST', e: '/api/simulation',  d: 'Change simulation' },
              ].map(r => (
                <tr key={r.e}>
                  <td><span style={{ fontSize: 10, fontWeight: 700, color: r.m === 'POST' ? '#10b981' : '#3b82f6' }}>{r.m}</span></td>
                  <td><code style={{ fontSize: 10, color: '#f59e0b' }}>{r.e}</code></td>
                  <td style={{ fontSize: 10 }}>{r.d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
