import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios.js';
import './AiInsights.css';

export default function AiInsights() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchInsights = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/ai/insights');
      if (res.data.status === 'success') {
        setData(res.data.data);
      } else {
        throw new Error(res.data.message || 'Failed to fetch insights');
      }
    } catch (err) {
      console.error('Insights Error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load AI financial insights.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  // Determine score color
  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--on-secondary-container)'; // Green
    if (score >= 50) return 'var(--on-primary-fixed-variant)'; // Yellow/Dark gold
    return 'var(--error)'; // Red
  };

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined text-secondary" style={{ fontSize: '32px', animation: 'sparkPulse 2s infinite alternate' }}>auto_awesome</span>
            AI Financial Insights
          </h1>
          <p className="page-subtitle">Personalized financial advisory powered by Gemini 3.5 Flash.</p>
        </div>
        <div className="page-actions">
          <button 
            className="btn-primary" 
            disabled={loading} 
            onClick={fetchInsights}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <span className={`material-symbols-outlined ${loading ? 'spin' : ''}`} style={{ fontSize: '18px' }}>refresh</span>
            {loading ? 'Analyzing...' : 'Recalculate Insights'}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-warning" style={{ marginBottom: '24px' }}>
          <span className="material-symbols-outlined">error</span>
          <span>{error}</span>
        </div>
      )}

      {loading && !data && (
        <div className="loading-advisor">
          <div className="advisor-spinner"></div>
          <p>Gemini is studying your spending patterns and budgets...</p>
        </div>
      )}

      {data && (
        <div className="insights-container animate-fade-in">
          {/* Top Row: Score & Overview */}
          <div className="insights-header-card">
            <div className="score-column">
              <div 
                className="score-circle-wrapper"
                style={{ '--score-color': getScoreColor(data.financialHealthScore) }}
              >
                <div className="score-circle">
                  <span className="score-number">{data.financialHealthScore}</span>
                  <span className="score-label">Health Score</span>
                </div>
              </div>
            </div>
            <div className="score-summary">
              <h2 className="summary-heading">Financial Health Overview</h2>
              <p className="summary-text">
                Your score of <strong>{data.financialHealthScore}/100</strong> represents your current budgeting discipline and category spending efficiency. 
                {data.financialHealthScore >= 80 
                  ? " Excellent work! You are keeping up with your budgets and building stable financial surplus."
                  : data.financialHealthScore >= 50
                  ? " You are doing okay, but there are multiple areas where you are exceeding category thresholds or spending too fast."
                  : " Caution: Your spending patterns show significant budget overflows. Check the recommendations below to recover your financial balance."}
              </p>
            </div>
          </div>

          <div className="insights-grid-layout">
            {/* Left side: Detailed observations */}
            <div className="observations-column">
              <h3 className="section-title">AI Observations</h3>
              <div className="observations-list">
                {data.insights && data.insights.length > 0 ? (
                  data.insights.map((ins, idx) => (
                    <div 
                      key={idx} 
                      className={`observation-card ${ins.type || 'info'}`}
                    >
                      <div className="observation-icon">
                        <span className="material-symbols-outlined">
                          {ins.type === 'warning' ? 'warning' : ins.type === 'success' ? 'check_circle' : 'info'}
                        </span>
                      </div>
                      <div className="observation-content">
                        <div className="observation-header">
                          <span className="observation-category">{ins.category}</span>
                          <h4 className="observation-title">{ins.title}</h4>
                        </div>
                        <p className="observation-desc">{ins.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="empty-state">No detailed observations available at this moment.</p>
                )}
              </div>
            </div>

            {/* Right side: Actionable Recommendations */}
            <div className="recommendations-column">
              <h3 className="section-title">Action Plan</h3>
              <div className="recommendations-list">
                {data.recommendations && data.recommendations.length > 0 ? (
                  data.recommendations.map((rec, idx) => (
                    <div key={idx} className="recommendation-card">
                      <div className="rec-number">#{idx + 1}</div>
                      <div className="rec-content">
                        <h4 className="rec-title">{rec.title}</h4>
                        <p className="rec-desc">{rec.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="empty-state">No recommendations provided yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
