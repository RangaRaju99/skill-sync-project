import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import logo from '../assets/skillsync-logo.png';
import ThemeToggleButton from '../components/ui/ThemeToggleButton';
import './LandingPage.css';

/* ─── Types (unchanged) ─── */
type ExperienceLane = {
  role: string;
  headline: string;
  summary: string;
  bullets: string[];
  metric: string;
  pulse: string;
  accentClass: string;
};
type PlatformMetric = { label: string; value: string; helper: string };
type ReliabilitySignal = { label: string; value: string; helper: string };

/* ─── Data (unchanged) ─── */
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
  { label: 'Mentor alert after payment success', value: 'Strictly enforced', helper: 'Prevents invalid request notifications' },
  { label: 'Failed payment rollback', value: 'Automatic', helper: 'Session state stays consistent across services' },
  { label: 'Rating and review propagation', value: 'Realtime', helper: 'Dashboard and profile credibility stay in sync' },
];

const finaleTags = [
  'Mentor Match Engine',
  'Realtime Session Flow',
  'Payment-First Reliability',
  'Trust-Driven Reviews',
  'Career Growth Pathways',
  'Community Learning Loops',
];

/* ─── 3D Tilt Card ─── */
const TiltCard = ({ children, className = '', style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, glow: false });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    const y = -(e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    setTilt({ x: x * 6, y: y * 6, glow: true });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0, glow: false });
  }, []);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        ...style,
        transformStyle: 'preserve-3d',
        transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: 'transform 0.35s cubic-bezier(0.23, 1, 0.32, 1)',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {tilt.glow && (
        <div
          className="tilt-glow-layer"
          style={{
            background: `radial-gradient(circle at ${50 + tilt.y * 8}% ${50 + tilt.x * 8}%, rgba(99,102,241,0.18) 0%, transparent 70%)`,
          }}
        />
      )}
      {children}
    </motion.div>
  );
};

/* ─── Scroll reveal wrapper ─── */
const RevealSection = ({ children, className = '', delay = 0, id = '' }: { children: React.ReactNode; className?: string; delay?: number; id?: string }) => (
  <motion.div
    id={id || undefined}
    className={className}
    initial={{ opacity: 0, y: 56 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.75, ease: [0.22, 0.61, 0.36, 1], delay }}
  >
    {children}
  </motion.div>
);

