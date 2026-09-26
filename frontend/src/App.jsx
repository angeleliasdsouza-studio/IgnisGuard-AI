/**
 * App.jsx — Root application component
 * Manages routing between pages using simple state-based navigation.
 */
import React, { useState } from 'react';
import { SensorProvider, useSensor } from './context/SensorContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import LiveMonitoring from './pages/LiveMonitoring';
import Analytics from './pages/Analytics';
import Predictions from './pages/Predictions';
import AIModel from './pages/AIModel';
import HistoricalTable from './pages/HistoricalTable';
import Settings from './pages/Settings';

// Page router
function PageRouter({ activePage }) {
  switch (activePage) {
    case 'dashboard':    return <Dashboard />;
    case 'live':         return <LiveMonitoring />;
    case 'analytics':    return <Analytics />;
    case 'predictions':  return <Predictions />;
    case 'ai-model':     return <AIModel />;
    case 'historical':   return <HistoricalTable />;
    case 'settings':     return <Settings />;
    default:             return <Dashboard />;
  }
}

function AppInner() {
  const [activePage, setActivePage] = useState('dashboard');
  const { backendOnline, simMode, simScenario } = useSensor();

  return (
    <div className="app-layout">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        simMode={simMode}
        simScenario={simScenario}
      />
      <div className="main-content">
        <Header backendOnline={backendOnline} />
        <PageRouter activePage={activePage} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <SensorProvider>
      <AppInner />
    </SensorProvider>
  );
}
