/** Live Monitoring Page — Full-screen real-time view */
import React from 'react';
import { useSensor } from '../context/SensorContext';
import SensorCards from '../components/SensorCards';
import SimulationBar from '../components/SimulationBar';
import HardwareAlerts from '../components/HardwareAlerts';
import FireStatusCard from '../components/FireStatusCard';
import RecentEvents from '../components/RecentEvents';
import AIRiskCard from '../components/AIRiskCard';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

export default function LiveMonitoring() {
  const { latest, chartData, events, prediction } = useSensor();

  // Show last 30 data points for live view
  const liveData = chartData.slice(-30);

  return (
    <div className="page-content fade-in">
      <div className="page-title">Live Monitoring</div>
      <div className="page-subtitle">Real-time sensor readings — updates every 5 seconds</div>

      <SimulationBar />
      <SensorCards latest={latest} prediction={prediction} />

      {/* Large Live Chart */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-header">
          <div className="card-title">Live Sensor Feed (Last 30 Readings)</div>
          <span style={{ fontSize: 10, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'pulse-green 2s infinite' }} />
            LIVE
          </span>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={liveData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2234" vertical={false} />
            <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#4b5563' }} tickLine={false} axisLine={{ stroke: '#2d3748' }} interval="preserveStartEnd" />
            <YAxis yAxisId="gas"  orientation="left"  tick={{ fontSize: 9, fill: '#4b5563' }} tickLine={false} axisLine={false} label={{ value: 'Gas (ADC)', angle: -90, position: 'insideLeft', style: { fontSize: 9, fill: '#4b5563' }, dx: -5 }} width={55} />
            <YAxis yAxisId="temp" orientation="right" tick={{ fontSize: 9, fill: '#4b5563' }} tickLine={false} axisLine={false} label={{ value: 'Temp (°C)', angle: 90, position: 'insideRight', style: { fontSize: 9, fill: '#4b5563' }, dx: 5 }} width={55} />
            <Tooltip
              contentStyle={{ background: '#1c2432', border: '1px solid #2d3748', borderRadius: 6, fontSize: 11 }}
              labelStyle={{ color: '#64748b' }}
            />
            <Legend wrapperStyle={{ fontSize: 10, color: '#94a3b8' }} />
            <Line yAxisId="gas"  type="monotone" dataKey="gas"         name="Gas (ADC)"    stroke="#f59e0b" strokeWidth={2} dot={false} />
            <Line yAxisId="temp" type="monotone" dataKey="temperature" name="Temp (°C)"    stroke="#60a5fa" strokeWidth={2} dot={false} />
            <Line yAxisId="temp" type="monotone" dataKey="humidity"    name="Humidity (%)" stroke="#10b981" strokeWidth={1.5} dot={false} strokeDasharray="5 5" />
            <Line yAxisId="gas"  type="monotone" dataKey="risk_score"  name="Risk Score (%)" stroke="#ef4444" strokeWidth={1.5} dot={false} strokeDasharray="3 3" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 1fr 200px', gap: 12 }}>
        <AIRiskCard latest={latest} prediction={prediction} />
        <FireStatusCard latest={latest} />
        <RecentEvents events={events} />
        <HardwareAlerts latest={latest} />
      </div>
    </div>
  );
}
