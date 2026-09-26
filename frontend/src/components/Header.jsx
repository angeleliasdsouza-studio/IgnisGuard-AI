/** Top Header Component */
import React, { useState, useEffect } from 'react';
import { Flame, User, Settings, Bell, Wifi, WifiOff } from 'lucide-react';

export default function Header({ backendOnline }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const timeStr = time.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  });

  return (
    <div className="header">
      {/* Title */}
      <div className="header-title-group">
        <Flame size={20} color="#ef4444" />
        <div>
          <div className="header-title">AI Fire &amp; Gas Monitor</div>
          <div className="header-subtitle">Real-Time Monitoring &amp; Predictive Analytics</div>
        </div>
      </div>

      {/* Center Status */}
      <div className="header-center">
        <div className={`status-pill ${backendOnline ? '' : 'style="background:rgba(239,68,68,0.1);border-color:rgba(239,68,68,0.2);color:#ef4444"'}`}
          style={backendOnline ? {} : { background:'rgba(239,68,68,0.1)', borderColor:'rgba(239,68,68,0.2)', color:'#ef4444' }}>
          <span className="status-dot" style={backendOnline ? {} : { background:'#ef4444', animation:'none' }} />
          {backendOnline ? 'ONLINE' : 'CONNECTING...'}
        </div>
        <div className="last-updated">
          Last Updated: <span style={{ color: '#94a3b8', fontWeight: 600 }}>{timeStr}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="header-actions">
        <button className="icon-btn" title="Notifications"><Bell size={15} /></button>
        <button className="icon-btn" title="Profile"><User size={15} /></button>
        <button className="icon-btn" title="Settings"><Settings size={15} /></button>
      </div>
    </div>
  );
}
