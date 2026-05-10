import { motion } from 'framer-motion';
import { BarChart3, Wallet, TrendingUp, ShieldCheck, Activity } from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';

const PlatformFinancesPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', damping: 25, stiffness: 300 } }
  };

  const metrics = [
    { label: 'Gross Revenue', value: '$0.00', icon: BarChart3, color: 'text-primary' },
    { label: 'Mentor Payouts', value: '$0.00', icon: Wallet, color: 'text-cyan-400' },
    { label: 'Net Platform', value: '$0.00', icon: TrendingUp, color: 'text-violet-400' }
  ];

  return (
    <PageLayout>
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <motion.section variants={itemVariants} className="relative py-4">
          <div className="absolute -left-12 -top-12 w-64 h-64 bg-primary/10 blur-[100px] -z-10" />
          <h1 className="text-6xl font-display font-black text-white tracking-tighter leading-[0.9]">
            Finance <span className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">Telemetry</span>.
          </h1>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mt-8">
            <p className="text-lg text-white/40 font-bold uppercase tracking-[0.3em] flex items-center gap-4">
              <span className="w-12 h-[2px] bg-primary/30" />
              Operational Capital Flow
            </p>
            <div className="flex items-center gap-3 px-6 py-2.5 rounded-2xl bg-white/5 border border-white/10">
              <ShieldCheck size={16} className="text-primary" />
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Encrypted Ledger Active</span>
            </div>
          </div>
        </motion.section>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {metrics.map((metric, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -8 }}
              className="glass-card rounded-[3rem] p-10 border-white/5 group relative overflow-hidden"
            >
              <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/5 blur-[40px] group-hover:bg-primary/10 transition-colors" />
              
              <div className="flex items-center gap-4 mb-8">
                <div className={`w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center ${metric.color}`}>
                  <metric.icon size={24} />
                </div>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">{metric.label}</p>
              </div>

              <div className="space-y-1">
                <p className="text-5xl font-display font-black text-white tracking-tighter italic group-hover:text-primary transition-colors">
                  {metric.value}
                </p>
                <div className="flex items-center gap-2 text-[9px] font-black text-white/10 uppercase tracking-widest">
                  <Activity size={12} /> Live Sync Active
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-white/5">
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                   <div className="w-1/3 h-full bg-primary/20" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Placeholder Visualization */}
        <motion.div variants={itemVariants} className="glass-card rounded-[3rem] p-20 border-white/5 flex flex-col items-center justify-center text-center">
           <BarChart3 className="text-white/5 mb-8" size={64} />
           <h3 className="text-2xl font-display font-black text-white uppercase tracking-tighter mb-4 italic">No Data Streams</h3>
           <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">Telemetry visualization requires active transaction history.</p>
        </motion.div>
      </motion.div>
    </PageLayout>
  );
};

export default PlatformFinancesPage;
