/** Sensor KPI Cards — 4 across top of dashboard */
import React from 'react';
import { Gauge, Thermometer, Droplets, Flame, TrendingUp, TrendingDown, Minus } from 'lucide-react';

function TrendIcon({ trend }) {
  if (trend === 'Increasing') return <TrendingUp size={10} color="#f59e0b" />;
  if (trend === 'Decreasing') return <TrendingDown size={10} color="#10b981" />;
  return <Minus size={10} color="#64748b" />;
}

export default function SensorCards({ latest, prediction }) {
  if (!latest) {
    return (
      <div className="kpi-grid">
        {[1,2,3,4].map(i => (
          <div key={i} className="kpi-card" style={{ opacity: 0.5 }}>
            <div style={{ fontSize: 12, color: '#64748b' }}>Loading...</div>
          </div>
        ))}
      </div>
    );
  }

  const { gas_level, temperature, humidity, flame_status, ai_status } = latest;

  // Derive status from values
  const gasStatus = gas_level > 600 ? 'critical' : gas_level > 400 ? 'warning' : 'normal';
  const tempStatus = temperature > 50 ? 'critical' : temperature > 36 ? 'warning' : 'normal';
  const humStatus = humidity < 30 ? 'warning' : 'normal';
  const flameStatus = flame_status === 1 ? 'critical' : 'normal';

  const gasTrend    = prediction?.trend?.gas || 'Stable';
  const tempTrend   = prediction?.trend?.temperature || 'Stable';
  const humTrend    = prediction?.trend?.humidity || 'Stable';

  const STATUS_LABEL = { normal: 'NORMAL', warning: 'WARNING', critical: 'CRITICAL' };

  return (
    <div className="kpi-grid">
      {/* Gas Level */}
      <div className={`kpi-card ${gasStatus}`}>
        <div className={`kpi-icon-wrap gas`}>
          <Gauge size={22} />
        </div>
        <div className="kpi-info">
          <div className="kpi-label">Gas Level</div>
          <div className="kpi-value gas">{gas_level} <span style={{fontSize:13,fontWeight:500}}>ADC</span></div>
          <div className="kpi-meta">
            <span className={`kpi-status ${gasStatus}`}>● {STATUS_LABEL[gasStatus]}</span>
            <span className="kpi-trend"><TrendIcon trend={gasTrend} /> {gasTrend}</span>
          </div>
        </div>
      </div>

      {/* Temperature */}
      <div className={`kpi-card ${tempStatus}`}>
        <div className={`kpi-icon-wrap temp`}>
          <Thermometer size={22} />
        </div>
        <div className="kpi-info">
          <div className="kpi-label">Temperature</div>
          <div className="kpi-value temp">{temperature} <span style={{fontSize:13,fontWeight:500}}>°C</span></div>
          <div className="kpi-meta">
            <span className={`kpi-status ${tempStatus}`}>● {STATUS_LABEL[tempStatus]}</span>
            <span className="kpi-trend"><TrendIcon trend={tempTrend} /> {tempTrend}</span>
          </div>
        </div>
      </div>

      {/* Humidity */}
      <div className={`kpi-card ${humStatus}`}>
        <div className={`kpi-icon-wrap humidity`}>
          <Droplets size={22} />
        </div>
        <div className="kpi-info">
          <div className="kpi-label">Humidity</div>
          <div className="kpi-value humidity">{humidity} <span style={{fontSize:13,fontWeight:500}}>%</span></div>
          <div className="kpi-meta">
            <span className={`kpi-status ${humStatus}`}>● {STATUS_LABEL[humStatus]}</span>
            <span className="kpi-trend"><TrendIcon trend={humTrend} /> {humTrend}</span>
          </div>
        </div>
      </div>

      {/* Flame Status */}
      <div className={`kpi-card ${flameStatus}`}>
        <div className={`kpi-icon-wrap flame`}>
          <Flame size={22} />
        </div>
        <div className="kpi-info">
          <div className="kpi-label">Flame Status</div>
          <div className={`kpi-value ${flame_status === 1 ? 'flame-detected' : 'flame-clear'}`} style={{fontSize:18}}>
            {flame_status === 1 ? 'DETECTED' : 'CLEAR'}
          </div>
          <div className="kpi-meta">
            <span className={`kpi-status ${flameStatus}`}>● {flame_status === 1 ? 'CRITICAL' : 'NORMAL'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
