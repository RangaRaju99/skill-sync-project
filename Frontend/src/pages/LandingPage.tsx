import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Zap, 
  ShieldCheck, 
  Users, 
  ArrowRight, 
  Layers, 
  Activity, 
  Compass, 
  CheckCircle2,
  Cpu,
  Globe,
  Monitor
} from 'lucide-react';
import ThemeToggleButton from '../components/ui/ThemeToggleButton';

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
    accentClass: 'from-violet-500/20 to-pink-500/20',
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
    accentClass: 'from-cyan-500/20 to-blue-500/20',
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
    accentClass: 'from-emerald-500/20 to-cyan-500/20',
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

const Logo = () => (
  <div className="flex items-center gap-2 group cursor-pointer">
    <div className="relative w-8 h-8">
      <div className="absolute inset-0 bg-primary/20 rounded-lg blur-sm group-hover:bg-primary/40 transition-colors" />
      <div className="relative w-full h-full bg-surface-container-low border border-white/10 rounded-lg flex items-center justify-center overflow-hidden">
        <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent rotate-45 animate-pulse" />
        <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-secondary/50 to-transparent -rotate-45 animate-pulse" />
        <Zap size={16} className="text-primary fill-primary/20" />
      </div>
    </div>
    <span className="text-xl font-display font-bold tracking-tight text-on-surface">SkillSync</span>
  </div>
);

const LandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-surface selection:bg-primary/30 selection:text-white overflow-x-hidden">
      {/* ── Navbar ── */}
      <nav className={`fixed top-0 inset-x-0 z-[100] transition-all duration-500 py-4 ${isScrolled ? 'pt-2' : 'pt-6'}`}>
        <div className="container mx-auto px-6 flex justify-center">
          <div className={`flex items-center justify-between w-full max-w-6xl px-6 py-3 transition-all duration-500 ${isScrolled ? 'nav-pill shadow-2xl' : 'bg-transparent'}`}>
            <Logo />
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#platform-story" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">Why SkillSync</a>
              <a href="#metrics" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">Metrics</a>
              <ThemeToggleButton className="opacity-0 w-0 h-0 pointer-events-none" showLabel={false} />
            </div>

            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-bold text-on-surface hover:text-primary transition-colors px-4 py-2">Sign In</Link>
              <Link to="/register" className="neon-btn text-xs px-6 py-2.5">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {/* ── Hero Section (Split Layout) ── */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative z-10"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <Activity size={14} className="text-primary animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Peer To Peer Learning Platform</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-display font-extrabold leading-[1.1] mb-8">
                Built For Real Sessions,
                <span className="block neon-text-gradient italic">Not Just Pretty Screens.</span>
              </h1>
              
              <p className="text-lg text-on-surface-muted max-w-xl mb-10 leading-relaxed">
                SkillSync maps the full mentorship lifecycle: learner request, payment verification, mentor response, 
                live session delivery, and post-session trust signals, all in a single reliable flow.
              </p>
              
              <div className="flex flex-wrap gap-6">
                <Link to="/dashboard" className="neon-btn px-8 py-4 group">
                  Get Started
                  <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a href="#platform-story" className="flex items-center gap-2 text-on-surface font-bold hover:text-primary transition-colors px-4 py-2 border border-white/10 rounded-full hover:bg-white/5">
                  <Monitor size={18} />
                  Why SkillSync
                </a>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.8, rotateY: -20 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative lg:h-[600px] flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-secondary/20 rounded-full blur-[100px] animate-pulse" />
              
              <div className="relative w-full max-w-lg">
                <div className="glass-card p-6 rounded-2xl relative z-10 border-white/20 overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
                    </div>
                    <div className="technical-label opacity-40 text-[8px]">DASHBOARD_PREVIEW_v4</div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="h-4 w-1/3 bg-white/10 rounded-full" />
                    <div className="grid grid-cols-3 gap-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-20 bg-white/5 rounded-xl border border-white/5 flex flex-col justify-center items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-primary/20" />
                          <div className="w-1/2 h-2 bg-white/10 rounded-full" />
                        </div>
                      ))}
                    </div>
                    <div className="h-32 bg-white/5 rounded-xl border border-white/5 relative overflow-hidden p-4">
                      <div className="w-full h-full border-b border-white/10 flex items-end gap-1">
                        {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                          <motion.div 
                            key={i} 
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            transition={{ delay: i * 0.1, duration: 1 }}
                            className="flex-1 bg-gradient-to-t from-primary/40 to-primary/10 rounded-t-sm" 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <motion.div 
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-10 -right-10 glass-card p-4 rounded-xl border-secondary/30 z-20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
                      <ShieldCheck size={16} />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-white uppercase">Payment Secure</div>
                      <div className="text-[8px] text-on-surface-muted">Transaction ID: #X290</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  animate={{ y: [0, 20, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -bottom-6 -left-10 glass-card p-4 rounded-xl border-accent/30 z-20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                      <Layers size={16} />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-white uppercase">Active Session</div>
                      <div className="text-[8px] text-on-surface-muted">React Deep Dive · 45m</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Metrics Grid ── */}
        <section id="metrics" className="py-20 relative overflow-hidden">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {metrics.map((metric, i) => (
                <motion.article 
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  className="glass-card p-8 rounded-2xl group hover:border-primary/50"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{metric.label}</span>
                    <Globe size={16} className="text-on-surface-muted group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="text-4xl font-black mb-2">{metric.value}</h3>
                  <p className="text-sm text-on-surface-muted leading-relaxed">{metric.helper}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Experience Lanes (Zig-Zag) ── */}
        <section id="platform-story" className="py-24 container mx-auto px-6 space-y-32">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <p className="text-secondary font-bold text-sm uppercase tracking-widest mb-4">Real Workflow, Real Context</p>
            <h2 className="text-4xl font-display font-bold">Every role sees the right state, at the right moment.</h2>
          </div>

          {experienceLanes.map((lane, i) => (
            <motion.article 
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`flex flex-col ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-16 items-center`}
            >
              <div className="flex-1 space-y-6">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${lane.accentClass} flex items-center justify-center border border-white/10 shadow-xl`}>
                  {i === 0 ? <Users size={24} /> : i === 1 ? <Layers size={24} /> : <Cpu size={24} />}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-primary mb-2 uppercase tracking-tighter">{lane.role}</h4>
                  <h3 className="text-3xl font-display font-bold mb-4">{lane.headline}</h3>
                  <p className="text-on-surface-muted text-lg leading-relaxed mb-8">{lane.summary}</p>
                  <ul className="space-y-3">
                    {lane.bullets.map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle2 size={18} className="text-primary mt-1 shrink-0" />
                        <span className="text-sm text-on-surface-variant font-medium">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 p-4 bg-white/5 border border-white/5 rounded-xl inline-block">
                    <span className="text-[10px] font-bold text-secondary block uppercase tracking-widest mb-1">{lane.pulse}</span>
                    <span className="text-sm font-bold text-white">{lane.metric}</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 w-full relative">
                <div className={`absolute inset-0 bg-gradient-to-br ${lane.accentClass} rounded-3xl blur-[60px] opacity-20`} />
                <div className="relative glass-card p-1 rounded-3xl overflow-hidden aspect-video group">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent z-10" />
                  <div className="w-full h-full bg-surface-container rounded-[calc(1.5rem-4px)] flex items-center justify-center overflow-hidden">
                    <div className="grid grid-cols-2 gap-4 p-8 w-full">
                       {[1, 2, 3, 4].map(k => (
                         <div key={k} className="h-24 bg-white/5 border border-white/5 rounded-2xl animate-pulse" />
                       ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </section>

        {/* ── Reliability Signals ── */}
        <section className="py-24 relative overflow-hidden bg-surface-container-low/30 border-y border-white/5">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <p className="text-accent font-bold text-sm uppercase tracking-widest mb-4">Operational Reliability</p>
              <h2 className="text-4xl font-display font-bold">Production-safe behavior is part of the UX, not an afterthought.</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {reliabilitySignals.map((signal, i) => (
                <motion.article 
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="glass-card p-8 rounded-2xl relative group"
                >
                  <div className="absolute top-4 right-4 text-[10px] font-mono text-accent/50 group-hover:text-accent transition-colors">SIG_REC_{i}</div>
                  <p className="text-sm font-bold text-on-surface-variant mb-6">{signal.label}</p>
                  <h3 className="text-2xl font-black mb-2 text-white">{signal.value}</h3>
                  <p className="text-xs text-on-surface-muted font-medium">{signal.helper}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="py-32 container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-12 md:p-20 rounded-[3rem] text-center relative overflow-hidden border-primary/20"
          >
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-secondary/20 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="relative z-10">
              <p className="text-primary font-bold text-sm uppercase tracking-widest mb-6">Ready To Scale Learning?</p>
              <h2 className="text-4xl md:text-6xl font-display font-bold mb-8 max-w-4xl mx-auto leading-tight">
                Give every learner a premium mentorship experience.
              </h2>
              <p className="text-on-surface-muted text-lg max-w-2xl mx-auto mb-12">
                SkillSync blends trust, velocity, and clarity into one polished platform where users discover mentors, 
                book confidently, and improve continuously with feedback that actually matters.
              </p>
              
              <div className="flex flex-wrap justify-center gap-6">
                <Link to="/dashboard" className="neon-btn px-10 py-5 text-base">
                  Enter Application
                  <ArrowRight size={20} className="ml-2" />
                </Link>
                <Link to="/register" className="glass-card px-10 py-5 rounded-full font-bold hover:bg-white/10 transition-colors">
                  Create Account
                </Link>
              </div>

              <div className="flex flex-wrap justify-center gap-3 mt-20">
                {finaleTags.map((tag, i) => (
                  <span key={i} className="px-4 py-2 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold text-on-surface-muted uppercase tracking-widest hover:border-primary/30 hover:text-primary transition-all">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="py-12 border-t border-white/5 text-center">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <Logo />
          <p className="text-on-surface-muted text-xs font-medium">© 2026 SkillSync Platform Architecture. Designed for Scalability.</p>
          <div className="flex gap-6">
             <Compass size={18} className="text-on-surface-muted hover:text-primary cursor-pointer transition-colors" />
             <Globe size={18} className="text-on-surface-muted hover:text-primary cursor-pointer transition-colors" />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
