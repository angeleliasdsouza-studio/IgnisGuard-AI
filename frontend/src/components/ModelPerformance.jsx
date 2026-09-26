/** Model Performance Card */
import React from 'react';
import { Brain, BarChart2 } from 'lucide-react';

function MetricBar({ label, value, color = '#3b82f6' }) {
  return (
    <div className="metric-bar">
      <div className="metric-bar-label">{label}</div>
      <div className="metric-bar-track">
        <div
          className="metric-bar-fill"
          style={{ width: `${value || 0}%`, background: color }}
        />
      </div>
      <div className="metric-bar-value">{value != null ? `${value}%` : '—'}</div>
    </div>
  );
}

export default function ModelPerformance({ modelStatus }) {
  if (!modelStatus) {
    return (
      <div className="card">
        <div className="card-title">AI MODEL PERFORMANCE</div>
        <div style={{ fontSize: 11, color: '#64748b', marginTop: 8 }}>Loading model info...</div>
      </div>
    );
  }

  const { accuracy, precision, recall, f1_score, model_loaded, classes, dataset_size, train_size, test_size, confusion_matrix } = modelStatus;

  const CLASSES = classes || ['Normal', 'Gas Warning', 'Fire Risk', 'Critical'];
  const cm = confusion_matrix;

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Brain size={12} /> AI MODEL PERFORMANCE
        </div>
        <span style={{ fontSize: 9, color: model_loaded ? '#10b981' : '#f59e0b' }}>
          {model_loaded ? '● Trained' : '● Not Trained'}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* Left: model info + metrics */}
        <div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 8 }}>
            <div className="pred-row">
              <span className="pred-key">Model</span>
              <span style={{ fontSize: 10, color: '#60a5fa', fontWeight: 600 }}>Decision Tree</span>
            </div>
            <div className="pred-row">
              <span className="pred-key">Training Data</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#e2e8f0' }}>80% ({train_size || '~1600'})</span>
            </div>
            <div className="pred-row">
              <span className="pred-key">Testing Data</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#e2e8f0' }}>20% ({test_size || '~400'})</span>
            </div>
            <div className="pred-row">
              <span className="pred-key">Dataset Size</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#e2e8f0' }}>{dataset_size || '2000'} samples</span>
            </div>
          </div>

          <div style={{ marginBottom: 4 }}>
            <MetricBar label="Accuracy"  value={accuracy}  color="#3b82f6" />
            <MetricBar label="Precision" value={precision} color="#10b981" />
            <MetricBar label="Recall"    value={recall}    color="#f59e0b" />
            <MetricBar label="F1 Score"  value={f1_score}  color="#8b5cf6" />
          </div>

          {!model_loaded && (
            <div style={{
              background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)',
              borderRadius: 5, padding: '5px 8px', fontSize: 10, color: '#f59e0b', marginTop: 6
            }}>
              Run: python ml/train_model.py
            </div>
          )}
        </div>

        {/* Right: Classes + Confusion Matrix */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
            Classes
          </div>
          {CLASSES.map((cls, i) => {
            const colors = ['#10b981', '#f59e0b', '#f97316', '#ef4444'];
            return (
              <div key={cls} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: colors[i], display: 'inline-block' }} />
                <span style={{ fontSize: 10, color: '#94a3b8' }}>{cls}</span>
              </div>
            );
          })}

          {cm && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                Confusion Matrix
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cm[0].length}, 1fr)`, gap: 2 }}>
                {cm.map((row, ri) =>
                  row.map((val, ci) => (
                    <div
                      key={`${ri}-${ci}`}
                      className={`cm-cell ${ri === ci ? 'diagonal' : 'off-diagonal'}`}
                      style={{ fontSize: 9, padding: '3px 2px' }}
                    >
                      {val}
                    </div>
                  ))
                )}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 4, fontSize: 9, color: '#475569' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <span style={{ width: 8, height: 8, background: 'rgba(59,130,246,0.3)', borderRadius: 1, display: 'inline-block' }} />
                  Correct
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <span style={{ width: 8, height: 8, background: 'rgba(239,68,68,0.1)', borderRadius: 1, display: 'inline-block' }} />
                  Errors
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
