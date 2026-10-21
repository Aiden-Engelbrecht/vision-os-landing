import {
  useEffect,
  useRef,
  useState,
} from 'react';

import type {
  MouseEvent,
} from 'react';

import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Database,
  FileText,
  LayoutDashboard,
  Menu,
  ShieldCheck,
  X,
} from 'lucide-react';

import { CONFIG } from './config';

const NerveCanvas = () => {
  const canvasRef =
    useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const ctx =
      canvas.getContext('2d');

    if (!ctx) {
      return;
    }

    let width =
      canvas.width =
        canvas.offsetWidth;

    let height =
      canvas.height =
        canvas.offsetHeight;

    let animationFrameId: number;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      tx: number;
      ty: number;
      baseVx: number;
      baseVy: number;
    }

    const particles: Particle[] = [];
    const numParticles = 130;
    const connectionDistance = 180;

    const getEyeTarget = (
      index: number,
      total: number,
    ) => {
      const isMobile = width < 900;
      const centerX = width / 2;

      const centerY = isMobile
        ? height * 0.3
        : height / 2;

      if (index < total * 0.6) {
        const angle =
          (index / (total * 0.6)) *
          Math.PI *
          2;

        const rx = isMobile
          ? width * 0.45
          : width * 0.35;

        const ry = isMobile
          ? height * 0.15
          : height * 0.2;

        return {
          x:
            centerX +
            Math.cos(angle) * rx,
          y:
            centerY +
            Math.sin(angle) * ry,
        };
      }

      const angle =
        (
          (index - total * 0.6) /
          (total * 0.4)
        ) *
        Math.PI *
        2;

      const radius = isMobile
        ? 50
        : 80;

      return {
        x:
          centerX +
          Math.cos(angle) * radius,
        y:
          centerY +
          Math.sin(angle) * radius,
      };
    };

    for (
      let index = 0;
      index < numParticles;
      index += 1
    ) {
      const target =
        getEyeTarget(
          index,
          numParticles,
        );

      const vx =
        (Math.random() - 0.5) *
        1.5;

      const vy =
        (Math.random() - 0.5) *
        1.5;

      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx,
        vy,
        baseVx: vx,
        baseVy: vy,
        tx: target.x,
        ty: target.y,
      });
    }

    let startTime = Date.now();
    let time = 0;

    const formationDelay = 5000;

    const render = () => {
      ctx.clearRect(
        0,
        0,
        width,
        height,
      );

      time += 0.005;

      const elapsed =
        Date.now() - startTime;

      const isForming =
        elapsed > formationDelay;

      const pullStrength = isForming
        ? Math.min(
            (
              elapsed -
              formationDelay
            ) / 15000,
            1,
          )
        : 0;

      particles.forEach(
        (particle) => {
          if (isForming) {
            const dx =
              particle.tx -
              particle.x;

            const dy =
              particle.ty -
              particle.y;

            particle.x +=
              dx *
              0.015 *
              pullStrength;

            particle.y +=
              dy *
              0.015 *
              pullStrength;

            if (
              pullStrength > 0.9
            ) {
              particle.x +=
                Math.sin(
                  time +
                    particle.tx,
                ) * 0.5;

              particle.y +=
                Math.cos(
                  time +
                    particle.ty,
                ) * 0.5;
            }
          } else {
            particle.x +=
              particle.vx;

            particle.y +=
              particle.vy;

            if (
              particle.x <= 0 ||
              particle.x >= width
            ) {
              particle.vx *= -1;
            }

            if (
              particle.y <= 0 ||
              particle.y >= height
            ) {
              particle.vy *= -1;
            }
          }
        },
      );

      ctx.lineWidth = 1;

      for (
        let firstIndex = 0;
        firstIndex <
        particles.length;
        firstIndex += 1
      ) {
        for (
          let secondIndex =
            firstIndex + 1;
          secondIndex <
          particles.length;
          secondIndex += 1
        ) {
          const firstParticle =
            particles[firstIndex];

          const secondParticle =
            particles[secondIndex];

          const dx =
            firstParticle.x -
            secondParticle.x;

          const dy =
            firstParticle.y -
            secondParticle.y;

          const distance =
            Math.sqrt(
              dx * dx + dy * dy,
            );

          if (
            distance <
            connectionDistance
          ) {
            const opacity =
              1 -
              distance /
                connectionDistance;

            ctx.strokeStyle =
              `rgba(110, 255, 190, ${
                opacity * 0.4
              })`;

            ctx.beginPath();

            ctx.moveTo(
              firstParticle.x,
              firstParticle.y,
            );

            ctx.lineTo(
              secondParticle.x,
              secondParticle.y,
            );

            ctx.stroke();
          }
        }
      }

      particles.forEach(
        (particle) => {
          ctx.fillStyle =
            'rgba(110, 255, 190, 0.8)';

          ctx.beginPath();

          ctx.arc(
            particle.x,
            particle.y,
            1.5,
            0,
            Math.PI * 2,
          );

          ctx.fill();
        },
      );

      animationFrameId =
        requestAnimationFrame(
          render,
        );
    };

    render();

    const handleResize = () => {
      width =
        canvas.width =
          canvas.offsetWidth;

      height =
        canvas.height =
          canvas.offsetHeight;

      startTime = Date.now();
    };

    window.addEventListener(
      'resize',
      handleResize,
    );

    return () => {
      window.removeEventListener(
        'resize',
        handleResize,
      );

      cancelAnimationFrame(
        animationFrameId,
      );
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="hero-canvas"
      aria-hidden="true"
    />
  );
};

