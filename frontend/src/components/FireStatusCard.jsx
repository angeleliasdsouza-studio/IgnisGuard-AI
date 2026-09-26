/** Fire Detection Status Card */
import React from 'react';
import { Flame, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

function getStatusConfig(ai_status, flame_status, gas_level, temperature) {
  if (ai_status === 'Critical') {
    return {
      icon: <ShieldAlert size={18} color="#ef4444" />,
      title: '🔥 CRITICAL',
      titleColor: '#ef4444',
      sensors: ['Gas ↑↑↑', 'Temperature ↑↑↑', 'Flame Detected'],
      sensorColor: '#ef4444',
      borderColor: '#ef4444',
    };
  }
  if (ai_status === 'Fire Risk') {
    return {
      icon: <Flame size={18} color="#f97316" />,
      title: '🔥 FIRE RISK',
      titleColor: '#f97316',
      sensors: ['Gas ↑', 'Temperature ↑', 'Flame Detected'],
      sensorColor: '#f97316',
      borderColor: '#f97316',
    };
  }
  if (ai_status === 'Gas Warning') {
    return {
      icon: <AlertTriangle size={18} color="#f59e0b" />,
      title: '⚠ GAS WARNING',
      titleColor: '#f59e0b',
      sensors: ['Gas ↑', flame_status ? 'Flame Present' : 'No Flame'],
      sensorColor: '#f59e0b',
      borderColor: '#f59e0b',
    };
  }
  return {
    icon: <CheckCircle size={18} color="#10b981" />,
    title: '✓ NORMAL',
    titleColor: '#10b981',
    sensors: ['Gas Normal', 'Temperature Normal', 'No Flame'],
    sensorColor: '#10b981',
    borderColor: '#10b981',
  };
}

export default function FireStatusCard({ latest }) {
  const ai_status = latest?.ai_status ?? 'Normal';
  const flame = latest?.flame_status ?? 0;
  const gas = latest?.gas_level ?? 0;
  const temp = latest?.temperature ?? 0;
  const cfg = getStatusConfig(ai_status, flame, gas, temp);

  const now = new Date().toLocaleTimeString('en-US', { hour12: false });

  return (
    <div className="fire-status-card" style={{ borderLeft: `3px solid ${cfg.borderColor}` }}>
      <div className="card-header">
        <div className="card-title">Fire Detection Status</div>
        {cfg.icon}
      </div>

      <div className="pred-row">
        <span className="pred-key" style={{ fontSize: 11 }}>Current Status:</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: cfg.titleColor }}>{cfg.title}</span>
      </div>

      <div style={{ marginTop: 6 }}>
        <div style={{ fontSize: 10, color: '#64748b', marginBottom: 4, fontWeight: 600 }}>Sensor Combination:</div>
        {cfg.sensors.map(s => (
          <div key={s} style={{ fontSize: 11, color: cfg.sensorColor, padding: '2px 0', display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: cfg.sensorColor, display: 'inline-block' }} />
            {s}
          </div>
        ))}
      </div>

      <div className="pred-row" style={{ marginTop: 6 }}>
        <span className="pred-key" style={{ fontSize: 11 }}>Detection Time:</span>
        <span style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>{now}</span>
      </div>
    </div>
  );
}
