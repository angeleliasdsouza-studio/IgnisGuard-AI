/** Simulation Controls Bar — Normal / Gas Warning / Fire Risk / Critical */
import React from 'react';
import { Zap, Play } from 'lucide-react';
import { useSensor } from '../context/SensorContext';

const SCENARIOS = [
  { id: 'normal',      label: 'Normal',      cls: 'normal',    desc: 'All sensors normal' },
  { id: 'gas_warning', label: 'Gas Warning', cls: 'warning',   desc: 'Elevated gas level' },
  { id: 'fire_risk',   label: 'Fire Risk',   cls: 'fire-risk', desc: 'High risk condition' },
  { id: 'critical',    label: 'Critical',    cls: 'critical',  desc: 'Emergency state' },
];

export default function SimulationBar() {
  const { simScenario, changeScenario, simMode } = useSensor();

  return (
    <div className="sim-bar">
      <div className="sim-label">
        <Zap size={13} />
        SIMULATION MODE
      </div>

      <div className="sim-buttons">
        {SCENARIOS.map(s => (
          <button
            key={s.id}
            className={`sim-btn ${simScenario === s.id ? `active ${s.cls}` : ''}`}
            onClick={() => changeScenario(s.id)}
            title={s.desc}
          >
            {simScenario === s.id && <Play size={9} style={{ display: 'inline', marginRight: 3 }} />}
            {s.label}
          </button>
        ))}
      </div>

      <div style={{ marginLeft: 'auto', fontSize: 10, color: '#64748b', whiteSpace: 'nowrap' }}>
        Updates every 5s · Click to change scenario
      </div>
    </div>
  );
}
