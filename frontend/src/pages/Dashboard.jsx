/**
 * Dashboard Page — Main landing page matching the reference image.
 * Layout: KPI Cards → AI Section → Chart+Right → Bottom Section
 */
import React from 'react';
import { useSensor } from '../context/SensorContext';
import SensorCards from '../components/SensorCards';
import AIRiskCard from '../components/AIRiskCard';
import AIAnalysisCard from '../components/AIAnalysisCard';
import DynamicSensorChart from '../components/DynamicSensorChart';
import PredictionCard from '../components/PredictionCard';
import FireStatusCard from '../components/FireStatusCard';
import RecentEvents from '../components/RecentEvents';
import HardwareAlerts from '../components/HardwareAlerts';
import SimulationBar from '../components/SimulationBar';
import HistoricalTable from './HistoricalTable';
import ModelPerformance from '../components/ModelPerformance';

export default function Dashboard() {
  const { latest, prediction, events, modelStatus, loading } = useSensor();

  if (loading) {
    return (
      <div className="page-content fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div style={{ textAlign: 'center', color: '#64748b' }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>🔥</div>
          <div style={{ fontSize: 14 }}>Connecting to backend...</div>
          <div style={{ fontSize: 11, marginTop: 4 }}>Start the backend: cd backend && npm start</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content fade-in">
      {/* Page heading */}
      <div className="page-title">Fire &amp; Gas Monitoring Dashboard</div>
      <div className="page-subtitle">Real-time sensor monitoring and AI-based risk analysis</div>

      {/* Simulation Controls */}
      <SimulationBar />

      {/* KPI Cards */}
      <SensorCards latest={latest} prediction={prediction} />

      {/* AI Section: Risk | Analysis | Chart+Right */}
      <div className="ai-section">
        {/* AI Risk circular gauge */}
        <AIRiskCard latest={latest} prediction={prediction} />

        {/* AI Analysis */}
        <AIAnalysisCard latest={latest} prediction={prediction} />

        {/* Dynamic Sensor Chart */}
        <DynamicSensorChart />
      </div>

      {/* Bottom Section: Fire Status | Prediction | Events | Hardware */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px 220px 200px', gap: 12, marginBottom: 14 }}>
        <FireStatusCard latest={latest} />
        <PredictionCard prediction={prediction} />
        <RecentEvents events={events} />
        <HardwareAlerts latest={latest} />
      </div>

      {/* Historical Table */}
      <div style={{ marginBottom: 14 }}>
        <HistoricalTable embedded />
      </div>

      {/* Model Performance */}
      <ModelPerformance modelStatus={modelStatus} />
    </div>
  );
}
