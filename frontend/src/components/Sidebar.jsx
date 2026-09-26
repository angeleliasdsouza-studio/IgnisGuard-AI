/** Sidebar Navigation Component */
import React from 'react';
import {
  Flame, LayoutDashboard, Activity, BarChart2,
  TrendingUp, Brain, Database, Settings, Zap
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard',    label: 'Dashboard',       icon: LayoutDashboard },
  { id: 'live',         label: 'Live Monitoring',  icon: Activity },
  { id: 'analytics',   label: 'Analytics',        icon: BarChart2 },
  { id: 'predictions', label: 'Predictions',      icon: TrendingUp },
  { id: 'ai-model',    label: 'AI Model',         icon: Brain },
  { id: 'historical',  label: 'Historical Data',  icon: Database },
  { id: 'settings',    label: 'System Settings',  icon: Settings },
];

export default function Sidebar({ activePage, onNavigate, simMode, simScenario }) {
  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Flame size={18} color="white" />
        </div>
        <div className="sidebar-logo-text">
          <span className="sidebar-logo-title">AI Fire & Gas</span>
          <span className="sidebar-logo-sub">Monitor v1.0</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Navigation</div>
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <div
            key={id}
            className={`nav-item ${activePage === id ? 'active' : ''}`}
            onClick={() => onNavigate(id)}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && onNavigate(id)}
          >
            <Icon size={16} />
            <span>{label}</span>
          </div>
        ))}
      </nav>

      {/* Footer — Simulation Badge */}
      <div className="sidebar-footer">
        {simMode && (
          <div className="sim-badge">
            <Zap size={12} />
            <span>SIM: {simScenario.replace('_', ' ').toUpperCase()}</span>
          </div>
        )}
      </div>
    </div>
  );
}
