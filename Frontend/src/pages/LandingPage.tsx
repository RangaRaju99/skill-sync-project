import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/skillsync-logo.png';
import ThemeToggleButton from '../components/ui/ThemeToggleButton';
import './LandingPage.css';

type ExperienceLane = {
  role: string;
  headline: string;
  summary: string;
  bullets: string[];
  metric: string;
  pulse: string;
  accentClass: string;
};

type PlatformMetric = {
  label: string;
  value: string;
  helper: string;
};

type ReliabilitySignal = {
  label: string;
  value: string;
  helper: string;
};

const experienceLanes: ExperienceLane[] = [
  {
    role: 'Learner Workspace',
    headline: 'Book confidently, cancel consciously.',
    summary: 'Learners can discover mentors quickly, but every cancellation is explicit and policy-aware.',
    bullets: [
      'Clear mentor profile cards with ratings and trust cues',
      'Payment-first booking to prevent ghost confirmations',
      'Cancellation confirmation with compensation disclaimer',
    ],
    metric: '3-step booking flow',
    pulse: 'High confidence onboarding',
    accentClass: 'lane-cyan',
  },
  {
    role: 'Mentor Console',
    headline: 'Only valid bookings reach the mentor.',
    summary: 'Mentors receive requests after payment success, reducing noise and protecting time.',
    bullets: [
      'No premature notifications from failed transactions',
      'Accept, reject, and complete actions from one queue',
      'Earnings, ratings, and session history stay synchronized',
    ],
    metric: 'Zero ghost bookings',
    pulse: 'Cleaner decision queue',
    accentClass: 'lane-orange',
  },
  {
    role: 'Platform Operations',
    headline: 'Runtime visibility without guesswork.',
    summary: 'Events, retries, and service-level monitoring are designed for production behavior.',
    bullets: [
      'Event contracts drive booking, payment, and notification flow',
      'Rollback paths preserve data consistency on payment failure',
      'Observability stack supports fast issue diagnosis',
    ],
    metric: 'Monitoring-first topology',
    pulse: 'Operational reliability',
    accentClass: 'lane-blue',
  },
];

const metrics: PlatformMetric[] = [
  { label: 'Services', value: '9', helper: 'Microservices under one platform graph' },
  { label: 'Critical Journeys', value: '25+', helper: 'Auth, booking, payment, review, notifications' },
  { label: 'Runtime Goal', value: '99.9%', helper: 'Monitoring and fail-safe flow design' },
];

const reliabilitySignals: ReliabilitySignal[] = [
  {
    label: 'Mentor alert after payment success',
    value: 'Strictly enforced',
    helper: 'Prevents invalid request notifications',
  },
  {
    label: 'Failed payment rollback',
    value: 'Automatic',
    helper: 'Session state stays consistent across services',
  },
  {
    label: 'Rating and review propagation',
    value: 'Realtime',
    helper: 'Dashboard and profile credibility stay in sync',
  },
];

const finaleTags = [
  'Mentor Match Engine',
  'Realtime Session Flow',
  'Payment-First Reliability',
  'Trust-Driven Reviews',
  'Career Growth Pathways',
  'Community Learning Loops',
];

/** Intersection Observer hook — adds `.revealed` when element scrolls into view */
const useRevealOnScroll = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );

    // Observe the container and all stagger-children inside it
    observer.observe(el);
    el.querySelectorAll('.stagger-child').forEach((child) => observer.observe(child));

    return () => observer.disconnect();
  }, []);

  return ref;
};