export default function App() {
  const [
    showComingSoon,
    setShowComingSoon,
  ] = useState(false);

  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] = useState(false);

  const openApplication = (
    event:
      | MouseEvent<
          HTMLAnchorElement
        >
      | MouseEvent<HTMLButtonElement>,
    destination: string,
  ) => {
    event.preventDefault();

    setMobileMenuOpen(false);

    if (!destination) {
      setShowComingSoon(true);

      window.setTimeout(
        () =>
          setShowComingSoon(false),
        4000,
      );

      return;
    }

    window.location.assign(
      destination,
    );
  };

  return (
    <div className="landing-page">
      {/* STICKY NAVIGATION */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          width: '100%',
          background:
            'rgba(5, 20, 14, 0.9)',
          backdropFilter:
            'blur(10px)',
          borderBottom:
            '1px solid var(--border-color)',
          zIndex: 50,
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            justifyContent:
              'space-between',
            alignItems: 'center',
            height: '72px',
          }}
        >
          <a
            href="#top"
            aria-label="VISION-OS home"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M10 50 C 30 20, 70 20, 90 50 C 70 80, 30 80, 10 50 Z"
                stroke="var(--text-main)"
                strokeWidth="4"
                strokeLinejoin="round"
              />

              <circle
                cx="50"
                cy="50"
                r="15"
                stroke="var(--text-main)"
                strokeWidth="4"
              />

              <circle
                cx="50"
                cy="50"
                r="5"
                fill="var(--text-main)"
              />
            </svg>

            <span
              style={{
                fontWeight: 600,
                fontSize: '18px',
                letterSpacing:
                  '-0.5px',
                color:
                  'var(--text-main)',
              }}
            >
              VISION-OS
            </span>
          </a>

          {/* Desktop menu */}
          <div
            className="desktop-nav"
            style={{
              display: 'flex',
              gap: '32px',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            <a
              href="#about"
              className="nav-link"
              style={{
                color:
                  'var(--text-main)',
              }}
            >
              About
            </a>

            <a
              href="#benefits"
              className="nav-link"
              style={{
                color:
                  'var(--text-main)',
              }}
            >
              Benefits
            </a>

            <a
              href="#vision"
              className="nav-link"
              style={{
                color:
                  'var(--text-main)',
              }}
            >
              Our Vision
            </a>

            <a
              href={
                CONFIG.APP_SIGN_IN_URL
              }
              onClick={(event) =>
                openApplication(
                  event,
                  CONFIG.APP_SIGN_IN_URL,
                )
              }
              style={{
                color:
                  'var(--text-main)',
                fontWeight: 600,
              }}
            >
              Sign In
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() =>
              setMobileMenuOpen(
                (open) => !open,
              )
            }
            aria-label={
              mobileMenuOpen
                ? 'Close menu'
                : 'Open menu'
            }
            aria-expanded={
              mobileMenuOpen
            }
          >
            {mobileMenuOpen ? (
              <X size={28} />
            ) : (
              <Menu size={28} />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div
        className={
          `mobile-menu-overlay ${
            mobileMenuOpen
              ? 'is-open'
              : ''
          }`
        }
      >
        <a
          href="#about"
          onClick={() =>
            setMobileMenuOpen(false)
          }
        >
          About
        </a>

        <a
          href="#benefits"
          onClick={() =>
            setMobileMenuOpen(false)
          }
        >
          Benefits
        </a>

        <a
          href="#vision"
          onClick={() =>
            setMobileMenuOpen(false)
          }
        >
          Our Vision
        </a>

        <a
          href={
            CONFIG.APP_SIGN_IN_URL
          }
          onClick={(event) =>
            openApplication(
              event,
              CONFIG.APP_SIGN_IN_URL,
            )
          }
        >
          Sign In
        </a>
      </div>

      {/* HERO SECTION */}
      <div
        id="top"
        className="hero-wrapper"
      >
        <section className="hero-section">
          <NerveCanvas />

          <div className="container hero-layout">
            <div className="hero-text">
              <h1
                style={{
                  fontFamily:
                    'var(--font-serif)',
                  fontSize:
                    'clamp(36px, 5vw, 68px)',
                  marginBottom:
                    '24px',
                  color:
                    'var(--text-main)',
                }}
              >
                A Clearer Vision for
                Connected Business
                Operations.
              </h1>

              <p
                style={{
                  fontSize: '18px',
                  color:
                    'var(--text-muted)',
                  marginBottom:
                    '40px',
                }}
              >
                Manage work, money,
                clients, staff and
                compliance—all in one
                place.
              </p>

              <div
                style={{
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'center',
                  justifyContent:
                    'center',
                  flexWrap: 'wrap',
                }}
              >
                <a
                  href="#benefits"
                  style={{
                    padding:
                      '12px 24px',
                    borderRadius: '6px',
                    border:
                      '1px solid var(--border-color)',
                    background:
                      'transparent',
                    color:
                      'var(--text-main)',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems:
                      'center',
                    gap: '8px',
                  }}
                >
                  Explore Benefits
                </a>

                <a
                  href={
                    CONFIG.APP_SIGN_UP_URL
                  }
                  onClick={(event) =>
                    openApplication(
                      event,
                      CONFIG.APP_SIGN_UP_URL,
                    )
                  }
                  style={{
                    padding:
                      '12px 24px',
                    borderRadius: '6px',
                    background:
                      'var(--text-main)',
                    color:
                      'var(--bg-color)',
                    border: 'none',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems:
                      'center',
                    gap: '8px',
                  }}
                >
                  Sign Up

                  <ArrowRight
                    size={16}
                  />
                </a>
              </div>

              {showComingSoon ? (
                <p
                  style={{
                    marginTop:
                      '16px',
                    fontSize: '14px',
                    color: '#FDE047',
                    fontWeight: 500,
                  }}
                >
                  The application is
                  currently being
                  prepared for hosting.
                  Please check back
                  soon.
                </p>
              ) : null}
            </div>
          </div>
        </section>
      </div>

      {/* ABOUT SECTION */}
      <section
        id="about"
        className="section-alt"
        style={{
          padding: '120px 0',
        }}
      >
        <div className="container about-grid">
          <div>
            <h2
              style={{
                fontFamily:
                  'var(--font-serif)',
                fontSize: '36px',
                marginBottom:
                  '24px',
                color:
                  'var(--text-dark)',
              }}
            >
              The cost of chaos.
            </h2>

            <p
              style={{
                fontSize: '16px',
                color:
                  'var(--text-muted-dark)',
                marginBottom:
                  '24px',
              }}
            >
              South African SMEs face
              an alarming failure
              rate. The issue is rarely
              market demand; it is
              operational. Business
              information is scattered
              across disconnected
              systems, spreadsheets,
              and paper records.
            </p>

            <p
              style={{
                fontSize: '16px',
                color:
                  'var(--text-muted-dark)',
              }}
            >
              VISION-OS is being built
              to explore how an
              integrated system can
              simplify the way
              business information,
              operational activities,
              and resources are
              organised.
            </p>
          </div>

          <div
            className="card-light"
            style={{
              padding: '40px',
            }}
          >
            <h3
              style={{
                fontSize: '18px',
                marginBottom:
                  '16px',
                color:
                  'var(--text-dark)',
              }}
            >
              Design Goals
            </h3>

            <ul
              style={{
                listStyle: 'none',
                display: 'flex',
                flexDirection:
                  'column',
                gap: '16px',
              }}
            >
              {[
                'Centralised information in one environment.',
                'Organised business operations and workflows.',
                'Improved visibility across activities.',
                'A foundation that evolves with requirements.',
              ].map((item) => (
                <li
                  key={item}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    alignItems:
                      'flex-start',
                    fontSize: '15px',
                    color:
                      'var(--text-muted-dark)',
                  }}
                >
                  <CheckCircle2
                    size={20}
                    style={{
                      color:
                        'var(--text-dark)',
                      flexShrink: 0,
                    }}
                  />

                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section
        id="benefits"
        className="section-light"
        style={{
          padding: '120px 0',
        }}
      >
        <div className="container">
          <div
            style={{
              marginBottom: '64px',
            }}
          >
            <h2
              style={{
                fontFamily:
                  'var(--font-serif)',
                fontSize: '36px',
                marginBottom:
                  '16px',
                color:
                  'var(--text-dark)',
              }}
            >
              Key Benefits
            </h2>

            <p
              style={{
                color:
                  'var(--text-muted-dark)',
              }}
            >
              Core modules being
              developed for the MVP.
            </p>
          </div>

          <div className="features-grid">
            {[
              {
                icon: ShieldCheck,
                title:
                  'Compliance Management',
                description:
                  'Track regulatory frameworks, deadlines, and evidence to prevent penalties.',
              },
              {
                icon:
                  LayoutDashboard,
                title:
                  'Operational Visibility',
                description:
                  'Real-time dashboards that show what is happening in the business right now.',
              },
              {
                icon: Database,
                title:
                  'Centralised Workspace',
                description:
                  'Bring client records, financial data, and tasks into one unified environment.',
              },
              {
                icon: FileText,
                title:
                  'Information & Documents',
                description:
                  'A structured approach to storing, managing, and accessing critical evidence.',
              },
              {
                icon: Activity,
                title:
                  'THE NERVE Assistant',
                description:
                  'A central intelligence hub that surfaces risks and highlights operational blockers.',
              },
            ].map((benefit) => (
              <div
                key={benefit.title}
                className="card-light"
                style={{
                  padding: '32px',
                }}
              >
                <benefit.icon
                  size={24}
                  style={{
                    color:
                      'var(--text-dark)',
                    marginBottom:
                      '20px',
                  }}
                />

                <h3
                  style={{
                    fontSize: '18px',
                    marginBottom:
                      '12px',
                    color:
                      'var(--text-dark)',
                  }}
                >
                  {benefit.title}
                </h3>

                <p
                  style={{
                    fontSize: '14px',
                    color:
                      'var(--text-muted-dark)',
                  }}
                >
                  {
                    benefit.description
                  }
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VISION SECTION */}
      <section
        id="vision"
        className="section-alt"
        style={{
          padding: '120px 0',
        }}
      >
        <div
          className="container"
          style={{
            maxWidth: '800px',
          }}
        >
          <h2
            style={{
              fontFamily:
                'var(--font-serif)',
              fontSize: '36px',
              marginBottom: '24px',
              color:
                'var(--text-dark)',
            }}
          >
            Built Around a Bigger
            Vision.
          </h2>

          <p
            style={{
              fontSize: '18px',
              color:
                'var(--text-muted-dark)',
              marginBottom: '48px',
              lineHeight: 1.8,
            }}
          >
            Vision OS reflects our
            commitment to exploring
            practical, connected
            digital solutions that
            make complex operations
            easier to understand and
            manage. Our vision is to
            create a structured
            digital environment where
            information, processes,
            and tools work together to
            support better
            organisation.
          </p>

          <div className="vision-grid">
            <div
              style={{
                padding: '24px',
                borderLeft:
                  '2px solid var(--text-dark)',
              }}
            >
              <h4
                style={{
                  fontSize: '16px',
                  marginBottom: '8px',
                  color:
                    'var(--text-dark)',
                }}
              >
                Simplicity
              </h4>

              <p
                style={{
                  fontSize: '14px',
                  color:
                    'var(--text-muted-dark)',
                }}
              >
                Prioritising necessary
                complexity over
                feature bloat.
              </p>
            </div>

            <div
              style={{
                padding: '24px',
                borderLeft:
                  '2px solid var(--text-dark)',
              }}
            >
              <h4
                style={{
                  fontSize: '16px',
                  marginBottom: '8px',
                  color:
                    'var(--text-dark)',
                }}
              >
                Connected
              </h4>

              <p
                style={{
                  fontSize: '14px',
                  color:
                    'var(--text-muted-dark)',
                }}
              >
                Replacing disconnected
                tools with a single
                source of truth.
              </p>
            </div>

            <div
              style={{
                padding: '24px',
                borderLeft:
                  '2px solid var(--text-dark)',
              }}
            >
              <h4
                style={{
                  fontSize: '16px',
                  marginBottom: '8px',
                  color:
                    'var(--text-dark)',
                }}
              >
                Growth
              </h4>

              <p
                style={{
                  fontSize: '14px',
                  color:
                    'var(--text-muted-dark)',
                }}
              >
                A modular foundation
                that scales with the
                business.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ACCESS SECTION */}
      <section
        id="access"
        style={{
          padding: '120px 0',
          background:
            'var(--bg-color)',
          color:
            'var(--text-main)',
          textAlign: 'center',
        }}
      >
        <div className="container">
          <h2
            style={{
              fontFamily:
                'var(--font-serif)',
              fontSize: '40px',
              marginBottom: '24px',
              color:
                'var(--text-main)',
            }}
          >
            Ready to Explore
            Vision-OS?
          </h2>

          <p
            style={{
              color:
                'var(--text-muted)',
              fontSize: '18px',
              maxWidth: '600px',
              margin:
                '0 auto 40px auto',
            }}
          >
            Discover the project and
            explore the direction of a
            more connected digital
            working environment.
          </p>

          <a
            href={
              CONFIG.APP_SIGN_UP_URL
            }
            onClick={(event) =>
              openApplication(
                event,
                CONFIG.APP_SIGN_UP_URL,
              )
            }
            style={{
              padding:
                '16px 32px',
              borderRadius: '6px',
              background:
                'var(--text-main)',
              color:
                'var(--bg-color)',
              border: 'none',
              fontWeight: 600,
              fontSize: '16px',
              display:
                'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            Sign Up for Updates
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          padding: '48px 0',
          background:
            'var(--bg-light-alt)',
          borderTop:
            '1px solid var(--border-dark)',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            justifyContent:
              'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '24px',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M10 50 C 30 20, 70 20, 90 50 C 70 80, 30 80, 10 50 Z"
                  stroke="var(--text-dark)"
                  strokeWidth="6"
                  strokeLinejoin="round"
                />

                <circle
                  cx="50"
                  cy="50"
                  r="15"
                  stroke="var(--text-dark)"
                  strokeWidth="6"
                />

                <circle
                  cx="50"
                  cy="50"
                  r="5"
                  fill="var(--text-dark)"
                />
              </svg>

              <span
                style={{
                  fontWeight: 600,
                  fontSize: '16px',
                  color:
                    'var(--text-dark)',
                }}
              >
                VISION-OS
              </span>
            </div>

            <p
              style={{
                fontSize: '14px',
                color:
                  'var(--text-muted-dark)',
              }}
            >
              Developed by Vision. IT
              Capstone Project.
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '24px',
              fontSize: '14px',
              color:
                'var(--text-muted-dark)',
            }}
          >
            <a
              href="#about"
              className="nav-link"
            >
              About
            </a>

            <a
              href="#benefits"
              className="nav-link"
            >
              Benefits
            </a>

            <a
              href="#vision"
              className="nav-link"
            >
              Vision
            </a>
          </div>

          <div
            style={{
              fontSize: '14px',
              color:
                'var(--text-muted-dark)',
            }}
          >
            © {new Date().getFullYear()}{' '}
            Vision. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}