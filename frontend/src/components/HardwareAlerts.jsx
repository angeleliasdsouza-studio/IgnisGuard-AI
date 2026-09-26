/** Local Hardware Alerts — Buzzer, Red LED, Green LED indicators */
import React from 'react';
import { Bell, Lightbulb, Zap } from 'lucide-react';

function getHardwareState(ai_status) {
  switch (ai_status) {
    case 'Critical':
      return { buzzer: 'on-red', redLed: 'on-red', greenLed: 'off' };
    case 'Fire Risk':
      return { buzzer: 'on-red', redLed: 'on-red', greenLed: 'off' };
    case 'Gas Warning':
      return { buzzer: 'on',     redLed: 'on-red', greenLed: 'off' };
    default:
      return { buzzer: 'off',    redLed: 'off',    greenLed: 'on' };
  }
}

function Toggle({ state }) {
  return (
    <div className={`hw-toggle ${state}`}>
      <span style={{
        position: 'absolute', top: '50%', left: state !== 'off' ? 28 : 7,
        transform: 'translateY(-50%)', fontSize: 8, fontWeight: 700,
        color: 'white', transition: 'left 0.3s'
      }}>
        {state !== 'off' ? 'ON' : 'OFF'}
      </span>
    </div>
  );
}

export default function HardwareAlerts({ latest }) {
  const ai_status = latest?.ai_status ?? 'Normal';
  const hw = getHardwareState(ai_status);

  return (
    <div className="hw-card">
      <div className="card-header">
        <div className="card-title">Local Hardware Alerts</div>
        <span style={{ fontSize: 9, color: '#475569' }}>ESP32 Pins</span>
      </div>

      <div style={{ fontSize: 9, color: '#374151', marginBottom: 8, fontStyle: 'italic' }}>
        ⚠ Local indicators only — no remote alerts
      </div>

      <div className="hw-row">
        <div className="hw-label">
          <Bell size={13} color={hw.buzzer !== 'off' ? '#f59e0b' : '#4b5563'} />
          <span>Buzzer</span>
        </div>
        <Toggle state={hw.buzzer} />
      </div>

      <div className="hw-row">
        <div className="hw-label">
          <Lightbulb size={13} color={hw.redLed !== 'off' ? '#ef4444' : '#4b5563'} />
          <span>Red LED</span>
        </div>
        <Toggle state={hw.redLed} />
      </div>

      <div className="hw-row">
        <div className="hw-label">
          <Lightbulb size={13} color={hw.greenLed !== 'off' ? '#10b981' : '#4b5563'} />
          <span>Green LED</span>
        </div>
        <Toggle state={hw.greenLed} />
      </div>

      <div style={{
        marginTop: 8, padding: '4px 8px', background: '#151e2d',
        borderRadius: 4, fontSize: 9, color: '#475569', textAlign: 'center'
      }}>
        Status: {ai_status}
      </div>
    </div>
  );
}