const LandingPage = () => {
  const heroTextRef = useRevealOnScroll();
  const lanesRef = useRevealOnScroll();
  const signalsRef = useRevealOnScroll();
  const finaleRef = useRevealOnScroll();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const btn = target.closest('.btn-premium');
      if (btn instanceof HTMLElement) {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        btn.style.setProperty('--x', `${x}px`);
        btn.style.setProperty('--y', `${y}px`);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="ppt-page" id="top">
      {/* Cinematic Background Elements */}
      <div className="premium-bg-container" aria-hidden="true">
        <div className="mesh-gradient" />
        <div className="ambient-orb orb-1" />
        <div className="ambient-orb orb-2" />
        <div className="ambient-orb orb-3" />
        <div className="noise-overlay" />
      </div>

      <header className="ppt-nav">
        <div className="nav-blur-layer" />
        <a className="ppt-brand" href="#top" aria-label="SkillSync Presentation Home">
          <div className="brand-logo-wrapper">
            <img src={logo} alt="SkillSync logo" className="ppt-logo" />
            <div className="logo-glow" />
          </div>
          <span className="brand-text">SkillSync</span>
        </a>

        <div className="ppt-nav-actions">
          <ThemeToggleButton className="ppt-theme-toggle" showLabel={false} />
          <Link className="ppt-btn-new ghost" to="/register">
            Register
          </Link>
          <Link className="ppt-btn-new primary" to="/login">
            Sign In
          </Link>
        </div>
      </header>

      <main className="ppt-main">
        {/* ── Hero Section: Combined & Reimagined ── */}
        <section className="hero-master reveal-section" ref={heroTextRef}>
          <div className="hero-content-wrapper">
            <div className="hero-visual-side" aria-hidden="true">
              <div className="floating-glass-card card-1">
                <div className="card-inner">
                  <div className="shimmer" />
                </div>
              </div>
              <div className="floating-glass-card card-2">
                <div className="card-inner" />
              </div>
              <div className="hero-central-logo">
                <img src={logo} alt="" className="hero-logo-main" />
                <div className="logo-pulse-ring" />
              </div>
            </div>

            <div className="hero-text-side">
              <div className="badge-kicker stagger-child">
                <span className="kicker-dot" />
                Peer To Peer Learning Platform
              </div>
              <h1 className="main-headline stagger-child">
                Built For Real Sessions,
                <span className="gradient-text"> Not Just Pretty Screens.</span>
              </h1>
              <p className="hero-description stagger-child">
                SkillSync maps the full mentorship lifecycle: learner request, payment verification, mentor response,
                live session delivery, and post-session trust signals, all in a single reliable flow.
              </p>
              
              <div className="hero-action-group stagger-child">
                <Link className="btn-premium primary" to="/dashboard">
                  <span>Get Started</span>
                  <div className="btn-glow" />
                </Link>
                <a className="btn-premium secondary" href="#platform-story">
                  <span>Why SkillSync</span>
                </a>
              </div>

              <div className="hero-metrics-grid">
                {metrics.map((metric, i) => (
                  <article key={metric.label} className="metric-item stagger-child" style={{ transitionDelay: `${i * 120}ms` }}>
                    <div className="metric-val">{metric.value}</div>
                    <div className="metric-label">{metric.label}</div>
                    <div className="metric-helper">{metric.helper}</div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Experience Lanes ── */}
        <section className="section-container reveal-section" id="platform-story" ref={lanesRef}>
          <div className="section-header">
            <span className="section-label">Real Workflow, Real Context</span>
            <h2 className="section-title">Every role sees the right state, at the right moment.</h2>
          </div>

          <div className="lane-stack">
            {experienceLanes.map((lane, i) => (
              <article key={lane.role} className={`premium-lane-card ${lane.accentClass} stagger-child`} style={{ transitionDelay: `${i * 150}ms` }}>
                <div className="card-glass-effect" />
                <div className="lane-content">
                  <div className="lane-header">
                    <div className="role-tag">{lane.role}</div>
                    <div className="metric-tag">{lane.metric}</div>
                  </div>
                  <h3 className="lane-headline">{lane.headline}</h3>
                  <p className="lane-summary">{lane.summary}</p>
                  <ul className="lane-list">
                    {lane.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                  <div className="lane-footer">
                    <div className="pulse-indicator">
                      <span className="pulse-dot" />
                      {lane.pulse}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── Reliability Signals ── */}
        <section className="section-container reveal-section" ref={signalsRef}>
          <div className="section-header centered">
            <span className="section-label">Operational Reliability</span>
            <h2 className="section-title">Production-safe behavior is part of the UX.</h2>
          </div>

          <div className="signals-grid">
            {reliabilitySignals.map((signal, i) => (
              <article key={signal.label} className="signal-glass-card stagger-child" style={{ transitionDelay: `${i * 150}ms` }}>
                <div className="signal-content">
                  <div className="signal-val-wrapper">
                    <span className="signal-val">{signal.value}</span>
                  </div>
                  <p className="signal-label">{signal.label}</p>
                  <small className="signal-helper">{signal.helper}</small>
                </div>
                <div className="signal-glow" />
              </article>
            ))}
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="finale-section reveal-section" ref={finaleRef}>
          <div className="finale-glass-wrap">
            <div className="finale-content">
              <span className="final-kicker">Ready To Scale Learning?</span>
              <h2 className="final-title">Give every learner a premium mentorship experience.</h2>
              <p className="final-desc">
                SkillSync blends trust, velocity, and clarity into one polished platform where users discover mentors,
                book confidently, and improve continuously.
              </p>
              
              <div className="final-actions">
                <Link className="btn-premium primary large" to="/dashboard">
                  <span>Enter Application</span>
                  <div className="btn-glow" />
                </Link>
                <Link className="btn-premium secondary large" to="/register">
                  <span>Create Account</span>
                </Link>
              </div>

              <div className="tag-cloud">
                {finaleTags.map((tag, i) => (
                  <span key={tag} className="cloud-tag stagger-child" style={{ transitionDelay: `${i * 80}ms` }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="finale-visual" aria-hidden="true">
              <div className="orbit-system">
                <div className="orbit-path path-1" />
                <div className="orbit-path path-2" />
                <div className="orbit-path path-3" />
                <div className="center-node">
                  <img src={logo} alt="" className="node-logo" />
                  <div className="node-glow" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
