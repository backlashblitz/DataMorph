import React, { useState } from 'react';
import { 
  BarChart2, 
  CheckCircle, 
  AlertTriangle, 
  Layers, 
  Database, 
  TrendingUp, 
  Search, 
  ShieldCheck,
  Zap
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function TabularReportView({ data }) {
  const [activeTab, setActiveTab] = useState('cleaned'); // 'cleaned' | 'raw' | 'schema'
  const [searchTerm, setSearchTerm] = useState('');

  const { before_stats, after_stats, actions_taken, raw_sample, clean_sample } = data;

  const rowsDiff = before_stats.total_rows - after_stats.total_rows;
  const missingFixed = before_stats.total_missing - after_stats.total_missing;
  const qualityGain = (after_stats.quality_score - before_stats.quality_score).toFixed(1);

  // Chart 1 Data: Key Metrics Comparison
  const comparisonChartData = {
    labels: ['Total Rows', 'Missing Cells', 'Duplicates'],
    datasets: [
      {
        label: 'Original Raw Data',
        data: [before_stats.total_rows, before_stats.total_missing, before_stats.total_duplicates],
        backgroundColor: '#EF4444',
        borderRadius: 6,
      },
      {
        label: 'Cleaned Data',
        data: [after_stats.total_rows, after_stats.total_missing, after_stats.total_duplicates],
        backgroundColor: '#10B981',
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#CBD5E1', font: { size: 11, family: 'Plus Jakarta Sans' } }
      },
      tooltip: {
        backgroundColor: '#0F172A',
        titleColor: '#F8FAFC',
        bodyColor: '#CBD5E1',
        borderColor: '#334155',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        ticks: { color: '#94A3B8' },
        grid: { color: 'rgba(255, 255, 255, 0.05)' }
      },
      y: {
        ticks: { color: '#94A3B8' },
        grid: { color: 'rgba(255, 255, 255, 0.05)' }
      }
    }
  };

  // Filter columns & rows for table preview
  const currentSample = activeTab === 'raw' ? raw_sample : clean_sample;
  const tableColumns = currentSample && currentSample.length > 0 ? Object.keys(currentSample[0]) : [];

  const filteredSample = (currentSample || []).filter(row => {
    if (!searchTerm) return true;
    return Object.values(row).some(v => 
      String(v).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* 1. Executive KPI Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem'
      }}>
        {/* Card 1: Rows */}
        <div className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '600' }}>TOTAL ROWS</span>
            <Database size={18} color="#60A5FA" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#F8FAFC' }}>
            {after_stats.total_rows.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: rowsDiff > 0 ? '#F87171' : '#34D399', marginTop: '4px', fontWeight: '600' }}>
            {rowsDiff > 0 ? `-${rowsDiff} duplicate rows removed` : 'All rows preserved'}
          </div>
        </div>

        {/* Card 2: Missing Values */}
        <div className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '600' }}>MISSING VALUES</span>
            <CheckCircle size={18} color="#34D399" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#10B981' }}>
            {after_stats.total_missing} <span style={{ fontSize: '0.9rem', color: '#94A3B8', fontWeight: '500' }}>({after_stats.missing_pct}%)</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#34D399', marginTop: '4px', fontWeight: '600' }}>
            {missingFixed > 0 ? `+${missingFixed} missing cells resolved` : 'No missing data'}
          </div>
        </div>

        {/* Card 3: Duplicates */}
        <div className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '600' }}>DUPLICATES</span>
            <Layers size={18} color="#A78BFA" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#F8FAFC' }}>
            {after_stats.total_duplicates}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#34D399', marginTop: '4px', fontWeight: '600' }}>
            100% deduplicated
          </div>
        </div>

        {/* Card 4: Quality Score */}
        <div className="glass-card" style={{
          padding: '1.25rem 1.5rem',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(16, 185, 129, 0.1))',
          border: '1px solid rgba(99, 102, 241, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#CBD5E1', fontWeight: '600' }}>QUALITY SCORE</span>
            <ShieldCheck size={18} color="#34D399" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#34D399' }}>
            {after_stats.quality_score}%
          </div>
          <div style={{ fontSize: '0.75rem', color: '#818CF8', marginTop: '4px', fontWeight: '600' }}>
            +{qualityGain}% improvement over raw data
          </div>
        </div>
      </div>

      {/* 2. Visual Comparison Chart */}
      <div className="glass-card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#F8FAFC' }}>
              Dataset Health Comparison (Before vs After)
            </h4>
            <p style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
              Side-by-side metric comparison verifying row deduplication and missing value resolution
            </p>
          </div>
          <span className="badge badge-indigo">Real-time Profiling</span>
        </div>

        <div style={{ height: '260px' }}>
          <Bar data={comparisonChartData} options={chartOptions} />
        </div>
      </div>

      {/* 3. Actions & Cleaning Pipeline Log */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
          <Zap size={18} color="#FBBF24" />
          <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#F8FAFC' }}>
            Automated Actions & Transformations Applied
          </h4>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {actions_taken && actions_taken.length > 0 ? (
            actions_taken.map((action, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.65rem 0.9rem',
                  background: 'rgba(30, 41, 59, 0.6)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  fontSize: '0.825rem',
                  color: '#E2E8F0'
                }}
              >
                <CheckCircle size={15} color="#34D399" />
                <span>{action}</span>
              </div>
            ))
          ) : (
            <div style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Standard cleaning completed.</div>
          )}
        </div>
      </div>

      {/* 4. Interactive Data Table Preview */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.25rem'
        }}>
          {/* Tabs */}
          <div style={{
            display: 'flex',
            background: 'rgba(15, 23, 42, 0.9)',
            padding: '3px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <button
              onClick={() => setActiveTab('cleaned')}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '7px',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: 'pointer',
                border: 'none',
                background: activeTab === 'cleaned' ? '#10B981' : 'transparent',
                color: activeTab === 'cleaned' ? '#FFFFFF' : '#94A3B8'
              }}
            >
              Cleaned Data Sample
            </button>
            <button
              onClick={() => setActiveTab('raw')}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '7px',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: 'pointer',
                border: 'none',
                background: activeTab === 'raw' ? '#EF4444' : 'transparent',
                color: activeTab === 'raw' ? '#FFFFFF' : '#94A3B8'
              }}
            >
              Original Raw Data
            </button>
            <button
              onClick={() => setActiveTab('schema')}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '7px',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: 'pointer',
                border: 'none',
                background: activeTab === 'schema' ? '#6366F1' : 'transparent',
                color: activeTab === 'schema' ? '#FFFFFF' : '#94A3B8'
              }}
            >
              Column Schema Breakdown
            </button>
          </div>

          {/* Search Bar */}
          {activeTab !== 'schema' && (
            <div style={{ position: 'relative', width: '240px' }}>
              <Search size={14} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '10px' }} />
              <input
                type="text"
                placeholder="Search rows..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '0.45rem 0.65rem 0.45rem 2rem',
                  color: '#F8FAFC',
                  fontSize: '0.8rem'
                }}
              />
            </div>
          )}
        </div>

        {/* Table View */}
        {activeTab === 'schema' ? (
          <div className="custom-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Column Name</th>
                  <th>Inferred Dtype</th>
                  <th>Missing Count</th>
                  <th>Missing %</th>
                  <th>Unique Values</th>
                  <th>Outliers Treated</th>
                  <th>Sample Values</th>
                </tr>
              </thead>
              <tbody>
                {after_stats.columns_info?.map((col, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: '700', color: '#818CF8' }}>{col.name}</td>
                    <td><span className="badge badge-indigo">{col.dtype}</span></td>
                    <td style={{ color: col.missing_count > 0 ? '#F87171' : '#34D399' }}>{col.missing_count}</td>
                    <td>{col.missing_pct}%</td>
                    <td>{col.unique_count}</td>
                    <td>{col.outliers_count}</td>
                    <td style={{ color: '#94A3B8' }}>{col.sample_values.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="custom-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>#</th>
                  {tableColumns.map((col, idx) => (
                    <th key={idx}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredSample.map((row, rIdx) => (
                  <tr key={rIdx}>
                    <td style={{ color: '#64748B', fontWeight: 'bold' }}>{rIdx + 1}</td>
                    {tableColumns.map((col, cIdx) => (
                      <td key={cIdx}>
                        {row[col] === null || row[col] === undefined ? (
                          <span style={{ color: '#EF4444', fontStyle: 'italic' }}>null</span>
                        ) : (
                          String(row[col])
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
