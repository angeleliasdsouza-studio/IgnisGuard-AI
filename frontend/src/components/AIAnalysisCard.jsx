/** AI Analysis Card — Feature checklist and analysis text */
import React from 'react';
import { CheckCircle, AlertCircle, Brain } from 'lucide-react';

const ANALYSIS_TEXTS = {
  Normal:      'All sensor parameters are within safe operating limits. System is functioning normally.',
  'Gas Warning': 'Gas concentration is elevated above safe threshold. Monitor closely and ensure ventilation.',
  'Fire Risk':  'Multiple sensor parameters indicate an elevated risk condition. Immediate attention required.',
  Critical:    'CRITICAL: All sensors indicate extreme fire/explosion risk. Initiate emergency protocols immediately!',
};

const FEATURE_STATES = {
  Normal:      { gas: false, temp: false, hum: false, flame: false, gas_change: false, temp_change: false },
  'Gas Warning': { gas: true, temp: false, hum: false, flame: false, gas_change: true, temp_change: false },
  'Fire Risk':  { gas: true, temp: true, hum: true, flame: true, gas_change: true, temp_change: true },
  Critical:    { gas: true, temp: true, hum: true, flame: true, gas_change: true, temp_change: true },
};

export default function AIAnalysisCard({ latest, prediction }) {
  const ai_status = latest?.ai_status ?? 'Normal';
  const text = ANALYSIS_TEXTS[ai_status] || ANALYSIS_TEXTS.Normal;
  const feats = FEATURE_STATES[ai_status] || FEATURE_STATES.Normal;
  const riskScore = latest?.risk_score ?? 0;

  const features = [
    { key: 'gas',         label: 'Gas Level' },
    { key: 'temp',        label: 'Temperature' },
    { key: 'hum',         label: 'Humidity' },
    { key: 'flame',       label: 'Flame Status' },
    { key: 'gas_change',  label: 'Gas Change' },
    { key: 'temp_change', label: 'Temperature Change' },
  ];

  return (
    <div className="ai-analysis-card">
      <div className="card-header" style={{ marginBottom: 8 }}>
        <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Brain size={12} /> AI ANALYSIS
        </div>
        <span style={{ fontSize: 10, color: '#64748b' }}>Decision Tree</span>
      </div>

      {/* Analysis text */}
      <div style={{
        background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)',
        borderRadius: 6, padding: '8px 10px', marginBottom: 10,
        fontSize: 11, color: '#94a3b8', lineHeight: 1.5
      }}>
        {text}
      </div>

      {/* Feature indicators */}
      <div style={{ fontSize: 11 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>
          Feature Analysis
        </div>
        {features.map(f => (
          <div key={f.key} className="analysis-feature">
            {feats[f.key]
              ? <CheckCircle size={11} className="check" style={{ color: '#f59e0b' }} />
              : <CheckCircle size={11} style={{ color: '#10b981' }} />
            }
            <span style={{ color: feats[f.key] ? '#f59e0b' : '#64748b' }}>
              {f.label}
              {feats[f.key] ? ' ↑' : ' ✓'}
            </span>
          </div>
        ))}
      </div>

      {/* Risk Score button */}
      <div
        style={{
          marginTop: 10, padding: '5px 12px',
          background: riskScore > 60 ? 'rgba(239,68,68,0.15)' : 'rgba(59,130,246,0.1)',
          border: `1px solid ${riskScore > 60 ? 'rgba(239,68,68,0.3)' : 'rgba(59,130,246,0.2)'}`,
          borderRadius: 5, fontSize: 10, fontWeight: 600,
          color: riskScore > 60 ? '#ef4444' : '#60a5fa', textAlign: 'center', cursor: 'default'
        }}
      >
        AI Risk Score: {riskScore.toFixed(0)}%
      </div>
    </div>
  );
}
