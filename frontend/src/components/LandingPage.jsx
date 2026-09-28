import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Database, 
  Layers, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  FileSpreadsheet, 
  FileText, 
  Archive, 
  ChevronRight, 
  Filter, 
  Cpu, 
  Activity,
  Sliders,
  BarChart3,
  Terminal,
  RefreshCw,
  FolderArchive
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Pipeline Stages Data
const PIPELINE_STAGES = [
  {
    id: 'raw',
    title: 'Raw Data',
    icon: Database,
    color: '#EF4444',
    badge: 'Dirty & Unstructured',
    desc: 'Heterogeneous CSV, JSON, Excel, or text archives containing corrupted cells, missing values, and mixed types.',
    sample: [
      { id: '101', name: '  Alice S.  ', spend: '$1,200.50', date: '02/20/2023', tags: ['vip', 'ai'], status: 'NaN' },
      { id: '102', name: 'Bob Jones', spend: '$50000.00', date: '2023.03.10', tags: ['web'], status: null },
      { id: '102', name: 'Bob Jones', spend: '$50000.00', date: '2023.03.10', tags: ['web'], status: null }
    ]
  },
  {
    id: 'clean',
    title: 'Cleaning',
    icon: Filter,
    color: '#F59E0B',
    badge: 'Sanitization',
    desc: 'Automated whitespace collapse, invisible character stripping, and UTF-8 encoding normalization.',
    sample: [
      { id: '101', name: 'Alice S.', spend: '$1,200.50', date: '02/20/2023', tags: 'vip, ai', status: 'NaN' },
      { id: '102', name: 'Bob Jones', spend: '$50000.00', date: '2023.03.10', tags: 'web', status: null },
      { id: '102', name: 'Bob Jones', spend: '$50000.00', date: '2023.03.10', tags: 'web', status: null }
    ]
  },
  {
    id: 'transform',
    title: 'Transformation',
    icon: Sliders,
    color: '#6366F1',
    badge: 'Type Inference',
    desc: 'Converts currency & date strings into ISO 8601 timestamps and float metrics. Sanitizes column headers to snake_case.',
    sample: [
      { user_id: 101, full_name: 'Alice S.', spend_amount: 1200.50, registration_date: '2023-02-20', tags: 'vip, ai' },
      { user_id: 102, full_name: 'Bob Jones', spend_amount: 50000.00, registration_date: '2023-03-10', tags: 'web' },
      { user_id: 102, full_name: 'Bob Jones', spend_amount: 50000.00, registration_date: '2023-03-10', tags: 'web' }
    ]
  },
  {
    id: 'validate',
    title: 'Validation',
    icon: ShieldCheck,
    color: '#8B5CF6',
    badge: 'Heuristics & IQR',
    desc: 'Eliminates duplicate rows, applies IQR statistical bounds for outlier clipping, and imputes null entries.',
    sample: [
      { user_id: 101, full_name: 'Alice S.', spend_amount: 1200.50, registration_date: '2023-02-20', tags: 'vip, ai', status: 'Active' },
      { user_id: 102, full_name: 'Bob Jones', spend_amount: 2500.00, registration_date: '2023-03-10', tags: 'web', status: 'Active' }
    ]
  },
  {
    id: 'ready',
    title: 'Ready Data',
    icon: CheckCircle2,
    color: '#10B981',
    badge: 'Production Grade',
    desc: 'Zero nulls, zero duplicate noise, schema calibrated, certified with a downloadable PDF executive audit certificate.',
    sample: [
      { user_id: 101, full_name: 'Alice S.', spend_amount: 1200.50, registration_date: '2023-02-20', tags: 'vip, ai', status: 'Active' },
      { user_id: 102, full_name: 'Bob Jones', spend_amount: 2500.00, registration_date: '2023-03-10', tags: 'web', status: 'Active' }
    ]
  }
];

