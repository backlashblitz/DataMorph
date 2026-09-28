import React from 'react';
import { Sparkles, Database, FolderArchive, FileText, CheckCircle2, ShieldCheck, Home, ArrowLeft } from 'lucide-react';

export default function Navbar({ activeMode, setActiveMode, onReset, onGoHome }) {
  return (
    <header style={{
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      background: 'rgba(9, 13, 22, 0.85)',
      backdropFilter: 'blur(20px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '0.85rem 2rem'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Brand */}
        <div 
          onClick={onGoHome || onReset}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
          title="Back to Landing Page"
        >
          <img
            src="/datamorph_logo.png"
            alt="DataMorph Logo"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              objectFit: 'contain',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.03em', color: '#F8FAFC' }}>
                Data<span style={{ color: '#818CF8' }}>Morph</span>
              </span>
              <span className="badge badge-indigo">Automated Engine</span>
            </div>
            <p style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '-2px' }}>
              Automated Data Profiling & Intelligent Cleaning
            </p>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div style={{
          display: 'flex',
          background: 'rgba(15, 23, 42, 0.9)',
          padding: '4px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <button
            onClick={() => setActiveMode('tabular')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1.1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer',
              border: 'none',
              transition: 'all 0.2s',
              background: activeMode === 'tabular' ? 'linear-gradient(135deg, #6366F1, #4F46E5)' : 'transparent',
              color: activeMode === 'tabular' ? '#FFFFFF' : '#94A3B8'
            }}
          >
            <Database size={16} />
            Tabular & JSON Datasets
          </button>
          <button
            onClick={() => setActiveMode('textual')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1.1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer',
              border: 'none',
              transition: 'all 0.2s',
              background: activeMode === 'textual' ? 'linear-gradient(135deg, #8B5CF6, #7C3AED)' : 'transparent',
              color: activeMode === 'textual' ? '#FFFFFF' : '#94A3B8'
            }}
          >
            <FolderArchive size={16} />
            Nested Textual Folders (NLP)
          </button>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {onGoHome && (
            <button
              onClick={onGoHome}
              className="btn-secondary"
              style={{
                fontSize: '0.8rem',
                padding: '0.4rem 0.85rem',
                borderRadius: '8px'
              }}
            >
              <Home size={14} color="#818CF8" />
              Home Page
            </button>
          )}

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.85rem',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: '9999px',
            fontSize: '0.78rem',
            color: '#34D399',
            fontWeight: '600'
          }}>
            <ShieldCheck size={15} />
            Engine Active
          </div>
        </div>
      </div>
    </header>
  );
}
