/** AI Model Page — Full model details and performance */
import React from 'react';
import { Brain, GitBranch, BarChart2 } from 'lucide-react';
import { useSensor } from '../context/SensorContext';
import ModelPerformance from '../components/ModelPerformance';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

const FEATURE_DESCRIPTIONS = [
  { name: 'gas_level',           type: 'Analog (ADC)', range: '0–1023', desc: 'Raw MQ-2 gas sensor reading from ADC pin of ESP32' },
  { name: 'temperature',         type: 'Float (°C)',   range: '0–100',  desc: 'DHT22 temperature reading in degrees Celsius' },
  { name: 'humidity',            type: 'Float (%)',    range: '0–100',  desc: 'DHT22 relative humidity percentage' },
  { name: 'flame_status',        type: 'Binary',       range: '0 / 1',  desc: 'Flame sensor: 0 = No flame, 1 = Flame detected' },
  { name: 'gas_change',          type: 'Float',        range: '–∞ / +∞','desc': 'Delta between current and previous gas reading (rate of change)' },
  { name: 'temperature_change',  type: 'Float',        range: '–∞ / +∞','desc': 'Delta between current and previous temperature reading' },
];

const CLASS_THRESHOLDS = [
  { cls: 'Normal',      color: '#10b981', gas: '< 400', temp: '< 36°C', hum: '50–75%', flame: 'No',  risk: '< 15%' },
  { cls: 'Gas Warning', color: '#f59e0b', gas: '400–680', temp: '< 40°C', hum: '40–70%', flame: 'No',  risk: '30–60%' },
  { cls: 'Fire Risk',   color: '#f97316', gas: '580–800', temp: '40–65°C', hum: '30–55%', flame: 'Yes', risk: '65–90%' },
  { cls: 'Critical',    color: '#ef4444', gas: '> 780', temp: '> 65°C', hum: '< 40%', flame: 'Yes', risk: '> 88%' },
];

export default function AIModel() {
  const { modelStatus } = useSensor();

  const radarData = modelStatus?.per_class
    ? Object.entries(modelStatus.per_class).map(([cls, m]) => ({
        class: cls, precision: m.precision, recall: m.recall, f1: m.f1
      }))
    : null;

  return (
    <div className="page-content fade-in">
      <div className="page-title">AI Model</div>
      <div className="page-subtitle">Decision Tree Classifier — Training details, features, and performance</div>

      {/* Top cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 14 }}>
        {[
          { label: 'Algorithm', value: 'Decision Tree', sub: 'CART / Gini', color: '#3b82f6' },
          { label: 'Accuracy',  value: modelStatus?.accuracy ? `${modelStatus.accuracy}%` : '—', sub: 'Overall accuracy', color: '#10b981' },
          { label: 'Features',  value: '6', sub: 'Input features', color: '#f59e0b' },
          { label: 'Classes',   value: '4', sub: 'Output classes', color: '#8b5cf6' },
        ].map(c => (
          <div key={c.label} className="card" style={{ borderLeft: `3px solid ${c.color}` }}>
            <div style={{ fontSize: 9, color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.08em' }}>{c.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: c.color, margin: '4px 0 2px' }}>{c.value}</div>
            <div style={{ fontSize: 10, color: '#475569' }}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Model Performance */}
      <div style={{ marginBottom: 14 }}>
        <ModelPerformance modelStatus={modelStatus} />
      </div>

      {/* Features Table */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-title" style={{ marginBottom: 10 }}>Input Features</div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Feature Name</th>
              <th>Data Type</th>
              <th>Range</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {FEATURE_DESCRIPTIONS.map(f => (
              <tr key={f.name}>
                <td style={{ fontFamily: 'monospace', color: '#60a5fa', fontSize: 11 }}>{f.name}</td>
                <td>{f.type}</td>
                <td style={{ color: '#f59e0b' }}>{f.range}</td>
                <td style={{ color: '#94a3b8' }}>{f.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Class thresholds */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-title" style={{ marginBottom: 10 }}>Classification Thresholds</div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Class</th>
              <th>Gas Level</th>
              <th>Temperature</th>
              <th>Humidity</th>
              <th>Flame</th>
              <th>Risk Score</th>
            </tr>
          </thead>
          <tbody>
            {CLASS_THRESHOLDS.map(c => (
              <tr key={c.cls}>
                <td><span className={`badge ${c.cls.toLowerCase().replace(' ', '-')}`}>{c.cls}</span></td>
                <td>{c.gas}</td>
                <td>{c.temp}</td>
                <td>{c.hum}</td>
                <td style={{ color: c.flame === 'Yes' ? '#ef4444' : '#10b981', fontWeight: 600 }}>{c.flame}</td>
                <td>{c.risk}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Training Info */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: 10 }}>Training Configuration</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { label: 'Criterion', value: 'Gini Impurity', color: '#3b82f6' },
            { label: 'Max Depth', value: '8 levels', color: '#10b981' },
            { label: 'Min Samples Split', value: '10', color: '#f59e0b' },
            { label: 'Min Samples Leaf', value: '5', color: '#8b5cf6' },
            { label: 'Random State', value: '42 (reproducible)', color: '#64748b' },
            { label: 'Train/Test Split', value: '80% / 20% stratified', color: '#ef4444' },
          ].map(c => (
            <div key={c.label} style={{ padding: 10, background: '#151e2d', borderRadius: 6, border: '1px solid #2d3748' }}>
              <div style={{ fontSize: 9, color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.08em' }}>{c.label}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: c.color, marginTop: 3 }}>{c.value}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 6, fontSize: 11, color: '#60a5fa' }}>
          <strong>To train the model:</strong>
          <code style={{ display: 'block', marginTop: 4, color: '#10b981', background: '#0d1117', padding: '4px 8px', borderRadius: 4, fontFamily: 'monospace' }}>
            cd Ai-Iot &amp;&amp; python ml/generate_dataset.py &amp;&amp; python ml/train_model.py
          </code>
        </div>
      </div>
    </div>
  );
}
