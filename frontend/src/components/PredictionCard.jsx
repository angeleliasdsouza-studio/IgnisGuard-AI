/** Prediction Card — Linear regression-based next-value prediction */
import React from 'react';
import { TrendingUp, TrendingDown, Minus, Clock } from 'lucide-react';

export default function PredictionCard({ prediction }) {
  if (!prediction?.current) {
    return (
      <div className="prediction-card">
        <div className="card-title">AI PREDICTION</div>
        <div style={{ fontSize: 11, color: '#64748b', marginTop: 8 }}>Loading predictions...</div>
      </div>
    );
  }

  const { current, predicted, trend } = prediction;

  const TrendIcon = (t) => t === 'Increasing' ? TrendingUp : t === 'Decreasing' ? TrendingDown : Minus;
  const trendColor = (t) => t === 'Increasing' ? '#f59e0b' : t === 'Decreasing' ? '#10b981' : '#64748b';

  const rows = [
    {
      label: 'Gas Level',
      current: `${current.gas} ADC`,
      predicted: `${predicted.gas} ADC`,
      trend: trend.gas,
    },
    {
      label: 'Temperature',
      current: `${current.temperature}°C`,
      predicted: `${predicted.temperature}°C`,
      trend: trend.temperature,
    },
    {
      label: 'Humidity',
      current: `${current.humidity}%`,
      predicted: `${predicted.humidity}%`,
      trend: trend.humidity,
    },
    {
      label: 'Fire Risk',
      current: `${current.risk_score?.toFixed(0)}%`,
      predicted: `${predicted.risk_score?.toFixed(0)}%`,
      trend: trend.risk_score,
    },
  ];

  return (
    <div className="prediction-card">
      <div className="card-header">
        <div className="card-title">AI PREDICTION</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, color: '#64748b' }}>
          <Clock size={10} />
          Next 10 Min
        </div>
      </div>

      <div style={{ fontSize: 9, color: '#475569', marginBottom: 8, fontStyle: 'italic' }}>
        Model: Linear Regression (Rolling Window)
      </div>

      {rows.map(row => {
        const T = TrendIcon(row.trend);
        return (
          <div key={row.label} className="pred-row">
            <span className="pred-key">{row.label}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 10, color: '#64748b' }}>{row.current}</span>
              <span style={{ fontSize: 10, color: '#374151' }}>→</span>
              <span className="pred-val" style={{ fontSize: 11, color: trendColor(row.trend) }}>
                {row.predicted}
              </span>
              <T size={10} style={{ color: trendColor(row.trend) }} />
            </div>
          </div>
        );
      })}

      <div style={{
        marginTop: 8, padding: '4px 8px', background: 'rgba(59,130,246,0.08)',
        border: '1px solid rgba(59,130,246,0.15)', borderRadius: 4,
        fontSize: 9, color: '#60a5fa', textAlign: 'center'
      }}>
        Prediction Horizon: Next 10 Minutes
      </div>
    </div>
  );
}
