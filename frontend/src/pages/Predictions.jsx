/** Predictions Page — Actual vs Predicted with regression model */
import React, { useState } from 'react';
import {
  ComposedChart, Line, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useSensor } from '../context/SensorContext';
import PredictionCard from '../components/PredictionCard';
import SimulationBar from '../components/SimulationBar';

const PARAM_OPTIONS = [
  { id: 'gas',         label: 'Gas Level',    actualKey: 'gas',         predKey: 'gasPredicted',   color: '#f59e0b', unit: ' ADC', domain: [0, 1023] },
  { id: 'temperature', label: 'Temperature',  actualKey: 'temperature', predKey: 'tempPredicted',  color: '#60a5fa', unit: '°C',  domain: ['auto', 'auto'] },
  { id: 'fire_risk',   label: 'Fire Risk',    actualKey: 'risk_score',  predKey: 'riskPredicted',  color: '#ef4444', unit: '%',   domain: [0, 100] },
];

export default function Predictions() {
  const { chartData, chartHours, setChartHours, prediction } = useSensor();
  const [paramId, setParamId] = useState('gas');
  const param = PARAM_OPTIONS.find(p => p.id === paramId);
  const data = chartData.slice(-60);

  return (
    <div className="page-content fade-in">
      <div className="page-title">Predictions</div>
      <div className="page-subtitle">AI-based predictions using Linear Regression (Rolling Window)</div>

      <SimulationBar />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 12, marginBottom: 14 }}>
        {/* Prediction Chart */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Actual vs Predicted</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {/* Parameter selector */}
              <div style={{ display: 'flex', gap: 4 }}>
                {PARAM_OPTIONS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setParamId(p.id)}
                    style={{
                      padding: '3px 10px', borderRadius: 4, fontSize: 10, fontWeight: 600,
                      cursor: 'pointer', border: '1px solid',
                      background: paramId === p.id ? `rgba(${p.color === '#f59e0b' ? '245,158,11' : p.color === '#60a5fa' ? '96,165,250' : '239,68,68'},0.15)` : '#1c2432',
                      color: paramId === p.id ? p.color : '#64748b',
                      borderColor: paramId === p.id ? p.color : '#2d3748',
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              {/* Time filter */}
              <div style={{ display: 'flex', gap: 4 }}>
                {[{ v: 1, l: '1H' }, { v: 6, l: '6H' }, { v: 24, l: '24H' }].map(f => (
                  <button key={f.v} className={`time-btn ${chartHours === f.v ? 'active' : ''}`} onClick={() => setChartHours(f.v)}>
                    {f.l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 14, fontSize: 10, color: '#64748b', marginBottom: 8 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 20, height: 2, background: param.color, display: 'inline-block' }} />
              Actual {param.label}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 20, height: 2, background: param.color, display: 'inline-block', borderTop: '2px dashed' }} />
              Predicted {param.label}
            </span>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2234" vertical={false} />
              <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#4b5563' }} tickLine={false} axisLine={{ stroke: '#2d3748' }} interval="preserveStartEnd" />
              <YAxis domain={param.domain} tick={{ fontSize: 9, fill: '#4b5563' }} tickLine={false} axisLine={false} width={45} label={{ value: param.unit, angle: -90, position: 'insideLeft', style: { fontSize: 9, fill: '#4b5563' }, dx: -5 }} />
              <Tooltip contentStyle={{ background: '#1c2432', border: '1px solid #2d3748', fontSize: 10, borderRadius: 6 }} />
              <Area type="monotone" dataKey={param.actualKey} name={`Actual ${param.label}`} stroke={param.color} fill={`${param.color}20`} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey={param.predKey}   name={`Predicted ${param.label}`} stroke={param.color} strokeWidth={1.5} strokeDasharray="5 5" dot={false} opacity={0.8} />
            </ComposedChart>
          </ResponsiveContainer>

          <div style={{ marginTop: 10, padding: '6px 10px', background: '#151e2d', borderRadius: 5, fontSize: 10, color: '#64748b' }}>
            <strong style={{ color: '#94a3b8' }}>Model:</strong> Linear Regression (Rolling 5-point window) ·
            <strong style={{ color: '#94a3b8', marginLeft: 8 }}>Horizon:</strong> Next 10 minutes ·
            <strong style={{ color: '#94a3b8', marginLeft: 8 }}>Explainability:</strong> Slope × future steps
          </div>
        </div>

        {/* Prediction Summary */}
        <PredictionCard prediction={prediction} />
      </div>

      {/* Prediction explanation */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: 10 }}>How Prediction Works</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            {
              step: '1. Data Collection',
              desc: 'Last 20 sensor readings are collected from the database via the backend API.',
              color: '#3b82f6'
            },
            {
              step: '2. Linear Regression',
              desc: 'A rolling-window linear regression calculates slope and intercept from recent data points.',
              color: '#10b981'
            },
            {
              step: '3. Prediction',
              desc: 'The slope is extrapolated forward to predict the next value in ~10 minutes.',
              color: '#f59e0b'
            }
          ].map(s => (
            <div key={s.step} style={{ padding: 12, background: '#151e2d', borderRadius: 8, border: `1px solid ${s.color}30` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: s.color, marginBottom: 5 }}>{s.step}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.5 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
