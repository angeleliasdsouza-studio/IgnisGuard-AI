/** Recent Events Card — Live log of system events */
import React from 'react';
import { Clock, Flame, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

function getSeverityConfig(severity) {
  const sev = (severity || '').toUpperCase();
  if (sev === 'CRITICAL')    return { cls: 'critical',  color: '#ef4444', icon: <AlertCircle size={10} /> };
  if (sev === 'FIRE RISK')   return { cls: 'fire-risk', color: '#f97316', icon: <Flame size={10} /> };
  if (sev === 'WARNING')     return { cls: 'warning',   color: '#f59e0b', icon: <AlertTriangle size={10} /> };
  return                            { cls: 'normal',    color: '#10b981', icon: <CheckCircle size={10} /> };
}

export default function RecentEvents({ events }) {
  const displayEvents = (events || []).slice(0, 6);

  return (
    <div className="events-card">
      <div className="card-header">
        <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Clock size={11} /> Recent Events
        </div>
        <span style={{ fontSize: 10, color: '#475569' }}>Last {displayEvents.length}</span>
      </div>

      {displayEvents.length === 0 ? (
        <div style={{ fontSize: 11, color: '#475569', padding: '8px 0' }}>No events recorded.</div>
      ) : (
        displayEvents.map((ev, i) => {
          const cfg = getSeverityConfig(ev.severity);
          const time = new Date(ev.timestamp).toLocaleTimeString('en-US', { hour12: false });
          return (
            <div key={ev.id || i} className="event-row">
              <span className="event-time">{time}</span>
              <span className="event-msg">{ev.message}</span>
              <span className={`badge ${cfg.cls}`} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                {cfg.icon}
                {ev.severity}
              </span>
            </div>
          );
        })
      )}
    </div>
  );
}
