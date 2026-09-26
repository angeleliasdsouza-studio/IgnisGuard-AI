/**
 * SensorContext — Global state for all sensor data.
 * All pages consume from here; only this file talks to the backend.
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import apiService from '../services/api';

const SensorContext = createContext(null);

export function SensorProvider({ children }) {
  const [latest, setLatest]           = useState(null);
  const [chartData, setChartData]     = useState([]);
  const [events, setEvents]           = useState([]);
  const [prediction, setPrediction]   = useState(null);
  const [modelStatus, setModelStatus] = useState(null);
  const [simScenario, setSimScenario] = useState('normal');
  const [simMode, setSimMode]         = useState(true);
  const [chartHours, setChartHours]   = useState(1);
  const [backendOnline, setBackendOnline] = useState(false);
  const [loading, setLoading]         = useState(true);
  const pollRef = useRef(null);

  const fetchAll = useCallback(async () => {
    try {
      const [lat, chart, evts, pred, model] = await Promise.all([
        apiService.getLatest().catch(() => null),
        apiService.getChartData(chartHours).catch(() => []),
        apiService.getEvents().catch(() => []),
        apiService.getPrediction().catch(() => null),
        apiService.getModelStatus().catch(() => null),
      ]);
      if (lat) {
        setLatest(lat);
        setBackendOnline(true);
      }
      setChartData(chart || []);
      setEvents(evts || []);
      if (pred) setPrediction(pred);
      if (model) setModelStatus(model);
      setLoading(false);
    } catch {
      setBackendOnline(false);
      setLoading(false);
    }
  }, [chartHours]);

  // Initial load
  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Poll every 5 seconds
  useEffect(() => {
    pollRef.current = setInterval(fetchAll, 5000);
    return () => clearInterval(pollRef.current);
  }, [fetchAll]);

  const changeScenario = useCallback(async (scenario) => {
    setSimScenario(scenario);
    try {
      await apiService.setSimulation(scenario, true);
      setTimeout(fetchAll, 600); // Refresh after backend applies
    } catch (e) {
      console.warn('Backend offline, scenario change stored locally');
    }
  }, [fetchAll]);

  const value = {
    latest, chartData, events, prediction,
    modelStatus, simScenario, simMode,
    backendOnline, loading, chartHours,
    setChartHours, changeScenario, refresh: fetchAll
  };

  return <SensorContext.Provider value={value}>{children}</SensorContext.Provider>;
}

export const useSensor = () => {
  const ctx = useContext(SensorContext);
  if (!ctx) throw new Error('useSensor must be used inside SensorProvider');
  return ctx;
};
