import { motion } from 'framer-motion';
import { LifeBuoy, Shield, CreditCard, AlertTriangle, Mail, ArrowUpRight } from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';

const HelpCenterPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', damping: 25, stiffness: 300 } }
  };

  const categories = [
    {
      title: 'Identity Support',
      desc: 'Issues with login, profile synchronization, or security protocol settings.',
      icon: Shield,
      color: 'text-primary'
    },
    {
      title: 'Session Dynamics',
      desc: 'Booking calibration, link terminations, and mentoring interaction concerns.',
      icon: LifeBuoy,
      color: 'text-cyan-400'
    },
    {
      title: 'Credit & Billing',
      desc: 'Invoice generation, refund cycles, and transaction telemetry troubleshooting.',
      icon: CreditCard,
      color: 'text-violet-400'
    },
    {
      title: 'Anomaly Reporting',
      desc: 'Raise a system ticket by emailing support with diagnostic snapshots and role data.',
      icon: AlertTriangle,
      color: 'text-rose-400'
    }
  ];

  return (
    <PageLayout>
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-6xl mx-auto space-y-16">
        {/* Header */}
        <motion.section variants={itemVariants} className="relative py-12 text-center">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 blur-[120px] -z-10" />
          <h1 className="text-7xl font-display font-black text-white tracking-tighter leading-tight uppercase italic">
            Support <span className="text-primary">Nexus</span>.
          </h1>
          <p className="text-xl text-white/40 font-bold uppercase tracking-[0.4em] mt-8">
            Global Assistance Terminal
          </p>
          
          <div className="mt-12 inline-flex items-center gap-6 p-6 glass-card rounded-3xl border-primary/20 bg-primary/5">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Mail size={24} />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-primary uppercase tracking-widest">Priority Channel</p>
              <p className="text-lg font-black text-white tracking-tight">academyskillsync@gmail.com</p>
            </div>
          </div>
        </motion.section>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {categories.map((cat, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -8 }}
              className="glass-card rounded-[3rem] p-10 border-white/5 group relative overflow-hidden flex flex-col justify-between min-h-[300px]"
            >
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/5 blur-[60px] group-hover:bg-primary/5 transition-colors duration-700" />
              
              <div className="relative space-y-6">
                <div className={`w-16 h-16 rounded-[1.5rem] bg-white/5 border border-white/10 flex items-center justify-center ${cat.color}`}>
                  <cat.icon size={32} />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-display font-black text-white tracking-tighter uppercase italic">{cat.title}</h3>
                  <p className="text-sm text-white/40 font-bold leading-relaxed uppercase tracking-widest">{cat.desc}</p>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Protocol Active</span>
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-primary group-hover:bg-primary/10 transition-all">
                  <ArrowUpRight size={18} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer Notice */}
        <motion.div variants={itemVariants} className="text-center pt-12">
          <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.5em]">SkillSync Neural Support Infrastructure v4.0</p>
        </motion.div>
      </motion.div>
    </PageLayout>
  );
};

export default HelpCenterPage;