/* ─── Animated particle system ─── */
const Particles = () => {
  const particles = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1.5,
    duration: Math.random() * 14 + 8,
    delay: Math.random() * 6,
    opacity: Math.random() * 0.45 + 0.15,
  }));

  return (
    <div className="particle-field" aria-hidden="true">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="particle-dot"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, opacity: p.opacity }}
          animate={{ y: [-12, 12, -12], x: [-6, 6, -6], opacity: [p.opacity, p.opacity * 1.8, p.opacity] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
};

/* ─── Neural connection lines ─── */
const NeuralLines = () => (
  <div className="neural-lines" aria-hidden="true">
    <svg width="100%" height="100%" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice">
      {[
        { x1: 100, y1: 80, x2: 400, y2: 200, delay: 0 },
        { x1: 400, y1: 200, x2: 700, y2: 120, delay: 0.4 },
        { x1: 700, y1: 120, x2: 1000, y2: 280, delay: 0.8 },
        { x1: 200, y1: 350, x2: 550, y2: 420, delay: 1.2 },
        { x1: 550, y1: 420, x2: 900, y2: 380, delay: 1.6 },
        { x1: 900, y1: 380, x2: 1150, y2: 500, delay: 2.0 },
      ].map((line, i) => (
        <motion.line
          key={i}
          x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
          stroke="url(#lineGrad)"
          strokeWidth="1"
          strokeDasharray="6 10"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: [0, 0.4, 0.2, 0.4] }}
          transition={{ duration: 3.5, delay: line.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
      <defs>
        <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0" />
          <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  </div>
);

/* ─── Animated grid with energy scan ─── */
const LiveGrid = () => (
  <div className="live-grid-container" aria-hidden="true">
    <div className="live-grid" />
    <motion.div
      className="grid-scan-line"
      animate={{ top: ['0%', '100%', '0%'] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
    />
  </div>
);

/* ─── Main Component ─── */
const LandingPage = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const { scrollY } = useScroll();
  const heroParallax = useTransform(scrollY, [0, 600], [0, -80]);
  const auraOneX = useTransform(smoothX, [-0.5, 0.5], [-20, 20]);
  const auraOneY = useTransform(smoothY, [-0.5, 0.5], [-15, 15]);
  const auraTwoX = useTransform(smoothX, [-0.5, 0.5], [15, -15]);
  const auraTwoY = useTransform(smoothY, [-0.5, 0.5], [10, -10]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const { clientX, clientY, currentTarget } = e;
    const { width, height } = (currentTarget as HTMLElement).getBoundingClientRect();
    mouseX.set((clientX / width) - 0.5);
    mouseY.set((clientY / height) - 0.5);
  }, [mouseX, mouseY]);

  // Navbar scroll state
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const unsub = scrollY.on('change', (v) => setScrolled(v > 40));
    return unsub;
  }, [scrollY]);

  return (
    <div className="ppt-page" id="top" onMouseMove={handleMouseMove}>

      {/* ── Animated Background Layers ── */}
      <LiveGrid />
      <NeuralLines />
      <Particles />

      {/* ── Atmospheric Auras (mouse-reactive) ── */}
      <motion.div className="ppt-aura aura-one" style={{ x: auraOneX, y: auraOneY }} aria-hidden="true" />
      <motion.div className="ppt-aura aura-two" style={{ x: auraTwoX, y: auraTwoY }} aria-hidden="true" />
      <div className="ppt-aura aura-three" aria-hidden="true" />
      <div className="ppt-aura aura-four" aria-hidden="true" />

      {/* ── Navbar ── */}
      <motion.header
        className={`ppt-nav ${scrolled ? 'ppt-nav--scrolled' : ''}`}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
      >
        <a className="ppt-brand" href="#top" aria-label="SkillSync Presentation Home">
          <motion.img
            src={logo} alt="SkillSync logo" className="ppt-logo"
            whileHover={{ rotate: 8, scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          />
          <span>SkillSync</span>
        </a>
        <div className="ppt-nav-actions">
          <ThemeToggleButton className="ppt-theme-toggle" showLabel={false} />
          <Link className="ppt-btn ghost" to="/register">Register</Link>
          <Link className="ppt-btn solid" to="/login">Sign In</Link>
        </div>
      </motion.header>

      <main className="ppt-main">

        {/* ── Hero 1: Brand showcase ── */}
        <motion.section
          className="hero-card"
          style={{ y: heroParallax }}
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 0.61, 0.36, 1] }}
        >
          <div className="hero-aura hero-aura-one" aria-hidden="true" />
          <div className="hero-aura hero-aura-two" aria-hidden="true" />
          <div className="hero-aura hero-aura-three" aria-hidden="true" />

          {/* Floating holographic nodes */}
          <div className="hero-floating-nodes" aria-hidden="true">
            {[
              { top: '15%', left: '8%', size: 8, delay: 0 },
              { top: '70%', left: '6%', size: 5, delay: 1.2 },
              { top: '20%', right: '9%', size: 7, delay: 0.6 },
              { top: '65%', right: '7%', size: 6, delay: 1.8 },
              { top: '45%', left: '3%', size: 4, delay: 2.4 },
              { top: '40%', right: '4%', size: 4, delay: 0.9 },
            ].map((node, i) => (
              <motion.div
                key={i}
                className="hero-node"
                style={{ top: node.top, left: node.left, right: (node as any).right, width: node.size, height: node.size }}
                animate={{ y: [-10, 10, -10], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 4 + i, delay: node.delay, repeat: Infinity, ease: 'easeInOut' }}
              />
            ))}
          </div>

          <div className="brand-stage" aria-hidden="true">
            {/* Orbit rings */}
            <motion.div className="gravity-orb orb-a" animate={{ rotate: 360 }} transition={{ duration: 12, repeat: Infinity, ease: 'linear' }} />
            <motion.div className="gravity-orb orb-b" animate={{ rotate: -360 }} transition={{ duration: 9, repeat: Infinity, ease: 'linear' }} />
            <motion.div className="gravity-orb orb-c" animate={{ rotate: 360 }} transition={{ duration: 7, repeat: Infinity, ease: 'linear' }} />

            {/* Orbit dots */}
            <motion.div
              className="orbit-dot dot-primary"
              animate={{ rotate: 360 }}
              transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
              style={{ width: '66%', height: '66%', position: 'absolute', borderRadius: '50%' }}
            >
              <div className="orbit-dot-pip pip-primary" />
            </motion.div>
            <motion.div
              className="orbit-dot dot-cyan"
              animate={{ rotate: -360 }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
              style={{ width: '88%', height: '88%', position: 'absolute', borderRadius: '50%' }}
            >
              <div className="orbit-dot-pip pip-cyan" />
            </motion.div>

            <motion.img
              src={logo} alt="" className="hero-logo"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              whileHover={{ scale: 1.1, filter: 'drop-shadow(0 0 24px rgba(99,102,241,0.7))' }}
            />
          </div>

          <motion.h2
            className="hero-brand-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            SkillSync
          </motion.h2>

          <motion.p
            className="hero-tagline"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
          >
            Peer To Peer Learning Platform
          </motion.p>

          <motion.div
            className="hero-cta-row"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
          >
            <motion.div whileHover={{ scale: 1.04, y: -3 }} whileTap={{ scale: 0.96 }}>
              <Link className="landing-btn landing-btn-solid" to="/dashboard">Get Started</Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04, y: -3 }} whileTap={{ scale: 0.96 }}>
              <a className="landing-btn landing-btn-ghost" href="#platform-story">Why SkillSync</a>
            </motion.div>
          </motion.div>

          {/* Ambient bottom glow */}
          <div className="hero-bottom-glow" aria-hidden="true" />
        </motion.section>

        {/* ── Hero 2: Headline + Metrics ── */}
        <RevealSection className="ppt-hero ppt-section-glass">
          <div className="ppt-hero-copy">
            <motion.p
              className="ppt-kicker"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Peer To Peer Learning Platform
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              Built For Real Sessions,
              <span> Not Just Pretty Screens.</span>
            </motion.h1>

            <motion.p
              className="ppt-subtext"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              SkillSync maps the full mentorship lifecycle: learner request, payment verification, mentor response,
              live session delivery, and post-session trust signals, all in a single reliable flow.
            </motion.p>

            <div className="ppt-metrics">
              {metrics.map((metric, i) => (
                <motion.article
                  key={metric.label}
                  className="ppt-metric-card"
                  initial={{ opacity: 0, y: 28, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, delay: 0.3 + i * 0.12 }}
                  whileHover={{ y: -6, scale: 1.03 }}
                >
                  <p>{metric.label}</p>
                  <h3>{metric.value}</h3>
                  <small>{metric.helper}</small>
                </motion.article>
              ))}
            </div>
          </div>
        </RevealSection>

        {/* ── Experience Lanes ── */}
        <RevealSection className="ppt-section ppt-section-glass" id="platform-story" delay={0.05}>
          <div className="ppt-section-head">
            <p>Real Workflow, Real Context</p>
            <h2>Every role sees the right state, at the right moment.</h2>
          </div>

          <div className="ppt-lane-grid">
            {experienceLanes.map((lane, i) => (
              <motion.div
                key={lane.role}
                initial={{ opacity: 0, y: 36, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 + i * 0.15 }}
              >
                <TiltCard className={`ppt-lane-card ${lane.accentClass}`}>
                  <div className="lane-top">
                    <span className="lane-role">{lane.role}</span>
                    <span className="lane-metric">{lane.metric}</span>
                  </div>
                  <h3>{lane.headline}</h3>
                  <p>{lane.summary}</p>
                  <ul>
                    {lane.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                  <div className="lane-pulse">{lane.pulse}</div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </RevealSection>

        {/* ── Reliability Signals ── */}
        <RevealSection className="ppt-section ppt-section-glass" delay={0.05}>
          <div className="ppt-section-head">
            <p>Operational Reliability</p>
            <h2>Production-safe behavior is part of the UX, not an afterthought.</h2>
          </div>

          <div className="ppt-signal-grid">
            {reliabilitySignals.map((signal, i) => (
              <motion.article
                key={signal.label}
                className="ppt-signal-card"
                initial={{ opacity: 0, x: i % 2 === 0 ? -24 : 24, y: 20 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 + i * 0.15 }}
                whileHover={{ y: -6 }}
              >
                <p>{signal.label}</p>
                <h3>{signal.value}</h3>
                <small>{signal.helper}</small>
              </motion.article>
            ))}
          </div>
        </RevealSection>

        {/* ── Final CTA ── */}
        <RevealSection className="ppt-final-cta ppt-section-glass" delay={0.05}>
          <motion.p
            className="final-kicker"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Ready To Scale Learning?
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            Give every learner a premium mentorship experience.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            SkillSync blends trust, velocity, and clarity into one polished platform where users discover mentors,
            book confidently, and improve continuously with feedback that actually matters.
          </motion.p>

          <motion.div
            className="ppt-cta-row"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <motion.div whileHover={{ scale: 1.06, y: -4 }} whileTap={{ scale: 0.95 }}>
              <Link className="ppt-btn solid ppt-btn--glow" to="/dashboard">Enter Application</Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.06, y: -4 }} whileTap={{ scale: 0.95 }}>
              <Link className="ppt-btn ghost" to="/register">Create Account</Link>
            </motion.div>
          </motion.div>

          <div className="ppt-finale-ribbon" aria-label="Platform highlights">
            {finaleTags.map((tag, i) => (
              <motion.span
                key={tag}
                className="ribbon-chip"
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.35 + i * 0.08 }}
                whileHover={{ scale: 1.08, y: -4 }}
              >
                {tag}
              </motion.span>
            ))}
          </div>

          <div className="ppt-finale-orbit" aria-hidden="true">
            <motion.div className="orbit-ring ring-a" animate={{ rotate: 360 }} transition={{ duration: 12, repeat: Infinity, ease: 'linear' }} />
            <motion.div className="orbit-ring ring-b" animate={{ rotate: -360 }} transition={{ duration: 9, repeat: Infinity, ease: 'linear' }} />
            <motion.div className="orbit-ring ring-c" animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }} />
            <motion.div className="orbit-pulse pulse-a" animate={{ scale: [1, 1.5, 1], opacity: [0.8, 1, 0.8] }} transition={{ duration: 2.4, repeat: Infinity }} />
            <motion.div className="orbit-pulse pulse-b" animate={{ scale: [1, 1.5, 1], opacity: [0.8, 1, 0.8] }} transition={{ duration: 2.4, delay: 0.7, repeat: Infinity }} />
            <motion.div className="orbit-pulse pulse-c" animate={{ scale: [1, 1.5, 1], opacity: [0.8, 1, 0.8] }} transition={{ duration: 2.4, delay: 1.4, repeat: Infinity }} />
            <div className="orbit-core">
              <img src={logo} alt="" className="orbit-core-logo" />
              <span>SkillSync</span>
            </div>
          </div>

          {/* CTA glow ambience */}
          <div className="cta-ambient-glow" aria-hidden="true" />
        </RevealSection>

      </main>
    </div>
  );
};

export default LandingPage;
