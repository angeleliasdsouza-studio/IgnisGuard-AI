/**
 * Dynamic Sensor Chart — Single chart with tab switching
 * Tabs: FIRE | GAS | TEMPERATURE | HUMIDITY
 * Time filters: 1 Hour | 6 Hours | Today
 */
import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useSensor } from '../context/SensorContext';

const TABS = [
  { id: 'fire',        label: 'FIRE',        cls: 'fire' },
  { id: 'gas',         label: 'GAS',         cls: 'gas' },
  { id: 'temperature', label: 'TEMPERATURE', cls: 'temp' },
  { id: 'humidity',    label: 'HUMIDITY',    cls: 'hum' },
];

const TIME_FILTERS = [
  { id: 1,    label: '1 Hour' },
  { id: 6,    label: '6 Hours' },
  { id: 24,   label: 'Today' },
];

const TAB_CONFIG = {
  fire: {
    actual:    { key: 'risk_score',    name: 'Fire Risk Score', color: '#ef4444', unit: '%' },
    predicted: { key: 'riskPredicted', name: 'Predicted Risk',  color: '#f97316', dash: '5 5' },
    yLabel: 'Fire Risk (%)',
    domain:  [0, 100],
    refLines: [{ y: 60, color: '#f59e0b', label: 'Warning' }, { y: 80, color: '#ef4444', label: 'Critical' }],
  },
  gas: {
    actual:    { key: 'gas',          name: 'Gas Level',         color: '#f59e0b', unit: ' ADC' },
    predicted: { key: 'gasPredicted', name: 'Predicted Gas',     color: '#fbbf24', dash: '5 5' },
    yLabel: 'Gas Level (ADC)',
    domain:  [0, 1023],
    refLines: [{ y: 400, color: '#f59e0b', label: 'Warning' }, { y: 700, color: '#ef4444', label: 'Danger' }],
  },
  temperature: {
    actual:    { key: 'temperature',  name: 'Temperature',        color: '#60a5fa', unit: '°C' },
    predicted: { key: 'tempPredicted',name: 'Predicted Temp',     color: '#93c5fd', dash: '5 5' },
    yLabel: 'Temperature (°C)',
    domain:  ['auto', 'auto'],
    refLines: [{ y: 40, color: '#f59e0b', label: 'Warning' }, { y: 60, color: '#ef4444', label: 'Danger' }],
  },
  humidity: {
    actual:    { key: 'humidity',     name: 'Humidity',           color: '#10b981', unit: '%' },
    predicted: { key: 'humPredicted', name: 'Predicted Humidity', color: '#34d399', dash: '5 5' },
    yLabel: 'Humidity (%)',
    domain:  [0, 100],
    refLines: [],
  },
};

function CustomTooltip({ active, payload, label, tab }) {
  if (!active || !payload?.length) return null;
  const cfg = TAB_CONFIG[tab];

  return (
    <div className="chart-tooltip">
      <div style={{ fontSize: 10, color: '#64748b', marginBottom: 6 }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 3 }}>
          <span style={{ color: p.color, fontSize: 11 }}>{p.name}</span>
          <span style={{ fontWeight: 700, fontSize: 11 }}>
            {p.value != null ? `${p.value}${cfg.actual.unit}` : '—'}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function DynamicSensorChart() {
  const { chartData, chartHours, setChartHours, prediction } = useSensor();
  const [activeTab, setActiveTab] = useState('gas');

  const cfg = TAB_CONFIG[activeTab];
  const trend = activeTab === 'gas' ? prediction?.trend?.gas
              : activeTab === 'temperature' ? prediction?.trend?.temperature
              : activeTab === 'humidity' ? prediction?.trend?.humidity
              : prediction?.trend?.risk_score;
  const TrendIcon = trend === 'Increasing' ? TrendingUp : trend === 'Decreasing' ? TrendingDown : Minus;

  // Filter out nulls for smooth lines
  const visibleData = chartData.filter(d => d[cfg.actual.key] != null);

  return (
    <div className="chart-card">
      <div className="card-header">
        <div className="card-title">Real-Time Sensor Analytics</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: trend === 'Increasing' ? '#f59e0b' : '#10b981' }}>
          <TrendIcon size={12} />
          Prediction Trend: {trend || 'Stable'}
        </div>
      </div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div className="chart-tabs">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`chart-tab ${activeTab === t.id ? `active ${t.cls}` : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              [{t.label}]
            </button>
          ))}
        </div>
        <div className="time-filters">
          {TIME_FILTERS.map(f => (
            <button
              key={f.id}
              className={`time-btn ${chartHours === f.id ? 'active' : ''}`}
              onClick={() => setChartHours(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart legend */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 6, fontSize: 10, color: '#64748b' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 20, height: 2, background: cfg.actual.color, display: 'inline-block' }} />
          Actual Data
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 20, height: 2, background: cfg.predicted.color, display: 'inline-block', borderTop: '2px dashed' }} />
          Predicted Data
        </span>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={210}>
        <LineChart data={visibleData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a2234" vertical={false} />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 9, fill: '#4b5563' }}
            tickLine={false}
            axisLine={{ stroke: '#2d3748' }}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={cfg.domain}
            tick={{ fontSize: 9, fill: '#4b5563' }}
            tickLine={false}
            axisLine={false}
            label={{ value: cfg.yLabel, angle: -90, position: 'insideLeft', style: { fontSize: 9, fill: '#4b5563' }, dx: -5 }}
            width={55}
          />
          {cfg.refLines.map(ref => (
            <ReferenceLine key={ref.y} y={ref.y} stroke={ref.color} strokeDasharray="3 3"
              label={{ value: ref.label, fill: ref.color, fontSize: 9, position: 'right' }} />
          ))}
          <Tooltip content={<CustomTooltip tab={activeTab} />} />
          <Line
            type="monotone"
            dataKey={cfg.actual.key}
            name={cfg.actual.name}
            stroke={cfg.actual.color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey={cfg.predicted.key}
            name={cfg.predicted.name}
            stroke={cfg.predicted.color}
            strokeWidth={1.5}
            strokeDasharray={cfg.predicted.dash}
            dot={false}
            activeDot={{ r: 3, strokeWidth: 0 }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
