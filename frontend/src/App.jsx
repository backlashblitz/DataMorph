import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import Navbar from './components/Navbar';
import SampleDataPicker, { SAMPLE_DATASETS } from './components/SampleDataPicker';
import FileUploadZone from './components/FileUploadZone';
import ConfigPanel from './components/ConfigPanel';
import ProcessingOverlay from './components/ProcessingOverlay';
import DownloadCenter from './components/DownloadCenter';
import TabularReportView from './components/TabularReportView';
import TextualReportView from './components/TextualReportView';
import { Sparkles, AlertCircle, ArrowLeft, ShieldCheck, Zap, BarChart, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'app'
  const [activeMode, setActiveMode] = useState('tabular'); // 'tabular' | 'textual'
  const [selectedFile, setSelectedFile] = useState(null);
  const [folderFiles, setFolderFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionResult, setSessionResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Configuration options
  const [tabularOptions, setTabularOptions] = useState({
    remove_duplicates: true,
    standardize_column_names: true,
    trim_whitespace: true,
    smart_type_inference: true,
    impute_missing: true,
    impute_numeric_strategy: "median",
    impute_categorical_strategy: "mode",
    handle_outliers: "clip",
    drop_empty_threshold: 0.95
  });

  const [textualOptions, setTextualOptions] = useState({
    strip_html: true,
    strip_urls: true,
    strip_emails: false,
    normalize_unicode: true,
    remove_control_chars: true,
    collapse_whitespace: true,
    lowercase: false
  });

  const handleReset = () => {
    setSelectedFile(null);
    setFolderFiles([]);
    setSessionResult(null);
    setErrorMessage(null);
  };

  const handleSelectSample = (sample) => {
    setErrorMessage(null);
    if (sample === SAMPLE_DATASETS.textual_sample) {
      // Create a virtual multi-file or zip test payload
      const mockFiles = [
        new File(["Great customer support! <b>Fast delivery</b>. Check https://store.com/order"], "reviews/positive/review_1.txt", { type: "text/plain" }),
        new File(["Great customer support! <b>Fast delivery</b>. Check https://store.com/order"], "reviews/positive/review_2.txt", { type: "text/plain" }), // Duplicate
        new File(["   \n\n\t   "], "reviews/positive/blank.txt", { type: "text/plain" }), // Empty
        new File(["Product arrived broken. Terrible quality! Contact support@vendor.com immediately."], "reviews/negative/complaint.txt", { type: "text/plain" }),
        new File(["Standard delivery time, package in okay shape."], "reviews/neutral/feedback.txt", { type: "text/plain" })
      ];
      setFolderFiles(mockFiles);
      setSelectedFile(null);
    } else {
      const blob = new Blob([sample.content], { type: sample.type });
      const file = new File([blob], sample.name, { type: sample.type });
      setSelectedFile(file);
      setFolderFiles([]);
    }
  };

  const handleCleanSubmit = async () => {
    setErrorMessage(null);
    setIsProcessing(true);

    try {
      const formData = new FormData();

      if (activeMode === 'tabular') {
        if (!selectedFile) {
          throw new Error("Please select or drop a dataset file first.");
        }
        formData.append('file', selectedFile);
        formData.append('options', JSON.stringify(tabularOptions));

        const res = await fetch('/api/clean-tabular', {
          method: 'POST',
          body: formData
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({ detail: 'Failed to process dataset' }));
          throw new Error(errData.detail || 'Failed to clean tabular dataset');
        }

        const data = await res.json();
        setSessionResult(data);
      } else {
        // Textual Mode
        if (selectedFile) {
          formData.append('file', selectedFile);
        } else if (folderFiles.length > 0) {
          // If individual folder files, create a zip on the fly in browser or read text contents
          const filePayload = [];
          for (const f of folderFiles) {
            const text = await f.text();
            filePayload.push({
              name: f.name,
              path: f.webkitRelativePath || f.name,
              category: (f.webkitRelativePath ? f.webkitRelativePath.split('/')[1] : null) || 'general',
              content: text
            });
          }
          const blob = new Blob([JSON.stringify(filePayload)], { type: 'application/json' });
          formData.append('file', new File([blob], "folder_batch.json", { type: 'application/json' }));
        } else {
          throw new Error("Please upload a .zip archive or select a folder tree.");
        }

        formData.append('options', JSON.stringify(textualOptions));

        const res = await fetch('/api/clean-textual-archive', {
          method: 'POST',
          body: formData
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({ detail: 'Failed to process text corpus' }));
          throw new Error(errData.detail || 'Failed to clean text corpus');
        }

        const data = await res.json();
        setSessionResult(data);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'An unexpected error occurred during processing.');
    } finally {
      setIsProcessing(false);
    }
  };

  // If on landing view, render the modern SaaS Landing Page
  if (currentView === 'landing') {
    return <LandingPage onStartTransforming={() => setCurrentView('app')} />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        activeMode={activeMode}
        setActiveMode={(m) => { setActiveMode(m); handleReset(); }}
        onReset={handleReset}
        onGoHome={() => setCurrentView('landing')}
      />

      {isProcessing && <ProcessingOverlay />}

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem', width: '100%', flex: 1 }}>

        {/* Top Hero Heading */}
        {!sessionResult && (
          <div style={{ textAlign: 'center', margin: '1rem auto 2.5rem', maxWidth: '820px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.9rem',
              borderRadius: '9999px',
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              color: '#818CF8',
              fontSize: '0.8rem',
              fontWeight: '700',
              marginBottom: '1rem',
              letterSpacing: '0.04em'
            }}>
              <Sparkles size={15} /> NEXT-GEN DATA SANITIZATION ENGINE
            </div>
            <h1 style={{
              fontSize: '2.75rem',
              fontWeight: '800',
              lineHeight: 1.15,
              background: 'linear-gradient(135deg, #FFFFFF 30%, #CBD5E1 70%, #818CF8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '1rem'
            }}>
              Turn Unstructured Datasets Into Production-Grade Data
            </h1>
            <p style={{ fontSize: '1.05rem', color: '#94A3B8', lineHeight: 1.5 }}>
              Automatically detect schema abnormalities, missing values, duplicates, outliers, and nested hierarchies.
              Get instantaneous clean datasets and executive visual audit PDF reports.
            </p>

            <SampleDataPicker
              activeMode={activeMode}
              onSelectSample={handleSelectSample}
            />
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div style={{
            padding: '1rem 1.25rem',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '12px',
            color: '#FCA5A5',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.5rem',
            fontSize: '0.9rem'
          }}>
            <AlertCircle size={20} color="#EF4444" />
            <span><b>Error:</b> {errorMessage}</span>
          </div>
        )}

        {/* Upload & Config Area */}
        {!sessionResult && (
          <>
            <FileUploadZone
              activeMode={activeMode}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              folderFiles={folderFiles}
              setFolderFiles={setFolderFiles}
              onCleanSubmit={handleCleanSubmit}
              isProcessing={isProcessing}
            />

            <ConfigPanel
              activeMode={activeMode}
              options={activeMode === 'tabular' ? tabularOptions : textualOptions}
              setOptions={activeMode === 'tabular' ? setTabularOptions : setTextualOptions}
            />
          </>
        )}

        {/* Cleaned Result View */}
        {sessionResult && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Top Back Nav */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button
                onClick={handleReset}
                className="btn-secondary"
                style={{ fontSize: '0.85rem' }}
              >
                <ArrowLeft size={16} /> Clean Another Dataset
              </button>
            </div>

            {/* Download Action Bar */}
            <DownloadCenter sessionData={sessionResult} />

            {/* Mode-specific Report Body */}
            {sessionResult.mode === 'tabular' ? (
              <TabularReportView data={sessionResult} />
            ) : (
              <TextualReportView data={sessionResult} />
            )}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        padding: '1.5rem 2rem',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: '#64748B',
        marginTop: '3rem'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <b>DataMorph</b> &copy; 2026. Enterprise-Grade Automated Data Handling & Cleaning System.
          </div>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <span>Auto Profiling</span>
            <span>&bull;</span>
            <span>Nested JSON Flattening</span>
            <span>&bull;</span>
            <span>Multi-Folder NLP Crawler</span>
            <span>&bull;</span>
            <span>Executive PDF Export</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
