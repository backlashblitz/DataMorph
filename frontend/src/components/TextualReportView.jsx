import React, { useState } from 'react';
import { 
  FolderTree, 
  FileText, 
  Sparkles, 
  CheckCircle, 
  Trash2, 
  Copy, 
  Layers, 
  Zap,
  Search
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

export default function TextualReportView({ data }) {
  const [activeTab, setActiveTab] = useState('cleaned');
  const [searchTerm, setSearchTerm] = useState('');

  const { metrics, actions_taken, clean_sample } = data;

  const categoryLabels = Object.keys(metrics.category_counts_after || {});
  const categoryCounts = Object.values(metrics.category_counts_after || {});

  const catChartData = {
    labels: categoryLabels.length > 0 ? categoryLabels : ['Default'],
    datasets: [
      {
        label: 'Documents per Category',
        data: categoryCounts.length > 0 ? categoryCounts : [metrics.total_files_after],
        backgroundColor: '#8B5CF6',
        borderRadius: 6,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#CBD5E1', font: { size: 11, family: 'Plus Jakarta Sans' } }
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

  const filteredDocs = (clean_sample || []).filter(doc => {
    if (!searchTerm) return true;
    return (
      doc.file_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.cleaned_text?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* 1. Executive Corpus KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem'
      }}>
        {/* Card 1: Valid Docs */}
        <div className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '600' }}>CLEANED DOCUMENTS</span>
            <FileText size={18} color="#818CF8" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#F8FAFC' }}>
            {metrics.total_files_after.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#34D399', marginTop: '4px', fontWeight: '600' }}>
            Across {metrics.total_categories} subfolder categories
          </div>
        </div>

        {/* Card 2: Noise Reduction */}
        <div className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '600' }}>NOISE ELIMINATED</span>
            <Sparkles size={18} color="#C084FC" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#A855F7' }}>
            {metrics.corpus_noise_reduction_pct}%
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '4px' }}>
            {metrics.total_raw_words.toLocaleString()} raw &rarr; {metrics.total_cleaned_words.toLocaleString()} tokens
          </div>
        </div>

        {/* Card 3: Duplicates & Empty Files Removed */}
        <div className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '600' }}>JUNK REMOVED</span>
            <Trash2 size={18} color="#F87171" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#EF4444' }}>
            {metrics.empty_files_removed + metrics.duplicate_files_removed}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '4px' }}>
            {metrics.empty_files_removed} empty &bull; {metrics.duplicate_files_removed} duplicate docs
          </div>
        </div>

        {/* Card 4: Corpus Quality Score */}
        <div className="glass-card" style={{
          padding: '1.25rem 1.5rem',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(16, 185, 129, 0.1))',
          border: '1px solid rgba(139, 92, 246, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#CBD5E1', fontWeight: '600' }}>CORPUS HEALTH</span>
            <CheckCircle size={18} color="#34D399" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#34D399' }}>
            {metrics.quality_score}%
          </div>
          <div style={{ fontSize: '0.75rem', color: '#C084FC', marginTop: '4px', fontWeight: '600' }}>
            NLP & AI Fine-Tuning Ready
          </div>
        </div>
      </div>

      {/* 2. Category Balance Chart */}
      <div className="glass-card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#F8FAFC' }}>
              Subfolder Category Distribution
            </h4>
            <p style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
              Document volume breakdown across detected folder labels
            </p>
          </div>
          <span className="badge badge-indigo">Hierarchy Crawler</span>
        </div>

        <div style={{ height: '240px' }}>
          <Bar data={catChartData} options={chartOptions} />
        </div>
      </div>

      {/* 3. Actions Log */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
          <Zap size={18} color="#FBBF24" />
          <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#F8FAFC' }}>
            Corpus Pipeline Execution Log
          </h4>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {actions_taken?.map((action, idx) => (
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
          ))}
        </div>
      </div>

      {/* 4. Cleaned Documents Preview */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.25rem'
        }}>
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#F8FAFC' }}>
              Sanitized Text Documents Sample
            </h4>
            <p style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
              Preview of cleaned documents formatted for NLP training
            </p>
          </div>

          <div style={{ position: 'relative', width: '240px' }}>
            <Search size={14} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            <input
              type="text"
              placeholder="Search documents..."
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
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredDocs.map((doc, idx) => (
            <div
              key={idx}
              style={{
                padding: '1rem 1.25rem',
                background: 'rgba(15, 23, 42, 0.7)',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.06)'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.5rem',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="badge badge-indigo">{doc.category}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#F8FAFC', fontFamily: 'monospace' }}>
                    {doc.file_path}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                  Words: {doc.raw_word_count} &rarr; <span style={{ color: '#34D399', fontWeight: 'bold' }}>{doc.cleaned_word_count}</span>
                  &nbsp;({doc.compression_ratio}% noise trimmed)
                </div>
              </div>

              <div style={{
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '0.75rem 1rem',
                borderRadius: '6px',
                fontSize: '0.82rem',
                color: '#CBD5E1',
                lineHeight: '1.45',
                fontFamily: 'var(--font-mono)'
              }}>
                {doc.cleaned_text}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
