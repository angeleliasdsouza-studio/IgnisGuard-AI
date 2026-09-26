/** AI Risk Card — Circular progress gauge with classification */
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Brain } from 'lucide-react';

function getRiskColor(score) {
  if (score >= 80) return '#ef4444';
  if (score >= 60) return '#f97316';
  if (score >= 35) return '#f59e0b';
  return '#10b981';
}

function getClassificationLabel(ai_status) {
  const map = {
    'Normal':      { label: 'NORMAL',      cls: 'normal' },
    'Gas Warning': { label: 'GAS WARNING', cls: 'warning' },
    'Fire Risk':   { label: 'FIRE RISK',   cls: 'fire-risk' },
    'Critical':    { label: 'CRITICAL',    cls: 'critical' },
  };
  return map[ai_status] || { label: 'NORMAL', cls: 'normal' };
}

export default function AIRiskCard({ latest, prediction }) {
  const riskScore = latest?.risk_score ?? 0;
  const ai_status = latest?.ai_status ?? 'Normal';
  const riskTrend = prediction?.trend?.risk_score || 'Stable';
  const color = getRiskColor(riskScore);
  const { label, cls } = getClassificationLabel(ai_status);

  // Circular gauge data
  const data = [
    { value: riskScore },
    { value: 100 - riskScore }
  ];

  const TrendComp = riskTrend === 'Increasing' ? TrendingUp : riskTrend === 'Decreasing' ? TrendingDown : Minus;

  return (
    <div className="ai-risk-card">
      <div className="card-title" style={{ marginBottom: 6 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Brain size={12} /> AI FIRE RISK
        </span>
      </div>

      {/* Circular Gauge */}
      <div className="risk-circle-container">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              startAngle={220}
              endAngle={-40}
              innerRadius={38}
              outerRadius={50}
              dataKey="value"
              strokeWidth={0}
            >
              <Cell fill={color} />
              <Cell fill="#1a2234" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="risk-circle-text">
          <span className="risk-percent" style={{ color }}>{riskScore.toFixed(0)}%</span>
          <span className="risk-label-small">RISK</span>
        </div>
      </div>

      <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 6, fontWeight: 600 }}>
        Predicted Fire Risk
      </div>

      <div style={{ marginBottom: 4 }}>
        <span className={`badge ${cls}`}>{label}</span>
      </div>

      <div style={{ fontSize: 10, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
        <TrendComp size={10} />
        Trend: {riskTrend}
      </div>

      <div style={{ fontSize: 9, color: '#475569', textAlign: 'center', lineHeight: 1.4 }}>
        Model: Decision Tree Classifier
      </div>

      <div
        style={{
          marginTop: 8, padding: '5px 12px', background: '#263244',
          border: '1px solid #2d3748', borderRadius: 5, cursor: 'pointer',
          fontSize: 10, fontWeight: 600, color: '#60a5fa', textAlign: 'center'
        }}
      >
        AI Analysis
      </div>
    </div>
  );
}
