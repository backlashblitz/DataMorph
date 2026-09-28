import React, { useState, useRef } from 'react';
import { UploadCloud, FolderUp, FileSpreadsheet, FileCode, CheckCircle, X, AlertCircle } from 'lucide-react';

export default function FileUploadZone({ 
  activeMode, 
  selectedFile, 
  setSelectedFile, 
  folderFiles, 
  setFolderFiles,
  onCleanSubmit,
  isProcessing 
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (activeMode === 'tabular') {
        setSelectedFile(e.dataTransfer.files[0]);
        setFolderFiles([]);
      } else {
        // If zip or multiple files
        if (e.dataTransfer.files.length === 1 && e.dataTransfer.files[0].name.endsWith('.zip')) {
          setSelectedFile(e.dataTransfer.files[0]);
          setFolderFiles([]);
        } else {
          // Multiple text files dropped
          setFolderFiles(Array.from(e.dataTransfer.files));
          setSelectedFile(null);
        }
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setFolderFiles([]);
    }
  };

  const handleFolderChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFolderFiles(Array.from(e.target.files));
      setSelectedFile(null);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setFolderFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (folderInputRef.current) folderInputRef.current.value = '';
  };

  const totalSelectedSizeMB = selectedFile 
    ? (selectedFile.size / (1024 * 1024)).toFixed(2)
    : (folderFiles.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024)).toFixed(2);

  return (
    <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept={activeMode === 'tabular' ? ".csv,.json,.jsonl,.xlsx,.xls,.tsv,.parquet" : ".zip,.txt,.json,.csv,.log,.md"}
      />
      <input
        type="file"
        ref={folderInputRef}
        onChange={handleFolderChange}
        webkitdirectory="true"
        directory="true"
        multiple
        style={{ display: 'none' }}
      />

      {/* Drag & Drop Area */}
      <div
        className={`dropzone ${isDragOver ? 'active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !selectedFile && folderFiles.length === 0 && fileInputRef.current?.click()}
      >
        <div style={{
          width: '64px',
          height: '64px',
          margin: '0 auto 1.25rem',
          borderRadius: '16px',
          background: 'rgba(99, 102, 241, 0.12)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <UploadCloud size={32} color="#818CF8" />
        </div>

        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.4rem', color: '#F8FAFC' }}>
          {activeMode === 'tabular'
            ? 'Upload Raw Tabular or JSON Dataset'
            : 'Upload Multi-Folder Text Dataset or Zip Archive'}
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#94A3B8', maxWidth: '520px', margin: '0 auto 1.5rem' }}>
          {activeMode === 'tabular'
            ? 'Drag & drop your CSV, JSON (flat/nested), Excel (.xlsx), TSV, or Parquet dataset here.'
            : 'Upload a .zip folder archive or drag entire folder trees with categorized text files.'}
        </p>

        {/* Buttons for Selection */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-primary"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            <FileSpreadsheet size={16} />
            Browse {activeMode === 'tabular' ? 'Data File' : 'Zip Archive'}
          </button>

          {activeMode === 'textual' && (
            <button
              type="button"
              className="btn-secondary"
              onClick={(e) => {
                e.stopPropagation();
                folderInputRef.current?.click();
              }}
            >
              <FolderUp size={16} color="#A855F7" />
              Upload Entire Folder Tree
            </button>
          )}
        </div>
      </div>

      {/* Selected File / Folder Summary Card */}
      {(selectedFile || folderFiles.length > 0) && (
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem 1.25rem',
          background: 'rgba(30, 41, 59, 0.85)',
          borderRadius: '12px',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircle size={20} color="#34D399" />
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#F8FAFC' }}>
                {selectedFile ? selectedFile.name : `Selected Folder: ${folderFiles.length} files loaded`}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '2px' }}>
                Size: {totalSelectedSizeMB} MB &nbsp;•&nbsp; Ready for automated profiling & cleaning
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleClear}
              disabled={isProcessing}
              style={{ padding: '0.45rem 0.8rem', fontSize: '0.78rem' }}
            >
              <X size={14} /> Clear
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={onCleanSubmit}
              disabled={isProcessing}
              style={{ padding: '0.65rem 1.6rem', fontSize: '0.95rem' }}
            >
              <FileCode size={16} />
              {isProcessing ? 'Processing Data...' : 'Analyze & Clean Dataset'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
