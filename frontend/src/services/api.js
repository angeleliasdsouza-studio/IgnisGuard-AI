/**
 * API Service — All backend calls centralized here.
 * When ESP32 is connected, only the backend changes; this frontend stays the same.
 */
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({ baseURL: API_BASE, timeout: 8000 });

export const apiService = {
  // Latest sensor reading
  getLatest: ()               => api.get('/api/latest').then(r => r.data),
  // Historical chart data
  getChartData: (hours = 1)   => api.get(`/api/chart-data?hours=${hours}`).then(r => r.data),
  // Full historical table
  getHistory: (params = {})   => api.get('/api/history/all', { params }).then(r => r.data),
  // Events log
  getEvents: ()               => api.get('/api/events').then(r => r.data),
  // Predictions
  getPrediction: ()           => api.get('/api/prediction').then(r => r.data),
  // Model status
  getModelStatus: ()          => api.get('/api/model-status').then(r => r.data),
  // Simulation
  getSimStatus: ()            => api.get('/api/simulation-status').then(r => r.data),
  setSimulation: (scenario, enabled) => api.post('/api/simulation', { scenario, enabled }).then(r => r.data),
  // ESP32 ingestion (for testing)
  postSensorData: (data)      => api.post('/api/sensor-data', data).then(r => r.data),
};

export default apiService;