// Features List
const FEATURES = [
  {
    icon: Filter,
    title: 'Automated Data Cleaning',
    desc: 'Instantly identifies and eliminates whitespace defects, malformed symbols, invisible characters, and unhashable nested arrays.',
    gradient: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(6, 182, 212, 0.15))',
    badge: 'Zero-Code'
  },
  {
    icon: Sliders,
    title: 'Intelligent Type Inference',
    desc: 'Heuristic engines detect date patterns and numeric strings, converting them into standard ISO datetime and clean floats.',
    gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.15))',
    badge: 'Smart Casting'
  },
  {
    icon: Activity,
    title: 'Smart Missing Value Imputation',
    desc: 'Fills gaps intelligently using statistical median/mean for continuous metrics and distribution mode for categorical columns.',
    gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(239, 68, 68, 0.15))',
    badge: 'Statistical Heuristics'
  },
  {
    icon: Layers,
    title: 'Cryptographic Deduplication',
    desc: 'Eliminates row duplicates and multi-document text redundancy using MD5 cryptographic hashing and subset matching.',
    gradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(99, 102, 241, 0.15))',
    badge: '100% Accuracy'
  },
  {
    icon: ShieldCheck,
    title: 'IQR Outlier Calibration',
    desc: 'Statistical Interquartile Range (IQR) calibration isolates extreme anomalies and applies bounds clipping or row pruning.',
    gradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(139, 92, 246, 0.15))',
    badge: 'Anomaly Control'
  },
  {
    icon: FileText,
    title: 'Executive PDF Audit Reports',
    desc: 'Generates board-ready audit reports with distribution charts, cleanliness scores, and compliance transformation certificates.',
    gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(59, 130, 246, 0.15))',
    badge: 'ReportLab Engine'
  }
];

