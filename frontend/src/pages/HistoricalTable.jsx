/**
 * Historical Table — Sensor data table with date filter, export CSV, and pagination.
 * Used both as standalone page and embedded in Dashboard.
 */
import React, { useState, useEffect } from 'react';
import { Download, Calendar, Filter, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import apiService from '../services/api';

const STATUS_OPTIONS = ['all', 'Normal', 'Gas Warning', 'Fire Risk', 'Critical'];

function getBadgeCls(status) {
  const map = { 'Normal': 'normal', 'Gas Warning': 'warning', 'Fire Risk': 'fire-risk', 'Critical': 'critical' };
  return map[status] || 'normal';
}

export default function HistoricalTable({ embedded = false }) {
  const [data, setData]       = useState([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [status, setStatus]   = useState('all');
  const [loading, setLoading] = useState(false);
  const LIMIT = embedded ? 5 : 15;

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiService.getHistory({ page, limit: LIMIT, status: status === 'all' ? undefined : status });
      setData(res.rows || []);
      setTotal(res.total || 0);
    } catch {
      setData([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [page, status]);

  const totalPages = Math.ceil(total / LIMIT);

  const exportCSV = () => {
    const headers = ['Timestamp', 'Gas (ADC)', 'Temperature (°C)', 'Humidity (%)', 'Flame', 'AI Status', 'Risk Score'];
    const rows = data.map(r => [
      r.timestamp, r.gas_level, r.temperature, r.humidity,
      r.flame_status === 1 ? 'Detected' : 'Clear', r.ai_status, r.risk_score
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fire_gas_data_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card">
      {/* Header */}
      <div className="card-header" style={{ marginBottom: 10 }}>
        <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Calendar size={12} /> Historical Sensor Data
          <span style={{ fontSize: 10, color: '#475569', fontWeight: 400, textTransform: 'none' }}>({total} records)</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Status Filter */}
          <select
            value={status}
            onChange={e => { setStatus(e.target.value); setPage(1); }}
            style={{
              background: '#151e2d', border: '1px solid #2d3748', color: '#94a3b8',
              borderRadius: 5, padding: '4px 8px', fontSize: 11, cursor: 'pointer'
            }}
          >
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s}</option>)}
          </select>
          {/* Export */}
          <button className="btn-primary" onClick={exportCSV}>
            <Download size={12} /> Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Gas (ADC)</th>
              <th>Temperature</th>
              <th>Humidity</th>
              <th>Flame</th>
              <th>AI Status</th>
              <th>Risk Score</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 12, color: '#475569' }}>Loading...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 12, color: '#475569' }}>No data available</td></tr>
            ) : (
              data.map(r => (
                <tr key={r.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: 10 }}>
                    {new Date(r.timestamp).toLocaleString('en-IN', { hour12: false })}
                  </td>
                  <td style={{ fontWeight: 600, color: r.gas_level > 600 ? '#ef4444' : r.gas_level > 400 ? '#f59e0b' : '#94a3b8' }}>
                    {r.gas_level}
                  </td>
                  <td style={{ color: r.temperature > 45 ? '#ef4444' : '#94a3b8' }}>{r.temperature}°C</td>
                  <td>{r.humidity}%</td>
                  <td>
                    <span style={{ color: r.flame_status === 1 ? '#ef4444' : '#10b981', fontWeight: 600 }}>
                      {r.flame_status === 1 ? '🔥 Detected' : '✓ Clear'}
                    </span>
                  </td>
                  <td><span className={`badge ${getBadgeCls(r.ai_status)}`}>{r.ai_status}</span></td>
                  <td>
                    <span style={{ fontWeight: 600, color: r.risk_score > 60 ? '#ef4444' : r.risk_score > 35 ? '#f59e0b' : '#10b981' }}>
                      {r.risk_score?.toFixed(0)}%
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!embedded && totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
          <span style={{ fontSize: 10, color: '#64748b' }}>
            Page {page} of {totalPages} · {total} total records
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn-secondary" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronLeft size={12} /> Prev
            </button>
            <button className="btn-secondary" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              Next <ChevronRight size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
