import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, Cpu, ShieldCheck } from 'lucide-react';

const STEPS = [
  "Parsing & Ingesting Data Structure...",
  "Running Deep Health & Quality Profiling...",
  "Eliminating Duplicates & Standardizing Schemas...",
  "Imputing Missing Cells & Calibrating Outliers...",
  "Generating Visual Analytics & Executive PDF Report..."
];

export default function ProcessingOverlay() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep(prev => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 600);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(9, 13, 22, 0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100
    }}>
      <div className="glass-card glow-card" style={{
        padding: '2.5rem',
        maxWidth: '480px',
        width: '90%',
        textAlign: 'center',
        background: 'rgba(15, 23, 42, 0.95)',
        border: '1px solid rgba(99, 102, 241, 0.4)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
      }}>
        {/* Animated Spinner */}
        <div style={{
          width: '70px',
          height: '70px',
          margin: '0 auto 1.5rem',
          borderRadius: '50%',
          background: 'rgba(99, 102, 241, 0.1)',
          border: '2px solid rgba(99, 102, 241, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          <Loader2 size={36} color="#818CF8" className="animate-spin" style={{ animation: 'spin 1.2s linear infinite' }} />
        </div>

        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#F8FAFC', marginBottom: '0.4rem' }}>
          DataMorph Engine Working
        </h3>
        <p style={{ fontSize: '0.825rem', color: '#94A3B8', marginBottom: '1.75rem' }}>
          Executing automated multi-phase data sanitation pipeline
        </p>

        {/* Step Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'left' }}>
          {STEPS.map((step, idx) => {
            const isDone = idx < currentStep;
            const isCurrent = idx === currentStep;

            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  fontSize: '0.82rem',
                  color: isDone ? '#34D399' : isCurrent ? '#818CF8' : '#64748B',
                  fontWeight: isCurrent ? '700' : '500',
                  transition: 'all 0.3s ease'
                }}
              >
                {isDone ? (
                  <CheckCircle2 size={16} color="#34D399" />
                ) : isCurrent ? (
                  <Loader2 size={16} color="#818CF8" className="animate-spin" style={{ animation: 'spin 1.2s linear infinite' }} />
                ) : (
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '1.5px solid #475569' }} />
                )}
                <span>{step}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
