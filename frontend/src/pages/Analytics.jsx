/** Analytics Page — Multi-chart trend analysis */
import React, { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { useSensor } from '../context/SensorContext';
import SimulationBar from '../components/SimulationBar';

function StatBox({ label, value, color, unit = '' }) {
  return (
    <div style={{ background: '#151e2d', borderRadius: 6, padding: '8px 12px', border: '1px solid #2d3748' }}>
      <div style={{ fontSize: 9, color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.08em' }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 800, color, marginTop: 2 }}>{value}{unit}</div>
    </div>
  );
}

export default function Analytics() {
  const { chartData, chartHours, setChartHours } = useSensor();
  const [param, setParam] = useState('all');

  const data = chartData.slice(-60);
  const gasVals    = data.map(d => d.gas).filter(Boolean);
  const tempVals   = data.map(d => d.temperature).filter(Boolean);
  const humVals    = data.map(d => d.humidity).filter(Boolean);
  const riskVals   = data.map(d => d.risk_score).filter(Boolean);

  const stats = (arr) => arr.length === 0 ? { min: 0, max: 0, avg: 0 } : {
    min: Math.min(...arr).toFixed(1),
    max: Math.max(...arr).toFixed(1),
    avg: (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1),
  };

  const gS = stats(gasVals), tS = stats(tempVals), hS = stats(humVals), rS = stats(riskVals);

  return (
    <div className="page-content fade-in">
      <div className="page-title">Analytics</div>
      <div className="page-subtitle">Historical trends, correlations, and statistical summaries</div>

      <SimulationBar />

      {/* Time filter */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {[{ v: 1, l: '1 Hour' }, { v: 6, l: '6 Hours' }, { v: 24, l: 'Today' }].map(f => (
          <button key={f.v} className={`time-btn ${chartHours === f.v ? 'active' : ''}`} onClick={() => setChartHours(f.v)}>
            {f.l}
          </button>
        ))}
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#f59e0b', marginBottom: 5 }}>GAS LEVEL</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <StatBox label="Min" value={gS.min} color="#10b981" unit=" ADC" />
            <StatBox label="Max" value={gS.max} color="#ef4444" unit=" ADC" />
            <StatBox label="Avg" value={gS.avg} color="#f59e0b" unit=" ADC" />
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#60a5fa', marginBottom: 5 }}>TEMPERATURE</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <StatBox label="Min" value={tS.min} color="#10b981" unit="°C" />
            <StatBox label="Max" value={tS.max} color="#ef4444" unit="°C" />
            <StatBox label="Avg" value={tS.avg} color="#60a5fa" unit="°C" />
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#10b981', marginBottom: 5 }}>HUMIDITY</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <StatBox label="Min" value={hS.min} color="#ef4444" unit="%" />
            <StatBox label="Max" value={hS.max} color="#10b981" unit="%" />
            <StatBox label="Avg" value={hS.avg} color="#10b981" unit="%" />
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#ef4444', marginBottom: 5 }}>FIRE RISK</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <StatBox label="Min" value={rS.min} color="#10b981" unit="%" />
            <StatBox label="Max" value={rS.max} color="#ef4444" unit="%" />
            <StatBox label="Avg" value={rS.avg} color="#f97316" unit="%" />
          </div>
        </div>
      </div>

      {/* Gas + Temperature trends */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div className="card">
          <div className="card-title" style={{ marginBottom: 8 }}>Gas Level Trend</div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2234" vertical={false} />
              <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#4b5563' }} tickLine={false} axisLine={{ stroke: '#2d3748' }} interval="preserveStartEnd" />
              <YAxis domain={[0, 1023]} tick={{ fontSize: 9, fill: '#4b5563' }} tickLine={false} axisLine={false} width={40} />
              <ReferenceLine y={400} stroke="#f59e0b" strokeDasharray="3 3" />
              <ReferenceLine y={700} stroke="#ef4444" strokeDasharray="3 3" />
              <Tooltip contentStyle={{ background: '#1c2432', border: '1px solid #2d3748', fontSize: 10, borderRadius: 6 }} />
              <Line type="monotone" dataKey="gas" name="Gas (ADC)" stroke="#f59e0b" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="gasPredicted" name="Predicted" stroke="#fbbf24" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 8 }}>Temperature Trend</div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2234" vertical={false} />
              <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#4b5563' }} tickLine={false} axisLine={{ stroke: '#2d3748' }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 9, fill: '#4b5563' }} tickLine={false} axisLine={false} width={40} />
              <ReferenceLine y={40} stroke="#f59e0b" strokeDasharray="3 3" />
              <ReferenceLine y={60} stroke="#ef4444" strokeDasharray="3 3" />
              <Tooltip contentStyle={{ background: '#1c2432', border: '1px solid #2d3748', fontSize: 10, borderRadius: 6 }} />
              <Line type="monotone" dataKey="temperature" name="Temp (°C)" stroke="#60a5fa" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="tempPredicted" name="Predicted" stroke="#93c5fd" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Humidity + Fire Risk */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div className="card">
          <div className="card-title" style={{ marginBottom: 8 }}>Humidity Trend</div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2234" vertical={false} />
              <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#4b5563' }} tickLine={false} axisLine={{ stroke: '#2d3748' }} interval="preserveStartEnd" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#4b5563' }} tickLine={false} axisLine={false} width={35} />
              <Tooltip contentStyle={{ background: '#1c2432', border: '1px solid #2d3748', fontSize: 10, borderRadius: 6 }} />
              <Line type="monotone" dataKey="humidity" name="Humidity (%)" stroke="#10b981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="humPredicted" name="Predicted" stroke="#34d399" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 8 }}>Fire Risk Score Trend</div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2234" vertical={false} />
              <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#4b5563' }} tickLine={false} axisLine={{ stroke: '#2d3748' }} interval="preserveStartEnd" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#4b5563' }} tickLine={false} axisLine={false} width={35} />
              <ReferenceLine y={60} stroke="#f59e0b" strokeDasharray="3 3" />
              <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="3 3" />
              <Tooltip contentStyle={{ background: '#1c2432', border: '1px solid #2d3748', fontSize: 10, borderRadius: 6 }} />
              <Line type="monotone" dataKey="risk_score" name="Risk Score (%)" stroke="#ef4444" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="riskPredicted" name="Predicted" stroke="#f97316" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Correlation scatter: Gas vs Temperature */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: 8 }}>Gas vs Temperature Correlation</div>
        <ResponsiveContainer width="100%" height={200}>
          <ScatterChart margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2234" />
            <XAxis dataKey="gas" name="Gas Level" type="number" tick={{ fontSize: 9, fill: '#4b5563' }} label={{ value: 'Gas (ADC)', position: 'bottom', style: { fontSize: 9, fill: '#64748b' } }} />
            <YAxis dataKey="temperature" name="Temperature" type="number" tick={{ fontSize: 9, fill: '#4b5563' }} label={{ value: 'Temp (°C)', angle: -90, position: 'insideLeft', style: { fontSize: 9, fill: '#64748b' } }} width={45} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: '#1c2432', border: '1px solid #2d3748', fontSize: 10, borderRadius: 6 }} />
            <Scatter
              data={data.filter(d => d.gas && d.temperature)}
              fill="#f59e0b" opacity={0.6} r={3}
              name="Sensor Reading"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
