// src/App.tsx
import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Database, ShieldCheck, Activity, LayoutDashboard, FileText, CheckCircle2, Menu, X } from 'lucide-react';
import { CONFIG } from './config';

const NerveCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;
    let animationFrameId: number;

    interface Particle {
      x: number; y: number;
      vx: number; vy: number;
      tx: number; ty: number;
      baseVx: number; baseVy: number;
    }

    const particles: Particle[] = [];
    const numParticles = 130;
    const connectionDistance = 180;

    const getEyeTarget = (index: number, total: number) => {
      // Center on desktop, move up on mobile so text fits
      const isMobile = width < 900;
      const centerX = width / 2;
      const centerY = isMobile ? height * 0.3 : height / 2;
      
      if (index < total * 0.6) {
        const angle = (index / (total * 0.6)) * Math.PI * 2;
        const rx = isMobile ? width * 0.45 : width * 0.35; 
        const ry = isMobile ? height * 0.15 : height * 0.20; 
        
        const x = centerX + Math.cos(angle) * rx;
        const y = centerY + Math.sin(angle) * ry;
        return { x, y };
      } else {
        const angle = ((index - total * 0.6) / (total * 0.4)) * Math.PI * 2;
        const r = isMobile ? 50 : 80; 
        return {
          x: centerX + Math.cos(angle) * r,
          y: centerY + Math.sin(angle) * r
        };
      }
    };

    for (let i = 0; i < numParticles; i++) {
      const target = getEyeTarget(i, numParticles);
      const vx = (Math.random() - 0.5) * 1.5;
      const vy = (Math.random() - 0.5) * 1.5;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx,
        vy,
        baseVx: vx,
        baseVy: vy,
        tx: target.x,
        ty: target.y
      });
    }

    let startTime = Date.now();
    let time = 0;
    const FORMATION_DELAY = 5000; 

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.005;

      const elapsed = Date.now() - startTime;
      const isForming = elapsed > FORMATION_DELAY;
      
      const pullStrength = isForming ? Math.min((elapsed - FORMATION_DELAY) / 15000, 1) : 0;

      particles.forEach((p) => {
        if (isForming) {
          const dx = p.tx - p.x;
          const dy = p.ty - p.y;
          
          p.x += dx * 0.015 * pullStrength;
          p.y += dy * 0.015 * pullStrength;
          
          if (pullStrength > 0.9) {
            p.x += Math.sin(time + p.tx) * 0.5;
            p.y += Math.cos(time + p.ty) * 0.5;
          }
        } else {
          p.x += p.vx;
          p.y += p.vy;

          if (p.x <= 0 || p.x >= width) p.vx *= -1;
          if (p.y <= 0 || p.y >= height) p.vy *= -1;
        }
      });

      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const opacity = 1 - (dist / connectionDistance);
            ctx.strokeStyle = `rgba(110, 255, 190, ${opacity * 0.4})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      particles.forEach((p) => {
        ctx.fillStyle = 'rgba(110, 255, 190, 0.8)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
      startTime = Date.now();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-canvas" />;
};

export default function App() {
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleAppAccess = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!CONFIG.APP_SIGN_UP_URL) {
      setShowComingSoon(true);
      setTimeout(() => setShowComingSoon(false), 4000); 
    } else {
      window.location.href = CONFIG.APP_SIGN_UP_URL;
    }
  };

  return (
    <div className="landing-page">
      
      {/* STICKY NAVIGATION */}
      <nav style={{ position: 'fixed', top: 0, width: '100%', background: 'rgba(5, 20, 14, 0.9)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border-color)', zIndex: 50 }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '72px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 50 C 30 20, 70 20, 90 50 C 70 80, 30 80, 10 50 Z" stroke="var(--text-main)" strokeWidth="4" strokeLinejoin="round"/>
              <circle cx="50" cy="50" r="15" stroke="var(--text-main)" strokeWidth="4"/>
              <circle cx="50" cy="50" r="5" fill="var(--text-main)"/>
            </svg>
            <span style={{ fontWeight: 600, fontSize: '18px', letterSpacing: '-0.5px', color: 'var(--text-main)' }}>VISION-OS</span>
          </div>
          
          {/* Desktop Menu */}
          <div className="desktop-nav" style={{ display: 'flex', gap: '32px', fontSize: '14px', fontWeight: 500 }}>
            <a href="#about" className="nav-link" style={{ color: 'var(--text-main)' }}>About</a>
            <a href="#features" className="nav-link" style={{ color: 'var(--text-main)' }}>Features</a>
            <a href="#vision" className="nav-link" style={{ color: 'var(--text-main)' }}>Our Vision</a>
            <a href="#access" onClick={handleAppAccess} style={{ color: 'var(--text-main)', fontWeight: 600 }}>Sign In</a>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-btn" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay ${mobileMenuOpen ? 'is-open' : ''}`}>
        <a href="#about" onClick={() => setMobileMenuOpen(false)}>About</a>
        <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
        <a href="#vision" onClick={() => setMobileMenuOpen(false)}>Our Vision</a>
        <a href="#access" onClick={(e) => { setMobileMenuOpen(false); handleAppAccess(e); }}>Sign In</a>
      </div>

      {/* HERO SECTION (Dark Theme) */}
      <div className="hero-wrapper">
        <section className="hero-section">
          <NerveCanvas />
          
          <div className="container hero-layout">
            <div className="hero-text">
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(36px, 5vw, 68px)', marginBottom: '24px', color: 'var(--text-main)' }}>
                A Clearer Vision for Connected Business Operations.
              </h1>
              <p style={{ fontSize: '18px', color: 'var(--text-muted)', marginBottom: '40px' }}>
                VISION-OS is an integrated digital system concept designed to bring essential business functions, information, and resources together in one organised environment. Developed by Vision, it explores a smarter approach to managing operations.
              </p>
              
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
                <a href="#features" style={{ padding: '12px 24px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-main)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Explore Vision-OS
                </a>
                <button onClick={handleAppAccess} style={{ padding: '12px 24px', borderRadius: '6px', background: 'var(--text-main)', color: 'var(--bg-color)', border: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Sign Up <ArrowRight size={16} />
                </button>
              </div>
              {showComingSoon && (
                <p style={{ marginTop: '16px', fontSize: '14px', color: '#FDE047', fontWeight: 500 }}>
                  The application is currently being prepared for hosting. Please check back soon.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* ABOUT SECTION (Light Theme) */}
      <section id="about" className="section-alt" style={{ padding: '120px 0' }}>
        <div className="container about-grid">
          <div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', marginBottom: '24px', color: 'var(--text-dark)' }}>The cost of chaos.</h2>
            <p style={{ fontSize: '16px', color: 'var(--text-muted-dark)', marginBottom: '24px' }}>
              South African SMEs face an alarming failure rate. The issue is rarely market demand; it is operational. Business information is scattered across disconnected systems, spreadsheets, and paper records.
            </p>
            <p style={{ fontSize: '16px', color: 'var(--text-muted-dark)' }}>
              VISION-OS is being built to explore how an integrated system can simplify the way business information, operational activities, and resources are organised.
            </p>
          </div>
          <div className="card-light" style={{ padding: '40px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '16px', color: 'var(--text-dark)' }}>Design Goals</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                'Centralised information in one environment.',
                'Organised business operations and workflows.',
                'Improved visibility across activities.',
                'A foundation that evolves with requirements.'
              ].map((item, i) => (
                <li key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', fontSize: '15px', color: 'var(--text-muted-dark)' }}>
                  <CheckCircle2 size={20} style={{ color: 'var(--text-dark)', flexShrink: 0 }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION (Light Theme) */}
      <section id="features" className="section-light" style={{ padding: '120px 0' }}>
        <div className="container">
          <div style={{ marginBottom: '64px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', marginBottom: '16px', color: 'var(--text-dark)' }}>Key Capabilities</h2>
            <p style={{ color: 'var(--text-muted-dark)' }}>Core modules being developed for the MVP.</p>
          </div>

          <div className="features-grid">
            {[
              { icon: ShieldCheck, title: 'Compliance Management', desc: 'Track regulatory frameworks, deadlines, and evidence to prevent penalties.' },
              { icon: LayoutDashboard, title: 'Operational Visibility', desc: 'Real-time dashboards that show what is happening in the business right now.' },
              { icon: Database, title: 'Centralised Workspace', desc: 'Bring client records, financial data, and tasks into one unified environment.' },
              { icon: FileText, title: 'Information & Documents', desc: 'A structured approach to storing, managing, and accessing critical evidence.' },
              { icon: Activity, title: 'THE NERVE Assistant', desc: 'A central intelligence hub that surfaces risks and highlights operational blockers.' },
            ].map((feature, i) => (
              <div key={i} className="card-light" style={{ padding: '32px' }}>
                <feature.icon size={24} style={{ color: 'var(--text-dark)', marginBottom: '20px' }} />
                <h3 style={{ fontSize: '18px', marginBottom: '12px', color: 'var(--text-dark)' }}>{feature.title}</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-muted-dark)' }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VISION & WHY SECTION (Light Theme) */}
      <section id="vision" className="section-alt" style={{ padding: '120px 0' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', marginBottom: '24px', color: 'var(--text-dark)' }}>Built Around a Bigger Vision.</h2>
          <p style={{ fontSize: '18px', color: 'var(--text-muted-dark)', marginBottom: '48px', lineHeight: 1.8 }}>
            "Vision OS reflects our commitment to exploring practical, connected digital solutions that make complex operations easier to understand and manage. Our vision is to create a structured digital environment where information, processes, and tools work together to support better organisation."
          </p>
          
          <div className="vision-grid">
            <div style={{ padding: '24px', borderLeft: '2px solid var(--text-dark)' }}>
              <h4 style={{ fontSize: '16px', marginBottom: '8px', color: 'var(--text-dark)' }}>Simplicity</h4>
              <p style={{ fontSize: '14px', color: 'var(--text-muted-dark)' }}>Prioritising necessary complexity over feature bloat.</p>
            </div>
            <div style={{ padding: '24px', borderLeft: '2px solid var(--text-dark)' }}>
              <h4 style={{ fontSize: '16px', marginBottom: '8px', color: 'var(--text-dark)' }}>Connected</h4>
              <p style={{ fontSize: '14px', color: 'var(--text-muted-dark)' }}>Replacing disconnected tools with a single source of truth.</p>
            </div>
            <div style={{ padding: '24px', borderLeft: '2px solid var(--text-dark)' }}>
              <h4 style={{ fontSize: '16px', marginBottom: '8px', color: 'var(--text-dark)' }}>Growth</h4>
              <p style={{ fontSize: '14px', color: 'var(--text-muted-dark)' }}>A modular foundation that scales with the business.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ACCESS SECTION (Dark Theme again for contrast) */}
      <section id="access" style={{ padding: '120px 0', background: 'var(--bg-color)', color: 'var(--text-main)', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '40px', marginBottom: '24px', color: 'var(--text-main)' }}>Ready to Explore Vision-OS?</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '18px', maxWidth: '600px', margin: '0 auto 40px auto' }}>
            Discover the project and explore the direction of a more connected digital working environment.
          </p>
          <button onClick={handleAppAccess} style={{ padding: '16px 32px', borderRadius: '6px', background: 'var(--text-main)', color: 'var(--bg-color)', border: 'none', fontWeight: 600, fontSize: '16px' }}>
            Sign Up for Updates
          </button>
        </div>
      </section>

      {/* FOOTER (Light Theme) */}
      <footer style={{ padding: '48px 0', background: 'var(--bg-light-alt)', borderTop: '1px solid var(--border-dark)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <svg width="20" height="20" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 50 C 30 20, 70 20, 90 50 C 70 80, 30 80, 10 50 Z" stroke="var(--text-dark)" strokeWidth="6" strokeLinejoin="round"/>
                <circle cx="50" cy="50" r="15" stroke="var(--text-dark)" strokeWidth="6"/>
                <circle cx="50" cy="50" r="5" fill="var(--text-dark)"/>
              </svg>
              <span style={{ fontWeight: 600, fontSize: '16px', color: 'var(--text-dark)' }}>VISION-OS</span>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-muted-dark)' }}>Developed by Vision. IT Capstone Project.</p>
          </div>
          <div style={{ display: 'flex', gap: '24px', fontSize: '14px', color: 'var(--text-muted-dark)' }}>
            <a href="#about" className="nav-link">About</a>
            <a href="#features" className="nav-link">Features</a>
            <a href="#vision" className="nav-link">Vision</a>
          </div>
          <div style={{ fontSize: '14px', color: 'var(--text-muted-dark)' }}>
            © {new Date().getFullYear()} Vision. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}