import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Sprout, 
  Droplets, 
  Thermometer, 
  Wind, 
  Map as MapIcon, 
  BarChart3, 
  Info,
  ChevronRight,
  RefreshCw,
  Search
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';

// Fix Leaflet icon issue
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const App = () => {
  const [formData, setFormData] = useState({
    N: 90,
    P: 42,
    K: 43,
    temperature: 20.8,
    humidity: 82.0,
    ph: 6.5,
    rainfall: 202.9
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('predict');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: parseFloat(e.target.value) });
  };

  const getPrediction = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('http://localhost:5000/predict', formData);
      setPrediction(response.data);
    } catch (err) {
      setError("Backend server not responding. Ensure Flask is running.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const featureData = prediction ? Object.entries(prediction.feature_importance).map(([name, value]) => ({
    name,
    value: value * 100
  })).sort((a, b) => b.value - a.value) : [];

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

  return (
    <div className="app-container">
      <header>
        <div className="logo">
          <Sprout size={32} color="#10b981" />
          <span>AgriPredict AI</span>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => window.location.reload()}>
            <RefreshCw size={18} />
          </button>
        </div>
      </header>

      <main className="dashboard-grid">
        {/* Left Column: Input Form */}
        <section className="glass-card animate-fade-in">
          <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Droplets size={24} color="#3b82f6" />
            Soil & Environment
          </h2>
          
          <div className="input-grid">
            <div className="input-group">
              <label>Nitrogen (N)</label>
              <input type="number" name="N" value={formData.N} onChange={handleInputChange} />
            </div>
            <div className="input-group">
              <label>Phosphorus (P)</label>
              <input type="number" name="P" value={formData.P} onChange={handleInputChange} />
            </div>
            <div className="input-group">
              <label>Potassium (K)</label>
              <input type="number" name="K" value={formData.K} onChange={handleInputChange} />
            </div>
            <div className="input-group">
              <label>Temperature (°C)</label>
              <input type="number" name="temperature" value={formData.temperature} onChange={handleInputChange} />
            </div>
            <div className="input-group">
              <label>Humidity (%)</label>
              <input type="number" name="humidity" value={formData.humidity} onChange={handleInputChange} />
            </div>
            <div className="input-group">
              <label>Soil pH</label>
              <input type="number" step="0.1" name="ph" value={formData.ph} onChange={handleInputChange} />
            </div>
            <div className="input-group">
              <label>Rainfall (mm)</label>
              <input type="number" name="rainfall" value={formData.rainfall} onChange={handleInputChange} />
            </div>
          </div>

          <button className="btn-primary" onClick={getPrediction} disabled={loading}>
            {loading ? <RefreshCw className="animate-spin" /> : <Search size={20} />}
            Generate Recommendation
          </button>
          
          {error && <p style={{ color: '#ef4444', marginTop: '1rem', fontSize: '0.875rem' }}>{error}</p>}
        </section>

        {/* Right Column: Results & XAI */}
        <section className="results-column">
          <AnimatePresence mode="wait">
            {!prediction ? (
              <motion.div 
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-card"
                style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}
              >
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '2rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
                  <Sprout size={64} color="#10b981" />
                </div>
                <h3>Ready to Analyze</h3>
                <p style={{ color: '#94a3b8', maxWidth: '300px', marginTop: '0.5rem' }}>
                  Enter your soil and weather parameters to get AI-powered crop recommendations.
                </p>
              </motion.div>
            ) : (
              <motion.div 
                key="results"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="results-container"
                style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
              >
                {/* Main Prediction Card */}
                <div className="glass-card prediction-result">
                  <span className="crop-badge">🌾</span>
                  <p style={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem', fontWeight: 600 }}>Recommended Crop</p>
                  <h1 className="crop-name">{prediction.recommendation}</h1>
                  
                  <div className="confidence-container" style={{ maxWidth: '400px', margin: '0 auto' }}>
                    <div className="confidence-bar">
                      <div 
                        className="confidence-fill" 
                        style={{ width: `${prediction.top_recommendations[0].probability * 100}%` }}
                      ></div>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                      Confidence Score: {(prediction.top_recommendations[0].probability * 100).toFixed(1)}%
                    </p>
                  </div>

                  <div className="stat-grid">
                    <div className="stat-card">
                      <div className="stat-value">{formData.temperature}°C</div>
                      <div className="stat-label">Climate</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{formData.ph}</div>
                      <div className="stat-label">Soil pH</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{formData.rainfall}mm</div>
                      <div className="stat-label">Water</div>
                    </div>
                  </div>
                </div>

                {/* XAI: Why this crop? */}
                <div className="glass-card">
                  <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <BarChart3 size={20} color="#f59e0b" />
                    Explainable AI Insights
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                    The model prioritized the following features for this recommendation:
                  </p>
                  
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={featureData} layout="vertical" margin={{ left: 20, right: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          stroke="#94a3b8" 
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip 
                          contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                          itemStyle={{ color: '#10b981' }}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                          {featureData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Regional Map */}
                <div className="glass-card">
                  <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapIcon size={20} color="#8b5cf6" />
                    Regional Suitability Map
                  </h3>
                  <div className="map-container">
                    <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%' }}>
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      <Circle 
                        center={[20.5937, 78.9629]} 
                        pathOptions={{ color: '#10b981', fillOpacity: 0.3 }}
                        radius={200000}
                      >
                        <Popup>
                          Ideal region for {prediction.recommendation} cultivation.
                        </Popup>
                      </Circle>
                    </MapContainer>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      <footer style={{ marginTop: '4rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem', paddingBottom: '2rem' }}>
        <p>&copy; 2026 AgriPredict AI - Smart Agriculture Intelligence System</p>
        <p style={{ marginTop: '0.5rem' }}>Built for the "Strong Combo Task" Challenge</p>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .input-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        @media (max-width: 640px) {
          .input-grid { grid-template-columns: 1fr; }
        }
        .btn-secondary {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border);
          color: white;
          padding: 0.5rem;
          border-radius: 0.5rem;
          cursor: pointer;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
};

export default App;
