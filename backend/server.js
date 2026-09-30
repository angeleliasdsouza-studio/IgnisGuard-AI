/**
 * AI Fire & Gas Monitor - Backend Server
 * Uses a simple local JSON array to avoid SQLite native compilation issues on Windows.
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const supabase = require('./supabase');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*' }));
app.use(express.json());

// In-memory data store
let sensor_readings = [];
let events = [];

// ─── Simulation State ────────────────────────────────────────────────────────
let simulationScenario = 'normal';
let simulationMode = true;
let lastRealDataTime = 0; // Timestamp of last real ESP32 POST
const REAL_DATA_TIMEOUT_MS = 30000; // If no ESP32 data for 30s, re-enable simulation

const SCENARIOS = {
  normal: { gas: { min: 200, max: 350, trend: 0 }, temperature: { min: 28, max: 32, trend: 0 }, humidity: { min: 55, max: 70, trend: 0 }, flame: 0, ai_status: 'Normal', risk_score: 5 },
  gas_warning: { gas: { min: 450, max: 650, trend: 1 }, temperature: { min: 30, max: 36, trend: 0.5 }, humidity: { min: 50, max: 65, trend: 0 }, flame: 0, ai_status: 'Gas Warning', risk_score: 45 },
  fire_risk: { gas: { min: 600, max: 750, trend: 1 }, temperature: { min: 40, max: 55, trend: 1 }, humidity: { min: 40, max: 55, trend: -0.5 }, flame: 1, ai_status: 'Fire Risk', risk_score: 82 },
  critical: { gas: { min: 780, max: 950, trend: 1 }, temperature: { min: 60, max: 85, trend: 1 }, humidity: { min: 25, max: 40, trend: -1 }, flame: 1, ai_status: 'Critical', risk_score: 95 }
};

let lastValues = { gas: 300, temperature: 30, humidity: 62, flame: 0 };
let currentId = 1;
let eventId = 1;

function getRealisticValue(last, scenario_range, variation = 5) {
  const { min, max, trend } = scenario_range;
  const noise = (Math.random() - 0.5) * variation;
  const next = last + noise + (trend * variation * 0.5);
  return Math.max(min, Math.min(max, next));
}

function generateSimulatedReading() {
  const scenario = SCENARIOS[simulationScenario];
  const gas = Math.round(getRealisticValue(lastValues.gas, scenario.gas, 15));
  const temp = parseFloat(getRealisticValue(lastValues.temperature, scenario.temperature, 0.8).toFixed(1));
  const hum = parseFloat(getRealisticValue(lastValues.humidity, scenario.humidity, 1.5).toFixed(1));
  
  lastValues = { gas, temperature: temp, humidity: hum, flame: scenario.flame };

  return {
    id: currentId++,
    timestamp: new Date().toISOString(),
    gas_level: gas,
    temperature: temp,
    humidity: hum,
    flame_status: scenario.flame,
    ai_status: scenario.ai_status,
    risk_score: Math.max(0, Math.min(100, parseFloat((scenario.risk_score + (Math.random()-0.5)*5).toFixed(1))))
  };
}

function saveReading(reading) {
  sensor_readings.push(reading);
  if (sensor_readings.length > 1000) sensor_readings.shift(); // Keep last 1000

  const scenario = SCENARIOS[simulationScenario];
  if (reading.flame_status === 1 && reading.ai_status === 'Fire Risk') addEvent('Flame detected', 'FIRE RISK');
  else if (reading.ai_status === 'Gas Warning') addEvent('Gas level elevated', 'WARNING');
  else if (reading.ai_status === 'Critical') addEvent('CRITICAL: All sensors alarming!', 'CRITICAL');
}

function addEvent(message, severity) {
  events.push({ id: eventId++, timestamp: new Date().toISOString(), message, severity });
  if (events.length > 100) events.shift();
}

// Seed initial data
(function seedHistoricalData() {
  const now = Date.now();
  let gas = 300, temp = 30, hum = 62;
  for (let i = 120; i >= 0; i--) {
    const ts = new Date(now - i * 30000).toISOString();
    gas = Math.max(200, Math.min(400, gas + (Math.random() - 0.5) * 20));
    temp = Math.max(28, Math.min(35, temp + (Math.random() - 0.5) * 0.5));
    hum = Math.max(55, Math.min(72, hum + (Math.random() - 0.5) * 1));
    sensor_readings.push({
      id: currentId++, timestamp: ts, gas_level: Math.round(gas),
      temperature: parseFloat(temp.toFixed(1)), humidity: parseFloat(hum.toFixed(1)),
      flame_status: 0, ai_status: 'Normal', risk_score: 5
    });
  }
  addEvent('System started in simulation mode (JSON DB)', 'NORMAL');
})();

// Simulation loop — only runs if no real ESP32 data has arrived in the last 30 seconds
setInterval(() => {
  const timeSinceRealData = Date.now() - lastRealDataTime;
  if (simulationMode || timeSinceRealData > REAL_DATA_TIMEOUT_MS) {
    // If we previously had real data but it timed out, log it once
    if (!simulationMode && timeSinceRealData > REAL_DATA_TIMEOUT_MS) {
      simulationMode = true;
      addEvent('ESP32 disconnected — switching back to simulation mode', 'WARNING');
      console.log('⚠️  No real data for 30s. Resuming simulation mode.');
    }
    saveReading(generateSimulatedReading());
  }
}, 5000);

// API ROUTES
app.post('/api/sensor-data', (req, res) => {
  const { timestamp, gas_level, temperature, humidity, flame_status } = req.body;

  // Validate incoming data
  if (gas_level === undefined || temperature === undefined || flame_status === undefined) {
    return res.status(400).json({ success: false, error: 'Missing sensor fields' });
  }

  let ai_status = 'Normal', risk_score = 5;
  if (flame_status === 1 && gas_level > 700) { ai_status = 'Critical'; risk_score = 95; }
  else if (flame_status === 1 || (gas_level > 600 && temperature > 40)) { ai_status = 'Fire Risk'; risk_score = 82; }
  else if (gas_level > 450) { ai_status = 'Gas Warning'; risk_score = 45; }

  // Mark real data received — this STOPS the simulation
  if (simulationMode) {
    simulationMode = false;
    addEvent('ESP32 connected — live sensor data active', 'NORMAL');
    console.log('✅ Real ESP32 data received! Simulation mode disabled.');
  }
  lastRealDataTime = Date.now();

  const finalTimestamp = timestamp || new Date().toISOString();

  saveReading({
    id: currentId++, timestamp: finalTimestamp,
    gas_level, temperature, humidity, flame_status, ai_status, risk_score
  });

  // Asynchronously insert into Supabase
  if (supabase) {
    supabase.from('sensor_readings').insert([{
      gas_level,
      temperature,
      humidity,
      flame_status,
      hazard_state: ai_status,
      risk_score
    }]).then(({ error }) => {
      if (error) console.error('Supabase insertion error:', error);
    }).catch(err => {
      console.error('Supabase insertion catch error:', err);
    });
  }

  res.json({ success: true, ai_status, risk_score });
});

app.get('/api/latest', (req, res) => {
  res.json(sensor_readings.length ? sensor_readings[sensor_readings.length - 1] : null);
});

app.get(['/api/history', '/api/historical'], async (req, res) => {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('sensor_readings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return res.json(data);
    } catch (err) {
      console.error('Supabase fetch error, falling back to in-memory store:', err);
    }
  }

  const { hours = 1, limit = 200 } = req.query;
  const since = new Date(Date.now() - parseFloat(hours) * 3600000).toISOString();
  const rows = sensor_readings.filter(r => r.timestamp >= since).slice(-limit).reverse();
  res.json(rows);
});

app.get('/api/history/all', (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  let rows = [...sensor_readings].reverse();
  if (status && status !== 'all') rows = rows.filter(r => r.ai_status === status);
  const total = rows.length;
  rows = rows.slice((page - 1) * limit, page * limit);
  res.json({ rows, total, page: parseInt(page), limit: parseInt(limit) });
});

app.get('/api/events', (req, res) => res.json([...events].reverse().slice(0, 20)));

app.get('/api/prediction', (req, res) => {
  const rows = [...sensor_readings].reverse().slice(0, 20);
  if (rows.length < 3) return res.json({ current: {}, predicted: {}, trend: {} });

  const lr = (arr) => {
    const n = arr.length, x = Array.from({ length: n }, (_, i) => i);
    const sumX = x.reduce((a, b) => a + b, 0), sumY = arr.reduce((a, b) => a + b, 0);
    const slope = (n * x.reduce((acc, xi, i) => acc + xi * arr[i], 0) - sumX * sumY) / (n * x.reduce((a, xi) => a + xi * xi, 0) - sumX * sumX);
    return { slope, pred: slope * n + (sumY - slope * sumX) / n };
  };

  const gasReg = lr(rows.map(r => r.gas_level).reverse());
  const tempReg = lr(rows.map(r => r.temperature).reverse());
  const humReg = lr(rows.map(r => r.humidity).reverse());
  const riskReg = lr(rows.map(r => r.risk_score).reverse());
  const latest = rows[0];

  res.json({
    current: { gas: latest.gas_level, temperature: latest.temperature, humidity: latest.humidity, risk_score: latest.risk_score },
    predicted: {
      gas: Math.max(0, Math.round(gasReg.pred)),
      temperature: parseFloat(Math.max(0, tempReg.pred).toFixed(1)),
      humidity: parseFloat(Math.max(0, Math.min(100, humReg.pred)).toFixed(1)),
      risk_score: parseFloat(Math.max(0, Math.min(100, riskReg.pred)).toFixed(1))
    },
    trend: {
      gas: gasReg.slope > 0.5 ? 'Increasing' : gasReg.slope < -0.5 ? 'Decreasing' : 'Stable',
      temperature: tempReg.slope > 0.02 ? 'Increasing' : tempReg.slope < -0.02 ? 'Decreasing' : 'Stable',
      humidity: humReg.slope > 0.05 ? 'Increasing' : humReg.slope < -0.05 ? 'Decreasing' : 'Stable',
      risk_score: riskReg.slope > 0.1 ? 'Increasing' : riskReg.slope < -0.1 ? 'Decreasing' : 'Stable'
    }
  });
});

app.get('/api/model-status', (req, res) => {
  const modelPath = path.join(__dirname, '..', 'models', 'model_results.json');
  if (fs.existsSync(modelPath)) return res.json({ ...JSON.parse(fs.readFileSync(modelPath, 'utf8')), model_loaded: true });
  res.json({ model_loaded: false, model_name: 'Decision Tree Classifier', accuracy: null, classes: ['Normal', 'Gas Warning', 'Fire Risk', 'Critical'] });
});

app.get('/api/simulation-status', (req, res) => res.json({ simulation_mode: simulationMode, scenario: simulationScenario }));

app.post('/api/simulation', (req, res) => {
  const { scenario, enabled } = req.body;
  if (enabled !== undefined) simulationMode = enabled;
  if (scenario && SCENARIOS[scenario]) {
    simulationScenario = scenario;
    lastValues = { gas: SCENARIOS[scenario].gas.min, temperature: SCENARIOS[scenario].temperature.min, humidity: SCENARIOS[scenario].humidity.min, flame: SCENARIOS[scenario].flame };
    addEvent(`Scenario changed to: ${scenario.replace('_', ' ').toUpperCase()}`, scenario === 'normal' ? 'NORMAL' : 'WARNING');
  }
  res.json({ success: true });
});

app.get('/api/chart-data', (req, res) => {
  const since = new Date(Date.now() - parseFloat(req.query.hours || 1) * 3600000).toISOString();
  const rows = sensor_readings.filter(r => r.timestamp >= since);
  res.json(rows.map(r => ({
    time: new Date(r.timestamp).toLocaleTimeString('en-US', { hour12: false }),
    gas: r.gas_level, temperature: r.temperature, humidity: r.humidity, risk_score: r.risk_score,
    gasPredicted: r.gas_level + 2, tempPredicted: r.temperature + 0.2, humPredicted: r.humidity - 0.5, riskPredicted: r.risk_score + 1
  })));
});

app.get('/', (req, res) => {
  res.send(`
    <html>
      <body style="font-family: system-ui, sans-serif; padding: 2rem; background: #0f172a; color: #f8fafc;">
        <h2>Backend API is Running successfully 🚀</h2>
        <p>You are looking at the backend API server. The UI is not hosted here.</p>
        <p>To view the dashboard, please open the <b>frontend</b> application.</p>
        <div style="background: #1e293b; padding: 1rem; border-radius: 0.5rem; margin-top: 1rem; border: 1px solid #334155;">
          <p style="margin: 0 0 0.5rem 0; color: #94a3b8;">Run this in a new terminal:</p>
          <code style="color: #38bdf8;">cd frontend<br/>npm run dev</code>
        </div>
      </body>
    </html>
  `);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🔥 AI Fire & Gas Monitor Backend running on http://0.0.0.0:${PORT} (Using JSON in-memory DB)`);
});