export default function LandingPage({ onStartTransforming }) {
  const [activeStage, setActiveStage] = useState(0);
  const canvasRef = useRef(null);

  // Background Interactive Particles Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle nodes
    const particleCount = 45;
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        size: Math.random() * 2.5 + 1.2,
        color: i % 3 === 0 ? 'rgba(99, 102, 241, 0.45)' : i % 3 === 1 ? 'rgba(6, 182, 212, 0.4)' : 'rgba(16, 185, 129, 0.35)'
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle connecting lines
      for (let i = 0; i < particleCount; i++) {
        for (let j = i + 1; j < particleCount; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.12 * (1 - dist / 130)})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Auto pipeline advancement timer
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStage(prev => (prev + 1) % PIPELINE_STAGES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: '#090D16', color: '#F8FAFC', overflowX: 'hidden' }}>
      
      {/* Background Interactive Particles Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          opacity: 0.85
        }}
      />

      {/* Background Glowing Mesh Gradients */}
      <div style={{
        position: 'fixed',
        top: '-15%',
        left: '20%',
        width: '650px',
        height: '650px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, rgba(6, 182, 212, 0.08) 45%, transparent 70%)',
        filter: 'blur(80px)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      <div style={{
        position: 'fixed',
        bottom: '10%',
        right: '5%',
        width: '550px',
        height: '550px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, rgba(99, 102, 241, 0.06) 50%, transparent 70%)',
        filter: 'blur(80px)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* 1. Top Modern SaaS Navigation Bar */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(9, 13, 22, 0.82)',
        backdropFilter: 'blur(20px)',
        padding: '0.9rem 2rem'
      }}>
        <div style={{
          maxWidth: '1360px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem'
        }}>
          {/* Brand Identity with Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img
              src="/datamorph_logo.png"
              alt="DataMorph Logo"
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                objectFit: 'contain',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.35rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#F8FAFC' }}>
                  Data<span style={{ color: '#818CF8' }}>Morph</span>
                </span>
              </div>
              <p style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '-2px' }}>
                Automated Data Profiling & Intelligent Cleaning
              </p>
            </div>
          </div>

          {/* Nav Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }} className="hidden-mobile">
            <a href="#pipeline" style={{ fontSize: '0.88rem', color: '#CBD5E1', textDecoration: 'none', fontWeight: '500', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#818CF8'} onMouseOut={e => e.target.style.color = '#CBD5E1'}>
              Interactive Pipeline
            </a>
            <a href="#features" style={{ fontSize: '0.88rem', color: '#CBD5E1', textDecoration: 'none', fontWeight: '500', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#818CF8'} onMouseOut={e => e.target.style.color = '#CBD5E1'}>
              Features
            </a>
            <a href="#formats" style={{ fontSize: '0.88rem', color: '#CBD5E1', textDecoration: 'none', fontWeight: '500', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#818CF8'} onMouseOut={e => e.target.style.color = '#CBD5E1'}>
              Supported Formats
            </a>
          </nav>

          {/* Launch Workspace CTA Button */}
          <button
            onClick={onStartTransforming}
            className="btn-primary"
            style={{
              padding: '0.6rem 1.3rem',
              fontSize: '0.9rem',
              fontWeight: '700',
              borderRadius: '10px'
            }}
          >
            Launch DataMorph
            <ArrowRight size={16} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ position: 'relative', zIndex: 10 }}>
        
        {/* 2. Hero Section */}
        <section style={{
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '4.5rem 1.5rem 3.5rem',
          textAlign: 'center'
        }}>
          {/* Animated Hero Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.45rem 1.1rem',
              borderRadius: '9999px',
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              color: '#818CF8',
              fontSize: '0.82rem',
              fontWeight: '700',
              letterSpacing: '0.04em',
              marginBottom: '1.75rem',
              boxShadow: '0 0 25px rgba(99, 102, 241, 0.25)'
            }}
          >
            <Sparkles size={15} color="#818CF8" className="animate-spin" style={{ animation: 'spin 4s linear infinite' }} />
            NEXT-GEN AUTOMATED DATA PREPROCESSING ENGINE
          </motion.div>

          {/* Hero Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            style={{
              fontSize: 'clamp(2.5rem, 5.5vw, 4.2rem)',
              fontWeight: '800',
              lineHeight: 1.12,
              letterSpacing: '-0.03em',
              maxWidth: '960px',
              margin: '0 auto 1.5rem',
              background: 'linear-gradient(135deg, #FFFFFF 30%, #CBD5E1 70%, #818CF8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Transform Raw Data Into <br />
            <span style={{
              background: 'linear-gradient(135deg, #818CF8 0%, #06B6D4 50%, #34D399 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Ready-to-Use Production Data
            </span>
          </motion.h1>

          {/* Hero Subtitle Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            style={{
              fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
              color: '#94A3B8',
              lineHeight: 1.6,
              maxWidth: '780px',
              margin: '0 auto 2.5rem',
              fontWeight: '400'
            }}
          >
            DataMorph eliminates chaotic manual scripting by automating dataset profiling, 
            noise sanitization, smart type inference, statistical imputation, and certified PDF audit reporting in milliseconds.
          </motion.p>

          {/* Hero Action CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1.25rem',
              flexWrap: 'wrap',
              marginBottom: '3.5rem'
            }}
          >
            <button
              onClick={onStartTransforming}
              className="btn-primary"
              style={{
                padding: '0.9rem 2.2rem',
                fontSize: '1.05rem',
                fontWeight: '700',
                borderRadius: '12px',
                boxShadow: '0 8px 30px rgba(99, 102, 241, 0.45)'
              }}
            >
              Start Transforming Now
              <ArrowRight size={19} />
            </button>

            <a
              href="#pipeline"
              className="btn-secondary"
              style={{
                padding: '0.9rem 1.8rem',
                fontSize: '1.05rem',
                fontWeight: '600',
                borderRadius: '12px',
                textDecoration: 'none'
              }}
            >
              Explore Features
            </a>
          </motion.div>

          {/* Key Metric Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.25rem',
              maxWidth: '920px',
              margin: '0 auto'
            }}
          >
            {[
              { label: 'HEURISTIC LATENCY', value: '< 1.2s', sub: 'Instantaneous execution' },
              { label: 'DATA SECURITY', value: '100% Private', sub: 'Zero cloud leaks' },
              { label: 'COMPLEX SUPPORT', value: 'JSON & Tabular', sub: 'Handles nested hierarchies' },
              { label: 'OUTPUT INTEGRITY', value: 'Certified Audit', sub: 'Downloadable PDF reports' }
            ].map((stat, idx) => (
              <div
                key={idx}
                className="glass-card"
                style={{
                  padding: '1.1rem 1.25rem',
                  textAlign: 'left',
                  background: 'rgba(15, 23, 42, 0.65)'
                }}
              >
                <div style={{ fontSize: '0.72rem', color: '#818CF8', fontWeight: '700', letterSpacing: '0.05em' }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#F8FAFC', margin: '3px 0' }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                  {stat.sub}
                </div>
              </div>
            ))}
          </motion.div>
        </section>

        {/* 3. Interactive Animated Data Pipeline (Visual Storytelling) */}
        <section id="pipeline" style={{
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '4rem 1.5rem 5rem'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="badge badge-indigo" style={{ marginBottom: '0.75rem' }}>
              INTERACTIVE PIPELINE VISUALIZATION
            </span>
            <h2 style={{ fontSize: '2.4rem', fontWeight: '800', color: '#F8FAFC', marginBottom: '0.6rem' }}>
              How DataMorph Morphs Chaotic Data Into Clarity
            </h2>
            <p style={{ fontSize: '0.98rem', color: '#94A3B8', maxWidth: '620px', margin: '0 auto' }}>
              Click on any stage below to inspect the transformation pipeline in real time.
            </p>
          </div>

          {/* Pipeline Stage Tabs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '0.75rem',
            marginBottom: '2rem'
          }}>
            {PIPELINE_STAGES.map((stage, idx) => {
              const Icon = stage.icon;
              const isActive = activeStage === idx;

              return (
                <button
                  key={stage.id}
                  onClick={() => setActiveStage(idx)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '0.4rem',
                    padding: '1.1rem',
                    borderRadius: '14px',
                    border: isActive ? `1.5px solid ${stage.color}` : '1px solid rgba(255, 255, 255, 0.08)',
                    background: isActive ? 'rgba(30, 41, 59, 0.9)' : 'rgba(15, 23, 42, 0.6)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.25s ease',
                    boxShadow: isActive ? `0 0 20px ${stage.color}25` : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: `${stage.color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Icon size={18} color={stage.color} />
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 'bold' }}>
                      0{idx + 1}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: '700', color: isActive ? '#F8FAFC' : '#CBD5E1', marginTop: '4px' }}>
                    {stage.title}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: stage.color, fontWeight: '600' }}>
                    {stage.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Stage Live Transformation Display Box */}
          <div className="glass-card" style={{
            padding: '2rem',
            border: `1.5px solid ${PIPELINE_STAGES[activeStage].color}40`,
            boxShadow: `0 10px 40px -10px ${PIPELINE_STAGES[activeStage].color}20`,
            background: 'rgba(15, 23, 42, 0.85)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: PIPELINE_STAGES[activeStage].color,
                    boxShadow: `0 0 10px ${PIPELINE_STAGES[activeStage].color}`
                  }} />
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#F8FAFC' }}>
                    Stage 0{activeStage + 1}: {PIPELINE_STAGES[activeStage].title}
                  </h3>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '4px' }}>
                  {PIPELINE_STAGES[activeStage].desc}
                </p>
              </div>

              <span className="badge" style={{
                background: `${PIPELINE_STAGES[activeStage].color}15`,
                color: PIPELINE_STAGES[activeStage].color,
                border: `1px solid ${PIPELINE_STAGES[activeStage].color}40`
              }}>
                Live Pipeline State
              </span>
            </div>

            {/* Simulated Live Table Sample */}
            <div className="custom-table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    {Object.keys(PIPELINE_STAGES[activeStage].sample[0]).map((col, idx) => (
                      <th key={idx}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PIPELINE_STAGES[activeStage].sample.map((row, rIdx) => (
                    <tr key={rIdx}>
                      {Object.keys(row).map((col, cIdx) => (
                        <td key={cIdx}>
                          {row[col] === null || row[col] === 'NaN' ? (
                            <span style={{ color: '#EF4444', fontStyle: 'italic', fontWeight: 'bold' }}>null</span>
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
          </div>
        </section>

        {/* 4. Comprehensive Feature Grid */}
        <section id="features" style={{
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '4rem 1.5rem 5rem'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="badge badge-emerald" style={{ marginBottom: '0.75rem' }}>
              ENTERPRISE CAPABILITIES
            </span>
            <h2 style={{ fontSize: '2.4rem', fontWeight: '800', color: '#F8FAFC', marginBottom: '0.6rem' }}>
              Engineered for Speed, Precision, & Rigor
            </h2>
            <p style={{ fontSize: '0.98rem', color: '#94A3B8', maxWidth: '620px', margin: '0 auto' }}>
              Everything data engineers, machine learning practitioners, and business analysts need to sanitize raw datasets.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '1.5rem'
          }}>
            {FEATURES.map((feat, idx) => {
              const Icon = feat.icon;

              return (
                <div
                  key={idx}
                  className="glass-card glow-card"
                  style={{
                    padding: '2rem',
                    background: 'rgba(15, 23, 42, 0.7)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '1.25rem'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: feat.gradient,
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                      }}>
                        <Icon size={22} color="#818CF8" />
                      </div>
                      <span className="badge badge-indigo">
                        {feat.badge}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#F8FAFC', marginBottom: '0.5rem' }}>
                      {feat.title}
                    </h3>
                    <p style={{ fontSize: '0.86rem', color: '#94A3B8', lineHeight: 1.55 }}>
                      {feat.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5. Supported Formats & Modalities */}
        <section id="formats" style={{
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '2rem 1.5rem 6rem'
        }}>
          <div className="glass-card" style={{
            padding: '3rem 2.5rem',
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.95))',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '20px'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <span className="badge badge-indigo" style={{ marginBottom: '0.6rem' }}>
                CROSS-FORMAT INTEROPERABILITY
              </span>
              <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#F8FAFC' }}>
                Universal Compatibility Across All Industry Formats
              </h2>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2rem'
            }}>
              {/* Tabular Mode */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.6)',
                padding: '1.75rem',
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <Database size={20} color="#60A5FA" />
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#F8FAFC' }}>
                    Tabular & JSON Mode
                  </h4>
                </div>
                <p style={{ fontSize: '0.84rem', color: '#94A3B8', marginBottom: '1.25rem' }}>
                  Auto-detects nested hierarchies, array wrappers, and delimiters.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {['.CSV', '.JSON', '.JSONL', '.XLSX', '.PARQUET', '.TSV'].map((ext, idx) => (
                    <span key={idx} style={{
                      padding: '0.3rem 0.65rem',
                      borderRadius: '6px',
                      background: 'rgba(99, 102, 241, 0.15)',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      color: '#818CF8',
                      fontSize: '0.75rem',
                      fontWeight: '700'
                    }}>
                      {ext}
                    </span>
                  ))}
                </div>
              </div>

              {/* Textual & NLP Mode */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.6)',
                padding: '1.75rem',
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <FolderArchive size={20} color="#A78BFA" />
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#F8FAFC' }}>
                    Multi-Folder Text & NLP Mode
                  </h4>
                </div>
                <p style={{ fontSize: '0.84rem', color: '#94A3B8', marginBottom: '1.25rem' }}>
                  Crawls nested directory trees, extracts documents, and deduplicates corpora.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {['.ZIP ARCHIVES', 'FOLDER TREES', '.TXT', '.MD', '.LOG', '.DOC'].map((ext, idx) => (
                    <span key={idx} style={{
                      padding: '0.3rem 0.65rem',
                      borderRadius: '6px',
                      background: 'rgba(168, 85, 247, 0.15)',
                      border: '1px solid rgba(168, 85, 247, 0.3)',
                      color: '#C084FC',
                      fontSize: '0.75rem',
                      fontWeight: '700'
                    }}>
                      {ext}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Bottom Hero Action Banner */}
        <section style={{
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '0 1.5rem 6rem',
          textAlign: 'center'
        }}>
          <div className="glass-card" style={{
            padding: '4rem 2rem',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(16, 185, 129, 0.15))',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            borderRadius: '24px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '800', color: '#F8FAFC', marginBottom: '1rem' }}>
              Ready to Sanitize Your Data in Seconds?
            </h2>
            <p style={{ fontSize: '1.05rem', color: '#CBD5E1', maxWidth: '620px', margin: '0 auto 2.5rem' }}>
              Experience automated data profiling, outlier clipping, and certified PDF audit generation. No login required.
            </p>

            <button
              onClick={onStartTransforming}
              className="btn-primary"
              style={{
                padding: '1rem 2.8rem',
                fontSize: '1.15rem',
                fontWeight: '800',
                borderRadius: '12px',
                boxShadow: '0 10px 35px rgba(99, 102, 241, 0.6)'
              }}
            >
              Start Transforming Now
              <ArrowRight size={20} />
            </button>
          </div>
        </section>
      </main>

      {/* 7. Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(9, 13, 22, 0.95)',
        padding: '2.5rem 2rem',
        textAlign: 'center',
        color: '#64748B',
        fontSize: '0.825rem'
      }}>
        <div style={{
          maxWidth: '1240px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <img src="/datamorph_logo.png" alt="Logo" style={{ width: '28px', height: '28px', borderRadius: '6px' }} />
            <span style={{ fontWeight: '700', color: '#CBD5E1' }}>DataMorph Automated Engine</span>
          </div>

          <div>
            Built with Fast Heuristic Algorithms & Privacy-First Architecture. All data processed securely.
          </div>

          <div>
            © {new Date().getFullYear()} DataMorph. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
