import React, { useState } from 'react';
import { Sliders, CheckSquare, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

export default function ConfigPanel({ activeMode, options, setOptions }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (key) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const updateSelect = (key, value) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="glass-card" style={{ padding: '1.25rem 1.5rem', marginBottom: '2rem' }}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          userSelect: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(99, 102, 241, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sliders size={18} color="#818CF8" />
          </div>
          <div>
            <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#F8FAFC' }}>
              Advanced Cleaning Configuration
            </span>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8', marginLeft: '0.6rem' }}>
              (Default: AI Auto-Pilot enabled)
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94A3B8' }}>
          <span style={{ fontSize: '0.78rem' }}>{isOpen ? 'Hide Options' : 'Customize Rules'}</span>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {isOpen && (
        <div style={{
          marginTop: '1.25rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem'
        }}>
          {activeMode === 'tabular' ? (
            <>
              {/* Checkbox Group */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.85rem', color: '#E2E8F0' }}>
                  <input
                    type="checkbox"
                    checked={options.remove_duplicates}
                    onChange={() => toggleOption('remove_duplicates')}
                    style={{ accentColor: '#6366F1' }}
                  />
                  <span>Remove Exact & Subset Duplicates</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.85rem', color: '#E2E8F0' }}>
                  <input
                    type="checkbox"
                    checked={options.standardize_column_names}
                    onChange={() => toggleOption('standardize_column_names')}
                    style={{ accentColor: '#6366F1' }}
                  />
                  <span>Standardize Headers (snake_case, trim)</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.85rem', color: '#E2E8F0' }}>
                  <input
                    type="checkbox"
                    checked={options.smart_type_inference}
                    onChange={() => toggleOption('smart_type_inference')}
                    style={{ accentColor: '#6366F1' }}
                  />
                  <span>Smart Type Inference (Dates & Currencies)</span>
                </label>
              </div>

              {/* Select Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                    Numeric Missing Imputation
                  </label>
                  <select
                    value={options.impute_numeric_strategy}
                    onChange={(e) => updateSelect('impute_numeric_strategy', e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#F8FAFC',
                      padding: '0.45rem 0.75rem',
                      borderRadius: '8px',
                      fontSize: '0.825rem'
                    }}
                  >
                    <option value="median">Smart Median (Robust to outliers)</option>
                    <option value="mean">Mean Average</option>
                    <option value="zero">Zero (0)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                    Outlier Handling (IQR Interquartile Range)
                  </label>
                  <select
                    value={options.handle_outliers}
                    onChange={(e) => updateSelect('handle_outliers', e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#F8FAFC',
                      padding: '0.45rem 0.75rem',
                      borderRadius: '8px',
                      fontSize: '0.825rem'
                    }}
                  >
                    <option value="clip">Cap / Clip to IQR Bounds (Recommended)</option>
                    <option value="remove">Drop Outlier Rows</option>
                    <option value="none">Keep Unchanged</option>
                  </select>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Textual Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.85rem', color: '#E2E8F0' }}>
                  <input
                    type="checkbox"
                    checked={options.strip_html}
                    onChange={() => toggleOption('strip_html')}
                    style={{ accentColor: '#8B5CF6' }}
                  />
                  <span>Strip HTML Tags & Markup</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.85rem', color: '#E2E8F0' }}>
                  <input
                    type="checkbox"
                    checked={options.strip_urls}
                    onChange={() => toggleOption('strip_urls')}
                    style={{ accentColor: '#8B5CF6' }}
                  />
                  <span>Remove URLs & Web Links</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.85rem', color: '#E2E8F0' }}>
                  <input
                    type="checkbox"
                    checked={options.normalize_unicode}
                    onChange={() => toggleOption('normalize_unicode')}
                    style={{ accentColor: '#8B5CF6' }}
                  />
                  <span>Normalize Unicode & Remove Control Chars</span>
                </label>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.85rem', color: '#E2E8F0' }}>
                  <input
                    type="checkbox"
                    checked={options.strip_emails}
                    onChange={() => toggleOption('strip_emails')}
                    style={{ accentColor: '#8B5CF6' }}
                  />
                  <span>Scrub Email Addresses (PII Redaction)</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.85rem', color: '#E2E8F0' }}>
                  <input
                    type="checkbox"
                    checked={options.lowercase}
                    onChange={() => toggleOption('lowercase')}
                    style={{ accentColor: '#8B5CF6' }}
                  />
                  <span>Convert Entire Corpus to Lowercase</span>
                </label>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
