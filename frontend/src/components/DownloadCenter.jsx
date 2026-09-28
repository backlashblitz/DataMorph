import React from 'react';
import { Download, FileText, FileSpreadsheet, FileCode, Archive, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function DownloadCenter({ sessionData }) {
  if (!sessionData) return null;

  const { session_id, mode, filename } = sessionData;

  const handleDownloadFile = (format) => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 }
    });
    window.location.href = `/api/download/data/${session_id}?format=${format}`;
  };

  const handleDownloadPDF = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.8 }
    });
    window.location.href = `/api/download/pdf/${session_id}`;
  };

  return (
    <div className="glass-card" style={{
      padding: '1.75rem 2rem',
      marginBottom: '2rem',
      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
      border: '1px solid rgba(99, 102, 241, 0.35)',
      boxShadow: '0 10px 40px -10px rgba(99, 102, 241, 0.2)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        {/* Left Info */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-emerald">Dataset Cleaned & Certified</span>
            <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{filename}</span>
          </div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#F8FAFC' }}>
            Ready for Production & Analysis
          </h3>
          <p style={{ fontSize: '0.825rem', color: '#94A3B8', marginTop: '2px' }}>
            Download the cleaned, normalized data files or the comprehensive visual PDF audit report.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* PDF Audit Report Button */}
          <button
            onClick={handleDownloadPDF}
            className="btn-primary btn-emerald"
            style={{ padding: '0.75rem 1.6rem', fontSize: '0.95rem' }}
          >
            <FileText size={18} />
            Download PDF Audit Report
          </button>

          {/* Clean Data Download Options */}
          {mode === 'tabular' ? (
            <>
              <button
                onClick={() => handleDownloadFile('csv')}
                className="btn-primary"
                style={{ padding: '0.75rem 1.25rem' }}
              >
                <FileSpreadsheet size={16} />
                Clean CSV
              </button>
              <button
                onClick={() => handleDownloadFile('json')}
                className="btn-secondary"
                style={{ padding: '0.75rem 1.1rem' }}
              >
                <FileCode size={16} />
                JSON
              </button>
              <button
                onClick={() => handleDownloadFile('xlsx')}
                className="btn-secondary"
                style={{ padding: '0.75rem 1.1rem' }}
              >
                <FileSpreadsheet size={16} color="#10B981" />
                Excel (.xlsx)
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleDownloadFile('zip')}
                className="btn-primary"
                style={{ padding: '0.75rem 1.4rem' }}
              >
                <Archive size={18} />
                Cleaned Corpus (.zip)
              </button>
              <button
                onClick={() => handleDownloadFile('csv')}
                className="btn-secondary"
                style={{ padding: '0.75rem 1.2rem' }}
              >
                <FileSpreadsheet size={16} />
                NLP Master Dataset (.csv)
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
